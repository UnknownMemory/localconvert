import {Text, View, StyleSheet, TextInput, DimensionValue} from "react-native";
import {THEME} from "@/app/constants";
import {Status} from "@/hooks/useTCP";
import {Dispatch, SetStateAction, useState} from "react";

const StatusText: Record<Status, string> = {
    [Status.DISCONNECTED]: "",
    [Status.SENDING]: "Sending file...",
    [Status.CONVERTING]: "Converting file...",
    [Status.RECEIVING]: "Receiving file...",
    [Status.DONE]: "Task completed",
    [Status.ERR]: "An error as occurred"
}

    interface Props {
        filename: string,
        currStatus: Status,
        outputName: string,
        setOutputName: Dispatch<SetStateAction<string>>,
        format: string,
        setFormat: Dispatch<SetStateAction<string>>,
        bitrate: string,
        setBitrate: Dispatch<SetStateAction<string>>,
    }

export default function Card({filename, currStatus, outputName, setOutputName, format, setFormat, bitrate, setBitrate}:  Props) {

    const textInput = (label: string, width: DimensionValue, value: string, onChange: (text: string) => void) => {
        return (
            <View style={{width: width}}>
                <Text style={[styles.text, {marginBottom: 5, width: "100%"}]}>{label}</Text>
                <TextInput style={[styles.input, {width: "100%"}]} onChangeText={onChange} value={value}></TextInput>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <Text style={styles.text}>{filename}</Text>
                <Text>{StatusText[currStatus]}</Text>
            </View>
            <View style={{flexDirection: "row", gap: 15, marginTop: 20, flexWrap: "wrap"}}>
                {textInput("Output", "70%", outputName, setOutputName)}
                {textInput("Format", "25%", format, setFormat)}
                {textInput("Bitrate", "40%", bitrate, setBitrate)}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "85%",
    },
    info: {
        borderRadius: 12,
        backgroundColor: THEME.blue,
        padding: 20,
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
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
})