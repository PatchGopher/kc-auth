import { generateState, generateCodeVerifier } from "arctic";
import { keycloak } from "$lib/server/oauth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
	console.log("LOGIN")
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "profile"];
    const url = keycloak.createAuthorizationURL(state, codeVerifier, scopes);

	event.cookies.set("keycloak_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax"
	});
	event.cookies.set("keycloak_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax"
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
