package tcp

import (
	"fmt"
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

	fmt.Printf("New connection %s", conn.RemoteAddr())
}
