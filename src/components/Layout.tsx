import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { WhatsAppSimulator } from '@/components/WhatsAppSimulator'
import { DataBackup } from '@/components/DataBackup'
import { LayoutDashboard, Users, Receipt, Calculator, HeartHandshake } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Participantes', path: '/participantes', icon: Users },
    { name: 'Despesas', path: '/despesas', icon: Receipt },
    { name: 'Cálculo de Rateio', path: '/rateio', icon: Calculator },
    { name: 'Doações', path: '/doacoes', icon: HeartHandshake },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                R
              </div>
              RateioApp
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path} className={cn('gap-3', isActive && 'font-semibold')}>
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold capitalize text-slate-800">
                {navItems.find((i) => i.path === location.pathname)?.name || 'Detalhes'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DataBackup />
              <WhatsAppSimulator />
            </div>
          </header>

          <div className="p-6 md:p-8 flex-1 overflow-auto animate-fade-in">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
