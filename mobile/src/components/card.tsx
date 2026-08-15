import {Text, View, StyleSheet} from "react-native";
import {THEME} from "@/app/constants";


export default function Card({filename}: { filename: string }) {
    return (
        <View style={styles.list}>
            <View style={styles.info}>
                <Text style={styles.text}>{filename}</Text>
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
        alignItems: "center"
    },
    text: {
        fontFamily: "Abordage",
    },
})