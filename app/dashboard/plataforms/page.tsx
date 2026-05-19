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

interface Platform {
    id: string
    name: string
    created: string
}

interface PlatformsResponse {
    items: Platform[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

function CreatePlatformDialog({ onSuccess }: { onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>()
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.post('/collections/platforms/records', { name: data.name })
            toast.success('Plataforma criada com sucesso')
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
                    <DialogTitle>Criar Plataforma</DialogTitle>
                    <DialogDescription>Preencha os dados para criar uma nova plataforma</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: WhatsApp"
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

function EditPlatformDialog({ platform, onSuccess }: { platform: Platform; onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
        defaultValues: { name: platform.name }
    })
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.patch(`/collections/platforms/records/${platform.id}`, { name: data.name })
            toast.success('Plataforma atualizada com sucesso')
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            toast.error('Erro ao atualizar plataforma')
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
                    <DialogTitle>Editar Plataforma</DialogTitle>
                    <DialogDescription>Atualize os dados da plataforma</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: WhatsApp"
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

export default function PlatformsPage() {
    const api = useApi()
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const fetchPlatforms = async (pageNum: number, searchTerm: string = '') => {
        try {
            setLoading(true)
            let url = `/collections/platforms/records?perPage=10&page=${pageNum}`
            if (searchTerm.trim()) {
                url += `&filter=(name~'${searchTerm}')`
            }
            const { data } = await api.get<PlatformsResponse>(url)
            setPlatforms(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(pageNum)
        } catch (error) {
            toast.error('Erro ao carregar plataformas')
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
        fetchPlatforms(1, debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        fetchPlatforms(1)
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/collections/platforms/records/${id}`)
            setPlatforms(platforms.filter(p => p.id !== id))
            toast.success('Plataforma deletada')
        } catch (error) {
            toast.error('Erro ao deletar plataforma')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Plataformas</h1>
                <CreatePlatformDialog onSuccess={fetchPlatforms} />
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
            ) : platforms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma plataforma encontrada</div>
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
                            {platforms.map((platform) => (
                                <TableRow key={platform.id}>
                                    <TableCell className="font-medium">{platform.name}</TableCell>
                                    <TableCell>{new Date(platform.created).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <EditPlatformDialog platform={platform} onSuccess={fetchPlatforms} />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Deletar Plataforma</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tem certeza que deseja deletar "{platform.name}"? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="flex gap-2 justify-end">
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(platform.id)}
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
                                onClick={() => fetchPlatforms(page - 1, debouncedSearch)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => fetchPlatforms(page + 1, debouncedSearch)}
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
