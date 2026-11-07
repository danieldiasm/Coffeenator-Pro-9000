<script lang="ts">
	/**
	 * SVELTE 5 LEARNING NOTE:
	 * `$props()` is how a child component receives inputs from its parent in Svelte 5.
	 * We can provide default values using standard JavaScript destructuring (`subtitle = ''`).
	 */
	interface Props {
		id?: string;
		badge: string;
		title: string;
		subtitle?: string;
	}

	let { id = '', badge, title, subtitle = '' }: Props = $props();
</script>

<div class="section-header" {id}>
	<div class="badge-row">
		<span class="pulse-dot"></span>
		<span class="badge-text">{badge}</span>
	</div>
	<h2 class="section-title">{title}</h2>
	{#if subtitle}
		<p class="section-subtitle">{subtitle}</p>
	{/if}
</div>

<style>
	.section-header {
		margin-bottom: 2.25rem;
	}

	.badge-row {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.75rem;
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 999px;
		margin-bottom: 0.85rem;
	}

	.pulse-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #f59e0b;
		box-shadow: 0 0 8px #f59e0b;
	}

	.badge-text {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fbbf24;
	}

	.section-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: clamp(1.75rem, 3vw, 2.35rem);
		font-weight: 700;
		color: #fafaf9;
		margin: 0 0 0.65rem 0;
		letter-spacing: -0.02em;
	}

	.section-subtitle {
		font-size: 1.02rem;
		line-height: 1.65;
		color: #a8a29e;
		max-width: 68ch;
		margin: 0;
	}
</style>
