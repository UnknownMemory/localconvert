import {useState} from "react";
import TcpSocket from "react-native-tcp-socket";
import {DocumentPickerAsset} from "expo-document-picker";

import {MAGIC, OpCode, VERSION, Header, writeHeader, copyFile} from "@/protocol";
import { Buffer } from "buffer";

export enum Status {
    DISCONNECTED=0,
    SENDING=1,
    CONVERTING=2,
    ERR=3
}


export function useTCP(port: number, host: string | undefined) {
    const [status, setStatus] = useState<Status>(Status.DISCONNECTED)

    const sendFile = (file: DocumentPickerAsset | undefined) => {
        const client = TcpSocket.createConnection({port: port, host: host, reuseAddress: true}, () => {});

        client.on("connect", () => {
            if(!file){
                return
            }

            setStatus(Status.SENDING)

            const filenameSize = file.name.length
            const fileSize = file.size
            const options = "-i test.mp4 -c:v av1_nvenc -b:v 8m -c:a copy testw.avi"

            if(fileSize !== undefined && filenameSize !== undefined){
                const header: Header = {
                    Magic: MAGIC,
                    Version: VERSION,
                    Op: OpCode.FileConvert,
                    Filename: filenameSize,
                    Options: options.length,
                    Payload: fileSize
                }
                client.write(writeHeader(header))
                client.write(Buffer.from(file.name))
                client.write(Buffer.from(options))
                copyFile(client, file.uri, fileSize)
            }
        })
    }

    return {sendFile, status}
}
