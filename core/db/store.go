package db

import (
	"context"
	"core/db/sqlc/commands"
	"core/db/sqlc/queries"
	"fmt"

	"github.com/jackc/pgx/v5"
)

type Store struct {
	Commands   *commands.Queries
	Queries    *queries.Queries
	connection *pgx.Conn
}

type TxCommands commands.Queries

func NewStore(config StoreConfig) (*Store, error) {
	switch config.Mode {
	case ModeCQRS:
		return newCQRSStore(config)
	case ModeReadWrite:
		return newReadWriteStore(config)
	case ModeReadOnly:
		return newReadOnlyStore(config)
	default:
		panic("Invalid store mode")
	}
}

func (store *Store) ExecTx(ctx context.Context, fn func(*commands.Queries) error) error {
	tx, err := store.connection.Begin(ctx)
	if err != nil {
		return err
	}

	q := commands.New(tx)

	err = fn(q)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
		}
		return err
	}

	return tx.Commit(ctx)
}

func newCQRSStore(config StoreConfig) (*Store, error) {
	rwConn, err := pgx.Connect(context.Background(), config.ReadWrite.GetConnectionString())
	if err != nil {
		return nil, err
	}
	roConn, err := pgx.Connect(context.Background(), config.ReadOnly.GetConnectionString())
	if err != nil {
		return nil, err
	}

	commandsQueries := commands.New(rwConn)
	queriesQueries := queries.New(roConn)

	return &Store{
		Commands:   commandsQueries,
		Queries:    queriesQueries,
		connection: rwConn,
	}, nil
}

func newReadWriteStore(config StoreConfig) (*Store, error) {
	rwConn, err := pgx.Connect(context.Background(), config.ReadWrite.GetConnectionString())
	if err != nil {
		return nil, err
	}

	commandsQueries := commands.New(rwConn)
	queriesQueries := queries.New(rwConn)

	return &Store{
		Commands:   commandsQueries,
		Queries:    queriesQueries,
		connection: rwConn,
	}, nil
}

func newReadOnlyStore(config StoreConfig) (*Store, error) {
	roConn, err := pgx.Connect(context.Background(), config.ReadOnly.GetConnectionString())
	if err != nil {
		return nil, err
	}

	queriesQueries := queries.New(roConn)

	return &Store{
		Commands:   nil, // No commands in read-only mode
		Queries:    queriesQueries,
		connection: roConn,
	}, nil
}
