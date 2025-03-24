import type { Permission } from "$lib/server/oauth";
import {
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from "./lib/server/session";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session") ?? null;
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.permissions = [];
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);

	let permissions: Permission[] = [];
	if (session !== null) {
		// const response = await fetch(
		// 	`http://localhost:8080/realms/apps/protocol/openid-connect/token`,
		// 	{
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/x-www-form-urlencoded',
		// 		},
		// 		body: new URLSearchParams({
		// 			grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
		// 			audience: 'app',
		// 			client_id: 'app',
		// 			client_secret: 'H8xwdJkY3qhcnKgbwBY87mYHJvrckEiZ',
		// 			response_mode: 'permissions', 
		// 			subject_token: session.accessToken,
		// 		})
		// 	}
		// );
	
		// setSessionTokenCookie(event, token, session.expiresAt);
		// if (response.status === 200)
		// 	permissions = await response.json();
		// else
		// 	permissions = [];

		permissions = [
			{
			  rsid: '929e1364-6b60-42ae-ab03-c705efc84d9c',
			  rsname: 'Default Resource'
			},
			{
			  scopes: [ 'create', 'list' ],
			  rsid: 'a06f9f9e-2313-4365-814c-f540712c3aec',
			  rsname: 'checklists'
			},
			{
			  scopes: [ 'create', 'check', 'list', 'delete' ],
			  rsid: 'ded27c23-f85d-436c-bfcb-e6fb00ceb4a0',
			  rsname: 'todos'
			}
		  ];

	} else {
		deleteSessionTokenCookie(event);
	}



	event.locals.session = session;
	event.locals.user = user;
	event.locals.permissions = permissions;
	return resolve(event);
};
