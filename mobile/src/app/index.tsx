import { Text, StyleSheet, View } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text}>Not connected to the server</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor:  "#F4E8DB",

  },
  text: {
    fontFamily: "Abordage",
  },
  info: {
    borderRadius: 10,
    backgroundColor: "#F58D33",
    padding: 20,
    width: '85%'
  }
});
