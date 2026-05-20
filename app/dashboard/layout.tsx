import { DashboardLayoutClient } from './dashboard-layout'

export const metadata = {
    title: "Dashboard",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
