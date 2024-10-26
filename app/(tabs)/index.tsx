import { Image, StyleSheet, Platform,Text,View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('D:\\app21323\\vexed\\assets\\images\\2151196376.jpg')}
          style={styles.reactLogo}
        />
      }>
        <></>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! {"\n"}<Text style={{fontSize:33, fontFamily:"Roboto"}}>User</Text></ThemedText>
        <HelloWave />
      </ThemedView>
    <View>
      <Text style={styles.bodytexxxt}>welcome to your smart CO2 and VOC's monitoring system.</Text>
    </View>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    position: 'absolute',
  },
  bodytexxxt:{
    fontSize:22,
    color:"white",
    // fontFamily:"SamsungSans"
  }
});
