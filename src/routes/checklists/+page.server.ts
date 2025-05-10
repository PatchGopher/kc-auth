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
	},
	delete: async ({ locals, request }) => {
		ensure(locals.permissions).can("delete").resource("checklists").error();

		const data = await request.formData();
		console.log("data", data);
		const checklistId = data.get("checklist_id")?.toString();

		if (!checklistId) {
			throw error(400, "Invalid checklist ID");
		}

		// Check if the checklist's owner is the current user
		const [checklist_row] = await sql`
			SELECT id FROM checklists
			WHERE id = ${checklistId}
		`;
		if (!checklist_row) {
			throw error(404, "Checklist not found");
		}
		const [relation_row] = await sql`
			SELECT relation FROM users_checklists
			WHERE user_id = ${locals.user.id}
			AND checklist_id = ${checklistId}
		`;
		console.log("relation_row", locals.user.id, checklistId, relation_row);
		if (!relation_row) {
			throw error(403, "You do not have permission to delete this checklist due to missing relation");
		}
		if (relation_row.relation !== 'owner') {
			throw error(403, "You do not have permission to delete this checklist due to missing owner relation");
		}

		await sql`
			DELETE FROM checklists
			WHERE id = ${checklistId}
		`;

		return {
			status: 200,
			body: {
				message: "Checklist deleted successfully"
			}
		};
	}
} satisfies Actions;