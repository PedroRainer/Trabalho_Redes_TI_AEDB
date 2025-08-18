package main

import (
	"fmt"
	"log"
	"net/http"

	"example.com/views/command"
)

func main() {
	hub := command.NewHub()
	go hub.Run()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", hub.WSHandler)
	mux.HandleFunc("/healthz", command.HealthHandler)

	addr := ":8080"
	fmt.Println("WS em http://localhost" + addr + " (rota /ws)")
	log.Fatal(http.ListenAndServe(addr, mux))
}
