'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Cookies from 'universal-cookie'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useApi } from '@/hooks/useApi'

interface LoginFormData {
    email: string
    password: string
}

interface AuthResponse {
    token: string
}

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
    const api = useApi()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true)

            const response = await api.post<AuthResponse>(
                '/collections/_superusers/auth-with-password',
                {
                    identity: data.email,
                    password: data.password,
                }
            )

            const cookies = new Cookies()
            cookies.set('auth_token', response.data.token, { path: '/', maxAge: 60 * 60 * 24 * 7 })

            toast.success('Login realizado com sucesso!')
            router.push('/dashboard')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Entre com sua conta</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Entre com sua conta para continuar
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        {...register('email', { required: 'Email obrigatório' })}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Senha</FieldLabel>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        {...register('password', { required: 'Senha obrigatória' })}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </Field>
                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Login'}
                    </Button>
                </Field>
                <FieldSeparator></FieldSeparator>
                <Field>
                    <FieldDescription className="text-center">
                        Mantido por Rafael Rizzo
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
