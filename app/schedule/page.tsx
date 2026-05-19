'use client'

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Users, Monitor, Clock, Building, Calendar as CalendarIcon } from 'lucide-react'
import { useScheduleRealtime } from '@/hooks/useScheduleRealtime'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface Assignment {
    id: string
    date: string
    notes: string
    expand: {
        collaborator: Array<{ id: string; name: string }>
        platform: Array<{ id: string; name: string }>
        shift: Array<{ id: string; name: string }>
        company: Array<{ id: string; name: string; exp: number }>
    }
}

export default function SchedulePage() {
    return (
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando...</div>}>
            <SchedulePageContent />
        </Suspense>
    )
}

function SchedulePageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    useEffect(() => {
        const dateParam = searchParams.get('date')
        if (dateParam) {
            try {
                const parsed = parse(dateParam, 'yyyy-MM-dd', new Date())
                setSelectedDate(parsed)
            } catch {
                setSelectedDate(new Date())
            }
        } else {
            setSelectedDate(new Date())
        }
    }, [searchParams])

    const today = selectedDate || new Date()
    const dateStr = useMemo(() => format(today, 'yyyy-MM-dd'), [selectedDate])
    useScheduleRealtime(dateStr)

    const updateDate = (newDate: Date) => {
        setSelectedDate(newDate)
        const dateStr = format(newDate, 'yyyy-MM-dd')
        router.push(`/schedule?date=${dateStr}`)
    }

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(
                `https://pocketbase.falevox.com.br/api/collections/daily_assignments/records?expand=collaborator,platform,shift,company&filter=(date~'${dateStr}')`,
                { cache: 'no-store' }
            )
            if (!response.ok) throw new Error('Erro ao carregar')
            const data = await response.json()
            setAssignments(data.items || [])
        } catch (error) {
            console.error('Erro:', error)
            setAssignments([])
        } finally {
            setLoading(false)
        }
    }, [dateStr])

    useEffect(() => {
        fetchSchedule()
    }, [fetchSchedule])

    useEffect(() => {
        const handleUpdate = () => {
            fetchSchedule()
        }
        window.addEventListener('schedule-update', handleUpdate)
        return () => window.removeEventListener('schedule-update', handleUpdate)
    }, [fetchSchedule])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold capitalize">
                        {format(today, 'EEEE', { locale: ptBR })}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const prev = new Date(today)
                            prev.setDate(prev.getDate() - 1)
                            updateDate(prev)
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" title="Calendário">
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" side="bottom">
                            <Calendar
                                mode="single"
                                selected={today}
                                onSelect={(date) => {
                                    if (date) {
                                        updateDate(date)
                                    }
                                }}
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const next = new Date(today)
                            next.setDate(next.getDate() + 1)
                            updateDate(next)
                        }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-muted-foreground">Carregando...</div>
            ) : assignments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Nenhuma atribuição para este dia</div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <div key={assignment.id} className="rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 bg-gradient-to-br from-white via-gray-50/40 to-white dark:from-neutral-950 dark:via-neutral-900/40 dark:to-neutral-950 hover:shadow transition-all">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Users className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Colaborador</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {assignment.expand?.collaborator?.map((c) => (
                                            <Badge key={c.id} variant="secondary" className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300">
                                                {c.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Monitor className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Plataforma</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {assignment.expand?.platform?.map((p) => (
                                            <Badge key={p.id} variant="secondary" className="bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300">
                                                {p.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Turno</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {assignment.expand?.shift?.map((s) => (
                                            <Badge key={s.id} variant="secondary" className="bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300">
                                                {s.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Building className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                                        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Empresa</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {assignment.expand?.company?.map((c) => (
                                            <Badge key={c.id} variant="secondary" className="bg-orange-500/20 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300 h-auto py-1 rounded-lg text-center">
                                                {c.name}
                                                <br />
                                                {c.exp}h
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {assignment.notes && (
                                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-2">Notas</p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{assignment.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
