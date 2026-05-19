'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '@/hooks/useApi'
import { showErrorToasts } from '@/lib/error'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface Collaborator {
    id: string
    name: string
    active: boolean
    created: string
}

interface CollaboratorsResponse {
    items: Collaborator[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

function CreateCollaboratorDialog({ onSuccess }: { onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>()
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [activeValue, setActiveValue] = useState('true')

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.post('/collections/collaborators/records', {
                name: data.name,
                active: activeValue === 'true'
            })
            toast.success('Colaborador criado com sucesso')
            reset()
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            showErrorToasts(error, 'Erro ao criar colaborador')
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
                    <DialogTitle>Criar Colaborador</DialogTitle>
                    <DialogDescription>Preencha os dados para criar um novo colaborador</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: João Silva"
                            {...register('name', { required: 'Nome obrigatório' })}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ativo</label>
                        <Select value={activeValue} onValueChange={setActiveValue}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sim</SelectItem>
                                <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Criando...' : 'Criar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditCollaboratorDialog({ collaborator, onSuccess }: { collaborator: Collaborator; onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
        defaultValues: { name: collaborator.name }
    })
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [activeValue, setActiveValue] = useState(collaborator.active ? 'true' : 'false')

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.patch(`/collections/collaborators/records/${collaborator.id}`, {
                name: data.name,
                active: activeValue === 'true'
            })
            toast.success('Colaborador atualizado com sucesso')
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            showErrorToasts(error, 'Erro ao atualizar colaborador')
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
                    <DialogTitle>Editar Colaborador</DialogTitle>
                    <DialogDescription>Atualize os dados do colaborador</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: João Silva"
                            {...register('name', { required: 'Nome obrigatório' })}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ativo</label>
                        <Select value={activeValue} onValueChange={setActiveValue}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sim</SelectItem>
                                <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function CollaboratorsPage() {
    const api = useApi()
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const fetchCollaborators = async (pageNum: number, searchTerm: string = '') => {
        try {
            setLoading(true)
            let url = `/collections/collaborators/records?perPage=10&page=${pageNum}`
            if (searchTerm.trim()) {
                url += `&filter=(name~'${searchTerm}')`
            }
            const { data } = await api.get<CollaboratorsResponse>(url)
            setCollaborators(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(pageNum)
        } catch (error) {
            showErrorToasts(error, 'Erro ao carregar colaboradores')
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
        fetchCollaborators(1, debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        fetchCollaborators(1)
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/collections/collaborators/records/${id}`)
            setCollaborators(collaborators.filter(c => c.id !== id))
            toast.success('Colaborador deletado')
        } catch (error) {
            showErrorToasts(error, 'Erro ao deletar colaborador')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Colaboradores</h1>
                <CreateCollaboratorDialog onSuccess={fetchCollaborators} />
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
            ) : collaborators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum colaborador encontrado</div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Criado</TableHead>
                                <TableHead className="w-32">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collaborators.map((collaborator) => (
                                <TableRow key={collaborator.id}>
                                    <TableCell className="font-medium">{collaborator.name}</TableCell>
                                    <TableCell>
                                        <Badge className={`px-2 py-1  text-xs font-medium ${collaborator.active ? 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                            }`}>
                                            {collaborator.active ? 'Sim' : 'Não'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(collaborator.created).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="h-full flex gap-2 items-center justify-center">
                                            <EditCollaboratorDialog collaborator={collaborator} onSuccess={fetchCollaborators} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Deletar Colaborador</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja deletar "{collaborator.name}"? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="flex gap-2 justify-end">
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(collaborator.id)}
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
                                onClick={() => fetchCollaborators(page - 1, debouncedSearch)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => fetchCollaborators(page + 1, debouncedSearch)}
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
