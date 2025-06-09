package api

import (
	"os"

	"github.com/joho/godotenv"
)

type ServerConfig struct {
	Port string `json:"port"`
	Host string `json:"host"`
}

func GetServerConfig() ServerConfig {
	if _, err := os.Stat(".env"); err == nil {
		if err := godotenv.Load(); err != nil {
			panic("Error loading .env file")
		}
	}
	return ServerConfig{
		Port: os.Getenv("API_PORT"),
		Host: os.Getenv("API_HOST"),
	}
}
