import { Link } from 'react-router-dom'
import { useConfig } from '../../context/ConfigContext'
import { buildWALink } from '../../hooks/useSheetConfig'
import { useModal } from '../../context/ModalContext'

export default function Footer() {
  const config = useConfig()
  const waLink = buildWALink(config.whatsapp_number, config.whatsapp_default_text)
  const { openContact } = useModal()
  const year = new Date().getFullYear()
//locura esto
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/">
              <img src="/images/LogoCompletoHorizontalFN.png" alt="SCdev" className="h-18 mb-24" />
            </Link>
            <p className="text-white/40 text-sm">
              Agencia de desarrollo web en La Plata, Argentina.
            </p>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-sm">Servicios</h5>
            <ul className="space-y-2 text-white/40 text-sm">
              <li><Link to="/servicios/presencia-web-esencial" className="hover:text-white transition-colors">Presencia Web Esencial</Link></li>
              <li><Link to="/servicios/landing-page-profesional" className="hover:text-white transition-colors">Landing Page Profesional</Link></li>
              <li><Link to="/servicios/sitio-web-corporativo" className="hover:text-white transition-colors">Sitio Web Corporativo</Link></li>
              <li><Link to="/servicios/sistema-a-medida" className="hover:text-white transition-colors">Sistema a Medida</Link></li>
              <li><Link to="/servicios/automatizacion-whatsapp" className="hover:text-white transition-colors">Automatización / WhatsApp</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4 text-sm">Contacto</h5>
            <ul className="space-y-2 text-white/40 text-sm">
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              {config.email && (
                <li>
                  <a href={`mailto:${config.email}`} className="hover:text-white transition-colors">
                    {config.email}
                  </a>
                </li>
              )}
              {config.linkedin_url && (
                <li>
                  <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
              )}
              {config.instagram_url && (
                <li>
                  <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
              )}
              <li>
                <button onClick={() => openContact()} className="hover:text-white transition-colors text-left">
                  Formulario de contacto
                </button>
              </li>
              <li>La Plata, Buenos Aires, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center text-white/20 text-xs">
          © {year} SCdev. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
