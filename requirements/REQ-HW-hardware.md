# 🔌 Hardware & Electrical Requirements (`REQ-HW-*`)

> **Hardware Baseline:** Derived from the existing project specifications and the KiCad mainboard design in [`hardware/main-board/coffeenator.kicad_sch`](../hardware/main-board/coffeenator.kicad_sch) and [`hardware/main-board/coffeenator.kicad_pcb`](../hardware/main-board/coffeenator.kicad_pcb).

Review Status: Reviewing
---

## `REQ-HW-01` — Custom Replacement Control Board in OEM Footprint

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress
- **Description:**  
  Design a replacement controller PCB (`coffeenator.kicad_pcb`) that mounts cleanly inside the **Melitta Excellent** lower housing away from steam and water drips, interfacing non-destructively with the factory wiring harness.
- **Acceptance Criteria:**
  1. Fits within original internal enclosure clearances and mounting standoffs of the Melitta Excellent base.
  2. Interfaces with the OEM Melitta internal wiring harness without requiring irreversible chassis cuts.
  3. Includes conformal coating or moisture-resistant enclosure baffling to protect against kitchen humidity and water tank condensation.

### Verification & Test Documentation (`TC-HW-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Mechanical dimensions, mounting hole coordinates, and connector clearances can be verified via 1:1 2D/3D CAD overlay and physical test-fitting inside the Melitta Excellent base shell.
- **Test Description:**
  1. Print a 1:1 scale paper/3D-printed mockup of `coffeenator.kicad_pcb` including tall components (`U3`, `K1`, `K2`, `C4`, `C5`, `U1`).
  2. Place the mockup inside the Melitta Excellent bottom housing and verify standoff alignment, wire bend radii, and bottom cover closure.
  3. *Pass Criteria:* Board mounts securely with >= 3 mm clearance to chassis walls and >= 10 mm clearance from hot boiler metal surfaces.
- **Test Implementation (Hardware):**
  - **Tools:** Vernier Calipers, KiCad 3D Viewer export (`STEP`/`VRML`), Physical Melitta Excellent lower chassis.
  - **Execution:** Physical trial fit and clearance measurement log before PCB fabrication order.

---

## `REQ-HW-02` — Multi-Rail Regulated Low-Voltage Power Supply (12V, 5V `VCC` & `3.3V` Logic)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall replace the failure-prone OEM capacitive dropper with an encapsulated, isolated AC-DC power supply stage (`U3` AK-L1-025, 230V AC to 12V DC) followed by a high-efficiency step-down DC-DC regulator (`U2` Pololu 4085 / TSR1-form-factor step-down) generating the 5V `VCC` rail (powering `U1` `5V` input, relay coils `K1`/`K2`, and reservoir illumination LEDs `D3`/`D4`), while `U1`'s onboard regulator provides the `3.3V` logic rail (`U1` Pin 2 `3V3`) for all reed sensor pull-ups (`R1`–`R3`), pushbutton pull-ups (`R15`, `R16`), and PT1000 temperature dividers (`R11`, `R12`).
- **Acceptance Criteria:**
  1. Primary AC-DC stage (`U3` AK-L1-025) converts 230V AC mains to an isolated 12V DC intermediate rail with sufficient power margin (25W rating) to prevent sag during simultaneous dual-relay actuation.
  2. Secondary DC-DC buck regulator (`U2` Pololu 4085) steps the 12V rail down to regulated 5V `VCC` with >= 1A current capability and low thermal dissipation.
  3. All MCU GPIO and ADC input circuits (`SW1`–`SW5`, `TH1`, `TH2`) are referenced strictly to the `3.3V` logic rail (`U1` Pin 2 `3V3`) so that no 5V signal ever reaches an ESP32-C3 input pin.
  4. Output voltage ripple on `VCC` and `3.3V` remains within ±2% under peak Wi-Fi/BLE TX bursts and simultaneous `K1` + `K2` relay coil energization.

### Verification & Test Documentation (`TC-HW-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Input/output voltages, load regulation, and transient ripple on `U3` (+Vout), `U2` (`VCC` 5V), and `U1` Pin 2 (`3.3V`) are directly measurable at board power rails.
  - *Boundary Conditions:* Simultaneous cold-start of ESP32-C3 Wi-Fi RF calibration (~350 mA peak) plus both relay coils (`K1` + `K2`) + all LEDs (`D3`, `D4`, `D7`, `D8`).
- **Test Description:**
  1. Energize `U3` with 230V AC (via an isolated variac or fused test lead) with no load connected; verify `U3` output is 12.0V ± 5%, `U2` output (`VCC`) is 5.0V ± 5%, and `3.3V` rail is 3.3V ± 3%.
  2. Apply a dummy resistive/electronic load drawing 500 mA continuously and 800 mA pulsed on `VCC` while toggling `K1` and `K2`.
  3. Capture AC-coupled voltage ripple and transient droop on `VCC` and `3.3V` using an oscilloscope.
  4. *Pass Criteria:* `VCC` and `3.3V` stay within DC tolerance; peak-to-peak ripple <= 100 mV; no brownout reset triggered on `U1`.
- **Test Implementation (Hardware):**
  - **Tools:** Digital Multimeter, Oscilloscope (AC-coupled 20 MHz bandwidth limit), Electronic Load / Power Resistors, Thermal Camera.
  - **Execution:** 30-minute full-load burn-in test recording `U2` and `U3` case temperatures (< 60°C) and rail stability.

---

## `REQ-HW-03` — ESP32-C3 Wireless Microcontroller Core & Pin Allocation (`U1`)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall utilize an `ESP32-C3-DevKitM-1` (`U1` labeled `ESP32-C3U`, featuring the `ESP32-C3-MINI-1` RISC-V module) as the central controller providing 2.4 GHz Wi-Fi (802.11b/g/n), Bluetooth Low Energy (BLE 5.0), non-volatile flash storage, and dedicated analog/digital pins for temperature sensors, reed switches, user pushbuttons, relay drivers, and status LEDs.
- **Acceptance Criteria:**
  1. `U1` is powered from the regulated 5V `VCC` rail on Pin 13 (`5V`) with `GND` on Pin 1/15, and supplies the regulated `3.3V` logic reference on Pin 2 (`3V3`).
  2. GPIO and ADC pin assignments on `U1` follow the `coffeenator.kicad_sch` net mapping:
     - **Pin 9 (`IO0` / `ADC1_CH0`):** Boiler PT1000 temperature sensor divider (`TH1` + `R11`).
     - **Pin 10 (`IO1` / `ADC1_CH1`):** Hot-Plate PT1000 temperature sensor divider (`TH2` + `R12`).
     - **Pin 5 (`IO3` / `ADC1_CH3`):** Filter Hopper Presence Reed Sensor (`SW1` + `R3`/`C3`).
     - **Pin 20 (`IO4` / `ADC1_CH4`):** Carafe Presence Reed Sensor (`SW2` + `R2`/`C2`).
     - **Pin 21 (`IO5`):** Reservoir Water Level Reed Sensor (`SW3` + `R1`/`C1`).
     - **Pin 28 (`RX` / `IO20`):** Power Toggle Pushbutton (`SW4` + `R15`).
     - **Pin 29 (`TX` / `IO21`):** Mode Toggle Pushbutton (`SW5` + `R16`).
     - **Pin 22 (`IO6`):** Main Boiler Relay driver (`Q1`/`K1`) + Diode-OR input `D5`.
     - **Pin 23 (`IO7`):** Hot-Plate Relay driver (`Q3`/`K2`) + Diode-OR input `D6`.
     - **Pin 25 (`IO8`):** Reservoir Illumination LED driver (`Q2` switching `D3`/`D4`).
     - **Pin 11 (`IO10`):** Status Information LED driver (`R14` -> `D8`).
  3. Built-in PCB antenna clearance is respected on `coffeenator.kicad_pcb` (no copper ground pour or high-voltage traces directly beneath the `ESP32-C3` antenna keep-out zone) to ensure reliable Wi-Fi and BLE range through the coffee machine housing.

### Verification & Test Documentation (`TC-HW-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Pin continuity, boot strapping behavior under all reed switch (`SW1`–`SW3`) and pushbutton (`SW4`–`SW5`) combinations, and RF RSSI signal strength can be tested independently on the assembled PCB.
  - *Strapping Pin Note:* On ESP32-C3, `IO8` (Pin 25) and `IO2`/`IO9` are boot strapping pins; `IO8` is connected to `Q2` base via `R7` (1 kΩ) + `R4` (10 kΩ), so boot behavior must be verified across normal and download-mode resets.
- **Test Description:**
  1. Hold each combination of `SW1`–`SW5` closed while power-cycling `U1` to verify that none of the reed sensor or pushbutton states prevent the ESP32-C3 from booting from internal flash.
  2. Measure Wi-Fi and BLE RSSI at 3 meters distance with `U1` mounted inside the closed Melitta Excellent housing.
  3. *Pass Criteria:* 100% successful boot rate across all normal switch states; BLE provisioning and Wi-Fi connection stable at >= 3 m (RSSI > -75 dBm).
- **Test Implementation (Hardware & Software):**
  - **Tools:** Serial Monitor / USB debug log inspection, Smartphone BLE Scanner app (nRF Connect), Wi-Fi AP RSSI monitor.
  - **Execution:** Automated boot-loop test script cycling reset 20 times while logging boot reason and RSSI telemetry.

---

## `REQ-HW-04` — Dual Relay Power Drive Stage with Flyback & Bulk Decoupling

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide two independent electromechanical relay channels (`K1` Main Boiler Control and `K2` Hot-Plate Control, `SANYOU_SRD_Form_C`) to switch the primary boiler heating element and the carafe warming plate, driven by low-side NPN transistor switches (`Q1`, `Q3`) with flyback protection (`D1`, `D2`) and local energy storage (`C4`, `C5`).
- **Acceptance Criteria:**
  1. **Main Boiler Relay (`K1`):** Driven by `U1` **Pin 22 (`IO6`)** into NPN transistor `Q1` via base resistor `R5` (1 kΩ) and base pull-down resistor `R8` (10 kΩ), with flyback diode `D2` (`1N4007`) and bulk decoupling capacitor `C4` (100 µF) across the `VCC` coil supply.
  2. **Hot-Plate Relay (`K2`):** Driven by `U1` **Pin 23 (`IO7`)** into NPN transistor `Q3` via base resistor `R6` (1 kΩ) and base pull-down resistor `R9` (10 kΩ), with flyback diode `D1` (`1N4007`) and bulk decoupling capacitor `C5` (100 µF) across the `VCC` coil supply.
  3. Relay contact ratings support the inductive/resistive AC load of the Melitta Excellent heating elements (minimum 10A @ 250V AC).

### Verification & Test Documentation (`TC-HW-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Coil drive current, base saturation voltage `V_CE(sat)`, flyback clamping peak voltage, and contact resistance can be measured per channel (`K1` and `K2`) independently.
- **Test Description:**
  1. Drive `U1` Pin 22 (`IO6`) HIGH (3.3V) to actuate `K1`; measure `V_BE(Q1)`, `V_CE(sat)(Q1)`, and coil voltage across `K1`.
  2. Drive `U1` Pin 22 (`IO6`) LOW (0V) and capture the collector voltage waveform on `Q1` with an oscilloscope to confirm `D2` (`1N4007`) clamps the inductive flyback spike to `VCC + 0.7V`.
  3. Repeat steps 1–2 for Channel 2 (`U1` Pin 23 / `IO7` -> `R6`/`R9` -> `Q3` -> `K2` / `D1` / `C5`).
  4. *Pass Criteria:* `V_CE(sat)` <= 0.3V when ON; inductive turn-off spike clamped <= `VCC + 1.0V`; audible crisp relay click and contact resistance < 100 mΩ.
- **Test Implementation (Hardware):**
  - **Tools:** Oscilloscope (single-shot trigger on falling edge of GPIO), Digital Multimeter.
  - **Execution:** Bench hardware verification of `K1` and `K2` driver circuits using a GPIO toggle test firmware.

---

## `REQ-HW-05` — Hardware-Filtered Magnetic Reed Sensor Inputs (`SW1`–`SW3`)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide three hardware-debounced and EMI-filtered magnetic reed switch input channels (`SW1`, `SW2`, `SW3` on `coffeenator.kicad_sch`), pulled up to `3.3V` and switching to `GND`, to interface with the Filter Hopper Presence Sensor (`SW1`, `REQ-SEN-04`), Carafe Presence Sensor (`SW2`, `REQ-SEN-03`), and Reservoir Water Sensor (`SW3`, `REQ-SEN-02`).
- **Acceptance Criteria:**
  1. **`SW1` (Filter Hopper Presence Sensor):** Pulled up to `3.3V` via `R3` (10 kΩ) with debounce capacitor `C3` (100 nF) to `GND`, routed to `U1` **Pin 5 (`IO3`)**.
  2. **`SW2` (Carafe Presence Sensor):** Pulled up to `3.3V` via `R2` (10 kΩ) with debounce capacitor `C2` (100 nF) to `GND`, routed to `U1` **Pin 20 (`IO4`)**.
  3. **`SW3` (Reservoir Water Sensor):** Pulled up to `3.3V` via `R1` (10 kΩ) with debounce capacitor `C1` (100 nF) to `GND`, routed to `U1` **Pin 21 (`IO5`)**.
  4. Each channel forms an RC low-pass filter ($\tau = R \cdot C = 10\,\text{k}\Omega \times 100\,\text{nF} = 1\,\text{ms}$) that suppresses mechanical reed contact bounce and coupled 50 Hz / relay transient noise before reaching `U1`.

### Verification & Test Documentation (`TC-HW-05`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* The RC time constant ($\tau \approx 1\,\text{ms}$) and contact bounce suppression can be observed with an oscilloscope at `U1` Pins 5 (`IO3`), 20 (`IO4`), and 21 (`IO5`) during rapid reed switch actuation and while relays `K1`/`K2` switch 230V AC loads.
- **Test Description:**
  1. Actuate `SW1`, `SW2`, and `SW3` 50 times each while monitoring `U1` Pins 5, 20, and 21 on an oscilloscope.
  2. Switch `K1` and `K2` under AC load while `SW1`–`SW3` are static and verify no false interrupts or glitches cross the logic threshold on `U1`.
  3. *Pass Criteria:* Clean monotonic rise/fall waveforms ($\tau \approx 1\,\text{ms}$); zero false triggers during 100 relay switching cycles.
- **Test Implementation (Hardware):**
  - **Tools:** Oscilloscope, Edge-counter test firmware on `U1`.
  - **Execution:** Log interrupt edge counts on `U1` vs physical reed switch actuations.

---

## `REQ-HW-06` — Three-Channel Visual LED Indicator & Reservoir Illumination System (`D3`–`D8`)

- **Category:** Hardware (`HW`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide three distinct LED visual feedback circuits:
  1. **Reservoir Illumination Circuit (`Q2`, `D3`, `D4`, `R4`, `R7`, `R10`):** MCU-controlled transistor-buffered dual-LED stage connected to `U1` **Pin 25 (`IO8`)** to illuminate the water tank reservoir when water is present.
  2. **Status Information LED (`D8`, `R14`):** Direct MCU-driven status indicator connected to `U1` **Pin 11 (`IO10`)** to display system state, mode selection, wireless/BLE pairing, and fault blink patterns.
  3. **Boiler / Hot-Plate Hardware Diode-OR Indicator LED (`D5`, `D6`, `R13`, `D7`):** Hardware Diode-OR gate (`D5` and `D6` `1N4007`) tapping the `K1` (`IO6`) and `K2` (`IO7`) relay control lines to illuminate `D7` via `R13` (220 Ω) automatically whenever either the Main Boiler or the Hot-Plate relay is active.
- **Acceptance Criteria:**
  1. **Reservoir Illumination (`D3`, `D4`):** `U1` Pin 25 (`IO8`) drives NPN transistor `Q2` via base resistor `R7` (1 kΩ) with base pull-down `R4` (10 kΩ) holding `Q2` OFF during reset; `Q2` switches parallel reservoir LEDs `D3` and `D4` from `VCC` through series current-limiting resistor `R10` (330 Ω) to reflect water presence in the tank (`SW3`).
  2. **Status Information LED (`D8`):** `U1` Pin 11 (`IO10`) drives `D8` to `GND` through series current-limiting resistor `R14` (220 Ω), keeping GPIO current within safe ESP32-C3 limits (< 10 mA) and supporting steady/blink/PWM status patterns.
  3. **Diode-OR Relay Activity Indicator (`D7`):** Diode `D5` (`1N4007`, anode tied to `U1` Pin 22 / `IO6` Boiler drive) and diode `D6` (`1N4007`, anode tied to `U1` Pin 23 / `IO7` Hot-Plate drive) join at their cathodes to drive `D7` through `R13` (220 Ω) to `GND`:
     - Illuminates `D7` whenever `IO6` (Boiler) OR `IO7` (Hot-Plate) OR both are HIGH.
     - `D5` and `D6` provide reverse blocking so energizing `K1` (`IO6` HIGH, `IO7` LOW) never back-feeds or triggers `K2` (`Q3`), and vice versa.

### Verification & Test Documentation (`TC-HW-06`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Each of the three LED circuits can be verified independently: `D3`/`D4` via `IO8`, `D8` via `IO10`, and the Diode-OR truth table (`00`, `01`, `10`, `11`) on `D7` across `IO6` and `IO7` while verifying zero cross-conduction between `Q1` (`K1`) and `Q3` (`K2`).
- **Test Description:**
  1. **Reservoir Illumination Test (`IO8` -> `Q2` -> `D3`/`D4`):** Drive `U1` Pin 25 (`IO8`) HIGH; verify `D3` and `D4` illuminate and measure voltage across `R10` (330 Ω) to confirm safe total LED current.
  2. **Status Information LED Test (`IO10` -> `R14` -> `D8`):** Drive `U1` Pin 11 (`IO10`) with steady HIGH, LOW, and 2 Hz / 5 Hz blink patterns; measure current through `R14` (220 Ω).
  3. **Diode-OR Gate Truth Table & Isolation Test (`D5`, `D6`, `R13`, `D7`):**
     - Set `IO6 = LOW`, `IO7 = LOW` -> verify `K1` OFF, `K2` OFF, `D7` OFF.
     - Set `IO6 = HIGH`, `IO7 = LOW` -> verify `K1` ON, **`K2` remains strictly OFF** (`V_B(Q3) = 0V` blocked by `D6`), and **`D7` is ON**.
     - Set `IO6 = LOW`, `IO7 = HIGH` -> verify **`K1` remains strictly OFF** (`V_B(Q1) = 0V` blocked by `D5`), `K2` ON, and **`D7` is ON**.
     - Set `IO6 = HIGH`, `IO7 = HIGH` -> verify `K1` ON, `K2` ON, and **`D7` is ON**.
  4. *Pass Criteria:* All three indicator circuits operate within rated LED current limits (< 15 mA); Diode-OR gate passes all 4 truth-table states with 0V cross-talk between relay channels `K1` and `K2`.
- **Test Implementation (Hardware):**
  - **Tools:** Digital Multimeter, GPIO test firmware cycling `IO8`, `IO10`, `IO6`, and `IO7`.
  - **Execution:** Execute LED current measurements and the 4-state Diode-OR isolation matrix on the assembled board.

---

## `REQ-HW-07` — MCU Flash Capacity & Dual-Partition OTA Hardware Support

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (`U1` `ESP32-C3-DevKitM-1` with 4 MB SPI Flash)
- **Description:**  
  The microcontroller (`U1` `ESP32-C3-DevKitM-1` / `ESP32-C3U`) shall provide sufficient non-volatile SPI flash memory (>= 4 MB) and hardware/bootloader support to handle Over-The-Air (OTA) firmware updates via a redundant dual-application partition scheme (`ota_0` and `ota_1`) alongside dedicated non-volatile configuration storage (`nvs` / filesystem), ensuring power stability during high-current flash erase/write cycles while Wi-Fi or BLE radios are active.
- **Acceptance Criteria:**
  1. `U1` provides at least 4 MB of onboard SPI flash partitioned into `otadata`, two full-sized application slots (`ota_0` and `ota_1`), and a dedicated `nvs`/`storage` partition that is never overwritten during an OTA update.
  2. The 5V `VCC` and `3.3V` power rails (`U2` Pololu 4085 + `U3` AK-L1-025 + `U1` LDO) maintain stable voltage without brownout resets during simultaneous Wi-Fi/BLE radio reception and continuous SPI flash sector erase/write operations.
  3. Relay driver hardware pull-downs (`R8`, `R9`) keep heaters `K1` and `K2` (and Diode-OR indicator `D7`) strictly OFF during the post-OTA MCU reboot and partition switchover.

### Verification & Test Documentation (`TC-HW-07`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Flash size and partition geometry can be queried directly from `U1` via `esptool.py` and ESP-IDF partition APIs. Power supply stability during simultaneous RF + flash write stress can be monitored on `VCC` and `3.3V` with an oscilloscope.
  - *Boundary Conditions:* Peak current draw during Wi-Fi/BLE packet reception + SPI flash sector erase; sudden power loss mid-flash write.
- **Test Description:**
  1. Query `U1` flash chip ID and capacity via `esptool.py flash_id` to confirm >= 4 MB flash.
  2. Flash the custom partition table (`partitions.csv`) and verify both `ota_0` and `ota_1` partitions are addressable and equally sized.
  3. Perform a full OTA firmware upload over Wi-Fi and over BLE while monitoring the `VCC` rail and relay contacts (`K1`, `K2`) with an oscilloscope.
  4. *Pass Criteria:* Zero brownout resets during OTA write; `VCC` droop remains within ±5%; `K1` and `K2` remain 100% OPEN before, during, and across the post-OTA reboot.
- **Test Implementation (Hardware & Firmware):**
  - **Tools:** `esptool.py`, ESP-IDF `parttool.py`, Oscilloscope probing `VCC` and `K1`/`K2` collector nodes during active OTA transfer.
  - **Execution:** Execute 5 consecutive ping-pong OTA updates (`ota_0` -> `ota_1` -> `ota_0`) while recording power rail stability.

---

## `REQ-HW-08` — Tactile User Pushbutton Interface (`SW4` Power Toggle & `SW5` Mode Toggle)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide two dedicated tactile user pushbutton circuits (`SW4` Power Toggle Button and `SW5` Mode Toggle Button on `coffeenator.kicad_sch`) pulled up to `3.3V` via 10 kΩ resistors (`R15`, `R16`) and switching to `GND`, enabling local manual brew start/stop, operational mode toggling, and multi-button factory reset chords without interfering with the three magnetic reed safety sensors (`SW1`–`SW3`).
- **Acceptance Criteria:**
  1. **`SW4` (Power Toggle Button):** Momentary pushbutton (`SW_Push`) switching to `GND` with external 10 kΩ pull-up resistor `R15` to `3.3V`, connected to `U1` **Pin 28 (`RX` / `IO20`)**.
  2. **`SW5` (Mode Toggle Button):** Momentary pushbutton (`SW_Push`) switching to `GND` with external 10 kΩ pull-up resistor `R16` to `3.3V`, connected to `U1` **Pin 29 (`TX` / `IO21`)**.
  3. Pressing either button pulls its respective input cleanly from `3.3V` (logic HIGH, unpressed) to `0V` (logic LOW, pressed), supporting both individual button actions and simultaneous two-button chord detection (`SW4 + SW5`) for factory reset (`REQ-FW-02`).

### Verification & Test Documentation (`TC-HW-08`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Idle pull-up voltage (`3.3V`), active-low pressed voltage (`0.0V`), and software/hardware debounce behavior on `U1` Pins 28 (`IO20`) and 29 (`IO21`) can be verified directly with a multimeter and oscilloscope.
  - *Boundary Conditions:* Simultaneous press of `SW4 + SW5`; USB/UART serial console coexistence (since `IO20`/`IO21` correspond to `RX`/`TX` on `ESP32-C3-DevKitM-1`, firmware configures `IO20`/`IO21` as GPIO inputs or uses USB Serial/JTAG controller on `IO18`/`IO19`).
- **Test Description:**
  1. Measure open-circuit voltage at `U1` Pin 28 (`IO20`) and Pin 29 (`IO21`) with `SW4` and `SW5` unpressed -> confirm `3.3V ± 5%`.
  2. Press `SW4` (Power Toggle) and verify Pin 28 drops cleanly to `< 0.1V` while Pin 29 remains at `3.3V`.
  3. Press `SW5` (Mode Toggle) and verify Pin 29 drops cleanly to `< 0.1V` while Pin 28 remains at `3.3V`.
  4. Hold both `SW4` and `SW5` simultaneously for >= 5.0 seconds to verify clean dual-button chord detection (`REQ-FW-02`).
  5. *Pass Criteria:* Clean active-LOW transitions on both pushbutton channels with zero electrical cross-talk.
- **Test Implementation (Hardware & Firmware):**
  - **Tools:** Digital Multimeter, Logic Analyzer / Oscilloscope on `U1` Pins 28 and 29.
  - **Execution:** Bench verification of individual button presses and simultaneous 5-second reset chord.
