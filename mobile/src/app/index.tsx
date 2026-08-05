import { Text, StyleSheet, View } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {THEME} from "@/app/constants";
import {SettingsProvider} from "@/context/settings";
/*
import TcpSocket from 'react-native-tcp-socket';

const options = {
  port: 4296,
  host: '192.168.1.233',
  reuseAddress: true,
};
const client = TcpSocket.createConnection(options, () => {



});*/



export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.info}>
        <View style={isConnected ? styles.badgeOn : styles.badgeOff}></View>
        <Text style={styles.text}>Not connected to the server</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: THEME.primary,

  },
  text: {
    fontFamily: "Abordage",
  },
  info: {
    borderRadius: 12,
    backgroundColor: THEME.blue,
    padding: 20,
    width: '85%',
    flexDirection: "row",
    alignItems: "center"
  },
  badgeOff: {
    backgroundColor: THEME.red,
    borderRadius: 50,
    width: 10,
    height: 10,
    marginRight: 5
  },
  badgeOn: {
    backgroundColor: THEME.green,
    borderRadius: 50,
    width: 10,
    height: 10,
    marginRight: 5
  }
});
