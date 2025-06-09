<script lang="ts">
	import { Star } from 'lucide-svelte';
	import '../app.css';
	import SignIn from './SignIn.svelte';
	let { children, data } = $props();
</script>

<header
	class="border-surface fixed z-10 flex w-full flex-row justify-center border-b bg-zinc-950/70 p-3 backdrop-blur"
>
	<nav class="flex w-2/3 flex-row items-center gap-8">
		<a class="inline-flex items-center gap-2 text-lg" href="/">
			<Star strokeWidth={1} size={32} />
			<h1>Firepoll</h1>
		</a>

		<div class="flex-grow"></div>
		<a class="hover:cursor-pointer hover:underline" href="/">Home</a>
		<a class="hover:cursor-pointer hover:underline" href="/checklists">Checklists</a>
		<a class="hover:cursor-pointer hover:underline" href="localhost:8500">Grafana</a>

		<SignIn user={data.user} />
	</nav>
</header>

<div class="h-14"></div>
{@render children()}
