# ☕ Coffeenator Pro 9000

> **Smart Hardware Retrofit, Sensor Telemetry & Wireless Upgrade for a Melitta Excellent Coffee Brewer**

When the stock control mainboard on a **Melitta Excellent** filter coffee machine burnt out, its heating elements, thermal fuses, and mechanical assembly were still in great condition. **Coffeenator Pro 9000** replaces the dead OEM PCB with an ESP32-based controller, isolated AC power switching, temperature & water-level sensors, and local wireless control (Web UI & MQTT / Home Assistant).

---

## 📂 Repository Structure

- `site/` — **Svelte 5 + SvelteKit** project documentation & portfolio website (deployed to GitHub Pages)
  - `site/src/lib/data/project.ts` — Project overview, stock-vs-upgrade comparison, and custom sections
  - `site/src/lib/data/requirements.ts` — Hardware, Safety, Sensor, Firmware, and Wireless requirements
  - `site/src/lib/data/features.ts` — Smart quality-of-life features & upgrades
  - `site/src/lib/data/progression.ts` — Chronological build logs, pinouts, and project milestones
- `.github/workflows/deploy-pages.yml` — Automated GitHub Pages deployment workflow

---

## 🚀 Running & Editing the Svelte Portfolio Site

### 1. Install Dependencies & Start Dev Server

```bash
cd site
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### 2. How to Add Content or New Sections

All content is data-driven so you can document your progress quickly:

1. **Log Progress / Milestones**: Add a new object to `progressionLogs` in [`site/src/lib/data/progression.ts`](site/src/lib/data/progression.ts).
2. **Add or Update Requirements**: Edit `requirementsList` in [`site/src/lib/data/requirements.ts`](site/src/lib/data/requirements.ts).
3. **Add Features**: Edit `featuresList` in [`site/src/lib/data/features.ts`](site/src/lib/data/features.ts).
4. **Add a Brand-New Section**: Append an entry to `customSections` in [`site/src/lib/data/project.ts`](site/src/lib/data/project.ts) — both the navbar and page body will automatically render it.

### 3. Deploying to GitHub Pages

1. Push your changes to the `main` branch.
2. In your GitHub repository, go to **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy-pages.yml` will automatically build and publish the site.
