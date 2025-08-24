package command

import (
	"bufio"
	"fmt"
	"net"
)

// HandleConnection lida com uma conexão TCP (eco simples + mensagem)
func HandleConnection(c net.Conn) {
	defer c.Close()

	r := bufio.NewScanner(c)
	for r.Scan() {
		line := r.Text()
		fmt.Printf("TCP recv from %s: %q\n", c.RemoteAddr().String(), line)
		_, _ = fmt.Fprintf(c, "Hello from server (echo): %s\n", line)
	}
}
