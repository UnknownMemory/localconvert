import { Buffer } from 'buffer';


const MAGIC = Buffer.from(['L'.charCodeAt(0), 'C'.charCodeAt(0)])
const VERSION = 1
const HEADER_SIZE = 12
const MAX_FILENAME_SIZE = 255

export enum OpCode {
    FileConvert = 0x01,
    FileTransfer = 0x02,
    Processing = 0x03,
    Err = 0x04
}

interface Header {
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

function writeHeader(h: Header): Buffer {
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
