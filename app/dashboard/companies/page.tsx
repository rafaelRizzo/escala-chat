'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApi } from '@/hooks/useApi'
import { formatErrorToast } from '@/lib/error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface Company {
    id: string
    name: string
    active: boolean
    exp: number
    created: string
}

interface CompaniesResponse {
    items: Company[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

function CreateCompanyDialog({ onSuccess }: { onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string }>()
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [activeValue, setActiveValue] = useState('true')

    const [expValue, setExpValue] = useState('0')

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.post('/collections/companies/records', {
                name: data.name,
                active: activeValue === 'true',
                exp: parseInt(expValue)
            })
            toast.success('Empresa criada com sucesso')
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
                    <DialogTitle>Criar Empresa</DialogTitle>
                    <DialogDescription>Preencha os dados para criar uma nova empresa</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: Acme Inc"
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Expediente (0-24h)</label>
                        <Input
                            type="number"
                            min="0"
                            max="24"
                            placeholder="ex: 8"
                            value={expValue}
                            onChange={(e) => setExpValue(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Criando...' : 'Criar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditCompanyDialog({ company, onSuccess }: { company: Company; onSuccess: (page: number) => void }) {
    const api = useApi()
    const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
        defaultValues: { name: company.name }
    })
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [activeValue, setActiveValue] = useState(company.active ? 'true' : 'false')
    const [expValue, setExpValue] = useState(company.exp.toString())

    const onSubmit = async (data: { name: string }) => {
        try {
            setSubmitting(true)
            await api.patch(`/collections/companies/records/${company.id}`, {
                name: data.name,
                active: activeValue === 'true',
                exp: parseInt(expValue)
            })
            toast.success('Empresa atualizada com sucesso')
            setOpen(false)
            onSuccess(1)
        } catch (error) {
            toast.error('Erro ao atualizar empresa')
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
                    <DialogTitle>Editar Empresa</DialogTitle>
                    <DialogDescription>Atualize os dados da empresa</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            placeholder="ex: Acme Inc"
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Expediente (0-24h)</label>
                        <Input
                            type="number"
                            min="0"
                            max="24"
                            placeholder="ex: 8"
                            value={expValue}
                            onChange={(e) => setExpValue(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function CompaniesPage() {
    const api = useApi()
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const fetchCompanies = async (pageNum: number, searchTerm: string = '') => {
        try {
            setLoading(true)
            let url = `/collections/companies/records?perPage=10&page=${pageNum}`
            if (searchTerm.trim()) {
                url += `&filter=(name~'${searchTerm}')`
            }
            const { data } = await api.get<CompaniesResponse>(url)
            setCompanies(data.items || [])
            setTotalPages(data.totalPages || 1)
            setPage(pageNum)
        } catch (error) {
            toast.error('Erro ao carregar empresas')
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
        fetchCompanies(1, debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        fetchCompanies(1)
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/collections/companies/records/${id}`)
            setCompanies(companies.filter(c => c.id !== id))
            toast.success('Empresa deletada')
        } catch (error) {
            toast.error('Erro ao deletar empresa')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Empresas</h1>
                <CreateCompanyDialog onSuccess={fetchCompanies} />
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
            ) : companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma empresa encontrada</div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Expediente</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Criado</TableHead>
                                <TableHead className="w-32">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-orange-500/20 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300">
                                            {company.exp}h
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={company.active ? 'bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300' : 'bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300'}>
                                            {company.active ? 'Sim' : 'Não'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(company.created).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="h-full flex gap-2 items-center justify-center">
                                            <EditCompanyDialog company={company} onSuccess={fetchCompanies} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Deletar Empresa</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja deletar "{company.name}"? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="flex gap-2 justify-end">
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(company.id)}
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
                                onClick={() => fetchCompanies(page - 1, debouncedSearch)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => fetchCompanies(page + 1, debouncedSearch)}
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
