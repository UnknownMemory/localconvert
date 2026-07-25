package tcp

import (
	"bufio"
	"net"
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
