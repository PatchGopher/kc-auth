<script lang="ts">
    const { user } = $props();
</script>

<div>
{#if user}
	<form method="POST" action="/">
		<button class="hover:cursor-pointer hover:underline"
			><span class="text-red-600">Sign out</span> {user.name}</button
		>
	</form>
{:else}
	<a href="/login/keycloak" class="hover:cursor-pointer hover:underline">Sign in with Keycloak</a>
{/if}
</div>
