# Ficha de Punto · mascota de SCdev

Punto es el punto rojo del logo "scdev." que cobra vida. Tiene forma de globo terráqueo (internet con cara). Lo usan todas las corridas de contenido: esta ficha define cómo se dibuja, cómo se mueve y cómo habla, para que salga siempre igual.

- Canvas de diseño (referencia visual): https://claude.ai/artifact/2FzmPrR2GdBfr2Du9rW1XT (lámina "C · Punto")
- Video de presentación (base de animación): `claude/video-punto-presentacion.html`

## Personalidad

- Curioso, simpático y directo. Le gusta revisar webs y encontrar lo que falla.
- Habla corto, como un mensaje de WhatsApp. Español rioplatense con vos.
- Habla en primera persona porque es un personaje, pero siempre como parte del equipo: "reviso webs con el equipo de SCdev", "en SCdev armamos...". Nunca se presenta como si él hiciera solo el trabajo, ni dice "mi agencia".
- No da precios ni promesas por su cuenta: el precio y el CTA van en el texto o en la placa final, con la voz del equipo.
- No se burla de los negocios que se revisan: señala el problema, no a la persona.

## Cómo se dibuja

SVG con `viewBox="0 0 120 120"`. Cuerpo: círculo `cx=60 cy=58 r=38`. Colores fijos: rojo #E3242B (degradé #F2535A → #E3242B → #B3161C), blanco #F5F5F4, negro #0B0B0C, sombra #26262A. Nunca otros colores, ropa ni cambios de forma.

```svg
<svg viewBox="0 0 120 120" width="520" height="520" role="img" aria-label="Punto">
  <defs>
    <radialGradient id="pg" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="#F2535A"/><stop offset="0.55" stop-color="#E3242B"/><stop offset="1" stop-color="#B3161C"/>
    </radialGradient>
    <clipPath id="pc"><circle cx="60" cy="58" r="38"/></clipPath>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.8 0 0 0 -0.75"/>
    </filter>
  </defs>
  <!-- sombra, piernas y brazo izquierdo -->
  <ellipse cx="60" cy="112" rx="28" ry="4" fill="#26262A"/>
  <path d="M50 92 L48 106" stroke="#F5F5F4" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M70 92 L72 106" stroke="#F5F5F4" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M23 66 L12 80" stroke="#F5F5F4" stroke-width="5" stroke-linecap="round" fill="none"/>
  <!-- brazo derecho: elegir UNA variante (ver Poses) -->
  <path d="M97 66 L108 80" stroke="#F5F5F4" stroke-width="5" stroke-linecap="round" fill="none"/>
  <!-- cuerpo globo -->
  <circle cx="60" cy="58" r="38" fill="url(#pg)"/>
  <g clip-path="url(#pc)">
    <rect x="20" y="18" width="80" height="80" filter="url(#grain)" opacity="0.28"/>
    <g transform="rotate(-18 60 58)" fill="none" stroke="#8F1016" stroke-opacity="0.6" stroke-width="1.4">
      <ellipse cx="60" cy="58" rx="16" ry="38"/><ellipse cx="60" cy="58" rx="31" ry="38"/>
      <path d="M60 10 L60 106"/><path d="M10 58 L110 58"/>
      <path d="M14 40 Q60 48 106 40"/><path d="M14 76 Q60 68 106 76"/>
    </g>
  </g>
  <ellipse cx="43" cy="33" rx="9" ry="4.5" fill="#FFFFFF" opacity="0.22" transform="rotate(-30 43 33)"/>
  <circle cx="60" cy="58" r="38" fill="none" stroke="#7A0D12" stroke-opacity="0.35" stroke-width="1"/>
  <!-- cara -->
  <ellipse cx="48" cy="52" rx="5" ry="7" fill="#F5F5F4"/><ellipse cx="72" cy="52" rx="5" ry="7" fill="#F5F5F4"/>
  <circle cx="49" cy="53" r="2.6" fill="#0B0B0C"/><circle cx="73" cy="53" r="2.6" fill="#0B0B0C"/>
  <path d="M50 70 Q60 78 70 70" fill="none" stroke="#0B0B0C" stroke-width="3.5" stroke-linecap="round"/>
</svg>
```

Si hay varios Punto en una misma página, los `id` del `<defs>` (pg, pc, grain) van una sola vez y los demás los referencian.

## Poses (brazo derecho)

Los brazos se dibujan ANTES del cuerpo, para que queden detrás.

- **Parado**: `<path d="M97 66 L108 80" .../>`
- **Saluda**: `<path d="M95 46 L108 28" .../>` + mano `<circle cx="109" cy="26" r="4.5" fill="#F5F5F4"/>`. Animado: `rotate(18·sin(t·9) 95 46)`.
- **Señala**: `<path d="M97 58 L114 58" .../>`. Para señalar algo de la pantalla, ubicar a Punto al costado de la captura con este brazo apuntando a lo que falla.
- **Con el celular**: `<path d="M96 62 L103 52" .../>` + `<rect x="99" y="28" width="16" height="26" rx="3" fill="#F5F5F4"/>` + `<rect x="102" y="32" width="10" height="17" rx="1" fill="#E3242B"/>`. Mirada hacia el celular (pupilas +2, -2.5).

Objetos permitidos en la mano: celular, lupa (círculo blanco con mango) y cartel blanco con texto corto. Nada más.

## Expresiones (boca y ojos)

- **Contento** (por defecto): `M50 70 Q60 78 70 70`
- **Serio / concentrado**: línea recta `M53 71 L67 71`
- **Sorprendido** (encontró un error): círculo `<ellipse cx="60" cy="72" rx="4" ry="5" fill="#0B0B0C"/>` y ojos un poco más grandes (ry 8)
- **Preocupado**: `M51 74 Q60 68 69 74`
- **Guiño**: un ojo en línea `M43 52 L53 52` (stroke negro 3)
- Mirada: mover las dos pupilas juntas, máximo ±2.5 en x e y.
- Parpadeo en video: escalar los ojos en Y a 0.1 durante 0,15 s, cada 3 o 4 s.

## Voz

Por ahora la voz de Punto es la de Santi grabada en una nota de voz, con el tono un poco más agudo (`--tono 1.12` en `render.py`). Para que hable, el SVG del video necesita dos bocas:

```svg
<path id="smile" d="M50 70 Q60 78 70 70" fill="none" stroke="#0B0B0C" stroke-width="3.5" stroke-linecap="round"/>
<ellipse id="talk" cx="60" cy="72" rx="7" ry="1" fill="#0B0B0C" opacity="0"/>
```

y en `renderAt(t)`:

```js
var boca = window.BOCA ? (window.BOCA[Math.floor(t * 30)] || 0) : 0;
var habla = boca > 0.06;
document.getElementById('smile').style.opacity = habla ? 0 : 1;
var talk = document.getElementById('talk');
talk.style.opacity = habla ? 1 : 0;
talk.setAttribute('ry', (1.5 + 6 * boca).toFixed(2));
talk.setAttribute('rx', (7 - 1.5 * boca).toFixed(2));
```

`render.py --voz` calcula `window.BOCA` del audio. Sin voz, Punto sonríe y el video anda igual. Si en la escena tiene otra expresión, esa expresión reemplaza a `smile` y se oculta mientras habla.

## Movimiento en video

- Flota: `y += sin(t·3)·8` cuando está quieto.
- Al aterrizar o cambiar de pose: aplastarse y estirarse (escala Y 0,8 → 1,1 → 1).
- Salto: arco de 0,8 s con `easeInOut`.
- Las líneas del globo se ven completas desde tamaño mediano; cuando está chico (en el logo o como ícono) va casi plano.
- En el logo "scdev." el punto queda chico y sin cara. Puede guiñar un ojo al final de un video como firma.

## Dónde va

- **Videos**: Punto es el presentador por defecto. Abre con el hook (aparece o salta a escena), señala cada uno de los 3 puntos del guion, y en el cierre vuelve al logo o se queda al lado del CTA. Ocupa como máximo un tercio de la pantalla para no tapar el texto.
- **Diagnósticos de webs**: Punto al costado de un marco de celular con la captura de la web revisada, señalando lo que falla (expresión sorprendido o preocupado). Las capturas reales las pone el equipo: dejar el marco con placeholder.
- **Carruseles**: opcional en la portada (placa 1) o en el cierre (placa 6), chico, en una esquina. No en todas las placas.
- **Historias**: en Dato rápido, Punto dice el dato. En Encuesta, puede sostener el cartel con la pregunta.
- **Zonas seguras**: respetar las de cada formato (en historias nada en los primeros 250 px ni en los últimos 340 px).
