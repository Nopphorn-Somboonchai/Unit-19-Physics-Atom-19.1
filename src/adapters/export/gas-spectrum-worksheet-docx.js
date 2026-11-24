/**
 * @file gas-spectrum-worksheet-docx.js
 * @description Client-side Word (.docx) Blank Worksheet Generator for Activity 19.1:
 * Hot Gas Spectrum Experiment (A4 Landscape, 0.5-inch narrow margins).
 * Conforms to Physics Learning Standard (v1.13.0) — UI/Export Adapter Layer.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertInchesToTwip
} from 'docx';

const THAI_FONT = 'TH SarabunPSK';
const TEAL_HEX = '0F766E';
const HEADER_FILL = 'CCFBF1';
const SUBHEADER_FILL = 'F0FDFA';
const BOX_FILL = 'F8FAFC';

const THIN_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '334155'
};

const TEAL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: TEAL_HEX
};

const ALL_THIN_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER
};

const ALL_TEAL_BORDERS = {
  top: TEAL_BORDER,
  bottom: TEAL_BORDER,
  left: TEAL_BORDER,
  right: TEAL_BORDER
};

/**
 * Helper to create a Paragraph with Thai font defaults
 */
function thaiParagraph(runs, options = {}) {
  const normalizedRuns = (Array.isArray(runs) ? runs : [runs]).map((item) => {
    if (typeof item === 'string') {
      return new TextRun({ text: item, font: THAI_FONT, size: 28 });
    }
    return new TextRun({ font: THAI_FONT, size: 28, ...item });
  });

  return new Paragraph({
    spacing: { before: 40, after: 40 },
    ...options,
    children: normalizedRuns
  });
}

/**
 * Helper to create a styled TableCell
 */
function createCell(paragraphs, {
  widthTwips,
  rowSpan,
  columnSpan,
  shadingFill = null,
  borders = ALL_THIN_BORDERS,
  verticalAlign = VerticalAlign.CENTER,
  margins = { top: 60, bottom: 60, left: 75, right: 75 }
} = {}) {
  return new TableCell({
    width: widthTwips ? { size: widthTwips, type: WidthType.DXA } : undefined,
    rowSpan,
    columnSpan,
    shading: shadingFill ? { type: ShadingType.CLEAR, color: 'auto', fill: shadingFill } : undefined,
    borders,
    verticalAlign,
    margins,
    children: Array.isArray(paragraphs) ? paragraphs : [paragraphs]
  });
}

/**
 * Build the 10-column IPST Activity 19.1 Data Recording Table
 */
function buildObservationTable() {
  // Total width for A4 Landscape (11.69") with 0.5" margins on each side = 10.69" = 15,394 twips
  const colWidths = [1650, 1550, 1250, 1250, 1250, 1250, 1650, 1850, 1850, 1840];

  const headerRow1 = new TableRow({
    tableHeader: true,
    children: [
      createCell(
        thaiParagraph([{ text: 'แหล่งกำเนิด', bold: true, size: 26 }], { alignment: AlignmentType.CENTER }),
        { widthTwips: colWidths[0], rowSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        thaiParagraph([{ text: 'สีของเส้นสเปกตรัม', bold: true, size: 26 }], { alignment: AlignmentType.CENTER }),
        { widthTwips: colWidths[1], rowSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        thaiParagraph([{ text: 'เส้นสเปกตรัมทางขวา', bold: true, size: 26 }], { alignment: AlignmentType.CENTER }),
        { widthTwips: colWidths[2] + colWidths[3], columnSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        thaiParagraph([{ text: 'เส้นสเปกตรัมทางซ้าย', bold: true, size: 26 }], { alignment: AlignmentType.CENTER }),
        { widthTwips: colWidths[4] + colWidths[5], columnSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        [
          thaiParagraph([{ text: 'ระยะเฉลี่ย', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
          thaiParagraph([{ text: 'x̄ (cm)', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } })
        ],
        { widthTwips: colWidths[6], rowSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        [
          thaiParagraph([{ text: '√(D² + x̄²)', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
          thaiParagraph([{ text: '(cm)', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } })
        ],
        { widthTwips: colWidths[7], rowSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        [
          thaiParagraph([{ text: 'sin θ =', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
          thaiParagraph([{ text: 'x̄ / √(D² + x̄²)', bold: true, size: 24 }], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } })
        ],
        { widthTwips: colWidths[8], rowSpan: 2, shadingFill: HEADER_FILL }
      ),
      createCell(
        [
          thaiParagraph([{ text: 'λ = d sin θ', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 } }),
          thaiParagraph([{ text: '(cm / nm)', bold: true, size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } })
        ],
        { widthTwips: colWidths[9], rowSpan: 2, shadingFill: HEADER_FILL }
      )
    ]
  });

  const headerRow2 = new TableRow({
    tableHeader: true,
    children: [
      createCell(thaiParagraph([{ text: 'ตำแหน่ง (cm)', bold: true, size: 24 }], { alignment: AlignmentType.CENTER }), { widthTwips: colWidths[2], shadingFill: SUBHEADER_FILL }),
      createCell(thaiParagraph([{ text: 'ระยะ x (cm)', bold: true, size: 24 }], { alignment: AlignmentType.CENTER }), { widthTwips: colWidths[3], shadingFill: SUBHEADER_FILL }),
      createCell(thaiParagraph([{ text: 'ตำแหน่ง (cm)', bold: true, size: 24 }], { alignment: AlignmentType.CENTER }), { widthTwips: colWidths[4], shadingFill: SUBHEADER_FILL }),
      createCell(thaiParagraph([{ text: 'ระยะ x (cm)', bold: true, size: 24 }], { alignment: AlignmentType.CENTER }), { widthTwips: colWidths[5], shadingFill: SUBHEADER_FILL })
    ]
  });

  const emptyCells = (count, startColIdx) =>
    Array.from({ length: count }, (_, idx) =>
      createCell(
        thaiParagraph([{ text: '', size: 26 }], { alignment: AlignmentType.CENTER, spacing: { before: 55, after: 55 } }),
        { widthTwips: colWidths[startColIdx + idx] }
      )
    );

  const buildDataRow = ({ sourceLabel = null, sourceRowSpan = 1, colorLabel = '' }) => {
    const cells = [];
    if (sourceLabel !== null) {
      cells.push(
        createCell(
          thaiParagraph([{ text: sourceLabel, bold: true, size: 26 }], { alignment: AlignmentType.CENTER }),
          { widthTwips: colWidths[0], rowSpan: sourceRowSpan }
        )
      );
    }
    cells.push(
      createCell(
        thaiParagraph([{ text: colorLabel, size: 26 }], { alignment: AlignmentType.LEFT, spacing: { before: 55, after: 55 } }),
        { widthTwips: colWidths[1] }
      )
    );
    cells.push(...emptyCells(8, 2));
    return new TableRow({ children: cells });
  };

  const rows = [
    headerRow1,
    headerRow2,
    buildDataRow({ sourceLabel: 'ไฮโดรเจน (H₂)*', sourceRowSpan: 4, colorLabel: 'สีแดง (Hα)' }),
    buildDataRow({ colorLabel: 'สีฟ้า (Hβ)' }),
    buildDataRow({ colorLabel: 'สีน้ำเงิน (Hγ)' }),
    buildDataRow({ colorLabel: 'สีม่วง (Hδ)*' }),
    buildDataRow({ sourceLabel: 'นีออน (Ne)', sourceRowSpan: 3, colorLabel: 'สีแดง' }),
    buildDataRow({ colorLabel: 'สีส้ม' }),
    buildDataRow({ colorLabel: 'สีเหลือง' }),
    buildDataRow({ sourceLabel: 'หลอดอื่น ๆ / เสริม', sourceRowSpan: 2, colorLabel: '' }),
    buildDataRow({ colorLabel: '' })
  ];

  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    rows
  });
}

/**
 * Build the Blank Activity 19.1 Worksheet Word Document (A4 Landscape, 0.5-inch margins)
 * @returns {Document}
 */
export function buildBlankLabWorksheetDocument() {
  const marginTwips = convertInchesToTwip(0.5);
  const fullWidthTwips = convertInchesToTwip(10.69); // 11.69" A4 landscape - 1.0" margins

  // 1. Header Banner Box (Title + Student Info + Teacher Name)
  const headerBanner = new Table({
    width: { size: fullWidthTwips, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          createCell(
            [
              thaiParagraph(
                [
                  { text: 'ใบงานกิจกรรม 19.1 เรื่อง การศึกษาสเปกตรัมของแก๊สร้อน', bold: true, size: 36, color: TEAL_HEX }
                ],
                { alignment: AlignmentType.CENTER, spacing: { before: 20, after: 30 } }
              ),
              thaiParagraph(
                [
                  { text: 'รายวิชา ว33206 ฟิสิกส์ 6 (ม.6)  |  โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ  |  ผู้สอน : นายนพพร สมบูรณ์ชัย', bold: true, size: 26, color: '1E293B' }
                ],
                { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }
              ),
              thaiParagraph(
                [
                  { text: 'ชื่อผู้เรียน ............................................................................................   ชั้น ........................   เลขที่ ....................', bold: true, size: 28, color: '0F172A' }
                ],
                { alignment: AlignmentType.CENTER, spacing: { before: 30, after: 20 } }
              )
            ],
            {
              widthTwips: fullWidthTwips,
              shadingFill: 'F0FDFA',
              borders: ALL_TEAL_BORDERS,
              margins: { top: 100, bottom: 100, left: 140, right: 140 }
            }
          )
        ]
      })
    ]
  });

  // 2. Learning Objectives
  const objectivesTitle = thaiParagraph(
    [{ text: 'จุดประสงค์การเรียนรู้', bold: true, size: 30, color: TEAL_HEX }],
    { spacing: { before: 120, after: 30 } }
  );
  const objective1 = thaiParagraph(
    [{ text: '   1. ศึกษาและเปรียบเทียบลักษณะสเปกตรัมที่เกิดจากแก๊สร้อนกับหลอดไฟฟ้าทั่วไปได้', size: 28 }],
    { spacing: { before: 10, after: 10 } }
  );
  const objective2 = thaiParagraph(
    [{ text: '   2. วัดตำแหน่งเส้นสเปกตรัมผ่านเกรตติง และคำนวณหาความยาวคลื่นแสง (λ = d sin θ) ของแก๊สไฮโดรเจนและแก๊สนีออนได้', size: 28 }],
    { spacing: { before: 10, after: 80 } }
  );

  // 3. Observation Table Header & Setup Params
  const tableHeading = thaiParagraph(
    [{ text: 'ตารางบันทึกผลการทำกิจกรรม 19.1', bold: true, size: 30, color: TEAL_HEX }],
    { spacing: { before: 60, after: 20 } }
  );
  const equipmentLine = thaiParagraph(
    [
      { text: 'ค่าอุปกรณ์ที่ใช้ในการทดลอง: ', bold: true, size: 26 },
      { text: 'เกรตติง N = .................. เส้น/ซม.   (d = 1/N = .......................... ซม.)   |   แถบสว่างกึ่งกลางที่ 50.0 ซม.   |   ระยะ D = ............ ซม.', size: 26 }
    ],
    { spacing: { before: 10, after: 60 } }
  );

  const observationTable = buildObservationTable();

  const tableFootnote = thaiParagraph(
    [
      { text: '*หมายเหตุ: ', bold: true, italics: true, size: 24, color: '475569' },
      { text: 'แสงสีม่วง (Hδ) ของแก๊สไฮโดรเจนมีความสว่างน้อย ควรลดความสว่างห้องและใช้ฉากกระดาษดำกั้นด้านหลังหลอดเพื่อสังเกตให้ชัดเจน', italics: true, size: 24, color: '475569' }
    ],
    { spacing: { before: 60, after: 40 } }
  );

  // Page 2: Sample Calculation Box (1 spectral line) + 3 Post-Lab Questions + Teacher Sign-off
  const calcSectionTitle = thaiParagraph(
    [{ text: 'แสดงวิธีทำตัวอย่างการคำนวณ 1 เส้นสี (เลือกจากผลในตารางด้านหน้า)', bold: true, size: 30, color: TEAL_HEX }],
    { pageBreakBefore: true, spacing: { before: 40, after: 60 } }
  );

  const sampleCalcBox = new Table({
    width: { size: fullWidthTwips, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          createCell(
            [
              thaiParagraph(
                [
                  { text: 'เลือกเส้นสเปกตรัมของแก๊ส ........................................  สี ..........................  (ตำแหน่งขวา = ............. cm , ตำแหน่งซ้าย = ............. cm)', size: 27 }
                ],
                { spacing: { before: 30, after: 50 } }
              ),
              thaiParagraph(
                [{ text: '1) หาระยะเฉลี่ย   x̄ = (x_ขวา + x_ซ้าย) / 2 = .............................................................................................................................................. cm', size: 27 }],
                { spacing: { before: 35, after: 45 } }
              ),
              thaiParagraph(
                [{ text: '2) หาค่า   √(D² + x̄²) = ................................................................................................................................................................................ cm', size: 27 }],
                { spacing: { before: 35, after: 45 } }
              ),
              thaiParagraph(
                [{ text: '3) หาค่า   sin θ = x̄ / √(D² + x̄²) = ...............................................................................................................................................................', size: 27 }],
                { spacing: { before: 35, after: 45 } }
              ),
              thaiParagraph(
                [{ text: '4) หาความยาวคลื่น   λ = d sin θ = .................................................................................................... cm  =  ........................................ nm', bold: true, size: 27 }],
                { spacing: { before: 35, after: 30 } }
              )
            ],
            {
              widthTwips: fullWidthTwips,
              shadingFill: BOX_FILL,
              borders: ALL_THIN_BORDERS,
              margins: { top: 90, bottom: 90, left: 130, right: 130 }
            }
          )
        ]
      })
    ]
  });

  // 4. Post-Lab Questions (3 Questions matching the web portal)
  const questionsHeading = thaiParagraph(
    [{ text: 'คำถามท้ายกิจกรรม (ตอบคำถามจากการสังเกตและบันทึกผล)', bold: true, size: 30, color: TEAL_HEX }],
    { spacing: { before: 140, after: 50 } }
  );

  const buildQuestionBlock = (num, questionText) => [
    thaiParagraph(
      [{ text: `${num}. ${questionText}`, bold: true, size: 28, color: '0F172A' }],
      { spacing: { before: 70, after: 30 } }
    ),
    thaiParagraph(
      [{ text: 'แนวคำตอบ: .........................................................................................................................................................................................................................................', size: 26, color: '334155' }],
      { spacing: { before: 20, after: 25 } }
    ),
    thaiParagraph(
      [{ text: '............................................................................................................................................................................................................................................................', size: 26, color: '334155' }],
      { spacing: { before: 20, after: 40 } }
    )
  ];

  const question1 = buildQuestionBlock(
    1,
    'สเปกตรัมจากหลอดบรรจุแก๊สมีลักษณะเหมือนกับสเปกตรัมจากหลอดไฟฟ้าทั่วไปหรือไม่ อย่างไร?'
  );
  const question2 = buildQuestionBlock(
    2,
    'สเปกตรัมจากหลอดบรรจุแก๊สแต่ละชนิดมีลักษณะเหมือนและต่างกันอย่างไร?'
  );
  const question3 = buildQuestionBlock(
    3,
    'สเปกตรัมจากหลอดบรรจุแก๊สไฮโดรเจน ประกอบด้วยแสงที่มีความยาวคลื่นเท่าใดบ้าง?'
  );

  const teacherFooter = thaiParagraph(
    [
      { text: 'ชื่อผู้สอน : นายนพพร สมบูรณ์ชัย', bold: true, size: 26, color: '1E293B' },
      { text: '          ลงชื่อผู้ตรวจ ....................................................................          คะแนนที่ได้ ............ / ............', size: 26, color: '334155' }
    ],
    { alignment: AlignmentType.RIGHT, spacing: { before: 120, after: 20 } }
  );

  return new Document({
    creator: 'นายนพพร สมบูรณ์ชัย',
    title: 'ใบงานกิจกรรม 19.1 เรื่อง การศึกษาสเปกตรัมของแก๊สร้อน',
    description: 'ใบงานกิจกรรม 19.1 ฟิสิกส์ ม.6 บทที่ 19 ฟิสิกส์อะตอม',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(11.69),
              height: convertInchesToTwip(8.27),
              orientation: PageOrientation.LANDSCAPE
            },
            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips
            }
          }
        },
        children: [
          headerBanner,
          objectivesTitle,
          objective1,
          objective2,
          tableHeading,
          equipmentLine,
          observationTable,
          tableFootnote,
          calcSectionTitle,
          sampleCalcBox,
          questionsHeading,
          ...question1,
          ...question2,
          ...question3,
          teacherFooter
        ]
      }
    ]
  });
}

/**
 * Generate a binary Buffer / Uint8Array of the blank .docx worksheet (useful for Node.js tests)
 * @returns {Promise<Uint8Array>}
 */
export async function generateBlankLabWorksheetBuffer() {
  const doc = buildBlankLabWorksheetDocument();
  return Packer.toBuffer(doc);
}

/**
 * Trigger browser download of the blank Activity 19.1 .docx worksheet
 * @returns {Promise<boolean>}
 */
export async function downloadBlankLabWorksheetDocx() {
  const doc = buildBlankLabWorksheetDocument();
  const blob = await Packer.toBlob(doc);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ใบงานกิจกรรม-19-1-สเปกตรัมแก๊สร้อน.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
  return false;
}
