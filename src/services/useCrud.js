import { useState, useEffect, useCallback } from 'react'

export function useCrud(service) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await service.getAll()
      const data = res.data

      if (Array.isArray(data)) {
        setItems(data)
      }

      else if (data.member) {
        setItems(data.member)
      }

      else if (data['hydra:member']) {
        setItems(data['hydra:member'])
      }

      else if (data.data) {
        setItems(data.data)
      }

      else {
        setItems([])
      }

    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    load()
  }, [load])

  const create = async (data) => {
    const res = await service.create(data)
    await load()
    return res.data
  }

  const update = async (id, data) => {
    const res = await service.update(id, data)
    await load()
    return res.data
  }

  const remove = async (id) => {
    await service.delete(id)
    setItems(prev =>
      prev.filter(i => (i.id || i['@id']) !== id)
    )
  }

  return { items, loading, error, load, create, update, remove }
}