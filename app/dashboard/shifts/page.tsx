'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '@/hooks/useApi'
import { formatErrorToast } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit, Plus } from 'lucide-react'
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

interface Shift {
    id: string
    collectionId: string
    collectionName: string
    name: string
    created: string
    updated: string
}

interface ShiftsResponse {
    items: Shift[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

function CreateShiftDialog({ onSuccess }: { onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>()
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.post('/collections/shifts/records', { name: data.name })
            toast.success('Turno criado com sucesso')
            reset()
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Turno</DialogTitle>
                    <DialogDescription>Preencha os dados para criar um novo turno</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: MANHÃ"
                            {...register('name', { required: 'Nome obrigatório' })}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Criando...' : 'Criar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditShiftDialog({ shift, onSuccess }: { shift: Shift; onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>({
        defaultValues: { name: shift.name }
    })
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.patch(`/collections/shifts/records/${shift.id}`, { name: data.name })
            toast.success('Turno atualizado com sucesso')
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            toast.error('Erro ao atualizar turno')
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Turno</DialogTitle>
                    <DialogDescription>Atualize os dados do turno</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: MANHÃ"
                            {...register('name', { required: 'Nome obrigatório' })}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ShiftsPage() {
    const api = useApi()
    const [shifts, setShifts] = useState<Shift[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const fetchShifts = async (pageNum: number, searchTerm: string = '') => {
        try {
            setLoading(true)
            let url = `/collections/shifts/records?perPage=10&page=${pageNum}`
            if (searchTerm.trim()) {
                url += `&filter=(name~'${searchTerm}')`
            }
            const { data } = await api.get<ShiftsResponse>(url)
            setShifts(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(pageNum)
        } catch (error) {
            toast.error('Erro ao carregar turnos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        fetchShifts(1, debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        fetchShifts(1)
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/collections/shifts/records/${id}`)
            setShifts(shifts.filter(s => s.id !== id))
            toast.success('Turno deletado')
        } catch (error) {
            toast.error('Erro ao deletar turno')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Turnos</h1>
                <CreateShiftDialog onSuccess={fetchShifts} />
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Buscar por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : shifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum turno encontrado</div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Criado</TableHead>
                                <TableHead className="w-32">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                    <TableCell className="font-medium">{shift.name}</TableCell>
                                    <TableCell>{new Date(shift.created).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <EditShiftDialog shift={shift} onSuccess={fetchShifts} />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Deletar Turno</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja deletar "{shift.name}"? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="flex gap-2 justify-end">
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(shift.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Deletar
                                                    </AlertDialogAction>
                                                </div>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                                onClick={() => fetchShifts(page - 1, debouncedSearch)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => fetchShifts(page + 1, debouncedSearch)}
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
