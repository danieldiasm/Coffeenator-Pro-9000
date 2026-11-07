/**
 * ============================================================================
 * PROJECT REQUIREMENTS DATA
 * ============================================================================
 * Add or update engineering requirements here. The Requirements section on the
 * page lets visitors filter by category and status automatically.
 */

export type RequirementCategory = 'Hardware' | 'Sensors' | 'Firmware' | 'Wireless' | 'Safety';
export type RequirementPriority = 'Must-Have' | 'Should-Have' | 'Nice-to-Have';
export type RequirementStatus = 'completed' | 'in-progress' | 'planned';

export interface RequirementItem {
	id: string;
	title: string;
	category: RequirementCategory;
	priority: RequirementPriority;
	status: RequirementStatus;
	description: string;
	acceptanceCriteria: string[];
}

export const requirementsList: RequirementItem[] = [
	{
		id: 'REQ-HW-01',
		title: 'Custom Replacement Control Board in OEM Footprint',
		category: 'Hardware',
		priority: 'Must-Have',
		status: 'in-progress',
		description:
			'Design a replacement controller board that mounts cleanly inside the Melitta Excellent lower housing away from steam and water drips.',
		acceptanceCriteria: [
			'Fits within original internal enclosure clearances',
			'Uses insulated spade terminals matching the OEM Melitta wiring harness',
			'Includes conformal coating or moisture-resistant enclosure baffling'
		]
	},
	{
		id: 'REQ-SAF-01',
		title: 'Galvanic Isolation & Thermal Fuse Retention',
		category: 'Safety',
		priority: 'Must-Have',
		status: 'completed',
		description:
			'Maintain 100% hardware-level over-temperature protection and strict creepage distance between 230V AC mains and low-voltage sensor wiring.',
		acceptanceCriteria: [
			'Original inline thermal cutoffs wired in series with AC hot line',
			'Minimum 6mm creepage/clearance slot between HV and LV PCB zones',
			'Relays/SSRs default to OPEN (heaters OFF) on MCU reset or brownout'
		]
	},
	{
		id: 'REQ-SEN-01',
		title: 'Boiler & Hotplate Temperature Telemetry',
		category: 'Sensors',
		priority: 'Must-Have',
		status: 'in-progress',
		description:
			'Measure real-time temperature at the heating tube outlet and the carafe warming plate to prevent scorching and track brew cycles.',
		acceptanceCriteria: [
			'1 Hz minimum sampling rate with ±1.0°C accuracy in the 85°C–105°C range',
			'Automatic fault detection if thermistor reads open-circuit or short-circuit',
			'Accurate detection of water exhaustion via boiler temperature rise inflection'
		]
	},
	{
		id: 'REQ-SEN-02',
		title: 'Water Tank Level Sensing',
		category: 'Sensors',
		priority: 'Should-Have',
		status: 'planned',
		description:
			'Detect how many cups worth of water are in the tank before starting a remote or scheduled brew cycle.',
		acceptanceCriteria: [
			'Non-contact capacitive strip or weight sensor outside the wet reservoir',
			'Blocks remote auto-start if water level is below 2 cups',
			'Reports estimated cup count (0–10 cups) to dashboard'
		]
	},
	{
		id: 'REQ-SEN-03',
		title: 'Carafe Presence Detection',
		category: 'Sensors',
		priority: 'Should-Have',
		status: 'planned',
		description:
			'Verify that the glass jug is seated on the warming plate before allowing a wireless or scheduled brew to begin.',
		acceptanceCriteria: [
			'Microswitch or Hall-effect sensor triggered by carafe placement',
			'Pauses/alerts if carafe is removed mid-brew or during scheduled start'
		]
	},
	{
		id: 'REQ-FW-01',
		title: 'Offline-First Physical Controls',
		category: 'Firmware',
		priority: 'Must-Have',
		status: 'planned',
		description:
			'Anyone in the kitchen must be able to brew coffee with a single button press even if the Wi-Fi router or smart home server is offline.',
		acceptanceCriteria: [
			'Boot-to-ready time under 1.5 seconds',
			'Physical button toggles Start / Cancel brew immediately',
			'Status LEDs / mini OLED show current state clearly without a phone'
		]
	},
	{
		id: 'REQ-WL-01',
		title: 'Wi-Fi Dashboard, WebSockets & Home Assistant (MQTT)',
		category: 'Wireless',
		priority: 'Must-Have',
		status: 'planned',
		description:
			'Expose live sensor graphs, brew controls, keep-warm timers, and push notifications when coffee is ready.',
		acceptanceCriteria: [
			'MQTT auto-discovery for Home Assistant (sensors, switches, brew state)',
			'Embedded lightweight web UI served directly from the ESP32',
			'OTA (Over-The-Air) firmware update support when machine is idle'
		]
	}
];
