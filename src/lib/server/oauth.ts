import * as arctic from "arctic";
import { error } from "@sveltejs/kit";

export const keycloak = new arctic.KeyCloak("http://localhost:8400/realms/apps", "app", "Xj90IKNebTNlRkMNaoXjGO6MZbHkGvvv", "http://localhost:8100/login/keycloak/callback");

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
          console.log(permission)
          const hasAccess = Boolean(
            permission &&
            permission.scopes !== undefined &&
            permission.scopes.includes(scope)
          );

          keycloak.refreshAccessToken

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