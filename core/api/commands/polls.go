package commands

import (
	"core/db"
	"core/db/sqlc/commands"
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

func (s *PollsService) CreatePoll(c fuego.ContextWithBody[CreatePollRequest]) (Poll, error) {
	req, err := c.Body()
	if err != nil {
		return Poll{}, err
	}

	poll, err := s.store.Commands.CreatePoll(c.Context(), commands.CreatePollParams{
		Title: req.Title,
	})
	if err != nil {
		return Poll{}, err
	}

	roleAssignment, err := s.store.Commands.AssignUserToPoll(c.Context(), commands.AssignUserToPollParams{
		UserID: 1,
		PollID: poll.ID,
		Role:   commands.RoleOwner,
	})
	if err != nil {
		return Poll{}, err
	}

	return Poll{
		ID:    poll.ID,
		Title: poll.Title,
		Role:  string(roleAssignment.Role),
	}, nil
}

func (s *PollsService) UpdatePoll(c fuego.ContextWithBody[UpdatePollRequest]) (Poll, error) {
	id, err := strconv.Atoi(c.PathParam("id"))
	if err != nil {
		return Poll{}, err
	}

	req, err := c.Body()
	if err != nil {
		return Poll{}, err
	}

	poll, err := s.store.Commands.UpdatePoll(c.Context(), commands.UpdatePollParams{
		ID:    int64(id),
		Title: req.Title,
	})
	if err != nil {
		return Poll{}, err
	}

	role, err := s.store.Queries.GetUserRoleForPoll(c.Context(), queries.GetUserRoleForPollParams{
		UserID: 1,
		PollID: int64(id),
	})
	if err != nil {
		return Poll{}, err
	}

	return Poll{
		ID:    poll.ID,
		Title: poll.Title,
		Role:  string(role),
	}, nil
}

func (s *PollsService) DeletePoll(c fuego.ContextNoBody) (Poll, error) {
	id, err := strconv.Atoi(c.PathParam("id"))
	if err != nil {
		return Poll{}, err
	}

	poll, err := s.store.Commands.DeletePoll(c.Context(), int64(id))
	if err != nil {
		return Poll{}, err
	}

	role, err := s.store.Queries.GetUserRoleForPoll(c.Context(), queries.GetUserRoleForPollParams{
		UserID: 1,
		PollID: int64(id),
	})
	if err != nil {
		return Poll{}, err
	}

	return Poll{
		ID:    poll.ID,
		Title: poll.Title,
		Role:  string(role),
	}, nil
}
