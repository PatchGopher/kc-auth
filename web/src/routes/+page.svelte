<script>
	import { ChartLine, Paperclip, Star } from 'lucide-svelte';
	import Parallelogram from './Parallelogram.svelte';
</script>

<div class="flex w-full justify-center">
	<div class="flex w-2/3 flex-row gap-2">
		<Parallelogram skewAngle="10deg">
			<div class="flex h-full flex-col justify-between">
				<div class="inline-flex items-center gap-2">
					<Star strokeWidth={1} size={52} />
					<div>
						<h1 class="text-2xl">Polls</h1>
						<p class="text-sm">Check Status of ongoing polls</p>
					</div>
				</div>
				<ul class="flex flex-col gap-2 divide-y divide-white p-2 pt-4 text-lg">
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Annual Employee Survey 2025</h3>
						<p class="text-sm">3 days left | 100 votes</p>
						<p class="text-sm">Lorem ipsum dolor sit amet</p>
					</li>
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Product X Feedback Mai</h3>
						<p class="text-sm">3 days left | 100 votes</p>
						<p class="text-sm">Lorem ipsum dolor sit amet</p>
					</li>
				</ul>
				<a
					href="/polls"
					class="rounded-xl bg-black p-2 text-center text-lg text-white hover:bg-white hover:text-black"
					>See all polls</a
				>
			</div>
		</Parallelogram>
		<Parallelogram skewAngle="-10deg" variant={2}>
			<div class="flex h-full flex-col justify-between">
				<div class="inline-flex items-center gap-2">
					<ChartLine strokeWidth={1} size={52} />
					<div>
						<h1 class="text-2xl">Statistics</h1>
						<p class="text-sm">Analyze the results of your polls</p>
					</div>
				</div>
				<ul class="flex flex-col gap-2 divide-y divide-white p-2 pt-4 text-lg">
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Poll 1</h3>
					</li>
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Poll 2</h3>
					</li>
				</ul>
				<a
					href="/checklists"
					class="rounded-xl bg-black p-2 text-center text-lg text-white hover:bg-white hover:text-black"
					>See all polls</a
				>
			</div>
		</Parallelogram>
		<Parallelogram skewAngle="20deg" variant={3}>
			<div class="flex h-full flex-col justify-between">
				<div class="inline-flex items-center gap-2">
					<ChartLine strokeWidth={1} size={52} />
					<div>
						<h1 class="text-2xl">Statistics</h1>
						<p class="text-sm">See statistics</p>
					</div>
				</div>
				<ul class="flex flex-col gap-2 divide-y divide-white p-2 pt-4 text-lg">
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Poll 1</h3>
						<p class="text-sm">3 days left | 100 votes</p>
						<p class="text-sm">Lorem ipsum dolor sit amet</p>
					</li>
					<li class="pb-2">
						<h3 class="text-lg font-semibold">Poll 2</h3>
						<p class="text-sm">3 days left | 100 votes</p>
						<p class="text-sm">Lorem ipsum dolor sit amet</p>
					</li>
				</ul>
				<a
					href="/templates"
					class="rounded-xl bg-black p-2 text-center text-lg text-white hover:bg-white hover:text-black"
					>Manage templates</a
				>
			</div>
		</Parallelogram>
	</div>
</div>

<!-- <div class="aspect-square h-50 bg-amber-800"></div>
<div class="aspect-square h-50 bg-amber-800"></div>
<div class="aspect-square h-50 bg-amber-800"></div>
<div class="aspect-square h-50 bg-amber-800"></div>
<div class="aspect-square h-50 bg-amber-800"></div>
<div class="aspect-square h-50 bg-amber-800"></div> -->
