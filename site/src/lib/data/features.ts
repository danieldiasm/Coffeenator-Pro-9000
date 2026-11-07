/**
 * ============================================================================
 * PROJECT FEATURES & QOL UPGRADES DATA
 * ============================================================================
 * Add new features, sensor capabilities, or smart upgrades here.
 */

export interface FeatureItem {
	id: string;
	icon: 'cpu' | 'thermometer' | 'wifi' | 'droplets' | 'shield' | 'clock';
	tag: string;
	title: string;
	summary: string;
	details: string[];
	techStack: string[];
	status: 'Active Work' | 'Prototype Ready' | 'Planned';
}

export const featuresList: FeatureItem[] = [
	{
		id: 'smart-mainboard',
		icon: 'cpu',
		tag: 'CORE RETROFIT',
		title: 'Drop-In Smart Mainboard Replacement',
		summary:
			'Replaces the fried Melitta Excellent OEM board with a dual-core wireless microcontroller and industrial-grade power switching.',
		details: [
			'Dedicated AC-DC isolated power stage (no fragile capacitive droppers)',
			'Independent control over primary water heater and carafe warming plate',
			'Clean wiring harness interface so no irreversible chassis cuts are required'
		],
		techStack: ['ESP32-S3 / ESP32', 'Zero-Cross SSR', '230V AC Isolation'],
		status: 'Active Work'
	},
	{
		id: 'thermal-profiling',
		icon: 'thermometer',
		tag: 'BREW QUALITY',
		title: 'Closed-Loop Temperature & Bloom Control',
		summary:
			'Monitors boiler and hotplate temperatures in real time—enabling pre-infusion ("blooming") pauses and gentle carafe warming without burning the coffee.',
		details: [
			'Optional 30-second bloom pause after initial grounds saturation',
			'Gentle PID/duty-cycle control on warming plate (holds 80°C–84°C instead of scorching)',
			'Automatic end-of-brew detection when boiler temp spikes as water empties'
		],
		techStack: ['NTC 100k / DS18B20', 'PID Duty Control', 'End-of-Brew Inflection'],
		status: 'Active Work'
	},
	{
		id: 'sensor-suite',
		icon: 'droplets',
		tag: 'QUALITY OF LIFE',
		title: 'Pre-Brew Tank & Carafe Awareness',
		summary:
			'Never start a dry brew or overflow an absent pot again. Multi-point sensors verify water volume and jug presence before energizing the heater.',
		details: [
			'Non-contact water level sensing estimates cup count in the reservoir',
			'Carafe presence detection prevents mess if the glass pot isn’t seated',
			'Tracks cumulative litres brewed to remind you when descaling is due'
		],
		techStack: ['Capacitive Level Sensor', 'Carafe Microswitch', 'Descale Counter'],
		status: 'Planned'
	},
	{
		id: 'wireless-telemetry',
		icon: 'wifi',
		tag: 'CONNECTIVITY',
		title: 'Wireless Web UI & Home Assistant Integration',
		summary:
			'Full local-first wireless control via MQTT and an embedded web dashboard—check water level from bed and trigger a brew when your alarm rings.',
		details: [
			'Zero-cloud dependency: 100% local HTTP API, WebSockets, and MQTT',
			'Instant push notification when the brew cycle finishes and enters Keep-Warm',
			'Live carafe freshness timer showing how many minutes ago the pot was brewed'
		],
		techStack: ['MQTT Auto-Discovery', 'Embedded WebSockets', 'Home Assistant'],
		status: 'Planned'
	},
	{
		id: 'wake-up-scheduler',
		icon: 'clock',
		tag: 'AUTOMATION',
		title: 'Smart Morning Schedule & Auto Shutoff',
		summary:
			'Prep the filter and water the night before; the machine verifies safety conditions at 07:00 AM and brews fresh coffee automatically.',
		details: [
			'Configurable Keep-Warm duration (15 / 30 / 40 mins) with automatic power-off',
			'NTP time synchronization with fallback RTC timer',
			'Skips scheduled brew safely if water tank is empty or carafe is missing'
		],
		techStack: ['NTP Sync', 'Configurable Keep-Warm', 'Pre-Flight Safety Check'],
		status: 'Planned'
	},
	{
		id: 'safety-interlocks',
		icon: 'shield',
		tag: 'RELIABILITY',
		title: 'Multi-Layer Hardware & Software Watchdogs',
		summary:
			'Engineered with appliance safety first: retains Melitta’s factory thermal fuses while adding dry-boil detection, current sensing, and MCU watchdogs.',
		details: [
			'Hardware watchdog resets outputs to OFF if firmware ever hangs',
			'Sensor fault detection immediately cuts heater relay drive',
			'Retains original physical thermal links mounted to the aluminum heater extrusion'
		],
		techStack: ['Thermal Cutoff Fuses', 'HW Watchdog Timer', 'Fail-Safe Relay Logic'],
		status: 'Prototype Ready'
	}
];
