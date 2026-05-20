'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Users, Building, Calendar, Package, Clock, LogOut, CalendarDays, Moon, Sun } from 'lucide-react'
import { useThemeToggle } from '@/components/mode-toggle'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarProvider,
    SidebarTrigger,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
} from '@/components/ui/sidebar'

const MENU_ITEMS = [
    { href: '/dashboard/daily_assignments', label: 'Atribuições Diárias', icon: Calendar },
    { href: '/dashboard/collaborators', label: 'Colaboradores', icon: Users },
    { href: '/dashboard/companies', label: 'Empresas', icon: Building },
    { href: '/dashboard/plataforms', label: 'Plataformas', icon: Package },
    { href: '/dashboard/shifts', label: 'Turnos', icon: Clock },
]

export function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { mounted, isDark, toggleTheme } = useThemeToggle()

    const handleLogout = () => {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        router.push('/')
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="p-4">
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <CalendarDays size={20} />
                        Escalas Chat
                    </h1>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link href={item.href}>
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={toggleTheme} disabled={!mounted}>
                                <Moon className="h-4 w-4" />
                                <span>{mounted ? (isDark ? 'Tema Claro' : 'Tema Escuro') : 'Tema'}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                                <span>Deslogar</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 items-center gap-4 border-b px-6">
                    <SidebarTrigger size="sm" />
                </header>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
