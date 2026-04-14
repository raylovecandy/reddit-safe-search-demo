import { NavLink } from 'react-router-dom'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-full px-3 py-1 text-sm font-semibold transition',
          isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-orange-600" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold">Reddit Search</div>
              <div className="text-xs text-slate-500">Safe Search demo</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <NavItem to="/" label="Search" />
            <NavItem to="/settings" label="Settings" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}

