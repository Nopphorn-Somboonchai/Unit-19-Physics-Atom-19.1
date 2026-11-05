/**
 * @file hydrogen-spectrum-model.js
 * @description Spectral Series Model for Hydrogen Atom (Lyman, Balmer, Paschen, Brackett, Pfund).
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

export const SPECTRAL_SERIES = [
  {
    id: 'lyman',
    nameTh: 'อนุกรมไลแมน (Lyman Series)',
    nameEn: 'Lyman Series',
    nf: 1,
    minNi: 2,
    emRegionTh: 'อัลตราไวโอเลต (UV)',
    emRegionEn: 'Ultraviolet',
    descriptionTh: 'การเปลี่ยนระดับพลังงานมายัง n_f = 1 ปลดปล่อยโฟตอนย่านอัลตราไวโอเลต'
  },
  {
    id: 'balmer',
    nameTh: 'อนุกรมบัลเมอร์ (Balmer Series)',
    nameEn: 'Balmer Series',
    nf: 2,
    minNi: 3,
    emRegionTh: 'แสงที่ตามองเห็น (Visible) & UV',
    emRegionEn: 'Visible Light & Near UV',
    descriptionTh: 'การเปลี่ยนระดับพลังงานมายัง n_f = 2 ปลดปล่อยเส้นสเปกตรัมช่วงแสงที่ตามองเห็น'
  },
  {
    id: 'paschen',
    nameTh: 'อนุกรมพาสเชน (Paschen Series)',
    nameEn: 'Paschen Series',
    nf: 3,
    minNi: 4,
    emRegionTh: 'อินฟราเรด (Infrared)',
    emRegionEn: 'Infrared',
    descriptionTh: 'การเปลี่ยนระดับพลังงานมายัง n_f = 3 ปลดปล่อยโฟตอนย่านอินฟราเรด'
  },
  {
    id: 'brackett',
    nameTh: 'อนุกรมแบร์เก็ตต์ (Brackett Series)',
    nameEn: 'Brackett Series',
    nf: 4,
    minNi: 5,
    emRegionTh: 'อินฟราเรด (Infrared)',
    emRegionEn: 'Infrared',
    descriptionTh: 'การเปลี่ยนระดับพลังงานมายัง n_f = 4 ปลดปล่อยโฟตอนย่านอินฟราเรดไกล'
  },
  {
    id: 'pfund',
    nameTh: 'อนุกรมฟุนด์ (Pfund Series)',
    nameEn: 'Pfund Series',
    nf: 5,
    minNi: 6,
    emRegionTh: 'อินฟราเรด (Infrared)',
    emRegionEn: 'Infrared',
    descriptionTh: 'การเปลี่ยนระดับพลังงานมายัง n_f = 5 ปลดปล่อยโฟตอนย่านอินฟราเรดไกลมาก'
  }
];

export const BALMER_LINES = [
  { label: 'H-alpha (Hα)', ni: 3, nf: 2, lambdaNm: 656.3, colorHex: '#ef4444', colorNameTh: 'แดง' },
  { label: 'H-beta (Hβ)', ni: 4, nf: 2, lambdaNm: 486.1, colorHex: '#06b6d4', colorNameTh: 'ฟ้า-เขียว' },
  { label: 'H-gamma (Hγ)', ni: 5, nf: 2, lambdaNm: 434.0, colorHex: '#3b82f6', colorNameTh: 'น้ำเงิน' },
  { label: 'H-delta (Hδ)', ni: 6, nf: 2, lambdaNm: 410.2, colorHex: '#8b5cf6', colorNameTh: 'ม่วง' }
];

/**
 * Find spectral series by lower quantum state nf
 * @param {number} nf
 * @returns {object|null}
 */
export function findSeriesByNf(nf) {
  const targetNf = parseInt(nf, 10);
  return SPECTRAL_SERIES.find(s => s.nf === targetNf) || null;
}

/**
 * Get all available spectral series
 * @returns {Array<object>}
 */
export function getAllSpectralSeries() {
  return [...SPECTRAL_SERIES];
}

