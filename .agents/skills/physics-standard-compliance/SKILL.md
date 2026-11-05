---
name: physics-standard-compliance
description: >
  ช่วยให้ AI Agent ปฏิบัติตามกฎ Physics Learning Standard (v1.13.0) เมื่อทำงาน
  ในคลังโค้ดใดๆ ของระบบนิเวศ Physics Learning ครอบคลุมขอบเขตสถาปัตยกรรม กฎโดเมนฟิสิกส์
  กฎควิซไดนามิก กฎการสอบแบบจับเวลา หน่วยและสัญลักษณ์ เวิร์กโฟลว์การตรวจสอบ และการเช็กความสอดคล้อง
---

# ทักษะความสอดคล้องกับ Physics Learning Standard (Physics Standard Compliance Skill)

## เมื่อใดที่ทักษะนี้จะถูกนำมาใช้

ทักษะนี้จะถูกนำมาใช้เมื่อทำงานในคลังโค้ดใดๆ ของระบบนิเวศ Physics Learning
รวมถึงคลังโค้ด `physics-learning-standard` เองด้วย

## ลำดับการอ่านเอกสารที่จำเป็น

ก่อนทำการเปลี่ยนแปลง ให้อ่านเอกสารที่เกี่ยวข้องกับงานของคุณตามที่กำหนดไว้ใน AGENTS.md
โดยอย่างน้อยที่สุดต้องอ่านเอกสารเหล่านี้เสมอ:

1. README.md
2. Principles.md
3. Architecture.md
4. Architecture-Enforcement.md
5. Folder-Structure.md
6. AI-Agent-Rules.md
7. VERSION.md
8. CHANGELOG.md

อ่านเพิ่มเติมตามประเภทงาน:

- เนื้อหาฟิสิกส์ → Physics-Standards.md, Units-and-Notation.md
- การจำลอง (Simulation) → Simulation-Standards.md
- ควิซไดนามิก → Dynamic-Quiz-System-Rules.md
- การสอบแบบจับเวลา → Timed-Exam-System-Rules.md
- การตรวจสอบสรุปงาน → Validation-Workflow.md
- การสร้าง/ตรวจคลังโค้ด → Repository-Profiles.md, Standard-Compliance-Checklist.md

## อ้างอิงสถาปัตยกรรมฉบับย่อ

```text
ทิศทางการพึ่งพา (อนุญาต):
  UI → Adapters → Application Services → Physics Domain

สิ่งต้องห้ามใน src/physics/:
  document, window, HTMLElement, CanvasRenderingContext2D,
  localStorage, sessionStorage, fetch, UI frameworks, ไลบรารีแสดงสูตร
```

## กฎการตัดสินใจสำคัญ

1. **การเรียนรู้ต้องมาก่อน**: ความชัดเจนทางการเรียนรู้ > ความหรูหราทางเทคนิค
2. **ความจริงทางฟิสิกส์อยู่ใน Physics Domain**: ห้ามซ่อนสูตรไว้ใน UI/Canvas/Storage
3. **คำตอบไดนามิกต้องคำนวณจากสูตร**: ห้ามใช้ตารางคำตอบตายตัว
4. **ความแน่นอนในขอบเขตการสอบ**: เมื่อสร้างควิซแล้ว ค่าพารามิเตอร์จะถูกล็อกสม่ำเสมอตลอดรอบนั้น
5. **หน่วย SI เป็นค่าเริ่มต้น**: หากไม่ใช้ SI ต้องมีเอกสารอธิบายเหตุผล
6. **ต้องระบุค่าความคลาดเคลื่อน**: สำหรับการตรวจคำตอบเชิงตัวเลขทุกชนิด
7. **หน้าจอเริ่มต้นก่อนตัวจับเวลา**: ตัวจับเวลาการสอบจะเริ่มหลังจากผู้เรียนกดเริ่มทำข้อสอบอย่างชัดเจนเท่านั้น
8. **การคิดคะแนนแยกอิสระจาก UI**: โมดูลโดเมนหรือการประเมินผลเป็นผู้ดูแลการคิดคะแนน
9. **ค่าคงที่เพื่อการเรียนรู้มัธยมศึกษา**: เช่น ค่าความเร่งเนื่องจากแรงโน้มถ่วงให้ใช้ `g = 10 m/s^2` เมื่อระบุเป็นการประมาณเพื่อความสะดวกในการคำนวณของผู้เรียน

## ข้อเตือนใจในการตรวจสอบ

- รัน `scripts/validate-standard.ps1` เมื่อมีการเปลี่ยนแปลงคลังโค้ดมาตรฐาน
- รายงานผลการตรวจสอบก่อนส่งมอบงาน
- อัปเดต CHANGELOG.md และ VERSION.md สำหรับการเปลี่ยนแปลงมาตรฐาน

## การแก้ปัญหาข้อกำหนดขัดแย้ง

เมื่อมาตรฐานขัดแย้งกัน ให้ใช้ลำดับความสำคัญนี้:
Principles > Architecture > Folder-Structure > Domain-specific > Coding-Standards > Naming-Conventions > AI-Agent-Rules > AGENTS.md

## Document Selection Matrix

Use `AGENTS.md` as the canonical source for the Document Selection Matrix.
Read the required core documents first, then use the matrix to choose only the
task-specific standards that apply to the current work. Do not duplicate the
matrix here; keeping it in `AGENTS.md` preserves one source of truth and reduces
token-heavy repetition.

For Phase 4 governance work, use `Internationalization-and-Localization.md`,
`Security-and-Privacy.md`, and `Performance-Standards.md` only when the current
task touches language, learner data, privacy, security, runtime performance, or
submission behavior.
