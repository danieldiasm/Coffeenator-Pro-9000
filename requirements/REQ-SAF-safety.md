# 🛡️ Safety & Fail-Safe Requirements (`REQ-SAF-*`)

> **Core Philosophy:** The Coffeenator Pro 9000 switches high-power 230V AC heating elements (~1100W–1400W). Above all else, the machine must be electrically and thermally safe, default to a de-energized state on any hardware or software fault, and continue to operate safely as a standard manual coffee maker if any smart/wireless subsystem fails.

---

## `REQ-SAF-01` — Galvanic Isolation & Thermal Fuse Retention

- **Category:** Safety (`SAF`)
- **Priority:** Must-Have
- **Status:** Completed / Verified in Architecture
- **Description:**  
  The system shall maintain 100% hardware-level over-temperature protection independent of the microcontroller (`U1`) and enforce strict galvanic isolation and creepage/clearance distance between the 230V AC mains domain and the low-voltage (12V / 5V / 3.3V) logic and sensor domain.
- **Acceptance Criteria:**
  1. Original Melitta inline thermal cutoff fuses remain wired in series with the AC hot line feeding the primary boiler and warming plate heaters.
  2. Minimum 6.0 mm creepage and clearance distance (with isolation milling slots where applicable) is maintained between 230V AC traces (`K1`/`K2` contact side, `U3` AC input) and low-voltage DC nets on `coffeenator.kicad_pcb`.
  3. The AC-DC converter (`U3` AK-L1-025) and electromechanical relays (`K1`, `K2` SANYOU SRD Form-C) provide reinforced dielectric isolation (>= 1500V–3000V RMS) between primary AC and secondary DC circuits.

### Verification & Test Documentation (`TC-SAF-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Physical PCB layout geometry, inline wiring continuity, and isolation resistance between HV and LV domains can be measured directly without energizing the MCU.
  - *Risks & Boundary Conditions:* Moisture condensation inside the lower brewer housing reducing surface creepage; thermal runaway if both relay contacts weld shut.
- **Test Description:**
  1. Inspect DRC (Design Rule Check) clearance rules in `coffeenator.kicad_pcb` between AC mains nets and `GND`/`VCC` nets.
  2. Measure continuity of the factory inline thermal fuses in series with the heater phase line.
  3. Apply a 500V/1000V DC insulation resistance test (megohmmeter) between shorted AC mains input terminals (L+N) and low-voltage `GND`.
  4. *Pass Criteria:* Creepage >= 6.0 mm everywhere; thermal fuses in series (< 0.2 Ω); insulation resistance >= 100 MΩ.
- **Test Implementation (Hardware):**
  - **Tools:** KiCad DRC Clearance Report, Digital Multimeter (4-wire resistance), Insulation Tester (500V/1000V DC Megger).
  - **Execution:** Run `kicad-cli pcb drc` on `hardware/main-board/coffeenator.kicad_pcb` and record bench insulation measurements prior to first AC power-up.

---

## `REQ-SAF-02` — Fail-Safe Default-OFF Heater Switching Stage

- **Category:** Safety (`SAF`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  All heater power switching stages (`K1` and `K2`) shall default to the OPEN (de-energized / heaters OFF) state whenever the microcontroller (`U1` ESP32-C3) is in reset, unpowered, booting, brownout, or its GPIO pins are tri-stated (High-Z).
- **Acceptance Criteria:**
  1. Relay coils (`K1`, `K2`) are wired to the Normally Open (NO) contact path for heater loads so that zero coil current physically disconnects AC power.
  2. NPN relay driver transistors (`Q1`, `Q3`) include dedicated base-to-GND pull-down resistors (`R8` = 10 kΩ, `R9` = 10 kΩ) to prevent floating-base turn-on when `U1` GPIOs (`Pin 21`/`Pin 22`) are high-impedance.
  3. Flyback diodes (`D1`, `D2` = `1N4007`) and bulk decoupling capacitors (`C4`, `C5` = `100 µF`) protect the driver transistors and prevent voltage spikes from causing erratic MCU resets during relay release.

### Verification & Test Documentation (`TC-SAF-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* ESP32-C3 GPIOs default to input/pull-up or high-Z during reset and bootloader execution. The hardware pull-down network (`R5`/`R8` and `R6`/`R9`) must keep `V_BE` of `Q1` and `Q3` well below the ~0.6V BJT turn-on threshold during reset.
  - *Boundary Conditions:* Power-on ramp (0V to 5V), MCU held in `RST`, and sudden 5V brownout.
- **Test Description:**
  1. Power the board with 12V/5V DC while holding `U1` (`ESP32-C3-DevKitM-1`) in hardware reset (`RST` tied to `GND`), or remove `U1` from its socket.
  2. Measure base voltages `V_B(Q1)` and `V_B(Q3)` and check continuity across `K1` and `K2` NO-COM contacts.
  3. Leave `U1` control pins floating and apply a 3.3V transient via a weak 47 kΩ pull-up (simulating internal weak pull-up during boot) to verify if the 10 kΩ pull-down holds the relay off or if pin selection avoids boot-strapping pull-ups.
  4. *Pass Criteria:* `K1` and `K2` remain strictly OPEN during power-up, reset hold, and MCU removal.
- **Test Implementation (Hardware):**
  - **Tools:** Bench DC Power Supply, Oscilloscope (monitoring `Q1`/`Q3` collector voltage and `VCC` during power-up/reset), Digital Multimeter.
  - **Execution:** Probe `Q1` Pin 1 (Collector) and `Q3` Pin 1 (Collector) across 10 consecutive power-cycles and manual reset presses; verify zero relay chatter or unintended closure.

---

## `REQ-SAF-03` — Degraded Mode / Offline Appliance Fallback ("ABS Principle")

- **Category:** Safety (`SAF`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  Just like a car whose Anti-lock Braking System (ABS) fails—where the ABS warning indicator illuminates, but the mechanical hydraulic brakes and engine continue to operate safely—the coffee machine shall operate reliably as a basic, safe domestic coffee appliance if Wi-Fi connectivity is lost, the remote server is unreachable, BLE is disconnected, or the configuration file is missing/corrupted.
- **Acceptance Criteria:**
  1. Any failure in the network stack (Wi-Fi disconnect, DHCP failure, DNS/API timeout, BLE stack error) is strictly isolated from the core brewing and safety task/loop.
  2. Physical button inputs (`SW1`–`SW3`) and hardware safety timers remain 100% responsive (< 100 ms latency) regardless of wireless connection state or retry loops.
  3. A wireless fault or missing configuration never aborts an active manual brew cycle and never blocks the user from starting or canceling a brew via the physical machine controls.

### Verification & Test Documentation (`TC-SAF-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Network failures often block single-threaded firmware loops if synchronous socket calls are used. By testing physical control latency and brew completion under forced RF/network faults, decoupling is directly verifiable.
  - *Failure Modes:* Access Point powered off mid-brew; API server returning HTTP 500 or hanging TCP connections; corrupted flash config file on boot.
- **Test Description:**
  1. Boot the machine with no configuration file in flash and no Wi-Fi router turned on; press the physical Brew button and verify normal brewing and safety cutoffs.
  2. Start a brew while connected to Wi-Fi, then abruptly cut power to the Wi-Fi Access Point mid-brew.
  3. Configure the API endpoint to a blackhole IP address that drops packets (causing TCP connection timeouts) and test physical Start/Stop button responsiveness.
  4. *Pass Criteria:* Brew cycle executes normally in all scenarios; physical button response latency remains <= 100 ms; thermal and dry-boil cutoffs remain active.
- **Test Implementation (Software & Hardware-in-the-Loop):**
  - **Tools:** Automated firmware integration test suite (mocking network timeout/disconnect states) + Bench HIL test cutting AP power during an active relay cycle.
  - **Execution:** Measure GPIO latency from `SW1` press to `K1` relay actuation using a logic analyzer while the Wi-Fi subsystem is actively failing reconnection attempts.

---

## `REQ-SAF-04` — Hardware Interlock & Sensor Safety Cutoff (Reed Sensors & Future Temp Probes)

- **Category:** Safety (`SAF`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The firmware safety supervisor shall continuously validate all active sensor interlocks before and during heating. If any required reed switch interlock opens (water tank empty per `REQ-SEN-02`, carafe missing per `REQ-SEN-03`, or filter support/bucket open per `REQ-SEN-04`), or—once the future temperature sensors (`REQ-SEN-01`) are installed—if a temperature probe faults or exceeds the dry-boil limit, the primary boiler heater (`K1`) shall be de-energized immediately.
- **Acceptance Criteria:**
  1. **Pre-Brew Interlock:** Boiler heater `K1` is strictly inhibited from turning ON unless all three reed sensors confirm safe physical state (`WATER_OK`, `CARAFE_PRESENT`, and `FILTER_CLOSED`).
  2. **Mid-Brew Cutoff:** Opening the filter support/bucket (`REQ-SEN-04`) or exhausting water (`REQ-SEN-02`) immediately cuts power to `K1`; removing the carafe (`REQ-SEN-03`) pauses `K1` if not returned within the safe drip-stop window.
  3. **Future Temperature Probe Cutoff (`REQ-SEN-01`):** When temperature sensors are enabled in a later revision, open/short thermistor faults or temperatures > 108°C force `K1` and `K2` OFF within <= 1.0 second.
  4. Fault or interlock-trip state is visually indicated on the local status LEDs (`D3`, `D4`).

### Verification & Test Documentation (`TC-SAF-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Reed sensor inputs (`SW1`–`SW3`) can be toggled open/closed on the bench to verify pre-brew blocking and mid-brew cutoff response times. Future temperature fault thresholds can be verified via unit test mocks and resistor substitution when populated.
  - *Boundary Conditions:* Filter bucket opened mid-brew; water float dropping empty; carafe removed mid-brew.
- **Test Description:**
  1. Test each reed interlock (`SW1`, `SW2`, `SW3`) in the OPEN (unsafe) state prior to brewing -> verify `K1` cannot be energized by button, BLE, automation, or remote server wake-up.
  2. Initiate `BREWING` state (`K1` energized with all 3 reed switches closed), then open the filter bucket reed switch -> measure time until `K1` opens.
  3. Repeat mid-brew opening for the water tank reed switch and carafe reed switch.
  4. *Pass Criteria:* Heater relay `K1` is 100% blocked when any reed interlock is unsafe and de-energizes within spec when tripped mid-brew.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Jumper switches / Reed magnets on `SW1`–`SW3`, Logic Analyzer, C/C++ Unit Tests for `safety_supervisor` module.
  - **Execution:** Unit test `SafetySupervisor::evaluateInterlocks()` across all $2^3 = 8$ reed switch combinations (plus future temperature fault states) and verify hardware relay cutoff on the bench.

---

## `REQ-SAF-05` — Independent Maximum Brew & Keep-Warm Watchdog Timer

- **Category:** Safety (`SAF`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The system shall enforce both a hardware MCU watchdog timer (WDT) and a hard software maximum duration timer for `BREWING` and `KEEP_WARM` states so that heaters can never remain energized indefinitely due to a firmware hang or undetected sensor drift.
- **Acceptance Criteria:**
  1. Hardware Watchdog Timer (ESP32-C3 TWDT / RTC WDT) resets the MCU within <= 3.0 seconds if the main control/safety task stalls, immediately dropping `K1` and `K2` via hardware pull-downs (`REQ-SAF-02`).
  2. Hard maximum `BREWING` timeout (configurable, default 12 minutes) forces primary boiler heater `K1` OFF even if end-of-brew temperature inflection was not detected.
  3. Hard maximum `KEEP_WARM` timeout (configurable, default 40 minutes) forces warming plate relay `K2` OFF and returns the machine to `IDLE`.

### Verification & Test Documentation (`TC-SAF-05`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Watchdog recovery can be tested by injecting a deliberate infinite loop (`while(1){}`) in a test build; state timeouts can be tested with accelerated clock ticks in unit tests and real-time soak tests on the bench.
- **Test Description:**
  1. Trigger a test fault command that freezes the main firmware thread while `K1` is energized; measure time until MCU resets and `K1` opens.
  2. Run a simulated brew where temperature is held artificially constant at 90°C (never triggering dry-boil inflection); verify `K1` turns off at `MAX_BREW_TIME`.
  3. *Pass Criteria:* Hardware WDT resets MCU and opens relays in <= 3.0 s; `BREWING` and `KEEP_WARM` never exceed their maximum configured durations.
- **Test Implementation (Software & Hardware):**
  - **Tools:** ESP-IDF / Arduino TWDT test hook, Virtual Clock / Mock Timer in unit test suite, Bench Stopwatch/Logger.
  - **Execution:** Automated unit tests with mocked `millis()` advancing past 12 min and 40 min limits + 1 physical WDT lockup test on `U1`.
