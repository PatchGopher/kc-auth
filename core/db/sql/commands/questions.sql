-- name: CreateQuestionForPoll :one
INSERT INTO questions (poll_id, question, type)
VALUES ($1, $2, $3)
RETURNING id, poll_id, question, type;

-- name: RemoveQuestionFromPoll :one
DELETE FROM questions
WHERE id = $1
RETURNING id, poll_id, question, type;

-- name: CreateOptionForQuestion :one
INSERT INTO options (question_id, option, position)
VALUES ($1, $2, $3)
RETURNING id, question_id, option, position;

-- name: RemoveOptionFromQuestion :one
DELETE FROM options
WHERE id = $1
RETURNING id, question_id, option;