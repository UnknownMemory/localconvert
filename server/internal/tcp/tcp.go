package tcp

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type Server struct {
	Addr     string
	listener net.Listener
}

func NewServer(addr string) *Server {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		fmt.Printf("Error: %s\n", err)
	}

	return &Server{
		Addr:     addr,
		listener: listener,
	}
}

func (s *Server) Run() {
	fmt.Printf("Server is running on %s\n", s.listener.Addr())
	s.accept()
}

func (s *Server) accept() {

	for {
		conn, err := s.listener.Accept()
		if err != nil {
			fmt.Printf("Failed to accept connection: %s\n", err)
		}

		go s.handleConnection(conn)
	}
}

func (s *Server) handleConnection(conn net.Conn) {
	defer conn.Close()

	reader := bufio.NewReader(conn)
	fmt.Printf("New connection %s\n", conn.RemoteAddr())

	for {
		data, err := Read(reader)
		if err != nil {
			if errors.Is(err, io.EOF) {
				fmt.Printf("Reading error: %s\n", err)
			}
			break
		}

		switch data.Header.Op {
		case Ping:
			log.Println("Ping received")
		case FileConvert:
			s.receiveFile(data.Filename, data.Payload, data.Header.Payload)

			err = s.convert(conn, data.Filename, data.Options)
			if err != nil {
				log.Printf("error while converting file: %s\n", err)
				continue
			}

			err = s.sendFile(conn, data.Filename)
			if err != nil {
				log.Printf("error while sending back the file: %s\n", err)
				continue
			}
		case FileTransfer:
			s.receiveFile(data.Filename, data.Payload, data.Header.Payload)
		}
	}
}

func (s *Server) receiveFile(filename string, payload io.Reader, payloadSize uint32) {
	root, err := os.OpenRoot("./")
	if err != nil {
		fmt.Printf("Failed to openroot: %s\n", err)
		return
	}
	defer root.Close()

	filenameClean := filepath.Base(filepath.Clean(filename))
	file, err := root.Create(filenameClean)
	if err != nil {
		fmt.Printf("Failed to create file: %s", err)
		return
	}

	_, err = io.CopyN(file, payload, int64(payloadSize))
	if err != nil {
		fmt.Printf("Failed to copy bytes: %s", err)
		return
	}

	err = file.Sync()
	if err != nil {
		fmt.Printf("Failed to sync file: %s", err)
		return
	}

}

func (s *Server) convert(conn net.Conn, filename string, options string) error {
	log.Printf("[CONVERT] %s [%s]", filename, conn.RemoteAddr())

	args := strings.Split(options, " ")
	cmd := exec.Command("ffmpeg", args...)

	err := cmd.Run()
	if err != nil {
		return err
	}

	log.Printf("[CONVERT][SUCCESS] %s [%s]", filename, conn.RemoteAddr())
	return nil
}

func (s *Server) sendFile(conn net.Conn, filename string) error {
	root, err := os.OpenRoot("./")
	if err != nil {
		return fmt.Errorf("failed to openroot: %s\n", err)
	}

	writer := bufio.NewWriter(conn)

	file, err := root.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open file: %s", err)
	}

	fileStat, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat file: %s", err)
	}

	fileSize := fileStat.Size()
	msg := WriteHeader(&Header{
		Magic:    Magic,
		Version:  Version,
		Op:       FileTransfer,
		Filename: uint16(len(fileStat.Name())),
		Options:  0,
		Payload:  uint32(fileSize),
	})

	_, err = writer.Write(msg)
	if err != nil {
		return fmt.Errorf("failed to write header: %s", err)
	}

	_, err = writer.Write([]byte(fileStat.Name()))
	if err != nil {
		return fmt.Errorf("failed to write filename: %s", err)
	}

	_, err = io.CopyN(writer, file, fileSize)
	if err != nil {
		return fmt.Errorf("failed to copy payload: %s", err)
	}

	err = writer.Flush()
	if err != nil {
		return fmt.Errorf("failed to flush: %s", err)
	}

	return nil
}
