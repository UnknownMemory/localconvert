package tcp

import (
	"encoding/binary"
	"fmt"
	"io"
)

var Magic = [2]byte{'L', 'C'}

const Version uint8 = 1

type OpCode byte

const (
	FileConvert  OpCode = 0x01
	FileTransfer OpCode = 0x02
	Ping         OpCode = 0x03
	Ok           OpCode = 0x04
)

type Header struct {
	Magic    [2]byte
	Version  uint8
	Op       OpCode
	Filename uint16
	Options  uint16
	Payload  uint32
}

type Data struct {
	Header   *Header
	Filename string
	Options  string
	Payload  io.Reader
}

const headerSize = 12

const maxFilenameSize uint16 = 255
const maxPayloadSize uint32 = 3 << 30

func WriteHeader(h *Header) []byte {
	buffer := make([]byte, headerSize)
	buffer[0], buffer[1] = h.Magic[0], h.Magic[1]
	buffer[2] = h.Version
	buffer[3] = byte(h.Op)

	binary.LittleEndian.PutUint16(buffer[4:6], h.Filename)
	binary.LittleEndian.PutUint16(buffer[6:8], h.Options)
	binary.LittleEndian.PutUint32(buffer[8:12], h.Payload)

	return buffer
}

func ValidHeader(r io.Reader) (*Header, error) {
	headerBuffer := make([]byte, headerSize)

	_, err := io.ReadFull(r, headerBuffer)
	if err != nil {
		return nil, err
	}

	header := &Header{
		Magic:    [2]byte{headerBuffer[0], headerBuffer[1]},
		Version:  headerBuffer[2],
		Op:       OpCode(headerBuffer[3]),
		Filename: binary.LittleEndian.Uint16(headerBuffer[4:6]),
		Options:  binary.LittleEndian.Uint16(headerBuffer[6:8]),
		Payload:  binary.LittleEndian.Uint32(headerBuffer[8:12]),
	}

	if header.Magic != Magic {
		return nil, fmt.Errorf("invalid magic byte: %v", header.Magic)
	}

	if header.Version != Version {
		return nil, fmt.Errorf("invalid version: %v", header.Version)
	}

	if !header.Op.isValid() {
		return nil, fmt.Errorf("invalid opcode: %v", header.Op)
	}

	if header.Filename > maxFilenameSize {
		return nil, fmt.Errorf("filename is too long")
	}

	if header.Payload > maxPayloadSize {
		return nil, fmt.Errorf("payload is too big")
	}

	return header, nil
}

func Read(r io.Reader) (*Data, error) {
	header, err := ValidHeader(r)
	if err != nil {
		return nil, err
	}

	var filename string
	var options string
	var payload io.Reader

	if header.Filename > 0 {
		filenameBuffer := make([]byte, header.Filename)
		_, err = io.ReadFull(r, filenameBuffer)
		if err != nil {
			return nil, fmt.Errorf("failed to read filename: %s", err)
		}
		filename = string(filenameBuffer)
	}

	if header.Options > 0 {
		optionsBuffer := make([]byte, header.Options)
		_, err = io.ReadFull(r, optionsBuffer)
		if err != nil {
			return nil, fmt.Errorf("failed to read options: %s", err)
		}
		options = string(optionsBuffer)
	}

	if header.Payload > 0 {
		payload = io.LimitReader(r, int64(header.Payload))
	}

	return &Data{
		Header:   header,
		Filename: filename,
		Options:  options,
		Payload:  payload,
	}, nil
}

func (op OpCode) isValid() bool {
	switch op {
	case FileConvert, FileTransfer, Ping, Ok:
		return true
	default:
		return false
	}
}
