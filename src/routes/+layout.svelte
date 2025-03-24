<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { enhance } from "$app/forms";
</script>

<nav class="flex gap-6 p-4 bg-gray-100">
	<a href="/">Home</a>
	<a href="/todos">Todos</a>
	<a href="/checklists">Checklists</a>
	<span class="flex-grow"></span>
	<a href="/login/keycloak">Login with Keycloak</a>
	<form method="post" use:enhance>
		<button class="text-red-600">Sign out</button>
	</form>

</nav>



{@render children()}

