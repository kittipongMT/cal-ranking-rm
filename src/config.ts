// src/config.ts

export const STEP_POINTS = 200

export interface Hat {
  name: string
  steps: number
  image: string
}

export const hats: Hat[] = [
  { name: 'หมวกเทา', steps: 5, image: 'rank1.png' },
  { name: 'หมวกเขียวอ่อน', steps: 10, image: 'rank2.png' },
  { name: 'หมวกเขียวเข้ม', steps: 10, image: 'rank3.png' },
  { name: 'หมวกฟ้า', steps: 20, image: 'rank4.png' },
  { name: 'หมวกม่วง', steps: 25, image: 'rank5.png' },
  { name: 'หมวกทอง', steps: 25, image: 'rank6.png' },
  { name: 'หมวกส้ม', steps: 25, image: 'rank7.png' },
  { name: 'หมวกแดง', steps: 25, image: 'rank8.png' },
  { name: 'หมวกแดงทอง', steps: 50, image: 'rank9.png' },
  { name: 'หมวกเขียวทอง', steps: 50, image: 'rank10.png' },
]

export interface SectionDef {
  id: SectionId
  count: number
  label: string
}

export type SectionId = 'extream' | 'sport' | 'standard'

export const sections: SectionDef[] = [
  { id: 'extream', count: 8, label: 'Extream' },
  { id: 'sport', count: 7, label: 'Sport' },
  { id: 'standard', count: 7, label: 'Standard' },
]

export const defaultCars: Record<SectionId, string[]> = {
  extream: ['LaFerrari', 'Huayra BC', 'Ford GT', 'Centodieci', 'SVJ', 'Benz GT R', 'Chiron', 'Vulcan'],
  sport: ['Reventon', 'Giulia', 'GT-R', 'XJ220', 'F-Type', 'NSX-R', '4C Spider'],
  standard: ['RX7', 'DB5', 'Emira', '911 Carrera', 'Mach 1', 'Camaro Z/28', 'S15'],
}

export interface OcrBox {
  pointBox: [number, number, number, number]
}

// OCR_BOXES: each pointBox is [x, y, w, h] in 0–1 image fractions.
// The x and w are WIDE enough to include the purple badge on the LEFT of the number.
// findBadgeRightEdge() in ocr.ts will auto-detect where the badge ends
// and crop only the number portion to the right.
export const OCR_BOXES: Record<SectionId, OcrBox[]> = {
  extream: [
    // Row 1
    { pointBox: [0.420, 0.270, 0.170, 0.050] },
    { pointBox: [0.595, 0.270, 0.170, 0.050] },
    { pointBox: [0.770, 0.270, 0.170, 0.050] },
    // Row 2
    { pointBox: [0.420, 0.490, 0.170, 0.050] },
    { pointBox: [0.595, 0.490, 0.170, 0.050] },
    { pointBox: [0.770, 0.490, 0.170, 0.050] },
    // Row 3
    { pointBox: [0.420, 0.720, 0.170, 0.050] },
    { pointBox: [0.595, 0.720, 0.170, 0.050] },
  ],
  sport: [
    // Row 1
    { pointBox: [0.420, 0.320, 0.170, 0.050] },
    { pointBox: [0.595, 0.320, 0.170, 0.050] },
    { pointBox: [0.770, 0.320, 0.170, 0.050] },
    // Row 2
    { pointBox: [0.420, 0.550, 0.170, 0.050] },
    { pointBox: [0.595, 0.550, 0.170, 0.050] },
    { pointBox: [0.770, 0.550, 0.170, 0.050] },
    // Row 3
    { pointBox: [0.420, 0.775, 0.170, 0.050] },
  ],
  standard: [
    // Row 1
    { pointBox: [0.420, 0.390, 0.170, 0.050] },
    { pointBox: [0.595, 0.390, 0.170, 0.050] },
    { pointBox: [0.770, 0.390, 0.170, 0.050] },
    // Row 2
    { pointBox: [0.420, 0.620, 0.170, 0.050] },
    { pointBox: [0.595, 0.620, 0.170, 0.050] },
    { pointBox: [0.770, 0.620, 0.170, 0.050] },
    // Row 3
    { pointBox: [0.420, 0.845, 0.170, 0.050] },
  ],
}

export const OCR_CAR_NAME_BOXES: Record<SectionId, OcrBox[]> = {
  extream: [
    // Row 1
    { pointBox: [0.420, 0.230, 0.170, 0.040] },
    { pointBox: [0.595, 0.230, 0.170, 0.040] },
    { pointBox: [0.770, 0.230, 0.170, 0.040] },
    // Row 2
    { pointBox: [0.420, 0.450, 0.170, 0.040] },
    { pointBox: [0.595, 0.450, 0.170, 0.040] },
    { pointBox: [0.770, 0.450, 0.170, 0.040] },
    // Row 3
    { pointBox: [0.420, 0.680, 0.170, 0.040] },
    { pointBox: [0.595, 0.680, 0.170, 0.040] },
  ],
  sport: [
    // Row 1
    { pointBox: [0.420, 0.290, 0.170, 0.040] },
    { pointBox: [0.595, 0.290, 0.170, 0.040] },
    { pointBox: [0.770, 0.290, 0.170, 0.040] },
    // Row 2
    { pointBox: [0.420, 0.510, 0.170, 0.040] },
    { pointBox: [0.595, 0.510, 0.170, 0.040] },
    { pointBox: [0.770, 0.510, 0.170, 0.040] },
    // Row 3
    { pointBox: [0.420, 0.740, 0.170, 0.040] },
  ],
  standard: [
    // Row 1
    { pointBox: [0.420, 0.350, 0.170, 0.040] },
    { pointBox: [0.595, 0.350, 0.170, 0.040] },
    { pointBox: [0.770, 0.350, 0.170, 0.040] },
    // Row 2
    { pointBox: [0.420, 0.580, 0.170, 0.040] },
    { pointBox: [0.595, 0.580, 0.170, 0.040] },
    { pointBox: [0.770, 0.580, 0.170, 0.040] },
    // Row 3
    { pointBox: [0.420, 0.805, 0.170, 0.040] },
  ],
}