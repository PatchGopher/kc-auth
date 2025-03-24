// routes/login/keycloak/callback/+server.ts
import { generateSessionToken, createSession, setSessionTokenCookie, type User } from "$lib/server/session";
import { keycloak } from "$lib/server/oauth";
import { decodeIdToken } from "arctic";
import sql from "$lib/server/db";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";


export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("keycloak_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("keycloak_code_verifier") ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await keycloak.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const claims = decodeIdToken(tokens.idToken());
	const keycloakUserId = claims.sub;
	const username = claims.name;

	// TODO: Replace this with your own DB query.
	const existingUser = await getUserFromKeycloakId(keycloakUserId);

	if (existingUser !== null) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id, tokens.accessToken());
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	// TODO: Replace this with your own DB query.
	const user = await createUser(keycloakUserId, username);

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, tokens.accessToken());
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/"
		}
	});
}


async function getUserFromKeycloakId(keycloakUserId: string): Promise<User | null> {
	const row = await sql`
        SELECT id, username, keycloak_id FROM users WHERE keycloak_id = ${keycloakUserId}
    `;
	if (row.length === 0) {
		return null;
	}
	return {
		id: row[0].id,
		name: row[0].username,
		keycloakId: row[0].keycloak_id
	};
}

async function createUser(keycloakUserId: string, username: string): Promise<User> {
	const row = await sql`
        INSERT INTO users (username, keycloak_id) VALUES (${username}, ${keycloakUserId})
        RETURNING id, username, keycloak_id
    `;
	return {
		id: row[0].id,
		name: row[0].username,
		keycloakId: row[0].keycloak_id
	};
}