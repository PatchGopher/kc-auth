-- name: ListQuestionsForPoll :many
SELECT q.id, q.poll_id, q.question, q.type
FROM questions q
WHERE q.poll_id = $1
ORDER BY q.id;

-- name: ListQuestionsForPollWithOptions :many
SELECT q.id, q.poll_id, q.question, q.type,
       o.id AS option_id, o.option, o.position
FROM questions q
LEFT JOIN options o ON q.id = o.question_id
WHERE q.poll_id = $1
ORDER BY q.id, o.position;

-- name: FindQuestion :one
SELECT q.id, q.poll_id, q.question, q.type
FROM questions q
WHERE q.id = $1;

-- name: FindQuestionForPoll :one
SELECT q.id, q.poll_id, q.question, q.type
FROM questions q
WHERE q.poll_id = $1 AND q.id = $2;

-- name: CountQuestionsForPoll :one
SELECT COUNT(*)
FROM questions q
WHERE q.poll_id = $1;

-- name: ListOptionsForQuestion :many
SELECT o.id, o.question_id, o.option, o.position
FROM options o
WHERE o.question_id = $1
ORDER BY o.position;

-- name: FindOption :one
SELECT o.id, o.question_id, o.option, o.position
FROM options o
WHERE o.id = $1;


