package main

import (
	"bufio"
	"fmt"
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

	// Envia banner opcional
	fmt.Fprintf(writer, "WELCOME %s\n", time.Now().Format(time.RFC3339))
	writer.Flush()

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			log.Printf("read err de %s: %v", peer, err)
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
				// Linha em branco é ignorada
				continue
			}
			fmt.Fprintf(writer, "ECHO %s\n", msg)
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
