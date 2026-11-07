<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';
	import { progressionLogs, type LogStatus } from '$lib/data/progression';

	let statusFilter = $state<'all' | LogStatus>('all');
	let newestFirst = $state(false);

	let displayedLogs = $derived.by(() => {
		const filtered =
			statusFilter === 'all'
				? [...progressionLogs]
				: progressionLogs.filter((entry) => entry.status === statusFilter);
		return newestFirst ? filtered.reverse() : filtered;
	});

	const statusBadges: Record<LogStatus, string> = {
		completed: 'Completed',
		'in-progress': 'Active Milestone',
		upcoming: 'Upcoming Phase'
	};
</script>

<section id="progression" class="section-block">
	<SectionHeader
		badge="PROJECT PROGRESSION & BUILD LOGS"
		title="Engineering Logbook & Roadmap"
		subtitle="Chronological documentation of the Melitta Excellent teardown, mainboard replacement design, sensor calibration, and firmware milestones. Add new entries in `src/lib/data/progression.ts`."
	/>

	<!-- TIMELINE CONTROLS -->
	<div class="timeline-controls">
		<div class="filter-group" role="group" aria-label="Filter progression logs">
			<button
				type="button"
				class:active={statusFilter === 'all'}
				onclick={() => (statusFilter = 'all')}
			>
				All Milestones ({progressionLogs.length})
			</button>
			<button
				type="button"
				class:active={statusFilter === 'completed'}
				onclick={() => (statusFilter = 'completed')}
			>
				Completed
			</button>
			<button
				type="button"
				class:active={statusFilter === 'in-progress'}
				onclick={() => (statusFilter = 'in-progress')}
			>
				In Progress
			</button>
			<button
				type="button"
				class:active={statusFilter === 'upcoming'}
				onclick={() => (statusFilter = 'upcoming')}
			>
				Upcoming
			</button>
		</div>

		<button
			type="button"
			class="sort-btn"
			onclick={() => (newestFirst = !newestFirst)}
		>
			Sort: {newestFirst ? 'Newest First ↓' : 'Chronological ↑'}
		</button>
	</div>

	<!-- VERTICAL TIMELINE -->
	<div class="timeline">
		{#each displayedLogs as entry (entry.id)}
			<article class="timeline-item {entry.status}">
				<div class="timeline-marker">
					<span class="marker-dot"></span>
					<span class="marker-line"></span>
				</div>

				<div class="timeline-card">
					<div class="log-header">
						<div class="log-meta">
							<span class="log-step">{entry.stepNumber}</span>
							<span class="log-date">{entry.date}</span>
							<span class="log-phase">{entry.phase}</span>
						</div>
						<span class="log-status {entry.status}">
							{statusBadges[entry.status]}
						</span>
					</div>

					<h3 class="log-title">{entry.title}</h3>
					<p class="log-summary">{entry.summary}</p>

					{#if entry.metrics && entry.metrics.length > 0}
						<div class="metrics-row">
							{#each entry.metrics as metric (metric.label)}
								<div class="metric-pill">
									<span class="metric-label">{metric.label}:</span>
									<strong class="metric-value">{metric.value}</strong>
								</div>
							{/each}
						</div>
					{/if}

					<div class="checklists-grid">
						<div class="checklist-box">
							<h4>
								{entry.status === 'upcoming' ? 'Planned Tasks' : 'Completed & Verified'}
							</h4>
							<ul>
								{#each entry.tasksCompleted as task}
									<li>
										<span class="bullet">
											{entry.status === 'upcoming' ? '○' : '✓'}
										</span>
										<span>{task}</span>
									</li>
								{/each}
							</ul>
						</div>

						{#if entry.nextSteps && entry.nextSteps.length > 0}
							<div class="checklist-box next">
								<h4>Immediate Next Steps</h4>
								<ul>
									{#each entry.nextSteps as step}
										<li>
											<span class="bullet">→</span>
											<span>{step}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>

					{#if entry.codeOrNotes}
						<div class="code-block-wrapper">
							<div class="code-header">
								<span>{entry.codeOrNotes.label}</span>
								<span class="mono-badge">HARDWARE / PINOUT NOTES</span>
							</div>
							<pre><code>{entry.codeOrNotes.snippet}</code></pre>
						</div>
					{/if}

					<div class="tag-row">
						{#each entry.tags as tag}
							<span class="tag-chip">#{tag}</span>
						{/each}
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>

<style>
	.section-block {
		padding: 4rem 0;
	}

	.timeline-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 0.9rem 1.15rem;
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.85rem;
	}

	.filter-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.filter-group button,
	.sort-btn {
		padding: 0.4rem 0.8rem;
		border-radius: 0.45rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #a8a29e;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-group button.active,
	.filter-group button:hover,
	.sort-btn:hover {
		background: rgba(245, 158, 11, 0.15);
		border-color: #f59e0b;
		color: #fbbf24;
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.timeline-item {
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 1rem;
	}

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 0.35rem;
	}

	.marker-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #292524;
		border: 2px solid #78716c;
		flex-shrink: 0;
	}

	.timeline-item.completed .marker-dot {
		background: #10b981;
		border-color: #34d399;
		box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
	}

	.timeline-item.in-progress .marker-dot {
		background: #f59e0b;
		border-color: #fbbf24;
		box-shadow: 0 0 12px rgba(245, 158, 11, 0.65);
	}

	.marker-line {
		width: 2px;
		flex: 1;
		background: rgba(255, 255, 255, 0.08);
		margin-top: 0.5rem;
	}

	.timeline-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.95rem;
		padding: 1.6rem;
	}

	.timeline-item.in-progress .timeline-card {
		border-color: rgba(245, 158, 11, 0.35);
	}

	.log-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.8rem;
	}

	.log-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.73rem;
	}

	.log-step {
		color: #fbbf24;
		font-weight: 700;
		background: rgba(245, 158, 11, 0.12);
		padding: 0.2rem 0.5rem;
		border-radius: 0.35rem;
	}

	.log-date {
		color: #d6d3d1;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.2rem 0.5rem;
		border-radius: 0.35rem;
	}

	.log-phase {
		color: #a8a29e;
	}

	.log-status {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.22rem 0.6rem;
		border-radius: 999px;
	}

	.log-status.completed {
		background: rgba(16, 185, 129, 0.15);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
	}

	.log-status.in-progress {
		background: rgba(245, 158, 11, 0.15);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.4);
	}

	.log-status.upcoming {
		background: rgba(255, 255, 255, 0.05);
		color: #a8a29e;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.log-title {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.3rem;
		color: #fafaf9;
		margin: 0 0 0.6rem 0;
	}

	.log-summary {
		font-size: 0.94rem;
		line-height: 1.65;
		color: #a8a29e;
		margin: 0 0 1.2rem 0;
	}

	.metrics-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 1.2rem;
	}

	.metric-pill {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		padding: 0.35rem 0.7rem;
		border-radius: 0.45rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.metric-label {
		color: #a8a29e;
	}

	.metric-value {
		color: #fbbf24;
		margin-left: 0.3rem;
	}

	.checklists-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
		margin-bottom: 1.15rem;
	}

	.checklist-box {
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.7rem;
		padding: 0.95rem 1.1rem;
	}

	.checklist-box h4 {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #10b981;
		margin: 0 0 0.6rem 0;
	}

	.checklist-box.next h4 {
		color: #fbbf24;
	}

	.checklist-box ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-size: 0.85rem;
		color: #d6d3d1;
	}

	.checklist-box li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		line-height: 1.45;
	}

	.bullet {
		font-family: 'JetBrains Mono', monospace;
		color: #f59e0b;
		font-weight: 700;
	}

	.code-block-wrapper {
		background: #0b0908;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.7rem;
		overflow: hidden;
		margin-bottom: 1.15rem;
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.95rem;
		background: rgba(255, 255, 255, 0.04);
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: #d6d3d1;
	}

	.mono-badge {
		color: #f59e0b;
		font-size: 0.66rem;
	}

	.code-block-wrapper pre {
		margin: 0;
		padding: 0.95rem;
		overflow-x: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		line-height: 1.55;
		color: #a7f3d0;
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.tag-chip {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.04);
		padding: 0.2rem 0.55rem;
		border-radius: 0.35rem;
	}
</style>
