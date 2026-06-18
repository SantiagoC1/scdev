export interface Servicio {
  id: string
  slug: string
  icon: string
  iconName: string
  nombre: string
  descripcion: string
  precio: string
  precioTipo: string
  pills: string[]
  tiempo: string
  para: string
  badge?: { texto: string; tipo: 'entrada' | 'popular' }
  waText: string
  incluye: { iconName: string; titulo: string; desc: string }[]
  paraQuien: string[]
  noIncluye: string[]
  proceso: { num: string; titulo: string; desc: string }[]
  stack: { nombre: string; icono: string }[]
  faq: { pregunta: string; respuesta: string }[]
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'presencia-web-esencial',
    slug: '/servicios/presencia-web-esencial',
    icon: '🌐',
    iconName: 'Globe',
    nombre: 'Presencia Web Esencial',
    descripcion: 'Para gasistas, electricistas, dentistas, peluquerías — el primer paso online.',
    precio: '$80.000 – $100.000',
    precioTipo: 'proyecto cerrado',
    pills: ['1 página scroll', 'responsive', 'botón WhatsApp', 'deploy incluido'],
    tiempo: '3–5 días',
    para: 'profesionales de oficio, microemprendimientos',
    badge: { texto: 'ENTRADA', tipo: 'entrada' },
    waText: 'Hola Santi! Me interesa el servicio de Presencia Web Esencial.',
    incluye: [
      { iconName: 'Palette', titulo: 'Diseño personalizado', desc: 'No es un template. Lo diseñamos específico para tu rubro y estilo.' },
      { iconName: 'Smartphone', titulo: 'Responsive (mobile)', desc: 'Se ve perfecto en celular, tablet y desktop.' },
      { iconName: 'MessageCircle', titulo: 'Botón WhatsApp', desc: 'Tus clientes te contactan con un solo click desde la web.' },
      { iconName: 'FileText', titulo: 'Formulario de contacto', desc: 'Para recibir consultas directamente a tu email.' },
      { iconName: 'Rocket', titulo: 'Deploy incluido', desc: 'Lo publicamos en internet. Vos no hacés nada técnico.' },
      { iconName: 'Zap', titulo: 'Entrega en 3–5 días', desc: 'Sin esperas de semanas. Rápido y funcional.' },
    ],
    paraQuien: [
      'Gasistas, plomeros, electricistas',
      'Dentistas y profesionales de la salud',
      'Peluquerías y barberías',
      'Kioscos y comercios pequeños',
      'Cualquier profesional de oficio que necesita ser encontrado online',
    ],
    noIncluye: [
      'Dominio propio (.com.ar — costo aparte)',
      'Logo (si no tenés, lo cotizamos aparte)',
      'Más de 1 ronda de revisiones',
      'Redacción de textos (el cliente provee contenido)',
    ],
    proceso: [
      { num: '01', titulo: 'Reunión inicial', desc: 'Entendemos tu negocio, rubro y qué querés comunicar.' },
      { num: '02', titulo: 'Diseño y propuesta', desc: 'Te mostramos el diseño antes de programar. Acordamos estilo.' },
      { num: '03', titulo: 'Desarrollo', desc: 'Programamos la página. La podés ver en un link de prueba.' },
      { num: '04', titulo: 'Entrega y deploy', desc: 'La publicamos, te explicamos cómo compartirla. Lista.' },
    ],
    stack: [
      { nombre: 'HTML5', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { nombre: 'CSS3', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { nombre: 'Git', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    ],
    faq: [
      { pregunta: '¿Necesito dominio propio?', respuesta: 'No es obligatorio para empezar. Podemos publicar en un subdominio gratuito. Si querés tu propio .com.ar, lo gestionamos nosotros.' },
      { pregunta: '¿Cuánto tarda realmente?', respuesta: '3 a 5 días hábiles desde que tenemos los textos y fotos de tu parte. El mayor cuello de botella suele ser esperar el contenido del cliente.' },
      { pregunta: '¿Me van a encontrar en Google?', respuesta: 'Incluimos SEO básico (meta tags, título, descripción). Para posicionarte en los primeros resultados de Google lleva tiempo y trabajo de contenido, pero el sitio queda correctamente indexado desde el día 1.' },
      { pregunta: '¿Qué pasa si quiero cambios después?', respuesta: 'El precio incluye 1 ronda de revisiones durante el proyecto. Cambios posteriores se cotizan aparte o podés contratar el plan de Mantenimiento Mensual.' },
    ],
  },
  {
    id: 'landing-page-profesional',
    slug: '/servicios/landing-page-profesional',
    icon: '🚀',
    iconName: 'Rocket',
    nombre: 'Landing Page Profesional',
    descripcion: 'Para comercios, profesionales y emprendimientos con identidad cuidada.',
    precio: '$400.000 – $700.000',
    precioTipo: 'proyecto cerrado',
    pills: ['React + Vite + Tailwind', 'animaciones', 'formulario', 'SEO básico', 'deploy'],
    tiempo: '1–2 semanas',
    para: 'profesionales, comercios, emprendimientos',
    badge: { texto: 'MÁS ELEGIDO', tipo: 'popular' },
    waText: 'Hola Santi! Me interesa una Landing Page Profesional.',
    incluye: [
      { iconName: 'Palette', titulo: 'Diseño a medida', desc: 'Identidad visual propia. No usamos templates genéricos.' },
      { iconName: 'Sparkles', titulo: 'Animaciones profesionales', desc: 'Framer Motion para transiciones y efectos que impresionan.' },
      { iconName: 'BarChart2', titulo: 'Formulario con Google Sheets', desc: 'Cada consulta llega a tu hoja de cálculo y a tu email.' },
      { iconName: 'Search', titulo: 'SEO básico completo', desc: 'Meta tags, Open Graph, sitemap, robots.txt.' },
      { iconName: 'TrendingUp', titulo: 'Google Analytics', desc: 'Sabés cuánta gente visita tu web y desde dónde llegan.' },
      { iconName: 'Rocket', titulo: 'Deploy en Vercel/Netlify', desc: 'Velocidad máxima. Gratis. Con SSL incluido.' },
    ],
    paraQuien: [
      'Agencias y estudios profesionales',
      'Consultorios y clínicas',
      'Estudios contables y jurídicos',
      'Startups buscando su primera web de impacto',
      'Emprendimientos que quieren diferenciarse',
    ],
    noIncluye: [
      'Múltiples idiomas',
      'E-commerce / tienda online',
      'Blog o CMS para actualizar contenido sin código',
      'Fotografía profesional',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery', desc: 'Analizamos tu negocio, competencia y qué querés lograr con el sitio.' },
      { num: '02', titulo: 'Diseño UI', desc: 'Wireframe y maqueta visual en Figma para acordar antes de programar.' },
      { num: '03', titulo: 'Desarrollo', desc: 'React + Vite + Tailwind + Framer Motion. Podés ver el avance diario.' },
      { num: '04', titulo: 'Deploy y entrega', desc: 'Publicamos en Vercel, conectamos el dominio y te hacemos un handoff completo.' },
    ],
    stack: [
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { nombre: 'TypeScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { nombre: 'Tailwind', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿En qué se diferencia de la Presencia Web Esencial?', respuesta: 'La Landing Page Profesional usa React con animaciones Framer Motion, tiene integración real con Google Sheets para captura de leads, SEO más trabajado y un proceso de diseño previo en Figma. Es para quienes quieren impresionar y convertir visitas en clientes.' },
      { pregunta: '¿Puedo ver ejemplos?', respuesta: 'Sí. El sitio de Balance Agency (somosbalance.com.ar) fue desarrollado con este mismo stack y proceso.' },
      { pregunta: '¿Cuántas revisiones incluye?', respuesta: 'Hasta 2 rondas de revisión durante el desarrollo. Cambios mayores de alcance se cotizan aparte.' },
      { pregunta: '¿El precio varía según el proyecto?', respuesta: 'Sí, el rango depende de la complejidad visual, cantidad de secciones y integraciones. En la reunión inicial te damos un precio fijo antes de arrancar.' },
    ],
  },
  {
    id: 'sitio-web-corporativo',
    slug: '/servicios/sitio-web-corporativo',
    icon: '🏢',
    iconName: 'Building2',
    nombre: 'Sitio Web Corporativo',
    descripcion: 'Para empresas con múltiples servicios, equipo o blog.',
    precio: '$800.000 – $1.500.000',
    precioTipo: 'proyecto cerrado',
    pills: ['hasta 6 páginas', 'Framer Motion', 'CMS liviano', 'SEO avanzado', 'Analytics'],
    tiempo: '3–5 semanas',
    para: 'PyMEs, agencias, clínicas',
    waText: 'Hola Santi! Me interesa un Sitio Web Corporativo.',
    incluye: [
      { iconName: 'File', titulo: 'Hasta 6 páginas', desc: 'Home, servicios, equipo, casos de estudio, blog, contacto.' },
      { iconName: 'FileText', titulo: 'CMS liviano', desc: 'Google Sheets o Notion como backend para actualizar contenido sin código.' },
      { iconName: 'Search', titulo: 'SEO avanzado', desc: 'Schema.org, sitemap dinámico, Open Graph, Core Web Vitals optimizados.' },
      { iconName: 'TrendingUp', titulo: 'Analytics completo', desc: 'Google Analytics 4 + Search Console configurados y conectados.' },
      { iconName: 'Sparkles', titulo: 'Animaciones', desc: 'Framer Motion en cada sección. Experiencia premium.' },
      { iconName: 'Mail', titulo: 'Leads a email', desc: 'Formulario conectado a Google Sheets + notificación instantánea.' },
    ],
    paraQuien: [
      'PyMEs con múltiples servicios que necesitan explicarlos bien',
      'Agencias y estudios creativos',
      'Clínicas con equipo de profesionales',
      'ONGs e instituciones',
      'Empresas que quieren un sitio que los represente seriamente',
    ],
    noIncluye: [
      'E-commerce / tienda con carrito de compras',
      'Más de 6 páginas (cotizar aparte)',
      'Contenido en múltiples idiomas',
      'Fotografía o videos de producción propia',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery y arquitectura', desc: 'Mapeamos todas las páginas, flujos y contenido necesario.' },
      { num: '02', titulo: 'Diseño UI completo', desc: 'Diseño de todas las páginas en Figma antes de programar.' },
      { num: '03', titulo: 'Desarrollo por sprints', desc: 'Entregamos por secciones para que puedas dar feedback continuo.' },
      { num: '04', titulo: 'QA y deploy', desc: 'Testeo en mobile, SEO audit, deploy y handoff completo.' },
    ],
    stack: [
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
      { nombre: 'TypeScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { nombre: 'Tailwind', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿Puedo actualizar el contenido yo mismo?', respuesta: 'Sí. Configuramos un CMS liviano con Google Sheets o Notion. Cambiás texto o imágenes en una planilla y el sitio se actualiza automáticamente.' },
      { pregunta: '¿Cuánto tarda?', respuesta: '3 a 5 semanas dependiendo de la cantidad de páginas y la velocidad con que el cliente aprueba diseños y provee contenido.' },
      { pregunta: '¿Incluye dominio y hosting?', respuesta: 'El deploy es en Vercel (gratuito y con SSL incluido). El dominio es un costo aparte que gestionamos juntos.' },
    ],
  },
  {
    id: 'sistema-a-medida',
    slug: '/servicios/sistema-a-medida',
    icon: '⚙️',
    iconName: 'Settings',
    nombre: 'Sistema / Plataforma a Medida',
    descripcion: 'Gestión de turnos, sistemas internos, plataformas con lógica de negocio real.',
    precio: '$1.500.000 – $4.000.000',
    precioTipo: 'por sprint o proyecto',
    pills: ['FastAPI / .NET', 'PostgreSQL / Supabase', 'auth + roles', 'Railway', 'documentación'],
    tiempo: '1–4 meses',
    para: 'startups, empresas medianas',
    waText: 'Hola Santi! Me interesa un Sistema o Plataforma a medida.',
    incluye: [
      { iconName: 'ClipboardList', titulo: 'Relevamiento detallado', desc: 'Documentamos cada requerimiento antes de escribir una línea de código.' },
      { iconName: 'Database', titulo: 'Arquitectura de base de datos', desc: 'Diseño del modelo de datos para que escale sin problemas.' },
      { iconName: 'Settings', titulo: 'Backend robusto', desc: 'FastAPI (Python) o .NET 8 según el caso. Auth, roles, APIs REST.' },
      { iconName: 'Monitor', titulo: 'Frontend React', desc: 'Panel de administración o interfaz de usuario según lo que necesite el sistema.' },
      { iconName: 'Rocket', titulo: 'Deploy en Railway', desc: 'Backend productivo, con CI/CD básico configurado.' },
      { iconName: 'BookOpen', titulo: 'Documentación técnica', desc: 'El sistema queda documentado para que cualquier dev pueda continuarlo.' },
    ],
    paraQuien: [
      'Startups con flujos de negocio complejos',
      'Clínicas que necesitan gestión de turnos propia',
      'Municipios y organismos públicos',
      'Empresas que quieren reemplazar Excel por un sistema real',
      'Emprendimientos con procesos que no encajan en un SaaS genérico',
    ],
    noIncluye: [
      'Mantenimiento post-entrega (cotizar plan aparte)',
      'Integraciones con sistemas legados no documentados',
      'Soporte 24/7',
      'Features fuera del alcance acordado sin nueva cotización',
    ],
    proceso: [
      { num: '01', titulo: 'Discovery técnico', desc: 'Relevamiento de requerimientos, flujos de usuario y definición de alcance.' },
      { num: '02', titulo: 'Arquitectura y diseño', desc: 'Modelo de datos, arquitectura del sistema y wireframes del frontend.' },
      { num: '03', titulo: 'Desarrollo por sprints', desc: 'Entregas funcionales cada 1–2 semanas. Feedback continuo.' },
      { num: '04', titulo: 'Testing y deploy', desc: 'QA funcional, deploy productivo y handoff con documentación.' },
    ],
    stack: [
      { nombre: 'FastAPI', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
      { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { nombre: 'PostgreSQL', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    ],
    faq: [
      { pregunta: '¿Cómo cotizan si no saben cuánto va a llevar?', respuesta: 'Hacemos un relevamiento detallado antes de dar precio. Una vez que tenemos los requerimientos claros, cotizamos por funcionalidades o por sprints según prefiera el cliente.' },
      { pregunta: '¿Puedo ver el código?', respuesta: 'Sí. El código fuente es tuyo. Lo entregamos en un repo de GitHub privado al finalizar el proyecto.' },
      { pregunta: '¿Qué pasa si necesito agregar features después?', respuesta: 'Se cotizan como un nuevo proyecto o sprint. Al tener documentación, el costo de agregar funcionalidades es mucho menor que empezar desde cero.' },
    ],
  },
  {
    id: 'automatizacion-whatsapp',
    slug: '/servicios/automatizacion-whatsapp',
    icon: '🤖',
    iconName: 'Bot',
    nombre: 'Automatización e IA / WhatsApp',
    descripcion: 'Bots de WhatsApp, automatización de procesos, pipelines con Python.',
    precio: '$300.000 – $900.000',
    precioTipo: 'proyecto cerrado',
    pills: ['WATI / WhatsApp API', 'Python', 'Apps Script', 'integración email'],
    tiempo: '1–3 semanas',
    para: 'clínicas, comercios, PyMEs con procesos repetitivos',
    waText: 'Hola Santi! Me interesa automatizar procesos con IA o WhatsApp.',
    incluye: [
      { iconName: 'MessageCircle', titulo: 'Bot de WhatsApp', desc: 'Configuración de WATI con flujos de conversación personalizados para tu negocio.' },
      { iconName: 'RefreshCw', titulo: 'Flujos automáticos', desc: 'Respuestas automáticas, gestión de turnos, recordatorios y seguimiento.' },
      { iconName: 'BarChart2', titulo: 'Integración con Sheets', desc: 'Cada interacción queda registrada en tu Google Sheets automáticamente.' },
      { iconName: 'Mail', titulo: 'Notificaciones email', desc: 'Recibís un email cuando alguien completa un flujo o hace una consulta.' },
      { iconName: 'GraduationCap', titulo: 'Capacitación al equipo', desc: 'Te enseñamos a usar y administrar el sistema.' },
      { iconName: 'ClipboardList', titulo: '1 mes de soporte', desc: 'Soporte técnico post-entrega para ajustes y dudas.' },
    ],
    paraQuien: [
      'Consultorios que gestionan turnos por WhatsApp manualmente',
      'Comercios con preguntas repetitivas de clientes',
      'Empresas que quieren atender fuera del horario laboral',
      'Negocios con procesos de aprobación o seguimiento manuales',
      'Cualquier PyME que quiere ahorrar tiempo en tareas repetitivas',
    ],
    noIncluye: [
      'Licencia de WATI (costo mensual aparte)',
      'Número de WhatsApp Business nuevo (podemos migrar el tuyo)',
      'Integraciones con CRMs de terceros no estándar',
    ],
    proceso: [
      { num: '01', titulo: 'Mapeo de procesos', desc: 'Identificamos qué tareas se pueden automatizar y cuánto tiempo te van a ahorrar.' },
      { num: '02', titulo: 'Diseño de flujos', desc: 'Diseñamos los árboles de conversación y flujos de automatización.' },
      { num: '03', titulo: 'Configuración', desc: 'Implementamos en WATI, conectamos con Sheets y testeamos cada flujo.' },
      { num: '04', titulo: 'Capacitación y entrega', desc: 'Te enseñamos a administrarlo y lo dejamos funcionando.' },
    ],
    stack: [
      { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { nombre: 'Git', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
      { nombre: 'Figma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
    faq: [
      { pregunta: '¿Necesito tener WATI ya contratado?', respuesta: 'No. Te ayudamos a contratar y configurar WATI desde cero. El costo de la licencia de WATI va aparte de nuestro servicio.' },
      { pregunta: '¿Puedo conservar mi número de WhatsApp actual?', respuesta: 'En la mayoría de los casos sí. La migración a WhatsApp Business API suele funcionar con el número existente.' },
      { pregunta: '¿Qué tan complejo puede ser el bot?', respuesta: 'Desde respuestas automáticas simples hasta flujos de múltiples pasos con lógica condicional, integración con Google Sheets y notificaciones. El precio varía según la complejidad.' },
      { pregunta: '¿Qué pasa si el bot no responde bien?', respuesta: 'El primer mes de soporte está incluido para ajustes. Después podés contratar el plan de mantenimiento mensual.' },
    ],
  },
]
