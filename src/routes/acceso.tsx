import { createFileRoute } from '@tanstack/react-router'
import { DemoLogin } from './index'

const demoKeys = [
  'spinola-demo-user',
  'spinola-demo-started',
  'spinola-demo-started-at',
  'spinola-demo-ended-at',
  'spinola-demo-attendance-saved',
  'spinola-demo-correction-requested',
  'spinola-demo-approved',
  'spinola-demo-blocks',
  'spinola-demo-completed',
]

export const Route = createFileRoute('/acceso')({
  component: AccessPage,
})

function AccessPage() {
  return (
    <DemoLogin
      onSelect={(id) => {
        localStorage.setItem('spinola-demo-user', id)
        window.dispatchEvent(new Event('spinola-demo-login'))
      }}
      onReset={() => {
        demoKeys.forEach((key) => localStorage.removeItem(key))
        window.location.reload()
      }}
    />
  )
}
