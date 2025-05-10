<script lang="ts">
	import '../app.css';
	let { children, data } = $props();
</script>

<nav class="bg-surface flex gap-6 p-4 border-b border-surface-b">
	<a class="hover:cursor-pointer hover:underline" href="/">Home</a>
	<a class="hover:cursor-pointer hover:underline" href="/todos">Todos</a>
	<a class="hover:cursor-pointer hover:underline" href="/checklists">Checklists</a>
	<a class="hover:cursor-pointer hover:underline" href="/arm">ARM</a>
	<span class="flex-grow"></span>
	{#if data.user}
		<form method="POST" action="/">
			<button class="hover:cursor-pointer hover:underline"
				><span class="text-red-600">Sign out</span> {data.user.name}</button
			>
		</form>
	{:else}
		<a href="/login/keycloak" class="hover:cursor-pointer hover:underline">Sign in with Keycloak</a>
	{/if}
</nav>

{@render children()}
