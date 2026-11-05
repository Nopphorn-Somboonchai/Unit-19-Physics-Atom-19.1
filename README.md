# ⚛️ Interactive Physics Learning Portal
### รายวิชา ฟิสิกส์ 6 (ว33206) | บทที่ 19 ฟิสิกส์อะตอม (19.1 สมมติฐานของพลังค์และทฤษฎีอะตอมของโบร์)

[![Physics](https://img.shields.io/badge/Subject-Physics_M.6-blue.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)

| Metadata | Value |
| :--- | :--- |
| Repository profile | `learning-unit` |
| Standard version | `1.13.0` |
| Compliance status | `Compliant` |
| Maintainer | Nopphorn Somboonchai |
| Standard reference | [physics-learning-standard](.agents/skills/physics-learning-standard/SKILL.md) |

> [!NOTE]
> 🏛️ **Architecture Reference Implementation**  
> เว็บแอปพลิเคชันการเรียนรู้ฟิสิกส์แบบโต้ตอบสำหรับ **บทที่ 19 ฟิสิกส์อะตอม (หัวข้อย่อย 19.1.1 การแผ่คลื่นแม่เหล็กไฟฟ้าของวัตถุดำ และ 19.1.2 ทฤษฎีอะตอมของโบร์)** พัฒนาตามมาตรฐานวิศวกรรม **Physics Learning Standard (v1.13.0)** ถอดแบบ UI, 3 Navigation Cards, 3 Interactive Simulators, Dynamic Quiz RNG และระบบสอบจับเวลา 15 นาทีจาก Unit-18 อย่างสมบูรณ์ 100%

---

## 📌 สารบัญ (Table of Contents)

- [📖 ขอบเขตเนื้อหาและผลการเรียนรู้](#-ขอบเขตเนื้อหาและผลการเรียนรู้)
- [🏗️ สถาปัตยกรรมระบบ (System Architecture)](#️-สถาปัตยกรรมระบบ-system-architecture)
- [📁 โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
- [🔬 เครื่องมือจำลองเสมือนจริง 3 ตัว (Interactive Simulators)](#-เครื่องมือจำลองเสมือนจริง-3-ตัว-interactive-simulators)
- [🎲 ระบบฝึกทำโจทย์ไดนามิก (Dynamic Quiz Engine)](#-ระบบฝึกทำโจทย์ไดนามิก-dynamic-quiz-engine)
- [⏱️ ระบบสอบจับเวลาและป้องกันการทุจริต (Timed Exam & Anti-Cheat)](#️-ระบบสอบจับเวลาและป้องกันการทุจริต-timed-exam--anti-cheat)
- [💻 Tech Stack & การติดตั้ง](#-tech-stack--การติดตั้ง)

---

## 📖 ขอบเขตเนื้อหาและผลการเรียนรู้

### 🎯 ผลการเรียนรู้ตามหลักสูตร สสวท.:
1. **อธิบายสมมติฐานของพลังค์**: การแผ่รังสีของวัตถุดำ และการค้นพบควอนตัมของพลังงาน (\(E = nhf = nh\frac{c}{\lambda}\))
2. **อธิบายทฤษฎีอะตอมของโบร์**: สมมติฐาน 2 ข้อของโบร์ วงโคจรคงตัว และการเกิดเส้นสเปกตรัมของไฮโดรเจน
3. **คำนวณปริมาณที่เกี่ยวข้อง**:
   - พลังงานโฟตอนและควอนตัมของพลังค์: \(E = hf = \frac{hc}{\lambda}\)
   - กฎการกระจัดของวีน: \(\lambda_{\max} T = 2.898 \times 10^{-3} \text{ m}\cdot\text{K}\)
   - โมเมนตัมเชิงมุมของอิเล็กตรอน: \(L = n\hbar = n\frac{h}{2\pi}\)
   - รัศมีวงโคจรของโบร์: \(r_n = n^2 r_1\) (\(r_1 = 0.529 \text{ \AA} = 5.29 \times 10^{-11} \text{ m}\))
   - อัตราเร็วของอิเล็กตรอน: \(v_n = \frac{v_1}{n}\) (\(v_1 = 2.18 \times 10^6 \text{ m/s}\))
   - ระดับพลังงานของไฮโดรเจน: \(E_n = -\frac{13.6}{n^2} \text{ eV} = -\frac{2.18 \times 10^{-18}}{n^2} \text{ J}\)
   - พลังงานการเปลี่ยนระดับและสูตรของริดเบิร์ก: \(\frac{1}{\lambda} = R_H \left(\frac{1}{n_f^2} - \frac{1}{n_i^2}\right)\) (\(R_H = 1.097 \times 10^7 \text{ m}^{-1}\))
   - อนุกรมสเปกตรัม: ไลแมน (UV), บัลเมอร์ (Visible), พาสเชน (IR), แบรักเกต (IR), ฟุนด์ (IR)

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

ตามข้อกำหนดของ **Physics Learning Standard (v1.13.0)** การไหลของ Dependency จะมุ่งเข้าสู่ Physics Domain เสมอ:
`UI -> Adapters -> Application Services -> Physics Domain`

- **Physics Domain (`src/physics/`)**: ปราศจาก DOM, Canvas, Window, LocalStorage, หรือ KaTeX โดยสิ้นเชิง คำนวณค่าทางฟิสิกส์ล้วน (Pure Calculations)
- **Application Layer (`src/application/`)**: ควบคุม State Machine ของการสอบ, จัดการวงรอบ Simulator, สร้างโจทย์ RNG
- **Adapters (`src/adapters/`)**: จัดการ Canvas 2D เรนเดอร์, จัดเก็บผลสอบใน LocalStorage, เชื่อมโยง DOM Event และ KaTeX LaTeX
- **Shared & Utils (`src/shared/`, `src/utils/`)**: ค่าคงที่สากล, การตรวจสอบความคลาดเคลื่อน 3%, และ RNG Seeded Shuffling

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Unit-19-Physics Atom-19.1/
├── .agents/skills/                         # มาตรฐาน Physics Learning Standard v1.13.0
├── assets/styles/
│   ├── animations.css                      # คีย์เฟรม, แสง Glow, Orbital Spin
│   ├── main.css                            # Tailwind v4 Source & Theme Design Tokens
│   └── style.css                           # Compiled Tailwind CSS
├── dist/bundle.js                          # Production Bundle
├── src/
│   ├── adapters/
│   │   ├── canvas/
│   │   │   ├── blackbody-plotter.js        # วาดกราฟการแผ่รังสีวัตถุดำ & Rayleigh-Jeans
│   │   │   ├── bohr-orbit-plotter.js       # วาดวงโคจรอิเล็กตรอน & เวกเตอร์ความเร็ว
│   │   │   ├── canvas-renderer.js          # Base Canvas High-DPI Renderer
│   │   │   └── spectrum-transition-plotter.js # วาดไดอะแกรมระดับพลังงาน & โฟตอน
│   │   ├── formula/katex-adapter.js        # อะแดปเตอร์เชื่อมต่อ Offline KaTeX
│   │   ├── storage/local-storage.js        # จัดเก็บผลสอบและ Active Session
│   │   └── ui/
│   │       ├── control-panel.js            # ผูก UI Controls กับ Simulators
│   │       ├── exam-ui.js                  # ควบคุมหน้าจอสอบ, นาฬิกา, Anti-cheat
│   │       ├── quiz-ui.js                  # ควบคุมหน้าจอควิซฝึกฝน
│   │       ├── simulator-loader.js         # Calibrator Progress Loader
│   │       └── tab-navigator.js            # ควบคุม Section & Sub-tabs
│   ├── application/
│   │   ├── blackbody-simulator.js          # Simulator 19.1.1 Orchestrator
│   │   ├── bohr-atom-simulator.js          # Simulator 19.1.2A Orchestrator
│   │   ├── exam-manager.js                 # State Machine ข้อสอบ 15 นาที
│   │   ├── hydrogen-spectrum-simulator.js  # Simulator 19.1.2B Orchestrator
│   │   └── quiz-manager.js                 # ระบบสร้างโจทย์สุ่มตามเลขที่
│   ├── physics/
│   │   ├── blackbody-model.js              # โมเดลการแผ่รังสี Planck & Wien
│   │   ├── blackbody-solver.js             # คำนวณพลังงานควอนตัม & วัตถุดำ
│   │   ├── bohr-atom-model.js              # โมเดลวงโคจรอะตอมของโบร์
│   │   ├── bohr-atom-solver.js             # คำนวณ rn, vn, En, L
│   │   ├── hydrogen-spectrum-model.js      # ชุดอนุกรมและเส้นสเปกตรัมบัลเมอร์
│   │   └── hydrogen-spectrum-solver.js     # คำนวณสูตรริดเบิร์ก & แปลงความยาวคลื่นเป็นสี RGB
│   ├── shared/
│   │   ├── config.js                       # ข้อมูลการตั้งค่าระบบ
│   │   └── constants.js                    # ค่าคงที่สากล (h, c, e, me, RH, r1, E1, b)
│   ├── utils/
│   │   ├── format.js                       # แปลงตัวเลข, สัญกรณ์วิทยาศาสตร์
│   │   ├── random.js                       # Seeded RNG & Fisher-Yates Shuffle
│   │   └── validation.js                   # ตรวจคำตอบความคลาดเคลื่อน 3%
│   └── main.js                             # จุดเริ่มต้นแอปพลิเคชัน
├── tests/                                  # Test Suites ครอบคลุม 100%
│   ├── exam.test.js
│   ├── integration.test.js
│   ├── physics.test.js
│   ├── quiz.test.js
│   ├── simulator-loader.test.js
│   └── viewport-geometry.test.js
├── vendor/katex/                           # ออฟไลน์ KaTeX Library
├── index.html                              # หน้าเว็บหลัก
└── package.json
```

---

## 🔬 เครื่องมือจำลองเสมือนจริง 3 ตัว (Interactive Simulators)

1. **Simulator 1 (19.1.1)**: **Blackbody Radiation & Planck Distribution**
   - ปรับอุณหภูมิผิว \(T = 1,500\text{ K}\) ถึง \(9,500\text{ K}\)
   - สลับแสดงกราฟทฤษฎีดั้งเดิมของเรย์ลีห์-จีนส์ (แสดงปรากฏการณ์หายนะอัลตราไวโอเลต) เทียบกับกราฟควอนตัมของพลังค์
   - คำนวณและแสดงเส้นประจุดยอด \(\lambda_{\max}\) ตามกฎของวีน พร้อมไฮไลต์ย่านแสงที่ตามองเห็น (Visible Spectrum 380 - 750 nm)
2. **Simulator 2 (19.1.2A)**: **Bohr Atomic Orbits & Dynamics**
   - ปรับระดับชั้นพลังงาน \(n = 1, 2, 3, 4, 5\)
   - แสดงนิวเคลียสใจกลางและวงโคจรสเกลจริง \(r_n = n^2 r_1\)
   - แอนิเมชันอิเล็กตรอนโคจรรอบนิวเคลียสด้วยอัตราเร็วเชิงมุมสมจริง \(v_n = v_1/n\)
   - แสดงเวกเตอร์ความเร็วสัมผัสวงโคจร (\(\vec{v}_n\)) และค่าพลังงาน \(E_n\), โมเมนตัมเชิงมุม \(L = n\hbar\)
3. **Simulator 3 (19.1.2B)**: **Hydrogen Energy Transitions & Spectra**
   - เลือกระดับเริ่มต้น \(n_i\) และระดับสิ้นสุด \(n_f\)
   - แสดงภาพแอนิเมชันอิเล็กตรอนกระโดดเปลี่ยนระดับ พร้อมปล่อยคลื่นโฟตอนเป็นแสงสีจริงที่ตรงกับความยาวคลื่น
   - ไดอะแกรมบันไดระดับพลังงาน (\(E_1 = -13.6\text{ eV}\) ถึง \(E_\infty = 0\text{ eV}\))
   - แถบสเปกตรัมพร้อมปุ่มเลือกเส้นเด่นของอนุกรมบัลเมอร์: \(H_\alpha\) (656 nm แดง), \(H_\beta\) (486 nm ฟ้า), \(H_\gamma\) (434 nm น้ำเงิน)

---

## 🎲 ระบบฝึกทำโจทย์ไดนามิก (Dynamic Quiz Engine)

- สุ่มค่าตัวเลขตาม **เลขที่นักเรียน (1-40)** และ Seed การสุ่ม
- แม่แบบโจทย์ครอบคลุมทั้ง 2 หัวข้อย่อย (พลังงานควอนตัม, กฎของวีน, รัศมีวงโคจร, สูตรริดเบิร์ก)
- แสดงวิธีทำอย่างละเอียดทีละขั้นตอน (Step-by-Step Solution) ด้วย KaTeX
- ตรวจคำตอบตัวเลขพร้อมความคลาดเคลื่อนที่ยอมรับได้ **±3%**

---

## ⏱️ ระบบสอบจับเวลาและป้องกันการทุจริต (Timed Exam & Anti-Cheat)

- นาฬิกาจับเวลาถอยหลัง **15:00 นาที** แจ้งเตือนกระพริบสีแดงเมื่อเหลือต่ำกว่า 3 นาที
- ข้อสอบ 5 ข้อ รวม 10 คะแนน (ข้อละ 2 คะแนน): ปรนัยเลือกตอบ 1 ข้อ + คำนวณตัวเลข 4 ข้อ
- **Anti-Cheat Monitoring**: ตรวจจับและนับจำนวนการสลับหน้าต่าง/สลับแท็บ พร้อม Toast เตือนสีแดงสั่น
- **Session Recovery**: บันทึกสถานะข้อสอบลง LocalStorage เสมอ หากรีเฟรชเบราว์เซอร์จะสามารถทำข้อสอบต่อในเวลาที่เหลือได้ทันที
- รายงานผลสอบละเอียด, เกณฑ์การประเมิน, และปุ่มพิมพ์เกียรติบัตร

---

## 💻 Tech Stack & การติดตั้ง

- **CSS Engine**: Tailwind CSS v4 (`@tailwindcss/cli`, `tailwindcss`)
- **Bundler**: esbuild
- **Formula Engine**: KaTeX (Local Offline Bundle)
- **Runtime**: Vanilla ES2025 Modules

### คำสั่งที่ใช้งาน:
```bash
# รันชุดแบบทดสอบทั้งหมด
npm test

# คอมไพล์ CSS และ Bundled JavaScript
npm run build

# รัน Development Watcher
npm run dev

# รัน Local Server
npm run serve
```

#   U n i t - 1 9 - P h y s i c s - A t o m - 1 9 . 1  
 