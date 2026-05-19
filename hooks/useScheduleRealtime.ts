import { useEffect, useState } from 'react'

interface RealtimeMessage {
  action: 'create' | 'update' | 'delete'
  record: any
}

export function useScheduleRealtime(dateStr: string) {
  const [clientId, setClientId] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      eventSource = new EventSource('https://pocketbase.falevox.com.br/api/realtime')

      eventSource.addEventListener('PB_CONNECT', (e) => {
        const data = JSON.parse(e.data)
        setClientId(data.clientId)
        setIsConnected(true)
        subscribe(data.clientId)
      })

      eventSource.addEventListener('daily_assignments/*', (e) => {
        const msg = JSON.parse(e.data)
        handleRealtimeUpdate(msg, dateStr)
      })

      eventSource.onerror = () => {
        setIsConnected(false)
        eventSource?.close()
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    const subscribe = (id: string) => {
      fetch('https://pocketbase.falevox.com.br/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: id,
          subscriptions: ['daily_assignments/*'],
        }),
      }).catch(console.error)
    }

    connect()

    return () => {
      eventSource?.close()
      clearTimeout(reconnectTimeout)
    }
  }, [dateStr])

  return { isConnected, clientId }
}

function handleRealtimeUpdate(msg: any, dateStr: string) {
  const eventDate = msg.record?.date?.split(' ')[0]
  if (eventDate === dateStr) {
    window.dispatchEvent(
      new CustomEvent('schedule-update', {
        detail: msg,
      })
    )
  }
}
