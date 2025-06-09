import sql from "$lib/server/db";
import { ensure } from "$lib/server/oauth";
import type { User } from "$lib/server/session.js";
import type { Checklist } from "$lib/types/checklist.js";
import { error, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import type { Member } from "./member";

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
    const member_rows = await sql`
        SELECT users_checklists.user_id, users.username, users_checklists.relation
        FROM users_checklists
        JOIN users ON users_checklists.user_id = users.id
        WHERE checklist_id = ${checklist_id}
    `
    const potential_member_rows = await sql`
        SELECT id, username FROM users
        WHERE id NOT IN (
            SELECT user_id FROM users_checklists
            WHERE checklist_id = ${checklist_id}
        )
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


    const potential_members: Member[] = potential_member_rows.map(pmr => {
        return {
            id: pmr.id,
            name: pmr.username,
            relation: "none"
        } as Member
    })
    const members: Member[] = member_rows.map(mr => {
        return {
            id: mr.user_id,
            name: mr.username,
            relation: mr.relation
        } as Member
    })
    return {
        members: members,
        potential_members: potential_members,
        checklist: checklist,
        role: members.find(m => m.id == locals.user?.id),
        can_create: ensure(locals.permissions).can("create").resource("todos").result
    };
}

export const actions = {
    add_todo: async ({ locals, request, params }) => {
        ensure(locals.permissions).can("create").resource("todos");

        const data = await request.formData();
        const parsedData = CreateTodoSchema.safeParse({
            user_id: locals.user.id,
            checklist_id: Number(params.id),
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

    complete_todo: async ({ locals, request }) => {
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
    },

    add_member: async ({ locals, request, params }) => {
        ensure(locals.permissions).can("create").resource("todos");

        const data = await request.formData();
        const checklist_id = Number(params.id)
        const user_id = Number(data.get("user_id"))
        const relation = "member"

        console.log({checklist_id, user_id, relation})

        const allowed_relations = ["owner"]
        if(!await ensure_relationship(locals.user.id, checklist_id, allowed_relations)) {
            throw error(403, `Insuficient relationship | You are neither of these: ${allowed_relations}`);
        }

        const [users_checklists_row] = await sql`
            INSERT INTO users_checklists (user_id, checklist_id, relation)
            VALUES (${user_id}, ${checklist_id}, ${relation})
            ON CONFLICT DO NOTHING
            RETURNING user_id, checklist_id, relation
        `;

        return {
            status: 201,
            body: {
                user_id: users_checklists_row.user_id,
                checklist_id: users_checklists_row.checklist_id,
                relation: users_checklists_row.relation
            }
        };
    },

    expel_member: async ({ locals, request, params }) => {
        ensure(locals.permissions).can("delete").resource("todos");

        const data = await request.formData();
        const checklist_id = params.id
        console.log("CHECKLIST ID", checklist_id)
        const user_id = Number(data.get("user_id"))

        const allowed_relations = ["owner"]
        if(!await ensure_relationship(locals.user.id, checklist_id, allowed_relations)) {
            throw error(403, `Insuficient relationship | You are neither of these: ${allowed_relations}`);
        }

        console.log(user_id, checklist_id)

        await sql`
            DELETE FROM users_checklists
            WHERE user_id = ${user_id}
            AND checklist_id = ${checklist_id}
        `;

        return {
            status: 204,
            body: {
                user_id: user_id,
                checklist_id: checklist_id
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
    console.log(user_id, checklist_id, users_checklists_row, allowed)
    if (!users_checklists_row) return false 
    if (!users_checklists_row.relation) return false
    return allowed.includes(users_checklists_row.relation)
}