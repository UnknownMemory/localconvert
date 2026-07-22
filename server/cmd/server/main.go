package main

import "github.com/unknownmemory/localconvert/server/internal/tcp"

func main() {
	server := tcp.NewServer("0.0.0.0:4296")
	server.Run()
}
