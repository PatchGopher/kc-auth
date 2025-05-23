<script lang="ts">
	import { Check, Square } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import Member from './Member.svelte';
	import AddMemberForm from './AddMemberForm.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-row gap-16 space-y-2 p-4">
	<div class="flex flex-col gap-2">
		<div class="flex items-end gap-4">
			<h1 class="text-xl">{data.checklist.name}</h1>
			<a href="/" class="hover:underline"> Go back to home</a>
		</div>
		{#if data.can_create}
			<form use:enhance method="POST" action="?/add_todo" class="flex gap-2">
				<input name="checklist_id" type="hidden" value={data.checklist.id} />
				<input name="text" type="text" placeholder="Add a new todo" class="bg-surface border border-surface-b focus:border-neutral-600 focus:ring-0" />

				<button
					type="submit"
					class="border border-surface-b px-4 hover:cursor-pointer hover:border-neutral-600 hover:text-white"
				>
					Add Todo
				</button>
			</form>
		{:else}
			<p class="">
				You don't have permission to create todos |
				<a href="/login/keycloak" class="hover:underline">Request Permission</a>
			</p>
		{/if}
		{#if data.checklist.todos.length === 0}
			<p>No todos found</p>
		{:else}
			<ul class="w-xl divide-y divide-surface-b">
				{#each data.checklist.todos as todo (todo.id)}
					<li class="flex gap-2 pb-1 pt-2">
						<form use:enhance method="POST" action="?/complete_todo">
							<input name="id" type="hidden" value={todo.id} />
							<button type="submit" class="hover:cursor-pointer">
								{#if todo.completed}
									<Check strokeWidth={2} />
								{:else}
									<Square strokeWidth={1} />
								{/if}
							</button>
						</form>
						<span style="text-decoration: {todo.completed ? 'line-through' : 'none'}"
							>{todo.text}</span
						>
						<div class="flex-grow"></div>
						<form use:enhance method="POST" action="?/delete">
							<input name="id" type="hidden" value={todo.id}  />
							<button
								class="text-sm text-red-600 hover:cursor-pointer hover:underline"
								>Delete</button
							>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex items-end gap-4">
			<h1 class="text-xl">Members</h1>
			<p>You are {data.role?.relation}</p>
		</div>
		{#if data.can_create}
			<AddMemberForm potential_members={data.potential_members} checklist_id={data.checklist.id}/>
		{:else}
			<p class="">
				You don't have permission to add members |
				<a href="/login/keycloak" class="hover:underline">Request Permission</a>
			</p>
		{/if}
		{#if data.members.length === 0}
			<p>No members found</p>
		{:else}
			<ul class="w-xl divide-y divide-surface-b">
				{#each data.members as member (member.id)}
					<Member {member} />
				{/each}
			</ul>
		{/if}
	</div>
</div>
