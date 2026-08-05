import {StyleSheet, TextInput} from "react-native";
import {THEME} from "@/app/constants";
import {SafeAreaView} from "react-native-safe-area-context";
import {SettingsContext} from "@/context/settings";
import {useContext} from "react";


export default function Settings() {
    const { host, port, outputFolder } = useContext(SettingsContext)
    return (
        <SafeAreaView style={styles.container}>
            <TextInput style={styles.input} value={host}></TextInput>
            <TextInput style={styles.input} value={port}></TextInput>
            <TextInput style={styles.input} value={outputFolder}></TextInput>
        </SafeAreaView>
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
});
