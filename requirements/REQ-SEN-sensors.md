# 🌡️ Sensor & Detection Requirements (`REQ-SEN-*`)

> **Scope:** Covers the two `PT1000` platinum RTD temperature sensor circuits (`TH1`, `TH2`) and the three magnetic reed switch detection channels (`SW1`, `SW2`, `SW3`) on [`coffeenator.kicad_sch`](../hardware/main-board/coffeenator.kicad_sch) for water tank level, carafe presence, and filter hopper closure.

Review Status: Reviewing
---

## `REQ-SEN-01` — Boiler & Hot-Plate PT1000 Temperature Telemetry (`TH1`, `TH2`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have *(Implemented in Schematic `coffeenator.kicad_sch` — Firmware Integration Planned)*
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Measure real-time temperature at the primary boiler heating tube (`TH1` `PT1000`) and the carafe warming plate (`TH2` `PT1000`) using precision `1 kΩ` reference voltage dividers (`R11`, `R12`) tied to the `3.3V` analog reference rail and sampled by `U1`'s ADC channels (`IO0`/`ADC1_CH0` and `IO1`/`ADC1_CH1`).
- **Acceptance Criteria:**
  1. **Boiler Temperature Sensor (`TH1`):** `PT1000` platinum RTD wired in a low-side voltage divider with `R11` (`1 kΩ` to `3.3V`) and `TH1` to `GND`, routed to `U1` **Pin 9 (`IO0` / `ADC1_CH0`)**.
  2. **Hot-Plate Temperature Sensor (`TH2`):** `PT1000` platinum RTD wired in a low-side voltage divider with `R12` (`1 kΩ` to `3.3V`) and `TH2` to `GND`, routed to `U1` **Pin 10 (`IO1` / `ADC1_CH1`)**.
  3. 1 Hz minimum sampling rate with oversampling/filtering to achieve ±1.0°C accuracy in the 85°C–105°C brewing range ($R_{\text{PT1000}}(0^\circ\text{C}) = 1000\,\Omega$, $R_{\text{PT1000}}(100^\circ\text{C}) \approx 1385\,\Omega$, producing $V_{\text{ADC}} \approx 1.65\,\text{V}$ at $0^\circ\text{C}$ and $\approx 1.916\,\text{V}$ at $100^\circ\text{C}$).
  4. Automatic fault detection (`REQ-SAF-04`) if either sensor reads open-circuit ($V_{\text{ADC}} \to 3.3\,\text{V}$) or short-circuit ($V_{\text{ADC}} \to 0.0\,\text{V}$).
  5. Firmware modular sensor interface (`ISensorInput`) allows the machine to operate either with full PT1000 closed-loop telemetry or in reed-only fallback mode if probes are unpopulated during early bring-up.

### Verification & Test Documentation (`TC-SEN-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* With `R11 = R12 = 1 kΩ` connected to `3.3V` and `TH1`/`TH2` (`PT1000`) to `GND`, the divider output voltage follows $V_{\text{out}}(T) = 3.3\,\text{V} \times \frac{R_{\text{PT1000}}(T)}{1000\,\Omega + R_{\text{PT1000}}(T)}$, which can be verified with precision decade resistors (1000 Ω for 0°C, 1097 Ω for 25°C, 1385 Ω for 100°C) as well as against a calibrated reference thermometer.
- **Test Description:**
  1. Substitute precision test resistors ($1000\,\Omega$, $1097\,\Omega$, $1385\,\Omega$) across the `TH1` and `TH2` terminals and measure the DC voltage at `U1` Pin 9 (`IO0`) and Pin 10 (`IO1`) -> confirm readings match theoretical divider values ($1.650\,\text{V}$, $1.727\,\text{V}$, $1.916\,\text{V}$).
  2. Disconnect `TH1` (open-circuit -> `3.3V`) and short `TH1` (`0.0V`) -> verify firmware flags `SENSOR_FAULT` immediately.
  3. Thermally couple `TH1` and `TH2` alongside a calibrated K-type thermocouple at 25°C, 60°C, 85°C, and 100°C and log ADC-converted temperatures at 1 Hz.
  4. *Pass Criteria:* Divider voltages and converted temperatures within ±1.0°C in the 85°C–105°C range; 100% open/short fault detection.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Precision 0.1% Decade Resistor Box, Calibrated K-Type Reference Thermometer, Multimeter, Unit test with `MockTemperatureSensor`.
  - **Execution:** Bench resistor calibration check on `IO0`/`IO1` followed by thermal water-bath verification.

---

## `REQ-SEN-02` — Water Tank Level Detection & Reservoir Illumination Trigger (`SW3`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Detect whether sufficient water is present in the tank via the Reservoir Water Sensor magnetic reed switch (`SW3` `SW_Reed` on `coffeenator.kicad_sch`) before starting a brew cycle, preventing dry-boil activation and controlling the Reservoir Illumination LEDs (`D3`, `D4` via `Q2` on `U1` Pin 25 / `IO8`).
- **Acceptance Criteria:**
  1. Uses magnetic reed switch **`SW3`** (`SW_Reed` with hardware RC filter `R1` = 10 kΩ to `3.3V` + `C1` = 100 nF to `GND`) connected to `U1` **Pin 21 (`IO5`)**, isolated from the drinking water inside the reservoir.
  2. When water is present in the reservoir (`SW3` active / `WATER_PRESENT == true`), the MCU asserts `U1` **Pin 25 (`IO8`)** HIGH to turn on `Q2` and illuminate the dual reservoir LEDs (`D3`, `D4`), providing immediate visual confirmation that the tank has water.
  3. Blocks remote, scheduled, or manual (`SW4`) brew start if `SW3` indicates the tank is empty (`WATER_PRESENT == false`), and turns reservoir LEDs `D3`/`D4` OFF (or blinks a low-water warning).
  4. Detects water exhaustion when the float drops to the empty position at the end of a brew cycle, transitioning the machine from `BREWING` (boiler heater `K1` OFF) to `KEEP_WARM` (hotplate `K2`).

### Verification & Test Documentation (`TC-SEN-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Reed switch `SW3` state transitions (`OPEN` = `3.3V` vs. `CLOSED` = `0V` at `U1` Pin 21 / `IO5`) and the resulting Reservoir Illumination response (`U1` Pin 25 / `IO8` -> `Q2` -> `D3`/`D4`) are discrete and directly observable.
  - *Boundary Conditions:* Water sloshing during filling; float reaching bottom at end of brew.
- **Test Description:**
  1. With an empty water tank (`SW3` open), verify `U1` Pin 21 (`IO5`) reads `3.3V`, Reservoir LEDs `D3`/`D4` are OFF, and attempting to start a brew (via `SW4`, BLE, or remote wake-up) keeps `K1` OFF and reports `WATER_EMPTY`.
  2. Fill the reservoir past the minimum threshold (`SW3` closed) -> verify `U1` Pin 21 (`IO5`) drops to `0V`, `WATER_OK` is reported, and `U1` Pin 25 (`IO8`) energizes `Q2` to illuminate Reservoir LEDs `D3` and `D4`.
  3. Drain the reservoir during an active `BREWING` test -> verify that when the reed float drops (plus software debounce window), primary boiler relay `K1` turns OFF, `D3`/`D4` turn OFF, and the machine transitions to `KEEP_WARM`.
  4. *Pass Criteria:* Brew start is strictly blocked when empty; reservoir LEDs `D3`/`D4` accurately track water presence; end-of-water float drop reliably de-energizes `K1`.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Graduated Measuring Cylinder, Multimeter / Logic Analyzer on `U1` Pin 21 (`IO5`) and Pin 25 (`IO8`), C/C++ Unit Test for water-empty debounce timer.
  - **Execution:** Bench test filling and draining the Melitta tank across 10 cycles.

---

## `REQ-SEN-03` — Carafe Presence Detection (`SW2`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Verify that the glass carafe (jug) is properly seated on the warming plate via the Carafe Presence Sensor magnetic reed switch (`SW2` `SW_Reed` on `coffeenator.kicad_sch`) before allowing any brew cycle to begin, preventing hot coffee from overflowing onto the counter.
- **Acceptance Criteria:**
  1. Uses magnetic reed switch **`SW2`** (`SW_Reed` with hardware RC filter `R2` = 10 kΩ to `3.3V` + `C2` = 100 nF to `GND`) connected to `U1` **Pin 20 (`IO4`)** to detect the magnet coupled to the carafe / placement mechanism.
  2. Blocks any manual (`SW4`), BLE, remote wake-up, or one-off scheduled brew start if the carafe is missing (`CARAFE_PRESENT == false`).
  3. If the carafe is removed for more than 20 seconds mid-brew, pauses the boiler heater (`K1` OFF) and signals a warning on the Status Information LED (`D8` on `IO10`) until the carafe is returned.

### Verification & Test Documentation (`TC-SEN-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Carafe seated vs. removed is a binary hardware input (`SW2` on `U1` Pin 20 / `IO4`) with deterministic timeout behavior in the brew state machine.
- **Test Description:**
  1. Remove the glass carafe from the warming plate and trigger a brew -> verify `U1` Pin 20 (`IO4`) reflects carafe absence, `K1` remains OFF, and status indicates `CARAFE_MISSING`.
  2. Place the empty carafe (and a full 10-cup carafe) on the warming plate across normal seating angles -> verify reliable `SW2` reed switch activation at `U1` Pin 20 (`IO4`).
  3. Remove the carafe during an active `BREWING` cycle:
     - Return it within 10 seconds -> verify brew continues seamlessly (pouring a quick cup).
     - Leave it off for > 20 seconds -> verify `K1` pauses to prevent filter overflow.
  4. *Pass Criteria:* 100% detection across normal seating positions; pre-brew block and >20s mid-brew pause work deterministically.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Melitta Excellent Glass Carafe, Unit Test for `BrewFSM` carafe-removal timer, Logic Analyzer on `U1` Pin 20 (`IO4`).
  - **Execution:** Automated software unit test for the 20s pause timer + 10 physical seating trials.

---

## `REQ-SEN-04` — Filter Hopper / Filter Bucket Presence & Closure Detection (`SW1`)

- **Category:** Sensors (`SEN`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  Verify that the coffee filter hopper / swivel filter bucket is properly inserted and closed via the Filter Hopper Presence Sensor magnetic reed switch (`SW1` `SW_Reed` on `coffeenator.kicad_sch`) before energizing the boiler heater (`K1`) and during the brew cycle, preventing scalding hot water from spraying or pouring straight onto the warming plate without the filter assembly in place.
- **Acceptance Criteria:**
  1. Uses dedicated magnetic reed switch **`SW1`** (`SW_Reed` with hardware RC filter `R3` = 10 kΩ to `3.3V` + `C3` = 100 nF to `GND`) connected to `U1` **Pin 5 (`IO3`)** to detect when the filter hopper / bucket is fully seated/closed in the brewing position.
  2. Blocks any brew start (manual `SW4` button, BLE, one-off automation, or remote server wake-up) if the filter hopper is open or removed (`FILTER_CLOSED == false`).
  3. Immediately de-energizes the primary boiler heater (`K1` OFF within <= 200 ms) if the filter hopper/bucket is swung open or removed during an active `BREWING` cycle to protect the user from hot water/steam splashes.
  4. Reports filter hopper status (`FILTER_OK` / `FILTER_OPEN`) to the Status Information LED (`D8` on `IO10`) and via BLE / configured API.

### Verification & Test Documentation (`TC-SEN-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Opening or removing the filter hopper opens magnetic reed switch `SW1`, producing a clean logic level transition at `U1` Pin 5 (`IO3`) via the hardware RC debounce network (`R3`, `C3`). Both pre-brew inhibit and mid-brew emergency pause latency are directly measurable.
  - *Boundary Conditions:* Filter bucket slightly ajar (not fully latched); filter bucket swung open suddenly while boiling water is pumping.
- **Test Description:**
  1. Open or remove the filter hopper/bucket and attempt to start a brew via `SW4`, BLE, and API -> verify `K1` stays strictly OFF and status reports `FILTER_OPEN`.
  2. Close/seat the filter bucket slightly ajar (5 mm before latch position) -> verify `SW1` only closes when the bucket is properly seated in its safe brewing alignment.
  3. Start a `BREWING` cycle (`K1` ON), then open the filter bucket mid-brew -> measure the time from `SW1` opening (`U1` Pin 5 / `IO3`) to `K1` relay de-energizing (`U1` Pin 22 / `IO6`).
  4. *Pass Criteria:* 100% pre-brew block when filter bucket is open/missing; mid-brew opening cuts `K1` power within <= 200 ms.
- **Test Implementation (Hardware & Software):**
  - **Tools:** Melitta Excellent Filter Bucket Assembly + Magnet, Logic Analyzer (probing `U1` Pin 5 `IO3` vs. `U1` Pin 22 `IO6` / `Q1`), C/C++ Unit Test for `BrewFSM` filter-open interlock.
  - **Execution:** Measure hardware-to-relay cutoff latency on logic analyzer across 10 mid-brew bucket-open tests and run unit tests for `FILTER_OPEN` state handling.
