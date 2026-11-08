# 📡 Wireless, BLE Provisioning & Remote Wake-Up Requirements (`REQ-WL-*`)

> **Scope:** Covers Bluetooth Low Energy (BLE) provisioning and standalone BLE control, Wi-Fi connectivity, protocol-agnostic remote server wake-up, and safe OTA firmware updates on the `ESP32-C3` (`U1`).

---

## `REQ-WL-01` — Automatic BLE Provisioning & Standalone BLE Operation

- **Category:** Wireless (`WL`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  Upon boot, if no configuration file is found in flash memory (either out-of-the-box or after a button-combo factory reset per `REQ-FW-02`), the coffee machine shall automatically enable its Bluetooth Low Energy (BLE) interface so the user can either:
  1. Provision a configuration file (e.g., Wi-Fi SSID/password and public/private API endpoint), **OR**
  2. Operate the coffee machine directly via BLE (starting/stopping brews, setting a one-off automation, and reading sensor status) without ever needing to configure or connect to a Wi-Fi network.
- **Acceptance Criteria:**
  1. On boot, the firmware checks flash storage for a valid configuration file (`config.json` / NVS). If absent, BLE advertising starts automatically within <= 2.0 seconds.
  2. Exposes a documented BLE GATT Service providing:
     - **Provisioning Characteristics:** Write Wi-Fi credentials, write custom API server URL (`REQ-PRV-02`), save config to flash, or trigger Wi-Fi connection test.
     - **Direct Appliance Control & Status Characteristics:** Start/Cancel brew, arm a one-off in-memory automation (`REQ-FW-03`), and read machine state / sensor values (`REQ-SEN-01`–`03`).
  3. Users who prefer a BLE-only workflow can use all smart brewing features over BLE indefinitely without configuring Wi-Fi.

### Verification & Test Documentation (`TC-WL-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Missing-config detection, BLE GATT service discovery, characteristic read/writes, and BLE-only brew execution can be tested both via mocked config files in software and via a BLE client (e.g., smartphone or Python `bleak` script) against `U1`.
- **Test Description:**
  1. Boot `U1` after a factory reset (`REQ-FW-02`) so no config file exists in flash.
  2. Scan for BLE devices and verify the machine advertises its service using its Machine ID (`REQ-PRV-03`).
  3. Without configuring Wi-Fi, send a `START_BREW` command and a `SET_ONE_OFF_AUTOMATION` command over BLE GATT -> verify both work in standalone BLE mode.
  4. Write a Wi-Fi configuration payload over BLE GATT and verify the config file is persisted to flash and Wi-Fi connection initiates.
  5. *Pass Criteria:* BLE starts automatically when unconfigured; 100% of direct brew controls and Wi-Fi provisioning succeed over BLE.
- **Test Implementation (Software & Hardware):**
  - **Tools:** Python `bleak` automated BLE test script / nRF Connect app, Unit tests for `ConfigLoader` and `BleGattHandler`.
  - **Execution:** Run automated BLE GATT read/write test suite against `ESP32-C3-DevKitM-1` (`U1`).

---

## `REQ-WL-02` — Wi-Fi Connectivity & Resilient Reconnection

- **Category:** Wireless (`WL`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  When a valid Wi-Fi configuration is present in the flash configuration file, the machine shall connect to the configured wireless network in the background to enable local web control and API communication, while keeping BLE fallback or physical controls available if Wi-Fi fails (`REQ-SAF-03`).
- **Acceptance Criteria:**
  1. Non-blocking asynchronous Wi-Fi connection manager with exponential backoff retry if the Access Point is temporarily unavailable.
  2. If Wi-Fi connection fails repeatedly (e.g., router changed or wrong password), the machine keeps BLE control active and continues operating normally via physical buttons (`REQ-FW-01`).
  3. Supports local HTTP/REST or WebSocket status and control when connected to the local network.

### Verification & Test Documentation (`TC-WL-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Wi-Fi state transitions (`DISCONNECTED` -> `CONNECTING` -> `CONNECTED` -> `BACKOFF_RETRY`) can be tested by provisioning valid vs. invalid credentials and toggling AP availability.
- **Test Description:**
  1. Provision valid Wi-Fi credentials via BLE (`REQ-WL-01`) and verify the machine obtains an IP address within <= 10 seconds.
  2. Provision an invalid Wi-Fi password and verify the machine enters non-blocking backoff retry while BLE and physical buttons remain 100% functional.
  3. *Pass Criteria:* Connects reliably with valid credentials; zero blocking of brew or BLE tasks when Wi-Fi fails.
- **Test Implementation (Software & Hardware):**
  - **Tools:** Wi-Fi Access Point, Network Ping / HTTP test script, Unit test for `WifiManager` backoff state machine.
  - **Execution:** Verify reconnection after 5-minute AP outage and confirm zero impact on `BrewFSM` loop timing.

---

## `REQ-WL-03` — Protocol-Agnostic Remote Server Wake-Up Trigger (Protocol TBD)

- **Category:** Wireless (`WL`)
- **Priority:** Must-Have
- **Status:** Planned (Communication Protocol To Be Defined)
- **Description:**  
  The coffee machine shall be capable of being woken up from its idle/standby state by a remote server (public or self-hosted private server) to initiate a readiness check, synchronize a one-off automation, or start a brew cycle, using whatever network/application communication protocol the software engineer chooses to implement (**To Be Defined — TBD**).
- **Acceptance Criteria:**
  1. **Protocol Abstraction:** The firmware architecture defines an abstract `IRemoteWakeListener` / `WakeUpHandler` interface that decouples the wake-up action from the underlying transport protocol (whether implemented later via persistent TCP/WebSocket, MQTT, CoAP, UDP magic packet, long-polling, or server-sent events).
  2. **Safety Gate on Wake-Up:** When woken up by the remote server to brew, the machine MUST still pass all local hardware and sensor pre-checks (`REQ-SEN-01` thermistor valid, `REQ-SEN-02` water present, `REQ-SEN-03` carafe seated, `REQ-SAF-04` no active faults) before energizing heaters `K1`/`K2`.
  3. Upon receiving a valid wake-up signal, the machine transitions from low-power/idle standby to active state within <= 2.0 seconds and acknowledges its current readiness status back to the configured server.

### Verification & Test Documentation (`TC-WL-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Because the wake-up handler is decoupled behind a protocol-agnostic software interface (`IRemoteWakeListener`), the wake-up logic, pre-brew safety gating, and state transition can be tested today using a mock/loopback transport, and later re-verified over the chosen network protocol without changing the test assertions.
- **Test Description:**
  1. Place the machine in `IDLE / STANDBY` state.
  2. Dispatch a remote wake-up event through the `IRemoteWakeListener` interface (with water tank filled and carafe seated) -> verify the machine wakes within <= 2.0 s, validates safety sensors, and executes the requested wake action.
  3. Dispatch a remote wake-up brew command while the water tank is empty (`REQ-SEN-02`) -> verify the machine wakes up, refuses to energize `K1`, and reports `WAKE_REJECTED_NO_WATER` to the server.
  4. *Pass Criteria:* Wake-up transitions machine out of standby in <= 2.0 s; 100% enforcement of local safety interlocks upon remote wake.
- **Test Implementation (Software & Network Integration):**
  - **Tools:** `MockRemoteWakeTransport` in C/C++ unit tests; local reference server script (once protocol is selected) sending wake-up payload over LAN.
  - **Execution:** Execute unit tests against `WakeUpController` and end-to-end network wake test on `U1`.

---

## `REQ-WL-04` — Multi-Channel OTA Firmware Update (BLE, Wi-Fi Interface & Remote Server "Product Page")

- **Category:** Wireless (`WL`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The coffee machine MCU (`U1` `ESP32-C3`) shall support Over-The-Air (OTA) firmware updates across three distinct delivery channels so that users can update the machine regardless of whether they use it in BLE-only mode, on a local Wi-Fi network, or connected to a remote server:
  1. **BLE OTA Upload:** Firmware image transfer over Bluetooth Low Energy (BLE GATT OTA service), allowing users who never configure Wi-Fi (`REQ-WL-01`) to upload updates directly from a smartphone or computer.
  2. **Wi-Fi Local Interface OTA Upload:** Direct firmware binary (`.bin`) upload via the machine's local Wi-Fi HTTP/Web interface.
  3. **Remote Server ("Product Page") OTA Update:** Remote firmware update triggered or uploaded via the **Product Page** on the configured remote server (public or private per `REQ-PRV-02`), where the server notifies/wakes the machine (`REQ-WL-03`) or streams the update binary to the MCU.
- **Acceptance Criteria:**
  1. **Unified OTA Pipeline:** All three transport channels (BLE GATT chunks, Local Wi-Fi HTTP multipart/octet-stream upload, and Remote Server Product Page stream/pull) feed into a single modular `IOtaManager` firmware interface (`REQ-QA-02`) that writes to the inactive ESP32-C3 OTA partition (`REQ-HW-07`).
  2. **BLE OTA Support:** Negotiates maximum supported BLE MTU (up to 247–517 bytes) with packet sequence/CRC acknowledgment so full firmware images transfer reliably over BLE without corruption.
  3. **Wi-Fi Interface Support:** Exposes a local endpoint (e.g., `POST /api/ota/upload`) and web UI upload control on the local Wi-Fi interface reporting live percentage progress (`0%`–`100%`).
  4. **Remote Server "Product Page" Support:** Allows the user to trigger or upload a firmware update from the remote server's Product Page; the MCU downloads/receives the image from the configured server endpoint, reports progress/status back via API, and reboots into the updated firmware.

### Verification & Test Documentation (`TC-WL-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Each of the three OTA ingress channels (BLE, Local Wi-Fi HTTP, Remote Server Product Page) can be tested independently against a common test firmware image (`v1.0.0-test` -> `v1.0.1-test`) while asserting partition switchover and reported firmware version after reboot.
  - *Boundary Conditions:* BLE packet loss / MTU negotiation fallback; Wi-Fi disconnect at 50% upload; corrupted binary upload from the Product Page.
- **Test Description:**
  1. **BLE OTA Test:**With Wi-Fi unconfigured, connect via a BLE OTA script/client, stream `firmware_v1.0.1.bin` over the BLE OTA GATT characteristic, verify progress notifications, and confirm `U1` reboots running `v1.0.1`.
  2. **Wi-Fi Local Interface OTA Test:** Upload `firmware_v1.0.2.bin` via `POST /api/ota/upload` on the local Wi-Fi interface -> verify HTTP 200 completion, reboot, and version `v1.0.2`.
  3. **Remote Server "Product Page" OTA Test:** Trigger an OTA update from a mock Remote Server Product Page -> verify `U1` fetches/receives `firmware_v1.0.3.bin`, reports completion status to the server API, and boots `v1.0.3`.
  4. *Pass Criteria:* 100% successful firmware update and version increment across all three channels (BLE, Wi-Fi interface, and Remote Server Product Page).
- **Test Implementation (Software & Hardware):**
  - **Tools:** Python BLE OTA uploader script (`bleak`), `curl` / Local Web UI test script, Mock Remote Server Product Page OTA endpoint, C/C++ Unit Tests for `OtaManager` chunk reassembly.
  - **Execution:** End-to-end OTA verification across all 3 transports on `ESP32-C3-DevKitM-1` (`U1`).

---

## `REQ-WL-05` — Safe Idle-Only OTA Execution, Integrity Verification & Automatic Rollback

- **Category:** Wireless (`WL`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  Over-The-Air (OTA) firmware updates from any channel (BLE, Wi-Fi Interface, or Remote Server Product Page) shall only be permitted when the coffee machine is in the `IDLE` state with all heating elements (`K1`, `K2`) strictly de-energized, and shall enforce cryptographic/checksum integrity verification and automatic bootloader rollback on failure.
- **Acceptance Criteria:**
  1. **Idle-Only Interlock:** Any OTA update request (BLE, Wi-Fi, or Remote Server) received while the machine is in `BREWING` or `KEEP_WARM` is immediately rejected with status `BUSY_HEATING`.
  2. **Heater Lockout During OTA:** Once an OTA transfer begins from `IDLE`, the FSM enters an `OTA_UPDATING` lockout state that explicitly forces `K1` and `K2` OFF and blocks physical, BLE, or remote brew start commands until the update finishes or aborts.
  3. **Cryptographic Signature, Image Validation & Rollback:** The MCU verifies the SHA-256 digest, ESP32-C3 image header, and asymmetric cryptographic digital signature against its compiled-in trusted keyring (`REQ-FW-06`, `REQ-PRV-04` — Developer Key, User BYOK Key, or Dual-Key) before marking the new partition bootable. If the payload is unsigned, signed by an untrusted key, interrupted, or fails its post-boot self-test (`REQ-FW-05`), the update is rejected or automatically rolled back to the previous working partition.

### Verification & Test Documentation (`TC-WL-05`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* OTA safety guard conditions depend on `BrewFSM::getCurrentState()`. Corrupt image rejection and mid-transfer power loss recovery can be tested deterministically by flipping bytes in a `.bin` file and cutting power at 50% progress.
- **Test Description:**
  1. Put the machine into `BREWING` state and attempt an OTA upload via BLE, Wi-Fi, and Remote Server -> verify all three are rejected with `BUSY_HEATING` and brewing continues uninterrupted.
  2. Start an OTA upload in `IDLE` and press the physical Brew button (`SW1`) at 40% progress -> verify heaters `K1`/`K2` remain strictly OFF during the update.
  3. Upload a truncated or byte-corrupted `.bin` file -> verify `OtaManager` rejects the image before reboot and remains on the current firmware.
  4. Cut power halfway through an OTA upload -> verify the device boots cleanly into the existing intact partition.
  5. *Pass Criteria:* Zero OTA updates permitted while heating; zero heater activations permitted during OTA; 100% safe recovery from corrupted or interrupted transfers.
- **Test Implementation (Software & Hardware):**
  - **Tools:** Corrupted `.bin` generator script, Unit tests for `OtaSafetyGuard`, Hardware power-interrupt test on `U1`.
  - **Execution:** Run automated unit test matrix across all FSM states + corrupted/interrupted OTA tests on bench hardware.

