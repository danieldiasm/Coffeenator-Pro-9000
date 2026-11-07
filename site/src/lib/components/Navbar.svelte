<script lang="ts">
	import { base } from '$app/paths';
	import { projectMeta, customSections } from '$lib/data/project';

	interface Props {
		onOpenGuide: () => void;
	}

	let { onOpenGuide }: Props = $props();
	let mobileMenuOpen = $state(false);

	// Standard core sections + any extra sections configured in src/lib/data/project.ts
	const navItems = [
		{ href: '#project', label: 'Project' },
		{ href: '#requirements', label: 'Requirements' },
		{ href: '#features', label: 'Features' },
		...customSections.map((sec) => ({
			href: `#${sec.id}`,
			label: sec.navLabel
		})),
		{ href: '#progression', label: 'Progression' }
	];

	function closeMobile() {
		mobileMenuOpen = false;
	}
</script>

<header class="navbar">
	<div class="nav-container">
		<a href="{base}/" class="brand" onclick={closeMobile}>
			<span class="brand-icon" aria-hidden="true">☕</span>
			<div class="brand-text">
				<span class="brand-title">{projectMeta.title}</span>
				<span class="brand-sub">{projectMeta.codename}</span>
			</div>
		</a>

		<nav class="nav-links" class:open={mobileMenuOpen} aria-label="Primary Navigation">
			{#each navItems as item (item.href)}
				<a href={item.href} class="nav-link" onclick={closeMobile}>{item.label}</a>
			{/each}
		</nav>

		<div class="nav-actions">
			<button type="button" class="guide-btn" onclick={onOpenGuide}>
				<span class="code-tag">&lt;/&gt;</span> Svelte Guide
			</button>
			<a
				href={projectMeta.repoUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="repo-btn"
			>
				GitHub ↗
			</a>
			<button
				type="button"
				class="mobile-toggle"
				aria-label="Toggle Menu"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				{mobileMenuOpen ? '✕' : '☰'}
			</button>
		</div>
	</div>
</header>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(14px);
		background: rgba(15, 13, 12, 0.85);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.85rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
	}

	.brand-icon {
		display: grid;
		place-items: center;
		width: 2.3rem;
		height: 2.3rem;
		border-radius: 0.6rem;
		background: linear-gradient(135deg, #d97706, #92400e);
		border: 1px solid rgba(251, 191, 36, 0.4);
		font-size: 1.15rem;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-title {
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 700;
		font-size: 1rem;
		color: #fafaf9;
		line-height: 1.15;
	}

	.brand-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.68rem;
		color: #f59e0b;
		letter-spacing: 0.06em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.nav-link {
		padding: 0.45rem 0.8rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: #d6d3d1;
		text-decoration: none;
		transition:
			color 0.15s ease,
			background 0.15s ease;
	}

	.nav-link:hover {
		color: #fbbf24;
		background: rgba(245, 158, 11, 0.1);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.guide-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.85rem;
		border-radius: 0.5rem;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.35);
		color: #6ee7b7;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.guide-btn:hover {
		background: rgba(16, 185, 129, 0.22);
		border-color: #10b981;
	}

	.code-tag {
		color: #10b981;
	}

	.repo-btn {
		padding: 0.45rem 0.85rem;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: #fafaf9;
		font-size: 0.84rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.repo-btn:hover {
		border-color: #f59e0b;
		color: #fbbf24;
	}

	.mobile-toggle {
		display: none;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: #fafaf9;
		border-radius: 0.45rem;
		padding: 0.35rem 0.65rem;
		font-size: 1rem;
		cursor: pointer;
	}

	@media (max-width: 860px) {
		.mobile-toggle {
			display: inline-flex;
		}

		.nav-links {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: stretch;
			background: #14110f;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			padding: 0.75rem 1.25rem;
		}

		.nav-links.open {
			display: flex;
		}
	}
</style>
