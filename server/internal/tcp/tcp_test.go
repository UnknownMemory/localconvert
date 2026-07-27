package tcp

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"os"
	"testing"
)

func TestPing(t *testing.T) {
	conn, err := net.Dial("tcp", "127.0.0.1:4296")
	if err != nil {
		t.Fatalf("Failed to dial server: %s", err)
	}

	writer := bufio.NewWriter(conn)

	msg := WriteHeader(&Header{
		Magic:    Magic,
		Version:  Version,
		Op:       Ping,
		Filename: 0,
		Options:  0,
		Payload:  0,
	})

	_, err = writer.Write(msg)
	if err != nil {
		t.Fatalf("Failed to write to the server: %s", err)
	}

	err = writer.Flush()
	if err != nil {
		t.Fatalf("Failed to flush to the server: %s", err)
	}
}

func TestFileConvert(t *testing.T) {
	conn, err := net.Dial("tcp", "127.0.0.1:4296")
	if err != nil {
		t.Fatalf("Failed to dial server: %s", err)
	}

	writer := bufio.NewWriter(conn)

	file, err := os.Open("../../test/test.mp4")
	if err != nil {
		t.Fatalf("Failed to open file: %s", err)
	}

	fileStat, err := file.Stat()
	if err != nil {
		t.Fatalf("Failed to stat file: %s", err)
	}

	options := "-i test.mp4 -c:v av1_nvenc -b:v 8m -c:a copy testw.avi"

	fileSize := fileStat.Size()
	msg := WriteHeader(&Header{
		Magic:    Magic,
		Version:  Version,
		Op:       FileConvert,
		Filename: uint16(len(fileStat.Name())),
		Options:  uint16(len(options)),
		Payload:  uint32(fileSize),
	})

	_, err = writer.Write(msg)
	if err != nil {
		t.Fatalf("Failed to write header to the server: %s", err)
	}

	err = writer.Flush()
	if err != nil {
		t.Fatalf("Failed to flush to the server: %s", err)
	}

	_, err = writer.Write([]byte(fileStat.Name()))
	if err != nil {
		t.Fatalf("Failed to write filename to the server: %s", err)
	}

	_, err = writer.Write([]byte(options))
	if err != nil {
		t.Fatalf("Failed to write options to the server: %s", err)
	}
	err = writer.Flush()
	if err != nil {
		t.Fatalf("Failed to flush to the server: %s", err)
	}

	_, err = io.CopyN(writer, file, fileSize)
	if err != nil {
		fmt.Printf("Failed to copy bytes: %s", err)
		return
	}

	err = writer.Flush()
	if err != nil {
		t.Fatalf("Failed to flush to the server: %s", err)
	}
}
