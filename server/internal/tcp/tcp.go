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

		err = s.operation(data, conn)
		if err != nil {
			fmt.Println(err)
			s.sendStatus(conn, Err)
		}
	}
}

func (s *Server) operation(data *Data, conn net.Conn) error {
	switch data.Header.Op {
	case FileConvert:
		err := s.receiveFile(conn, data.Filename, data.Payload, data.Header.Payload)
		if err != nil {
			return fmt.Errorf("error while receiving file: %w", err)
		}

		s.sendStatus(conn, Processing)

		err = s.convert(conn, data.Filename, data.Options)
		if err != nil {
			return fmt.Errorf("error while converting file: %w", err)
		}

		err = s.sendFile(conn, data.Filename)
		if err != nil {
			return fmt.Errorf("error while sending back the file: %w", err)

		}
	case FileTransfer:
		err := s.receiveFile(conn, data.Filename, data.Payload, data.Header.Payload)
		if err != nil {
			return fmt.Errorf("error while receiving file: %w", err)
		}
	default:
		return fmt.Errorf("unknown operation code")
	}

	return nil
}

func (s *Server) receiveFile(conn net.Conn, filename string, payload io.Reader, payloadSize uint32) error {
	log.Printf("[TRANSFER] Receiving %s [%s]", filename, conn.RemoteAddr())

	root, err := os.OpenRoot("./")
	if err != nil {
		return fmt.Errorf("failed to openroot: %w", err)
	}
	defer root.Close()

	filenameClean := filepath.Base(filepath.Clean(filename))
	file, err := root.Create(filenameClean)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}

	_, err = io.CopyN(file, payload, int64(payloadSize))
	if err != nil {
		return fmt.Errorf("failed to copy bytes: %w", err)
	}

	err = file.Sync()
	if err != nil {
		return fmt.Errorf("failed to sync file: %w", err)
	}
	log.Printf("[TRANSFER][SUCCESS] Received %s [%s]", filename, conn.RemoteAddr())

	return nil
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
	log.Printf("[TRANSFER] Sending %s [%s]", filename, conn.RemoteAddr())

	root, err := os.OpenRoot("./")
	if err != nil {
		return fmt.Errorf("failed to openroot: %w", err)
	}
	defer root.Close()

	writer := bufio.NewWriter(conn)

	file, err := root.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}

	fileStat, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat file: %w", err)
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
		return fmt.Errorf("failed to write header: %w", err)
	}

	_, err = writer.Write([]byte(fileStat.Name()))
	if err != nil {
		return fmt.Errorf("failed to write filename: %w", err)
	}

	_, err = io.CopyN(writer, file, fileSize)
	if err != nil {
		return fmt.Errorf("failed to copy payload: %w", err)
	}

	err = writer.Flush()
	if err != nil {
		return fmt.Errorf("failed to flush: %w", err)
	}

	log.Printf("[TRANSFER][SUCCESS] %s has been sent. [%s]", filename, conn.RemoteAddr())
	return nil
}

func (s *Server) sendStatus(conn net.Conn, status OpCode) {
	writer := bufio.NewWriter(conn)

	msg := WriteHeader(&Header{
		Magic:    Magic,
		Version:  Version,
		Op:       status,
		Filename: 0,
		Options:  0,
		Payload:  0,
	})

	_, err := writer.Write(msg)
	if err != nil {
		fmt.Printf("Failed to write status: %w", err)
		return
	}

	err = writer.Flush()
	if err != nil {
		fmt.Printf("failed to flush: %w", err)
	}
}
