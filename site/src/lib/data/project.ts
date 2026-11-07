/**
 * ============================================================================
 * PROJECT OVERVIEW & CUSTOM SECTIONS DATA
 * ============================================================================
 * Edit this file to update the hero banner, project story, stock-vs-upgraded
 * comparison, and any extra custom sections you want to appear on the page.
 */

export interface ProjectMeta {
	title: string;
	codename: string;
	tagline: string;
	baseMachine: string;
	status: 'Phase 1: Reverse Engineering & BOM' | 'Phase 2: Prototyping' | 'Phase 3: Firmware' | 'Completed';
	repoUrl: string;
	author: string;
	lastUpdated: string;
	quickSpecs: {
		label: string;
		value: string;
		detail: string;
	}[];
}

export interface StoryBlock {
	id: string;
	badge: string;
	title: string;
	description: string;
	highlights: string[];
}

export interface ComparisonRow {
	subsystem: string;
	stockMelitta: string;
	coffeenatorUpgrade: string;
	status: 'upgraded' | 'new' | 'retained';
}

export interface CustomSection {
	id: string;
	navLabel: string;
	badge: string;
	title: string;
	subtitle: string;
	cards: {
		title: string;
		tag?: string;
		body: string;
		items?: string[];
	}[];
}

export const projectMeta: ProjectMeta = {
	title: 'Coffeenator Pro 9000',
	codename: 'MELITTA-EXCELLENT-REV2',
	tagline:
		'Resurrecting a Melitta Excellent coffee brewer with a fried mainboard into a sensor-packed, wireless-enabled smart brewing station.',
	baseMachine: 'Melitta Excellent (Dual-Heater Filter Coffee Brewer)',
	status: 'Phase 1: Reverse Engineering & BOM',
	repoUrl: 'https://github.com/danieldiasm/Coffeenator-Pro-9000',
	author: 'Daniel',
	lastUpdated: 'November 2026',
	quickSpecs: [
		{
			label: 'Base Appliance',
			value: 'Melitta Excellent',
			detail: 'Dual heating element drip brewer (burnt OEM PCB)'
		},
		{
			label: 'Target MCU',
			value: 'ESP32 / Dual-Core',
			detail: 'Wi-Fi + BLE + real-time sensor & SSR/relay control'
		},
		{
			label: 'New Sensors',
			value: 'Temp, Water, Current',
			detail: 'NTC/DS18B20 probes, capacitive tank level, AC power sensing'
		},
		{
			label: 'Safety Architecture',
			value: 'Hardware Interlocks',
			detail: 'Original thermal fuses retained + watchdog & dry-boil cutoff'
		}
	]
};

export const projectStory: StoryBlock[] = [
	{
		id: 'incident',
		badge: '01 // THE INCIDENT',
		title: 'A Burnt Mainboard & A Second Chance',
		description:
			'The Melitta Excellent is a rock-solid mechanical coffee brewer with great thermal performance—until its stock mains control board suffered a catastrophic failure. Instead of tossing a perfectly good chassis, boiler, and carafe assembly into e-waste, this project replaces the brain entirely.',
		highlights: [
			'Stock capacitive dropper / relay control board failed permanently',
			'Heating elements, thermal fuses, and water path remain in great condition',
			'Opportunity to replace dumb timer logic with closed-loop sensor control'
		]
	},
	{
		id: 'vision',
		badge: '02 // THE RETROFIT VISION',
		title: 'Quality-of-Life & Telemetry Upgrades',
		description:
			'By designing a modern microcontroller replacement board, we can fix every small annoyance of the original machine: knowing exact water tank levels before starting a brew, monitoring brew-head temperature curves, automating keep-warm shutoff, and controlling or scheduling brews over Wi-Fi.',
		highlights: [
			'Galvanically isolated AC mains switching (zero-cross SSR / heavy-duty relays)',
			'Real-time brew temperature and water reservoir level sensing',
			'Local Web UI & MQTT / Home Assistant integration with physical fallback buttons'
		]
	}
];

export const stockVsUpgrade: ComparisonRow[] = [
	{
		subsystem: 'Main Controller',
		stockMelitta: 'Legacy ASIC / simple timer PCB (Burnt)',
		coffeenatorUpgrade: 'ESP32 with isolated DC buck supply & hardware watchdog',
		status: 'upgraded'
	},
	{
		subsystem: 'Boiler & Hotplate Switching',
		stockMelitta: 'Basic electromechanical relay switching',
		coffeenatorUpgrade: 'Zero-crossing SSR / opto-isolated relay channels with independent hotplate PWM/PID',
		status: 'upgraded'
	},
	{
		subsystem: 'Temperature Sensing',
		stockMelitta: 'Bimetallic thermostat switch only',
		coffeenatorUpgrade: 'Precision digital/NTC thermistors on boiler outlet & warming plate',
		status: 'new'
	},
	{
		subsystem: 'Water Level Detection',
		stockMelitta: 'Visual plastic sight-glass only (runs until dry)',
		coffeenatorUpgrade: 'Non-contact capacitive / load-cell water tank sensing + pre-brew check',
		status: 'new'
	},
	{
		subsystem: 'Connectivity & UI',
		stockMelitta: 'Single illuminated rocker switch',
		coffeenatorUpgrade: 'Physical tactile controls + OLED status display + Wi-Fi Web Dashboard & MQTT',
		status: 'new'
	},
	{
		subsystem: 'Over-Temperature Protection',
		stockMelitta: 'Inline thermal cutoffs (1-shot fuses)',
		coffeenatorUpgrade: 'Retained inline thermal fuses + software max-temp & dry-boil cutoff',
		status: 'retained'
	}
];

/**
 * Want to add another custom section to the page?
 * Simply add a new entry to `customSections` below—the UI automatically renders
 * it in both the navigation bar and the main page body!
 */
export const customSections: CustomSection[] = [
	{
		id: 'architecture',
		navLabel: 'Architecture',
		badge: 'SYSTEM DESIGN',
		title: 'Hardware & Safety Architecture',
		subtitle:
			'High-voltage espresso/coffee appliances demand strict isolation between 230V AC heaters and 3.3V logic.',
		cards: [
			{
				title: 'High-Voltage AC Domain (230V)',
				tag: 'MAINS ISOLATED',
				body: 'Handles the primary brew boiler heater and the carafe warming plate. Protected by the original Melitta inline thermal fuses and switched via opto-isolated relays/SSRs.',
				items: [
					'Primary brew heating element (~1100W - 1400W)',
					'Independent carafe warming element',
					'AC current / zero-cross detection for heater health verification',
					'Hi-Link / encapsulated AC-DC 5V supply with primary fuse + MOV surge protection'
				]
			},
			{
				title: 'Low-Voltage Logic & Sensor Bus (3.3V / 5V)',
				tag: 'ESP32 CORE',
				body: 'Runs the state machine, safety interlocks, local display/buttons, and wireless telemetry stack.',
				items: [
					'Boiler & hotplate temperature probes (NTC / DS18B20)',
					'Tank water level sensor (non-contact capacitive pads or HX711 load cell)',
					'Carafe presence detection switch (prevents brewing without pot)',
					'I2C OLED status screen + rotary encoder / tactile brew button'
				]
			},
			{
				title: 'Brew State Machine & Fail-Safes',
				tag: 'FIRMWARE',
				body: 'Deterministic finite-state machine ensuring heaters can never stay latched on if Wi-Fi drops or a sensor disconnects.',
				items: [
					'IDLE -> PRE_CHECK -> BREWING -> BLOOMING (optional) -> KEEP_WARM -> COOLDOWN',
					'Sensor sanity check: open/shorted thermistor triggers immediate heater inhibit',
					'Max brew-time cutoff timer independent of network connectivity',
					'OTA firmware updates disabled while heaters are active'
				]
			}
		]
	}
];
