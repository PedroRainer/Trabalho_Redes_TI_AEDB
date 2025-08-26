// cmd/views/main/main.go (ou equivalente)
package main

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"strings"
	"time"
)

func handleConnection(conn net.Conn) {
	defer conn.Close()
	peer := conn.RemoteAddr().String()
	log.Printf("novo cliente: %s", peer)

	reader := bufio.NewReader(conn)
	writer := bufio.NewWriter(conn)

	// ❌ Sem banner de boas-vindas. Não enviamos nada aqui.

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if errors.Is(err, io.EOF) {
				log.Printf("cliente encerrou: %s", peer)
			} else {
				log.Printf("read err de %s: %v", peer, err)
			}
			return
		}
		msg := strings.TrimSpace(line)
		log.Printf("rx de %s: %q", peer, msg)

		switch strings.ToUpper(msg) {
		case "PING":
			fmt.Fprintln(writer, "PONG")
		case "HELLO":
			fmt.Fprintln(writer, "HELLO_OK")
		case "TIME", "TIME?":
			fmt.Fprintf(writer, "TIME %s\n", time.Now().Format(time.RFC3339))
		default:
			if msg == "" {
				continue
			}
			// ✅ eco puro: responde exatamente o que o cliente mandou
			fmt.Fprintln(writer, msg)
		}
		writer.Flush()
	}
}

func main() {
	addr := ":1234"
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("TCP escutando em %s", addr)
	for {
		c, err := ln.Accept()
		if err != nil {
			log.Printf("accept err: %v", err)
			continue
		}
		go handleConnection(c)
	}
}
