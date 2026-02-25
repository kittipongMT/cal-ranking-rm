// src/config.ts

export const STEP_POINTS = 200

export interface Hat {
  name: string
  steps: number
}

export const hats: Hat[] = [
  { name: 'หมวกเทา', steps: 5 },
  { name: 'หมวกเขียวอ่อน', steps: 10 },
  { name: 'หมวกเขียวเข้ม', steps: 10 },
  { name: 'หมวกฟ้า', steps: 20 },
  { name: 'หมวกม่วง', steps: 25 },
  { name: 'หมวกทอง', steps: 25 },
  { name: 'หมวกส้ม', steps: 25 },
  { name: 'หมวกแดง', steps: 25 },
  { name: 'หมวกแดงทอง', steps: 50 },
  { name: 'หมวกเขียวทอง', steps: 50 },
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
    // Row 1 — right edges preserved: 0.567, 0.735, 0.908
    { pointBox: [0.420, 0.270, 0.170, 0.050] },
    { pointBox: [0.595, 0.270, 0.170, 0.050] },
    { pointBox: [0.770, 0.270, 0.170, 0.050] },
    // Row 2 — right edges: 0.567, 0.735, 0.900
    { pointBox: [0.420, 0.490, 0.170, 0.050] },
    { pointBox: [0.595, 0.490, 0.170, 0.050] },
    { pointBox: [0.770, 0.490, 0.170, 0.050] },
    // Row 3 — right edges: 0.583, 0.755
    { pointBox: [0.420, 0.720, 0.170, 0.050] },
    { pointBox: [0.595, 0.720, 0.170, 0.050] },
  ],
  sport: [
    // Right edges preserved: 0.591, 0.759, 0.934, 0.583, 0.758, 0.908, 0.557
    { pointBox: [0.436, 0.312, 0.155, 0.070] },
    { pointBox: [0.619, 0.319, 0.140, 0.055] },
    { pointBox: [0.794, 0.320, 0.140, 0.053] },
    { pointBox: [0.444, 0.547, 0.139, 0.058] },
    { pointBox: [0.619, 0.548, 0.139, 0.055] },
    { pointBox: [0.768, 0.547, 0.140, 0.054] },
    { pointBox: [0.417, 0.775, 0.140, 0.054] },
  ],
  standard: [
    // Right edges preserved: 0.556, 0.731, 0.906, 0.583, 0.756, 0.931, 0.581
    { pointBox: [0.418, 0.388, 0.138, 0.039] },
    { pointBox: [0.594, 0.390, 0.137, 0.037] },
    { pointBox: [0.768, 0.386, 0.138, 0.045] },
    { pointBox: [0.444, 0.616, 0.139, 0.041] },
    { pointBox: [0.620, 0.617, 0.136, 0.039] },
    { pointBox: [0.796, 0.617, 0.135, 0.038] },
    { pointBox: [0.445, 0.844, 0.136, 0.039] },
  ],
}
