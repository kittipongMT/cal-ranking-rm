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

export const OCR_BOXES: Record<SectionId, OcrBox[]> = {
  extream: [
    { pointBox: [0.522, 0.270, 0.045, 0.100] },
    { pointBox: [0.695, 0.270, 0.040, 0.100] },
    { pointBox: [0.860, 0.270, 0.040, 0.100] },
    { pointBox: [0.522, 0.500, 0.045, 0.100] },
    { pointBox: [0.695, 0.500, 0.040, 0.100] },
    { pointBox: [0.860, 0.500, 0.040, 0.100] },
    { pointBox: [0.545, 0.730, 0.050, 0.120] },
    { pointBox: [0.705, 0.730, 0.050, 0.120] },
  ],
  sport: [
    { pointBox: [0.536, 0.312, 0.055, 0.070] },
    { pointBox: [0.719, 0.319, 0.040, 0.055] },
    { pointBox: [0.894, 0.320, 0.040, 0.053] },
    { pointBox: [0.544, 0.547, 0.039, 0.058] },
    { pointBox: [0.719, 0.548, 0.039, 0.055] },
    { pointBox: [0.868, 0.547, 0.040, 0.054] },
    { pointBox: [0.517, 0.775, 0.040, 0.054] },
  ],
  standard: [
    { pointBox: [0.518, 0.388, 0.038, 0.039] },
    { pointBox: [0.694, 0.390, 0.037, 0.037] },
    { pointBox: [0.868, 0.386, 0.038, 0.045] },
    { pointBox: [0.544, 0.616, 0.039, 0.041] },
    { pointBox: [0.720, 0.617, 0.036, 0.039] },
    { pointBox: [0.896, 0.617, 0.035, 0.038] },
    { pointBox: [0.545, 0.844, 0.036, 0.039] },
  ],
}
