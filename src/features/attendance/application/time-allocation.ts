export type TimeBlock = {
  start: number
  end: number
  kind: 'teaching' | 'complementary' | 'pool' | 'break'
}

export function overlapMinutes(presenceStart: number, presenceEnd: number, block: TimeBlock) {
  if (presenceEnd <= presenceStart || block.end <= block.start) return 0
  return Math.max(0, Math.min(presenceEnd, block.end) - Math.max(presenceStart, block.start))
}

export function allocatePresence(presenceStart: number, presenceEnd: number, blocks: TimeBlock[]) {
  return blocks.map((block) => ({
    ...block,
    minutes: block.kind === 'break' ? 0 : overlapMinutes(presenceStart, presenceEnd, block),
  }))
}
