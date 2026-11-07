/**
 * ============================================================================
 * PROJECT PROGRESSION / BUILD LOG DATA
 * ============================================================================
 * Document every milestone, teardown discovery, schematic revision, or firmware
 * test by adding a new object to `progressionLogs` below.
 *
 * Tip: Put the newest entries at the top (or toggle the sort order in the UI).
 */

export type LogStatus = 'completed' | 'in-progress' | 'upcoming';

export interface ProgressionEntry {
	id: string;
	stepNumber: string;
	date: string;
	phase: string;
	title: string;
	status: LogStatus;
	summary: string;
	tasksCompleted: string[];
	nextSteps?: string[];
	metrics?: {
		label: string;
		value: string;
	}[];
	codeOrNotes?: {
		label: string;
		snippet: string;
	};
	tags: string[];
}

export const progressionLogs: ProgressionEntry[] = [
	{
		id: 'log-01-teardown',
		stepNumber: 'LOG #01',
		date: '2026-11-01',
		phase: 'Phase 1 // Teardown & Post-Mortem',
		title: 'Melitta Excellent Disassembly & Burnt Mainboard Diagnosis',
		status: 'completed',
		summary:
			'Opened the lower housing of the Melitta Excellent after the machine died mid-cycle. Inspected the OEM power/control PCB, traced the internal mains wiring harness, and verified that both heating elements and thermal safety fuses survived.',
		tasksCompleted: [
			'Removed bottom cover and documented factory wire colors and spade connectors',
			'Identified burnt power stage / control trace failure on the stock PCB',
			'Measured continuity and resistance across primary boiler element and warming plate',
			'Confirmed factory inline thermal fuses are intact and properly clamped to the heater block'
		],
		nextSteps: [
			'Measure physical mounting standoffs inside the base enclosure',
			'Select isolated AC-DC 5V/3.3V module and SSR/relay ratings'
		],
		metrics: [
			{ label: 'Boiler Heater', value: 'Intact (Continuity OK)' },
			{ label: 'Thermal Fuses', value: 'Intact (0.1 Ω)' },
			{ label: 'OEM Control PCB', value: 'Burnt / Failed' }
		],
		codeOrNotes: {
			label: 'Internal Harness Pinout Notes',
			snippet: `// Melitta Excellent Internal AC Harness Mapping
// [L_IN]  -> Inline Thermal Cutoff Fuse -> Boiler Element & Relay Common
// [N_IN]  -> Shared Neutral Star Point (Boiler + Hotplate + PSU_N)
// [SW_1]  -> Front Panel Switch / Status Lamp Feed
// [HP_1]  -> Carafe Warming Plate Element`
		},
		tags: ['Teardown', 'Diagnostics', 'AC Mains', 'Melitta Excellent']
	},
	{
		id: 'log-02-architecture',
		stepNumber: 'LOG #02',
		date: '2026-11-07',
		phase: 'Phase 1 // Architecture & Sensor Selection',
		title: 'Defining the Coffeenator Pro 9000 Upgrade Spec & Repository Setup',
		status: 'in-progress',
		summary:
			'Specified the replacement MCU (ESP32), isolated AC switching strategy, and the new sensor suite to turn the dead brewer into a connected smart appliance. Initialized the repository and SvelteKit project portal.',
		tasksCompleted: [
			'Defined system requirements across Hardware, Safety, Sensors, Firmware, and Wireless',
			'Designed split HV/LV architecture to keep 230V mains strictly isolated from ESP32 GPIO',
			'Selected temperature probe mounting points (boiler exit tube + warming plate underside)',
			'Built interactive SvelteKit documentation & telemetry portal for GitHub Pages'
		],
		nextSteps: [
			'Bench-test NTC/DS18B20 temperature sensors with boiling water calibration',
			'Prototype capacitive water-level strips on the outer wall of the Melitta tank',
			'Draft KiCad schematic v0.1 for the replacement controller board'
		],
		metrics: [
			{ label: 'MCU Platform', value: 'ESP32 (Wi-Fi + BLE)' },
			{ label: 'Target Sensor Channels', value: '4 Channels' },
			{ label: 'Isolation Rating', value: '>= 3000V RMS Opto' }
		],
		codeOrNotes: {
			label: 'Target ESP32 Pin Allocation (Draft v0.1)',
			snippet: `GPIO 04 -> SSR_BOILER_PIN      (Active-High via Optocoupler, hardware pulldown)
GPIO 05 -> SSR_HOTPLATE_PIN    (Zero-Cross PWM / PID warming control)
GPIO 34 -> NTC_BOILER_ADC      (Boiler outlet temperature probe)
GPIO 35 -> NTC_HOTPLATE_ADC    (Warming plate temperature probe)
GPIO 32 -> TANK_LEVEL_SENSE    (Capacitive / HX711 water level input)
GPIO 18 -> CARAFE_SWITCH_PIN   (Microswitch: Jug seated on hotplate)
GPIO 21/22 -> I2C_SDA / SCL    (0.96" OLED Display & expansion)`
		},
		tags: ['Architecture', 'ESP32', 'Sensors', 'SvelteKit']
	},
	{
		id: 'log-03-bench-prototype',
		stepNumber: 'LOG #03',
		date: 'Upcoming',
		phase: 'Phase 2 // Bench Prototyping',
		title: 'Breadboard Validation & Sensor Calibration outside the Chassis',
		status: 'upcoming',
		summary:
			'Before switching 230V AC inside the coffee maker, validate the ESP32 state machine, thermistor response curves, water level readings, and fail-safe watchdog behavior on the bench.',
		tasksCompleted: [
			'Assemble low-voltage breadboard with ESP32, OLED, and simulated heater LEDs',
			'Calibrate thermistor Steinhart-Hart coefficients at 25°C, 60°C, and 98°C',
			'Test non-contact water level sensing through the plastic reservoir wall'
		],
		tags: ['Prototyping', 'Calibration', 'Bench Test']
	},
	{
		id: 'log-04-pcb-integration',
		stepNumber: 'LOG #04',
		date: 'Upcoming',
		phase: 'Phase 3 // Custom PCB & First Smart Brew',
		title: 'PCB Assembly, Chassis Integration & First Wireless Brew Cycle',
		status: 'upcoming',
		summary:
			'Mount the custom replacement board into the Melitta Excellent base, connect the OEM spade harness, verify thermal safety cutoffs, and run the first full telemetry-monitored pot of coffee.',
		tasksCompleted: [
			'Install replacement PCB in moisture-protected enclosure inside the base',
			'Perform thermal imaging & creepage check under full 1400W load',
			'Connect MQTT / Home Assistant dashboard and log first complete brew curve'
		],
		tags: ['PCB', 'Integration', 'MQTT', 'First Brew']
	}
];
