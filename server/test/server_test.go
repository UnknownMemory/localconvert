package test

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"net"
	"os"
	"testing"

	"github.com/unknownmemory/localconvert/server/internal/tcp"
)

func TestMain(m *testing.M) {
	s := tcp.NewServer("127.0.0.1:4296")
	go s.Run()

	exitCode := m.Run()
	os.Exit(exitCode)
}

func setupClient(t *testing.T) (conn net.Conn, scanner *bufio.Scanner) {
	t.Helper()

	conn, err := net.Dial("tcp", "127.0.0.1:4296")
	if err != nil {
		t.Fatalf("Fail to dial server: %s", err)
	}

	return conn, bufio.NewScanner(conn)
}

func TestFileConvert(t *testing.T) {
	conn, scanner := setupClient(t)
	defer conn.Close()

	writer := bufio.NewWriter(conn)

	file, err := os.Open("./data/test.mp4")
	if err != nil {
		t.Fatalf("Failed to open file: %s", err)
	}

	fileStat, err := file.Stat()
	if err != nil {
		t.Fatalf("Failed to stat file: %s", err)
	}

	options := "-i test.mp4 -c:v av1_nvenc -b:v 8m -c:a copy testw.avi"

	fileSize := fileStat.Size()
	msg := tcp.WriteHeader(&tcp.Header{
		Magic:    tcp.Magic,
		Version:  tcp.Version,
		Op:       tcp.FileConvert,
		Filename: uint16(len(fileStat.Name())),
		Options:  uint16(len(options)),
		Payload:  uint32(fileSize),
	})

	_, err = writer.Write(msg)
	if err != nil {
		t.Fatalf("Failed to write header to the server: %s", err)
	}

	_, err = writer.Write([]byte(fileStat.Name()))
	if err != nil {
		t.Fatalf("Failed to write filename to the server: %s", err)
	}

	_, err = writer.Write([]byte(options))
	if err != nil {
		t.Fatalf("Failed to write options to the server: %s", err)
	}

	_, err = io.CopyN(writer, file, fileSize)
	if err != nil {
		fmt.Printf("Failed to copy bytes: %s", err)
		return
	}

	err = writer.Flush()
	if err != nil {
		t.Fatalf("Failed to flush the client: %s", err)
	}

	if !scanner.Scan() {
		t.Fatalf("Failed to scan: %s", scanner.Err())
	}

	scanBytes := scanner.Bytes()
	data, err := tcp.Read(bytes.NewReader(scanBytes))
	if err != nil {
		return
	}

	if data.Header.Op != tcp.Processing {
		t.Fatalf("Expected OpCode %q, got %q", tcp.Processing, data.Header.Op)
	}
}
