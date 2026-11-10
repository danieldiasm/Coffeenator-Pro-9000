# 🌡️ Sensor & Detection Requirements (`REQ-SEN-*`)

> **Scope:** Covers the three magnetic reed switch detection channels (`SW1`, `SW2`, `SW3` on [`coffeenator.kicad_sch`](../hardware/main-board/coffeenator.kicad_sch)) for water level, carafe presence, and filter support/bucket closure, as well as future-planned boiler/hotplate temperature telemetry.

---

## `REQ-SEN-01` — Boiler & Hotplate Temperature Telemetry (Future Expansion)

- **Category:** Sensors (`SEN`)
- **Priority:** Nice-to-Have *(Planned for Later Implementation — Sensors Purchased)*
- **Status:** Planned (Future Hardware/Firmware Expansion)
- **Description:**  
  Measure real-time temperature at the heating tube outlet and the carafe warming plate in a future hardware/firmware iteration to track brew temperature curves, prevent coffee scorching, and detect water exhaustion thermally. *(Note: The initial v1.0 mainboard in `coffeenator.kicad_sch` operates without temperature probes; sensors have been acquired to implement this feature in a subsequent revision.)*
- **Acceptance Criteria:**
  1. Reserved GPIO/ADC or 1-Wire expansion capability on `U1` (`ESP32-C3`) to interface with the acquired boiler and hotplate temperature sensors in a later milestone.
  2. 1 Hz minimum sampling rate with ±1.0°C accuracy in the 85°C–105°C brewing range once installed.
  3. Automatic fault detection (`REQ-SAF-04`) if an enabled temperature sensor reads open-circuit or short-circuit.
  4. Firmware modular sensor interface (`ISensorInput`) allows temperature telemetry to be enabled via configuration/compile flag without restructuring the core `BrewFSM`.

### Verification & Test Documentation (`TC-SEN-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Sensor accuracy can be calibrated against a reference thermometer at fixed thermal points (ice bath 0°C, ambient 25°C, boiling water 100°C) when the expansion is fitted. While unpopulated in v1.0, the firmware's modular sensor interface can be tested with mocked temperature values.
- **Test Description:**
  1. Verify that with temperature sensing disabled in v1.0 configuration, the brew state machine relies cleanly on the reed sensors (`REQ-SEN-02`–`04`) and watchdog timers (`REQ-SAF-05`) without false sensor faults.
  2. When temperature probes are connected in the later revision, immerse or thermally couple the probes alongside a calibrated reference thermocouple at 25°C, 60°C, 85°C, and 100°C and log readings at 1 Hz.
  3. *Pass Criteria:* Clean v1.0 operation with temperature module disabled; temperature error <= ±1.0°C in the 85°C–105°C range once sensors are installed.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Calibrated K-Type Reference Thermometer, Serial Data Logger CSV script, Unit test with `MockTemperatureSensor`.
  - **Execution:** Unit test `BrewFSM` with both `TempSensorEnabled = false` (v1.0 baseline) and `TempSensorEnabled = true` (future expansion).

---

## `REQ-SEN-02` — Water Tank Level Detection (`SW_Reed`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Detect whether sufficient water is present in the tank via a magnetic reed switch float (`SW_Reed` on `coffeenator.kicad_sch`) before starting a brew cycle, preventing dry-boil activation.
- **Acceptance Criteria:**
  1. Uses a magnetic reed switch (`SW_Reed` with hardware RC filter `10 kΩ` + `100 nF` on `coffeenator.kicad_sch`) isolated from the drinking water inside the reservoir.
  2. Blocks remote, scheduled, or manual brew start if the water level reed switch indicates the tank is empty (`WATER_PRESENT == false`).
  3. Detects water exhaustion when the float drops to the empty position at the end of a brew cycle, transitioning the machine from `BREWING` (boiler heater `K1` OFF) to `KEEP_WARM` (hotplate `K2`).

### Verification & Test Documentation (`TC-SEN-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Reed switch state transitions (`OPEN` vs. `CLOSED`) are discrete and repeatable as water crosses the minimum float threshold and as the tank empties during a brew.
  - *Boundary Conditions:* Water sloshing during filling; float reaching bottom at end of brew.
- **Test Description:**
  1. With an empty water tank, attempt to start a brew (via button, BLE, or remote wake-up) -> verify `K1` remains OFF and status reports `WATER_EMPTY`.
  2. Fill the reservoir past the minimum threshold -> verify the reed switch closes cleanly and `WATER_OK` is reported.
  3. Drain the reservoir during an active `BREWING` test -> verify that when the reed float drops (plus software debounce window), primary boiler relay `K1` turns OFF and the machine transitions to `KEEP_WARM`.
  4. *Pass Criteria:* Brew start is strictly blocked when empty; end-of-water float drop reliably de-energizes `K1` with zero contact-bounce false triggers.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Graduated Measuring Cylinder, Multimeter / Logic Analyzer on `U1` reed input pin, C/C++ Unit Test for water-empty debounce timer.
  - **Execution:** Bench test filling and draining the Melitta tank across 10 cycles.

---

## `REQ-SEN-03` — Carafe Presence Detection (`SW_Reed`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Verify that the glass carafe (jug) is properly seated on the warming plate via a magnetic reed sensor (`SW_Reed` on `coffeenator.kicad_sch`) before allowing any brew cycle to begin, preventing hot coffee from overflowing onto the counter.
- **Acceptance Criteria:**
  1. Reed switch (`SW_Reed` with hardware RC filter `10 kΩ` + `100 nF` on `coffeenator.kicad_sch`) detects the magnet coupled to the carafe / placement mechanism.
  2. Blocks any manual, BLE, remote wake-up, or one-off scheduled brew start if the carafe is missing (`CARAFE_PRESENT == false`).
  3. If the carafe is removed for more than 20 seconds mid-brew, pauses the boiler heater (`K1` OFF) and alerts the user until the carafe is returned.

### Verification & Test Documentation (`TC-SEN-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Carafe seated vs. removed is a binary hardware input (`SW_Reed` on `coffeenator.kicad_sch`) with deterministic timeout behavior in the brew state machine.
- **Test Description:**
  1. Remove the glass carafe from the warming plate and trigger a brew -> verify `K1` remains OFF and status indicates `CARAFE_MISSING`.
  2. Place the empty carafe (and a full 10-cup carafe) on the warming plate across normal seating angles -> verify reliable reed switch activation.
  3. Remove the carafe during an active `BREWING` cycle:
     - Return it within 10 seconds -> verify brew continues seamlessly (pouring a quick cup).
     - Leave it off for > 20 seconds -> verify `K1` pauses to prevent filter overflow.
  4. *Pass Criteria:* 100% detection across normal seating positions; pre-brew block and >20s mid-brew pause work deterministically.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Melitta Excellent Glass Carafe, Unit Test for `BrewFSM` carafe-removal timer, Logic Analyzer.
  - **Execution:** Automated software unit test for the 20s pause timer + 10 physical seating trials.

---

## `REQ-SEN-04` — Filter Support / Filter Bucket Presence & Closure Detection (`SW_Reed`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Verify that the coffee filter support / swivel filter bucket is properly inserted and closed via the third magnetic reed switch channel (`SW_Reed` on `coffeenator.kicad_sch`) before energizing the boiler heater (`K1`) and during the brew cycle, preventing scalding hot water from spraying or pouring straight onto the warming plate without the filter assembly in place.
- **Acceptance Criteria:**
  1. Dedicated reed switch input (`SW_Reed` with hardware RC filter `10 kΩ` + `100 nF` on `coffeenator.kicad_sch`) detects when the filter support / filter bucket is fully seated/closed in the brewing position.
  2. Blocks any brew start (manual button, BLE, one-off automation, or remote server wake-up) if the filter bucket is open or removed (`FILTER_CLOSED == false`).
  3. Immediately de-energizes the primary boiler heater (`K1` OFF within <= 200 ms) if the filter support/bucket is swung open or removed during an active `BREWING` cycle to protect the user from hot water/steam splashes.
  4. Reports filter bucket status (`FILTER_OK` / `FILTER_OPEN`) to local LEDs (`D3`/`D4`) and via BLE / configured API.

### Verification & Test Documentation (`TC-SEN-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Opening or removing the filter bucket opens the magnetic reed switch (`SW_Reed`), producing a clean logic level transition at `U1` via the hardware RC debounce network (`R1`–`R3`, `C1`–`C3`). Both pre-brew inhibit and mid-brew emergency pause latency are directly measurable.
  - *Boundary Conditions:* Filter bucket slightly ajar (not fully latched); filter bucket swung open suddenly while boiling water is pumping.
- **Test Description:**
  1. Open or remove the filter bucket/support and attempt to start a brew via physical button, BLE, and API -> verify `K1` stays strictly OFF and status reports `FILTER_OPEN`.
  2. Close/seat the filter bucket slightly ajar (5 mm before latch position) -> verify reed switch only closes when the bucket is properly seated in its safe brewing alignment.
  3. Start a `BREWING` cycle (`K1` ON), then open the filter bucket mid-brew -> measure the time from reed switch opening to `K1` relay de-energizing.
  4. *Pass Criteria:* 100% pre-brew block when filter bucket is open/missing; mid-brew opening cuts `K1` power within <= 200 ms.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Melitta Excellent Filter Bucket Assembly + Magnet, Logic Analyzer (probing Reed Switch GPIO pin vs. `Q1`/`K1` drive pin), C/C++ Unit Test for `BrewFSM` filter-open interlock.
  - **Execution:** Measure hardware-to-relay cutoff latency on logic analyzer across 10 mid-brew bucket-open tests and run unit tests for `FILTER_OPEN` state handling.
