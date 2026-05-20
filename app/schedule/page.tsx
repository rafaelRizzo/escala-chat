'use client'

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Users, Monitor, Clock, Building, ChevronDown } from 'lucide-react'
import { useScheduleRealtime } from '@/hooks/useScheduleRealtime'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

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

    const getCollaboratorPlatforms = (collaboratorId: string, date: string) => {
        const platforms = new Set<string>()
        assignments.forEach(a => {
            if (a.date === date && a.expand?.collaborator?.some(c => c.id === collaboratorId)) {
                a.expand?.platform?.forEach(p => platforms.add(p.id))
            }
        })
        return platforms.size
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold capitalize">
                        {format(today, 'EEEE', { locale: ptBR })}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="hidden md:flex gap-2 items-center">
                    <Button
                        variant="outline"
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
                            <Button
                                variant="outline"
                                className="w-53 justify-between text-left font-normal"
                            >
                                {format(today, "PPP", { locale: ptBR })}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
            <div className="flex md:hidden gap-2 items-center justify-center w-full">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        const prev = new Date(today)
                        prev.setDate(prev.getDate() - 1)
                        updateDate(prev)
                    }}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        const next = new Date(today)
                        next.setDate(next.getDate() + 1)
                        updateDate(next)
                    }}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full md:hidden justify-between text-left font-normal"
                    >
                        {format(today, "PPP", { locale: ptBR })}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="center" side="bottom">
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

            {loading ? (
                <div className="py-12 text-center text-muted-foreground">Carregando...</div>
            ) : assignments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Nenhuma atribuição para este dia</div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                                delay: index * 0.1
                            }}
                        >
                            <Card className='p-6 bg-linear-to-br from-neutral-50 via-neutral-50/5 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900/5 dark:to-neutral-950 hover:shadow transition-shadow'>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <Users className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500" />
                                            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Colaborador</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.expand?.collaborator?.map((c) => (
                                                <div key={c.id} className="relative">
                                                    <Badge className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 truncate">
                                                        {c.name}
                                                    </Badge>
                                                    <Badge variant={"outline"} className="absolute -top-1 -right-2 w-4 h-4 p-0 flex items-center justify-center text-[10px] font-semibold bg-blue-200 text-blue-600 border-white font-mono dark:bg-blue-600 dark:border-blue-950 dark:text-blue-200">
                                                        {getCollaboratorPlatforms(c.id, assignment.date)}
                                                    </Badge>
                                                </div>
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
                                {
                                    assignment.notes && (
                                        <div>
                                            <Separator className="my-4" />
                                            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-2">Notas</p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{assignment.notes}</p>
                                        </div>
                                    )
                                }
                            </Card>

                        </motion.div>
                    ))}
                </div>
            )
            }
        </div >
    )
}
