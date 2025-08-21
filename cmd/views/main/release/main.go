package main

import (
	"log"
	"net"

	"views/command"
)

func main() {
	addr := ":8080" // Porta do socket alterado pelo grupo
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("erro ao escutar TCP %s: %v", addr, err)
	}
	log.Printf("TCP (puro) ouvindo em %s\n", addr)

	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Printf("accept: %v", err)
			continue
		}
		go command.HandleConnection(conn)
	}
}
