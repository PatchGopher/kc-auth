import * as arctic from "arctic";
import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const keycloak = new arctic.KeyCloak(`${env.KEYCLOAK_URL}/realms/${env.KEYCLOAK_REALM}`, "app", "Xj90IKNebTNlRkMNaoXjGO6MZbHkGvvv", "http://localhost:8100/login/keycloak/callback");

export type Permission = {
    rsid: string;
    rsname: string;
    scopes?: string[];
};

export function ensure(permissions: Permission[]) {
  return {
    can: (scope: string) => {
      return {
        resource: (resource: string) => {
          const permission = permissions.find(p => p.rsname === resource);
          const hasAccess = Boolean(
            permission &&
            permission.scopes !== undefined &&
            permission.scopes.includes(scope)
          );

          return {
            error: (status: number = 403, message: string = `Access denied: Cannot ${scope} ${resource}`) => {
              if (!hasAccess) {
                throw error(status, message);
              }
            },
            result: hasAccess
          }
        }
      }
    }
  }
}
