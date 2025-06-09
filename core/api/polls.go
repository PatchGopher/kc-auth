package api

import (
	"core/db/sqlc/commands"
	"core/db/sqlc/queries"
	"fmt"
	"strconv"

	"github.com/labstack/echo/v4"
)

type CreatePollRequest struct {
	UserID int64  `json:"user_id" validate:"required"`
	Title  string `json:"title" validate:"required"`
}

type PollsResponse struct {
	Polls []PollResponse `json:"polls"`
}

type PollResponse struct {
	ID             int64  `json:"id"`
	Title          string `json:"title"`
	Role           string `json:"role"`
	TemplatePollID int64  `json:"template_id,omitempty"`
}

// @Summary List all polls for the authenticated user
// @Description Retrieves a list of polls associated with the authenticated user
// @Tags Polls
// @Accept json
// @Produce json
// @Success 200 {array} PollResponse
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /polls [get]
func (s *Server) listPolls(c echo.Context) error {
	cc := c.(*CustomContext)
	session, err := cc.GetSession()
	if err != nil {
		return c.JSON(401, map[string]string{"error": "Unauthorized"})
	}

	polls, err := s.store.Queries.ListPollsForUser(c.Request().Context(), int64(session.UserID))
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to list polls"})
	}

	var response PollsResponse
	for _, poll := range polls {
		response.Polls = append(response.Polls, PollResponse{
			ID:             poll.ID,
			Title:          poll.Title,
			Role:           string(poll.Role),
			TemplatePollID: poll.TemplatePollID,
		})
	}
	return c.JSON(200, response)
}

// @Summary Create a new poll
// @Description Creates a new poll and associates it with the authenticated user
// @Tags Polls
// @Accept json
// @Produce json
// @Param poll body CreatePollRequest true "Poll data"
// @Success 201 {object} PollResponse
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /polls [post]
func (s *Server) createPoll(c echo.Context) error {
	cc := c.(*CustomContext)
	session, err := cc.GetSession()
	fmt.Println("Session:", session)
	if err != nil {
		return c.JSON(401, map[string]string{"error": "Unauthorized"})
	}

	var poll CreatePollRequest
	if err := c.Bind(&poll); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid request"})
	}

	poll.UserID = int64(session.UserID)
	newPoll, err := s.store.Commands.CreatePoll(c.Request().Context(), commands.CreatePollParams{
		Title: poll.Title,
	})
	if err != nil {
		s.router.Logger.Error("Failed to create poll:", err)
		return c.JSON(500, map[string]string{"error": "Failed to create poll"})
	}

	// Associate the poll with the user
	_, err = s.store.Commands.AssignUserToPoll(c.Request().Context(), commands.AssignUserToPollParams{
		UserID: poll.UserID,
		PollID: newPoll.ID,
		Role:   commands.RoleOwner,
	})
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to associate poll with user"})
	}

	return c.JSON(201, PollResponse{
		ID:             newPoll.ID,
		Title:          newPoll.Title,
		Role:           string(commands.RoleOwner),
		TemplatePollID: newPoll.TemplatePollID,
	})
}

// @Summary Get a specific poll by ID
// @Description Retrieves a poll by its ID
// @Tags Polls
// @Accept json
// @Produce json
// @Param id path int true "Poll ID"
// @Success 200 {object} PollResponse
// @Failure 404 {object} map[string]string "Poll not found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /polls/{id} [get]
func (s *Server) findPoll(c echo.Context) error {
	cc := c.(*CustomContext)
	session, err := cc.GetSession()
	if err != nil {
		return c.JSON(401, map[string]string{"error": "Unauthorized"})
	}

	pollID := c.Param("id")
	if pollID == "" {
		return c.JSON(400, map[string]string{"error": "Poll ID is required"})
	}
	intPollID, err := strconv.Atoi(pollID)

	poll, err := s.store.Queries.FindPollForUser(c.Request().Context(), queries.FindPollForUserParams{
		ID:     int64(intPollID),
		UserID: int64(session.UserID),
	})
	if err != nil {
		return c.JSON(404, map[string]string{"error": "Poll not found"})
	}

	return c.JSON(200, PollResponse{
		ID:             poll.ID,
		Title:          poll.Title,
		Role:           string(poll.Role),
		TemplatePollID: poll.TemplatePollID,
	})
}
