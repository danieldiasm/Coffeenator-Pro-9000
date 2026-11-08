# 🔌 Hardware & Electrical Requirements (`REQ-HW-*`)

> **Hardware Baseline:** Derived from the existing project specifications and the KiCad mainboard design in [`hardware/main-board/coffeenator.kicad_sch`](../hardware/main-board/coffeenator.kicad_sch) and [`hardware/main-board/coffeenator.kicad_pcb`](../hardware/main-board/coffeenator.kicad_pcb).

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

## `REQ-HW-02` — Dual-Stage Regulated Low-Voltage Power Supply (12V & Logic VCC)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall replace the failure-prone OEM capacitive dropper with an encapsulated, isolated AC-DC power supply stage (`U3` AK-L1-025, 230V AC to 12V DC) followed by a high-efficiency step-down DC-DC regulator (`U2` Pololu 4085 / TSR1-form-factor step-down) to supply stable logic power (`VCC`) to the microcontroller, sensors, and relay circuits.
- **Acceptance Criteria:**
  1. Primary AC-DC stage (`U3` AK-L1-025) converts 230V AC mains to an isolated 12V DC intermediate rail with sufficient power margin (25W rating) to prevent sag during simultaneous dual-relay actuation.
  2. Secondary DC-DC buck regulator (`U2` Pololu 4085) steps the 12V rail down to regulated logic `VCC` (5V / 3.3V domain) with >= 1A current capability and low thermal dissipation.
  3. Output voltage ripple on `VCC` remains within ±2% under peak Wi-Fi/BLE TX bursts and simultaneous `K1` + `K2` relay coil energization.

### Verification & Test Documentation (`TC-HW-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Input/output voltages, load regulation, and transient ripple on `U3` (+Vout) and `U2` (`VCC`) are directly measurable at board power rails.
  - *Boundary Conditions:* Simultaneous cold-start of ESP32-C3 Wi-Fi RF calibration (~350 mA peak) plus both relay coils (`K1` + `K2`) + status LEDs (`D3`, `D4`).
- **Test Description:**
  1. Energize `U3` with 230V AC (via an isolated variac or fused test lead) with no load connected; verify `U3` output is 12.0V ± 5% and `U2` output (`VCC`) is within nominal specification.
  2. Apply a dummy resistive/electronic load drawing 500 mA continuously and 800 mA pulsed on `VCC` while toggling `K1` and `K2`.
  3. Capture AC-coupled voltage ripple and transient droop on `VCC` using an oscilloscope.
  4. *Pass Criteria:* `VCC` stays within ±5% DC tolerance; peak-to-peak ripple <= 100 mV; no brownout reset triggered on `U1`.
- **Test Implementation (Hardware):**
  - **Tools:** Digital Multimeter, Oscilloscope (AC-coupled 20 MHz bandwidth limit), Electronic Load / Power Resistors, Thermal Camera.
  - **Execution:** 30-minute full-load burn-in test recording `U2` and `U3` case temperatures (< 60°C) and rail stability.

---

## `REQ-HW-03` — ESP32-C3 Wireless Microcontroller Core (`U1`)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall utilize an `ESP32-C3-DevKitM-1` (`U1`, featuring the `ESP32-C3-MINI-1` RISC-V module) as the central controller providing 2.4 GHz Wi-Fi (802.11b/g/n), Bluetooth Low Energy (BLE 5.0), non-volatile flash storage, and GPIO/ADC interfaces for relays, switches, and status LEDs.
- **Acceptance Criteria:**
  1. `U1` is powered cleanly from the regulated `VCC` rail (Pin 1 / 2 / 3) and `GND` (Pin 14 / 15) with accessible USB/UART programming and debug headers.
  2. GPIO pin assignments on `U1` avoid strapping-pin conflicts that could prevent normal boot or unintentionally pulse relays during reset:
     - Inputs (`SW1`, `SW2`, `SW3`) routed to `U1` left-bank GPIOs (Pins 6, 7, 8).
     - Outputs (`Q1` Relay 1, `Q3` Relay 2, `Q2` Status LEDs) routed to `U1` right-bank GPIOs (Pins 21, 22, 23).
  3. Built-in PCB antenna clearance is respected on `coffeenator.kicad_pcb` (no copper ground pour or high-voltage traces directly beneath the `ESP32-C3-MINI-1` antenna keep-out zone) to ensure reliable Wi-Fi and BLE range through the coffee machine housing.

### Verification & Test Documentation (`TC-HW-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Pin continuity, boot strapping behavior under all switch combinations (`SW1`–`SW3` closed or open), and RF RSSI signal strength can be tested independently on the assembled PCB.
- **Test Description:**
  1. Hold each combination of `SW1`, `SW2`, and `SW3` closed while power-cycling `U1` to verify that none of the switch inputs prevent the ESP32-C3 from booting from internal flash.
  2. Measure Wi-Fi and BLE RSSI at 3 meters distance with `U1` mounted inside the closed Melitta Excellent housing.
  3. *Pass Criteria:* 100% successful boot rate across all switch states; BLE provisioning and Wi-Fi connection stable at >= 3 m (RSSI > -75 dBm).
- **Test Implementation (Hardware & Software):**
  - **Tools:** Serial Monitor (115200 baud boot log inspection), Smartphone BLE Scanner app (nRF Connect), Wi-Fi AP RSSI monitor.
  - **Execution:** Automated boot-loop test script cycling reset 20 times while logging boot reason and RSSI telemetry.

---

## `REQ-HW-04` — Dual Relay Power Drive Stage with Flyback & Bulk Decoupling

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide two independent electromechanical relay channels (`K1` and `K2`, `SANYOU_SRD_Form_C`) to switch the primary boiler heating element and the carafe warming plate, driven by low-side NPN transistor switches (`Q1`, `Q3`) with flyback protection (`D1`, `D2`) and local energy storage (`C4`, `C5`).
- **Acceptance Criteria:**
  1. Relay channel 1 (`K1`) is driven by NPN transistor `Q1` via base resistor `R5` (1 kΩ) and base pull-down resistor `R8` (10 kΩ), with flyback diode `D2` (`1N4007`) and bulk decoupling capacitor `C4` (100 µF) across the coil supply.
  2. Relay channel 2 (`K2`) is driven by NPN transistor `Q3` via base resistor `R6` (1 kΩ) and base pull-down resistor `R9` (10 kΩ), with flyback diode `D1` (`1N4007`) and bulk decoupling capacitor `C5` (100 µF) across the coil supply.
  3. Relay contact ratings support the inductive/resistive AC load of the Melitta Excellent heating elements (minimum 10A @ 250V AC).

### Verification & Test Documentation (`TC-HW-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Coil drive current, base saturation voltage `V_CE(sat)`, flyback clamping peak voltage, and contact resistance can be measured per channel (`K1` and `K2`) independently.
- **Test Description:**
  1. Drive `U1` Pin 21 HIGH (3.3V) to actuate `K1`; measure `V_BE(Q1)`, `V_CE(sat)(Q1)`, and coil voltage across `K1`.
  2. Drive `U1` Pin 21 LOW (0V) and capture the collector voltage waveform on `Q1` with an oscilloscope to confirm `D2` (`1N4007`) clamps the inductive flyback spike to `VCC + 0.7V`.
  3. Repeat steps 1–2 for Channel 2 (`U1` Pin 22 -> `R6`/`R9` -> `Q3` -> `K2` / `D1` / `C5`).
  4. *Pass Criteria:* `V_CE(sat)` <= 0.3V when ON; inductive turn-off spike clamped <= `VCC + 1.0V`; audible crisp relay click and contact resistance < 100 mΩ.
- **Test Implementation (Hardware):**
  - **Tools:** Oscilloscope (single-shot trigger on falling edge of GPIO), Digital Multimeter.
  - **Execution:** Bench hardware verification of `K1` and `K2` driver circuits using a GPIO toggle test firmware.

---

## `REQ-HW-05` — Hardware-Filtered Switch & Reed Sensor Inputs (`SW1`–`SW3`)

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall provide three hardware-debounced and EMI-filtered reed sensor / switch input channels (`SW1`, `SW2`, `SW3` on `coffeenator.kicad_sch`) to interface with the water tank level reed sensor (`REQ-SEN-02`), carafe presence reed sensor (`REQ-SEN-03`), and filter support/bucket reed sensor (`REQ-SEN-04`) (as well as physical button input combinations) so that all transitions are clean and immune to AC relay switching noise.
- **Acceptance Criteria:**
  1. Each input channel (`SW1`, `SW2`, `SW3`) includes a dedicated 10 kΩ resistor (`R3`, `R2`, `R1`) and a 100 nF decoupling/debounce capacitor to `GND` (`C3`, `C2`, `C1`), forming an RC low-pass filter ($\tau = R \cdot C = 10\,\text{k}\Omega \times 100\,\text{nF} = 1\,\text{ms}$).
  2. Mechanical reed contact bounce and coupled 50 Hz / relay transient spikes on sensor leads are attenuated before reaching `U1` GPIO pins (Pins 6, 7, 8).

### Verification & Test Documentation (`TC-HW-05`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* The RC time constant ($\tau \approx 1\,\text{ms}$) and contact bounce suppression can be observed with an oscilloscope at `U1` Pins 6, 7, and 8 during rapid mechanical switch actuation and while relays `K1`/`K2` switch 230V AC loads.
- **Test Description:**
  1. Actuate `SW1`, `SW2`, and `SW3` 50 times each while monitoring the corresponding `U1` GPIO pins on an oscilloscope.
  2. Switch `K1` and `K2` under AC load while `SW1`–`SW3` are unpressed and verify no false interrupts or glitches cross the logic threshold on `U1` Pins 6, 7, or 8.
  3. *Pass Criteria:* Clean monotonic rise/fall waveforms ($\tau \approx 1\,\text{ms}$); zero false triggers during 100 relay switching cycles.
- **Test Implementation (Hardware):**
  - **Tools:** Oscilloscope, Edge-counter test firmware on `U1`.
  - **Execution:** Log interrupt edge counts on `U1` vs physical switch actuations.

---

## `REQ-HW-06` — Local Visual Status Indicator Driver Stage (`Q2`, `D3`, `D4`)

- **Category:** Hardware (`HW`)
- **Priority:** Should-Have
- **Status:** In-Progress (Implemented in Schematic `coffeenator.kicad_sch`)
- **Description:**  
  The mainboard shall include a transistor-buffered LED indicator stage (`Q2` NPN driver, base resistor `R7` = 1 kΩ, pull-down `R4` = 10 kΩ, current-limiting resistor `R10` = 330 Ω, and dual LEDs `D3`, `D4`) to provide clear visual feedback of machine state (Brewing, Keep-Warm, BLE Provisioning, Reset Confirmation, Fault) without overloading MCU GPIO current limits.
- **Acceptance Criteria:**
  1. `U1` Pin 23 drives `Q2` via `R7` (1 kΩ) with `R4` (10 kΩ) holding `Q2` OFF during reset.
  2. `R10` (330 Ω) limits LED current through `D3` and `D4` to a safe operating level from `VCC`.
  3. Supports steady ON, slow blink, fast blink, and pulse patterns via GPIO / PWM control to distinguish operational states offline.

### Verification & Test Documentation (`TC-HW-06`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* LED forward current, `Q2` switching response, and visual visibility from outside the coffee machine housing are directly measurable.
- **Test Description:**
  1. Drive `U1` Pin 23 HIGH and measure voltage drop across `R10` (330 Ω) to calculate total LED current $I_{\text{LED}} = V_{R10} / 330\,\Omega$.
  2. Drive `U1` Pin 23 with 1 Hz, 5 Hz, and 1 kHz PWM signals to verify visual state patterns (Idle, Brewing, BLE Config Mode, Factory Reset Ack).
  3. *Pass Criteria:* $I_{\text{LED}}$ is within rated LED limits (< 20 mA); `D3` and `D4` remain strictly OFF when `U1` Pin 23 is LOW or High-Z.
- **Test Implementation (Hardware):**
  - **Tools:** Digital Multimeter, PWM test sketch on `U1`.
  - **Execution:** Measure voltage across `R10` and verify all defined blink patterns.

---

## `REQ-HW-07` — MCU Flash Capacity & Dual-Partition OTA Hardware Support

- **Category:** Hardware (`HW`)
- **Priority:** Must-Have
- **Status:** In-Progress (`U1` `ESP32-C3-DevKitM-1` with 4 MB SPI Flash)
- **Description:**  
  The microcontroller (`U1` `ESP32-C3-DevKitM-1` / `ESP32-C3-MINI-1`) shall provide sufficient non-volatile SPI flash memory (>= 4 MB) and hardware/bootloader support to handle Over-The-Air (OTA) firmware updates via a redundant dual-application partition scheme (`ota_0` and `ota_1`) alongside dedicated non-volatile configuration storage (`nvs` / filesystem), ensuring power stability during high-current flash erase/write cycles while Wi-Fi or BLE radios are active.
- **Acceptance Criteria:**
  1. `U1` provides at least 4 MB of onboard SPI flash partitioned into `otadata`, two full-sized application slots (`ota_0` and `ota_1`), and a dedicated `nvs`/`storage` partition that is never overwritten during an OTA update.
  2. The 5V/`VCC` power rail (`U2` Pololu 4085 + `U3` AK-L1-025) maintains stable voltage without brownout resets during simultaneous Wi-Fi/BLE radio reception and continuous SPI flash sector erase/write operations.
  3. Relay driver hardware pull-downs (`R8`, `R9`) keep heaters `K1` and `K2` strictly OFF during the post-OTA MCU reboot and partition switchover.

### Verification & Test Documentation (`TC-HW-07`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Flash size and partition geometry can be queried directly from `U1` via `esptool.py` and ESP-IDF partition APIs. Power supply stability during simultaneous RF + flash write stress can be monitored on `VCC` with an oscilloscope.
  - *Boundary Conditions:* Peak current draw during Wi-Fi/BLE packet reception + SPI flash sector erase; sudden power loss mid-flash write.
- **Test Description:**
  1. Query `U1` flash chip ID and capacity via `esptool.py flash_id` to confirm >= 4 MB flash.
  2. Flash the custom partition table (`partitions.csv`) and verify both `ota_0` and `ota_1` partitions are addressable and equally sized.
  3. Perform a full OTA firmware upload over Wi-Fi and over BLE while monitoring the `VCC` rail and relay contacts (`K1`, `K2`) with an oscilloscope.
  4. *Pass Criteria:* Zero brownout resets during OTA write; `VCC` droop remains within ±5%; `K1` and `K2` remain 100% OPEN before, during, and across the post-OTA reboot.
- **Test Implementation (Hardware & Firmware):**
  - **Tools:** `esptool.py`, ESP-IDF `parttool.py`, Oscilloscope probing `VCC` and `K1`/`K2` collector nodes during active OTA transfer.
  - **Execution:** Execute 5 consecutive ping-pong OTA updates (`ota_0` -> `ota_1` -> `ota_0`) while recording power rail stability.

