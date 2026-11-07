<script lang="ts">
	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={onClose}>
		<div
			class="modal-panel"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<div>
					<span class="modal-badge">SVELTE 5 + CONTENT CHEAT SHEET</span>
					<h2>How to Customize & Learn From This Repo</h2>
				</div>
				<button type="button" class="close-btn" onclick={onClose} aria-label="Close">✕</button>
			</div>

			<div class="modal-content">
				<div class="guide-section">
					<h3>1. Where to Edit Project Content (Data-Driven Design)</h3>
					<p>
						All text, specs, requirements, features, and progression logs are separated from UI
						code inside <code>site/src/lib/data/</code>:
					</p>
					<ul class="file-list">
						<li>
							<code>src/lib/data/project.ts</code> — Update the Hero banner, the Melitta Excellent story,
							stock-vs-upgrade table, or append a brand-new section to <code>customSections</code>.
						</li>
						<li>
							<code>src/lib/data/requirements.ts</code> — Add or update Hardware, Safety, Sensor, Firmware,
							or Wireless requirements and their status (<code>completed</code>, <code>in-progress</code>,
							<code>planned</code>).
						</li>
						<li>
							<code>src/lib/data/features.ts</code> — Add smart features and quality-of-life upgrades.
						</li>
						<li>
							<code>src/lib/data/progression.ts</code> — Append new build logs, pinout notes, and milestones
							as the hardware build progresses.
						</li>
					</ul>
				</div>

				<div class="guide-section">
					<h3>2. Adding a Brand-New Custom Section in 30 Seconds</h3>
					<p>
						Open <code>site/src/lib/data/project.ts</code> and add a new object to the
						<code>customSections</code> array. Both the top navigation bar and the page body will
						automatically render your new section!
					</p>
					<pre><code>{`// Inside site/src/lib/data/project.ts -> customSections:
{
  id: 'bom',
  navLabel: 'BOM & Parts',
  badge: 'BILL OF MATERIALS',
  title: 'Replacement Hardware BOM',
  subtitle: 'Components selected for the Melitta Excellent retrofit.',
  cards: [
    {
      title: 'ESP32-S3 DevKitC',
      tag: 'MCU',
      body: 'Main controller for Wi-Fi, MQTT, and sensor polling.',
      items: ['Dual-core Xtensa LX7', '3.3V Logic']
    }
  ]
}`}</code></pre>
				</div>

				<div class="guide-section">
					<h3>3. Svelte 5 Concepts Used in This Project</h3>
					<div class="concepts-grid">
						<div class="concept-card">
							<code>let count = $state(0)</code>
							<p>
								<strong>Reactive State:</strong> Declares a variable that triggers automatic UI updates
								whenever reassigned (used in filter tabs and the Brew Simulator).
							</p>
						</div>
						<div class="concept-card">
							<code>let list = $derived(...)</code>
							<p>
								<strong>Computed Values:</strong> Automatically recalculates whenever its dependencies
								change (used to filter requirements and sort progression logs).
							</p>
						</div>
						<div class="concept-card">
							<code>let &#123; title &#125; = $props()</code>
							<p>
								<strong>Component Props:</strong> Passes data into reusable components like
								<code>SectionHeader.svelte</code>.
							</p>
						</div>
						<div class="concept-card">
							<code>&#123;#each items as item (item.id)&#125;</code>
							<p>
								<strong>Keyed Template Loops:</strong> Renders arrays of data cleanly and updates only
								changed DOM nodes.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(6px);
		display: grid;
		place-items: center;
		padding: 1.25rem;
	}

	.modal-panel {
		background: #161311;
		border: 1px solid rgba(245, 158, 11, 0.4);
		border-radius: 1rem;
		max-width: 780px;
		width: 100%;
		max-height: 88vh;
		overflow-y: auto;
		padding: 1.75rem;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1rem;
		margin-bottom: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #10b981;
		letter-spacing: 0.08em;
	}

	.modal-header h2 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.4rem;
		margin: 0.25rem 0 0;
		color: #fafaf9;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #fafaf9;
		border-radius: 0.5rem;
		width: 2.1rem;
		height: 2.1rem;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.guide-section {
		margin-bottom: 1.5rem;
	}

	.guide-section h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.08rem;
		color: #fbbf24;
		margin: 0 0 0.5rem 0;
	}

	.guide-section p {
		font-size: 0.9rem;
		color: #d6d3d1;
		line-height: 1.6;
		margin: 0 0 0.75rem 0;
	}

	.file-list {
		margin: 0;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.86rem;
		color: #a8a29e;
		line-height: 1.5;
	}

	code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: #6ee7b7;
		background: rgba(16, 185, 129, 0.1);
		padding: 0.12rem 0.38rem;
		border-radius: 0.3rem;
	}

	pre {
		background: #0b0908;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.65rem;
		padding: 0.95rem;
		overflow-x: auto;
		margin: 0;
	}

	pre code {
		background: transparent;
		padding: 0;
		color: #fde68a;
	}

	.concepts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 0.85rem;
	}

	.concept-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.65rem;
		padding: 0.9rem;
	}

	.concept-card p {
		margin: 0.5rem 0 0;
		font-size: 0.82rem;
		color: #a8a29e;
	}
</style>
