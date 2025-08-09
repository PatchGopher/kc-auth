-- name: ListPollsForUser :many
SELECT p.id, p.title, p.template_poll_id,
       up.role
FROM polls p
JOIN users_polls up ON p.id = up.poll_id
WHERE up.user_id = $1
ORDER BY p.title;

-- name: FindPollForUser :one
SELECT p.id, p.title, p.template_poll_id,
       up.role
FROM polls p
JOIN users_polls up ON p.id = up.poll_id
WHERE up.user_id = $1 AND p.id = $2;

-- name: GetUserRoleForPoll :one
SELECT up.role
FROM users_polls up
WHERE up.user_id = $1 AND up.poll_id = $2;  
