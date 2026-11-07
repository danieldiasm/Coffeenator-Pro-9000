<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';
	import { customSections } from '$lib/data/project';
</script>

<!--
  SVELTE 5 LEARNING NOTE:
  This component loops over `customSections` from `src/lib/data/project.ts`.
  Whenever you want a brand-new section on your site (e.g., "BOM / Parts List",
  "PCB Schematics", or "3D Printed Mounts"), just add an object to `customSections`!
-->
{#each customSections as section, idx (section.id)}
	<section id={section.id} class="section-block">
		<SectionHeader
			badge={`SECTION 0${idx + 4} // ${section.badge}`}
			title={section.title}
			subtitle={section.subtitle}
		/>

		<div class="custom-grid">
			{#each section.cards as card (card.title)}
				<article class="custom-card">
					{#if card.tag}
						<span class="card-tag">{card.tag}</span>
					{/if}
					<h3>{card.title}</h3>
					<p>{card.body}</p>

					{#if card.items && card.items.length > 0}
						<ul class="card-list">
							{#each card.items as item}
								<li>{item}</li>
							{/each}
						</ul>
					{/if}
				</article>
			{/each}
		</div>
	</section>
{/each}

<style>
	.section-block {
		padding: 4rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.custom-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1.35rem;
	}

	.custom-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.9rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
	}

	.card-tag {
		align-self: flex-start;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
		color: #fbbf24;
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.28);
		padding: 0.2rem 0.55rem;
		border-radius: 0.35rem;
		margin-bottom: 0.75rem;
	}

	.custom-card h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.2rem;
		color: #fafaf9;
		margin: 0 0 0.55rem 0;
	}

	.custom-card p {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #a8a29e;
		margin: 0 0 1.1rem 0;
	}

	.card-list {
		margin: auto 0 0 0;
		padding: 0.9rem 0 0 1.15rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		font-size: 0.84rem;
		color: #d6d3d1;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		line-height: 1.45;
	}

	.card-list li::marker {
		color: #f59e0b;
	}
</style>
