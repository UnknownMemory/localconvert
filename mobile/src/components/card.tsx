import {Text, View, StyleSheet} from "react-native";
import {THEME} from "@/app/constants";
import {Status} from "@/hooks/useTCP";

const StatusText: Record<Status, string> = {
    [Status.DISCONNECTED]: "",
    [Status.SENDING]: "Sending file...",
    [Status.CONVERTING]: "Converting file...",
    [Status.RECEIVING]: "Receiving file...",
    [Status.DONE]: "Task completed",
    [Status.ERR]: "An error as occurred"
}

export default function Card({filename, currStatus}: { filename: string, currStatus: Status }) {

    return (
        <View style={styles.list}>
            <View style={styles.info}>
                <Text style={styles.text}>{filename}</Text>
                <Text>{StatusText[currStatus]}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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
        alignItems: "center",
        justifyContent: "space-between"
    },
    text: {
        fontFamily: "Abordage",
    },
})