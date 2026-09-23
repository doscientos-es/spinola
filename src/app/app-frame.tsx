import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  Button,
  DropdownMenu,
  DropdownMenuItem,
} from '@doscientos/ui'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import Avatar from 'boring-avatars'
import {
  CalendarDays,
  Clock3,
  FileText,
  FolderKanban,
  Gauge,
  LogOut,
  MoreHorizontal,
  Menu as MenuIcon,
  Settings2,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

export function AppFrame({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('spinola-demo-user')))
  const [profile, setProfile] = useState(() =>
    profileFor(localStorage.getItem('spinola-demo-user')),
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [managerTab, setManagerTab] = useState('schedule')
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const routeTab = {
      '/resumen': 'overview',
      '/horario': 'schedule',
      '/profesores': 'teachers',
      '/revisiones': 'incidents',
    }[location.pathname]
    if (routeTab) setManagerTab(routeTab)
  }, [location.pathname])
  useEffect(() => {
    const sync = () => {
      setLoggedIn(Boolean(localStorage.getItem('spinola-demo-user')))
      setProfile(profileFor(localStorage.getItem('spinola-demo-user')))
    }
    window.addEventListener('spinola-demo-login', sync)
    const onManagerTab = (event: Event) => {
      const tab = (event as CustomEvent<string>).detail
      if (tab) setManagerTab(tab)
      setMobileOpen(false)
    }
    window.addEventListener('spinola-manager-tab', onManagerTab)
    return () => {
      window.removeEventListener('spinola-demo-login', sync)
      window.removeEventListener('spinola-manager-tab', onManagerTab)
    }
  }, [])
  if (!loggedIn) return <main className="login-shell">{children}</main>
  return (
    <AppShell className="flex min-h-svh">
      <AppShellSidebar
        className={`app-sidebar h-svh self-start border-r-0 bg-[#f4f5f3] p-5 ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="mb-10 px-2">
          <Link to="." className="brand-lockup" aria-label="Spínola">
            <img src="/brand/spinola-logo.png" alt="Fundación Spínola" className="brand-logo" />
          </Link>
        </div>
        <nav aria-label="Principal" className="space-y-0.5">
          {profile.role === 'Director/a' ? (
            <>
              <SidebarItem
                label="Resumen"
                icon={Gauge}
                active={managerTab === 'overview'}
                onClick={() => selectManagerTab('overview')}
              />
              <SidebarItem
                label="Horario general"
                icon={CalendarDays}
                active={managerTab === 'schedule'}
                onClick={() => selectManagerTab('schedule')}
              />
            </>
          ) : (
            <>
              <Link
                to="."
                activeProps={{ className: 'bg-muted text-foreground' }}
                className="nav-item text-muted-foreground hover:bg-muted block rounded-md px-3 py-2 text-sm"
              >
                <Clock3 className="nav-icon" /> Fichar jornada
              </Link>
              <SidebarItem label="Mi calendario" icon={CalendarDays} />
              <SidebarItem label="Mis documentos" icon={FileText} />
            </>
          )}
        </nav>
        {profile.role === 'Director/a' ? (
          <nav aria-label="Dirección" className="mt-7 space-y-0.5">
            <SidebarItem
              label="Profesores"
              icon={UsersRound}
              active={managerTab === 'teachers'}
              onClick={() => selectManagerTab('teachers')}
            />
            <SidebarItem
              label="Revisiones"
              icon={FileText}
              active={managerTab === 'incidents'}
              onClick={() => selectManagerTab('incidents')}
            />
            <SidebarItem label="Informes" icon={FolderKanban} disabled />
            <SidebarItem label="Configuración" icon={Settings2} disabled />
          </nav>
        ) : (
          <>
            <nav aria-label="Centro de trabajo" className="mt-7 space-y-0.5">
              <SidebarItem label="Equipo y horarios" icon={UsersRound} />
              <SidebarItem label="Ausencias" icon={CalendarDays} />
              <SidebarItem label="Comunicaciones" icon={FileText} />
              <SidebarItem label="Firmas pendientes" icon={FolderKanban} />
            </nav>
            <nav aria-label="Fundación" className="mt-7 space-y-0.5">
              <SidebarItem label="Vista global" icon={Gauge} />
              <SidebarItem label="Informes" icon={FolderKanban} />
              <SidebarItem label="Configuración" icon={Settings2} />
            </nav>
          </>
        )}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              className="sidebar-footer sidebar-profile-trigger"
              aria-label="Abrir menú de usuario"
            >
              <Avatar
                size={30}
                name={profile.name}
                variant="beam"
                colors={['#f4c7b8', '#b9d9c2', '#e6c46c', '#9fb9d8', '#e8a7b9']}
              />
              <span className="sidebar-profile-copy">
                <strong>{profile.name}</strong>
                <small>
                  {profile.role} · {profile.centre}
                </small>
              </span>
              <MoreHorizontal size={16} />
            </Button>
          }
          placement="top end"
          offset={8}
          className="profile-menu-popover"
        >
          <DropdownMenuItem
            id="logout"
            onAction={() => {
              localStorage.removeItem('spinola-demo-user')
              window.location.reload()
            }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenu>
      </AppShellSidebar>
      {mobileOpen && (
        <button
          className="mobile-sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <AppShellMain className="app-main h-svh min-w-0 flex-1 overflow-hidden">
        <AppShellHeader className="app-header flex h-11 items-center justify-between">
          <button
            className="mobile-menu-trigger"
            aria-label="Abrir navegación"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon size={18} />
          </button>
          <span className="text-sm font-medium">
            {profile.role === 'Director/a' ? 'Resumen' : 'Mi jornada'}
          </span>
          <span className="mobile-header-spacer" />
        </AppShellHeader>
        <AppShellContent className="app-content h-[calc(100svh-2.75rem)] overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-6">{children}</div>
        </AppShellContent>
      </AppShellMain>
    </AppShell>
  )

  function selectManagerTab(tab: string) {
    setManagerTab(tab)
    const route = {
      overview: '/resumen',
      schedule: '/horario',
      teachers: '/profesores',
      incidents: '/revisiones',
    }[tab]
    if (route) void navigate({ to: route })
    window.dispatchEvent(new CustomEvent('spinola-manager-tab', { detail: tab }))
  }
}

function profileFor(id: string | null) {
  if (id === 'carlos')
    return { initials: 'CO', name: 'Carlos Ortega', role: 'Director/a', centre: 'Santa Rafaela' }
  if (id === 'marta')
    return { initials: 'MG', name: 'Marta Gil', role: 'Sede', centre: 'Fundación' }
  return { initials: 'LM', name: 'Lucía Martín', role: 'Docente', centre: 'Santa Rafaela' }
}

function SidebarItem({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string
  icon: typeof Clock3
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={`sidebar-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="nav-icon muted" />
      {label}
    </button>
  )
}
