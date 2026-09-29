// Datos de ejemplo de Cuadra. Todo es ficticio: nombres, precios y direcciones
// son creíbles para el centro de Berazategui pero no corresponden a comercios reales.
window.CUADRA_DATA = {
  categorias: [
    { id: "rotiserias", nombre: "Rotiserías", emoji: "🍗", color: "#F6D9C4" },
    { id: "pizzerias", nombre: "Pizzerías", emoji: "🍕", color: "#F9E0B8" },
    { id: "heladerias", nombre: "Heladerías", emoji: "🍦", color: "#E4DDF3" },
    { id: "almacenes", nombre: "Almacenes", emoji: "🛒", color: "#D8EBDD" },
    { id: "farmacias", nombre: "Farmacias", emoji: "💊", color: "#D6E7F2" },
    { id: "kioscos", nombre: "Kioscos", emoji: "🍫", color: "#F3DADF" }
  ],

  // pos: esquina en la grilla del mapa (c = calle 12 a 21, r = calle 147 a 153)
  comercios: [
    {
      id: "la-esquina-de-tito", nombre: "La Esquina de Tito", cat: "rotiserias", emoji: "🍗", color: "#C8553D",
      direccion: "Av. 14 y 148", pos: { c: 14, r: 148 }, rating: 4.8, resenas: 312, demora: "30-45", envioExtra: 0, pedidoMin: 6000,
      horario: [["11:00", "15:00"], ["19:30", "23:30"]], diasCerrado: [], destacado: true,
      descripcion: "Pollo al spiedo y minutas de toda la vida. Desde 1987 en la misma esquina.",
      menu: [
        { id: "t1", seccion: "Minutas", nombre: "Milanesa napolitana con fritas", desc: "De ternera, con jamón, queso y salsa. Viene con papas fritas.", precio: 13900, emoji: "🍽️" },
        { id: "t2", seccion: "Minutas", nombre: "Milanesa de pollo con puré", desc: "Pechuga rebozada con puré de papas casero.", precio: 12500, emoji: "🍽️" },
        { id: "t3", seccion: "Minutas", nombre: "Suprema a la suiza", desc: "Suprema con salsa blanca y queso gratinado.", precio: 13200, emoji: "🧀" },
        { id: "t4", seccion: "Pollo", nombre: "Pollo al spiedo entero", desc: "Dorado a la leña, con chimichurri aparte.", precio: 16500, emoji: "🍗" },
        { id: "t5", seccion: "Pollo", nombre: "Medio pollo al spiedo", desc: "Ideal para dos.", precio: 9200, emoji: "🍗" },
        { id: "t6", seccion: "Guarniciones", nombre: "Papas fritas", desc: "Porción grande, cortadas en el día.", precio: 5200, emoji: "🍟" },
        { id: "t7", seccion: "Guarniciones", nombre: "Ensalada mixta", desc: "Lechuga, tomate y cebolla.", precio: 4800, emoji: "🥗" },
        { id: "t8", seccion: "Guarniciones", nombre: "Puré de calabaza", desc: "Con un toque de manteca.", precio: 4500, emoji: "🎃" },
        { id: "t9", seccion: "Tartas", nombre: "Tarta de jamón y queso", desc: "Entera, 8 porciones.", precio: 9800, emoji: "🥧" },
        { id: "t10", seccion: "Bebidas", nombre: "Coca-Cola 1,5 L", desc: "", precio: 3900, emoji: "🥤" },
        { id: "t11", seccion: "Bebidas", nombre: "Agua sin gas 1,5 L", desc: "", precio: 2100, emoji: "💧" }
      ]
    },
    {
      id: "dona-marta", nombre: "Doña Marta Comidas Caseras", cat: "rotiserias", emoji: "🥟", color: "#9C6644",
      direccion: "Calle 149 e/ 13 y 14", pos: { c: 13, r: 149 }, rating: 4.9, resenas: 187, demora: "35-50", envioExtra: 0, pedidoMin: 5000,
      horario: [["11:30", "15:00"], ["19:00", "23:00"]], diasCerrado: [0], destacado: true,
      descripcion: "Empanadas y platos de olla como los de casa. Cocina Marta, reparte el hijo.",
      menu: [
        { id: "m1", seccion: "Empanadas", nombre: "Empanada de carne cortada a cuchillo", desc: "Al horno, jugosa.", precio: 1700, emoji: "🥟" },
        { id: "m2", seccion: "Empanadas", nombre: "Empanada de jamón y queso", desc: "", precio: 1600, emoji: "🥟" },
        { id: "m3", seccion: "Empanadas", nombre: "Empanada de pollo", desc: "Con cebolla de verdeo.", precio: 1600, emoji: "🥟" },
        { id: "m4", seccion: "Empanadas", nombre: "Docena surtida", desc: "Elegí los gustos en la nota del pedido.", precio: 17500, emoji: "🧺" },
        { id: "m5", seccion: "Platos del día", nombre: "Canelones de verdura", desc: "Con salsa mixta. Porción abundante.", precio: 10800, emoji: "🍝" },
        { id: "m6", seccion: "Platos del día", nombre: "Guiso de lentejas", desc: "Con chorizo colorado y panceta.", precio: 9900, emoji: "🍲" },
        { id: "m7", seccion: "Platos del día", nombre: "Tallarines caseros con tuco", desc: "", precio: 9200, emoji: "🍝" },
        { id: "m8", seccion: "Platos del día", nombre: "Tarta de verdura", desc: "Entera, acelga y huevo.", precio: 9500, emoji: "🥧" },
        { id: "m9", seccion: "Postres", nombre: "Flan casero con dulce de leche", desc: "", precio: 4200, emoji: "🍮" },
        { id: "m10", seccion: "Postres", nombre: "Budín de pan", desc: "Con caramelo.", precio: 3800, emoji: "🍰" },
        { id: "m11", seccion: "Bebidas", nombre: "Pomelo 1,5 L", desc: "", precio: 3600, emoji: "🥤" },
        { id: "m12", seccion: "Bebidas", nombre: "Vino tinto 1 L", desc: "Solo para mayores de 18.", precio: 4500, emoji: "🍷" }
      ]
    },
    {
      id: "pizzeria-el-galpon", nombre: "Pizzería El Galpón", cat: "pizzerias", emoji: "🍕", color: "#D1495B",
      direccion: "Calle 17 y 148", pos: { c: 17, r: 148 }, rating: 4.6, resenas: 421, demora: "40-55", envioExtra: 300, pedidoMin: 8000,
      horario: [["12:00", "15:00"], ["19:00", "00:30"]], diasCerrado: [], destacado: true,
      descripcion: "Pizza a la piedra y fainá. Los viernes, hacé el pedido temprano.",
      menu: [
        { id: "g1", seccion: "Pizzas", nombre: "Muzzarella grande", desc: "8 porciones, a la piedra.", precio: 11500, emoji: "🍕" },
        { id: "g2", seccion: "Pizzas", nombre: "Napolitana grande", desc: "Tomate en rodajas, ajo y perejil.", precio: 13200, emoji: "🍕" },
        { id: "g3", seccion: "Pizzas", nombre: "Especial de jamón y morrones", desc: "", precio: 14800, emoji: "🍕" },
        { id: "g4", seccion: "Pizzas", nombre: "Calabresa", desc: "Longaniza calabresa y aceitunas.", precio: 14200, emoji: "🍕" },
        { id: "g5", seccion: "Pizzas", nombre: "Cuatro quesos", desc: "", precio: 15500, emoji: "🧀" },
        { id: "g6", seccion: "Pizzas", nombre: "Media muzza, media napo", desc: "", precio: 12500, emoji: "🍕" },
        { id: "g7", seccion: "Fainá y fugazzeta", nombre: "Fugazzeta rellena", desc: "Con jamón y queso adentro.", precio: 15900, emoji: "🧅" },
        { id: "g8", seccion: "Fainá y fugazzeta", nombre: "Porción de fainá", desc: "", precio: 1800, emoji: "🟨" },
        { id: "g9", seccion: "Empanadas", nombre: "Empanada árabe", desc: "Con limón.", precio: 1700, emoji: "🥟" },
        { id: "g10", seccion: "Bebidas", nombre: "Cerveza Quilmes 1 L", desc: "Solo para mayores de 18.", precio: 3800, emoji: "🍺" },
        { id: "g11", seccion: "Bebidas", nombre: "Coca-Cola 2,25 L", desc: "", precio: 4600, emoji: "🥤" }
      ]
    },
    {
      id: "pizza-la-cuadrada", nombre: "Pizza La Cuadrada", cat: "pizzerias", emoji: "🟧", color: "#E07A2F",
      direccion: "Calle 16 y 151", pos: { c: 16, r: 151 }, rating: 4.7, resenas: 96, demora: "35-50", envioExtra: 0, pedidoMin: 7000,
      horario: [["19:00", "00:00"]], diasCerrado: [1], destacado: false, nuevo: true,
      descripcion: "Pizza al molde, bien alta, en asadera cuadrada.",
      menu: [
        { id: "q1", seccion: "Al molde", nombre: "Muzzarella al molde", desc: "Bien alta, masa esponjosa.", precio: 12900, emoji: "🍕" },
        { id: "q2", seccion: "Al molde", nombre: "Jamón y muzza", desc: "", precio: 14200, emoji: "🍕" },
        { id: "q3", seccion: "Al molde", nombre: "Rúcula y crudo", desc: "Con parmesano en hebras.", precio: 17800, emoji: "🥬" },
        { id: "q4", seccion: "Al molde", nombre: "Provolone y orégano", desc: "", precio: 15600, emoji: "🧀" },
        { id: "q5", seccion: "Al molde", nombre: "Palmitos con salsa golf", desc: "", precio: 16900, emoji: "🌴" },
        { id: "q6", seccion: "Otros", nombre: "Calzone de jamón y queso", desc: "", precio: 13500, emoji: "🥙" },
        { id: "q7", seccion: "Bebidas", nombre: "Pepsi 1,5 L", desc: "", precio: 3500, emoji: "🥤" },
        { id: "q8", seccion: "Bebidas", nombre: "Cerveza Patagonia 730 ml", desc: "Solo para mayores de 18.", precio: 5200, emoji: "🍺" }
      ]
    },
    {
      id: "heladeria-bella-italia", nombre: "Heladería Bella Italia", cat: "heladerias", emoji: "🍦", color: "#7B68B6",
      direccion: "Av. 14 y 150", pos: { c: 14, r: 150 }, rating: 4.8, resenas: 268, demora: "25-40", envioExtra: 0, pedidoMin: 7000,
      horario: [["12:00", "00:30"]], diasCerrado: [], destacado: true,
      descripcion: "Helado artesanal. Elegí hasta 4 gustos por pote en la nota.",
      menu: [
        { id: "b1", seccion: "Por peso", nombre: "1/4 kg", desc: "Hasta 2 gustos.", precio: 7500, emoji: "🍨" },
        { id: "b2", seccion: "Por peso", nombre: "1/2 kg", desc: "Hasta 3 gustos.", precio: 13500, emoji: "🍨" },
        { id: "b3", seccion: "Por peso", nombre: "1 kg", desc: "Hasta 4 gustos.", precio: 24000, emoji: "🍨" },
        { id: "b4", seccion: "Por peso", nombre: "Cucurucho simple", desc: "Retirás en el local o te lo mandamos en vasito.", precio: 4200, emoji: "🍦" },
        { id: "b5", seccion: "Postres helados", nombre: "Almendrado", desc: "Porción.", precio: 6800, emoji: "🍰" },
        { id: "b6", seccion: "Postres helados", nombre: "Bombón escocés x6", desc: "", precio: 9500, emoji: "🍫" },
        { id: "b7", seccion: "Postres helados", nombre: "Torta helada", desc: "8 porciones. Encargala con 2 horas.", precio: 28000, emoji: "🎂" },
        { id: "b8", seccion: "Palitos", nombre: "Palito bombón", desc: "", precio: 2800, emoji: "🍡" }
      ]
    },
    {
      id: "frio-frio", nombre: "Frío Frío Helados", cat: "heladerias", emoji: "🍧", color: "#3A86A8",
      direccion: "Calle 153 y 21", pos: { c: 21, r: 153 }, rating: 4.5, resenas: 74, demora: "30-45", envioExtra: 500, pedidoMin: 6000,
      horario: [["13:00", "23:30"]], diasCerrado: [], destacado: false,
      descripcion: "Helado artesanal de barrio, con gustos al agua todo el año.",
      menu: [
        { id: "f1", seccion: "Por peso", nombre: "1/4 kg", desc: "", precio: 6900, emoji: "🍨" },
        { id: "f2", seccion: "Por peso", nombre: "1/2 kg", desc: "", precio: 12400, emoji: "🍨" },
        { id: "f3", seccion: "Por peso", nombre: "1 kg", desc: "", precio: 22500, emoji: "🍨" },
        { id: "f4", seccion: "Otros", nombre: "Paleta de frutilla al agua", desc: "", precio: 2500, emoji: "🍓" },
        { id: "f5", seccion: "Otros", nombre: "Sundae de dulce de leche", desc: "", precio: 6500, emoji: "🍨" },
        { id: "f6", seccion: "Otros", nombre: "Batido de helado", desc: "500 ml.", precio: 5900, emoji: "🥤" }
      ]
    },
    {
      id: "almacen-don-cacho", nombre: "Almacén Don Cacho", cat: "almacenes", emoji: "🧉", color: "#4F772D",
      direccion: "Calle 12 y 149", pos: { c: 12, r: 149 }, rating: 4.7, resenas: 143, demora: "20-35", envioExtra: 0, pedidoMin: 5000,
      horario: [["08:00", "13:30"], ["16:30", "21:00"]], diasCerrado: [0], destacado: false,
      descripcion: "El almacén de siempre. Si no está en la lista, preguntale a Cacho en la nota.",
      menu: [
        { id: "a1", seccion: "Almacén", nombre: "Yerba Playadito 1 kg", desc: "", precio: 5800, emoji: "🧉" },
        { id: "a2", seccion: "Almacén", nombre: "Azúcar 1 kg", desc: "", precio: 1600, emoji: "🍬" },
        { id: "a3", seccion: "Almacén", nombre: "Fideos spaghetti 500 g", desc: "", precio: 1900, emoji: "🍝" },
        { id: "a4", seccion: "Almacén", nombre: "Aceite de girasol 1,5 L", desc: "", precio: 4400, emoji: "🫗" },
        { id: "a5", seccion: "Almacén", nombre: "Galletitas de agua", desc: "", precio: 1500, emoji: "🍘" },
        { id: "a6", seccion: "Almacén", nombre: "Dulce de leche 400 g", desc: "", precio: 2900, emoji: "🍯" },
        { id: "a7", seccion: "Frescos", nombre: "Leche entera 1 L", desc: "", precio: 1750, emoji: "🥛" },
        { id: "a8", seccion: "Frescos", nombre: "Queso cremoso x kg", desc: "Se pesa al momento.", precio: 12900, emoji: "🧀" },
        { id: "a9", seccion: "Frescos", nombre: "Huevos x 12", desc: "", precio: 4200, emoji: "🥚" },
        { id: "a10", seccion: "Frescos", nombre: "Pan francés x kg", desc: "Del día.", precio: 3200, emoji: "🥖" },
        { id: "a11", seccion: "Bebidas", nombre: "Coca-Cola 2,25 L", desc: "", precio: 4300, emoji: "🥤" },
        { id: "a12", seccion: "Limpieza", nombre: "Lavandina 1 L", desc: "", precio: 1300, emoji: "🧴" },
        { id: "a13", seccion: "Limpieza", nombre: "Papel higiénico x4", desc: "", precio: 2800, emoji: "🧻" }
      ]
    },
    {
      id: "autoservicio-los-hermanos", nombre: "Autoservicio Los Hermanos", cat: "almacenes", emoji: "🛒", color: "#2F7F6F",
      direccion: "Calle 16 y 148", pos: { c: 16, r: 148 }, rating: 4.4, resenas: 88, demora: "25-40", envioExtra: 0, pedidoMin: 8000,
      horario: [["08:30", "21:30"]], diasCerrado: [], destacado: false,
      descripcion: "Autoservicio con fiambrería. Horario corrido.",
      menu: [
        { id: "h1", seccion: "Almacén", nombre: "Arroz largo fino 1 kg", desc: "", precio: 2300, emoji: "🍚" },
        { id: "h2", seccion: "Almacén", nombre: "Harina 0000 1 kg", desc: "", precio: 1200, emoji: "🌾" },
        { id: "h3", seccion: "Almacén", nombre: "Puré de tomate", desc: "", precio: 1100, emoji: "🍅" },
        { id: "h4", seccion: "Almacén", nombre: "Atún en aceite", desc: "", precio: 3500, emoji: "🐟" },
        { id: "h5", seccion: "Fiambrería", nombre: "Jamón cocido x 100 g", desc: "", precio: 1900, emoji: "🥓" },
        { id: "h6", seccion: "Lácteos", nombre: "Manteca 200 g", desc: "", precio: 2900, emoji: "🧈" },
        { id: "h7", seccion: "Lácteos", nombre: "Yogur bebible 1 L", desc: "Frutilla o vainilla.", precio: 2600, emoji: "🥛" },
        { id: "h8", seccion: "Bebidas", nombre: "Agua saborizada 1,5 L", desc: "", precio: 2300, emoji: "🧃" },
        { id: "h9", seccion: "Bebidas", nombre: "Bolsa de hielo 2 kg", desc: "", precio: 2000, emoji: "🧊" },
        { id: "h10", seccion: "Limpieza", nombre: "Detergente 750 ml", desc: "", precio: 2400, emoji: "🧽" }
      ]
    },
    {
      id: "farmacia-central", nombre: "Farmacia Central", cat: "farmacias", emoji: "💊", color: "#2B6CB0",
      direccion: "Av. 14 y 149", pos: { c: 14, r: 149 }, rating: 4.8, resenas: 205, demora: "20-30", envioExtra: 0, pedidoMin: 3000,
      horario: [["08:00", "22:00"]], diasCerrado: [], destacado: false,
      descripcion: "Solo venta libre por la app. Los medicamentos con receta se retiran en el mostrador.",
      menu: [
        { id: "c1", seccion: "Venta libre", nombre: "Ibuprofeno 400 mg x 10", desc: "", precio: 4300, emoji: "💊" },
        { id: "c2", seccion: "Venta libre", nombre: "Paracetamol 500 mg x 16", desc: "", precio: 3600, emoji: "💊" },
        { id: "c3", seccion: "Venta libre", nombre: "Antiespasmódico x 20", desc: "", precio: 6900, emoji: "💊" },
        { id: "c4", seccion: "Venta libre", nombre: "Curitas x 20", desc: "", precio: 2200, emoji: "🩹" },
        { id: "c5", seccion: "Venta libre", nombre: "Termómetro digital", desc: "", precio: 8500, emoji: "🌡️" },
        { id: "c6", seccion: "Cuidado personal", nombre: "Alcohol en gel 250 ml", desc: "", precio: 2900, emoji: "🧴" },
        { id: "c7", seccion: "Cuidado personal", nombre: "Protector solar FPS 50", desc: "", precio: 16500, emoji: "☀️" },
        { id: "c8", seccion: "Bebés", nombre: "Pañales talle G x 30", desc: "", precio: 18900, emoji: "👶" }
      ]
    },
    {
      id: "farmacia-del-parque", nombre: "Farmacia del Parque", cat: "farmacias", emoji: "⚕️", color: "#276749",
      direccion: "Calle 148 y 21", pos: { c: 21, r: 148 }, rating: 4.6, resenas: 131, demora: "25-35", envioExtra: 300, pedidoMin: 3000,
      horario: [["00:00", "24:00"]], diasCerrado: [], destacado: true, etiqueta: "24 hs",
      descripcion: "Abierta las 24 horas. Solo venta libre por la app.",
      menu: [
        { id: "p1", seccion: "Venta libre", nombre: "Paracetamol 1 g x 10", desc: "", precio: 4800, emoji: "💊" },
        { id: "p2", seccion: "Venta libre", nombre: "Ibuprofeno 600 mg x 10", desc: "", precio: 6200, emoji: "💊" },
        { id: "p3", seccion: "Venta libre", nombre: "Sales de rehidratación", desc: "", precio: 2600, emoji: "🥤" },
        { id: "p4", seccion: "Cuidado personal", nombre: "Barbijos x 10", desc: "", precio: 2500, emoji: "😷" },
        { id: "p5", seccion: "Cuidado personal", nombre: "Cepillo de dientes", desc: "", precio: 2400, emoji: "🪥" },
        { id: "p6", seccion: "Cuidado personal", nombre: "Shampoo 400 ml", desc: "", precio: 5900, emoji: "🧴" }
      ]
    },
    {
      id: "kiosco-la-parada", nombre: "Kiosco 24 La Parada", cat: "kioscos", emoji: "🍫", color: "#B83B5E",
      direccion: "Av. 14 y 152", pos: { c: 14, r: 152 }, rating: 4.3, resenas: 59, demora: "15-25", envioExtra: 0, pedidoMin: 3000,
      horario: [["00:00", "24:00"]], diasCerrado: [], destacado: false, etiqueta: "24 hs",
      descripcion: "Abierto siempre, al lado de la parada del colectivo.",
      menu: [
        { id: "k1", seccion: "Golosinas", nombre: "Alfajor de dulce de leche", desc: "", precio: 900, emoji: "🍪" },
        { id: "k2", seccion: "Golosinas", nombre: "Alfajor premium", desc: "", precio: 2800, emoji: "🍫" },
        { id: "k3", seccion: "Golosinas", nombre: "Chocolate con leche 100 g", desc: "", precio: 3900, emoji: "🍫" },
        { id: "k4", seccion: "Golosinas", nombre: "Chicles", desc: "", precio: 1100, emoji: "🫧" },
        { id: "k5", seccion: "Snacks", nombre: "Papas fritas de paquete 85 g", desc: "", precio: 2900, emoji: "🥔" },
        { id: "k6", seccion: "Bebidas", nombre: "Coca-Cola 500 ml", desc: "", precio: 1900, emoji: "🥤" },
        { id: "k7", seccion: "Bebidas", nombre: "Energizante 473 ml", desc: "", precio: 2300, emoji: "⚡" },
        { id: "k8", seccion: "Varios", nombre: "Pilas AA x 2", desc: "", precio: 2600, emoji: "🔋" }
      ]
    },
    {
      id: "maxikiosco-el-faro", nombre: "Maxikiosco El Faro", cat: "kioscos", emoji: "🗼", color: "#5C4D7D",
      direccion: "Calle 13 y 151", pos: { c: 13, r: 151 }, rating: 4.5, resenas: 77, demora: "20-30", envioExtra: 0, pedidoMin: 3000,
      horario: [["07:00", "01:00"]], diasCerrado: [], destacado: false,
      descripcion: "Sándwiches de miga, bebidas frías y lo que te falte para la previa.",
      menu: [
        { id: "e1", seccion: "Para comer", nombre: "Sándwiches de miga JyQ x 6", desc: "Triples.", precio: 5500, emoji: "🥪" },
        { id: "e2", seccion: "Golosinas", nombre: "Turrón", desc: "", precio: 500, emoji: "🍬" },
        { id: "e3", seccion: "Golosinas", nombre: "Gomitas", desc: "", precio: 1300, emoji: "🍬" },
        { id: "e4", seccion: "Golosinas", nombre: "Galletitas de chocolate rellenas", desc: "", precio: 2400, emoji: "🍪" },
        { id: "e5", seccion: "Bebidas", nombre: "Agua mineral 500 ml", desc: "", precio: 1300, emoji: "💧" },
        { id: "e6", seccion: "Bebidas", nombre: "Cerveza en lata 473 ml", desc: "Solo para mayores de 18.", precio: 2100, emoji: "🍺" },
        { id: "e7", seccion: "Bebidas", nombre: "Fernet 750 ml", desc: "Solo para mayores de 18.", precio: 14500, emoji: "🍾" },
        { id: "e8", seccion: "Varios", nombre: "Encendedor", desc: "", precio: 1200, emoji: "🔥" }
      ]
    }
  ],

  camaras: [
    { id: "cam-1", esquina: "Av. 14 y 148", zona: "Centro comercial", estado: "vivo", mantiene: "Cámara de Comercio del Centro" },
    { id: "cam-2", esquina: "Calle 149 y 13", zona: "Frente a la plaza", estado: "vivo", mantiene: "Asociación Vecinal 149" },
    { id: "cam-3", esquina: "Calle 17 y 150", zona: "Salida de la escuela", estado: "vivo", mantiene: "Cooperadora escolar" },
    { id: "cam-4", esquina: "Calle 153 y 21", zona: "Esquina del polideportivo", estado: "vivo", mantiene: "Vecinos de la 153" },
    { id: "cam-5", esquina: "Calle 16 y 148", zona: "Pasaje residencial", estado: "mantenimiento", mantiene: "Vecinos de la 16" },
    { id: "cam-6", esquina: "Av. 14 y 152", zona: "Parada de colectivos", estado: "vivo", mantiene: "Cámara de Comercio del Centro" }
  ],

  tiposAlerta: [
    { id: "sospechosa", nombre: "Actividad sospechosa", emoji: "🚨", color: "#B42318" },
    { id: "luz", nombre: "Corte de luz", emoji: "⚡", color: "#8A5A00" },
    { id: "agua", nombre: "Sin agua", emoji: "💧", color: "#1E5A99" },
    { id: "mascota", nombre: "Mascota perdida o encontrada", emoji: "🐾", color: "#5B3AA8" },
    { id: "calle", nombre: "Calle o tránsito", emoji: "🚧", color: "#9C3D0F" },
    { id: "vecinal", nombre: "Aviso vecinal", emoji: "📣", color: "#25704A" }
  ],

  // minutos: hace cuánto se publicó
  alertas: [
    { id: "al-1", tipo: "sospechosa", titulo: "Moto sin patente dando vueltas", esquina: "Calle 149 y 13", minutos: 25, texto: "Una moto negra sin patente pasó tres veces por la cuadra en 10 minutos. Ya avisamos al 911, lo dejo para que estén atentos.", autor: "Vecina de la 149", utiles: 14, camara: "cam-2" },
    { id: "al-2", tipo: "luz", titulo: "Corte de luz en la 150", esquina: "Calle 150 e/ 14 y 15", minutos: 70, texto: "Sin luz desde las 18 h. Llamé a la distribuidora: reclamo 4471-229, dicen que lo reponen antes de las 21 h.", autor: "Vecino de la 150", utiles: 22 },
    { id: "al-3", tipo: "mascota", titulo: "Se perdió Rocco, caniche blanco", esquina: "Calle 152 y 16", minutos: 190, texto: "Tiene collar rojo y es muy manso. Se escapó esta mañana. Si lo ven, avisen por acá y le escribimos a la dueña.", autor: "Vecina de la 152", utiles: 31 },
    { id: "al-4", tipo: "calle", titulo: "Pozo grande en 17 y 148", esquina: "Calle 17 y 148", minutos: 310, texto: "Hay un pozo profundo del lado de la vereda de la pizzería. Con la lluvia no se ve, cuidado con las motos.", autor: "Vecino de la 17", utiles: 9 },
    { id: "al-5", tipo: "mascota", titulo: "Encontramos una gatita atigrada", esquina: "Calle 13 y 151", minutos: 1320, texto: "Está en el maxikiosco, muy mimosa y con collar sin chapita. Si es tuya, pasá a buscarla.", autor: "Maxikiosco El Faro", utiles: 18 },
    { id: "al-6", tipo: "sospechosa", titulo: "Intentaron abrir un auto", esquina: "Calle 16 y 149", minutos: 1500, texto: "A la madrugada intentaron forzar la puerta de un auto estacionado. Se hizo la denuncia y se pidió la grabación por los canales oficiales.", autor: "Vecino de la 16", utiles: 27, camara: "cam-5" },
    { id: "al-7", tipo: "agua", titulo: "Sin agua desde la mañana", esquina: "Calle 153 y 21", minutos: 1680, texto: "Toda la cuadra sin agua. El reclamo ya está hecho, si alguien tiene novedades que avise.", autor: "Vecina de la 153", utiles: 12 },
    { id: "al-8", tipo: "vecinal", titulo: "Feria de platos en la plaza el sábado", esquina: "Plaza de 149 y 13", minutos: 2900, texto: "Este sábado de 10 a 14 h hay feria de platos y ropa en la plaza. Lo recaudado va para arreglar los juegos.", autor: "Asociación Vecinal 149", utiles: 40 }
  ],

  usuario: {
    nombre: "Lucía Gómez",
    telefono: "11 5555-0142",
    email: "lucia.gomez@ejemplo.com",
    direcciones: [
      { id: "d1", etiqueta: "Casa", linea: "Calle 150 N° 1432, e/ 14 y 15", indicaciones: "Portón verde, tocar timbre 2." },
      { id: "d2", etiqueta: "Trabajo", linea: "Av. 14 N° 4250, local 3", indicaciones: "Preguntar por Lucía en el mostrador." }
    ]
  },

  // diasAtras: cuándo fue el pedido
  historial: [
    { id: 1038, localId: "la-esquina-de-tito", diasAtras: 2, items: [["t4", 1], ["t6", 1], ["t10", 1]], pago: "mp" },
    { id: 1031, localId: "heladeria-bella-italia", diasAtras: 5, items: [["b2", 1], ["b6", 1]], pago: "efectivo" },
    { id: 1024, localId: "almacen-don-cacho", diasAtras: 9, items: [["a1", 1], ["a7", 2], ["a10", 1], ["a9", 1]], pago: "mp" },
    { id: 1017, localId: "pizzeria-el-galpon", diasAtras: 13, items: [["g1", 1], ["g7", 1], ["g10", 2]], pago: "efectivo" },
    { id: 1009, localId: "farmacia-del-parque", diasAtras: 20, items: [["p1", 1], ["p3", 2]], pago: "mp" }
  ],

  // Pedidos de otros vecinos que ya están entrando en los paneles de comercio
  entrantes: [
    { id: 1040, localId: "la-esquina-de-tito", cliente: "Martín R.", direccion: "Calle 147 N° 1180", minutos: 2, items: [["t1", 2], ["t7", 1]], pago: "efectivo", estado: "recibido" },
    { id: 1041, localId: "la-esquina-de-tito", cliente: "Sofía L.", direccion: "Calle 15 N° 4510", minutos: 9, items: [["t5", 1], ["t6", 1], ["t11", 1]], pago: "mp", estado: "preparacion" },
    { id: 1039, localId: "la-esquina-de-tito", cliente: "Carlos D.", direccion: "Calle 149 N° 1350", minutos: 22, items: [["t9", 1]], pago: "mp", estado: "camino" },
    { id: 1042, localId: "pizzeria-el-galpon", cliente: "Nahuel P.", direccion: "Calle 18 N° 4720", minutos: 4, items: [["g2", 1], ["g8", 2]], pago: "efectivo", estado: "recibido" },
    { id: 1037, localId: "almacen-don-cacho", cliente: "Graciela M.", direccion: "Calle 12 N° 4390", minutos: 6, items: [["a1", 1], ["a2", 2], ["a7", 3]], pago: "mp", estado: "recibido" }
  ],

  zonas: [
    { id: "z1", nombre: "Centro", limites: "Calles 12 a 21 · 147 a 153", activa: true, recargo: 0, comercios: 12 },
    { id: "z2", nombre: "Berazategui Oeste", limites: "Calles 21 a 30 · 147 a 153", activa: true, recargo: 400, comercios: 0 },
    { id: "z3", nombre: "Villa España", limites: "Calles 1 a 12 · 140 a 147", activa: false, recargo: 600, comercios: 0 },
    { id: "z4", nombre: "Ranelagh", limites: "Próxima etapa", activa: false, recargo: 800, comercios: 0 }
  ],

  config: { comision: 12, envioBase: 1200, envioGratisDesde: 0 }
};
