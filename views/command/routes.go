package command

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Upgrader: HTTP -> WebSocket
var upgrader = websocket.Upgrader{
	// Em produção, valide a origem: ex. verificar r.Header.Get("Origin")
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub: gerencia clientes e broadcast
type Hub struct {
	mu        sync.Mutex
	clients   map[*websocket.Conn]bool
	Broadcast chan []byte
}

func NewHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		Broadcast: make(chan []byte, 256),
	}
}

// Loop de broadcast
func (h *Hub) Run() {
	for msg := range h.Broadcast {
		h.mu.Lock()
		for c := range h.clients {
			if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
				_ = c.Close()
				delete(h.clients, c)
			}
		}
		h.mu.Unlock()
	}
}

// Handler do WS em /ws
func (h *Hub) WSHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()
	log.Println("cliente conectado")

	go func() {
		defer func() {
			h.mu.Lock()
			delete(h.clients, conn)
			h.mu.Unlock()
			_ = conn.Close()
			log.Println("cliente saiu")
		}()

		for {
			mt, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}
			if mt == websocket.TextMessage {
				h.Broadcast <- msg
			}
		}
	}()
}

// Healthcheck simples (HTTP 200 "ok")
func HealthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}
