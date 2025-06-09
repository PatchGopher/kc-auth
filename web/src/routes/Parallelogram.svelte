<!-- GlassCard.svelte -->
<script>
	import { onMount } from 'svelte';

	// Props for the card
	export let width = '800px';
	export let height = '700px';
	export let cardBorderRadius = '12px';
	export let backdrop = 'blur(10px)';

	// Props for the parallelogram background
	export let skewAngle = '15deg';
	export let variant = 1;

	// Function to determine gradient class based on variant
	const getGradientStyle = () => {
		switch (variant) {
			case 1:
				return 'linear-gradient(315deg, #ffbc00, #ff0058)';
			case 2:
				return 'linear-gradient(315deg, #03a9f4, #ff0058)';
			case 3:
				return 'linear-gradient(315deg, #4dff03, #00d0ff)';
			default:
				return 'linear-gradient(315deg, #ffbc00, #ff0058)';
		}
	};

	let container;

	onMount(() => {
		// Optional: Add any dynamic effects or functionality here
	});
</script>

<div class="card-container" style="width: {width}; height: {height};" bind:this={container}>
	<!-- The background parallelogram elements -->
	<div class="parallelogram-background">
		<!-- The visible parallelogram -->
		<div
			class="parallelogram"
			style="
          border-radius: {cardBorderRadius};
          transform: skewX({skewAngle});
          background: {getGradientStyle()};
        "
		></div>

		<!-- The blurred glow element -->
		<div
			class="parallelogram-glow"
			style="
          border-radius: {cardBorderRadius};
          transform: skewX({skewAngle});
          background: {getGradientStyle()};
          filter: blur(30px);
        "
		></div>
	</div>

	<!-- The glass card layer -->
	<div
		class="glass-card dark:bg-slate-50/5 bg-slate-50/50"
		style="
        border-radius: {cardBorderRadius};
        backdrop-filter: {backdrop};
      "
	>
		<!-- Card content goes here -->
		<div class="card-content">
			<slot />
		</div>
	</div>
</div>

<style>

	.card-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 60px 40px;
	}

	.parallelogram-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 70%;
		height: 100%;
		z-index: 0;
	}

	.parallelogram {
		position: absolute;
		top: 20px;
		left: 20px;
		width: 70%;
		height: 90%;
		transition: 0.4s;
		z-index: 1;
	}

	.parallelogram-glow {
		position: absolute;
		top: 30px;
		left: 40px;
		width: 70%;
		height: 90%;
		transition: 0.4s;
		z-index: 0;
	}

	.glass-card {
		position: relative;
		width: 100%;
		height: 70%;
		z-index: 2;
		overflow: hidden;
		transition: transform 0.2s ease;
	}

	.card-content {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 1.5rem;
		z-index: 3;
		display: flex;
		flex-direction: column;
	}

    .card-container:hover .parallelogram,
    .card-container:hover .parallelogram-glow {
		transform: skewX(0deg);
		width: calc(100% - 50px);
	}

	/* .card-container:hover .glass-card {
		transform: translateY(-25px);
	} */
</style>
