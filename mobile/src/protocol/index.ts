import { Buffer } from 'buffer';


export const MAGIC = Buffer.from("LC")
export const VERSION = 1
export const HEADER_SIZE = 12
export const MAX_FILENAME_SIZE = 255
const MAX_PAYLOAD_SIZE = 3n << 30n

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

export function validHeader(headerBuffer: Buffer): Header {

    const header: Header = {
        Magic: Buffer.from(headerBuffer.subarray(0, 2)),
        Version: headerBuffer[2],
        Op: headerBuffer[3],
        Filename: headerBuffer.readInt16LE(4),
        Options: headerBuffer.readInt16LE(6),
        Payload: headerBuffer.readInt32LE(8)
    }


    if (!header.Magic.equals(MAGIC)) {
        throw new Error("Invalid magic byte.")
    }

    if (header.Version != VERSION) {
        throw new Error("Invalid version.")
    }

    if (!isOpValid(header.Op)) {
        throw new Error("Invalid opcode.")
    }

    if (header.Filename > MAX_FILENAME_SIZE) {
        throw new Error("Filename is too long.")
    }

    if (header.Payload > MAX_PAYLOAD_SIZE) {
        throw new Error("Payload is too big.")
    }

    return header
}

export function read(buf: Buffer, header: Header) {
    let data: Data;
    let filename: string = "";
    let options: string = "";
    let payload: Buffer = new Buffer(0);

    if (header.Filename > 0) {
        filename = new TextDecoder('utf-8').decode(buf.subarray(0, header.Filename))

        buf = Buffer.from(buf.subarray(header.Filename))
    }

    if (header.Options > 0) {
        const optionsBuffer = buf.subarray(0, header.Options)
        options = optionsBuffer.toString()

        buf = Buffer.from(buf.subarray(header.Options))
    }

    if (header.Payload > 0) {
        payload = Buffer.from(buf.subarray(0, header.Payload))
    }

    data = {
        Header: header,
        Filename: filename,
        Options: options,
        Payload: payload
    }

    return data
}


function isOpValid(op: OpCode): boolean {
    return Object.values(OpCode).includes(op)
}
