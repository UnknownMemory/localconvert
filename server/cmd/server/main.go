package main

import "github.com/unknownmemory/localconvert/server/internal/tcp"

func main() {
	server := tcp.NewServer("127.0.0.1:4296")
	server.Run()
}
