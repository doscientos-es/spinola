import { describe, expect, it } from 'vitest'

import { allocatePresence, overlapMinutes } from './time-allocation'

describe('asignación de presencia docente', () => {
  it('calcula el solape sin convertir un hueco en horas lectivas', () => {
    const result = allocatePresence(510, 790, [
      { start: 510, end: 570, kind: 'teaching' },
      { start: 570, end: 600, kind: 'break' },
      { start: 600, end: 660, kind: 'teaching' },
      { start: 720, end: 780, kind: 'pool' },
    ])
    expect(result.map((block) => block.minutes)).toEqual([60, 0, 60, 60])
  })

  it('devuelve cero para intervalos inválidos', () => {
    expect(overlapMinutes(100, 90, { start: 0, end: 50, kind: 'teaching' })).toBe(0)
  })
})
