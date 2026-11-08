# 🧪 Modularity, Testability & Verification Requirements (`REQ-QA-*`)

> **Core Philosophy:** Every hardware and software component of the Coffeenator Pro 9000 shall be designed as a self-contained, modular, and independently testable unit, backed by formal three-stage verification documentation (**Test Analysis**, **Test Description**, and **Test Implementation**).

---

## `REQ-QA-01` — Modular & Independently Testable Hardware Subsystems

- **Category:** Modularity & Quality Assurance (`QA`)
- **Priority:** Must-Have
- **Status:** In-Progress (Reflected in `coffeenator.kicad_sch`)
- **Description:**  
  All hardware functional blocks on the mainboard (`coffeenator.kicad_sch` / `coffeenator.kicad_pcb`) shall be partitioned into modular, logically separated subsystems so that each block can be populated, powered, probed, and verified independently before full-system integration with 230V AC heaters.
- **Acceptance Criteria:**
  1. The hardware schematic and PCB are partitioned into distinct, independently verifiable functional blocks:
     - **Block A — Power Supply Stage:** `U3` (AK-L1-025 12V AC-DC) and `U2` (Pololu 4085 DC-DC step-down to `VCC`).
     - **Block B — Controller Core:** Socketed/header-mounted `U1` (`ESP32-C3-DevKitM-1`) removable for bench isolation.
     - **Block C — Relay Power Switching Channels:** Channel 1 (`R5`, `R8`, `Q1`, `D2`, `C4`, `K1`) and Channel 2 (`R6`, `R9`, `Q3`, `D1`, `C5`, `K2`).
     - **Block D — Hardware-Debounced Input Bank:** Reed/Switch inputs (`SW1`–`SW3`, `R1`–`R3`, `C1`–`C3`).
     - **Block E — Visual Status Indicator Stage:** Transistor LED buffer (`R7`, `R4`, `Q2`, `R10`, `D3`, `D4`).
  2. Because `U1` (`ESP32-C3-DevKitM-1`) is a modular development board on headers, all analog/digital peripheral blocks (Blocks A, C, D, E) can be stimulated and verified on the bare PCB using jumper leads prior to inserting `U1`.

### Verification & Test Documentation (`TC-QA-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Removing `U1` from its header sockets exposes every input (`Pins 6, 7, 8`) and output (`Pins 21, 22, 23`) plus `VCC` and `GND`, enabling block-by-block hardware bring-up without firmware dependencies.
- **Test Description:**
  1. Populate Block A (`U3`, `U2`) first and verify 12V and `VCC` rails before populating `U1`.
  2. With `U1` unmounted, apply 3.3V via a current-limited bench lead to socket pins 21, 22, and 23 one at a time -> verify independent actuation of `K1`, `K2`, and LEDs `D3`/`D4`.
  3. Toggle `SW1`, `SW2`, and `SW3` and measure clean logic transitions at socket pins 6, 7, and 8.
  4. *Pass Criteria:* 100% of hardware functional blocks pass standalone electrical bring-up prior to MCU insertion.
- **Test Implementation (Hardware):**
  - **Tools:** Step-by-step PCB Bring-Up Checklist, Bench Power Supply (3.3V / 5V current-limited), Multimeter.
  - **Execution:** Execute staged board bring-up protocol on each assembled PCB revision.

---

## `REQ-QA-02` — Modular & Testable Software Architecture (HAL Decoupling)

- **Category:** Modularity & Quality Assurance (`QA`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  All firmware components shall be architected as loosely coupled, single-responsibility modules communicating through well-defined interfaces and a Hardware Abstraction Layer (HAL), allowing every software module to be compiled and unit-tested on a host PC without physical ESP32-C3 hardware.
- **Acceptance Criteria:**
  1. Firmware is divided into independent modules with zero circular dependencies:
     - `hal/` — Abstract interfaces (`IRelayDriver`, `ISensorInput`, `ILedIndicator`, `IClock`, `IStorage`) with concrete ESP32-C3 implementations and host-test mocks.
     - `core/brew_fsm` — Deterministic brewing state machine (`REQ-FW-04`).
     - `core/safety_supervisor` — Sensor fault, dry-boil, and maximum runtime watchdog logic (`REQ-SAF-04`, `REQ-SAF-05`).
     - `core/automation_scheduler` — One-off non-repeating in-memory event scheduler (`REQ-FW-03`).
     - `core/config_manager` — Flash config loader and button-combo factory reset handler (`REQ-FW-02`).
     - `comms/ble_service` — BLE fallback provisioning & standalone BLE control (`REQ-WL-01`).
     - `comms/api_client` — Configurable public/private API telemetry client (`REQ-PRV-01`, `REQ-PRV-02`).
     - `comms/remote_wake` — Protocol-agnostic remote wake-up interface (`REQ-WL-03`).
     - `comms/ota_manager` — Multi-transport OTA receiver & partition verifier for BLE, Wi-Fi Interface, and Remote Server Product Page (`REQ-WL-04`, `REQ-WL-05`, `REQ-FW-05`).
  2. Core logic modules (`core/*`) do not `#include` ESP-IDF or Arduino hardware headers directly; they depend exclusively on `hal/` interfaces.

### Verification & Test Documentation (`TC-QA-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Host-side compilation (GCC/Clang on Windows/Linux) of `core/*` and `comms/*` against mock HAL interfaces proves architectural decoupling. Any direct hardware register dependency in core logic will immediately fail the host build.
- **Test Description:**
  1. Run the host-native unit test build target (`pio test -e native` or `cmake --build build_test && ctest`).
  2. Verify that every module in `core/` and `comms/` compiles and passes its unit test suite on the host machine without an ESP32-C3 connected.
  3. *Pass Criteria:* 100% of core and communication modules compile and pass unit tests in the host-native test environment with zero hardware dependencies.
- **Test Implementation (Software):**
  - **Tools:** PlatformIO Native / CMake + GoogleTest or Unity framework in GitHub Actions CI.
  - **Execution:** Automated CI workflow running host unit tests on every commit.

---

## `REQ-QA-03` — Mandatory 3-Tier Test Documentation Standard

- **Category:** Modularity & Quality Assurance (`QA`)
- **Priority:** Must-Have
- **Status:** In-Progress (Applied across all `requirements/REQ-*.md` files)
- **Description:**  
  Every hardware and software requirement and component shall have its test cases formally documented across three distinct engineering stages:
  1. **Test Analysis (Requirement Analysis):** Analyzes how the requirement or component can be verified, its observability points, boundary conditions, and failure modes.
  2. **Test Description:** Defines the exact preconditions, step-by-step test procedure, inputs, and quantitative pass/fail acceptance criteria.
  3. **Test Implementation:** Specifies the concrete test rig, bench instrumentation, or automated test script/file used to execute the verification.
- **Acceptance Criteria:**
  1. Every `REQ-<CAT>-<NN>` entry in the `requirements/` directory includes a linked `TC-<CAT>-<NN>` section containing **Test Analysis**, **Test Description**, and **Test Implementation**.
  2. No hardware revision or firmware module is marked `completed` until its corresponding `TC-<CAT>-<NN>` test implementation has been executed and recorded.

### Verification & Test Documentation (`TC-QA-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Documentation completeness can be verified by auditing all Markdown files in `requirements/` to ensure every `REQ-*` identifier has a matching `TC-*` block with all three mandatory subsections.
- **Test Description:**
  1. Scan all `requirements/REQ-*.md` files for `## REQ-` headings.
  2. Verify each requirement block contains:
     - `### Verification & Test Documentation (TC-...`
     - `- **Test Analysis (Requirement Analysis):**`
     - `- **Test Description:**`
     - `- **Test Implementation`
  3. *Pass Criteria:* 100% traceability coverage (1:1 mapping between `REQ-<CAT>-<NN>` and `TC-<CAT>-<NN>` with all 3 tiers documented).
- **Test Implementation (Software / Documentation Lint):**
  - **Tools:** Markdown structure check script / manual curation review.
  - **Execution:** Verify 100% of requirements in `requirements/` contain all three test tiers.
