import { createContext, useContext, useState } from 'react'

interface ModalContextType {
  openContact: (servicio?: string) => void
  closeContact: () => void
  isOpen: boolean
  servicioPreseleccionado: string
  /** El menú móvil del navbar está abierto (el botón flotante de Punto se esconde). */
  menuMovilAbierto: boolean
  setMenuMovilAbierto: (abierto: boolean) => void
}

const ModalContext = createContext<ModalContextType>({
  openContact: () => {},
  closeContact: () => {},
  isOpen: false,
  servicioPreseleccionado: '',
  menuMovilAbierto: false,
  setMenuMovilAbierto: () => {},
})

export const useModal = () => useContext(ModalContext)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [servicioPreseleccionado, setServicio] = useState('')
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const openContact = (servicio = '') => {
    setServicio(servicio)
    setIsOpen(true)
  }
  const closeContact = () => {
    setIsOpen(false)
    setServicio('')
  }

  return (
    <ModalContext.Provider value={{ openContact, closeContact, isOpen, servicioPreseleccionado, menuMovilAbierto, setMenuMovilAbierto }}>
      {children}
    </ModalContext.Provider>
  )
}
