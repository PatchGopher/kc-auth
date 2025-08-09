package queries

import (
	"core/db"
	"core/db/sqlc/queries"
	"strconv"

	"github.com/go-fuego/fuego"
)

type PollsService struct {
	store *db.Store
}

func NewPollsService(store *db.Store) *PollsService {
	return &PollsService{
		store: store,
	}
}

type Poll struct {
	ID    int64  `json:"id"`
	Title string `json:"title"`
	Role  string `json:"role"`
}

type CreatePollRequest struct {
	Title string `json:"title" validate:"required"`
	Role  string `json:"role" validate:"required"`
}

type UpdatePollRequest struct {
	Title string `json:"title" validate:"required"`
	Role  string `json:"role" validate:"required"`
}

func (s *PollsService) FindPoll(c fuego.ContextNoBody) (Poll, error) {
	id, err := strconv.Atoi(c.PathParam("id"))
	poll, err := s.store.Queries.FindPollForUser(c.Context(), queries.FindPollForUserParams{
		ID:     int64(id),
		UserID: 1,
	})
	if err != nil {
		return Poll{}, err
	}
	return Poll{
		ID:    poll.ID,
		Title: poll.Title,
		Role:  string(poll.Role),
	}, nil
}

func (s *PollsService) ListPolls(c fuego.ContextNoBody) ([]Poll, error) {
	polls, err := s.store.Queries.ListPollsForUser(c.Context(), 1)
	if err != nil {
		return nil, err
	}
	result := make([]Poll, len(polls))
	for i, poll := range polls {
		result[i] = Poll{
			ID:    poll.ID,
			Title: poll.Title,
			Role:  string(poll.Role),
		}
	}
	return result, nil
}
