# localconvert
## Protocol
### Packet
```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| 12 bytes Header | Filename | Options | Payload  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
### Header
```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Magic (2 bytes) | Version (1 byte) | OpCode (1 byte)  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Filename (2 bytes)    |     Options (2 bytes)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                Payload Size (4 bytes)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
#### Specifications
| Name     | Size    | Description                    |
|----------|---------|--------------------------------|
| Magic    | 2 Bytes | Protocol identifier (L, C)     |
| Version  | 1 Byte  | Protocol version               |
| OpCode   | 1 Byte  | Operation identifier           |
| Filename | 2 Bytes | Length of the filename         |
| Options  | 2 Bytes | Length of the `ffmpeg` command |
| Payload  | 4 Bytes | Size of the payload            |

#### OpCodes
| Name         | Value | Description                                              |
|--------------|-------|----------------------------------------------------------|
| FileConvert  | 0x01  | Converts a file                                          |
| FileTransfer | 0x02  | Sends or Receives a file                                 |
| Processing   | 0x03  | Notifies the client that the server is processing a file |
| Error        | 0x04  | Error from the server                                    |
