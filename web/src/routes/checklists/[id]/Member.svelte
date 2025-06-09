<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Member } from './member';
	let { member }: { member: Member } = $props();
</script>

<li class="flex gap-2 py-2">
	
	<span>{member.name}</span>
    <span
		class="px-2 text-sm text-white"
		class:bg-green-900={member.relation == 'owner'}
		class:bg-sky-900={member.relation == 'member'}>{member.relation}</span
	>
	<div class="flex-grow"></div>
	<form use:enhance method="POST" action="?/expel_member">
		<input name="user_id" id="user_id" type="hidden" value={member.id} />
		<button
			class="px-2 text-sm text-red-600 hover:cursor-pointer hover:underline"
			>Expel</button
		>
	</form>
</li>
