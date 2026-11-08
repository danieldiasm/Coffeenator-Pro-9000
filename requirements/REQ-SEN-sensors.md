# 🌡️ Sensor & Telemetry Acquisition Requirements (`REQ-SEN-*`)

> **Scope:** Covers temperature, water level, and carafe presence sensing used for closed-loop brew control, pre-brew safety interlocks, and optional API telemetry.

---

## `REQ-SEN-01` — Boiler & Hotplate Temperature Telemetry

- **Category:** Sensors (`SEN`)
- **Priority:** Must-Have
- **Status:** In-Progress
- **Description:**  
  Measure real-time temperature at the heating tube outlet and the carafe warming plate to prevent scorching, detect water exhaustion (end-of-brew inflection), and track brew cycles.
- **Acceptance Criteria:**
  1. 1 Hz minimum sampling rate with ±1.0°C accuracy in the 85°C–105°C brewing range.
  2. Automatic fault detection (`REQ-SAF-04`) if a temperature sensor reads open-circuit or short-circuit.
  3. Accurate detection of water exhaustion via boiler temperature rise inflection (transitioning from ~96°C water-boiling plateau to >104°C dry-heater rise).

### Verification & Test Documentation (`TC-SEN-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Sensor accuracy can be calibrated against a reference thermometer at fixed thermal points (ice bath 0°C, ambient 25°C, boiling water 100°C). End-of-brew inflection can be verified by recording a complete water-boil-out curve.
- **Test Description:**
  1. Immerse or thermally couple the temperature probe alongside a calibrated reference thermocouple at 25°C, 60°C, 85°C, and 100°C.
  2. Log sensor readings from `U1` at 1 Hz and compute absolute error across the 85°C–105°C window.
  3. Run a 2-cup water brew cycle until the tank empties and verify the software inflection detector triggers within 10 seconds of water exhaustion.
  4. *Pass Criteria:* Temperature error <= ±1.0°C in the 85°C–105°C range; 100% reliable end-of-brew detection without tripping the thermal fuse.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Calibrated K-Type Reference Thermometer, Serial Data Logger CSV script, Unit test with recorded CSV temperature curve replay.
  - **Execution:** Replay captured real-world brew temperature curves in the C/C++ unit test suite to verify deterministic inflection detection.

---

## `REQ-SEN-02` — Water Tank Level Sensing

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** Planned (Reed Switch / Non-Contact Interface on `coffeenator.kicad_sch`)
- **Description:**  
  Detect whether sufficient water is present in the tank (and/or estimate cup level) before starting a remote wake-up or one-off scheduled brew cycle.
- **Acceptance Criteria:**
  1. Uses magnetic reed switch float(s) (`SW1`/`SW2`/`SW3` `SW_Reed` inputs on `coffeenator.kicad_sch`) or non-contact capacitive/weight sensing outside the wet reservoir so no exposed DC electrodes contact drinking water.
  2. Blocks remote or scheduled auto-start if the water level is below the minimum safe brew threshold (e.g., < 2 cups / empty tank).
  3. Exposes current water level status (`EMPTY` / `OK` or estimated cup count) to the local state machine and configured API/BLE service.

### Verification & Test Documentation (`TC-SEN-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Reed switch / level sensor transitions are discrete and repeatable as water is added in 1-cup (125 mL) increments.
  - *Boundary Conditions:* Sloshing water when filling; minimum threshold hysteresis around the 2-cup mark.
- **Test Description:**
  1. Start with an empty water reservoir; verify sensor reports `WATER_EMPTY` and blocks a remote/scheduled `START_BREW` command.
  2. Fill the reservoir in 1-cup (125 mL) increments up to 10 cups, recording the sensor state at each step.
  3. Drain the reservoir in 1-cup increments to measure hysteresis between rising and falling thresholds.
  4. *Pass Criteria:* Remote brew is strictly blocked below 2 cups; sensor transitions cleanly (via hardware RC filter `R1`–`R3` / `C1`–`C3` plus software debounce) with zero false triggers.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Graduated Measuring Cylinder (125 mL increments), Multimeter / Serial Telemetry Monitor.
  - **Execution:** Bench calibration table mapping tank volume (mL) to sensor state transitions.

---

## `REQ-SEN-03` — Carafe Presence Detection

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** Planned (Reed Switch / Microswitch Interface on `coffeenator.kicad_sch`)
- **Description:**  
  Verify that the glass carafe (jug) is properly seated on the warming plate before allowing a wireless, remote wake-up, or one-off scheduled brew to begin, preventing hot coffee from overflowing onto the counter.
- **Acceptance Criteria:**
  1. Reed switch (`SW_Reed` with magnet on carafe base/drip-stop lever) or microswitch detects carafe placement reliably.
  2. Blocks any scheduled or remote brew start if the carafe is missing (`CARAFE_PRESENT == false`).
  3. If the carafe is removed for more than 20 seconds mid-brew, pauses the boiler heater (`K1` OFF) and alerts the user until the carafe is returned.

### Verification & Test Documentation (`TC-SEN-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Carafe seated vs. removed is a binary hardware input (`SW_Reed` on `coffeenator.kicad_sch`) with deterministic timeout behavior in the brew state machine.
- **Test Description:**
  1. Remove the glass carafe from the warming plate and trigger a scheduled/remote brew; verify `K1` remains OFF and status indicates `CARAFE_MISSING`.
  2. Place the empty carafe (and a full 10-cup carafe) on the warming plate at various rotational angles (0°, 45°, 90°, 180°) to ensure reliable detection.
  3. Remove the carafe during an active `BREWING` cycle:
     - Return it within 10 seconds -> verify brew continues seamlessly (pouring a quick cup).
     - Leave it off for > 20 seconds -> verify `K1` pauses to prevent filter basket overflow.
  4. *Pass Criteria:* 100% detection across normal seating angles; pre-brew block and >20s mid-brew pause work deterministically.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Melitta Excellent Glass Carafe, Unit Test for `BrewStateMachine` carafe-removal timer, Logic Analyzer.
  - **Execution:** Automated software unit test for the 20s pause timer + 10 physical seating trials.
