# Formato de las respuestas de Punto: antes y después

Corridas del 2026-11-18 con `scripts/probar-punto.mjs` (batería de 20 preguntas, resultado completo en `pruebas.md`) y dos preguntas sueltas.

## Dónde ocurría el problema

Solo en **Groq** (`openai/gpt-oss-120b`). Con el prompt anterior, en 3 de 3 corridas aisladas devolvió espacio fino U+202F como separador de miles ("$80 000"), guion no separable U+2011 en los rangos ("3‑5 días"), `**negritas**` y listas con "- " (5 viñetas, 99 a 129 palabras). **Gemini** y **Cloudflare** respondieron limpios (sin U+202F, U+2011 ni `**`, 39 a 54 palabras). El panel mostraba el texto crudo, así que el markdown se veía literal.

Conteo sobre las 20 respuestas de la batería: antes 10 U+202F, 1 U+2011 y 8 `**`; después 0 U+202F, 0 U+2011 y 0 `**` (los `**` que quedan en `pruebas.md` son los del encabezado del documento). Las banderas de formato nuevas dieron 0 en las 20 respuestas, y en la corrida de "antes" las mismas banderas marcarían el ejemplo de Groq con 5 problemas (comprobado con una respuesta sintética).

## Cinco respuestas

**1. Precio general: "¿Cuánto sale una web?"** (Groq)

- Antes (80 palabras): "Depende del tipo de web que necesites. Tenés tres opciones principales: - **Presencia Web Esencial** (ideal para gasistas, electricistas, dentistas, peluquerías) → desde $80 000, 3‑5 días. - **Landing Page Profesional** (...) → desde $400 000, 1‑2 semanas. - **Sitio Web Corporativo** (...) → desde $800 000, 3‑5 semanas. ¿Me podés contar un poco de tu rubro y si ya tenés una web? Así afinamos cuál le conviene más."
- Después (37 palabras): "Arrancamos con la Presencia Web Esencial, que es nuestro punto de partida: desde $80.000 y se entrega en 3 a 5 días. El precio final depende de lo que necesite tu negocio. ¿A qué rubro te dedicás?"

**2. Rubro específico: "Tengo una peluquería en La Plata y quiero que me encuentren en Google. ¿Qué me recomiendan?"** (Gemini; Groq dio 503 con el prompt anterior por el límite gratuito)

- Antes: "¡Hola! Para una peluquería te va perfecto el plan Presencia Web Esencial, que está desde $80.000 y se arma en pocos días. 🌐 Contame, ¿ya tenés alguna red social o querés armar tu primer sitio desde cero?"
- Después (Gemini): "Para tu peluquería te recomiendo Presencia Web Esencial, que es nuestro punto de partida. Arranca desde $80.000 y está lista en 3 a 5 días para que tus clientes te encuentren fácil en Google. ¿Querés que sigamos charlando con el equipo por WhatsApp para avanzar?"
- Después (Groq, 54 palabras): recomienda una sola opción con "desde $80.000" y "3 a 5 días", ofrece WhatsApp y emite `[WHATSAPP]`. **Revisar:** dice que incluye "SEO local", algo que el catálogo no afirma (el servicio incluye SEO básico). Es una afirmación que el modelo agregó; ver pendiente abajo.

**3. Plazos: "¿Cuánto tarda una landing page?"**

- Antes: "Una Landing Page Profesional tarda entre 1 y 2 semanas, aunque los plazos exactos dependen de cada proyecto. ¿Ya tenés un negocio o emprendimiento en mente?"
- Después: "Una Landing Page Profesional tiene un plazo de referencia de 1 a 2 semanas. El valor final depende de lo que necesites para tu negocio. ¿A qué se dedica tu emprendimiento?" (Gemini en ambas.)

**4. Hosting: "¿El hosting está incluido en el precio?"** (Gemini en ambas)

- Antes y después, igual: "Eso lo define el equipo. ¿Querés seguir por WhatsApp?" con `[WHATSAPP]`. No afirma ni niega nada, como pide `docs/pendientes.md`.

**5. Fuera de alcance: "¿Quién ganó el último mundial de fútbol?"**

- Antes: "Eso no es lo mío. ¿Estás buscando armar una web o un sistema para algún proyecto? 🌐"
- Después: "Eso no es lo mío. En SCdev nos dedicamos a armar webs, sistemas y automatizaciones para negocios. ¿Te puedo ayudar con algo de eso?" (sin emoji)

## Cómo se ve en el panel

`docs/capturas/punto-formato/panel-lista-375.png` y `panel-lista-1440.png`: una respuesta con lista y precios tal como la escribe gpt-oss (con `**`, U+202F y U+2011), ya normalizada y con viñetas rojas. Se generan con `node scripts/capturar-punto-formato.mjs` (mockea `/api/punto`, no gasta cuota).

## Pendientes que quedaron a la vista

- TODO(santi): Groq agregó "SEO local" en la respuesta de la peluquería. No está en el conocimiento. Si molesta, agregar una regla "no describás qué incluye cada servicio más allá de lo que dice tu información".
- Las banderas automáticas no detectan este tipo de agregados (como ya decía `CLAUDE.md`): leer las respuestas después de cada cambio de prompt.
- El prompt usa un ejemplo con corchetes ("desde [precio del servicio de entrada]") para no escribir precios en el prompt. Si el modelo llegara a devolver los corchetes literales, hay que cambiar el ejemplo; en las corridas no pasó.
