# Cuadra · delivery y viajes del barrio

Maqueta navegable de **Cuadra**, una app de barrio pensada para el centro de Berazategui (Buenos Aires): delivery de comercios del barrio, **Cuadra Viajes** (remises y fletes con choferes habilitados) y seguridad vecinal. Sirve para mostrarles a comercios, remiserías y vecinos cómo funcionaría antes de construirla de verdad.

**Ver la maqueta:** https://nudge-digital-lab.github.io/cuadra-maqueta/

> Todo es de ejemplo: comercios, choferes, remiserías, patentes, precios, cámaras y alertas son ficticios. No se cobra nada, ningún pedido llega a un comercio real y ningún viaje llega a un chofer real.

## Qué se puede probar

**App del vecino** (se usa desde el celu y se puede instalar como app)
- Inicio con buscador, categorías (Rotiserías, Pizzerías, Heladerías, Almacenes, Farmacias, Kioscos), acceso rápido **“Pedí un remis”**, destacados y “Abiertos ahora” calculado con la hora real
- Página de cada comercio: horario, demora, envío, pedido mínimo y menú por secciones
- Carrito con cantidades, nota para el comercio y totales
- Checkout con dirección, Mercado Pago o efectivo (simulado) y confirmación
- Seguimiento del pedido: Recibido → En preparación → En camino → Entregado, con mapa del recorrido
- Mis pedidos con pestañas **Delivery** y **Viajes**, y “Repetir pedido” / “Repetir viaje”
- Perfil con datos, direcciones guardadas y formas de pago, compartidos entre delivery y viajes

**Cuadra Viajes** (pestaña “Viajes” de la barra inferior)
- Mapa real de Berazategui (Leaflet + OpenStreetMap, sin API key) con autos disponibles moviéndose cerca
- Origen (ubicación actual simulada o dirección guardada) y destino (direcciones guardadas o 8 lugares frecuentes del barrio)
- Recorrido dibujado por calles reales entre origen y destino
- Tipo de viaje: Remis, Remis grande (hasta 6) o Flete chico, con tarifa estimada (bajada de bandera + precio por km, adicional nocturno), tiempo de llegada y distancia
- Pago en efectivo o Mercado Pago (simulado)
- Búsqueda de chofer con animación y asignación en 3 a 5 segundos
- Chofer asignado: foto (avatar ilustrado), calificación, auto, patente, remisería y número de habilitación municipal, con licencia, seguro, VTV y habilitación verificados a la vista
- Seguimiento en vivo: el auto va hacia vos y después al destino (Chofer en camino → Llegó → En viaje → Finalizado)
- Final: resumen con el detalle de la tarifa, calificación con estrellas y propina opcional
- Seguridad del viaje: **Compartir viaje** (link de seguimiento que ve un familiar), **SOS** con confirmación y cuenta regresiva, y **chat** con el chofer con mensajes rápidos (“Ya bajo”, “Estoy en la puerta”)

**App del chofer** (`#/chofer`)
- Switch Conectado / Desconectado
- Solicitud entrante con origen, destino, distancia, tarifa y forma de pago, con cuenta regresiva de 15 segundos para aceptar o rechazar
- Navegación simulada al pasajero y al destino con botones de estado (Llegué → Empezar viaje → Finalizar viaje) y cobro al final
- Ganancias del día y de la semana, cantidad de viajes, calificación y gráfico de los últimos 7 días
- Documentación: licencia, seguro, VTV y habilitación con vencimientos y estado de revisión

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
- Delivery: métricas, comercios adheridos, zonas de cobertura, comisión y costo de envío
- Viajes:
  - **Choferes**: remiserías adheridas, alta de chofer y de remisería, verificación de documentos y suspensión con motivo
  - **Tarifas de viajes**: bajada de bandera, precio por km, adicional nocturno, espera y comisión de la plataforma, con vista previa de precios
  - **Viajes en vivo**: mapa con choferes conectados y viajes activos, y métricas del día (viajes, facturación, comisión y espera promedio)

### Recorrido sugerido para una demo

**Delivery**
1. Entrá a un comercio abierto, agregá productos y confirmá el pedido.
2. Mirá el seguimiento: el pedido avanza solo cada ~20 segundos.
3. Hacé otro pedido y andá al **Panel del comercio**: ahí lo aceptás y lo movés vos.

**Viajes**
1. Tocá **Pedí un remis**, elegí un destino (por ejemplo, Quilmes centro) y mirá los precios de cada tipo de viaje.
2. Pedí el viaje: en unos segundos se asigna un chofer y el auto se mueve en el mapa.
3. Probá **Compartir viaje**, el **chat** y el botón **SOS** mientras dura el viaje.
4. Al llegar, calificá al chofer y dejale propina.
5. Andá a la **App del chofer**, conectate y aceptá una solicitud. Si con el chofer conectado pedís un viaje desde la app del vecino, la solicitud te llega a vos.
6. En **Admin → Viajes en vivo** vas a ver la flota y tus viajes activos. En **Tarifas de viajes** cambiá el precio por km y fijate cómo cambian las cotizaciones.

Todo lo que hacés queda guardado en tu navegador. Para volver a los datos de ejemplo: Perfil → Reiniciar la demo.

## Cómo correrla

Es HTML, CSS y JavaScript sin build. La única dependencia externa es Leaflet (se carga desde unpkg) y los mapas usan los tiles de OpenStreetMap y el ruteo público de OSRM, así que necesita conexión a internet.

```bash
git clone https://github.com/nudge-digital-lab/cuadra-maqueta.git
cd cuadra-maqueta
python3 -m http.server 8000
# abrí http://localhost:8000
```

### Publicación

- **GitHub Pages** (activo): cada push a `main` se publica solo.
- **Vercel**: se puede importar el repo tal cual (Framework preset: *Other*, sin comando de build).

## Estructura

```
index.html            Esqueleto de la página, manifest, fuentes y Leaflet
styles.css            Identidad visual y componentes compartidos
data.js               Datos de delivery: 12 comercios con su menú, 6 cámaras, 8 alertas, 5 pedidos, zonas y configuración
app.js                Ruteo por #hash, estado (localStorage), pantallas de delivery, seguridad y paneles.
                      Expone window.Cuadra con puntos de extensión para sumar módulos.
viajes-data.js        Datos de viajes: 10 choferes, 3 remiserías, 8 lugares frecuentes, 6 viajes, tipos y tarifas
viajes.js             Núcleo de Viajes: estado, tarifas, mapas, ruteo y flujo del pasajero
viajes-seguridad.js   Compartir viaje, SOS, chat con el chofer y cierre con calificación
viajes-chofer.js      App del chofer
viajes-admin.js       Pestañas de viajes del panel admin
viajes.css            Estilos del módulo de viajes
manifest.json         Datos para instalarla como app (PWA)
sw.js                 Service worker: abre sin conexión
icons/                Íconos de la app
```

### Rutas

| Ruta | Pantalla |
|---|---|
| `#/` | Inicio |
| `#/buscar?q=&cat=` | Búsqueda y categorías |
| `#/local/:id` | Comercio |
| `#/carrito`, `#/checkout` | Carrito y confirmación |
| `#/pedidos`, `#/pedidos/:id` | Mis pedidos (delivery) y seguimiento |
| `#/pedidos?tab=viajes` | Historial de viajes |
| `#/viajes` | Pedir un viaje: mapa, origen y destino |
| `#/viajes/cotizar` | Tipo de viaje, tarifa y forma de pago |
| `#/viajes/:id` | Búsqueda de chofer, seguimiento en vivo y resumen final |
| `#/viajes/:id/chat` | Chat con el chofer |
| `#/viajes/seguir/:id` | Link de seguimiento compartido |
| `#/seguridad`, `#/seguridad/alertas`, `#/seguridad/camara/:id` | Seguridad barrial |
| `#/perfil` | Perfil |
| `#/chofer`, `#/chofer/ganancias`, `#/chofer/documentos` | App del chofer |
| `#/comercio/(pedidos\|menu\|horarios)` | Panel del comercio |
| `#/admin/(comercios\|zonas\|config)` | Panel admin: delivery |
| `#/admin/(choferes\|tarifas\|viajes)` | Panel admin: viajes |

## Próxima etapa

La maqueta valida la experiencia. Para pasarla a producto real:

**Base común**
1. **App en Next.js + TypeScript**: migrar las pantallas a componentes (App Router, Tailwind, Zustand) sobre la misma identidad y rutas.
2. **Backend con Supabase**: base de datos de comercios, menús, pedidos, choferes, viajes y usuarios, con login por celular (OTP) y permisos por rol (vecino, comercio, chofer, remisería, admin).
3. **Notificaciones push** (web push y, si se publica en tiendas, FCM/APNs): pedido aceptado, chofer asignado, chofer en la puerta, nueva solicitud para el chofer, alertas vecinales.

**Delivery**
4. **Pagos reales con Mercado Pago (split de pagos)**: cada comercio conecta su cuenta y la comisión de Cuadra se separa automáticamente en cada cobro. Reintegros automáticos si el comercio rechaza.
5. **App del repartidor** con ubicación en vivo para el seguimiento.

**Cuadra Viajes**
6. **Geolocalización real**: ubicación del vecino con permiso del navegador, búsqueda de direcciones (geocoding) y ajuste del punto de encuentro en el mapa.
7. **Asignación real de choferes con Supabase Realtime**: los choferes conectados publican su posición, la solicitud se ofrece por cercanía y calificación con tiempo límite, y pasa al siguiente si nadie la acepta. El pasajero ve el auto en vivo por el mismo canal.
8. **Pagos con Mercado Pago**: cobro al terminar el viaje con split entre chofer (o remisería) y plataforma; en efectivo, la comisión se descuenta de lo que se le acredita al chofer.
9. **Seguridad**: SOS conectado a contactos de confianza y a una central de monitoreo, grabación del recorrido, números enmascarados en llamadas y chat, y links de seguimiento que vencen al terminar el viaje.
10. **Requisitos de habilitación municipal**: antes de operar hay que confirmar con el Municipio de Berazategui el marco para remises y fletes (habilitación de agencia y de cada vehículo, licencia profesional, seguro con cobertura a pasajeros, VTV y los controles que pida la ordenanza vigente). La idea es trabajar **con las remiserías habilitadas del barrio**, no competir por fuera de la ley, y validar cada documento contra el padrón municipal.

**Seguridad barrial**
11. **Integración real de cámaras**: conectar las cámaras que ya tienen vecinos y comercios (RTSP → HLS/WebRTC por un servidor intermedio), con acceso solo para vecinos verificados, sin descarga y con registro de quién mira cada cámara. Convenio con el municipio y protocolo de privacidad antes de abrirlo.
12. **Moderación de alertas**: reportes, límite de publicaciones y revisión para evitar escraches y datos personales.

---

Mapas © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright). Ruteo: [OSRM](https://project-osrm.org/) (servidor público de demostración).

Maqueta hecha por [nudge](https://nudge.com.ar).
