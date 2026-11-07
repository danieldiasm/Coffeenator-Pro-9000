<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';
	import { projectMeta, projectStory, stockVsUpgrade } from '$lib/data/project';

	/**
	 * SVELTE 5 LEARNING NOTE:
	 * `$state()` creates reactive state. When `selectedFilter` changes via a button click,
	 * `$derived()` automatically recalculates `filteredRows` and updates the DOM.
	 */
	let selectedFilter = $state<'all' | 'new' | 'upgraded' | 'retained'>('all');

	let filteredRows = $derived(
		selectedFilter === 'all'
			? stockVsUpgrade
			: stockVsUpgrade.filter((row) => row.status === selectedFilter)
	);
</script>

<!-- HERO BANNER -->
<section class="hero">
	<div class="hero-grid">
		<div class="hero-content">
			<div class="status-pill">
				<span class="status-led"></span>
				<span class="status-label">{projectMeta.status}</span>
				<span class="status-divider">|</span>
				<span class="status-machine">{projectMeta.baseMachine}</span>
			</div>

			<h1 class="hero-title">
				{projectMeta.title}
				<span class="accent-block">Smart Hardware Retrofit</span>
			</h1>

			<p class="hero-tagline">{projectMeta.tagline}</p>

			<div class="hero-cta-row">
				<a href="#progression" class="btn-primary">View Build Progression →</a>
				<a href="#requirements" class="btn-secondary">Explore Specs & Requirements</a>
			</div>
		</div>

		<!-- PCB / Hardware Telemetry Card -->
		<div class="pcb-card" aria-label="Hardware Retrofit Summary">
			<div class="pcb-header">
				<span class="pcb-id">BOARD // {projectMeta.codename}</span>
				<span class="pcb-rev">REV 2.0 RETROFIT</span>
			</div>
			<div class="pcb-diagram">
				<div class="diagram-node danger">
					<span class="node-tag">OEM MAINBOARD</span>
					<strong>BURNT / DECOMMISSIONED</strong>
					<small>Replaced with isolated AC/DC + SSR stage</small>
				</div>
				<div class="diagram-arrow">↓ RETROFIT BUS ↓</div>
				<div class="diagram-node active">
					<span class="node-tag">ESP32 SMART CONTROLLER</span>
					<strong>WI-FI + TELEMETRY + PID WARMING</strong>
					<small>NTC Temp • Water Level • Carafe Switch • MQTT</small>
				</div>
			</div>
			<div class="quick-specs-grid">
				{#each projectMeta.quickSpecs as spec (spec.label)}
					<div class="spec-box">
						<span class="spec-label">{spec.label}</span>
						<strong class="spec-val">{spec.value}</strong>
						<span class="spec-detail">{spec.detail}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- PROJECT OVERVIEW SECTION -->
<section id="project" class="section-block">
	<SectionHeader
		badge="SECTION 01 // PROJECT OVERVIEW"
		title="From Fried Mainboard to Connected Coffee Station"
		subtitle="Why throw away a great coffee brewer when only the control board died? Here is the story behind the Melitta Excellent rescue and upgrade."
	/>

	<div class="story-grid">
		{#each projectStory as block (block.id)}
			<article class="story-card">
				<span class="story-badge">{block.badge}</span>
				<h3>{block.title}</h3>
				<p>{block.description}</p>
				<ul class="highlight-list">
					{#each block.highlights as point}
						<li>{point}</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>

	<!-- STOCK VS UPGRADE COMPARISON -->
	<div class="comparison-card">
		<div class="comparison-header">
			<div>
				<span class="sub-eyebrow">SUBSYSTEM BREAKDOWN</span>
				<h3>Stock Melitta Excellent vs. Coffeenator Pro 9000</h3>
			</div>
			<div class="filter-pills" role="group" aria-label="Filter subsystem changes">
				<button
					type="button"
					class:active={selectedFilter === 'all'}
					onclick={() => (selectedFilter = 'all')}
				>
					All ({stockVsUpgrade.length})
				</button>
				<button
					type="button"
					class:active={selectedFilter === 'new'}
					onclick={() => (selectedFilter = 'new')}
				>
					New Sensors & Wireless
				</button>
				<button
					type="button"
					class:active={selectedFilter === 'upgraded'}
					onclick={() => (selectedFilter = 'upgraded')}
				>
					Upgraded Hardware
				</button>
				<button
					type="button"
					class:active={selectedFilter === 'retained'}
					onclick={() => (selectedFilter = 'retained')}
				>
					Retained Safety
				</button>
			</div>
		</div>

		<div class="table-scroll">
			<table class="spec-table">
				<thead>
					<tr>
						<th>Subsystem</th>
						<th>Stock Melitta Excellent</th>
						<th>Coffeenator Pro 9000 Upgrade</th>
						<th>Change Type</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRows as row (row.subsystem)}
						<tr>
							<td class="col-sub">{row.subsystem}</td>
							<td class="col-stock">{row.stockMelitta}</td>
							<td class="col-upgrade">{row.coffeenatorUpgrade}</td>
							<td>
								<span class="status-tag {row.status}">
									{row.status.toUpperCase()}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: 3.5rem 0 3rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hero-grid {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 2.5rem;
		align-items: center;
	}

	.status-pill {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.12);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: #e7e5e4;
		margin-bottom: 1.25rem;
	}

	.status-led {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
	}

	.status-divider {
		color: rgba(255, 255, 255, 0.25);
	}

	.status-machine {
		color: #fbbf24;
	}

	.hero-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: clamp(2.25rem, 4.5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.03em;
		color: #fafaf9;
		margin: 0 0 1.15rem 0;
	}

	.accent-block {
		display: block;
		background: linear-gradient(90deg, #fbbf24, #ea580c);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.hero-tagline {
		font-size: 1.12rem;
		line-height: 1.65;
		color: #a8a29e;
		margin: 0 0 1.85rem 0;
		max-width: 58ch;
	}

	.hero-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.btn-primary {
		padding: 0.75rem 1.35rem;
		border-radius: 0.6rem;
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: #0c0a09;
		font-weight: 700;
		font-size: 0.92rem;
		text-decoration: none;
		transition: transform 0.15s ease, filter 0.15s ease;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		filter: brightness(1.08);
	}

	.btn-secondary {
		padding: 0.75rem 1.35rem;
		border-radius: 0.6rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: #fafaf9;
		font-weight: 600;
		font-size: 0.92rem;
		text-decoration: none;
		transition: border-color 0.15s ease, background 0.15s ease;
	}

	.btn-secondary:hover {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.08);
	}

	.pcb-card {
		background: linear-gradient(160deg, #191513 0%, #110e0d 100%);
		border: 1px solid rgba(245, 158, 11, 0.28);
		border-radius: 1rem;
		padding: 1.35rem;
		box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
	}

	.pcb-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: #a8a29e;
		padding-bottom: 0.85rem;
		margin-bottom: 1rem;
		border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
	}

	.pcb-rev {
		color: #10b981;
		font-weight: 600;
	}

	.pcb-diagram {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-bottom: 1.1rem;
	}

	.diagram-node {
		padding: 0.75rem 0.95rem;
		border-radius: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.diagram-node.danger {
		background: rgba(239, 68, 68, 0.09);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.diagram-node.danger .node-tag {
		color: #f87171;
	}

	.diagram-node.active {
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.35);
	}

	.diagram-node.active .node-tag {
		color: #34d399;
	}

	.node-tag {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
	}

	.diagram-node strong {
		font-size: 0.88rem;
		color: #fafaf9;
	}

	.diagram-node small {
		font-size: 0.76rem;
		color: #a8a29e;
	}

	.diagram-arrow {
		text-align: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #fbbf24;
		letter-spacing: 0.08em;
	}

	.quick-specs-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.65rem;
	}

	.spec-box {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 0.6rem;
		padding: 0.7rem 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.spec-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: #a8a29e;
		text-transform: uppercase;
	}

	.spec-val {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.95rem;
		color: #fbbf24;
	}

	.spec-detail {
		font-size: 0.73rem;
		color: #78716c;
		line-height: 1.35;
	}

	.section-block {
		padding: 4rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.story-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2.25rem;
	}

	.story-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.9rem;
		padding: 1.6rem;
	}

	.story-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: #f59e0b;
		letter-spacing: 0.06em;
	}

	.story-card h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.3rem;
		color: #fafaf9;
		margin: 0.5rem 0 0.75rem;
	}

	.story-card p {
		color: #a8a29e;
		line-height: 1.65;
		font-size: 0.95rem;
		margin: 0 0 1.1rem;
	}

	.highlight-list {
		margin: 0;
		padding-left: 1.15rem;
		color: #d6d3d1;
		font-size: 0.88rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.highlight-list li::marker {
		color: #f59e0b;
	}

	.comparison-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 0.95rem;
		padding: 1.6rem;
	}

	.comparison-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.sub-eyebrow {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #f59e0b;
		letter-spacing: 0.08em;
	}

	.comparison-header h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
		color: #fafaf9;
	}

	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.filter-pills button {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #a8a29e;
		padding: 0.38rem 0.75rem;
		border-radius: 0.45rem;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-pills button.active,
	.filter-pills button:hover {
		background: rgba(245, 158, 11, 0.15);
		border-color: #f59e0b;
		color: #fbbf24;
	}

	.table-scroll {
		overflow-x: auto;
	}

	.spec-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.9rem;
	}

	.spec-table th {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.73rem;
		text-transform: uppercase;
		color: #a8a29e;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.spec-table td {
		padding: 0.9rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		vertical-align: top;
	}

	.col-sub {
		font-weight: 600;
		color: #fafaf9;
		white-space: nowrap;
	}

	.col-stock {
		color: #a8a29e;
	}

	.col-upgrade {
		color: #e7e5e4;
	}

	.status-tag {
		display: inline-block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.2rem 0.55rem;
		border-radius: 0.35rem;
	}

	.status-tag.new {
		background: rgba(16, 185, 129, 0.14);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.status-tag.upgraded {
		background: rgba(245, 158, 11, 0.14);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.status-tag.retained {
		background: rgba(59, 130, 246, 0.14);
		color: #60a5fa;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	@media (max-width: 920px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
