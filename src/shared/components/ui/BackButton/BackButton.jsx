import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'

function BackButton({ to, label = 'Volver' }) {
  const navigate = useNavigate()
  return (
    <button className="back-button" onClick={() => navigate(to)}>
      <ChevronLeft size={20} />
      {label}
    </button>
  )
}

export default BackButton
