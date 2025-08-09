package commands

import (
	"core/db"
	"core/db/sqlc/commands"

	"github.com/go-fuego/fuego"
)

type QuestionsService struct {
	store *db.Store
}

type CreateQuestionRequest struct {
	PollID   int64
	Question string
	Type     commands.QuestionType
}

type Question struct {
	ID       int64 `json:"id"`
	PollID   int64 
	Question string
	Type     commands.QuestionType
}

func NewQuestionsService(store *db.Store) *QuestionsService {
	return &QuestionsService{
		store: store,
	}
}

func (s *QuestionsService) CreateQuestion(c fuego.ContextWithBody[CreateQuestionRequest]) (Question, error) {
	req, err := c.Body()
	if err != nil {
		return Question{}, err
	}

	question, err := s.store.Commands.CreateQuestionForPoll(c.Context(), commands.CreateQuestionForPollParams{
		PollID:   req.PollID,
		Question: req.Question,
		Type:     req.Type,
	})

	if err != nil {
		return Question{}, err
	}

	return Question{
		ID:      question.ID,
		
	}, nil
}
