import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@doscientos/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronDown, Info, ShieldCheck } from 'lucide-react'
import { animate } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent } from 'react'

export const Route = createFileRoute('/')({ component: SpinolaHome })

type Block = {
  id: string
  start: string
  end: string
  label: string
  kind: 'lectiva' | 'complementaria' | 'bolsa' | 'hueco'
  note: string
  startMin: number
  endMin: number
}
type CenterScheduleBlock = {
  id: string
  teacherId: string
  day?: number
  label: string
  subject: string
  kind: 'lectiva' | 'complementaria' | 'tutoria' | 'guardia' | 'reunion' | 'preparacion'
  startMin: number
  endMin: number
}
type DemoUser = {
  id: string
  name: string
  role: 'docente' | 'director' | 'sede'
  centre: string
  initials: string
}
const demoUsers: DemoUser[] = [
  {
    id: 'lucia',
    name: 'Lucía Martín',
    role: 'docente',
    centre: 'Santa Rafaela · Madrid',
    initials: 'LM',
  },
  {
    id: 'carlos',
    name: 'Carlos Ortega',
    role: 'director',
    centre: 'Santa Rafaela · Madrid',
    initials: 'CO',
  },
  { id: 'marta', name: 'Marta Gil', role: 'sede', centre: 'Sede Fundación', initials: 'MG' },
]
const blocks: Block[] = [
  {
    id: 'b1',
    start: '08:30',
    end: '09:30',
    label: 'Matemáticas · 3º ESO',
    kind: 'lectiva',
    note: 'Bloque lectivo planificado',
    startMin: 510,
    endMin: 570,
  },
  {
    id: 'b2',
    start: '09:30',
    end: '10:00',
    label: 'Recreo',
    kind: 'hueco',
    note: 'No se imputa por continuidad del fichaje',
    startMin: 570,
    endMin: 600,
  },
  {
    id: 'b3',
    start: '10:00',
    end: '11:00',
    label: 'Tutoría · 2º B',
    kind: 'lectiva',
    note: 'Bloque lectivo planificado',
    startMin: 600,
    endMin: 660,
  },
  {
    id: 'b4',
    start: '12:00',
    end: '13:00',
    label: 'Reunión de departamento',
    kind: 'bolsa',
    note: 'Consume bolsa complementaria al aprobarse',
    startMin: 720,
    endMin: 780,
  },
]
const centerSchedule: CenterScheduleBlock[] = [
  {
    id: 'schedule-lucia-math',
    teacherId: 'lucia',
    label: 'Matemáticas · 3º ESO',
    subject: 'Aula 2.1',
    kind: 'lectiva',
    startMin: 510,
    endMin: 570,
  },
  {
    id: 'schedule-lucia-tutoria',
    teacherId: 'lucia',
    label: 'Tutoría · 2º B',
    subject: 'Aula 1.3',
    kind: 'complementaria',
    startMin: 600,
    endMin: 660,
  },
  {
    id: 'schedule-diego-castellano',
    teacherId: 'diego',
    label: 'Lengua Castellana · 1º ESO',
    subject: 'Aula 1.2',
    kind: 'lectiva',
    startMin: 540,
    endMin: 600,
  },
  {
    id: 'schedule-diego-department',
    teacherId: 'diego',
    label: 'Reunión de departamento',
    subject: 'Sala de profesores',
    kind: 'complementaria',
    startMin: 690,
    endMin: 750,
  },
  {
    id: 'schedule-ines-english',
    teacherId: 'ines',
    label: 'Inglés · Bachillerato',
    subject: 'Aula 2.3',
    kind: 'lectiva',
    startMin: 480,
    endMin: 540,
  },
]

export function SpinolaHome({
  initialManagerTab = 'schedule',
}: {
  initialManagerTab?: 'schedule' | 'overview' | 'teachers' | 'templates' | 'incidents'
}) {
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem('spinola-demo-user'),
  )
  const user = demoUsers.find((item) => item.id === userId) ??
    demoUsers[0] ?? {
      id: 'lucia',
      name: 'Lucía Martín',
      role: 'docente' as const,
      centre: 'Santa Rafaela · Madrid',
      initials: 'LM',
    }
  const [started, setStarted] = useState(
    () => localStorage.getItem('spinola-demo-started') === 'true',
  )
  const [startedAt, setStartedAt] = useState(
    () => localStorage.getItem('spinola-demo-started-at') ?? '08:30',
  )
  const [dayBlocks, setDayBlocks] = useState<Block[]>(() =>
    loadLocal('spinola-demo-blocks', blocks),
  )
  const [review, setReview] = useState(false)
  const [approved, setApproved] = useState(
    () => localStorage.getItem('spinola-demo-approved') === 'true',
  )
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    loadLocal(
      'spinola-demo-completed',
      blocks.filter((block) => block.kind !== 'hueco').map((block) => block.id),
    ),
  )
  const [showGuide, setShowGuide] = useState(false)
  const [clockExpanded, setClockExpanded] = useState(false)
  const [nowMinutes, setNowMinutes] = useState(
    () => new Date().getHours() * 60 + new Date().getMinutes(),
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createStartMin, setCreateStartMin] = useState(480)
  const [createOpen, setCreateOpen] = useState(false)
  const [createKind, setCreateKind] = useState<Block['kind']>('lectiva')
  const [createLabel, setCreateLabel] = useState('')
  const [createDuration, setCreateDuration] = useState(60)
  const [editing, setEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState('')
  const suppressClick = useRef(false)
  const pointerMoved = useRef(false)
  const [interaction, setInteraction] = useState<{
    id: string
    mode: 'move' | 'resize-end'
    originY: number
    startMin: number
    endMin: number
  } | null>(null)
  const covered = useMemo(() => (started ? 60 : 0), [started])
  const selected = dayBlocks.find((block) => block.id === selectedId)
  const positionedBlocks = useMemo(() => layoutOverlaps(dayBlocks), [dayBlocks])
  const isManager = user.role !== 'docente'
  const clockState = started ? 'is-active' : review ? 'is-review' : 'is-idle'
  const paused = !started && startedAt !== ''
  useEffect(() => {
    const updateNow = () => {
      const current = new Date()
      setNowMinutes(current.getHours() * 60 + current.getMinutes())
    }
    const interval = window.setInterval(updateNow, 60_000)
    return () => window.clearInterval(interval)
  }, [])
  const clockRef = useRef<HTMLElement>(null)
  const clockSize = useRef<{ width: number; height: number } | null>(null)
  function toggleClock() {
    const card = clockRef.current
    if (!card) {
      setClockExpanded((value) => !value)
      return
    }
    clockSize.current = { width: card.offsetWidth, height: card.offsetHeight }
    card.style.width = `${card.offsetWidth}px`
    card.style.height = `${card.offsetHeight}px`
    setClockExpanded((value) => !value)
  }
  function openCreate(startMin: number) {
    setCreateStartMin(Math.max(480, Math.min(1260, Math.round(startMin / 15) * 15)))
    setCreateKind('lectiva')
    setCreateLabel('')
    setCreateDuration(60)
    setCreateOpen(true)
  }
  function createBlock() {
    const endMin = Math.min(1320, createStartMin + createDuration)
    const labels: Record<Block['kind'], string> = {
      lectiva: 'Clase',
      complementaria: 'Actividad complementaria',
      bolsa: 'Guardia / bolsa',
      hueco: 'Recreo',
    }
    const label = createLabel.trim() || labels[createKind]
    setDayBlocks((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        start: formatTime(createStartMin),
        end: formatTime(endMin),
        label,
        kind: createKind,
        note:
          createKind === 'bolsa'
            ? 'Se imputa a la bolsa complementaria disponible'
            : `${kindLabel(createKind)} añadida desde el horario`,
        startMin: createStartMin,
        endMin,
      },
    ])
    setCreateOpen(false)
  }
  useEffect(() => {
    if (!interaction) return
    const onMove = (event: globalThis.PointerEvent) => {
      if (Math.abs(event.clientY - interaction.originY) > 4) pointerMoved.current = true
      const delta = Math.round((((event.clientY - interaction.originY) / 63) * 60) / 15) * 15
      setDayBlocks((current) =>
        current.map((block) => {
          if (block.id !== interaction.id) return block
          let startMin = block.startMin
          let endMin = block.endMin
          if (interaction.mode === 'move') {
            startMin = Math.max(
              480,
              Math.min(
                1260 - (interaction.endMin - interaction.startMin),
                interaction.startMin + delta,
              ),
            )
            endMin = startMin + (interaction.endMin - interaction.startMin)
          }
          if (interaction.mode === 'resize-end')
            endMin = Math.min(1320, Math.max(startMin + 15, interaction.endMin + delta))
          return {
            ...block,
            startMin,
            endMin,
            start: formatTime(startMin),
            end: formatTime(endMin),
          }
        }),
      )
    }
    const onUp = () => {
      setInteraction(null)
      window.setTimeout(() => {
        suppressClick.current = false
      }, 80)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [interaction])
  useEffect(() => {
    localStorage.setItem('spinola-demo-blocks', JSON.stringify(dayBlocks))
  }, [dayBlocks])
  useEffect(() => {
    localStorage.setItem('spinola-demo-completed', JSON.stringify(completedIds))
  }, [completedIds])
  useEffect(() => {
    localStorage.setItem('spinola-demo-approved', String(approved))
  }, [approved])
  useEffect(() => {
    localStorage.setItem('spinola-demo-started', String(started))
    localStorage.setItem('spinola-demo-started-at', startedAt)
  }, [started, startedAt])
  useEffect(() => {
    const card = clockRef.current
    const from = clockSize.current
    if (!card || !from) return
    clockSize.current = null
    card.style.width = 'auto'
    card.style.height = 'auto'
    const to = { width: card.offsetWidth, height: card.offsetHeight }
    const width = animate(from.width, to.width, {
      duration: 0.42,
      ease: [0.22, 0.8, 0.24, 1],
      onUpdate: (value) => {
        card.style.width = `${value}px`
      },
    })
    const height = animate(from.height, to.height, {
      duration: 0.42,
      ease: [0.22, 0.8, 0.24, 1],
      onUpdate: (value) => {
        card.style.height = `${value}px`
      },
    })
    void Promise.all([width.finished, height.finished]).then(() => {
      card.style.width = ''
      card.style.height = ''
    })
    return () => {
      width.stop()
      height.stop()
    }
  }, [clockExpanded])
  if (!userId) {
    return (
      <DemoLogin
        onSelect={(id) => {
          localStorage.setItem('spinola-demo-user', id)
          window.dispatchEvent(new Event('spinola-demo-login'))
          setUserId(id)
        }}
      />
    )
  }
  return (
    <div className="spinola-page">
      {isManager ? (
        <ManagerView
          user={user}
          approved={approved}
          onApprove={() => setApproved(true)}
          initialTab={initialManagerTab}
          nowMinutes={nowMinutes}
        />
      ) : (
        <TeacherView />
      )}
    </div>
  )

  function TeacherView() {
    return (
      <>
        <div className="page-intro">
          <div>
            <h1>Mi jornada</h1>
            <p>Martes, 22 de septiembre · Santa Rafaela</p>
          </div>
          <div className="date-chip">
            <strong>Plantilla activa</strong>
            <br />
            Curso 2026/27 · 3º ESO
          </div>
        </div>
        <section
          ref={clockRef}
          className={`clock-card ${clockExpanded ? 'expanded' : ''} ${paused ? 'is-paused' : clockState}`}
        >
          <button className="clock-toggle" aria-expanded={clockExpanded} onClick={toggleClock}>
            <span className={`status-dot ${started ? 'on' : ''}`} />
            <div className="clock-copy">
              <div className="clock-heading">
                <span>Mi jornada</span>
                <em>{started ? 'En curso' : paused ? 'En pausa' : 'Sin iniciar'}</em>
              </div>
              <strong>{startedAt || '—'}</strong>
              <small>
                {started
                  ? 'Presencia registrada'
                  : paused
                    ? 'Fichaje en pausa'
                    : 'Tu primer bloque · 08:30'}
              </small>
            </div>
            <span className="clock-chevron">{clockExpanded ? '×' : '↗'}</span>
          </button>
          <div className="clock-details" aria-hidden={!clockExpanded}>
            <div>
              <small>Tiempo fichado</small>
              <strong>{started ? '1 h 42 min' : '—'}</strong>
            </div>
            <div>
              <small>Próximo bloque</small>
              <strong>{started ? 'Recreo · 09:30' : 'Matemáticas · 08:30'}</strong>
            </div>
          </div>
          <button
            className={`clock-button ${started ? 'finish' : ''}`}
            aria-label={
              started ? 'Pausar jornada' : paused ? 'Reanudar jornada' : 'Iniciar jornada'
            }
            onClick={() => {
              if (!started)
                setStartedAt(
                  new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                )
              setStarted(!started)
            }}
          >
            <span className="clock-icon">{started ? '❚❚' : '▶'}</span>
            <span className="clock-label">
              {started ? 'Pausar jornada' : paused ? 'Reanudar jornada' : 'Iniciar jornada'}
            </span>
          </button>
          {paused && (
            <button
              className="clock-end"
              onClick={() => {
                setCompletedIds(
                  dayBlocks.filter((block) => block.kind !== 'hueco').map((block) => block.id),
                )
                setReview(true)
              }}
            >
              Terminar jornada
            </button>
          )}
        </section>
        <div className="metrics-row">
          <div className="metric-card metric-card-green">
            <div className="metric-topline">
              <span>Lectivas cubiertas</span>
            </div>
            <strong>
              {covered} <small>/ 120 min</small>
            </strong>
            <div className="metric-progress">
              <i style={{ width: `${Math.min(100, (covered / 120) * 100)}%` }} />
            </div>
            <p>
              <b>{Math.round((covered / 120) * 100)}%</b> del horario previsto
            </p>
          </div>
          <div className="metric-card metric-card-violet">
            <div className="metric-topline">
              <span>Complementarias</span>
            </div>
            <strong>
              30 <small>min</small>
            </strong>
            <div className="metric-progress">
              <i style={{ width: '25%' }} />
            </div>
            <p>
              <b>30 min</b> registrados hoy
            </p>
          </div>
          <div className="metric-card metric-card-orange">
            <div className="metric-topline">
              <span>Bolsa disponible</span>
            </div>
            <strong>
              4 h 30 <small>min</small>
            </strong>
            <div className="metric-progress">
              <i style={{ width: '68%' }} />
            </div>
            <p>
              <b>68%</b> disponible este trimestre
            </p>
          </div>
        </div>
        <section className="teacher-week-card">
          <div className="section-heading">
            <div>
              <h2>Mi semana</h2>
              <p className="calendar-hint">Vista general de tus clases y actividades previstas</p>
            </div>
            <span className="count-pill">Semana del 21–25 sep.</span>
          </div>
          <div className="teacher-week-grid">
            {[
              ['Lun', ['Matemáticas · 3º ESO', 'Tutoría · 2º B']],
              ['Mar', ['Lengua · 1º ESO', 'Reunión de departamento']],
              ['Mié', ['Matemáticas · 3º ESO', 'Preparación y evaluación']],
              ['Jue', ['Inglés · 2º ESO', 'Guardia · Patio']],
              ['Vie', ['Matemáticas · 3º ESO', 'Atención a familias']],
            ].map(([day, activities], index) => (
              <button
                className={`teacher-week-day ${index === 1 ? 'today' : ''}`}
                key={String(day)}
                onClick={() => setShowGuide(false)}
              >
                <strong>{String(day)}</strong>
                <span>{index === 1 ? 'Hoy' : `${2 + index} bloques`}</span>
                {(activities as string[]).map((activity) => (
                  <small key={activity}>{activity}</small>
                ))}
              </button>
            ))}
          </div>
        </section>
        <section className="content-grid">
          <div className="timeline-card">
            <div className="section-heading">
              <div>
                <h2>Horario previsto</h2>
                <p className="calendar-hint">Tu horario previsto para hoy</p>
              </div>
              <div className="calendar-actions">
                <button className="guide-trigger" onClick={() => setShowGuide((value) => !value)}>
                  <Info size={14} /> Cómo funciona
                </button>
              </div>
            </div>
            <div className="day-calendar">
              {nowMinutes >= 480 && nowMinutes <= 1260 && (
                <div
                  className="current-time-line"
                  style={{ top: `${(nowMinutes - 480) * 1.05 + 8}px` }}
                >
                  <span>{formatTime(nowMinutes)}</span>
                  <i />
                </div>
              )}
              {Array.from({ length: 26 }, (_, index) => {
                const minute = 480 + index * 60
                return (
                  <div
                    className="calendar-row"
                    key={minute}
                    onClick={() => openCreate(minute)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => moveBlock(event, minute)}
                  >
                    <span>{formatTime(minute)}</span>
                    <div className="calendar-track" />
                  </div>
                )
              })}
              {positionedBlocks.map(({ block, column, columns }) => (
                <div
                  className={`calendar-block ${block.kind} ${block.endMin - block.startMin <= 30 ? 'compact' : ''} ${block.endMin <= nowMinutes ? 'past' : ''}`}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('blockId', block.id)}
                  key={block.id}
                  onClick={() => {
                    if (suppressClick.current && pointerMoved.current) {
                      suppressClick.current = false
                      return
                    }
                    suppressClick.current = false
                    setSelectedId(block.id)
                  }}
                  onPointerDown={(event) => beginInteraction(event, block, 'move')}
                  style={{
                    top: `${(block.startMin - 480) * 1.05 + 8}px`,
                    height: `${Math.max((block.endMin - block.startMin) * 1.05 - 8, 28)}px`,
                    left: `calc(67px + (100% - 79px) * ${column} / ${columns})`,
                    width: `calc((100% - 79px) / ${columns} - 5px)`,
                    right: 'auto',
                  }}
                >
                  <strong>
                    {block.label}
                    {block.endMin - block.startMin <= 30 && (
                      <small className="inline-time">
                        {' '}
                        · {formatTime(block.startMin)}–{formatTime(block.endMin)}
                      </small>
                    )}
                  </strong>
                  {block.endMin - block.startMin > 30 && (
                    <small>
                      {formatTime(block.startMin)}–{formatTime(block.endMin)}
                    </small>
                  )}
                  <button aria-label={`Editar ${block.label}`} onClick={() => setReview(true)}>
                    ···
                  </button>
                  <span
                    role="slider"
                    tabIndex={0}
                    aria-label={`Cambiar fin de ${block.label}`}
                    className="resize-handle bottom"
                    onPointerDown={(event) => beginInteraction(event, block, 'resize-end')}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        {createOpen && (
          <div className="modal-backdrop" role="presentation" onClick={() => setCreateOpen(false)}>
            <div
              className="block-modal create-modal"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-top">
                <span className="detail-kind lectiva">Nuevo bloque</span>
                <button
                  className="modal-close"
                  aria-label="Cerrar"
                  onClick={() => setCreateOpen(false)}
                >
                  ×
                </button>
              </div>
              <h3>Añadir al horario</h3>
              <p className="modal-note">
                Se añadirá a las horas de hoy y quedará guardado en este dispositivo.
              </p>
              <div className="create-fields">
                <label>
                  Tipo
                  <select
                    value={createKind}
                    onChange={(event) => setCreateKind(event.target.value as Block['kind'])}
                  >
                    <option value="lectiva">Clase lectiva</option>
                    <option value="complementaria">Tutoría / complementaria</option>
                    <option value="bolsa">Guardia / bolsa disponible</option>
                    <option value="hueco">Recreo / pausa</option>
                  </select>
                </label>
                <label>
                  Inicio
                  <select
                    value={createStartMin}
                    onChange={(event) => setCreateStartMin(Number(event.target.value))}
                  >
                    {Array.from({ length: 53 }, (_, index) => 480 + index * 15).map((value) => (
                      <option key={value} value={value}>
                        {formatTime(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Duración
                  <select
                    value={createDuration}
                    onChange={(event) => setCreateDuration(Number(event.target.value))}
                  >
                    {[15, 30, 45, 60, 90, 120].map((value) => (
                      <option key={value} value={value}>
                        {value} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="create-full">
                  Nombre
                  <input
                    autoFocus
                    value={createLabel}
                    onChange={(event) => setCreateLabel(event.target.value)}
                    placeholder="Ej. Inglés · 1º ESO"
                  />
                </label>
              </div>
              <p className="create-source">
                {createKind === 'bolsa'
                  ? 'Imputa a bolsa complementaria'
                  : createKind === 'hueco'
                    ? 'No consume bolsa'
                    : `Imputa a ${kindLabel(createKind).toLowerCase()}`}
              </p>
              <div className="modal-actions">
                <button className="secondary-action" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </button>
                <button className="primary-action" onClick={createBlock}>
                  Añadir bloque
                </button>
              </div>
            </div>
          </div>
        )}
        {selected && (
          <div className="modal-backdrop" role="presentation" onClick={() => setSelectedId(null)}>
            <div
              className="block-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="block-detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-top">
                <span className={`detail-kind ${selected.kind}`}>{kindLabel(selected.kind)}</span>
                <button
                  className="modal-close"
                  aria-label="Cerrar detalle"
                  onClick={() => setSelectedId(null)}
                >
                  ×
                </button>
              </div>
              <h3 id="block-detail-title">{selected.label}</h3>
              <p className="modal-time">
                {formatTime(selected.startMin)} – {formatTime(selected.endMin)}
              </p>
              <p className="modal-note">{selected.note}</p>
              <div className="modal-fields">
                <div>
                  <span>Centro</span>
                  <strong>Santa Rafaela · Madrid</strong>
                </div>
                <div>
                  <span>Imputación</span>
                  <strong>
                    {selected.kind === 'bolsa' ? 'Bolsa complementaria' : kindLabel(selected.kind)}
                  </strong>
                </div>
              </div>
              {editing ? (
                <div className="edit-form">
                  <label>
                    Nombre de la actividad
                    <input
                      value={draftLabel}
                      onChange={(event) => setDraftLabel(event.target.value)}
                    />
                  </label>
                  <div className="detail-actions">
                    <button
                      onClick={() => {
                        setDayBlocks((current) =>
                          current.map((block) =>
                            block.id === selected.id ? { ...block, label: draftLabel } : block,
                          ),
                        )
                        setEditing(false)
                      }}
                    >
                      Guardar cambios
                    </button>
                    <button className="detail-close" onClick={() => setEditing(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-actions">
                  <button
                    onClick={() => {
                      setEditing(true)
                      setDraftLabel(selected.label)
                    }}
                  >
                    Editar actividad
                  </button>
                  <button className="detail-close" onClick={() => setSelectedId(null)}>
                    Cerrar
                  </button>
                  <button
                    className="detail-delete"
                    onClick={() => {
                      setDayBlocks((current) => current.filter((block) => block.id !== selected.id))
                      setSelectedId(null)
                    }}
                  >
                    Eliminar actividad
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {showGuide && (
          <div className="guide-popover">
            <strong>Así se calcula tu jornada</strong>
            <span>
              El fichaje registra tu presencia. Cada bloque del horario se imputa como lectivo,
              complementario o de bolsa sólo cuando corresponde.
            </span>
            <span className="guide-legend">
              <i className="legend-dot lectiva" /> Lectiva{' '}
              <i className="legend-dot complementaria" /> Complementaria{' '}
              <i className="legend-dot bolsa" /> Bolsa
            </span>
          </div>
        )}
        {review && (
          <div className="review-backdrop" role="presentation" onClick={() => setReview(false)}>
            <div
              className="review-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="review-head">
                <div>
                  <strong id="review-title">Termina tu jornada</strong>
                  <span>Marca lo que has hecho y elimina lo que finalmente no ocurrió.</span>
                </div>
                <button
                  className="review-close"
                  aria-label="Cerrar"
                  onClick={() => setReview(false)}
                >
                  ×
                </button>
              </div>
              <div className="review-items">
                {dayBlocks
                  .filter((block) => block.kind !== 'hueco')
                  .map((block) => (
                    <label key={block.id}>
                      <input
                        type="checkbox"
                        checked={completedIds.includes(block.id)}
                        onChange={(event) =>
                          setCompletedIds((current) =>
                            event.target.checked
                              ? [...current, block.id]
                              : current.filter((id) => id !== block.id),
                          )
                        }
                      />
                      <span>
                        {block.label}
                        <small>
                          {block.start}–{block.end}
                        </small>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDayBlocks((current) => current.filter((item) => item.id !== block.id))
                          setCompletedIds((current) => current.filter((id) => id !== block.id))
                        }}
                      >
                        Eliminar
                      </button>
                    </label>
                  ))}
              </div>
              <div className="review-actions">
                <button className="review-cancel" onClick={() => setReview(false)}>
                  Seguir más tarde
                </button>
                <button className="save-day" onClick={() => setReview(false)}>
                  Guardar jornada
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  function moveBlock(event: DragEvent<HTMLDivElement>, minute: number) {
    const id = event.dataTransfer.getData('blockId')
    setDayBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? {
              ...block,
              startMin: minute,
              endMin: minute + (block.endMin - block.startMin),
              start: formatTime(minute),
              end: formatTime(minute + (block.endMin - block.startMin)),
            }
          : block,
      ),
    )
  }

  function beginInteraction(
    event: PointerEvent<HTMLElement>,
    block: Block,
    mode: 'move' | 'resize-end',
  ) {
    if ((event.target as HTMLElement).tagName === 'BUTTON') return
    event.preventDefault()
    event.stopPropagation()
    suppressClick.current = true
    pointerMoved.current = false
    setInteraction({
      id: block.id,
      mode,
      originY: event.clientY,
      startMin: block.startMin,
      endMin: block.endMin,
    })
  }
}

function DemoLogin({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <img src="/brand/spinola-logo.png" alt="Fundación Spínola" className="login-logo" />
          <small>Entorno de demostración</small>
        </div>
        <p className="eyebrow">Acceso a la demo</p>
        <h1>¿Quién está entrando?</h1>
        <p className="login-intro">
          Elige un perfil para ver la experiencia que tendría cada persona dentro de la plataforma.
        </p>
        <div className="login-users">
          {demoUsers.map((demoUser) => (
            <button key={demoUser.id} className="login-user" onClick={() => onSelect(demoUser.id)}>
              <span className="login-avatar">{demoUser.initials}</span>
              <span>
                <strong>{demoUser.name}</strong>
                <small>
                  {roleLabel(demoUser.role)} · {demoUser.centre}
                </small>
              </span>
              <ChevronDown size={16} />
            </button>
          ))}
        </div>
        <small className="login-footnote">
          Demo local · no se solicitan credenciales ni se envían datos.
        </small>
      </div>
    </div>
  )
}

function ManagerView({
  user,
  approved,
  onApprove,
  initialTab,
  nowMinutes,
}: {
  user: DemoUser
  approved: boolean
  onApprove: () => void
  initialTab: 'schedule' | 'overview' | 'teachers' | 'templates' | 'incidents'
  nowMinutes: number
}) {
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'overview' | 'teachers' | 'templates' | 'incidents'
  >(initialTab)
  useEffect(() => {
    const onManagerTab = (event: Event) => {
      const tab = (event as CustomEvent<string>).detail
      if (['schedule', 'overview', 'teachers', 'templates', 'incidents'].includes(tab)) {
        setActiveTab(tab as 'schedule' | 'overview' | 'teachers' | 'templates' | 'incidents')
      }
    }
    window.addEventListener('spinola-manager-tab', onManagerTab)
    return () => window.removeEventListener('spinola-manager-tab', onManagerTab)
  }, [])
  const [scenario, setScenario] = useState('pending')
  const [templateActive, setTemplateActive] = useState(
    () => localStorage.getItem('spinola-demo-template') !== 'false',
  )
  const [newTemplateOpen, setNewTemplateOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateCreated, setNewTemplateCreated] = useState(false)
  const [createdTemplateName, setCreatedTemplateName] = useState('')
  const [scheduleBlocks, setScheduleBlocks] = useState<CenterScheduleBlock[]>(() =>
    loadLocal('spinola-demo-center-schedule', centerSchedule),
  )
  const [scheduleFilter, setScheduleFilter] = useState('all')
  const [scheduleDay, setScheduleDay] = useState(1)
  const [scheduleRepeats, setScheduleRepeats] = useState(
    () => localStorage.getItem('spinola-demo-schedule-repeat') !== 'false',
  )
  const [scheduleSelectedId, setScheduleSelectedId] = useState<string | null>(null)
  const [scheduleDragId, setScheduleDragId] = useState<string | null>(null)
  const scheduleDragMoved = useRef(false)
  const scheduleSuppressClickUntil = useRef(0)
  const [scheduleDropPreview, setScheduleDropPreview] = useState<{
    teacherId: string
    startMin: number
    endMin: number
  } | null>(null)
  const [scheduleCreateOpen, setScheduleCreateOpen] = useState(false)
  const [scheduleCreateLabel, setScheduleCreateLabel] = useState('')
  const [scheduleCreateTeacher, setScheduleCreateTeacher] = useState('lucia')
  const [scheduleCreateStart, setScheduleCreateStart] = useState(480)
  const [scheduleCreateDuration, setScheduleCreateDuration] = useState(60)
  const [scheduleCreateKind, setScheduleCreateKind] =
    useState<CenterScheduleBlock['kind']>('lectiva')
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const teachers = [
    { id: 'lucia', name: 'Lucía Martín', detail: '3º ESO · 18 h lectivas', initials: 'LM' },
    { id: 'diego', name: 'Diego Ruiz', detail: '2º ESO · 16 h lectivas', initials: 'DR' },
    { id: 'ines', name: 'Inés Valdés', detail: 'Bachillerato · 20 h lectivas', initials: 'IV' },
  ]
  useEffect(() => {
    localStorage.setItem('spinola-demo-template', String(templateActive))
  }, [templateActive])
  useEffect(() => {
    localStorage.setItem('spinola-demo-center-schedule', JSON.stringify(scheduleBlocks))
  }, [scheduleBlocks])
  useEffect(() => {
    localStorage.setItem('spinola-demo-schedule-repeat', String(scheduleRepeats))
  }, [scheduleRepeats])
  const pending = scenario !== 'empty' && !approved
  const scheduleTeachers = teachers.map((teacher) => ({
    ...teacher,
    color: teacher.id === 'lucia' ? 'green' : teacher.id === 'diego' ? 'blue' : 'orange',
  }))
  const visibleScheduleTeachers = scheduleTeachers.filter(
    (teacher) => scheduleFilter === 'all' || teacher.id === scheduleFilter,
  )
  const scheduleHours = Array.from({ length: 27 }, (_, index) => 480 + index * 30)
  function scheduledHoursFor(teacherId: string) {
    const minutes = scheduleBlocks
      .filter((block) => block.teacherId === teacherId && (block.day ?? 1) === scheduleDay)
      .reduce((total, block) => total + block.endMin - block.startMin, 0)
    return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
  }
  function weeklyBucketsFor(teacherId: string) {
    const blocks = scheduleBlocks.filter((block) => block.teacherId === teacherId)
    const lectiva = blocks
      .filter((block) => block.kind === 'lectiva')
      .reduce((total, block) => total + block.endMin - block.startMin, 0)
    const complementaria = blocks
      .filter((block) => block.kind !== 'lectiva')
      .reduce((total, block) => total + block.endMin - block.startMin, 0)
    return { lectiva, complementaria }
  }
  function scheduleOverlaps() {
    const overlaps: Array<{ teacher: string; first: string; second: string }> = []
    scheduleTeachers.forEach((teacher) => {
      const blocks = scheduleBlocks
        .filter((block) => block.teacherId === teacher.id && (block.day ?? 1) === scheduleDay)
        .sort((a, b) => a.startMin - b.startMin)
      blocks.forEach((block, index) => {
        const other = blocks.slice(index + 1).find((candidate) => candidate.startMin < block.endMin)
        if (other) overlaps.push({ teacher: teacher.name, first: block.label, second: other.label })
      })
    })
    return overlaps
  }
  function copyDayToWeek() {
    const source = scheduleBlocks.filter((block) => (block.day ?? 1) === scheduleDay)
    setScheduleBlocks((current) => [
      ...current.filter((block) => {
        const day = block.day ?? 1
        return day === scheduleDay || !days.some((item) => item.id === day)
      }),
      ...days
        .filter((day) => day.id !== scheduleDay)
        .flatMap((day) =>
          source.map((block) => ({
            ...block,
            id: `${block.id}-day-${day.id}`,
            day: day.id,
          })),
        ),
    ])
  }
  const days = [
    { id: 1, label: 'Lunes' },
    { id: 2, label: 'Martes' },
    { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' },
    { id: 5, label: 'Viernes' },
  ]
  function moveCenterScheduleBlock(
    event: DragEvent<HTMLElement>,
    teacherId: string,
    minute: number,
  ) {
    const blockId = event.dataTransfer.getData('center-schedule-block')
    const dragged = scheduleBlocks.find((block) => block.id === blockId)
    if (!dragged) return
    const duration = dragged.endMin - dragged.startMin
    const startMin = Math.max(480, Math.min(1260 - duration, Math.round(minute / 30) * 30))
    setScheduleBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? { ...block, teacherId, startMin, endMin: startMin + duration }
          : block,
      ),
    )
    setScheduleSelectedId(blockId)
    setScheduleDragId(null)
    setScheduleDropPreview(null)
  }
  function previewCenterScheduleDrop(teacherId: string, minute: number) {
    if (!scheduleDragId) return
    const dragged = scheduleBlocks.find((block) => block.id === scheduleDragId)
    if (!dragged) return
    const duration = dragged.endMin - dragged.startMin
    const startMin = Math.max(480, Math.min(900 - duration, Math.round(minute / 30) * 30))
    setScheduleDropPreview({ teacherId, startMin, endMin: startMin + duration })
  }
  function resizeCenterScheduleBlock(event: PointerEvent<HTMLElement>, block: CenterScheduleBlock) {
    event.preventDefault()
    event.stopPropagation()
    const originY = event.clientY
    const originalEnd = block.endMin
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const deltaMin = Math.round((((moveEvent.clientY - originY) / 50) * 30) / 30) * 30
      const endMin = Math.max(block.startMin + 30, Math.min(1260, originalEnd + deltaMin))
      setScheduleBlocks((current) =>
        current.map((item) => (item.id === block.id ? { ...item, endMin } : item)),
      )
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setScheduleDragId(null)
    }
    setScheduleDragId(block.id)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  function openScheduleCreate(teacherId: string, minute: number) {
    setEditingScheduleId(null)
    setScheduleCreateTeacher(teacherId)
    setScheduleCreateStart(minute)
    setScheduleCreateDuration(60)
    setScheduleCreateKind('lectiva')
    setScheduleCreateLabel('')
    setScheduleCreateOpen(true)
    setScheduleSelectedId(null)
  }
  function addCenterScheduleBlock() {
    const label = scheduleCreateLabel.trim()
    if (!label) return
    const endMin = Math.min(1260, scheduleCreateStart + scheduleCreateDuration)
    const newBlock: CenterScheduleBlock = {
      id: editingScheduleId ?? `schedule-${Date.now()}`,
      teacherId: scheduleCreateTeacher,
      day: scheduleDay,
      label,
      subject: 'Aula por asignar',
      kind: scheduleCreateKind,
      startMin: scheduleCreateStart,
      endMin,
    }
    setScheduleBlocks((current) =>
      editingScheduleId
        ? current.map((block) => (block.id === editingScheduleId ? newBlock : block))
        : [...current, newBlock],
    )
    setScheduleSelectedId(newBlock.id)
    setEditingScheduleId(null)
    setScheduleCreateLabel('')
    setScheduleCreateOpen(false)
  }
  function editCenterScheduleBlock(block: CenterScheduleBlock) {
    setEditingScheduleId(block.id)
    setScheduleCreateTeacher(block.teacherId)
    setScheduleCreateStart(block.startMin)
    setScheduleCreateDuration(block.endMin - block.startMin)
    setScheduleCreateKind(block.kind)
    setScheduleCreateLabel(block.label)
    setScheduleSelectedId(null)
    setScheduleCreateOpen(true)
  }
  const incidentCard =
    scenario === 'empty' ? (
      <div className="empty-state">
        <ShieldCheck size={26} />
        <strong>Este centro aún no tiene horario activo</strong>
        <span>La demo mostraría aquí la carga y validación de una plantilla.</span>
        <button onClick={() => setScenario('pending')}>Ver escenario con datos</button>
      </div>
    ) : (
      <div className={`incident-card ${approved ? 'approved' : ''}`}>
        <div className="incident-top">
          <span className="status-tag">{approved ? 'Aprobada' : 'Pendiente'}</span>
          <span>Actualizada hace 4 min</span>
        </div>
        <h3>Reunión de departamento desplazada</h3>
        <p>Lucía Martín · DOC-001 · Santa Rafaela</p>
        <div className="comparison">
          <div>
            <small>Planificado</small>
            <strong>12:00 – 13:00</strong>
            <span>Bolsa complementaria</span>
          </div>
          <div className="arrow">→</div>
          <div>
            <small>Registrado</small>
            <strong>12:15 – 13:15</strong>
            <span>60 min imputables</span>
          </div>
        </div>
        <div className="incident-foot">
          <span>
            <Info size={14} /> El sistema no rellena el hueco automáticamente.
          </span>
          {!approved && (
            <button onClick={onApprove}>
              <Check size={14} /> Aprobar imputación
            </button>
          )}
        </div>
      </div>
    )

  const centerSchedulePanel = (
    <section className="center-schedule-panel">
      <div className="schedule-panel-head schedule-panel-actions">
        <div className="schedule-tools">
          <button className="schedule-add" onClick={() => setScheduleCreateOpen((open) => !open)}>
            {scheduleCreateOpen ? 'Cerrar' : '+ Añadir bloque'}
          </button>
          <label className="schedule-filter">
            Ver horario de
            <select
              value={scheduleFilter}
              onChange={(event) => setScheduleFilter(event.target.value)}
            >
              <option value="all">Todo el centro</option>
              {scheduleTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="schedule-week-controls" role="tablist" aria-label="Día del horario">
        {days.map((day) => (
          <button
            key={day.id}
            className={scheduleDay === day.id ? 'active' : ''}
            onClick={() => setScheduleDay(day.id)}
            role="tab"
            aria-selected={scheduleDay === day.id}
          >
            {day.label}
          </button>
        ))}
        <label className="schedule-repeat-toggle">
          <input
            type="checkbox"
            checked={scheduleRepeats}
            onChange={(event) => setScheduleRepeats(event.target.checked)}
          />
          Repetir cada semana
        </label>
        <button className="schedule-copy-week" onClick={copyDayToWeek}>
          Copiar {days.find((day) => day.id === scheduleDay)?.label.toLowerCase()} al resto
        </button>
      </div>
      {scheduleOverlaps().length > 0 && (
        <div className="schedule-conflict-banner" role="alert">
          <strong>Hay solapes en {days.find((day) => day.id === scheduleDay)?.label}.</strong>{' '}
          {scheduleOverlaps().map((overlap) => `${overlap.teacher}: ${overlap.first} / ${overlap.second}`).join(' · ')}
        </div>
      )}
      <Dialog open={scheduleCreateOpen} onOpenChange={setScheduleCreateOpen}>
        <DialogContent className="schedule-dialog" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {editingScheduleId ? 'Editar bloque del horario' : 'Añadir bloque al horario'}
            </DialogTitle>
            <DialogDescription>
              Define la actividad y quedará colocada en el calendario del centro.
            </DialogDescription>
          </DialogHeader>
          <div className="schedule-create-context">
            <strong>Ubicación inicial</strong>
            <span>
              {scheduleTeachers.find((teacher) => teacher.id === scheduleCreateTeacher)?.name} ·{' '}
              {formatTime(scheduleCreateStart)}
            </span>
          </div>
          <div className="schedule-dialog-form">
            <label className="schedule-dialog-wide">
              Actividad
              <input
                value={scheduleCreateLabel}
                placeholder="Ej. Lengua Castellana · 1º ESO"
                onChange={(event) => setScheduleCreateLabel(event.target.value)}
              />
            </label>
            <label>
              Profesor
              <select
                value={scheduleCreateTeacher}
                onChange={(event) => setScheduleCreateTeacher(event.target.value)}
              >
                {scheduleTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Inicio
              <input
                type="time"
                min="08:00"
                max="20:30"
                step="1800"
                value={formatTime(scheduleCreateStart)}
                onChange={(event) => setScheduleCreateStart(parseTime(event.target.value))}
              />
            </label>
            <label>
              Duración
              <select
                value={scheduleCreateDuration}
                onChange={(event) => setScheduleCreateDuration(Number(event.target.value))}
              >
                {[30, 60, 90, 120].map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} min
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select
                value={scheduleCreateKind}
                onChange={(event) =>
                  setScheduleCreateKind(event.target.value as CenterScheduleBlock['kind'])
                }
              >
                <option value="lectiva">Clase lectiva</option>
                <option value="tutoria">Tutoría / atención a familias</option>
                <option value="guardia">Guardia / cobertura</option>
                <option value="reunion">Reunión / coordinación</option>
                <option value="preparacion">Preparación / evaluación</option>
                <option value="complementaria">Otra complementaria</option>
              </select>
            </label>
          </div>
          <DialogFooter className="schedule-dialog-footer">
            <DialogClose asChild>
              <button className="schedule-dialog-cancel">Cancelar</button>
            </DialogClose>
            <button
              className="schedule-create-submit"
              disabled={!scheduleCreateLabel.trim()}
              onClick={addCenterScheduleBlock}
            >
              {editingScheduleId ? 'Guardar cambios' : 'Añadir al horario'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {scheduleFilter !== 'all' && (
        <div className="schedule-tip">
          <button onClick={() => setScheduleFilter('all')}>Ver todo el centro</button>
        </div>
      )}
      {scheduleSelectedId &&
        (() => {
          const selectedBlock = scheduleBlocks.find((block) => block.id === scheduleSelectedId)
          const selectedTeacher = scheduleTeachers.find(
            (teacher) => teacher.id === selectedBlock?.teacherId,
          )
          if (!selectedBlock || !selectedTeacher) return null
          return (
            <Dialog open onOpenChange={(open) => !open && setScheduleSelectedId(null)}>
              <DialogContent className="schedule-dialog" showCloseButton>
                <DialogHeader>
                  <DialogTitle>{selectedBlock.label}</DialogTitle>
                  <DialogDescription>
                    {selectedTeacher.name} · {formatTime(selectedBlock.startMin)}–
                    {formatTime(selectedBlock.endMin)} · {selectedBlock.subject}
                  </DialogDescription>
                </DialogHeader>
                <div className="schedule-create-context">
                  <strong>Detalle del bloque</strong>
                  <span>{kindLabel(selectedBlock.kind)} · Horario general del centro</span>
                </div>
                <DialogFooter className="schedule-dialog-footer">
                  <button
                    className="schedule-dialog-cancel"
                    onClick={() => {
                      setScheduleSelectedId(null)
                      setScheduleFilter(selectedTeacher.id)
                    }}
                  >
                    Ver horario del profesor
                  </button>
                  <button
                    className="schedule-dialog-cancel"
                    onClick={() => editCenterScheduleBlock(selectedBlock)}
                  >
                    Editar bloque
                  </button>
                  <button
                    className="schedule-delete"
                    onClick={() => {
                      setScheduleBlocks((current) =>
                        current.filter((block) => block.id !== selectedBlock.id),
                      )
                      setScheduleSelectedId(null)
                    }}
                  >
                    Eliminar
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        })()}
      <div className="center-schedule" aria-label="Horario general del centro">
        <div
          className="center-schedule-head"
          style={{
            gridTemplateColumns: `64px repeat(${visibleScheduleTeachers.length}, minmax(180px, 1fr))`,
          }}
        >
          <span>Hora</span>
          {visibleScheduleTeachers.map((teacher) => (
            <div key={teacher.id} className="schedule-teacher-head">
              <span className={`schedule-avatar ${teacher.color}`}>{teacher.initials}</span>
              <span>
                <strong>{teacher.name}</strong>
                <small>{teacher.detail.split(' · ')[0]}</small>
                <em>
                  Hoy {scheduledHoursFor(teacher.id)} · Semana{' '}
                  {teacher.detail.match(/\d+/g)?.slice(-1)[0] ?? '—'} h lectivas
                </em>
                <small className="schedule-workload">
                  {(() => {
                    const buckets = weeklyBucketsFor(teacher.id)
                    const target = Number(teacher.detail.match(/\d+/g)?.slice(-1)[0] ?? 0) * 60
                    return `${Math.max(0, target - buckets.lectiva) / 60} h lectivas pendientes · ${Math.round(buckets.complementaria / 60 * 10) / 10} h bolsa`
                  })()}
                </small>
              </span>
            </div>
          ))}
        </div>
        <div
          className="center-schedule-body"
          style={{
            gridTemplateColumns: `64px repeat(${visibleScheduleTeachers.length}, minmax(180px, 1fr))`,
          }}
        >
          {nowMinutes >= 480 && nowMinutes <= 1260 && (
            <div
              className="current-time-line manager-current-time-line"
              style={{ top: `${((nowMinutes - 480) / 30) * 50}px` }}
            >
              <span>{formatTime(nowMinutes)}</span>
              <i />
            </div>
          )}
          <div className="schedule-time-column">
            {scheduleHours.map((minute) => (
              <span key={minute} style={{ top: `${((minute - 480) / 30) * 50}px` }}>
                {formatTime(minute)}
              </span>
            ))}
          </div>
          {visibleScheduleTeachers.map((teacher) => (
            <div
              className="center-schedule-column"
              key={teacher.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => moveCenterScheduleBlock(event, teacher.id, 480)}
            >
              {Array.from({ length: 14 }, (_, index) => {
                const minute = 480 + index * 30
                return (
                  <button
                    className="schedule-slot"
                    key={minute}
                    type="button"
                    style={{ top: `${index * 50}px` }}
                    aria-label={`Añadir bloque a las ${formatTime(minute)} con ${teacher.name}`}
                    onClick={() => openScheduleCreate(teacher.id, minute)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      previewCenterScheduleDrop(teacher.id, minute)
                    }}
                    onDrop={(event) => {
                      event.stopPropagation()
                      moveCenterScheduleBlock(event, teacher.id, minute)
                    }}
                  />
                )
              })}
              {scheduleDropPreview?.teacherId === teacher.id && (
                <div
                  className="center-schedule-preview"
                  style={{
                    top: `${((scheduleDropPreview.startMin - 480) / 30) * 50 + 3}px`,
                    height: `${((scheduleDropPreview.endMin - scheduleDropPreview.startMin) / 30) * 50 - 6}px`,
                  }}
                >
                  Soltar aquí · {formatTime(scheduleDropPreview.startMin)}–
                  {formatTime(scheduleDropPreview.endMin)}
                </div>
              )}
              {scheduleBlocks
                .filter(
                  (block) => block.teacherId === teacher.id && (block.day ?? 1) === scheduleDay,
                )
                .map((block) => (
                  <button
                    className={`center-schedule-block ${block.kind} ${scheduleDragId === block.id ? 'dragging' : ''}`}
                    draggable
                    key={block.id}
                    onClick={() => {
                      if (Date.now() < scheduleSuppressClickUntil.current || scheduleDragMoved.current) {
                        scheduleDragMoved.current = false
                        return
                      }
                      setScheduleSelectedId(block.id)
                    }}
                    onDragEnd={() => {
                      scheduleDragMoved.current = true
                      scheduleSuppressClickUntil.current = Date.now() + 1500
                      setScheduleDragId(null)
                      setScheduleDropPreview(null)
                      window.setTimeout(() => {
                        scheduleDragMoved.current = false
                      }, 1000)
                    }}
                    onDragStart={(event) => {
                      scheduleDragMoved.current = true
                      scheduleSuppressClickUntil.current = Date.now() + 1500
                      setScheduleDragId(block.id)
                      setScheduleDropPreview(null)
                      event.dataTransfer.setData('center-schedule-block', block.id)
                    }}
                    onDragOver={() => {
                      scheduleDragMoved.current = true
                    }}
                    style={{
                      top: `${((block.startMin - 480) / 30) * 50 + 3}px`,
                      height: `${((block.endMin - block.startMin) / 30) * 50 - 6}px`,
                    }}
                    type="button"
                  >
                    <strong>{block.label}</strong>
                    <small>{block.subject} · {scheduleRepeats ? 'Cada semana' : 'Solo esta semana'}</small>
                    <em>
                      {formatTime(block.startMin)}–{formatTime(block.endMin)}
                    </em>
                    <span
                      className="schedule-resize-handle"
                      aria-label={`Cambiar duración de ${block.label}`}
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => resizeCenterScheduleBlock(event, block)}
                    />
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const staffPanel = (
    <section className="staff-panel">
      <div className="staff-panel-head">
        <div>
          <h2>Profesores</h2>
          <p className="calendar-hint">Carga semanal y estado de fichaje del equipo.</p>
        </div>
      </div>
      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Profesor</th>
              <th>Horas esta semana</th>
              <th>Estado ahora</th>
              <th>Desde</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>
                  <div className="staff-person">
                    <span className="staff-avatar">{teacher.initials}</span>
                    <span>
                      <strong>{teacher.name}</strong>
                      <small>{teacher.detail}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <strong>{teacher.detail.match(/\d+/g)?.slice(-1)[0] ?? '—'} h</strong>
                </td>
                <td>
                  <span
                    className={`attendance-status ${teacher.id === 'diego' ? 'pause' : teacher.id === 'ines' ? 'pending' : ''}`}
                  >
                    <i />
                    {teacher.id === 'diego'
                      ? 'En pausa'
                      : teacher.id === 'ines'
                        ? 'Pendiente de fichar'
                        : 'En clase'}
                  </span>
                </td>
                <td className="staff-time">
                  {teacher.id === 'ines' ? '—' : teacher.id === 'diego' ? '08:05' : '08:24'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const templatesPanel = (
    <section className="templates-panel">
      <div className="staff-panel-head">
        <div>
          <h2>Patrones opcionales</h2>
          <p className="calendar-hint">
            Guarda un horario base para reutilizarlo cuando varios profesores compartan la misma
            jornada.
          </p>
        </div>
        <button className="template-action" onClick={() => setNewTemplateOpen((open) => !open)}>
          {newTemplateOpen ? 'Cerrar' : '+ Nueva plantilla'}
        </button>
      </div>
      {newTemplateOpen && (
        <div className="template-create">
          <label>
            Nombre de la plantilla
            <input
              value={newTemplateName}
              placeholder="Ej. 4º ESO · Mañana"
              onChange={(event) => setNewTemplateName(event.target.value)}
            />
          </label>
          <button
            className="primary-action"
            disabled={!newTemplateName.trim()}
            onClick={() => {
              setNewTemplateCreated(true)
              setCreatedTemplateName(newTemplateName.trim())
              setNewTemplateOpen(false)
              setNewTemplateName('')
            }}
          >
            Crear plantilla
          </button>
        </div>
      )}
      {newTemplateCreated && (
        <div className="template-success">
          Plantilla creada. Ya puedes asignarla desde la página de Profesores.
        </div>
      )}
      <div className="template-list">
        {createdTemplateName && (
          <article className="template-item active">
            <div className="template-item-icon">N</div>
            <div>
              <div className="template-item-title">
                <strong>{createdTemplateName}</strong>
                <span className="status-tag draft">Borrador</span>
              </div>
              <p>Sin horario definido · Sin profesores asignados</p>
            </div>
            <button onClick={() => setActiveTab('teachers')}>Asignar</button>
          </article>
        )}
        <article className="template-item active">
          <div className="template-item-icon">3º</div>
          <div>
            <div className="template-item-title">
              <strong>3º ESO · Mañana</strong>
              <span className="status-tag">{templateActive ? 'Activa' : 'Borrador'}</span>
            </div>
            <p>08:30–14:30 · 21 bloques · 2 profesores asignados</p>
          </div>
          <button onClick={() => setActiveTab('teachers')}>Asignar</button>
        </article>
        <article className="template-item">
          <div className="template-item-icon muted">T</div>
          <div>
            <div className="template-item-title">
              <strong>Turno de tarde</strong>
              <span className="status-tag draft">Borrador</span>
            </div>
            <p>16:00–21:00 · 15 bloques · Sin profesores asignados</p>
          </div>
          <button onClick={() => setTemplateActive(true)}>Activar</button>
        </article>
      </div>
      <div className="template-guide">
        <ShieldCheck size={17} />
        <div>
          <strong>La forma más sencilla</strong>
          <p>
            Plantilla para lo común; edición individual sólo cuando un profesor tenga una excepción.
          </p>
        </div>
      </div>
    </section>
  )

  const activityList = (
    <div className="activity-list">
      <div>
        <span className="activity-dot green" />
        <strong>Santa Rafaela</strong>
        <span>32 personas fichadas · 2 incidencias</span>
        <b>En curso</b>
      </div>
      <div>
        <span className="activity-dot orange" />
        <strong>San José</strong>
        <span>28 personas fichadas · 1 incidencia</span>
        <b>Revisar</b>
      </div>
      <div>
        <span className="activity-dot gray" />
        <strong>Centro piloto norte</strong>
        <span>Horario pendiente de validar</span>
        <b>Preparación</b>
      </div>
    </div>
  )

  const pageCopy = {
    schedule: ['Horario general', 'Organiza todo el centro desde un único calendario.'],
    overview: [
      'Resumen del centro',
      'Revisa lo importante de hoy y actúa sólo sobre las excepciones.',
    ],
    teachers: ['Profesores', 'Asigna horarios y consulta el detalle de cada persona.'],
    templates: ['Plantillas', 'Crea horarios base para reutilizarlos cuando encajen.'],
    incidents: ['Revisiones', 'Valida las diferencias entre lo planificado y lo registrado.'],
  }[activeTab]

  return (
    <div className="manager-page">
      <div className="hero-row">
        <div>
          <h1>{pageCopy[0]}</h1>
          <p className="hero-subtitle">{pageCopy[1]}</p>
        </div>
      </div>
      {activeTab === 'schedule' && <div className="manager-tab-content">{centerSchedulePanel}</div>}
      {activeTab === 'overview' && (
        <div className="manager-overview">
          <div className="manager-kpis">
            <button className="manager-kpi" onClick={() => setActiveTab('incidents')}>
              <span>Revisiones pendientes</span>
              <strong>{pending ? '1' : '0'}</strong>
              <small>{pending ? 'Requiere tu aprobación' : 'Todo al día'}</small>
            </button>
            <button className="manager-kpi" onClick={() => setActiveTab('teachers')}>
              <span>Equipo fichado hoy</span>
              <strong>
                86 <small>/ 94</small>
              </strong>
              <small>91% del equipo del centro</small>
            </button>
          </div>
          <div className="manager-overview-grid">
            <section className="manager-main">
              <div className="section-heading">
                <div>
                  <h2>Revisa esta incidencia</h2>
                  <p className="calendar-hint">
                    Sólo necesitas intervenir cuando hay una diferencia.
                  </p>
                </div>
                <span className="count-pill">{pending ? '1 pendiente' : 'Todo al día'}</span>
              </div>
              {incidentCard}
            </section>
          </div>
        </div>
      )}
      {activeTab === 'teachers' && (
        <div className="manager-tab-content">
          {staffPanel}
        </div>
      )}
      {activeTab === 'templates' && <div className="manager-tab-content">{templatesPanel}</div>}
      {activeTab === 'incidents' && (
        <div className="manager-grid manager-tab-content">
          <section className="manager-main">
            <div className="section-heading">
              <div>
                <h2>Incidencias para revisar</h2>
                <p className="calendar-hint">Un cambio siempre conserva motivo y trazabilidad.</p>
              </div>
              <span className="count-pill">{pending ? '1 pendiente' : 'Todo al día'}</span>
            </div>
            {incidentCard}
            <div className="section-heading lower-heading">
              <div>
                <h2>Actividad reciente</h2>
                <p className="calendar-hint">Resumen de los centros piloto</p>
              </div>
              <select
                className="scenario-select"
                value={scenario}
                onChange={(event) => setScenario(event.target.value)}
              >
                <option value="pending">Escenario: incidencia pendiente</option>
                <option value="empty">Escenario: sin horario activo</option>
              </select>
            </div>
            {activityList}
          </section>
          <aside className="manager-side">
            <div className="side-kpi">
              <span>Personas fichadas hoy</span>
              <strong>
                86 <small>/ 94</small>
              </strong>
              <div className="progress">
                <i style={{ width: '91%' }} />
              </div>
              <small>91% del equipo piloto</small>
            </div>
            <div className="side-kpi">
              <span>Horas imputadas</span>
              <strong>
                1.248 <small>min</small>
              </strong>
              <small>Lectivas y complementarias</small>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const mins = (minutes % 60).toString().padStart(2, '0')
  return `${hours}:${mins}`
}

function parseTime(value: string) {
  const [hours = 8, minutes = 0] = value.split(':').map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : 480
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function layoutOverlaps(items: Block[]) {
  const sorted = [...items].sort((a, b) => a.startMin - b.startMin)
  const columns: Block[][] = []
  const placements = new Map<string, { column: number; columns: number }>()
  sorted.forEach((block) => {
    let column = columns.findIndex((placed) =>
      placed.every((other) => other.endMin <= block.startMin || other.startMin >= block.endMin),
    )
    if (column === -1) {
      column = columns.length
      columns.push([])
    }
    ;(columns[column] ??= []).push(block)
    const overlapping = items.filter(
      (other) =>
        other.id !== block.id && other.startMin < block.endMin && other.endMin > block.startMin,
    ).length
    placements.set(block.id, { column, columns: overlapping + 1 })
  })
  return items.map((block) => ({
    block,
    ...(placements.get(block.id) ?? { column: 0, columns: 1 }),
  }))
}

function kindLabel(kind: Block['kind'] | CenterScheduleBlock['kind']) {
  return {
    lectiva: 'Lectiva',
    complementaria: 'Complementaria',
    bolsa: 'Bolsa complementaria',
    hueco: 'Hueco',
    tutoria: 'Tutoría / atención a familias',
    guardia: 'Guardia / cobertura',
    reunion: 'Reunión / coordinación',
    preparacion: 'Preparación / evaluación',
  }[kind]
}

function roleLabel(role: DemoUser['role']) {
  return role === 'docente' ? 'Docente' : role === 'director' ? 'Director/a' : 'Sede'
}
