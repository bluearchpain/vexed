import { Image, StyleSheet, Platform, Text, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { useEffect, useState } from "react";

import { createClient } from "@supabase/supabase-js";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const supabaseUrl = "https://tcqqxpqljcgomltovqeo.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcXF4cHFsamNnb21sdG92cWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MTMxODUsImV4cCI6MjA0NjQ4OTE4NX0.ibQcNfH7vPF-a92_WGoz_f4X9r81xwbRH3MYXW7OHKs";
  const supabase = createClient(supabaseUrl, supabaseKey);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("D:\\app21323\\vexed\\assets\\images\\2151196376.jpg")}
          style={styles.reactLogo}
        />
      }
    >
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
});
