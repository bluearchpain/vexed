import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Image, Platform, View, Text } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import DataGraph from "@/components/dataGraph";

import { useFont } from "@shopify/react-native-skia";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import React from "react";

const supabaseUrl = "https://tcqqxpqljcgomltovqeo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcXF4cHFsamNnb21sdG92cWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MTMxODUsImV4cCI6MjA0NjQ4OTE4NX0.ibQcNfH7vPF-a92_WGoz_f4X9r81xwbRH3MYXW7OHKs";
const supabase = createClient(supabaseUrl, supabaseKey);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export const CO = 20;
export default function TabTwoScreen() {
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

  const [data, setData] = useState([
    {
      temperature: 0,
      CO: 0,
      CO2: 0,
      tVOCs: 0,
      humidity: 0,
    },
  ]);

  useEffect(() => {
    // schedulePushNotification();
    const fetchData = async () => {
      let { data, error } = await supabase
        .from("data")
        .select()
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) console.log(error);
      // @ts-expect-error
      else setData(data?.reverse());
      console.log(data);
      // schedulePushNotification("Fuck you Mazen Fawzy");
    };

    fetchData();
  }, []);

  useEffect(() => {
    const STR3 = supabase
      .channel("STR3")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "data" },
        () => {
          const fetchData = async () => {
            let { data, error } = await supabase
              .from("data")
              .select()
              .order("created_at", { ascending: false })
              .limit(10);

            if (error) console.log(error);
            // @ts-expect-error
            else setData(data?.reverse());
            console.log(data);
            let errors = [];
            // @ts-expect-error
            if (data[data.length - 1].CO2 >= 1200) {
              errors.push("high co2 concentration detected");
            }
            // @ts-expect-error
            if (data[data.length - 1].CO >= 15) {
              errors.push("high co concentration detected");
            }
            // @ts-expect-error
            if (data[data.length - 1].tVOCs >= 400) {
              errors.push("high tVOCs concentration detected");
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

  const font = useFont(require("../../assets/fonts/Roboto-Regular.ttf"), 16);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("../../assets/images/2150858399.jpg")}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Sensor Data</ThemedText>
      </ThemedView>

      {/* start graphs */}
      <DataGraph label="temperature" color="red" unit="°C" data={data} />
      <DataGraph label="humidity" color="blue" unit="%" data={data} />
      <DataGraph label="CO2" color="green" unit="ppm" data={data} />
      <DataGraph label="CO" color="purple" unit="ppm" data={data} />
      <DataGraph label="tVOCs" color="cyan" unit="ppb" data={data} />
      {/* end graphs */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
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
