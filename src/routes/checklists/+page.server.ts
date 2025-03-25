import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { Checklist } from "$lib/types/checklist.js";
import { error, type Actions } from "@sveltejs/kit";
import { z } from "zod";

export const load = async ({ locals }) => {
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

const CreateChecklistSchema = z.object({
	name: z.string().nonempty("invalid_name")
});

export const actions = {
	create: async ({ locals, request }) => {
		ensure(locals.permissions).can("create").resource("checklists").error();

		const data = await request.formData();
		const parsedData = CreateChecklistSchema.safeParse({
			name: data.get("name")?.toString()
		});

		if (!parsedData.success) {
			const errorMessage = parsedData.error.errors[0]?.message || "Invalid input";
			error(400, errorMessage);
		}

		const { name } = parsedData.data;

		const [checklist_row] = await sql`
			INSERT INTO checklists (name)
			VALUES (${name})
			RETURNING id, name
		`;

		const relation_owner = 'owner';
		await sql`
			INSERT INTO users_checklists (user_id, checklist_id, relation)
			VALUES (${locals.user.id}, ${checklist_row.id}, ${relation_owner})
			ON CONFLICT DO NOTHING
		`;

		return {
			status: 201,
			body: {
				id: checklist_row.id,
				name: checklist_row.name
			}
		};
	}
} satisfies Actions;