#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <MQUnifiedsensor.h>
#include "SparkFunCCS811.h" //Click here to get the library: http://librarymanager/All#SparkFun_CCS811
#include <ESPSupabase.h>
#include <WiFi.h>

#define CCS811_ADDR 0x5A // Default I2C Address
// #define CCS811_ADDR 0x5A //Alternate I2C Address

CCS811 mySensor(CCS811_ADDR);

// pins config
#define buuzzer_pin 23
#define ESP_LED 2

// DHT
#define DHTPIN 32                 // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11             // DHT 11
DHT_Unified dht(DHTPIN, DHTTYPE); // Initialize DHT sensor
sensors_event_t event;            // used by the DHT

// MQ
#define Board ("ESP-32")         // Wemos ESP-32 or other board, whatever have ESP32 core.
#define Pin (33)                 // IO25 for your ESP32 WeMos Board, pinout here: https://i.pinimg.com/originals/66/9a/61/669a618d9435c702f4b67e12c40a11b8.jpg
#define Type ("MQ-7")            // MQ3 or other MQ Sensor, if change this verify your a and b values.
#define Voltage_Resolution (3.3) // 3V3 <- IMPORTANT. Source: https://randomnerdtutorials.com/esp32-adc-analog-read-arduino-ide/
#define ADC_Bit_Resolution (12)  // ESP-32 bit resolution. Source: https://randomnerdtutorials.com/esp32-adc-analog-read-arduino-ide/
#define RatioMQ7CleanAir 27.5    // RS / R0 = 3.6 ppm
MQUnifiedsensor MQ7(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin, Type);

// wifi credentials
char *WIFI_SSID = "1";
char *WIFI_PASSWORD = "123456789";

// supabase
Supabase db;
// Put your supabase URL and Anon key here...
String supabase_url = "https://tcqqxpqljcgomltovqeo.supabase.co";
String anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcXF4cHFsamNnb21sdG92cWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MTMxODUsImV4cCI6MjA0NjQ4OTE4NX0.ibQcNfH7vPF-a92_WGoz_f4X9r81xwbRH3MYXW7OHKs";
String table = "data";
String JSON = "";
bool upsert = false;

// Global variables
float temperature = 0.0,
      humidity = 0.0,
      CO = 0.0,
      CO2 = 0.0,
      tVOC = 0.0;

unsigned long prevMillis = 0;

void setup()
{

  Serial.begin(9600);
  Wire.begin(); // Inialize I2C Hardware

  pinMode(buuzzer_pin, OUTPUT);

  if (mySensor.begin() == false)
  {
    Serial.print("CCS811 error. Please check wiring. Freezing...");
    while (1)
      ;
  }
  delay(1000);
  // Set math model to calculate the PPM concentration and the value of constants
  MQ7.setRegressionMethod(1); //_PPM =  a*ratio^b
  MQ7.setA(99.042);
  MQ7.setB(-1.518);
  MQ7.init();
  Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for (int i = 1; i <= 10; i++)
  {
    MQ7.update(); // Update data, the arduino will read the voltage from the analog pin
    calcR0 += MQ7.calibrate(RatioMQ7CleanAir);
    Serial.print(".");
  }
  MQ7.setR0(calcR0 / 10);
  Serial.println("  done!.");

  if (isinf(calcR0))
  {
    Serial.println("Warning: Conection issue, R0 is infinite (Open circuit detected) please check your wiring and supply");
    while (1)
      ;
  }
  if (calcR0 == 0)
  {
    Serial.println("Warning: Conection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply");
    while (1)
      ;
  }
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  pinMode(ESP_LED, OUTPUT);
  Serial.println("Setup done");

  db.begin(supabase_url, anon_key);

  digitalWrite(ESP_LED, HIGH);
}

/**
 * Prints out the temperature and humidity values from the DHT sensor.
 *
 * The sensor is checked for data availability and if so, the
 * algorithm results are read and printed.
 */
void ReadDHT(float &t, float &h)
{
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature))
  {
    Serial.println(F("Error reading temperature!"));
  }
  else
  {
    Serial.print(F("Temperature: "));
    Serial.print(event.temperature);
    t = event.temperature;
    Serial.println(F("C"));
  }
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity))
  {
    Serial.println(F("Error reading humidity!"));
  }
  else
  {
    Serial.print(F("Humidity: "));
    Serial.print(event.relative_humidity);
    h = event.relative_humidity;
    Serial.println(F("%"));
  }
}

// Prints out the CO concentration from the MQ7 sensor.
//
// The sensor is updated and the equation coefficients are set.
// The CO concentration is then read and printed.
void ReadMQ7(float &out)
{
  MQ7.update(); // Update data, the arduino will read the voltage from the analog pin

  MQ7.setA(99.042);
  MQ7.setB(-1.518);            // Configure the equation to calculate CO concentration value
  float CO = MQ7.readSensor(); // Sensor will read PPM concentration using the model, a and b values set previously or from the setup
  out = CO;
  Serial.print("CO: ");
  Serial.print(CO);
  Serial.println(" ppm");
}

// Prints out the CO2 and TVOC values from the CCS811 sensor.
//
// The sensor is checked for data availability and if so, the
// algorithm results are read and printed.
void ReadCCS(float &CO2, float &tVOC)
{
  // Check to see if data is ready with .dataAvailable()
  if (mySensor.dataAvailable())
  {
    // If so, have the sensor read and calculate the results.
    // Get them later
    mySensor.readAlgorithmResults();

    Serial.print("CO2[");
    // Returns calculated CO2 reading
    Serial.print(mySensor.getCO2());
    Serial.print("] tVOC[");
    // Returns calculated TVOC reading
    Serial.print(mySensor.getTVOC());

    Serial.print("]");
    Serial.println();
    CO2 = mySensor.getCO2();
    tVOC = mySensor.getTVOC();
  }
}

void loop()
{
  // buzzer alarm for exceding limits of CO2, tVOC or CO
  if (CO2 >= 1200 || tVOC >= 400 || CO >= 15)
  {
    digitalWrite(buuzzer_pin, HIGH);
  }
  else
  {
    digitalWrite(buuzzer_pin, LOW);
  }
  if (millis() - prevMillis > 5000)
  {
    prevMillis = millis();
    ReadDHT(temperature, humidity);
    ReadCCS(CO2, tVOC);
    ReadMQ7(CO);

    // uploading data to the supabase
    JSON = "{\"temperature\":";
    JSON += temperature;
    JSON += ",\"humidity\":";
    JSON += humidity;
    JSON += ",\"CO\":";
    JSON += CO;
    JSON += ",\"CO2\":";
    JSON += CO2;
    JSON += ",\"tVOCs\":";
    JSON += tVOC;
    JSON += "}";
    int code = db.insert(table, JSON, upsert);
    Serial.println(code);
    db.urlQuery_reset();
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
      Serial.print(".");
      delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();
  }
}
