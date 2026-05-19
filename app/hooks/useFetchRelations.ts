import { useEffect, useState, useRef } from 'react'

interface RelationData {
    id: string
    name: string
}

export function useFetchRelations(ids: string[], collectionName: string) {
    const [data, setData] = useState<RelationData[]>([])
    const cacheRef = useRef<{ [key: string]: RelationData }>({})
    const uniqueIds = [...new Set(ids)]

    useEffect(() => {
        if (!uniqueIds || uniqueIds.length === 0) {
            setData([])
            return
        }

        const uncachedIds = uniqueIds.filter((id) => !cacheRef.current[id])

        if (uncachedIds.length === 0) {
            setData(uniqueIds.map((id) => cacheRef.current[id]))
            return
        }

        const fetchData = async () => {
            try {
                const filter = uncachedIds.map((id) => `id='${id}'`).join(' || ')
                const response = await fetch(
                    `https://pocketbase.falevox.com.br/api/collections/${collectionName}/records?filter=(${filter})`
                )
                const result = await response.json()
                const items = result.items || []

                items.forEach((item: any) => {
                    cacheRef.current[item.id] = { id: item.id, name: item.name }
                })

                setData(uniqueIds.map((id) => cacheRef.current[id] || { id, name: id.substring(0, 8) }))
            } catch {
                setData(uniqueIds.map((id) => ({ id, name: id.substring(0, 8) })))
            }
        }

        fetchData()
    }, [collectionName, uniqueIds.join(',')])

    return data
}
