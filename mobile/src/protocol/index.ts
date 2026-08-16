import { Buffer } from 'buffer';
import {File} from "expo-file-system";
import TcpSocket from 'react-native-tcp-socket';

export const MAGIC = Buffer.from(['L'.charCodeAt(0), 'C'.charCodeAt(0)])
export const VERSION = 1
export const HEADER_SIZE = 12
export const MAX_FILENAME_SIZE = 255

export enum OpCode {
    FileConvert = 0x01,
    FileTransfer = 0x02,
    Processing = 0x03,
    Err = 0x04
}

export interface Header {
    Magic: Buffer,
    Version: number,
    Op: OpCode,
    Filename: number,
    Options: number,
    Payload: number
}

interface Data {
    Header: Header,
    Filename: string,
    Options: string,
    Payload: Buffer
}

export function writeHeader(h: Header): Buffer {
    let buf = Buffer.alloc(HEADER_SIZE)
    buf[0] = h.Magic[0]
    buf[1] = h.Magic[1]
    buf[2] = h.Version
    buf[3] = h.Op

    buf.writeUInt16LE(h.Filename, 4)
    buf.writeUInt16LE(h.Options, 6)
    buf.writeUInt32LE(h.Payload, 8)

    return buf
}

export function copyFile(client: TcpSocket.Socket, file: string, fileSize: number) {
    const chunkSize = 64 * 1024
    let offset = 0

    const f = new File(file)
    const fileHandle = f.open()

    while(offset < fileSize){
        const bytesR = fileHandle.readBytes(chunkSize)
        client.write(Buffer.from(bytesR))
        offset += bytesR.length
    }
}
