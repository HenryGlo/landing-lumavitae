# Prompt para Claude — botones de reserva y compra en la landing de Luma Vitae

Copiar y pegar todo lo que sigue.

---

Trabajás en la landing de **Luma Vitae**, un estudio de pilates en Ciudad de
Panamá. La landing está en `~/Desktop/codeflakes/Landinghub/landing-lumavitae/`
y es un único `index.html`. Se publica en `pilateslumavitae.com` con
`./deploy.sh`, que copia a `~/dev/infra` y despliega — **no lo ejecutes salvo
que te lo pidan explícitamente**.

Su sistema de reservas ya está funcionando y hay que enlazarlo desde la landing.
Los enlaces son públicos y no piden sesión: podés abrirlos en el navegador para
comprobarlos.

## Los enlaces

| Para | URL |
|---|---|
| Reservar clase de reformer | `https://pilates-luma-vitae.perfectflow.cloud/es/agendar` |
| Catálogo completo de paquetes | `https://pilates-luma-vitae.perfectflow.cloud/es/paquetes` |
| Paquetes de reformer | `.../es/paquetes?clase=reformer` |
| Paquetes de sesión privada | `.../es/paquetes?clase=privada` |
| Paquetes de dúo | `.../es/paquetes?clase=duo` |

Para un paquete concreto: `.../es/paquetes?plan=<slug>`. Los slugs son
`reformer-1-clase`, `reformer-4-clases`, `reformer-8-clases`,
`reformer-12-clases`, `privada-1-sesion`, `privada-4-sesiones`,
`privada-8-sesiones`, `privada-12-sesiones`, `duo-1-sesion`, `duo-4-sesiones`,
`duo-8-sesiones`.

## Qué hay que hacer

1. Un botón principal **"Reservar mi clase"** en el hero → `/es/agendar`.
2. Un botón **"Comprar paquete"** en la sección de planes → `/es/paquetes`.
3. La landing ya tiene secciones por tipo de clase (busca `#classes`, `#planes`,
   `#products`, y las menciones a reformer, privada y dúo). Cada una debe llevar
   a su enlace filtrado.

## La regla que más importa

**Solo el reformer se reserva en línea.** Las sesiones privadas y los dúos se
coordinan por WhatsApp: sus paquetes sí se compran en línea, pero la clase se
agenda hablando con el estudio.

Por lo tanto, en las secciones de privadas y dúo el botón debe ser **"Comprar
paquete"** o **WhatsApp**, nunca "Reservar". Un botón de reservar ahí lleva a
una página que no ofrece esas clases, y el usuario se topa con un callejón sin
salida.

La landing ya tiene el WhatsApp del estudio: `https://wa.me/50765753861`.
Reutilizá ese número, no inventes otro.

## Precios — leer antes de tocar nada

No pongas precios en los botones. Los precios viven en el sistema de reservas,
cambian ahí, y una landing con precios viejos es peor que una sin precios.

**Ojo con esto:** la landing **ya tiene precios escritos a mano** en el HTML
($17, $18, $21, $25, $31, $150, $155, $210, $260, $290 y algunos más). No los
borres por tu cuenta, pero **comprobá si coinciden con lo que muestra
`/es/paquetes` y avisá si no coinciden**. Si ya están desfasados, decilo antes
de seguir: es un problema mayor que el de los botones y el cliente debería
decidir si quiere quitarlos o corregirlos.

## Detalles de implementación

- **No abras en pestaña nueva.** La landing usa `target="_blank"` en 7 sitios,
  todos enlaces externos (Instagram, TikTok, Google Maps, Waze). El sistema de
  reservas es el mismo negocio, así que va en la misma pestaña. La excepción es
  WhatsApp, que ya se abre aparte y debe seguir igual.
- Reutilizá los estilos de botón que ya existan en la landing. No introduzcas un
  componente nuevo si ya hay uno.
- Mantené el mismo tono de los textos que ya están en la página.

## Antes de terminar

- Abrí la landing en el navegador y comprobá que **cada botón nuevo lleva a
  donde dice**, no solo que el HTML esté bien escrito.
- Comprobá que los enlaces filtrados devuelven la clase correcta: entrá a
  `?clase=privada` y confirmá que no muestra reformer.
- Revisá que ningún botón de "Reservar" quedó en las secciones de privada o dúo.
- Contame qué cambiaste y qué encontraste con los precios.
