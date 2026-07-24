package tcp

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
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
		header, err := Read(reader)
		if err != nil {
			if errors.Is(err, io.EOF) {
				fmt.Printf("Reading error: %s\n", err)
			}
			break
		}

		switch header.Op {
		case Ping:
			log.Println("Ping received")
		}
	}
}
