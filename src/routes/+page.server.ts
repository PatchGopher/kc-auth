import { fail, redirect, type Actions } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";

export const actions: Actions = {
    default: async (event) => {
        console.log("LOGOUT")
        event.cookies.delete('keycloak_code_verifier', { 
            path: '/',
            domain: event.url.hostname 
        });
        event.cookies.delete('keycloak_oauth_state', { 
            path: '/',
            domain: event.url.hostname 
        });
        if (event.locals.session === null) {
            return fail(401);
        }
        console.log(event.locals.session);
        await invalidateSession(event.locals.session.id);
        deleteSessionTokenCookie(event);
        return redirect(302, "/");
    }
};
