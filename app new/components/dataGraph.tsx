import { useFont } from "@shopify/react-native-skia";
import { Text, View } from "react-native";
import { CartesianChart, Line } from "victory-native";

export default function DataGraph({
  label,
  color,
  unit,
  data,
}: {
  label: string;
  color: string;
  unit: string;
  data: any;
}) {
  const font = useFont(require("../assets/fonts/Roboto-Regular.ttf"), 16);
  return (
    <View
      style={{
        width: "100%",
        height: 320,
        backgroundColor: "white",
        borderRadius: 7,
      }}>
      <View>
        <Text
          style={{
            color: "black",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 7,
            marginTop: 5,
            textTransform: "capitalize",
          }}>
          {label}
        </Text>
      </View>
      <View>
        <Text
          style={{
            color: color,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}>
          {data[data.length - 1][label]}
          {unit}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Text style={{ marginRight: 5 }}>{`${label} (${unit})`}</Text>
        <View
          style={{
            width: 50,
            height: 3,
            borderColor: color,
            borderWidth: 1,
            backgroundColor: color,
          }}></View>
      </View>
      <CartesianChart
        data={data}
        xAxis={{ lineWidth: 0 }}
        yAxis={[{ font, labelColor: "black" }]}
        //@ts-expect-error
        xKey="created_at"
        // @ts-expect-error
        yKeys={[label]}
        padding={10}
        domainPadding={5}>
        {({ points }) => (
          //👇 pass a PointsArray to the Line component, as well as options.
          <Line
            //@ts-expect-error
            points={points[label]}
            color={color}
            strokeWidth={1.5}
            animate={{ type: "timing", duration: 300 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}
