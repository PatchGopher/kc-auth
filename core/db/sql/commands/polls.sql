-- name: CreatePoll :one
INSERT INTO polls (title, template_poll_id)
VALUES ($1, $2)
RETURNING id, title, template_poll_id;

-- name: AssignUserToPoll :one
INSERT INTO users_polls (user_id, poll_id, role)
VALUES ($1, $2, $3)
RETURNING user_id, poll_id, role;

-- name: RemoveUserFromPoll :one
DELETE FROM users_polls
WHERE user_id = $1 AND poll_id = $2
RETURNING user_id, poll_id;

-- name: DeletePoll :one
DELETE FROM polls
WHERE id = $1
RETURNING id, title, template_poll_id;

-- name: UpdatePoll :one
UPDATE polls
SET title = $1, template_poll_id = $2
WHERE id = $3
RETURNING id, title, template_poll_id; 