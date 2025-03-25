<script lang="ts">
	import '../app.css';
	let { children, data } = $props();
	import { enhance } from '$app/forms';
</script>

<nav class="flex gap-6 bg-gray-100 p-4">
	<a href="/">Home</a>
	<a href="/todos">Todos</a>
	<a href="/checklists">Checklists</a>
	<span class="flex-grow"></span>
	{#if data.user}
		<form method="POST" action="/">
			<button class="hover:underline hover:cursor-pointer"><span class="text-red-600">Sign out</span> {data.user.name}</button>
		</form>
	{:else}
		<a href="/login/keycloak" class="hover:underline hover:cursor-pointer">Sign in with Keycloak</a>
	{/if}
</nav>

{@render children()}
