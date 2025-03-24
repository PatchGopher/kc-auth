import * as arctic from "arctic";
import { error } from "@sveltejs/kit";

export const keycloak = new arctic.KeyCloak("http://localhost:8080/realms/apps", "app", "H8xwdJkY3qhcnKgbwBY87mYHJvrckEiZ", "http://localhost:5173/login/keycloak/callback");

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

          console.log("REQUESTED:", scope, resource);
          console.log("PERMISSIONS:", permissions);
          console.log("ACCESS:", hasAccess);

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