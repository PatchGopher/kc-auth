import type { User } from "$lib/server/user";
import type { Session } from "$lib/server/session";

// Permissions JSON
// [
// 	{
// 	  rsid: '929e1364-6b60-42ae-ab03-c705efc84d9c',
// 	  rsname: 'Default Resource'
// 	},
// 	{
// 	  scopes: [ 'list' ],
// 	  rsid: 'ded27c23-f85d-436c-bfcb-e6fb00ceb4a0',
// 	  rsname: 'todos'
// 	}
// ]

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
			permissions: Permission[];
		}
	}
}

export {};
