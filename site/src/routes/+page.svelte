<script lang="ts">
	/**
	 * ============================================================================
	 * MAIN PORTFOLIO PAGE (`+page.svelte`)
	 * ============================================================================
	 * In SvelteKit, `+page.svelte` defines a route page.
	 * Each section is broken into a clean component under `src/lib/components/`
	 * and fed by simple TypeScript data files in `src/lib/data/`.
	 */
	import ProjectSection from '$lib/components/ProjectSection.svelte';
	import RequirementsSection from '$lib/components/RequirementsSection.svelte';
	import FeaturesSection from '$lib/components/FeaturesSection.svelte';
	import CustomSections from '$lib/components/CustomSections.svelte';
	import ProgressionSection from '$lib/components/ProgressionSection.svelte';
</script>

<ProjectSection />
<RequirementsSection />
<FeaturesSection />
<CustomSections />
<ProgressionSection />
