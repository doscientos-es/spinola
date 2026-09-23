import { createFileRoute } from '@tanstack/react-router'

import { SpinolaHome } from '@/routes/index'
export const Route = createFileRoute('/revisiones')({
  component: () => <SpinolaHome initialManagerTab="incidents" />,
})
