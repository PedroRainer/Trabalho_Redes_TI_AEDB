package main

import (
	"log"
	"net"
	"os"

	"views/command"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "1234"
	}

	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Erro ao iniciar o servidor TCP: %v", err)
	}
	defer listener.Close()

	log.Printf("Servidor TCP escutando na porta %s", port)

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("Erro ao aceitar conexão: %v", err)
			continue
		}

		go command.HandleConnection(conn)
	}
}
