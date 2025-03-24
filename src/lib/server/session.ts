import sql from "./db.js";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { RequestEvent } from "@sveltejs/kit";


export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(sessionToken: string, userId: number, accessToken: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		accessToken: accessToken
	};
	await sql`
		INSERT INTO sessions (id, user_id, expires_at, access_token) VALUES (${session.id}, ${session.userId}, ${session.expiresAt}, ${session.accessToken})
    `
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await sql`
		SELECT 
			sessions.id,
			sessions.user_id, 
			sessions.expires_at, 
			sessions.access_token,
			users.username, 
			users.keycloak_id 
		FROM sessions 
		INNER JOIN users ON users.id = sessions.user_id 
		WHERE sessions.id = ${sessionId}
    `
	
	if (row === null) {
		return { session: null, user: null };
	}
	const session: Session = {
		id: row[0].id,
		userId: row[0].user_id,
		expiresAt: row[0].expires_at,
		accessToken: row[0].access_token
	};
	const user: User = {
		id: row[0].users_id,
		name: row[0].username,
		keycloakId: row[0].keycloak_id
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		await sql`DELETE FROM sessions WHERE id = ${session.id}`;
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await sql`
			UPDATE sessions SET expires_at = ${session.expiresAt} WHERE id = ${session.id}
        `
	}
	console.log("CREATED:", session);
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function invalidateAllSessions(userId: number): Promise<void> {
	await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
	accessToken: string;
}

export interface User {
	id: number;
    keycloakId: string;
	name: string;
}


export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		expires: expiresAt,
		path: "/"
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/"
	});

	event.cookies.set("KEYCLOAK_IDENTITY", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/realms/apps/" // Adjust if Keycloak uses a different path
	});
}
