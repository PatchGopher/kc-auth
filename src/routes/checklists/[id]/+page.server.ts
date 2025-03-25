import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { Checklist } from "$lib/types/checklist.js";
import { error, type Actions } from "@sveltejs/kit";
import { z } from "zod";

const LoadParamsSchema = z.object({
    id: z.string().nonempty("invalid_id")
});

const CreateTodoSchema = z.object({
    user_id: z.number(),
    checklist_id: z.number(),
    text: z.string().nonempty("invalid_text")
});


export const load = async ({ params, locals }) => {
    ensure(locals.permissions).can("list").resource("todos").error();
    const checklist_id = Number(params.id)
    const allowed_relations = ["owner", "member"]
    if(!await ensure_relationship(locals.user.id, checklist_id, allowed_relations)) {
        throw error(403, `Insuficient relationship | You are neither of these: ${allowed_relations}`);
    }

    const checklist_rows = await sql`
        SELECT id, name FROM checklists
        WHERE id = ${checklist_id}
    `;
    const todo_rows = await sql`
        SELECT id, text, completed FROM todos
        WHERE checklist_id = ${checklist_id}
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
        ensure(locals.permissions).can("create").resource("todos");

        const data = await request.formData();
        const parsedData = CreateTodoSchema.safeParse({
            user_id: locals.user.id,
            checklist_id: Number(data.get("checklist_id")),
            text: data.get("text")
        });

        if (!parsedData.success) {
            const errorMessage = parsedData.error.errors[0]?.message || "Invalid input";
            throw error(400, errorMessage);
        }

        const validated = parsedData.data;
        const allowed_relations = ["owner"]
        if(!await ensure_relationship(validated.user_id, validated.checklist_id, allowed_relations)) {
            throw error(403, `Insuficient relationship | You are neither of these: ${allowed_relations}`);
        }

        const [todos_row] = await sql`
            INSERT INTO todos (text, completed, checklist_id)
            VALUES (${validated.text}, false, ${validated.checklist_id})
            RETURNING id, text, completed, checklist_id
        `;

        return {
            status: 201,
            body: {
                id: todos_row.id,
                text: todos_row.text,
                completed: todos_row.completed
            }
        };
    },

    complete: async ({ locals, request }) => {
        ensure(locals.permissions).can("check").resource("todos").error();

        const data = await request.formData();
        const todo_id = Number(data.get("id"))

        const [row] = await sql`
            UPDATE todos
            SET completed = NOT completed
            WHERE id = ${todo_id}
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

const ensure_relationship = async (user_id: number, checklist_id: number, allowed: string[]): Promise<boolean> => {
    const [users_checklists_row] = await sql`
        SELECT * FROM users_checklists
        WHERE user_id = ${user_id}
        AND checklist_id = ${checklist_id}
    `;
    if (!users_checklists_row) return false 
    if (!users_checklists_row.relation) return false
    return allowed.includes(users_checklists_row.relation)
}