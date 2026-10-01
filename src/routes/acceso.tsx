import { createFileRoute } from '@tanstack/react-router'
import { DemoLogin, resetDemoData } from './index'

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
      onReset={resetDemoData}
    />
  )
}
