'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export default function ScheduleLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <header className="border-b bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Escala do Chat</h1>
                    <ThemeToggle />
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
