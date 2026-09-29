# Cuadra · delivery del barrio

Maqueta navegable de **Cuadra**, una app de delivery barrial pensada para el centro de Berazategui (Buenos Aires). Sirve para mostrarles a comercios y vecinos cómo funcionaría la app antes de construirla de verdad.

**Ver la maqueta:** https://nudge-digital-lab.github.io/cuadra-maqueta/

> Todo es de ejemplo: los comercios, precios, cámaras y alertas son ficticios, no se cobra nada y ningún pedido llega a un comercio real.

## Qué se puede probar

**App del vecino** (se usa desde el celu, se puede instalar como app)
- Inicio con buscador, categorías (Rotiserías, Pizzerías, Heladerías, Almacenes, Farmacias, Kioscos), destacados y “Abiertos ahora” calculado con la hora real
- Página de cada comercio: horario, demora, envío, pedido mínimo y menú por secciones
- Carrito con cantidades, nota para el comercio y totales
- Checkout con dirección, Mercado Pago o efectivo (simulado) y confirmación
- Seguimiento del pedido: Recibido → En preparación → En camino → Entregado, con mapa del recorrido y la moto moviéndose
- Mis pedidos con “Repetir pedido”
- Perfil con datos y direcciones guardadas

**Seguridad barrial**
- Grilla de 6 cámaras por esquina con “En vivo” simulado y vista a pantalla completa
- Feed de alertas vecinales con filtros, “Me sirve” y publicación de alertas nuevas
- Aviso de privacidad y uso responsable siempre visible

**Panel del comercio** (`#/comercio`)
- Pedidos entrantes: aceptar, rechazar con motivo y avanzar el estado
- Menú: alta, edición, borrado y pausa de productos sin stock
- Horarios por día y turnos, y switch de abierto/cerrado
- Resumen del día: pedidos, facturación y comisión

**Panel admin** (`#/admin`)
- Métricas generales con gráfico de pedidos por día
- Comercios adheridos, alta de comercio nuevo y pausa
- Zonas de cobertura con recargo de envío
- Comisión (%) y costo de envío, con vista previa de cómo se reparte un pedido

### Recorrido sugerido para una demo

1. Entrá a un comercio abierto, agregá productos y confirmá el pedido.
2. Mirá el seguimiento: el pedido avanza solo cada ~20 segundos.
3. Hacé otro pedido y andá al **Panel del comercio**: ahí lo aceptás y lo movés vos (mientras estés en el panel, no avanza solo).
4. Desde el panel, pausá un producto y fijate que en la app aparece “Sin stock”.
5. En **Seguridad**, abrí una cámara y publicá una alerta.
6. En **Admin**, cambiá la comisión y el envío, y fijate cómo cambian los números del comercio.

Todo lo que hacés queda guardado en tu navegador. Para volver a los datos de ejemplo: Perfil → Reiniciar la demo.

## Cómo correrla

Es HTML, CSS y JavaScript sin dependencias ni build. Para verla en tu compu:

```bash
git clone https://github.com/nudge-digital-lab/cuadra-maqueta.git
cd cuadra-maqueta
python3 -m http.server 8000
# abrí http://localhost:8000
```

Abrir el `index.html` con doble clic también funciona; lo único que se pierde es la instalación como app, porque el service worker necesita `http://`.

### Publicación

- **GitHub Pages** (activo): cada push a `main` se publica solo.
- **Vercel**: se puede importar el repo tal cual (Framework preset: *Other*, sin comando de build).

## Estructura

```
index.html      Esqueleto de la página, manifest y fuentes
styles.css      Identidad visual y componentes
data.js         Datos de ejemplo: 12 comercios con su menú, 6 cámaras, 8 alertas, 5 pedidos, zonas y configuración
app.js          Ruteo por #hash, estado (localStorage) y todas las pantallas
manifest.json   Datos para instalarla como app (PWA)
sw.js           Service worker: abre sin conexión
icons/          Íconos de la app
```

Rutas principales:

| Ruta | Pantalla |
|---|---|
| `#/` | Inicio |
| `#/buscar?q=&cat=` | Búsqueda y categorías |
| `#/local/:id` | Comercio |
| `#/carrito`, `#/checkout` | Carrito y confirmación |
| `#/pedidos`, `#/pedidos/:id` | Mis pedidos y seguimiento |
| `#/seguridad`, `#/seguridad/alertas`, `#/seguridad/camara/:id` | Seguridad barrial |
| `#/perfil` | Perfil |
| `#/comercio/(pedidos\|menu\|horarios)` | Panel del comercio |
| `#/admin/(comercios\|zonas\|config)` | Panel admin |

## Próxima etapa

La maqueta valida la experiencia. Para pasarla a producto real:

1. **App en Next.js + TypeScript**: migrar las pantallas a componentes (App Router, Tailwind, Zustand) sobre la misma identidad y rutas.
2. **Backend con Supabase**: base de datos de comercios, menús, pedidos y usuarios, con login por celular (OTP), permisos por rol (vecino, comercio, admin) y pedidos en tiempo real para el panel del comercio.
3. **Pagos reales con Mercado Pago (split de pagos)**: cada comercio conecta su cuenta y, en cada cobro, la comisión de Cuadra se separa automáticamente (marketplace de Mercado Pago). Reintegros automáticos cuando el comercio rechaza un pedido.
4. **App del repartidor**: recibir viajes, marcar retiro y entrega, y compartir la ubicación en vivo para el seguimiento del vecino.
5. **Integración real de cámaras**: conectar las cámaras que ya tienen vecinos y comercios (RTSP → HLS/WebRTC por un servidor intermedio), con acceso solo para vecinos verificados, sin descarga y con registro de quién mira cada cámara. Convenio con el municipio y protocolo de privacidad antes de abrirlo.
6. **Moderación de alertas**: reportes, límite de publicaciones y revisión para evitar escraches y datos personales.

---

Maqueta hecha por [nudge](https://nudge.com.ar).
