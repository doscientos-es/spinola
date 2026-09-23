import { createFileRoute } from '@tanstack/react-router'
import { SpinolaHome } from './index'

export const Route = createFileRoute('/configuracion')({
  component: () => <SpinolaHome initialManagerTab="settings" />,
})
