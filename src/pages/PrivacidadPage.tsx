import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PageMeta from '../components/ui/PageMeta'
import { SITE_URL } from '../constants'
import { useConfig } from '../context/ConfigContext'

const ACTUALIZADA = '5 de noviembre de 2026'
const LEIDAS = '4 de noviembre de 2026' // fecha en que se leyeron las páginas de los proveedores

interface Cita {
  texto: string
}
interface Proveedor {
  id: string
  nombre: string
  /** Resumen en español de lo que dicen las citas de abajo. No puede afirmar nada que las citas no digan. */
  resumen: string
  /** Frases textuales de la página del proveedor, en su idioma original. No agregar nada que el proveedor no diga. */
  citas: Cita[]
  fuentes: { etiqueta: string; href: string }[]
}

// Texto leído de las páginas oficiales en LEIDAS. Si cambian, hay que releerlas y actualizar esto.
const PROVEEDORES: Proveedor[] = [
  {
    id: 'groq',
    nombre: 'Groq',
    resumen:
      'Según Groq, por defecto no retiene los datos de los pedidos de inferencia. Puede registrar temporalmente lo que se envía y lo que se responde solo para resolver errores que afecten la plataforma o investigar sospechas de abuso, y esos registros se conservan hasta 30 días, salvo que la ley exija más.',
    citas: [
      { texto: 'By default, Groq does not retain customer data for inference requests.' },
      {
        texto:
          'We may temporarily log inputs and outputs only when: Troubleshooting errors that degrade platform reliability, or Investigating suspected abuse (e.g. rate-limit circumvention). These logs are retained for up to 30 days, unless legally required to retain longer.',
      },
    ],
    fuentes: [
      { etiqueta: 'Groq: tus datos (Your Data)', href: 'https://console.groq.com/docs/your-data' },
      { etiqueta: 'Groq: políticas y avisos legales', href: 'https://console.groq.com/docs/legal' },
    ],
  },
  {
    id: 'gemini',
    nombre: 'Google (Gemini API, plan gratuito)',
    resumen:
      'Según Google, en el plan gratuito de la Gemini API ("Unpaid Services") se usa el contenido que se envía y las respuestas generadas para "proveer, mejorar y desarrollar" (la frase sigue en su página), y personas pueden leer, anotar y procesar esos datos para mejorar la calidad y sus productos. Google pide no enviar información sensible, confidencial ni personal.',
    citas: [
      { texto: 'Google uses the content you submit to the Services and any generated responses to provide, improve, and develop' },
      { texto: 'To help with quality and improve our products, human reviewers may read, annotate, and process your API input and output.' },
      { texto: 'Do not submit sensitive, confidential, or personal information to the Unpaid Services.' },
    ],
    fuentes: [
      { etiqueta: 'Gemini API: condiciones adicionales, "How Google Uses Your Data" (Unpaid Services)', href: 'https://ai.google.dev/gemini-api/terms#data-use-unpaid' },
    ],
  },
  {
    id: 'cloudflare',
    nombre: 'Cloudflare (Workers AI)',
    resumen:
      'Según Cloudflare, no usa el contenido que procesa Workers AI para entrenar modelos de IA, y lo procesa solo durante el tiempo necesario para prestar el servicio.',
    citas: [
      { texto: 'Cloudflare does not use Customer Content processed by Workers AI to train AI models.' },
      { texto: 'Workers AI processes Customer Content only for as long as needed to provide the service.' },
    ],
    fuentes: [
      { etiqueta: 'Cloudflare: Workers AI, uso de datos', href: 'https://developers.cloudflare.com/workers-ai/platform/data-usage/' },
      { etiqueta: 'Cloudflare: política de privacidad', href: 'https://www.cloudflare.com/privacypolicy/' },
    ],
  },
]

const H2 = 'text-xl md:text-2xl font-bold text-white mb-3'
const LINK = 'text-white underline underline-offset-2 hover:text-[#D32F2F] transition-colors'

export default function PrivacidadPage() {
  const config = useConfig()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const contacto = config.email ? (
    <a href={`mailto:${config.email}`} className={LINK}>{config.email}</a>
  ) : (
    'el formulario de contacto de esta web'
  )

  return (
    <>
      <PageMeta
        title="Política de privacidad | SCdev"
        description="Qué datos recibe SCdev a través del formulario de contacto y del asistente Punto, qué proveedores de IA intervienen y cómo ejercer tus derechos según la Ley 25.326."
        canonical={`${SITE_URL}/privacidad`}
      />
      <Navbar />
      <main id="contenido" tabIndex={-1} className="pt-24 md:pt-26">
        <section className="bg-[#121212] pt-12 pb-10 md:pt-14 md:pb-12">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-sm text-white/60 mb-3">Legal</p>
            <h1 className="font-bold leading-[1.1] mb-4" style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)' }}>
              Política de privacidad
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Acá te contamos, sin vueltas, qué datos recibimos cuando usás esta web, para qué los usamos y con quién
              intervienen. Última actualización: {ACTUALIZADA}.
            </p>
          </div>
        </section>

        <section className="bg-[#0a0a0a] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6 flex flex-col gap-12 text-white/70 leading-relaxed">
            <div>
              <h2 className={H2}>Quiénes somos y cómo contactarnos</h2>
              <p>
                SCdev es una agencia de desarrollo web de La Plata, Buenos Aires, Argentina. Para cualquier consulta sobre
                tus datos escribinos a {contacto}.
              </p>
            </div>

            <div>
              <h2 className={H2}>Formulario de contacto</h2>
              <p className="mb-3">
                Si completás el formulario de contacto, recibimos los datos que cargues: nombre, email, teléfono (opcional),
                empresa, si ya tenés web, servicio de interés, presupuesto, urgencia, tu mensaje y la página desde la que
                escribiste. Esos datos se guardan en una planilla de Google Sheets de SCdev, a través de Google Apps Script,
                y los usamos para responder tu consulta.
              </p>
              <p>También podés escribirnos por WhatsApp o por mail, sin pasar por el formulario.</p>
            </div>

            <div id="punto">
              <h2 className={H2}>Punto, el asistente con IA</h2>
              <p className="mb-3">
                Punto es un asistente con inteligencia artificial. Cuando le escribís, el texto de la conversación (hasta los
                últimos 8 mensajes, de hasta 500 caracteres cada uno) se envía a un proveedor de IA para que genere la
                respuesta. Usamos uno de estos tres, según disponibilidad: Groq, Google (Gemini API) o Cloudflare (Workers AI).
              </p>
              <p className="mb-3">
                <strong className="text-white">No guardamos las conversaciones.</strong> Ni nosotros ni esta web las
                almacenamos: viven solo en tu navegador mientras navegás esta web y desaparecen al recargar o cerrar la página. Lo que haga cada proveedor con
                lo que recibe lo explican ellos (ver más abajo).
              </p>
              <p>
                Por eso, <strong className="text-white">no compartas datos sensibles</strong> con Punto. Para pedir un
                presupuesto no hace falta: seguí por WhatsApp o por el formulario.
              </p>
            </div>

            <div>
              <h2 className={H2}>Límite diario de uso y tu dirección IP</h2>
              <p>
                Para que Punto no se sature, limitamos la cantidad de mensajes por día. Para eso calculamos un código
                (hash) a partir de tu dirección IP, el día y una clave secreta, y guardamos solo ese código con un
                contador. No guardamos tu dirección IP ni la usamos para ningún otro fin, y el código no permite
                reconocerte de un día para el otro.
              </p>
            </div>

            <div id="proveedores">
              <h2 className={H2}>Qué dicen los proveedores de IA</h2>
              <p className="mb-6">
                De cada proveedor te dejamos primero un resumen en español y debajo las frases textuales de su página, en su idioma
                original, leídas el {LEIDAS}. Son sus reglas, no las nuestras, y pueden cambiar: te dejamos el link a cada fuente.
              </p>
              <div className="flex flex-col gap-8">
                {PROVEEDORES.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-[#111111] border border-white/[0.08] p-5 md:p-6">
                    <h3 className="font-display font-bold text-white mb-3">{p.nombre}</h3>
                    <p className="text-sm text-white/80 leading-relaxed mb-4">{p.resumen}</p>
                    <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Texto original (en inglés)</p>
                    <div className="flex flex-col gap-3">
                      {p.citas.map((c) => (
                        <blockquote key={c.texto} lang="en" className="border-l-2 border-[#D32F2F]/60 pl-4 text-sm text-white/80">
                          “{c.texto}”
                        </blockquote>
                      ))}
                    </div>
                    <ul className="mt-4 flex flex-col gap-1 text-sm">
                      {p.fuentes.map((f) => (
                        <li key={f.href}>
                          <a href={f.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                            {f.etiqueta}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                <strong className="text-white">Importante:</strong> en el plan gratuito de algunos proveedores, el
                contenido que se envía puede usarse para mejorar sus productos y modelos, y personas del proveedor pueden
                leerlo. Es lo que dice Google para su plan gratuito de la Gemini API, según la cita de arriba. Si no querés
                que lo que escribís pase por ahí, no uses a Punto y escribinos directamente.
              </p>
            </div>

            <div>
              <h2 className={H2}>Tus derechos (Ley 25.326)</h2>
              <p className="mb-3">
                En Argentina, los datos personales están protegidos por la Ley 25.326 de Protección de los Datos
                Personales. Como titular de tus datos podés pedirnos acceso a ellos, y que los rectifiquemos, actualicemos
                o suprimamos, escribiendo a {contacto}.
              </p>
              <p>
                La Agencia de Acceso a la Información Pública es el órgano de control de esa ley y recibe las denuncias y
                reclamos por su incumplimiento.
              </p>
            </div>

            <div>
              <h2 className={H2}>Cambios en esta política</h2>
              <p>
                Si cambiamos algo, actualizamos esta página y la fecha de arriba. Vigente desde: {ACTUALIZADA}.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
