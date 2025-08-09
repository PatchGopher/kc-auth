package api

import (
	"core/api/commands"
	"core/api/queries"
	"core/db"

	"github.com/go-fuego/fuego"
)

type Server struct {
	router *fuego.Server
	config ServerConfig
	store  *db.Store
}

func NewServer(config ServerConfig, store *db.Store, readOnly bool) *Server {
	router := fuego.NewServer(
		fuego.WithAddr(config.Host + ":" + config.Port),
	)

	server := &Server{
		router: router,
		config: config,
		store:  store,
	}

	server.registerUtils()
	server.registerQueries()
	server.registerCommands()

	return server
}

func (server *Server) registerUtils() {
	utilsGroup := fuego.Group(server.router, "/", fuego.OptionTags("utils"))

	fuego.Get(utilsGroup, "/", index)
	fuego.Get(utilsGroup, "/health", health)
}

func (server *Server) registerQueries() {
	queriesRouter := fuego.Group(server.router, "/queries", fuego.OptionTags("queries"))

	pollsService := queries.NewPollsService(server.store)
	pollsRouter := fuego.Group(queriesRouter, "/polls", fuego.OptionTags("polls"))
	fuego.Get(pollsRouter, "/find-poll/:id", pollsService.FindPoll)
	fuego.Get(pollsRouter, "/list-polls", pollsService.ListPolls)
}

func (server *Server) registerCommands() {
	commandsRouter := fuego.Group(server.router, "/commands", fuego.OptionTags("commands"))

	pollsService := commands.NewPollsService(server.store)
	pollsRouter := fuego.Group(commandsRouter, "/polls", fuego.OptionTags("polls"))
	fuego.Post(pollsRouter, "/create-poll", pollsService.CreatePoll)
	fuego.Post(pollsRouter, "/update-poll", pollsService.UpdatePoll)
	fuego.Post(pollsRouter, "/delete-poll", pollsService.DeletePoll)
}

func (s *Server) Start() {
	s.router.Run()
}

func index(c fuego.ContextNoBody) (string, error) {
	return "Hello, World!", nil
}

func health(c fuego.ContextNoBody) (string, error) {
	return "OK", nil
}
