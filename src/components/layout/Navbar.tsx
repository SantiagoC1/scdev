import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'
import { useModal } from '../../context/ModalContext'

const NAV_LINKS = [
  { label: 'Inicio', href: '/#hero' },
  { label: 'Nosotros', href: '/#nosotros' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Clientes', href: '/#clientes' },
  { label: 'Proyectos', href: '/#portfolio' },
  { label: 'Contacto', href: '/#cta' },
]

const NAV_HEIGHT = 80

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)
  const { openContact } = useModal()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)

    if (href.startsWith('/') && !href.includes('#')) return

    const id = href.replace('/#', '').replace('#', '')

    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 150)
  }

  return (
    <>
      {/* Overlay — cierra el menú al tocar fuera */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 overflow-hidden transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-24 md:h-26 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-shrink-0"
          >
            <img
              src="/images/LogoCompletoHorizontalFN.png"
              alt="SCdev"
              className="h-14 md:h-18"
            />
          </Link>

          {/* Links desktop */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.href.startsWith('/') && !link.href.includes('#') ? (
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200 bg-transparent border-none cursor-pointer"
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#D32F2F] border border-[#D32F2F]/30 px-4 py-2 rounded-lg hover:bg-[#D32F2F]/10 transition-all duration-200"
            >
              WhatsApp
            </a>
            <button
              onClick={() => openContact()}
              className="text-sm bg-[#D32F2F] text-white px-4 py-2 rounded-lg hover:bg-[#B71C1C] transition-all duration-200 shadow-[0_4px_20px_rgba(211,47,47,0.3)]"
            >
              Formulario
            </button>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 z-10"
            aria-label="Menú"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Menú mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#111111] border-t border-white/5"
            >
              <ul className="px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') && !link.href.includes('#') ? (
                      <Link
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block text-white/80 hover:text-white text-base py-2 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleNavClick(link.href)}
                        className="block w-full text-left text-white/80 hover:text-white text-base py-2 transition-colors"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
                <li className="pt-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-sm bg-[#D32F2F] text-white px-4 py-3 rounded-lg"
                  >
                    Cotizar por WhatsApp
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
