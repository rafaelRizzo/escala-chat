import { AxiosError } from 'axios'
import { toast } from 'sonner'

export interface ApiError {
  status?: number
  message: string
}

export const getErrorMessage = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as any
    const status = error.response?.status
    const message = data?.message || error.message || 'Erro desconhecido'

    return {
      status,
      message
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message
    }
  }

  return {
    message: 'Erro desconhecido'
  }
}

export const formatErrorToast = (error: unknown): string => {
  const { status, message } = getErrorMessage(error)

  if (status) {
    return `${status} - ${message}`
  }

  return message
}

export const showErrorToasts = (error: unknown, userFriendlyMessage: string = 'Ocorreu um erro ao processar sua solicitação') => {
  const { status, message } = getErrorMessage(error)

  console.error('[API Error]', { status, message })
  toast.error(userFriendlyMessage)

  setTimeout(() => {
    const debugMessage = status ? `${status} - ${message}` : message
    toast.info(`[Debug] ${debugMessage}`, {
      duration: 6000,
    })
  }, 500)
}
