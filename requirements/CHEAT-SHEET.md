# 📋 Coffeenator Pro 9000 — Requirements & Verification Cheat Sheet

> **Status:** Draft for Curation (Not yet published to `site/`)  
> **Hardware Reference:** [`hardware/main-board/coffeenator.kicad_sch`](../hardware/main-board/coffeenator.kicad_sch)  
> **Existing Web Data Reference:** [`site/src/lib/data/requirements.ts`](../site/src/lib/data/requirements.ts)

---

## 1. Requirement Code Structure

All system requirements follow a strict, human-readable identifier format:

```text
REQ - <CAT> - <NN>
 │      │      └── 2-digit sequential number (01, 02, 03...)
 │      └───────── 2-to-3 letter Category Code (SAF, HW, SEN, FW, WL, PRV, QA)
 └──────────────── Fixed prefix for Requirement
```

### Category Codes (`<CAT>`)

| Code | Category Name | Scope & Focus | Document File |
| :--- | :--- | :--- | :--- |
| **`SAF`** | **Safety & Fail-Safe** | Galvanic isolation, thermal fuses, default-OFF states, degraded "ABS-style" fallback | [`REQ-SAF-safety.md`](./REQ-SAF-safety.md) |
| **`HW`** | **Hardware & Electrical** | PCB footprint, power supply (`U2`, `U3`), MCU (`U1`) & OTA flash, relay stages (`K1`, `K2`), inputs (`SW1`–`SW3`) | [`REQ-HW-hardware.md`](./REQ-HW-hardware.md) |
| **`SEN`** | **Sensors & Detection** | Boiler/hotplate temperature, water tank level, carafe presence detection | [`REQ-SEN-sensors.md`](./REQ-SEN-sensors.md) |
| **`FW`** | **Firmware & Controls** | Offline-first brewing, button-combo factory reset, one-off automations, FSM, OTA self-test & multi-key signature check | [`REQ-FW-firmware.md`](./REQ-FW-firmware.md) |
| **`WL`** | **Wireless & Connectivity** | BLE provisioning, standalone BLE mode, Wi-Fi connect, server wake-up, multi-channel OTA (BLE / Wi-Fi / Product Page) | [`REQ-WL-wireless.md`](./REQ-WL-wireless.md) |
| **`PRV`** | **Privacy & Telemetry** | Zero hidden telemetry, configurable public/private API, no PII (Machine ID / MAC only), BYOK / Dual-Key OTA ownership | [`REQ-PRV-privacy.md`](./REQ-PRV-privacy.md) |
| **`QA`** | **Modularity & Testing** | HW/SW modular design, Test Analysis, Test Description, and Test Implementation rules | [`REQ-QA-modularity-and-testing.md`](./REQ-QA-modularity-and-testing.md) |

---

## 2. Test Case & Verification Code Structure

Every requirement and hardware/software module is paired with a corresponding test identifier:

```text
TC - <CAT> - <NN>
 │     │      └── Matches the requirement number (e.g., 01 matches REQ-<CAT>-01)
 │     └───────── Matches the requirement category (SAF, HW, SEN, FW, WL, PRV, QA)
 └─────────────── Fixed prefix for Test Case
```

Each test case MUST document three mandatory artifacts:
1. **Test Analysis (Requirement Analysis):** Evaluates *what* makes the requirement testable, identifies boundary conditions, failure modes, and observability points (test pads, serial logs, API responses).
2. **Test Description:** Specifies the preconditions, input stimuli, step-by-step procedure, and expected pass/fail criteria.
3. **Test Implementation:** Details the concrete hardware rig, bench equipment (multimeter, oscilloscope, dummy loads), or automated software test harness (unit test, mock HAL, integration script) used to execute the test.

---

## 3. Priority Levels (MoSCoW)

| Priority | Meaning | Failure Impact |
| :--- | :--- | :--- |
| **Must-Have** | Mandatory for core safety, offline appliance operation, privacy, or baseline architecture. | System is unsafe or non-functional; blocks release. |
| **Should-Have** | Important quality-of-life, sensor interlock, or smart feature expected in normal operation. | Degrades smart user experience, though core brewing still works. |
| **Nice-to-Have** | Optional enhancement or convenience feature for future iterations. | No impact on safety or primary smart functions. |

---

## 4. Master Requirement Index (Quick Reference)

### 🛡️ Safety & Fail-Safe (`REQ-SAF-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-SAF-01`** | Galvanic Isolation & Thermal Fuse Retention | Must-Have | Existing + HW |
| **`REQ-SAF-02`** | Fail-Safe Default-OFF Heater Switching Stage | Must-Have | Existing + KiCad (`K1`, `K2`, `R8`, `R9`) |
| **`REQ-SAF-03`** | Degraded Mode / Offline Appliance Fallback ("ABS Principle") | Must-Have | User Spec |
| **`REQ-SAF-04`** | Sensor Fault & Dry-Boil Automatic Cutoff | Must-Have | Existing |
| **`REQ-SAF-05`** | Independent Maximum Brew & Keep-Warm Watchdog Timer | Must-Have | Existing |

### 🔌 Hardware & Electrical (`REQ-HW-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-HW-01`** | Custom Replacement Control Board in OEM Footprint | Must-Have | Existing |
| **`REQ-HW-02`** | Dual-Stage Regulated Low-Voltage Power Supply (12V & 5V/VCC) | Must-Have | KiCad (`U3` AK-L1-025, `U2` Pololu 4085) |
| **`REQ-HW-03`** | ESP32-C3 Wireless Microcontroller Core | Must-Have | KiCad (`U1` ESP32-C3-DevKitM-1) |
| **`REQ-HW-04`** | Dual Relay Power Drive Stage with Flyback Suppression | Must-Have | KiCad (`K1`, `K2`, `Q1`, `Q3`, `D1`, `D2`, `C4`, `C5`) |
| **`REQ-HW-05`** | Hardware-Filtered Switch & Reed Sensor Inputs | Must-Have | KiCad (`SW1`–`SW3`, `R1`–`R3`, `C1`–`C3`) |
| **`REQ-HW-06`** | Local Visual Status Indicator Driver Stage | Should-Have | KiCad (`Q2`, `D3`, `D4`, `R4`, `R7`, `R10`) |
| **`REQ-HW-07`** | MCU Flash Capacity & Dual-Partition OTA Hardware Support | Must-Have | User Spec + KiCad (`U1` ESP32-C3) |

### 🌡️ Sensors & Detection (`REQ-SEN-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-SEN-01`** | Boiler & Hotplate Temperature Telemetry | Must-Have | Existing |
| **`REQ-SEN-02`** | Water Tank Level Sensing | Should-Have | Existing + KiCad (`SW_Reed`) |
| **`REQ-SEN-03`** | Carafe Presence Detection | Should-Have | Existing + KiCad (`SW_Reed`) |

### ⚙️ Firmware & Local Operation (`REQ-FW-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-FW-01`** | Offline-First Physical Controls & Fast Boot | Must-Have | Existing + User Spec |
| **`REQ-FW-02`** | Physical Button Combination Factory Reset (Flash Config Wipe) | Must-Have | User Spec |
| **`REQ-FW-03`** | One-Off Non-Repeating In-Memory Brew Automations | Must-Have | User Spec |
| **`REQ-FW-04`** | Deterministic Brew Finite-State Machine (FSM) | Must-Have | Existing |
| **`REQ-FW-05`** | MCU OTA Post-Boot Self-Test, Rollback & Config Preservation | Must-Have | User Spec |
| **`REQ-FW-06`** | Cryptographic OTA Signature Verification with Multi-Key Trust Store | Must-Have | User Spec |

### 📡 Wireless, BLE & Remote Wake-Up (`REQ-WL-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-WL-01`** | Automatic BLE Fallback Provisioning & Standalone BLE Operation | Must-Have | User Spec |
| **`REQ-WL-02`** | Wi-Fi Client Mode & Local Control Interface | Must-Have | Existing + User Spec |
| **`REQ-WL-03`** | Protocol-Agnostic Remote Server Wake-Up Trigger | Must-Have | User Spec |
| **`REQ-WL-04`** | Multi-Channel OTA Firmware Update (BLE, Wi-Fi Interface & Remote Server "Product Page") | Must-Have | User Spec |
| **`REQ-WL-05`** | Safe Idle-Only OTA Execution, Integrity Verification & Automatic Rollback | Must-Have | Existing + User Spec |

### 🔒 Privacy & Data Sovereignty (`REQ-PRV-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-PRV-01`** | Zero Hidden Telemetry & Explicit API-Only Data Capture | Must-Have | User Spec |
| **`REQ-PRV-02`** | User-Configurable Public or Private API Endpoint | Must-Have | User Spec |
| **`REQ-PRV-03`** | Prohibition of Personal Identifiers (Machine ID / MAC Only) | Must-Have | User Spec |
| **`REQ-PRV-04`** | Cryptographic Firmware Ownership & Right-to-Sign (Anti-Tamper Without Vendor Lock-In) | Must-Have | User Spec |

### 🧪 Modularity & Testability (`REQ-QA-*`)
| Code | Title | Priority | Source |
| :--- | :--- | :--- | :--- |
| **`REQ-QA-01`** | Modular Hardware Subsystem Architecture | Must-Have | User Spec + KiCad |
| **`REQ-QA-02`** | Modular & Decoupled Firmware Architecture (HAL Separation) | Must-Have | User Spec |
| **`REQ-QA-03`** | Mandatory 3-Tier Test Documentation (Analysis, Description, Implementation) | Must-Have | User Spec |
