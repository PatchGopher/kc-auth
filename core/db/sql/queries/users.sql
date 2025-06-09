-- name: FindSession :one
SELECT s.id, s.user_id, s.expires_at
FROM sessions s
WHERE s.id = $1;

-- name: FindActiveSession :one
SELECT s.id, s.user_id, s.expires_at
FROM sessions s
WHERE s.id = $1 AND s.expires_at > NOW();