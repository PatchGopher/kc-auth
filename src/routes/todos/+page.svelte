<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let todos = $state(data.todos);
	let newTodo = $state('');

	const remove = (id: number) => {
		todos = todos.filter((todo) => todo.id !== id);
	};

	const complete = (id: number) => {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				todo.completed = !todo.completed;
			}
			return todo;
		});
	};
</script>

<div class="space-y-2 p-4">
	<div class="flex items-end gap-4">
		<h1 class="text-xl">Todo List</h1>
		<a href="/" class="text-blue-600 hover:underline"> Go back to home</a>
	</div>
	{#if data.can_create}
		<form method="POST" action="?/create" class="flex gap-2">
			<input name="text" type="text" placeholder="Add a new todo" />

			<button
				type="submit"
				class="border px-4 hover:cursor-pointer hover:border-blue-600 hover:text-blue-600"
			>
				Add Todo
			</button>
		</form>
	{:else}
		<p class=""> 
			You don't have permission to create todos |
			<a href="/login/keycloak" class="text-blue-600 hover:underline">Request Permission</a>
		</p>
	{/if}
	{#if todos.length === 0}
		<p>No todos found</p>
	{:else}
		<ul class="w-xl">
			{#each todos as todo (todo.id)}
				<li class="flex items-center gap-2 border-b border-gray-200 p-2">
					<input type="checkbox" onclick={() => complete(todo.id)} />
					<span style="text-decoration: {todo.completed ? 'line-through' : 'none'}"
						>{todo.text}</span
					>
					<div class="flex-grow"></div>
					<button
						class=" border px-2 text-sm text-red-600 hover:cursor-pointer"
						onclick={() => remove(todo.id)}>Delete</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>
