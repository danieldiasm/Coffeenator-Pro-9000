<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import SvelteGuideModal from '$lib/components/SvelteGuideModal.svelte';
	import { projectMeta } from '$lib/data/project';

	let { children } = $props();
	let guideOpen = $state(false);
</script>

<div class="app-shell">
	<Navbar onOpenGuide={() => (guideOpen = true)} />

	<main class="main-container">
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="footer-inner">
			<div>
				<strong>{projectMeta.title}</strong> — {projectMeta.baseMachine} Retrofit
				<p class="footer-note">
					Built with Svelte 5 &amp; SvelteKit Static Adapter for GitHub Pages.
				</p>
			</div>
			<div class="footer-links">
				<button type="button" class="footer-guide-link" onclick={() => (guideOpen = true)}>
					How to Add Sections &amp; Logs
				</button>
				<a href={projectMeta.repoUrl} target="_blank" rel="noopener noreferrer">
					GitHub Repository ↗
				</a>
			</div>
		</div>
	</footer>

	<SvelteGuideModal open={guideOpen} onClose={() => (guideOpen = false)} />
</div>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
		background-color: #0d0b0a;
		color: #e7e5e4;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at 15% 5%, rgba(245, 158, 11, 0.08), transparent 38%),
			radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.05), transparent 35%),
			#0d0b0a;
		min-height: 100vh;
	}

	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-container {
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 0 1.5rem;
		flex: 1;
	}

	.site-footer {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: #090807;
		padding: 2.25rem 1.5rem;
		margin-top: 3rem;
	}

	.footer-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.footer-note {
		margin: 0.3rem 0 0;
		font-size: 0.84rem;
		color: #78716c;
	}

	.footer-links {
		display: flex;
		align-items: center;
		gap: 1.2rem;
	}

	.footer-links a,
	.footer-guide-link {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: #fbbf24;
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.footer-links a:hover,
	.footer-guide-link:hover {
		text-decoration: underline;
	}
</style>
