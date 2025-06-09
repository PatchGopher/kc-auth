<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<div class="space-y-2 p-4">
	<div class="flex items-end gap-4">
		<h1 class="text-xl">Checklists</h1>
		<a href="/" class="hover:underline"> Go back to home</a>
	</div>
	{#if data.can_create}
		<form use:enhance method="POST" action="?/create" class="flex gap-2">
			<input name="name" class=" bg-surface border-surface-b focus:border-neutral-600 focus:ring-0" type="text" placeholder="Add a new checklist" />

			<button
				type="submit"
				class="border px-4 hover:cursor-pointer border-surface-b hover:border-neutral-600 hover:text-white"
			>
				Add Checklist
			</button>
		</form>
	{:else}
		<p> 
			You don't have permission to create checklists |
			<a href="/login/keycloak" class="hover:underline">Request Permission</a>
		</p>
	{/if}
	{#if data.checklists.length === 0}
		<p>No checklists found</p>
	{:else}
		<ul class="max-w-xl divide-y-1 divide-surface-b">
			{#each data.checklists as checklist (checklist.id)}
				<li class="flex justify-between gap-6 p-2">
                    <a href="checklists/{checklist.id}">{checklist.name}</a>
					<form use:enhance method="POST" action="?/delete" class="flex gap-2">
						<input name="checklist_id" type="hidden" value={checklist.id} />
						<button
							type="submit"
							class="hover:cursor-pointer hover:underline text-red-600"
						>
							Delete
						</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}
</div>