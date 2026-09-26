package main

import (
	"encoding/json"
	"io"
	"log"
	"os"

	"github.com/unknownmemory/localconvert/server/internal/tcp"
)

type config struct {
	Address      string `json:"address"`
	OutputFolder string `json:"outputFolder"`
}

func main() {
	configFile, err := os.Open("./config.json")
	if err != nil {
		log.Fatal(err)
	}

	configByte, err := io.ReadAll(configFile)
	if err != nil {
		log.Fatal(err)
	}

	var conf config
	err = json.Unmarshal(configByte, &conf)
	if err != nil {
		log.Fatal(err)
	}

	err = configFile.Close()
	if err != nil {
		log.Fatal(err)
	}

	err = os.MkdirAll(conf.OutputFolder, 0755)
	if err != nil {
		log.Fatal(err)
	}

	server := tcp.NewServer(conf.Address, conf.OutputFolder)
	server.Run()
}
