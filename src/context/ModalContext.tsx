import { createContext, useContext, useState } from 'react'

interface ModalContextType {
  openContact: (servicio?: string) => void
  closeContact: () => void
  isOpen: boolean
  servicioPreseleccionado: string
}

const ModalContext = createContext<ModalContextType>({
  openContact: () => {},
  closeContact: () => {},
  isOpen: false,
  servicioPreseleccionado: '',
})

export const useModal = () => useContext(ModalContext)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [servicioPreseleccionado, setServicio] = useState('')

  const openContact = (servicio = '') => {
    setServicio(servicio)
    setIsOpen(true)
  }
  const closeContact = () => {
    setIsOpen(false)
    setServicio('')
  }

  return (
    <ModalContext.Provider value={{ openContact, closeContact, isOpen, servicioPreseleccionado }}>
      {children}
    </ModalContext.Provider>
  )
}
