import { useState, useEffect } from 'react'
import { Trash2, Pencil, Plus, Check, X } from 'lucide-react'
import Modal from '@/components/ui/Modal/Modal'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'

function CategoriesModal({
  isOpen,
  onClose,
  onSave,
  title = 'Gestionar categorías',
  itemLabel = 'categoría',
  initialItems = [],
  initialCategories,
}) {
  // Backward compat: convert string[] to {id, name}[]
  const normalizedInitial = initialCategories
    ? initialCategories.map((cat, i) => (typeof cat === 'string' ? { id: i + 1, name: cat } : cat))
    : initialItems

  const [items, setItems] = useState(normalizedInitial)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [newItemName, setNewItemName] = useState('')

  // Reset items when modal opens
  useEffect(() => {
    if (isOpen) {
      const source = initialCategories
        ? initialCategories.map((cat, i) =>
            typeof cat === 'string' ? { id: i + 1, name: cat } : cat
          )
        : initialItems
      setItems(source)
      setEditingId(null)
      setEditValue('')
      setNewItemName('')
    }
  }, [isOpen])

  const handleCreate = () => {
    if (newItemName.trim()) {
      const newId = Math.max(0, ...items.map((it) => it.id)) + 1
      setItems((prev) => [...prev, { id: newId, name: newItemName.trim() }])
      setNewItemName('')
    }
  }

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleStartEdit = (item) => {
    setEditingId(item.id)
    setEditValue(item.name)
  }

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingId ? { ...it, name: editValue.trim() } : it))
      )
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleSave = () => {
    if (onSave) onSave(items)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="categories-modal__body">
        <div className="categories-modal__list">
          {items.map((item) => (
            <div key={item.id} className="categories-modal__row">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="categories-modal__input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    autoFocus
                  />
                  <Button
                    variant="filled"
                    color="primary"
                    size="md"
                    icon={Check}
                    onClick={handleSaveEdit}
                  />
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="md"
                    icon={X}
                    onClick={handleCancelEdit}
                  />
                </>
              ) : (
                <>
                  <span className="categories-modal__item-name">{item.name}</span>
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="md"
                    icon={Pencil}
                    onClick={() => handleStartEdit(item)}
                  />
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="md"
                    icon={Trash2}
                    onClick={() => handleDelete(item.id)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="categories-modal__create-row">
          <Input
            placeholder={`Nombre de ${itemLabel === 'tag' ? 'el nuevo tag' : `la nueva ${itemLabel}`}`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="categories-modal__new-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
          <Button variant="filled" color="secondary" size="md" icon={Plus} onClick={handleCreate}>
            Crear
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="text" color="secondary" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="filled" color="primary" size="md" onClick={handleSave}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CategoriesModal
