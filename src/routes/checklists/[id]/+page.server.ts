import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { Checklist } from "$lib/types/checklist.js";
import { error, type Actions } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
    const id = params.id;
    ensure(locals.permissions).can("list").resource("todos").error();

    const checklist_rows = await sql`
        SELECT id, name FROM checklists
        WHERE id = ${id}
    `;

    const todo_rows = await sql`
        SELECT id, text, completed FROM todos
        WHERE checklist_id = ${id}
    `;

    const checklist: Checklist = {
        id: checklist_rows[0].id,
        name: checklist_rows[0].name,
        todos: todo_rows.map(row => {
            return {
                id: row.id,
                text: row.text,
                completed: row.completed
            };
        })
    };

    return {
        checklist: checklist,
        can_create: ensure(locals.permissions).can("create").resource("todos").result
    };

}

export const actions = {
    create: async ({ locals, request }) => {
        ensure(locals.permissions).can("create").resource("todos")
        const data = await request.formData();
        const checklist_id = data.get("checklist_id")?.toString();
        const text = data.get("text")?.toString();

        if (!text || !checklist_id) {
            return {
                status: 400,
                body: {
                    error: "invalid_text"
                }
            };
        }

        const [row] = await sql`
			INSERT INTO todos (text, completed, checklist_id)
			VALUES (${text}, false, ${checklist_id})
			RETURNING id, text, completed, checklist_id
		`;
        return {
            status: 201,
            body: {
                id: row.id,
                text: row.text,
                completed: row.completed
            }
        };
    },

    complete: async ({ locals, request }) => {
        ensure(locals.permissions).can("check").resource("todos").error();
        const data = await request.formData();
        const id = data.get("id")?.toString() ?? error(400, "invalid_id");

        if (!id) {
            error(400, "invalid_id");
        }

        //set opposite completed value
        const [row] = await sql`
            UPDATE todos
            SET completed = NOT completed
            WHERE id = ${id}
            RETURNING id, text, completed
        `;

        return {
            status: 200,
            body: {
                id: row.id,
                text: row.text,
                completed: row.completed
            }
        };
    }
} satisfies Actions;