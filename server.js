import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Base de datos simulada en memoria (se puede conectar a una BD real más adelante)
let espacios = [
  // Áreas Deportivas
  { 
    id: 1, nombre: "Piscina", categoria: "Áreas Deportivas", capacidad: 1, disponible: true,
    imagen: "piscina_ulima.png",
    descripcion: "Instalación de natación olímpica con carriles oficiales y vestuarios equipados. Contamos con instructores permanentes para supervisión y entrenamiento. Se requiere traje de baño, gorro y ducha previa para ingresar."
  },
  { 
    id: 2, nombre: "Cancha de Fútbol", categoria: "Áreas Deportivas", capacidad: 12, disponible: true,
    imagen: "futbol_ulima.png",
    descripcion: "Terreno de césped sintético con medidas oficiales para partidos de fútbol. Contamos con docentes para arbitraje y balones a disposición de los alumnos. Se requiere calzado deportivo adecuado."
  },
  { 
    id: 3, nombre: "Cancha de Basket", categoria: "Áreas Deportivas", capacidad: 10, disponible: true,
    imagen: "basket_ulima.png",
    descripcion: "Losa deportiva multiusos equipada con aros oficiales y tableros profesionales. Contamos con docentes a cargo del préstamo de balones e implementación de partidos. Se solicita zapatillas deportivas."
  },
  
  // Áreas de Estudio
  { 
    id: 4, nombre: "Sala de Estudio A", categoria: "Áreas de Estudio", capacidad: 3, disponible: true,
    imagen: "salaetudio_ulima_1.png",
    descripcion: "Ambiente privado con aislamiento acústico completo ideal para concentrarse en grupo. Cuenta con televisores, pizarra acrílica y iPads disponibles para préstamo. Prohibido el ingreso de comida."
  },
  { 
    id: 5, nombre: "Sala de Estudio B", categoria: "Áreas de Estudio", capacidad: 3, disponible: true,
    imagen: "salaetudio_ulima_2.png",
    descripcion: "Espacio de trabajo grupal privado dotado de conectividad HDMI y red de alta velocidad. Equipado con iPads, pantallas de proyección y paneles móviles. Prohibido el ingreso de alimentos."
  },
  
  // Laboratorios
  { 
    id: 6, nombre: "Laboratorio de IA", categoria: "Laboratorios", capacidad: 5, disponible: true,
    imagen: "laboratorioia_ulima.png",
    descripcion: "Sala especializada equipada con computadoras de alta gama y tarjetas de procesamiento gráfico dedicadas. Contamos con soporte técnico docente en todo momento. Exclusivo para proyectos de computación."
  },
  { 
    id: 7, nombre: "Laboratorio de Ing. Civil", categoria: "Laboratorios", capacidad: 5, disponible: true,
    imagen: "laboratoriocivil_ulima.png",
    descripcion: "Sala técnica con computadoras de alto rendimiento equipadas con licencias de AutoCAD y SAP2000. Contamos con asesores estructurales permanentes. Exclusivo para diseño e ingeniería estructural."
  }
];

// Reservas iniciales de prueba (simulado)
let reservas = [
  { id: 101, espacio: "Sala de Estudio A", fecha: "28 de Mayo", hora: "14:00 - 16:00", estado: "Confirmada", codigoAlumno: "20236694" },
  { id: 102, espacio: "Cancha de Fútbol", fecha: "29 de Mayo", hora: "18:00 - 19:30", estado: "Confirmada", codigoAlumno: "20236694" }
];

// Faltas de prueba (simulado)
let faltas = {
  "20236694": 1
};

// --- ENDPOINTS ---

// 1. Obtener todos los espacios
app.get('/api/espacios', (req, res) => {
  res.json(espacios);
});

// 2. Modificar disponibilidad de un espacio (Admin)
app.patch('/api/espacios/:id/disponibilidad', (req, res) => {
  const { id } = req.params;
  const { disponible } = req.body;
  
  const espacio = espacios.find(e => e.id === parseInt(id));
  if (!espacio) {
    return res.status(404).json({ message: "Espacio no encontrado" });
  }
  
  espacio.disponible = disponible;
  res.json(espacio);
});

// 3. Crear ambiente extra (Admin)
app.post('/api/espacios', (req, res) => {
  const { nombre, capacidad } = req.body;
  
  const extrasActuales = espacios.filter(e => e.esExtra === true);
  if (extrasActuales.length >= 3) {
    return res.status(400).json({ message: "Límite alcanzado: máximo 3 ambientes extras" });
  }
  
  const nuevoEspacio = {
    id: Date.now(),
    nombre,
    categoria: "Áreas de Estudio",
    capacidad: parseInt(capacidad),
    disponible: true,
    imagen: "salaetudio_ulima_1.png",
    descripcion: "Sala de estudio extra añadida por la administración para el trabajo grupal y académico.",
    esExtra: true
  };
  
  espacios.push(nuevoEspacio);
  res.status(201).json(nuevoEspacio);
});

// 4. Eliminar ambiente extra (Admin)
app.delete('/api/espacios/:id', (req, res) => {
  const { id } = req.params;
  const index = espacios.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({ message: "Espacio no encontrado" });
  }
  
  if (!espacios[index].esExtra) {
    return res.status(400).json({ message: "No se pueden eliminar espacios principales" });
  }
  
  espacios.splice(index, 1);
  res.json({ message: "Espacio eliminado correctamente" });
});

// 5. Obtener reservas
app.get('/api/reservas', (req, res) => {
  res.json(reservas);
});

// 6. Crear una reserva
app.post('/api/reservas', (req, res) => {
  const { espacio, fecha, hora, codigoAlumno } = req.body;
  
  const nuevaReserva = {
    id: Date.now() + Math.random(),
    espacio,
    fecha,
    hora,
    estado: "Confirmada",
    codigoAlumno
  };
  
  reservas.push(nuevaReserva);
  res.status(201).json(nuevaReserva);
});

// 7. Eliminar/Anular una reserva
app.delete('/api/reservas/:id', (req, res) => {
  const { id } = req.params;
  const index = reservas.findIndex(r => r.id === parseFloat(id));
  
  if (index === -1) {
    return res.status(404).json({ message: "Reserva no encontrada" });
  }
  
  reservas.splice(index, 1);
  res.json({ message: "Reserva anulada correctamente" });
});

// 8. Obtener faltas de un alumno
app.get('/api/faltas/:codigo', (req, res) => {
  const { codigo } = req.params;
  const cantidad = faltas[codigo] || 0;
  res.json({ codigo, faltas: cantidad });
});

// 9. Actualizar faltas de un alumno (Admin)
app.patch('/api/faltas/:codigo', (req, res) => {
  const { codigo } = req.params;
  const { accion } = req.body; // "incrementar" o "decrementar"
  
  if (faltas[codigo] === undefined) {
    faltas[codigo] = 0;
  }
  
  if (accion === 'incrementar') {
    faltas[codigo] += 1;
  } else if (accion === 'decrementar' && faltas[codigo] > 0) {
    faltas[codigo] -= 1;
  }
  
  res.json({ codigo, faltas: faltas[codigo] });
});

app.get('/', (req, res) => {
  res.send('API de UniReserva funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
