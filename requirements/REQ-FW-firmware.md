# ⚙️ Firmware, Offline Controls & Automation Requirements (`REQ-FW-*`)

> **Scope:** Covers local appliance behavior, physical button controls, hardware button-combination factory reset, one-off in-memory brew automations, and the core brewing state machine.

---

## `REQ-FW-01` — Offline-First Physical Controls & Standalone Appliance Operation

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  Anyone in the kitchen shall be able to operate the coffee machine as a simple, standalone domestic appliance using its physical controls (`SW1`–`SW3`) and status LEDs (`D3`, `D4`) even if no wireless configuration exists, BLE is idle, or the Wi-Fi network / remote server has failed.
- **Acceptance Criteria:**
  1. Cold boot-to-ready time for physical button polling and safety supervision is under 1.5 seconds (must not wait for Wi-Fi association or BLE connection before enabling manual brewing).
  2. A single physical button press starts or cancels a brew cycle immediately (< 100 ms response time).
  3. Local LEDs (`D3`, `D4` driven via `Q2`) clearly communicate `IDLE`, `BREWING`, `KEEP_WARM`, `BLE_UNCONFIGURED`, and `FAULT` states without requiring a smartphone or web browser.

### Verification & Test Documentation (`TC-FW-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Boot-to-ready time is measurable from `VCC` power-good to the first GPIO poll / LED ready signal; offline button actuation is testable with RF completely disabled or unconfigured.
- **Test Description:**
  1. Erase all Wi-Fi configuration so the device is in a blank state.
  2. Apply power to the board and press the physical Start button at $t = 1.5\,\text{s}$ after power-on.
  3. Press the physical Cancel button during active brewing.
  4. *Pass Criteria:* Brew starts at $t \le 1.5\,\text{s}$ on button press (`K1` energizes, `D3`/`D4` indicate brewing); second press immediately cancels brew (`K1` de-energizes).
- **Test Implementation (Hardware & Software):**
  - **Tools:** Logic Analyzer (Channel 0: `VCC`, Channel 1: `SW1`, Channel 2: `K1` coil drive, Channel 3: `Q2` LED drive).
  - **Execution:** Capture power-on-to-ready timing trace and verify `< 1500 ms` boot readiness.

---

## `REQ-FW-02` — Physical Button Combination Factory Reset (Flash Config Wipe)

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  It shall be possible to reset the coffee machine using a specific physical button combination/sequence on the machine itself (`SW1`–`SW3`), which erases the configuration file from non-volatile flash memory (NVS / LittleFS), clears any in-memory automations, and reboots the machine into a clean, blank factory state (ready for fresh BLE provisioning per `REQ-WL-01`).
- **Acceptance Criteria:**
  1. A deliberate multi-button chord or long-press sequence (e.g., holding `SW1 + SW2` simultaneously for >= 5.0 seconds, or pressing `SW1` 5 times within 3 seconds while holding `SW2`) triggers the factory reset routine.
  2. Accidental single button presses or brief bumps (< 5.0 seconds) never trigger a factory reset.
  3. Executing the reset combination deletes the configuration file (Wi-Fi credentials, custom API endpoints, pairing tokens) from flash memory, flashes a confirmation pattern on LEDs `D3`/`D4`, and restarts `U1` into blank BLE provisioning mode.
  4. If heaters (`K1`, `K2`) are active when the reset combo is triggered, heaters are immediately de-energized before flash erasure and reboot.

### Verification & Test Documentation (`TC-FW-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Flash filesystem contents before and after the button sequence can be inspected via serial diagnostic output or BLE provisioning state advertisement. Boundary hold durations (e.g., 4.0 s vs. 5.5 s) prevent false triggers.
- **Test Description:**
  1. Provision the machine with a valid configuration file in flash (Wi-Fi SSID + custom API endpoint).
  2. Hold the reset button combination for 3.5 seconds and release -> verify config file is NOT erased.
  3. Hold the reset button combination for >= 5.0 seconds -> verify LEDs `D3`/`D4` flash the reset confirmation pattern, the config file is deleted from flash, and `U1` reboots into blank BLE configuration mode.
  4. *Pass Criteria:* Config file is completely removed from flash after >= 5.0 s combo; device advertises BLE provisioning state upon reboot; holding for < 5.0 s leaves config intact.
- **Test Implementation (Software & Hardware):**
  - **Tools:** C/C++ Unit Tests for `ButtonComboDetector` and `ConfigManager::factoryReset()`, plus physical test on `U1` (`ESP32-C3-DevKitM-1`).
  - **Execution:** Automated unit tests checking timing thresholds (4900 ms = no reset, 5000 ms = reset) and bench verification of NVS/flash file deletion.

---

## `REQ-FW-03` — One-Off Non-Repeating In-Memory Brew Automations

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The coffee machine shall be able to hold in memory scheduled automations for the brewer (for example: *"Start making coffee at 06:00 in the morning"*) strictly as **one-off events** stored in volatile RAM (in-memory) that execute once and **never repeat by themselves**.
- **Acceptance Criteria:**
  1. Why One-Off Only: A drip coffee machine requires a human to physically load fresh paper filters, ground coffee, water, and an empty carafe before every brew. Repeating a daily schedule automatically without human preparation would dry-boil an empty machine or re-brew spent grounds.
  2. Automations are held in volatile memory (RAM) as single-execution (one-shot) event objects containing a target timestamp or countdown delay.
  3. Immediately upon triggering at the target time (whether the brew succeeds or is aborted by a pre-brew safety check such as missing carafe/water), the automation is consumed and purged from memory so it cannot fire again the next day.
  4. Any manual brew start, manual cancel, power loss, or factory reset (`REQ-FW-02`) automatically clears pending in-memory brew automations.

### Verification & Test Documentation (`TC-FW-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* The automation queue resides in RAM and is governed by a state/timer module that can be deterministically tested across simulated 24-hour and 48-hour clock rollovers.
  - *Boundary Conditions:* Target time reached with valid sensors; target time reached with empty water tank; clock rollover past 24 hours after trigger; power cycle while an automation is armed.
- **Test Description:**
  1. Schedule an automation via BLE or API to brew at `06:00:00`.
  2. Advance system time to `06:00:00` with water and carafe present -> verify brew starts once and the automation slot transitions to `CONSUMED / EMPTY`.
  3. Advance system time by another 24 hours to the next day's `06:00:00` -> verify the brewer does **NOT** trigger again.
  4. Schedule a new automation in RAM, then power-cycle `U1` -> verify the volatile automation queue is empty on boot.
  5. *Pass Criteria:* Every scheduled automation fires at most once, is immediately deleted from memory upon trigger, and never repeats autonomously.
- **Test Implementation (Software):**
  - **Tools:** Host-based C/C++ Unit Test Suite (`test_automation_scheduler.cpp`) with injectable mock clock (`MockTimeProvider`).
  - **Execution:** Run unit test cases covering 1-shot execution, 24h+ rollover non-repetition, manual cancel clearing, and pre-check failure consumption.

---

## `REQ-FW-04` — Deterministic Brew Finite-State Machine (FSM)

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The firmware shall implement a deterministic Finite-State Machine (FSM) governing all transitions between `IDLE`, `ARMED_ONE_OFF`, `PRE_CHECK`, `BREWING`, `KEEP_WARM`, `COOLDOWN`, and `FAULT_LOCKOUT`, with explicit entry/exit actions for relays `K1` and `K2`.
- **Acceptance Criteria:**
  1. Heaters (`K1`, `K2`) are guaranteed to be forced `OFF` on entry to `IDLE`, `ARMED_ONE_OFF`, `PRE_CHECK`, `COOLDOWN`, and `FAULT_LOCKOUT`.
  2. Every state transition is logged (locally and via optional API event when configured) with a clear transition reason code (`USER_BUTTON`, `BLE_CMD`, `API_CMD`, `ONE_OFF_TIMER`, `REMOTE_WAKE`, `BREW_COMPLETE`, `SAFETY_FAULT`).
  3. Illegal state transitions (e.g., transitioning directly from `FAULT_LOCKOUT` to `BREWING` without clearing the fault) are rejected by the FSM guard logic.

### Verification & Test Documentation (`TC-FW-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* As a pure state machine decoupled from hardware GPIO via a Hardware Abstraction Layer (HAL), 100% of state transitions and guard conditions can be verified in automated unit tests.
- **Test Description:**
  1. Execute a full matrix of valid and invalid state transition events against the `BrewFSM` module.
  2. Verify that `K1` (Boiler) is only `ON` during `BREWING` and `K2` (Hotplate) is only `ON` during `BREWING` / `KEEP_WARM`.
  3. Inject a `SAFETY_FAULT` event from every active state and verify immediate transition to `FAULT_LOCKOUT` with both `K1` and `K2` set to `OFF`.
  4. *Pass Criteria:* 100% state and transition coverage in unit tests; zero states allow heaters to remain latched on exit.
- **Test Implementation (Software):**
  - **Tools:** Native C/C++ unit test runner (Unity / GoogleTest / PlatformIO Native) with `MockRelayDriver` and `MockSensorBus`.
  - **Execution:** Automated CI test suite verifying the complete FSM state transition table.

---

## `REQ-FW-05` — MCU OTA Post-Boot Self-Test, Rollback & Config Preservation

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  When the MCU (`U1` `ESP32-C3`) boots into a newly uploaded OTA firmware image (whether uploaded via BLE, Local Wi-Fi Interface, or the Remote Server Product Page per `REQ-WL-04`), the firmware shall execute an automated post-boot self-test before marking the new partition as valid, and shall preserve the existing user configuration file in flash across updates.
- **Acceptance Criteria:**
  1. On first boot of a pending-verify OTA image (`ESP_OTA_IMG_PENDING_VERIFY`), the MCU initializes GPIO safe states (`K1`/`K2` OFF), verifies flash config readability, and checks core task initialization before calling `esp_ota_mark_app_valid_cancel_rollback()`.
  2. If the new firmware crashes, panics, or triggers the watchdog before completing the self-test within <= 10 seconds, the ESP32-C3 bootloader automatically rolls back to the previous known-good firmware slot (`REQ-HW-07`, `REQ-WL-05`).
  3. Performing an OTA firmware update leaves the existing flash configuration file (Wi-Fi credentials, public/private API URL) intact so the user does not have to re-provision the machine after an update.

### Verification & Test Documentation (`TC-FW-05`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Bootloader rollback can be tested by uploading a deliberate "faulty test firmware" that triggers `abort()` prior to calling `mark_app_valid`. Config persistence can be verified by reading configured settings before and after an OTA upgrade.
- **Test Description:**
  1. Configure Wi-Fi and a custom API URL on firmware `v1.0.0`.
  2. Upload a valid firmware `v1.0.1` via OTA (BLE, Wi-Fi, or Product Page) -> verify self-test passes, `v1.0.1` is marked valid, and the Wi-Fi/API configuration remains intact without re-provisioning.
  3. Upload a faulty test firmware `v1.0.2-crash` that panics on startup -> verify the ESP32-C3 bootloader automatically reverts to `v1.0.1` on reboot and resumes normal operation.
  4. *Pass Criteria:* 100% config retention across valid OTA updates; 100% automatic recovery to `v1.0.1` when a broken OTA image boots.
- **Test Implementation (Software & Hardware):**
  - **Tools:** ESP-IDF OTA rollback API (`CONFIG_BOOTLOADER_APP_ROLLBACK_ENABLE`), deliberate crash test binary, Serial boot log monitor.
  - **Execution:** Upload valid and crash-test OTA binaries to `U1` and assert post-reboot active partition and config state.

---

## `REQ-FW-06` — Cryptographic OTA Signature Verification with Multi-Key Trust Store

- **Category:** Firmware (`FW`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  All Over-The-Air (OTA) firmware payloads (whether uploaded via BLE, Local Wi-Fi Interface, or the Remote Server Product Page per `REQ-WL-04`) shall be cryptographically signed in order to be accepted by the MCU (`U1` `ESP32-C3`). The firmware signature verification subsystem shall support a configurable multi-key public keyring supporting three trust configurations:
  1. **Official Precompiled Release Mode (Developer Key Only):** Uses the precompiled firmware from official repository releases, embedding the project developer's public key (`dev_pubkey.pem`).
  2. **Bring Your Own Key Mode (User Key Only):** The user compiles the firmware themselves with only their own custom public key (`user_pubkey.pem`), rejecting all external binaries including official releases.
  3. **Dual-Trust Mode (Developer Key + User Key):** The user compiles the firmware themselves with **both** public keys (`dev_pubkey.pem` and `user_pubkey.pem`) enrolled in the firmware's trusted keyring so the machine accepts both official repository releases and the user's self-signed builds.
- **Acceptance Criteria:**
  1. Every OTA firmware package includes a cryptographic digital signature block (e.g., ECDSA P-256 / Ed25519 / RSA-3072 signature over the SHA-256 image digest).
  2. During an OTA update, `OtaSignatureVerifier` verifies the payload digest against each public key present in the compiled-in trusted keyring (`TrustedKeyring[1..2]`).
  3. If the OTA payload is unsigned, tampered with (1-bit flip), or signed by an unrecognized private key not in `TrustedKeyring`, the MCU immediately rejects the update (`OTA_ERR_INVALID_SIGNATURE`), erases/invalidates the staging partition, and never boots the untrusted image.
  4. Build flags / CMake options (`-DOTA_TRUST_DEV_KEY=ON/OFF`, `-DOTA_TRUST_USER_KEY_PATH=...`) allow effortless selection between Developer-only, User-only (BYOK), or Dual-Key builds.

### Verification & Test Documentation (`TC-FW-06`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Signature verification is a deterministic mathematical function over `(ImageBytes, Signature, TrustedPublicKeys[])`. All three trust modes and negative attack vectors (unsigned binary, corrupted binary, rogue private key) can be tested in host-native unit tests and on the target ESP32-C3.
  - *Boundary Conditions:* Unsigned `.bin`; valid signature with 1 byte modified in payload; valid payload signed by an unknown 3rd-party key; Dual-Key build verifying a Developer-signed image followed by a User-signed image.
- **Test Description:**
  1. Generate three test keypairs: `DevKey`, `UserKey`, and `RogueKey`.
  2. Compile firmware in **Dual-Trust Mode** (`DevKey.pub` + `UserKey.pub` enabled):
     - Attempt OTA with an **unsigned** binary -> verify rejected (`OTA_ERR_INVALID_SIGNATURE`).
     - Attempt OTA with a binary signed by `RogueKey` -> verify rejected (`OTA_ERR_INVALID_SIGNATURE`).
     - Attempt OTA with a binary signed by `DevKey` but with 1 byte altered after signing -> verify rejected (`OTA_ERR_INVALID_SIGNATURE`).
     - Attempt OTA with a valid binary signed by `DevKey` -> verify **ACCEPTED**.
     - Attempt OTA with a valid binary signed by `UserKey` -> verify **ACCEPTED**.
  3. Compile firmware in **BYOK Mode** (`UserKey.pub` only) -> verify `DevKey`-signed binary is rejected and `UserKey`-signed binary is accepted.
  4. *Pass Criteria:* 100% rejection of unsigned, tampered, or untrusted-key payloads; 100% acceptance of validly signed payloads matching the active keyring configuration.
- **Test Implementation (Software & Hardware):**
  - **Tools:** OpenSSL / `espsecure.py` signing script, `mbedtls` / cryptographic verifier unit tests (`test_ota_signature.cpp`), Bench OTA upload script.
  - **Execution:** Automated CI test matrix testing all 3 build modes (`DEV_ONLY`, `USER_ONLY`, `DUAL_KEY`) against 5 signed/unsigned payload variants.


