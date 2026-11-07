<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';
	import {
		requirementsList,
		type RequirementCategory,
		type RequirementStatus
	} from '$lib/data/requirements';

	/**
	 * SVELTE 5 LEARNING NOTE:
	 * Multiple `$state` variables can be combined inside `$derived` expressions.
	 * Whenever the user selects a different category or status filter, `filteredRequirements`
	 * updates automatically without manual event listeners or state synchronization!
	 */
	let activeCategory = $state<'All' | RequirementCategory>('All');
	let activeStatus = $state<'all' | RequirementStatus>('all');

	const categories: ('All' | RequirementCategory)[] = [
		'All',
		'Hardware',
		'Safety',
		'Sensors',
		'Firmware',
		'Wireless'
	];

	let filteredRequirements = $derived(
		requirementsList.filter((req) => {
			const matchesCategory = activeCategory === 'All' || req.category === activeCategory;
			const matchesStatus = activeStatus === 'all' || req.status === activeStatus;
			return matchesCategory && matchesStatus;
		})
	);

	let stats = $derived({
		total: requirementsList.length,
		completed: requirementsList.filter((r) => r.status === 'completed').length,
		inProgress: requirementsList.filter((r) => r.status === 'in-progress').length,
		planned: requirementsList.filter((r) => r.status === 'planned').length
	});

	const statusLabels: Record<RequirementStatus, string> = {
		completed: 'Verified / Done',
		'in-progress': 'In Progress',
		planned: 'Planned'
	};
</script>

<section id="requirements" class="section-block">
	<SectionHeader
		badge="SECTION 02 // SYSTEM REQUIREMENTS"
		title="Engineering & Retrofit Requirements"
		subtitle="Every hardware, safety, sensor, and firmware requirement needed to make the Melitta Excellent safer and smarter than stock. Edit `src/lib/data/requirements.ts` to add or update items."
	/>

	<!-- SUMMARY METRICS & FILTER BAR -->
	<div class="req-toolbar">
		<div class="category-tabs" role="tablist" aria-label="Requirement Categories">
			{#each categories as cat (cat)}
				<button
					type="button"
					class="cat-btn"
					class:active={activeCategory === cat}
					onclick={() => (activeCategory = cat)}
				>
					{cat}
				</button>
			{/each}
		</div>

		<div class="status-filters">
			<button
				type="button"
				class="stat-pill"
				class:selected={activeStatus === 'all'}
				onclick={() => (activeStatus = 'all')}
			>
				All: <strong>{stats.total}</strong>
			</button>
			<button
				type="button"
				class="stat-pill done"
				class:selected={activeStatus === 'completed'}
				onclick={() => (activeStatus = 'completed')}
			>
				Done: <strong>{stats.completed}</strong>
			</button>
			<button
				type="button"
				class="stat-pill wip"
				class:selected={activeStatus === 'in-progress'}
				onclick={() => (activeStatus = 'in-progress')}
			>
				In Progress: <strong>{stats.inProgress}</strong>
			</button>
			<button
				type="button"
				class="stat-pill planned"
				class:selected={activeStatus === 'planned'}
				onclick={() => (activeStatus = 'planned')}
			>
				Planned: <strong>{stats.planned}</strong>
			</button>
		</div>
	</div>

	<!-- REQUIREMENTS CARDS GRID -->
	<div class="req-grid">
		{#each filteredRequirements as req (req.id)}
			<article class="req-card">
				<div class="req-top">
					<div class="req-meta">
						<span class="req-id">{req.id}</span>
						<span class="req-cat">{req.category}</span>
						<span class="req-prio">{req.priority}</span>
					</div>
					<span class="req-status {req.status}">
						{statusLabels[req.status]}
					</span>
				</div>

				<h3 class="req-title">{req.title}</h3>
				<p class="req-desc">{req.description}</p>

				<div class="criteria-box">
					<span class="criteria-heading">Acceptance Criteria</span>
					<ul class="criteria-list">
						{#each req.acceptanceCriteria as criterion}
							<li>
								<span class="check-icon">
									{req.status === 'completed' ? '✓' : '◦'}
								</span>
								<span>{criterion}</span>
							</li>
						{/each}
					</ul>
				</div>
			</article>
		{:else}
			<div class="empty-state">
				<p>No requirements match the selected filters.</p>
				<button
					type="button"
					class="reset-btn"
					onclick={() => {
						activeCategory = 'All';
						activeStatus = 'all';
					}}
				>
					Reset Filters
				</button>
			</div>
		{/each}
	</div>
</section>

<style>
	.section-block {
		padding: 4rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.req-toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.75rem;
		padding: 1rem 1.2rem;
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.85rem;
	}

	.category-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.cat-btn {
		padding: 0.42rem 0.85rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		background: rgba(255, 255, 255, 0.04);
		color: #a8a29e;
		font-size: 0.83rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.cat-btn:hover,
	.cat-btn.active {
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.45);
		color: #fbbf24;
	}

	.status-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.stat-pill {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #d6d3d1;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.stat-pill.selected {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.14);
		color: #fafaf9;
	}

	.stat-pill.done strong {
		color: #34d399;
	}

	.stat-pill.wip strong {
		color: #fbbf24;
	}

	.stat-pill.planned strong {
		color: #93c5fd;
	}

	.req-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 1.25rem;
	}

	.req-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.9rem;
		padding: 1.4rem;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s ease, transform 0.15s ease;
	}

	.req-card:hover {
		border-color: rgba(245, 158, 11, 0.35);
		transform: translateY(-2px);
	}

	.req-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.85rem;
		flex-wrap: wrap;
	}

	.req-meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.req-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		font-weight: 700;
		color: #fbbf24;
		background: rgba(245, 158, 11, 0.12);
		padding: 0.2rem 0.5rem;
		border-radius: 0.35rem;
	}

	.req-cat,
	.req-prio {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.2rem 0.5rem;
		border-radius: 0.35rem;
	}

	.req-status {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
	}

	.req-status.completed {
		background: rgba(16, 185, 129, 0.15);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
	}

	.req-status.in-progress {
		background: rgba(245, 158, 11, 0.15);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.35);
	}

	.req-status.planned {
		background: rgba(59, 130, 246, 0.12);
		color: #93c5fd;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.req-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.15rem;
		color: #fafaf9;
		margin: 0 0 0.55rem 0;
	}

	.req-desc {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #a8a29e;
		margin: 0 0 1.15rem 0;
	}

	.criteria-box {
		margin-top: auto;
		background: rgba(0, 0, 0, 0.28);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.65rem;
		padding: 0.85rem 1rem;
	}

	.criteria-heading {
		display: block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #78716c;
		margin-bottom: 0.5rem;
	}

	.criteria-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.83rem;
		color: #d6d3d1;
	}

	.criteria-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		line-height: 1.45;
	}

	.check-icon {
		color: #f59e0b;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 700;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2.5rem;
		background: #161311;
		border-radius: 0.85rem;
		border: 1px dashed rgba(255, 255, 255, 0.15);
		color: #a8a29e;
	}

	.reset-btn {
		margin-top: 0.75rem;
		padding: 0.45rem 0.95rem;
		border-radius: 0.45rem;
		background: #f59e0b;
		color: #0c0a09;
		border: none;
		font-weight: 600;
		cursor: pointer;
	}
</style>
