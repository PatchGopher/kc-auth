package main

import (
	api "core/api"
	"core/db"
)

func main() {
	storeConfig := db.GetStoreConfig()
	store, err := db.NewStore(storeConfig)
	if err != nil {
		panic("Failed to connect to the database: " + err.Error())
	}
	serverConfig := api.GetServerConfig()
	server := api.NewServer(serverConfig, store, storeConfig.Mode == db.ModeReadOnly)
	server.Start()
}
