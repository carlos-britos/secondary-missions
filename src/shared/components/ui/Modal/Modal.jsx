import { useEffect, useRef } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

function Modal({
  children,
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ...props
}) {
  const modalRef = useRef(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Handle click outside
  useClickOutside(modalRef, onClose, isOpen && closeOnOverlay)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const classes = ['modal', `modal--${size}`, className].filter(Boolean).join(' ')

  const modalContent = (
    <div className="modal__overlay">
      <div ref={modalRef} className={classes} role="dialog" aria-modal="true" {...props}>
        {showCloseButton && (
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

function ModalHeader({ children, className = '', ...props }) {
  return (
    <div className={`modal__header ${className}`} {...props}>
      {children}
    </div>
  )
}

function ModalTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`modal__title ${className}`} {...props}>
      {children}
    </h3>
  )
}

function ModalBody({ children, className = '', ...props }) {
  return (
    <div className={`modal__body ${className}`} {...props}>
      {children}
    </div>
  )
}

function ModalFooter({ children, className = '', align = 'right', ...props }) {
  const classes = ['modal__footer', `modal__footer--${align}`, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
