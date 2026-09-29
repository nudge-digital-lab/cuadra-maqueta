// Datos de ejemplo de Cuadra Viajes. Choferes, remiserías, patentes y números de
// habilitación son ficticios. Las coordenadas son aproximadas al centro de Berazategui.
window.CUADRA_VIAJES_DATA = {
  centro: [-34.7616, -58.2093],

  // Ubicación actual simulada del vecino (coincide con su dirección "Casa")
  ubicacionActual: { nombre: "Tu ubicación", linea: "Calle 150 N° 1432 (aprox.)", lat: -34.7610, lng: -58.2070 },

  // Coordenadas de las direcciones guardadas del perfil (por id)
  coordsDirecciones: {
    d1: [-34.7610, -58.2070],
    d2: [-34.7623, -58.2107]
  },

  frecuentes: [
    { id: "f1", nombre: "Estación Berazategui", linea: "Tren Roca, centro", emoji: "🚆", lat: -34.7641, lng: -58.2084 },
    { id: "f2", nombre: "Centro comercial", linea: "Av. 14 y 148", emoji: "🛍️", lat: -34.7616, lng: -58.2093 },
    { id: "f3", nombre: "Plaza de 149 y 13", linea: "Calle 149 y 13", emoji: "🌳", lat: -34.7601, lng: -58.2091 },
    { id: "f4", nombre: "Polideportivo", linea: "Calle 153 y 21", emoji: "🏀", lat: -34.7656, lng: -58.1989 },
    { id: "f5", nombre: "Escuela de la 17", linea: "Calle 17 y 150", emoji: "🏫", lat: -34.7634, lng: -58.2050 },
    { id: "f6", nombre: "Estación Villa España", linea: "Tren Roca, Villa España", emoji: "🚆", lat: -34.7744, lng: -58.1950 },
    { id: "f7", nombre: "Quilmes centro", linea: "Centro de Quilmes", emoji: "🏙️", lat: -34.7242, lng: -58.2526 },
    { id: "f8", nombre: "Estación Ranelagh", linea: "Tren Roca, Ranelagh", emoji: "🚆", lat: -34.7894, lng: -58.2032 }
  ],

  tipos: [
    { id: "remis", nombre: "Remis", desc: "Hasta 4 personas", emoji: "🚗", mult: 1, extra: 0, eta: 4 },
    { id: "grande", nombre: "Remis grande", desc: "Hasta 6 personas o valijas", emoji: "🚐", mult: 1.35, extra: 0, eta: 7 },
    { id: "flete", nombre: "Flete chico", desc: "Hasta 500 kg · sin ayudante", emoji: "🛻", mult: 1.6, extra: 2500, eta: 10 }
  ],

  tarifas: { bajada: 1800, porKm: 950, nocturno: 20, esperaMin: 180, esperaGratis: 3, comision: 10 },

  remiserias: [
    { id: "rm1", nombre: "Remises Centro 14", direccion: "Av. 14 y 150", telefono: "11 5555-0110", habilitacion: "Agencia N° 031", estado: "activa" },
    { id: "rm2", nombre: "Remis La 148", direccion: "Calle 148 y 16", telefono: "11 5555-0148", habilitacion: "Agencia N° 047", estado: "activa" },
    { id: "rm3", nombre: "Fletes La Estación", direccion: "Calle 147 y 13", telefono: "11 5555-0133", habilitacion: "Agencia N° 052", estado: "activa" }
  ],

  // docs: fecha de vencimiento (AAAA-MM-DD). piel/pelo: para el avatar ilustrado.
  choferes: [
    { id: "ch1", nombre: "Marcelo Benítez", remiseria: "rm1", tipo: "remis", rating: 4.9, viajes: 2140, desde: 2016,
      auto: { modelo: "Chevrolet Prisma", color: "Gris plata", hex: "#A7AEB4" }, patente: "AC 482 KD", habilitacion: "R-0472", telefono: "11 5555-0201",
      docs: { licencia: "2029-03-14", seguro: "2027-01-31", vtv: "2027-05-20", habilitacion: "2027-12-31" }, estado: "activo", piel: "#C99A76", pelo: "#3B2A20" },
    { id: "ch2", nombre: "Claudia Ferreyra", remiseria: "rm1", tipo: "remis", rating: 4.95, viajes: 1320, desde: 2019,
      auto: { modelo: "Fiat Cronos", color: "Blanco", hex: "#F2F2F2" }, patente: "AE 107 LM", habilitacion: "R-0588", telefono: "11 5555-0202",
      docs: { licencia: "2028-08-02", seguro: "2026-12-15", vtv: "2027-02-10", habilitacion: "2027-12-31" }, estado: "activo", piel: "#E2B99A", pelo: "#6B3E26", largo: true },
    { id: "ch3", nombre: "Hugo Sosa", remiseria: "rm1", tipo: "remis", rating: 4.7, viajes: 3890, desde: 2009,
      auto: { modelo: "Toyota Etios", color: "Negro", hex: "#2B2D30" }, patente: "AB 311 FT", habilitacion: "R-0215", telefono: "11 5555-0203",
      docs: { licencia: "2027-06-30", seguro: "2026-10-12", vtv: "2026-11-05", habilitacion: "2027-12-31" }, estado: "activo", piel: "#B98561", pelo: "#9A9A9A" },
    { id: "ch4", nombre: "Gustavo Ledesma", remiseria: "rm2", tipo: "remis", rating: 4.8, viajes: 980, desde: 2021,
      auto: { modelo: "Volkswagen Voyage", color: "Azul", hex: "#2F4D7A" }, patente: "AF 925 RB", habilitacion: "R-0651", telefono: "11 5555-0204",
      docs: { licencia: "2030-01-09", seguro: "2027-03-01", vtv: "2027-04-18", habilitacion: "2027-12-31" }, estado: "activo", piel: "#8D5B3E", pelo: "#1E1A18" },
    { id: "ch5", nombre: "Patricia Romero", remiseria: "rm2", tipo: "remis", rating: 4.9, viajes: 1750, desde: 2017,
      auto: { modelo: "Peugeot 301", color: "Bordó", hex: "#7A2233" }, patente: "AD 640 PS", habilitacion: "R-0533", telefono: "11 5555-0205",
      docs: { licencia: "2028-11-23", seguro: "2027-02-28", vtv: "2026-12-01", habilitacion: "2027-12-31" }, estado: "activo", piel: "#D9A983", pelo: "#2A1B14", largo: true },
    { id: "ch6", nombre: "Diego Villalba", remiseria: "rm2", tipo: "grande", rating: 4.8, viajes: 870, desde: 2020,
      auto: { modelo: "Chevrolet Spin (7 asientos)", color: "Blanco", hex: "#EFEFEF" }, patente: "AE 882 JN", habilitacion: "R-0610", telefono: "11 5555-0206",
      docs: { licencia: "2029-07-04", seguro: "2027-01-10", vtv: "2027-03-22", habilitacion: "2027-12-31" }, estado: "activo", piel: "#C08C66", pelo: "#3A2A1E" },
    { id: "ch7", nombre: "Walter Giménez", remiseria: "rm1", tipo: "grande", rating: 4.6, viajes: 2410, desde: 2012,
      auto: { modelo: "Renault Kangoo (7 asientos)", color: "Gris oscuro", hex: "#55595E" }, patente: "AA 204 GH", habilitacion: "R-0344", telefono: "11 5555-0207",
      docs: { licencia: "2027-09-19", seguro: "2026-11-30", vtv: "2026-09-20", habilitacion: "2027-12-31" }, estado: "pendiente", piel: "#A87653", pelo: "#5C5C5C" },
    { id: "ch8", nombre: "Sergio Castro", remiseria: "rm3", tipo: "flete", rating: 4.7, viajes: 640, desde: 2018,
      auto: { modelo: "Fiat Fiorino furgón", color: "Blanco", hex: "#F4F4F4" }, patente: "AC 719 ZQ", habilitacion: "F-0098", telefono: "11 5555-0208",
      docs: { licencia: "2028-02-11", seguro: "2027-04-05", vtv: "2027-06-14", habilitacion: "2027-12-31" }, estado: "activo", piel: "#CFA07B", pelo: "#231A15" },
    { id: "ch9", nombre: "Mónica Paz", remiseria: "rm3", tipo: "flete", rating: 4.85, viajes: 410, desde: 2022,
      auto: { modelo: "Renault Kangoo furgón", color: "Rojo", hex: "#B3261E" }, patente: "AF 356 KW", habilitacion: "F-0121", telefono: "11 5555-0209",
      docs: { licencia: "2031-05-28", seguro: "2027-02-14", vtv: "2027-08-30", habilitacion: "2027-12-31" }, estado: "activo", piel: "#E6C1A3", pelo: "#8C5A2B", largo: true },
    { id: "ch10", nombre: "Leandro Quiroga", remiseria: "rm2", tipo: "remis", rating: 4.5, viajes: 520, desde: 2023,
      auto: { modelo: "Renault Logan", color: "Gris", hex: "#8C9196" }, patente: "AG 143 TB", habilitacion: "R-0702", telefono: "11 5555-0210",
      docs: { licencia: "2029-10-10", seguro: "2026-08-31", vtv: "2027-01-15", habilitacion: "2027-12-31" }, estado: "suspendido", motivo: "Seguro vencido", piel: "#B07B57", pelo: "#1C1714" }
  ],

  // desde/hasta: id de dirección guardada (d1, d2) o frecuente (f1…f8)
  historial: [
    { id: 5031, desde: "d1", hasta: "f1", tipo: "remis", chofer: "ch2", diasAtras: 1, hora: "07:42", km: 1.4, min: 6, pago: "efectivo", estrellas: 5, propina: 500 },
    { id: 5024, desde: "f7", hasta: "d1", tipo: "remis", chofer: "ch1", diasAtras: 3, hora: "21:15", km: 7.6, min: 17, pago: "mp", estrellas: 5, propina: 0 },
    { id: 5019, desde: "d1", hasta: "f4", tipo: "remis", chofer: "ch4", diasAtras: 5, hora: "18:05", km: 1.9, min: 8, pago: "efectivo", estrellas: 4, propina: 0 },
    { id: 5012, desde: "d2", hasta: "d1", tipo: "remis", chofer: "ch5", diasAtras: 8, hora: "23:40", km: 1.2, min: 5, pago: "mp", estrellas: 5, propina: 1000 },
    { id: 5006, desde: "d1", hasta: "f8", tipo: "grande", chofer: "ch6", diasAtras: 12, hora: "10:20", km: 4.1, min: 11, pago: "efectivo", estrellas: 5, propina: 1000 },
    { id: 4998, desde: "f2", hasta: "d1", tipo: "flete", chofer: "ch8", diasAtras: 17, hora: "16:30", km: 1.3, min: 9, pago: "efectivo", estrellas: 4, propina: 0 }
  ],

  // Pasajeros de ejemplo para las solicitudes que le entran al chofer
  pasajeros: [
    { nombre: "Nora B.", rating: 4.9 }, { nombre: "Tomás G.", rating: 4.7 }, { nombre: "Rosa M.", rating: 5.0 },
    { nombre: "Julián P.", rating: 4.8 }, { nombre: "Estela V.", rating: 4.9 }
  ],

  respuestasChofer: {
    "Ya bajo": "¡Dale! Te espero en la puerta.",
    "Estoy en la puerta": "Perfecto, ya te veo. Estoy en el auto.",
    "Esperame 2 minutos": "No hay problema, te espero.",
    "¿Dónde estás?": "Estoy a una cuadra, llego enseguida.",
    _default: "Recibido 👍"
  }
};
