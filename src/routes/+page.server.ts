import { fail, redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";

import type { Actions } from "./$types";

export const actions: Actions = {
    default: async (event) => {
        if (event.locals.session === null) {
            return fail(401);
        }
        console.log(event.locals.session);
        await invalidateSession(event.locals.session.id);
        deleteSessionTokenCookie(event);
        return redirect(302, "/");

    }
};
