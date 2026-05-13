package main

import (
	"context"

	"github.com/secamc93/lerida-comercio/back/central/cmd/internal/server"
)

func main() {
	_ = server.Init(context.Background())
	select {}
}

