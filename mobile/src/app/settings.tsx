import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {THEME} from "@/app/constants";
import {SafeAreaView} from "react-native-safe-area-context";
import {SettingsContext} from "@/context/settings";
import {useContext, useState} from "react";
import {Directory} from "expo-file-system";
import {Stack, useNavigation} from "expo-router";


export default function Settings() {
    const settings = useContext(SettingsContext)

    const [hostInput, setHostInput] = useState<string | undefined>(settings?.host)
    const [portInput, setPortInput] = useState<string | undefined>(settings?.port)
    const [outputInput, setOuputInput] = useState<string | undefined>(settings?.outputFolder)

    const selectFolder = async () => {
        const dir = await Directory.pickDirectoryAsync()
        const list = dir.list()
        const folderExist = list.find((item) => item instanceof Directory && item.name == "localconvert")

        if (!folderExist) {
            const outputDir = dir.createDirectory("localconvert")
            setOuputInput(outputDir.uri)
        }
    }

    const isActive = hostInput != settings?.host || portInput != settings?.port || outputInput != settings?.outputFolder;

    return (
        <>
        <Stack.Screen options={{ title: "settings" }} />
        <SafeAreaView style={styles.container}>
            <TextInput style={styles.input} onChangeText={setHostInput} value={hostInput}></TextInput>
            <TextInput style={styles.input} onChangeText={setPortInput} value={portInput} keyboardType="numeric"></TextInput>
            <Pressable style={styles.input} onPress={selectFolder}><Text>{outputInput}</Text></Pressable>

            <Pressable style={[styles.saveBtn, !isActive && styles.saveBtnInactive]}
                       disabled={!isActive}
                       onPress={() => settings?.saveData(hostInput, portInput, outputInput)}>
                <Text style={{textAlign: "center", fontFamily: "Abordage"}}>Save</Text>
            </Pressable>
        </SafeAreaView>
        </>
    )
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
    input: {
        fontFamily: "Abordage",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#000",
        color: "#000",
        padding: 20,
        width: '85%',
        marginBottom: 15,
    },

    saveBtn: {
        fontFamily: "Abordage",
        borderRadius: 12,
        backgroundColor: THEME.purple,
        color: "#000",
        padding: 20,
        width: '85%',
        marginBottom: 15,
    },
    saveBtnInactive: {
        backgroundColor: THEME.darkPurple,
    }
});
