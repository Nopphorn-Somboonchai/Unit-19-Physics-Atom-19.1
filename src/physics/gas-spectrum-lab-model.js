/**
 * @file gas-spectrum-lab-model.js
 * @description Pure Physics Domain Model for Activity 19.1: Hot Gas Spectrum Experiment.
 * Contains discharge tube light source definitions (H2, Ne, Incandescent, He, Hg),
 * diffraction grating presets, lab setup bounds, and IPST textbook reference data.
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

/**
 * Default physical setup constants matching IPST Physics M.6 Activity 19.1
 */
export const GAS_SPECTRUM_LAB_DEFAULTS = Object.freeze({
  sourceId: 'hydrogen',
  gratingLinesPerCm: 5300,      // IPST minimum: 5300 lines/cm
  distanceCm: 100.0,            // D = 100 cm from meter stick to grating
  meterStickLengthCm: 100.0,    // Standard 100 cm meter stick (0 - 100 cm)
  centerPositionCm: 50.0,       // Central bright fringe aligned at 50.0 cm
  ambientLight: 0.15,           // 0 = pitch dark lab, 1 = bright room
  useBlackBackdrop: true,       // Black cardboard backdrop behind tube (Safety note #3)
  powerOn: false,               // High-voltage supply starts OFF (Safety note #2)
  realisticNoiseEnabled: false, // Optional +/-0.5 cm human reading parallax simulation
  viewMode: 'split',            // 'setup' (3D+Top), 'eyepiece' (Through grating), 'split' (Both)
  tableMode: 'auto'             // 'auto' | 'manual'
});

/**
 * Valid physical input ranges for constraints validation
 */
export const GAS_SPECTRUM_LAB_BOUNDS = Object.freeze({
  minDistanceCm: 50,
  maxDistanceCm: 120,
  minGratingLinesPerCm: 3000,
  maxGratingLinesPerCm: 10000,
  minMeterCm: 0,
  maxMeterCm: 100,
  minAmbientLight: 0,
  maxAmbientLight: 1
});

/**
 * Diffraction grating presets commonly used in Thai high school labs
 */
export const GRATING_PRESETS = Object.freeze([
  {
    linesPerCm: 5300,
    labelTh: '5,300 เส้น/ซม. (มาตรฐาน สสวท.)',
    labelEn: '5,300 lines/cm (IPST)'
  },
  {
    linesPerCm: 6000,
    labelTh: '6,000 เส้น/ซม.',
    labelEn: '6,000 lines/cm'
  },
  {
    linesPerCm: 10000,
    labelTh: '10,000 เส้น/ซม. (ความละเอียดสูง)',
    labelEn: '10,000 lines/cm'
  }
]);

/**
 * Light sources available in the Virtual Lab.
 * Core IPST sources: Hydrogen (H2), Neon (Ne), Incandescent Lamp (Continuous).
 * Bonus enrichment sources: Helium (He), Mercury Vapor (Hg).
 */
export const GAS_LIGHT_SOURCES = Object.freeze({
  hydrogen: {
    id: 'hydrogen',
    symbol: 'H₂',
    nameTh: 'หลอดบรรจุแก๊สไฮโดรเจน',
    nameEn: 'Hydrogen Gas Tube',
    shortNameTh: 'ไฮโดรเจน',
    spectrumType: 'line',
    isBonus: false,
    tubeGlowCore: '#ffd6f5',
    tubeGlowOuter: '#d946ef',
    descriptionTh: 'ให้สเปกตรัมแบบเส้น (อนุกรมบัลเมอร์) เด่นชัด 3 เส้น (แดง ฟ้า น้ำเงิน) และสีม่วงจาง ๆ ที่ต้องปิดไฟห้องจึงเห็นชัด',
    lines: [
      {
        id: 'h-red',
        label: 'Hα',
        colorNameTh: 'สีแดง',
        colorNameEn: 'Red',
        wavelengthNm: 656.3,
        colorHex: '#ef4444',
        intensity: 1.0,
        primary: true
      },
      {
        id: 'h-cyan',
        label: 'Hβ',
        colorNameTh: 'สีฟ้า',
        colorNameEn: 'Cyan',
        wavelengthNm: 486.1,
        colorHex: '#06b6d4',
        intensity: 0.9,
        primary: true
      },
      {
        id: 'h-blue',
        label: 'Hγ',
        colorNameTh: 'สีน้ำเงิน',
        colorNameEn: 'Blue',
        wavelengthNm: 434.0,
        colorHex: '#3b82f6',
        intensity: 0.72,
        primary: true
      },
      {
        id: 'h-violet',
        label: 'Hδ',
        colorNameTh: 'สีม่วง',
        colorNameEn: 'Violet',
        wavelengthNm: 410.2,
        colorHex: '#8b5cf6',
        intensity: 0.34, // Faint line: hard to see in bright room (IPST footnote *)
        primary: true,
        isFaint: true
      }
    ]
  },

  neon: {
    id: 'neon',
    symbol: 'Ne',
    nameTh: 'หลอดบรรจุแก๊สนีออน',
    nameEn: 'Neon Gas Tube',
    shortNameTh: 'นีออน',
    spectrumType: 'line',
    isBonus: false,
    tubeGlowCore: '#ffedd5',
    tubeGlowOuter: '#f97316',
    descriptionTh: 'ให้สเปกตรัมแบบเส้นหนาแน่นในย่านแดง-ส้ม-เหลือง เด่นชัด 3 กลุ่มสีหลัก (แดง ส้ม เหลือง)',
    lines: [
      {
        id: 'ne-red-main',
        label: 'Ne-Red',
        colorNameTh: 'สีแดง',
        colorNameEn: 'Red',
        wavelengthNm: 650.7,
        colorHex: '#ef4444',
        intensity: 0.96,
        primary: true
      },
      {
        id: 'ne-red-2',
        label: 'Ne-640',
        colorNameTh: 'สีแดงเข้ม',
        colorNameEn: 'Deep Red',
        wavelengthNm: 640.2,
        colorHex: '#dc2626',
        intensity: 0.85,
        primary: false
      },
      {
        id: 'ne-red-3',
        label: 'Ne-660',
        colorNameTh: 'สีแดง',
        colorNameEn: 'Red',
        wavelengthNm: 659.9,
        colorHex: '#f87171',
        intensity: 0.55,
        primary: false
      },
      {
        id: 'ne-orange-main',
        label: 'Ne-Orange',
        colorNameTh: 'สีส้ม',
        colorNameEn: 'Orange',
        wavelengthNm: 614.3,
        colorHex: '#f97316',
        intensity: 0.92,
        primary: true
      },
      {
        id: 'ne-orange-2',
        label: 'Ne-622',
        colorNameTh: 'สีส้มแดง',
        colorNameEn: 'Red-Orange',
        wavelengthNm: 621.7,
        colorHex: '#fb923c',
        intensity: 0.62,
        primary: false
      },
      {
        id: 'ne-yellow-main',
        label: 'Ne-Yellow',
        colorNameTh: 'สีเหลือง',
        colorNameEn: 'Yellow',
        wavelengthNm: 585.2,
        colorHex: '#eab308',
        intensity: 0.95,
        primary: true
      },
      {
        id: 'ne-yellow-2',
        label: 'Ne-594',
        colorNameTh: 'สีเหลืองส้ม',
        colorNameEn: 'Amber',
        wavelengthNm: 594.5,
        colorHex: '#f59e0b',
        intensity: 0.58,
        primary: false
      }
    ]
  },

  incandescent: {
    id: 'incandescent',
    symbol: 'W',
    nameTh: 'หลอดไฟฟ้าทั่วไป (หลอดไส้)',
    nameEn: 'Incandescent Light Bulb',
    shortNameTh: 'หลอดไฟฟ้าทั่วไป',
    spectrumType: 'continuous',
    isBonus: false,
    tubeGlowCore: '#fffbeb',
    tubeGlowOuter: '#fde68a',
    descriptionTh: 'ให้สเปกตรัมแบบต่อเนื่อง (Continuous Spectrum) เรียงแถบสีรุ้งติดกันตั้งแต่ม่วง (400 nm) ถึงแดง (700 nm)',
    continuousRangeNm: { min: 400, max: 700 },
    lines: []
  },

  helium: {
    id: 'helium',
    symbol: 'He',
    nameTh: 'หลอดบรรจุแก๊สฮีเลียม (เสริม)',
    nameEn: 'Helium Gas Tube',
    shortNameTh: 'ฮีเลียม',
    spectrumType: 'line',
    isBonus: true,
    tubeGlowCore: '#fef3c7',
    tubeGlowOuter: '#fb923c',
    descriptionTh: 'ธาตุเสริม: มีเส้นสีเหลืองสว่างเด่นมาก (587.6 nm) ร่วมกับสีแดง ฟ้า-เขียว และน้ำเงิน-ม่วง',
    lines: [
      {
        id: 'he-red',
        label: 'He-Red',
        colorNameTh: 'สีแดง',
        colorNameEn: 'Red',
        wavelengthNm: 667.8,
        colorHex: '#ef4444',
        intensity: 0.78,
        primary: true
      },
      {
        id: 'he-yellow',
        label: 'He-D3',
        colorNameTh: 'สีเหลือง',
        colorNameEn: 'Yellow',
        wavelengthNm: 587.6,
        colorHex: '#facc15',
        intensity: 1.0,
        primary: true
      },
      {
        id: 'he-green',
        label: 'He-Green',
        colorNameTh: 'สีเขียว',
        colorNameEn: 'Green',
        wavelengthNm: 501.6,
        colorHex: '#22c55e',
        intensity: 0.8,
        primary: true
      },
      {
        id: 'he-cyan',
        label: 'He-Cyan',
        colorNameTh: 'สีฟ้า',
        colorNameEn: 'Cyan',
        wavelengthNm: 492.2,
        colorHex: '#06b6d4',
        intensity: 0.55,
        primary: false
      },
      {
        id: 'he-blue',
        label: 'He-Blue',
        colorNameTh: 'สีน้ำเงิน',
        colorNameEn: 'Blue',
        wavelengthNm: 471.3,
        colorHex: '#3b82f6',
        intensity: 0.5,
        primary: false
      },
      {
        id: 'he-violet',
        label: 'He-Violet',
        colorNameTh: 'สีม่วงน้ำเงิน',
        colorNameEn: 'Indigo',
        wavelengthNm: 447.1,
        colorHex: '#6366f1',
        intensity: 0.76,
        primary: true
      }
    ]
  },

  mercury: {
    id: 'mercury',
    symbol: 'Hg',
    nameTh: 'หลอดบรรจุไอปรอท (เสริม)',
    nameEn: 'Mercury Vapor Tube',
    shortNameTh: 'ไอปรอท',
    spectrumType: 'line',
    isBonus: true,
    tubeGlowCore: '#e0f2fe',
    tubeGlowOuter: '#38bdf8',
    descriptionTh: 'ธาตุเสริม: มีเส้นสีเขียวสว่างจัด (546.1 nm) คู่เหลือง (577–579 nm) น้ำเงิน (435.8 nm) และม่วง (404.7 nm)',
    lines: [
      {
        id: 'hg-yellow-1',
        label: 'Hg-Y1',
        colorNameTh: 'สีเหลือง',
        colorNameEn: 'Yellow',
        wavelengthNm: 579.1,
        colorHex: '#eab308',
        intensity: 0.82,
        primary: true
      },
      {
        id: 'hg-yellow-2',
        label: 'Hg-Y2',
        colorNameTh: 'สีเหลือง',
        colorNameEn: 'Yellow',
        wavelengthNm: 577.0,
        colorHex: '#facc15',
        intensity: 0.75,
        primary: false
      },
      {
        id: 'hg-green',
        label: 'Hg-Green',
        colorNameTh: 'สีเขียว',
        colorNameEn: 'Green',
        wavelengthNm: 546.1,
        colorHex: '#22c55e',
        intensity: 1.0,
        primary: true
      },
      {
        id: 'hg-blue',
        label: 'Hg-Blue',
        colorNameTh: 'สีน้ำเงิน',
        colorNameEn: 'Blue',
        wavelengthNm: 435.8,
        colorHex: '#3b82f6',
        intensity: 0.9,
        primary: true
      },
      {
        id: 'hg-violet',
        label: 'Hg-Violet',
        colorNameTh: 'สีม่วง',
        colorNameEn: 'Violet',
        wavelengthNm: 404.7,
        colorHex: '#8b5cf6',
        intensity: 0.56,
        primary: true,
        isFaint: true
      }
    ]
  }
});

/**
 * IPST Textbook Reference Sample Results (Activity 19.1, N = 5300 lines/cm, D = 100 cm, center = 50 cm)
 */
export const IPST_SAMPLE_OBSERVATIONS = Object.freeze([
  { sourceId: 'hydrogen', colorNameTh: 'สีแดง', colorHex: '#ef4444', rightPosCm: 88.0, leftPosCm: 14.0, expectedNm: 656.3 },
  { sourceId: 'hydrogen', colorNameTh: 'สีฟ้า', colorHex: '#06b6d4', rightPosCm: 77.0, leftPosCm: 23.0, expectedNm: 486.1 },
  { sourceId: 'hydrogen', colorNameTh: 'สีน้ำเงิน', colorHex: '#3b82f6', rightPosCm: 73.0, leftPosCm: 26.0, expectedNm: 434.0 },
  { sourceId: 'neon', colorNameTh: 'สีแดง', colorHex: '#ef4444', rightPosCm: 87.0, leftPosCm: 13.0, expectedNm: 650.7 },
  { sourceId: 'neon', colorNameTh: 'สีส้ม', colorHex: '#f97316', rightPosCm: 85.5, leftPosCm: 14.5, expectedNm: 614.3 },
  { sourceId: 'neon', colorNameTh: 'สีเหลือง', colorHex: '#eab308', rightPosCm: 83.5, leftPosCm: 16.0, expectedNm: 585.2 }
]);

/**
 * Retrieve light source descriptor safely
 * @param {string} sourceId
 * @returns {object}
 */
export function getGasLightSource(sourceId) {
  return GAS_LIGHT_SOURCES[sourceId] || GAS_LIGHT_SOURCES.hydrogen;
}

/**
 * Get all light sources in display order
 * @returns {Array<object>}
 */
export function getAllGasLightSources() {
  return [
    GAS_LIGHT_SOURCES.hydrogen,
    GAS_LIGHT_SOURCES.neon,
    GAS_LIGHT_SOURCES.incandescent,
    GAS_LIGHT_SOURCES.helium,
    GAS_LIGHT_SOURCES.mercury
  ];
}
