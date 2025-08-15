package main

import (
	"fmt"
	"views/cmd/views/command/routes"
)

func main() {
	fmt.Println("Starting the application...")
	routes.SetupRoutes()
}
