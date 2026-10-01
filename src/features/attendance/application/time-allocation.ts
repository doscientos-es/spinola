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

export type PresenceSession = { start: number; end: number }

export function presenceMinutes(sessions: PresenceSession[]) {
  return sessions.reduce((total, session) => total + Math.max(0, session.end - session.start), 0)
}

export function allocateSessions<T extends TimeBlock>(sessions: PresenceSession[], blocks: T[]) {
  const allocated = blocks.map((block) => ({
    ...block,
    minutes:
      block.kind === 'break'
        ? 0
        : sessions.reduce(
            (total, session) => total + overlapMinutes(session.start, session.end, block),
            0,
          ),
  }))
  const assigned = allocated.reduce((total, block) => total + block.minutes, 0)
  const breaks = blocks
    .filter((block) => block.kind === 'break')
    .reduce(
      (total, block) =>
        total +
        sessions.reduce(
          (sum, session) => sum + overlapMinutes(session.start, session.end, block),
          0,
        ),
      0,
    )
  return {
    blocks: allocated,
    presence: presenceMinutes(sessions),
    unassigned: Math.max(0, presenceMinutes(sessions) - assigned - breaks),
  }
}
