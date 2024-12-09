import { Image, StyleSheet, Platform, Text, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@supabase/supabase-js";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import React from "react";

const supabaseUrl = "https://tcqqxpqljcgomltovqeo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcXF4cHFsamNnb21sdG92cWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MTMxODUsImV4cCI6MjA0NjQ4OTE4NX0.ibQcNfH7vPF-a92_WGoz_f4X9r81xwbRH3MYXW7OHKs";
const supabase = createClient(supabaseUrl, supabaseKey);
export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const [data, setData] = useState({
    temperature: 0,
    CO: 0,
    CO2: 0,
    tVOCs: 0,
    humidity: 0,
  });

  useEffect(() => {
    // schedulePushNotification();
    const fetchData = async () => {
      let { data, error } = await supabase
        .from("data")
        .select()
        .order("created_at", { ascending: false })
        .limit(1);

      let errors = [];

      if (error) console.log(error);
      // @ts-expect-error
      else setData(data[0]);
      // @ts-expect-error
      if (data.CO2 >= 1000) {
        errors.push(
          "High CO2, you may suffer from : \n- dizziness \n- headache\n- nausea \n- increased heart rate\n- loss of attention "
        );
      }
      // @ts-expect-error
      if (data.CO >= 15) {
        errors.push(
          "High CO, you may suffer from : \n- loss of muscle control \n- sleepiness\n- confusion \n- redness of skin\n- chest tightness "
        );
      }
      if (errors.length >= 1) {
        schedulePushNotification(errors.join(", "));
      }
      console.log(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const STR3 = supabase
      .channel("STR33")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "data" },
        () => {
          const fetchData = async () => {
            let { data, error } = await supabase
              .from("data")
              .select()
              .order("created_at", { ascending: false })
              .limit(1);

            if (error) console.log(error);
            // @ts-expect-error
            else setData(data[0]);
            console.log(data);
            let errors = [];
            // @ts-expect-error
            if (data.CO2 >= 1000) {
              errors.push(
                "High CO2, you may suffer from : \n- dizziness \n- headache\n- nausea \n- increased heart rate\n- loss of attention "
              );
            }
            // @ts-expect-error
            if (data.CO >= 15) {
              errors.push(
                "High CO, you may suffer from : \n- loss of muscle control \n- sleepiness\n- confusion \n- redness of skin\n- chest tightness "
              );
            }
            // @ts-expect-error
            if (data.tVOCs >= 400) {
              errors.push(
                "tVOCs are very high, you may suffer after some period of time from : \n- nausea \n- emesis\n- epistaxis \n- fatigue\n- dizziness\n- dyspnea\n- eye, nose, throat irritation  "
              );
            }
            if (errors.length >= 1) {
              schedulePushNotification(errors.join(", "));
            }
          };

          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(STR3);
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("D:\\app21323\\vexed\\assets\\images\\2151196376.jpg")}
          style={styles.reactLogo}
        />
      }>
      <></>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome! {"\n"}
          <Text style={{ fontSize: 33, fontFamily: "Roboto" }}>User</Text>
        </ThemedText>
        <HelloWave />
      </ThemedView>
      <View>
        <Text style={styles.bodytexxxt}>
          welcome to your smart CO2 and VOC's monitoring system.
        </Text>
      </View>
      <View style={styles.mywolf}>
        <Text style={styles.mywolftext}>
          {data.CO > 15
            ? "High CO, you may suffer from : \n- loss of muscle control \n- sleepiness\n- confusion \n- redness of skin\n- chest tightness "
            : "Normal CO"}
        </Text>

        <Text style={styles.mywolftext}>
          {data.CO2 > 1000
            ? "High CO2, you may suffer from : \n- dizziness \n- headache\n- nausea \n- increased heart rate\n- loss of attention "
            : "Normal CO2"}
        </Text>
        <Text style={[styles.mywolftext, { borderBottomWidth: 0 }]}>
          {data.tVOCs > 400
            ? "tVOCs are very high, you may suffer after some period of time from : \n- nausea \n- emesis\n- epistaxis \n- fatigue\n- dizziness\n- dyspnea\n- eye, nose, throat irritation"
            : "Normal tVOCs"}
        </Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  bodytexxxt: {
    fontSize: 22,
    color: "white",
    // fontFamily:"SamsungSans"
  },
  mywolf: {
    backgroundColor: "#205550",
    paddingHorizontal: 20,
    paddingVertical: 0,
    borderRadius: 25,
  },
  mywolftext: {
    color: "white",
    fontSize: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "white",
    paddingVertical: 10,
    lineHeight: 25,
  },
});
async function schedulePushNotification(body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "alert⚠️",
      body: body,
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: null,
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (true) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
