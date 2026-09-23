import { createFileRoute } from '@tanstack/react-router'

import { SpinolaHome } from '@/routes/index'
export const Route = createFileRoute('/profesores')({
  component: () => <SpinolaHome initialManagerTab="teachers" />,
})
