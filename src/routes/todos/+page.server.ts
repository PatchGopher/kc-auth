import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { Actions } from './$types';

export const load = async ({locals}) => {
	ensure(locals.permissions).can("list").resource("todos").error();

	const rows = await sql`
		SELECT id, text, completed FROM todos
	`;
	const todos = rows.map(row => {
		return {
			id: row.id,
			text: row.text,
			completed: row.completed
		};
	});

	return {
		todos: todos,
		can_create: ensure(locals.permissions).can("create").resource("todos").result
	};
};

export const actions = {
	create: async ({ locals, request }) => {
		ensure(locals.permissions).can("create").resource("todos")
		const data = await request.formData();
		const text = data.get("text")?.toString();
		if (!text) {
			return {
				status: 400,
				body: {
					error: "invalid_text"
				}
			};
		}

		// interface KeycloakResourceParams {
		// 	id: string | null;
		// 	name: string;
		// 	type: string;
		// 	owner: string;
		// 	scopes: string[];
		// }

		console.log("CREATING IN DATABASE!")
		const [row] = await sql`
			INSERT INTO todos (text, completed)
			VALUES (${text}, false)
			RETURNING id, text, completed
		`;
		return {
			status: 201,
			body: {
				id: row.id,
				text: row.text,
				completed: row.completed
			}
		};
	}
} satisfies Actions;