'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApi } from '@/hooks/useApi'
import { formatErrorToast } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Calendar, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { ChipsSelector } from '@/components/ui/chips-selector'
import { format, parse } from 'date-fns'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface DailyAssignment {
    id: string
    date: string
    collaborator: string[]
    platform: string[]
    shift: string[]
    company: string[]
    notes: string
    created: string
    expand?: {
        collaborator?: Array<{ id: string; name: string }>
        platform?: Array<{ id: string; name: string }>
        shift?: Array<{ id: string; name: string }>
        company?: Array<{ id: string; name: string; exp: number }>
    }
}

interface DailyAssignmentsResponse {
    items: DailyAssignment[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

interface SelectOption {
    id: string
    name: string
}

function CreateDailyAssignmentDialog({
    onSuccess,
    initialValues,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    onSuccess: (page: number) => void
    initialValues?: {
        date?: Date
        collaborators?: string[]
        platforms?: string[]
        shifts?: string[]
        companies?: string[]
    }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ notes: string }>()
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = (value: boolean) => {
        if (controlledOnOpenChange) controlledOnOpenChange(value)
        else setInternalOpen(value)
    }
    const [submitting, setSubmitting] = useState(false)
    const [date, setDate] = useState<Date | undefined>(initialValues?.date)
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(initialValues?.collaborators || [])
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initialValues?.platforms || [])
    const [selectedShifts, setSelectedShifts] = useState<string[]>(initialValues?.shifts || [])
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(initialValues?.companies || [])
    const [collaborators, setCollaborators] = useState<SelectOption[]>([])
    const [platforms, setPlatforms] = useState<SelectOption[]>([])
    const [shifts, setShifts] = useState<SelectOption[]>([])
    const [companies, setCompanies] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState(true)
    const [datePopoverOpen, setDatePopoverOpen] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (initialValues) {
            setDate(initialValues.date)
            setSelectedCollaborators(initialValues.collaborators || [])
            setSelectedPlatforms(initialValues.platforms || [])
            setSelectedShifts(initialValues.shifts || [])
            setSelectedCompanies(initialValues.companies || [])
        }
    }, [initialValues])

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [collabRes, platRes, shiftRes, compRes] = await Promise.all([
                    api.get('/collections/collaborators/records'),
                    api.get('/collections/platforms/records'),
                    api.get('/collections/shifts/records'),
                    api.get('/collections/companies/records'),
                ])
                setCollaborators(collabRes.data.items || [])
                setPlatforms(platRes.data.items || [])
                setShifts(shiftRes.data.items || [])
                setCompanies(compRes.data.items || [])
            } catch (error) {
                toast.error(formatErrorToast(error))
            } finally {
                setLoading(false)
            }
        }
        if (open) loadOptions()
    }, [open])

    const onSubmit = async (data: { notes: string }) => {
        const errs: Record<string, string> = {}
        if (!date) errs.date = 'Data obrigatória'
        if (selectedCollaborators.length === 0) errs.collaborators = 'Selecione ao menos um colaborador'
        if (selectedPlatforms.length === 0) errs.platforms = 'Selecione ao menos uma plataforma'
        if (selectedShifts.length === 0) errs.shifts = 'Selecione ao menos um turno'
        if (selectedCompanies.length === 0) errs.companies = 'Selecione ao menos uma empresa'
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }
        setFieldErrors({})
        try {
            setSubmitting(true)
            if (!date) {
                setFieldErrors({ date: 'Data obrigatória' })
                return
            }
            await api.post('/collections/daily_assignments/records', {
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
                collaborator: selectedCollaborators,
                platform: selectedPlatforms,
                shift: selectedShifts,
                company: selectedCompanies,
                notes: data.notes || '',
            })
            toast.success('Atribuição diária criada com sucesso')
            reset()
            setDate(undefined)
            setSelectedCollaborators([])
            setSelectedPlatforms([])
            setSelectedShifts([])
            setSelectedCompanies([])
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            toast.error(formatErrorToast(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4" />
                    Criar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max:h-full overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar atribuição diária</DialogTitle>
                    <DialogDescription>Preencha os dados para criar uma nova atribuição</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh]">
                    <div>
                        <label className="block text-sm font-medium mb-1">Data</label>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        if (selectedDate) {
                                            setDate(selectedDate)
                                        }
                                        setDatePopoverOpen(false)
                                    }}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                        {fieldErrors.date && <p className="text-sm text-red-500 mt-1">{fieldErrors.date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Colaboradores</label>
                        <ChipsSelector
                            options={collaborators}
                            selected={selectedCollaborators}
                            onSelect={(id) => {
                                setSelectedCollaborators([...selectedCollaborators, id])
                                setFieldErrors(prev => ({ ...prev, collaborators: '' }))
                            }}
                            onRemove={(id) => setSelectedCollaborators(selectedCollaborators.filter(c => c !== id))}
                            placeholder="Selecionar colaboradores..."
                            color="blue"
                        />
                        {!loading && collaborators.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhum colaborador cadastrado</p>
                        )}
                        {fieldErrors.collaborators && <p className="text-sm text-red-500 mt-1">{fieldErrors.collaborators}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Plataformas</label>
                        <ChipsSelector
                            options={platforms}
                            selected={selectedPlatforms}
                            onSelect={(id) => {
                                setSelectedPlatforms([...selectedPlatforms, id])
                                setFieldErrors(prev => ({ ...prev, platforms: '' }))
                            }}
                            onRemove={(id) => setSelectedPlatforms(selectedPlatforms.filter(p => p !== id))}
                            placeholder="Selecionar plataformas..."
                            color="green"
                        />
                        {!loading && platforms.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhuma plataforma cadastrada</p>
                        )}
                        {fieldErrors.platforms && <p className="text-sm text-red-500 mt-1">{fieldErrors.platforms}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Turnos</label>
                        <ChipsSelector
                            options={shifts}
                            selected={selectedShifts}
                            onSelect={(id) => {
                                setSelectedShifts([...selectedShifts, id])
                                setFieldErrors(prev => ({ ...prev, shifts: '' }))
                            }}
                            onRemove={(id) => setSelectedShifts(selectedShifts.filter(s => s !== id))}
                            placeholder="Selecionar turnos..."
                            color="purple"
                        />
                        {!loading && shifts.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhum turno cadastrado</p>
                        )}
                        {fieldErrors.shifts && <p className="text-sm text-red-500 mt-1">{fieldErrors.shifts}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Empresas</label>
                        <ChipsSelector
                            options={companies}
                            selected={selectedCompanies}
                            onSelect={(id) => {
                                setSelectedCompanies([...selectedCompanies, id])
                                setFieldErrors(prev => ({ ...prev, companies: '' }))
                            }}
                            onRemove={(id) => setSelectedCompanies(selectedCompanies.filter(c => c !== id))}
                            placeholder="Selecionar empresas..."
                            color="orange"
                        />
                        {!loading && companies.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhuma empresa cadastrada</p>
                        )}
                        {fieldErrors.companies && <p className="text-sm text-red-500 mt-1">{fieldErrors.companies}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notas</label>
                        <Input
                            placeholder="Adicione notas opcionais..."
                            {...register('notes')}
                        />
                    </div>

                    <Button type="submit" disabled={submitting || loading} className="w-full">
                        {submitting ? 'Criando...' : 'Criar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditDailyAssignmentDialog({ assignment, onSuccess }: { assignment: DailyAssignment; onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ notes: string }>({
        defaultValues: { notes: assignment.notes }
    })
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date(assignment.date))
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(assignment.collaborator)
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(assignment.platform)
    const [selectedShifts, setSelectedShifts] = useState<string[]>(assignment.shift)
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>(assignment.company)
    const [collaborators, setCollaborators] = useState<SelectOption[]>([])
    const [platforms, setPlatforms] = useState<SelectOption[]>([])
    const [shifts, setShifts] = useState<SelectOption[]>([])
    const [companies, setCompanies] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState(true)
    const [datePopoverOpen, setDatePopoverOpen] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [collabRes, platRes, shiftRes, compRes] = await Promise.all([
                    api.get('/collections/collaborators/records'),
                    api.get('/collections/platforms/records'),
                    api.get('/collections/shifts/records'),
                    api.get('/collections/companies/records'),
                ])
                setCollaborators(collabRes.data.items || [])
                setPlatforms(platRes.data.items || [])
                setShifts(shiftRes.data.items || [])
                setCompanies(compRes.data.items || [])
            } catch (error) {
                toast.error(formatErrorToast(error))
            } finally {
                setLoading(false)
            }
        }
        if (open) loadOptions()
    }, [open])

    const onSubmit = async (data: { notes: string }) => {
        const errs: Record<string, string> = {}
        if (!date) errs.date = 'Data obrigatória'
        if (selectedCollaborators.length === 0) errs.collaborators = 'Selecione ao menos um colaborador'
        if (selectedPlatforms.length === 0) errs.platforms = 'Selecione ao menos uma plataforma'
        if (selectedShifts.length === 0) errs.shifts = 'Selecione ao menos um turno'
        if (selectedCompanies.length === 0) errs.companies = 'Selecione ao menos uma empresa'
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }
        setFieldErrors({})
        try {
            setSubmitting(true)
            if (!date) {
                setFieldErrors({ date: 'Data obrigatória' })
                return
            }
            await api.patch(`/collections/daily_assignments/records/${assignment.id}`, {
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(),
                collaborator: selectedCollaborators,
                platform: selectedPlatforms,
                shift: selectedShifts,
                company: selectedCompanies,
                notes: data.notes || '',
            })
            toast.success('Atribuição atualizada com sucesso')
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            toast.error(formatErrorToast(error))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max:h-full overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar atribuição diária</DialogTitle>
                    <DialogDescription>Atualize os dados da atribuição</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] ">
                    <div>
                        <label className="block text-sm font-medium mb-1">Data</label>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        if (selectedDate) {
                                            setDate(selectedDate)
                                        }
                                        setDatePopoverOpen(false)
                                    }}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                        {fieldErrors.date && <p className="text-sm text-red-500 mt-1">{fieldErrors.date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Colaboradores</label>
                        <ChipsSelector
                            options={collaborators}
                            selected={selectedCollaborators}
                            onSelect={(id) => {
                                setSelectedCollaborators([...selectedCollaborators, id])
                                setFieldErrors(prev => ({ ...prev, collaborators: '' }))
                            }}
                            onRemove={(id) => setSelectedCollaborators(selectedCollaborators.filter(c => c !== id))}
                            placeholder="Selecionar colaboradores..."
                            color="blue"
                        />
                        {!loading && collaborators.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhum colaborador cadastrado</p>
                        )}
                        {fieldErrors.collaborators && <p className="text-sm text-red-500 mt-1">{fieldErrors.collaborators}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Plataformas</label>
                        <ChipsSelector
                            options={platforms}
                            selected={selectedPlatforms}
                            onSelect={(id) => {
                                setSelectedPlatforms([...selectedPlatforms, id])
                                setFieldErrors(prev => ({ ...prev, platforms: '' }))
                            }}
                            onRemove={(id) => setSelectedPlatforms(selectedPlatforms.filter(p => p !== id))}
                            placeholder="Selecionar plataformas..."
                            color="green"
                        />
                        {!loading && platforms.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhuma plataforma cadastrada</p>
                        )}
                        {fieldErrors.platforms && <p className="text-sm text-red-500 mt-1">{fieldErrors.platforms}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Turnos</label>
                        <ChipsSelector
                            options={shifts}
                            selected={selectedShifts}
                            onSelect={(id) => {
                                setSelectedShifts([...selectedShifts, id])
                                setFieldErrors(prev => ({ ...prev, shifts: '' }))
                            }}
                            onRemove={(id) => setSelectedShifts(selectedShifts.filter(s => s !== id))}
                            placeholder="Selecionar turnos..."
                            color="purple"
                        />
                        {!loading && shifts.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhum turno cadastrado</p>
                        )}
                        {fieldErrors.shifts && <p className="text-sm text-red-500 mt-1">{fieldErrors.shifts}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Empresas</label>
                        <ChipsSelector
                            options={companies}
                            selected={selectedCompanies}
                            onSelect={(id) => {
                                setSelectedCompanies([...selectedCompanies, id])
                                setFieldErrors(prev => ({ ...prev, companies: '' }))
                            }}
                            onRemove={(id) => setSelectedCompanies(selectedCompanies.filter(c => c !== id))}
                            placeholder="Selecionar empresas..."
                            color="orange"
                        />
                        {!loading && companies.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">Nenhuma empresa cadastrada</p>
                        )}
                        {fieldErrors.companies && <p className="text-sm text-red-500 mt-1">{fieldErrors.companies}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notas</label>
                        <Input
                            placeholder="Adicione notas opcionais..."
                            {...register('notes')}
                        />
                    </div>

                    <Button type="submit" disabled={submitting || loading} className="w-full">
                        {submitting ? 'Atualizando...' : 'Atualizar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function DailyAssignmentsPage() {
    return (
        <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <DailyAssignmentsPageContent />
        </Suspense>
    )
}

function DailyAssignmentsPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const api = useApi()
    const [assignments, setAssignments] = useState<DailyAssignment[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
    const [filterCollaborator, setFilterCollaborator] = useState<string>('')
    const [collaborators, setCollaborators] = useState<SelectOption[]>([])
    const [filterDatePopoverOpen, setFilterDatePopoverOpen] = useState(false)

    useEffect(() => {
        const dateParam = searchParams.get('date')
        if (dateParam) {
            try {
                const parsed = parse(dateParam, 'yyyy-MM-dd', new Date())
                setFilterDate(parsed)
            } catch {
                setFilterDate(undefined)
            }
        } else {
            setFilterDate(undefined)
        }
    }, [searchParams])

    const updateFilterDate = (newDate: Date | undefined) => {
        setFilterDate(newDate)
        if (newDate) {
            const dateStr = format(newDate, 'yyyy-MM-dd')
            router.push(`/dashboard/daily_assignments?date=${dateStr}`)
        } else {
            router.push('/dashboard/daily_assignments')
        }
    }

    useEffect(() => {
        const loadCollaborators = async () => {
            try {
                const res = await api.get('/collections/collaborators/records')
                setCollaborators(res.data.items || [])
            } catch (error) {
                toast.error(formatErrorToast(error))
            }
        }
        loadCollaborators()
    }, [])

    const fetchAssignments = async (pageNum: number) => {
        try {
            setLoading(true)
            let url = `/collections/daily_assignments/records?perPage=10&page=${pageNum}&expand=collaborator,platform,shift,company`
            const filters: string[] = []

            if (filterDate) {
                const dateStr = format(filterDate, 'yyyy-MM-dd')
                const nextDayStr = format(new Date(filterDate.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
                filters.push(`date~"${dateStr}"`)
            }

            if (filterCollaborator) {
                filters.push(`collaborator~"${filterCollaborator}"`)
            }

            if (filters.length > 0) {
                url += `&filter=${encodeURIComponent(filters.join(' && '))}`
            }

            const { data } = await api.get<DailyAssignmentsResponse>(url)
            setAssignments(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(pageNum)
        } catch (error) {
            toast.error(formatErrorToast(error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments(1)
    }, [filterDate, filterCollaborator])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/collections/daily_assignments/records/${id}`)
            setAssignments(assignments.filter(a => a.id !== id))
            toast.success('Atribuição deletada')
        } catch (error) {
            toast.error(formatErrorToast(error))
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Atribuições Diárias</h1>
                <CreateDailyAssignmentDialog onSuccess={() => fetchAssignments(1)} />
            </div>

            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <Popover open={filterDatePopoverOpen} onOpenChange={setFilterDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-48 justify-start text-left font-normal',
                                    !filterDate && 'text-muted-foreground'
                                )}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {filterDate ? format(filterDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Filtrar por data'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={filterDate}
                                onSelect={(selectedDate) => {
                                    if (selectedDate) {
                                        updateFilterDate(selectedDate)
                                        setFilterDatePopoverOpen(false)
                                    }
                                }}
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Colaborador</label>
                    <Select value={filterCollaborator} onValueChange={setFilterCollaborator}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Selecionar colaborador" />
                        </SelectTrigger>
                        <SelectContent>
                            {collaborators.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(filterDate || filterCollaborator) && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            updateFilterDate(undefined)
                            setFilterCollaborator('')
                        }}
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma atribuição encontrada</div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Colaboradores</TableHead>
                                <TableHead>Plataformas</TableHead>
                                <TableHead>Turnos</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>{new Date(assignment.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.expand?.collaborator?.map(c => (
                                                <Badge key={c.id} variant="secondary" className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 truncate">
                                                    {c.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.expand?.platform?.map(p => (
                                                <Badge key={p.id} variant="secondary" className="bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300 truncate">
                                                    {p.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.expand?.shift?.map(s => (
                                                <Badge key={s.id} variant="secondary" className="bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 truncate">
                                                    {s.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {assignment.expand?.company?.map(c => (
                                                <Badge key={c.id} variant="secondary" className="bg-orange-500/20 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300 h-auto py-1 rounded-lg text-center truncate">
                                                    {c.name}
                                                    <br />
                                                    {c.exp}h
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{assignment.notes}</TableCell>
                                    <TableCell>
                                        <div className="h-full flex gap-2 items-center justify-center">
                                            <EditDailyAssignmentDialog assignment={assignment} onSuccess={() => fetchAssignments(page)} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Deletar Atribuição</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja deletar? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="flex gap-2 justify-end">
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(assignment.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Deletar
                                                        </AlertDialogAction>
                                                    </div>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => fetchAssignments(page - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => fetchAssignments(page + 1)}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
