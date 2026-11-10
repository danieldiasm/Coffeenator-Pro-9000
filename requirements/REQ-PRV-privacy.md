# 🔒 Privacy, Telemetry & Data Sovereignty Requirements (`REQ-PRV-*`)

> **Core Philosophy:** The Coffeenator Pro 9000 respects user privacy and ownership completely. It shall never capture hidden telemetry or phone home to hardcoded third-party servers, shall never store or transmit personal identifiable information (PII), and shall allow the user to point all API data exchanges to either a public service or their own private/self-hosted server.

---

## `REQ-PRV-01` — Zero Hidden Telemetry & Explicit API-Only Data Capture

- **Category:** Privacy & Telemetry (`PRV`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  The coffee machine shall **NOT** capture any hidden form of telemetry, background analytics, crash reporting, or undocumented network beacons, nor leave architectural space/hooks for hidden tracking. All operational data capture and reporting shall occur exclusively via documented, explicit API calls that the user controls.
- **Acceptance Criteria:**
  1. Zero third-party analytics SDKs, cloud vendor telemetry agents, or hardcoded external IP/domain callbacks exist in the firmware binary or build dependencies.
  2. When no API endpoint is configured (or when operating in offline/BLE-only mode), the coffee machine generates **zero** outbound internet traffic.
  3. Every outbound or inbound API payload is human-readable (e.g., documented JSON schema) and restricted strictly to coffee machine operational state (temperatures, water/carafe sensor status, brew state, and machine ID).

### Verification & Test Documentation (`TC-PRV-01`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Network silence and strict adherence to documented API endpoints can be verified definitively via packet capture (Wireshark / `tcpdump`) on the test router and static binary string inspection of the compiled firmware ELF/BIN.
- **Test Description:**
  1. Inspect the compiled firmware binary (`strings firmware.bin`) to verify no hardcoded external domains or analytics endpoints are present.
  2. Connect the coffee machine to an isolated Wi-Fi test VLAN running full packet capture (`tcpdump -i wlan0 -w capture.pcap`) for 24 hours across boot, idle, brewing, and error states:
     - Case A: With API endpoint disabled/blank -> verify 0 outbound TCP/UDP packets beyond local DHCP/ARP.
     - Case B: With a local private API endpoint configured -> verify 100% of outbound application packets are addressed strictly to the user-configured API host/port and match the documented API schema.
  3. *Pass Criteria:* Zero undocumented connections, DNS lookups, or hidden telemetry packets observed over a 24-hour capture window.
- **Test Implementation (Software & Network):**
  - **Tools:** Wireshark / `tcpdump`, `binutils` (`strings`, `objdump`) in CI pipeline, Schema validator for API payloads.
  - **Execution:** Automated CI check scanning firmware symbols/strings + 24-hour network packet capture audit.

---

## `REQ-PRV-02` — User-Configurable Public or Private API Endpoint

- **Category:** Privacy & Telemetry (`PRV`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  All API data capture and remote interaction shall be configurable by the user (via the BLE configuration flow or configuration file) to point to a public service, a self-hosted private service (e.g., local Home Assistant, private LAN server, or custom webhook), or disabled entirely.
- **Acceptance Criteria:**
  1. The configuration file stored in flash supports a user-definable `api_base_url` / endpoint parameter (supporting both public HTTPS URLs and private LAN HTTP/HTTPS IPs or hostnames) as well as an explicit `telemetry_enabled` toggle.
  2. Changing the API endpoint via BLE (`REQ-WL-01`) or local configuration immediately directs all subsequent API calls to the newly configured service without requiring a custom firmware recompile.
  3. If the configured public or private API server is unreachable, the failure is handled gracefully without affecting local brewing (`REQ-SAF-03`).

### Verification & Test Documentation (`TC-PRV-02`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* The API client module takes its target URL dynamically from the runtime configuration struct, allowing tests to switch between a mock public server, a local LAN server, and `disabled` mode at runtime.
- **Test Description:**
  1. Configure `api_base_url` via BLE to Mock Server A (`http://192.168.1.100:8080/api`) and trigger a brew -> verify Server A receives the documented API calls.
  2. Reconfigure `api_base_url` via BLE to Mock Server B (`https://example-public-service.local/v1`) -> verify Server A receives zero further calls and Server B receives the API calls.
  3. Set `api_base_url` to empty / disabled -> verify zero API calls are transmitted during a brew cycle.
  4. *Pass Criteria:* 100% of API traffic follows the user's runtime configuration without firmware recompilation.
- **Test Implementation (Software & Integration):**
  - **Tools:** Two lightweight Python HTTP mock servers (`MockPublicServer`, `MockPrivateServer`), C/C++ Unit Tests for `ApiClient`.
  - **Execution:** Automated integration test switching endpoints dynamically and asserting request routing.

---

## `REQ-PRV-03` — Prohibition of Personal Identifiers (Machine ID / MAC Only)

- **Category:** Privacy & Telemetry (`PRV`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  There shall **NOT** be any personal identifiers (PII) stored on or transmitted by the coffee machine itself (no user names, email addresses, phone numbers, home street addresses, GPS coordinates, or personal account profiles). A hardware/machine identifier (such as a factory MAC address or a deterministic hex Machine ID like `CFN-A1B2C3D4E5F6`) is permitted solely to identify the appliance on the network or BLE bus.
- **Acceptance Criteria:**
  1. Neither the flash configuration file schema nor the BLE GATT / HTTP API schemas contain fields for user names, emails, passwords (other than the local Wi-Fi PSK / API bearer token), or location data.
  2. The appliance identifies itself exclusively via its anonymous hardware `machine_id` (derived from the ESP32-C3 hardware MAC / eFuse ID or a randomly generated UUID on reset).
  3. Inspecting a raw flash dump of the coffee machine reveals zero personal identity information about its owner.

### Verification & Test Documentation (`TC-PRV-03`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* Data structures for NVS/flash storage, BLE advertisements, and API JSON payloads are strictly typed in code and can be audited both statically (schema review) and dynamically (flash dump + payload inspection).
- **Test Description:**
  1. Review the C/C++ struct definitions and JSON serialization schemas for `DeviceConfig`, `BleAdvertisement`, and `ApiTelemetryPayload`.
  2. Provision the device and dump the entire NVS / flash configuration partition via `esptool.py read_flash`.
  3. Capture BLE advertisement packets and API JSON payloads and verify the only identifier present is the anonymous `machine_id` / MAC address.
  4. *Pass Criteria:* Zero PII fields exist in any storage schema or network/BLE packet; `machine_id` matches the expected hardware MAC/ID format.
- **Test Implementation (Software & Security Audit):**
  - **Tools:** JSON Schema validator in unit tests, `esptool.py` flash partition dump inspection.
  - **Execution:** Automated schema validation test in CI ensuring only whitelisted keys (`machine_id`, `state`, `boiler_temp_c`, `hotplate_temp_c`, `water_level`, `carafe_present`, `uptime_s`) can be serialized.

---

## `REQ-PRV-04` — Cryptographic Firmware Ownership & Right-to-Sign (Anti-Tamper Without Vendor Lock-In)

- **Category:** Privacy & Telemetry (`PRV`)
- **Priority:** Must-Have
- **Status:** Planned
- **Description:**  
  To prevent unauthorized third parties or compromised network servers from pushing malicious or telemetry-capturing firmware onto the coffee machine (`REQ-PRV-01`), all OTA updates must be cryptographically signed (`REQ-FW-06`). However, to preserve full user sovereignty and Right-to-Repair (avoiding vendor lock-in), the project shall allow the owner to choose their own cryptographic trust boundary:
  1. **Use Official Precompiled Releases:** Flash precompiled release binaries from the project repository signed by the developer's key.
  2. **Bring Your Own Key (Self-Sovereign Mode):** Generate a private/public keypair locally, compile the firmware from source with only the user's public key trusted, and sign updates privately.
  3. **Dual-Key Coexistence (Developer + User Keys Valid):** Compile the firmware from source with both the developer's public key and the user's own public key trusted simultaneously.
- **Acceptance Criteria:**
  1. **Protection Against Rogue Telemetry Injection:** Unsigned or untrusted OTA packages are strictly rejected across BLE, Wi-Fi, and Remote Server Product Page channels, ensuring an attacker cannot silently replace the privacy-respecting firmware with spyware.
  2. **Zero Hardware Lock-Out:** The MCU (`U1` `ESP32-C3`) does not permanently burn irreversible vendor-only eFuses that would forbid the owner from flashing custom self-signed firmware over physical USB/UART or configuring their own OTA signing keys.
  3. **Open Key Generation & Signing Tooling:** The repository provides documented, offline-capable scripts to generate user signing keys, sign OTA payloads locally, and build in `DEV_ONLY`, `USER_ONLY`, or `DUAL_KEY` mode without contacting any external key server.

### Verification & Test Documentation (`TC-PRV-04`)
- **Test Analysis (Requirement Analysis):**
  - *Testability:* The key generation, local signing tool, and build configuration flags operate 100% offline and deterministically produce firmware images whose embedded public keyring (`TrustedKeyring`) can be inspected and tested against signed OTA packages.
- **Test Description:**
  1. Run the repository's key generation and signing scripts inside an offline environment (network interface disabled) to generate a custom `UserKey` and sign a custom firmware image.
  2. Build the firmware in **BYOK Mode** (`USER_ONLY`) and verify that even an authentic official release signed by `DevKey` is rejected over OTA, proving the user has total sovereignty when desired.
  3. Build the firmware in **Dual-Key Mode** (`DUAL_KEY`) and verify that both official repository release binaries (`DevKey`) and custom user builds (`UserKey`) are accepted over OTA, while any third-party key is rejected.
  4. *Pass Criteria:* Offline key generation and signing succeed with 0 network dependencies; all three user-chosen trust policies behave exactly as configured.
- **Test Implementation (Software & Build System):**
  - **Tools:** Offline keygen/signing script (`scripts/sign_ota.py` / OpenSSL), CMake / PlatformIO build flags, OTA signature verification test suite (`TC-FW-06`).
  - **Execution:** Automated CI test building all 3 trust targets and verifying their embedded public key tables and OTA acceptance behavior.

