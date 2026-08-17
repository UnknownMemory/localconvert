import {useContext, useState} from "react";
import {Text, StyleSheet, Pressable} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {DocumentPickerAsset, getDocumentAsync} from "expo-document-picker";

import TcpSocket from 'react-native-tcp-socket';
import {Feather} from "@react-native-vector-icons/feather";

import {THEME} from "@/app/constants";
import {SettingsContext} from "@/context/settings";
import Card from "@/components/card";
import {useTCP} from "@/hooks/useTCP";


export default function App() {
  const [file, setFile] = useState<DocumentPickerAsset | undefined>(undefined);
  const settings = useContext(SettingsContext)

  const {sendFile, status} = useTCP(Number(settings?.port), settings?.host)

  const addFile = async () => {
    const maxPayloadSize = 3n << 30n

    const res = await getDocumentAsync({multiple: false, type: "video/*"})
    if(!res.canceled){
      const asset = res.assets[0]
      const fileSize = BigInt(asset.size || 0)

      if(fileSize < maxPayloadSize){
        setFile(asset)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {file ? <Card filename={file.name} currStatus={status}/>: ""}

      <Pressable style={styles.btn} onPress={addFile}>
        <Feather name="plus" size={20}></Feather>
      </Pressable>
      {file ?       <Pressable style={styles.btn} onPress={() => sendFile(file)}>
        <Text>Convert</Text>
      </Pressable>: ""}
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
  list: {
    flex: 1,
    width: "85%",
  },
  info: {
    borderRadius: 12,
    backgroundColor: THEME.blue,
    padding: 20,
    width: '100%',
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
  },
  btn: {
    fontFamily: "Abordage",
    borderRadius: 12,
    backgroundColor: THEME.blue,
    color: "#000",
    padding: 16,
    marginBottom: 35,
  },
});
