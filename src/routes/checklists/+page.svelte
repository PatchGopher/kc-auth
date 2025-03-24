

<script lang="ts">
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<div class="space-y-2 p-4">
	<div class="flex items-end gap-4">
		<h1 class="text-xl">Checklists</h1>
		<a href="/" class="text-blue-600 hover:underline"> Go back to home</a>
	</div>
	{#if data.can_create}
		<form method="POST" action="?/create" class="flex gap-2">
			<input name="name" type="text" placeholder="Add a new checklist" />

			<button
				type="submit"
				class="border px-4 hover:cursor-pointer hover:border-blue-600 hover:text-blue-600"
			>
				Add Checklist
			</button>
		</form>
	{:else}
		<p class=""> 
			You don't have permission to create checklists |
			<a href="/login/keycloak" class="text-blue-600 hover:underline">Request Permission</a>
		</p>
	{/if}
	{#if data.checklists.length === 0}
		<p>No checklists found</p>
	{:else}
		<ul class="w-xl">
			{#each data.checklists as checklist (checklist.id)}
				<li class="flex items-center gap-2 border-b border-gray-200 p-2 hover:bg-gray-100">
                    <a href="checklists/{checklist.id}">{checklist.name}</a>
					<div class="flex-grow"></div>
					<button
						class=" border px-2 text-sm text-red-600 hover:cursor-pointer"
						onclick={() => remove(checklist.id)}>Delete</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>



