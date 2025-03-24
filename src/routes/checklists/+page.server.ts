import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { Checklist } from "$lib/types/checklist.js";
import type { Actions } from "@sveltejs/kit";

export const load = async ({locals}) => {
	ensure(locals.permissions).can("list").resource("checklists").error();

	const rows = await sql`
		SELECT id, name FROM checklists
	`;
    const checklists: Checklist[] = rows.map(row => {
        return {
            id: row.id,
            name: row.name,
            todos: []
        };
    });

	return {
		checklists: checklists,
		can_create: ensure(locals.permissions).can("create").resource("checklists").result
	} 
};

export const actions = {
	create: async ({ locals, request }) => {
		ensure(locals.permissions).can("create").resource("checklists").error();
		const data = await request.formData();
		const name = data.get("name")?.toString();

		console.log("NAME:", name);
		if (!name) {
			return {
				status: 400,
				body: {
					error: "invalid_name"
				}
			};
		}
		
		const [row] = await sql`
			INSERT INTO checklists (name)
			VALUES (${name})
			RETURNING id, name
		`;
		return {
			status: 201,
			body: {
				id: row.id,
				name: row.name
			}
		};
	}
} satisfies Actions;