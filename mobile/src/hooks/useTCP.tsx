import { useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import { Directory, File, Paths } from "expo-file-system";
import { DocumentPickerAsset } from "expo-document-picker";

import { MAGIC, OpCode, VERSION, Header, writeHeader, read, HEADER_SIZE, validHeader } from "@/protocol";
import { Buffer } from "buffer";

export enum Status {
    DISCONNECTED = 0,
    SENDING = 1,
    CONVERTING = 2,
    RECEIVING = 3,
    DONE = 4,
    ERR = 5,
}

export function useTCP(port: number, host: string | undefined, outputFolder: string | undefined) {
    const [status, setStatus] = useState<Status>(Status.DISCONNECTED);

    const sendFile = (file: DocumentPickerAsset | undefined, options: string) => {
        let chunks : Buffer[]= [];
        let bufferedLength = 0;
        let header: Header | null = null;

        const client = TcpSocket.createConnection({ port: port, host: host, reuseAddress: true }, () => {});

        client.on("connect", () => {
            if (!file) {
                return;
            }

            setStatus(Status.SENDING);

            const filenameSize = file.name.length;
            const fileSize = file.size;

            if (fileSize !== undefined && filenameSize !== undefined) {
                const header: Header = {
                    Magic: MAGIC,
                    Version: VERSION,
                    Op: OpCode.FileConvert,
                    Filename: filenameSize,
                    Options: options.length,
                    Payload: fileSize,
                };
                client.write(writeHeader(header));
                client.write(Buffer.from(file.name));
                client.write(Buffer.from(options));
                copyFile(client, file.uri, fileSize);
            }
        });

        client.on("data", async (data) => {
            if (!Buffer.isBuffer(data)) return;

            chunks.push(data)
            bufferedLength += data.length

            while (true) {
                if (header === null) {
                    if (bufferedLength < HEADER_SIZE) {
                        break;
                    }

                    const buffer = Buffer.concat(chunks, bufferedLength);
                    header = validHeader(buffer);
                    const chunksRest = buffer.subarray(HEADER_SIZE) as Buffer;

                    chunks = [chunksRest]
                    bufferedLength = chunksRest.length;
                }

                if (header !== null) {
                    const payloadLength = header.Filename + header.Options + header.Payload;
                    if (header && bufferedLength < payloadLength) {
                        break;
                    }

                    const buffer = Buffer.concat(chunks, bufferedLength);
                    const fileData = read(buffer, header);
                    header = null;
                    const chunksRest = buffer.subarray(payloadLength) as Buffer;

                    chunks = [chunksRest]
                    bufferedLength = chunksRest.length;

                    switch (fileData.Header.Op){
                        case OpCode.FileTransfer:
                            client.pause()
                            try {
                                setStatus(Status.RECEIVING)
                                await receiveFile(outputFolder, fileData.Filename, fileData.Payload);
                                setStatus(Status.DONE)
                            } finally {
                                client.resume()
                            }
                            break
                        case OpCode.Processing:
                            setStatus(Status.CONVERTING)
                            break
                        default:
                            break
                    }

                }
            }
        });
    };

    return { sendFile, status };
}

function copyFile(client: TcpSocket.Socket, file: string, fileSize: number) {
    const chunkSize = 64 * 1024;
    let offset = 0;

    const f = new File(file);
    const fileHandle = f.open();

    while (offset < fileSize) {
        const bytesR = fileHandle.readBytes(chunkSize);
        client.write(Buffer.from(bytesR));
        offset += bytesR.length;
    }
}

async function receiveFile(uri: string, filename: string, payload: Buffer) {
    const file = new File(Paths.cache, filename);

    file.create({ overwrite: true });
    file.write(payload);

    const output = new Directory(uri);
    await file.move(output, { overwrite: true });

}
