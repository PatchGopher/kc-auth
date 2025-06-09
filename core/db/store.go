package db

import (
	"context"
	"core/db/sqlc/commands"
	"core/db/sqlc/queries"

	"github.com/jackc/pgx/v5"
)

type Store struct {
	Commands *commands.Queries
	Queries  *queries.Queries
}

func NewStore(config StoreConfig) (*Store, error) {
	conn, err := pgx.Connect(context.Background(), config.GetConnectionString())
	if err != nil {
		return nil, err
	}
	store := &Store{
		Commands: commands.New(conn),
		Queries:  queries.New(conn),
	}
	return store, nil
}
