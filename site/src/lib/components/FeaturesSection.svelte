<script lang="ts">
	import SectionHeader from './SectionHeader.svelte';
	import { featuresList, type FeatureItem } from '$lib/data/features';

	const iconMap: Record<FeatureItem['icon'], string> = {
		cpu: '⚡',
		thermometer: '🌡️',
		wifi: '📡',
		droplets: '💧',
		shield: '🛡️',
		clock: '⏱️'
	};

	/**
	 * SVELTE 5 INTERACTIVE DEMO:
	 * Below is a simulated control panel for the Melitta Excellent upgrade.
	 * It demonstrates how Svelte 5's `$state()` and `$derived()` handle interdependent
	 * hardware sensor logic effortlessly!
	 */
	let waterCups = $state(6);
	let carafeSeated = $state(true);
	let bloomEnabled = $state(true);
	let machineState = $state<'IDLE' | 'BREWING' | 'KEEP_WARM' | 'FAULT_INHIBIT'>('IDLE');
	let simulatedBoilerTemp = $state(24);

	let safetyInterlockOk = $derived(waterCups >= 2 && carafeSeated);
	let interlockMessage = $derived.by(() => {
		if (!carafeSeated && waterCups < 2) {
			return 'INHIBIT: Carafe missing & water tank below minimum (2 cups)';
		}
		if (!carafeSeated) {
			return 'INHIBIT: Carafe microswitch OPEN (place glass jug on hotplate)';
		}
		if (waterCups < 2) {
			return 'INHIBIT: Water reservoir too low for safe brew (< 2 cups)';
		}
		return 'ALL INTERLOCKS NOMINAL — Ready for Local or MQTT Brew Command';
	});

	function triggerSimulatedBrew() {
		if (!safetyInterlockOk) {
			machineState = 'FAULT_INHIBIT';
			simulatedBoilerTemp = 24;
			return;
		}
		if (machineState === 'BREWING') {
			machineState = 'KEEP_WARM';
			simulatedBoilerTemp = 82;
		} else if (machineState === 'KEEP_WARM') {
			machineState = 'IDLE';
			simulatedBoilerTemp = 24;
		} else {
			machineState = 'BREWING';
			simulatedBoilerTemp = 94;
		}
	}
</script>

<section id="features" class="section-block">
	<SectionHeader
		badge="SECTION 03 // SMART FEATURES & UPGRADES"
		title="Quality-of-Life & Telemetry Upgrades"
		subtitle="Replacing the dead control board lets us add closed-loop temperature control, pre-brew tank checks, and local wireless automation. Edit `src/lib/data/features.ts` to add more."
	/>

	<!-- FEATURES CARDS GRID -->
	<div class="features-grid">
		{#each featuresList as feature (feature.id)}
			<article class="feature-card">
				<div class="feature-card-top">
					<span class="feature-icon" aria-hidden="true">{iconMap[feature.icon]}</span>
					<span class="feature-tag">{feature.tag}</span>
					<span
						class="feature-status"
						class:active={feature.status === 'Active Work'}
						class:ready={feature.status === 'Prototype Ready'}
					>
						{feature.status}
					</span>
				</div>

				<h3>{feature.title}</h3>
				<p class="feature-summary">{feature.summary}</p>

				<ul class="feature-details">
					{#each feature.details as detail}
						<li>{detail}</li>
					{/each}
				</ul>

				<div class="tech-chips">
					{#each feature.techStack as tech}
						<span class="tech-chip">{tech}</span>
					{/each}
				</div>
			</article>
		{/each}
	</div>

	<!-- INTERACTIVE SVELTE 5 SENSOR & INTERLOCK SIMULATOR -->
	<div class="sim-panel">
		<div class="sim-header">
			<div>
				<span class="sim-eyebrow">INTERACTIVE SVELTE 5 DEMO // LIVE LOGIC PREVIEW</span>
				<h3>Coffeenator Pre-Brew Sensor & Interlock Simulator</h3>
			</div>
			<span class="sim-badge" class:ok={safetyInterlockOk} class:fault={!safetyInterlockOk}>
				{safetyInterlockOk ? '● INTERLOCK PASS' : '▲ INTERLOCK BLOCKED'}
			</span>
		</div>

		<div class="sim-body">
			<div class="sim-controls">
				<label class="control-item">
					<div class="control-label-row">
						<span>Capacitive Water Level Sensor</span>
						<strong class="mono-val">{waterCups} Cups ({waterCups * 125} ml)</strong>
					</div>
					<input
						type="range"
						min="0"
						max="10"
						step="1"
						bind:value={waterCups}
						onchange={() => {
							if (!safetyInterlockOk && machineState === 'BREWING') {
								machineState = 'FAULT_INHIBIT';
								simulatedBoilerTemp = 24;
							}
						}}
					/>
					<small>Try dragging below 2 cups to test dry-boil prevention</small>
				</label>

				<div class="toggle-row">
					<label class="checkbox-card">
						<input
							type="checkbox"
							bind:checked={carafeSeated}
							onchange={() => {
								if (!carafeSeated && machineState === 'BREWING') {
									machineState = 'FAULT_INHIBIT';
									simulatedBoilerTemp = 24;
								}
							}}
						/>
						<div>
							<strong>Carafe Seated on Warming Plate</strong>
							<small>Hall / Microswitch sensor</small>
						</div>
					</label>

					<label class="checkbox-card">
						<input type="checkbox" bind:checked={bloomEnabled} />
						<div>
							<strong>30s Pre-Infusion Bloom Pause</strong>
							<small>Saturates grounds before full flow</small>
						</div>
					</label>
				</div>
			</div>

			<div class="sim-telemetry">
				<div class="telemetry-screen">
					<div class="screen-row">
						<span>STATE_MACHINE:</span>
						<strong class="state-val">{machineState}</strong>
					</div>
					<div class="screen-row">
						<span>BOILER_NTC_TEMP:</span>
						<strong>{simulatedBoilerTemp}.0 °C</strong>
					</div>
					<div class="screen-row">
						<span>BLOOM_PROFILE:</span>
						<strong>{bloomEnabled ? 'ENABLED (30s)' : 'BYPASSED'}</strong>
					</div>
					<div class="screen-msg" class:warn={!safetyInterlockOk}>
						{interlockMessage}
					</div>
				</div>

				<button type="button" class="sim-brew-btn" onclick={triggerSimulatedBrew}>
					{#if !safetyInterlockOk}
						Test Brew Start (Will Trigger Safety Inhibit)
					{:else if machineState === 'BREWING'}
						Advance to Keep-Warm (82°C PID) →
					{:else if machineState === 'KEEP_WARM'}
						Turn Off / Return to IDLE
					{:else}
						Simulate Wireless "Start Brew" Command ⚡
					{/if}
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	.section-block {
		padding: 4rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 1.35rem;
		margin-bottom: 2.5rem;
	}

	.feature-card {
		background: #161311;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.95rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s ease, transform 0.15s ease;
	}

	.feature-card:hover {
		border-color: rgba(245, 158, 11, 0.35);
		transform: translateY(-2px);
	}

	.feature-card-top {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.9rem;
	}

	.feature-icon {
		font-size: 1.3rem;
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.25);
		width: 2.2rem;
		height: 2.2rem;
		display: grid;
		place-items: center;
		border-radius: 0.5rem;
	}

	.feature-tag {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		font-weight: 600;
		color: #f59e0b;
		letter-spacing: 0.06em;
	}

	.feature-status {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.66rem;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		color: #a8a29e;
	}

	.feature-status.active {
		background: rgba(245, 158, 11, 0.14);
		color: #fbbf24;
	}

	.feature-status.ready {
		background: rgba(16, 185, 129, 0.14);
		color: #34d399;
	}

	.feature-card h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.2rem;
		color: #fafaf9;
		margin: 0 0 0.55rem 0;
	}

	.feature-summary {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #a8a29e;
		margin: 0 0 1rem 0;
	}

	.feature-details {
		margin: 0 0 1.25rem 0;
		padding-left: 1.15rem;
		font-size: 0.84rem;
		color: #d6d3d1;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		line-height: 1.45;
	}

	.feature-details li::marker {
		color: #f59e0b;
	}

	.tech-chips {
		margin-top: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		padding-top: 0.85rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	.tech-chip {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		padding: 0.22rem 0.55rem;
		border-radius: 0.35rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #e7e5e4;
	}

	/* INTERACTIVE SIMULATOR PANEL */
	.sim-panel {
		background: linear-gradient(145deg, #191512, #120f0d);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 1rem;
		padding: 1.6rem;
	}

	.sim-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.35rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.sim-eyebrow {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #10b981;
		letter-spacing: 0.08em;
	}

	.sim-header h3 {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
		color: #fafaf9;
	}

	.sim-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.74rem;
		font-weight: 700;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
	}

	.sim-badge.ok {
		background: rgba(16, 185, 129, 0.14);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
	}

	.sim-badge.fault {
		background: rgba(239, 68, 68, 0.16);
		color: #f87171;
		border: 1px solid rgba(239, 68, 68, 0.4);
	}

	.sim-body {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 1.5rem;
		align-items: stretch;
	}

	.sim-controls {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.control-item {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		background: rgba(255, 255, 255, 0.03);
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.07);
	}

	.control-label-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		color: #fafaf9;
	}

	.mono-val {
		font-family: 'JetBrains Mono', monospace;
		color: #fbbf24;
	}

	.control-item input[type='range'] {
		accent-color: #f59e0b;
		width: 100%;
		cursor: pointer;
	}

	.control-item small {
		font-size: 0.76rem;
		color: #a8a29e;
	}

	.toggle-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.85rem;
	}

	.checkbox-card {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		padding: 0.9rem;
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		cursor: pointer;
	}

	.checkbox-card input {
		accent-color: #f59e0b;
		margin-top: 0.2rem;
	}

	.checkbox-card strong {
		display: block;
		font-size: 0.86rem;
		color: #fafaf9;
	}

	.checkbox-card small {
		font-size: 0.75rem;
		color: #a8a29e;
	}

	.sim-telemetry {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.9rem;
	}

	.telemetry-screen {
		background: #090807;
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 0.75rem;
		padding: 1rem 1.15rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.screen-row {
		display: flex;
		justify-content: space-between;
		color: #a8a29e;
	}

	.screen-row strong {
		color: #fafaf9;
	}

	.state-val {
		color: #fbbf24 !important;
	}

	.screen-msg {
		margin-top: 0.45rem;
		padding-top: 0.55rem;
		border-top: 1px dashed rgba(255, 255, 255, 0.12);
		color: #34d399;
		font-size: 0.73rem;
		line-height: 1.45;
	}

	.screen-msg.warn {
		color: #f87171;
	}

	.sim-brew-btn {
		padding: 0.8rem 1rem;
		border-radius: 0.6rem;
		border: 1px solid rgba(245, 158, 11, 0.45);
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: #0c0a09;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
		cursor: pointer;
		transition: filter 0.15s ease;
	}

	.sim-brew-btn:hover {
		filter: brightness(1.08);
	}

	@media (max-width: 860px) {
		.sim-body {
			grid-template-columns: 1fr;
		}
	}
</style>
