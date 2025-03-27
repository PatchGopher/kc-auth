<script lang="ts">
	import { enhance } from "$app/forms";
	import type { Member } from "./member";
    let { checklist_id, potential_members }: { checklist_id: number, potential_members: Member[] } = $props();
</script>

<form use:enhance method="POST" action="?/add_member" class="flex gap-2">
    <input name="checklist_id" type="hidden" value={checklist_id} />
    <select class="w-80" id="user_id" name="user_id" placeholder="Add a new Member">
        {#each potential_members as member}
            <option value={member.id}>{member.name}</option>
        {/each}
    </select>

    <button
        type="submit"
        class="border px-4 hover:cursor-pointer hover:border-blue-600 hover:text-blue-600"
    >
        Add Member
    </button>
</form>