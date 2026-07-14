import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL usando Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'unireserva',
  password: process.env.DB_PASSWORD || '12345678',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

// Probar la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('⚠️ Error al conectarse a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    release();
  }
});

// --- ENDPOINTS ---

// 1. Obtener todos los espacios
app.get('/api/espacios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM espacios ORDER BY id ASC');
    const espacios = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      capacidad: row.capacidad,
      disponible: row.disponible,
      imagen: row.imagen,
      descripcion: row.descripcion,
      esExtra: row.es_extra
    }));
    res.json(espacios);
  } catch (error) {
    console.error('Error fetching espacios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 2. Modificar disponibilidad de un espacio (Admin)
app.patch('/api/espacios/:id/disponibilidad', async (req, res) => {
  const { id } = req.params;
  const { disponible } = req.body;
  try {
    const result = await pool.query(
      'UPDATE espacios SET disponible = $1 WHERE id = $2 RETURNING *',
      [disponible, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Espacio no encontrado" });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      capacidad: row.capacidad,
      disponible: row.disponible,
      imagen: row.imagen,
      descripcion: row.descripcion,
      esExtra: row.es_extra
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 3. Crear ambiente extra (Admin)
app.post('/api/espacios', async (req, res) => {
  const { nombre, capacidad } = req.body;
  try {
    // Validar límite de 3 ambientes extras
    const countResult = await pool.query('SELECT COUNT(*) FROM espacios WHERE es_extra = TRUE');
    const count = parseInt(countResult.rows[0].count);
    if (count >= 3) {
      return res.status(400).json({ message: "Límite alcanzado: máximo 3 ambientes extras" });
    }
    
    const result = await pool.query(
      'INSERT INTO espacios (nombre, categoria, capacidad, disponible, imagen, descripcion, es_extra) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, 'Áreas de Estudio', parseInt(capacidad), true, 'salaetudio_ulima_1.png', 'Sala de estudio extra añadida por la administración para el trabajo grupal y académico.', true]
    );
    
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      capacidad: row.capacidad,
      disponible: row.disponible,
      imagen: row.imagen,
      descripcion: row.descripcion,
      esExtra: row.es_extra
    });
  } catch (error) {
    console.error('Error creating extra space:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 4. Eliminar ambiente extra (Admin)
app.delete('/api/espacios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Validar que exista y que sea un ambiente extra
    const checkResult = await pool.query('SELECT es_extra FROM espacios WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Espacio no encontrado" });
    }
    if (!checkResult.rows[0].es_extra) {
      return res.status(400).json({ message: "No se pueden eliminar espacios principales" });
    }
    
    await pool.query('DELETE FROM espacios WHERE id = $1', [id]);
    res.json({ message: "Espacio eliminado correctamente" });
  } catch (error) {
    console.error('Error deleting extra space:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 5. Obtener reservas
app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY id DESC');
    const list = result.rows.map(row => ({
      id: row.id,
      espacio: row.espacio,
      fecha: row.fecha,
      hora: row.hora,
      estado: row.estado,
      codigoAlumno: row.codigo_alumno
    }));
    res.json(list);
  } catch (error) {
    console.error('Error fetching reservas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 6. Crear una reserva
app.post('/api/reservas', async (req, res) => {
  const { espacio, fecha, hora, codigoAlumno } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reservas (espacio, fecha, hora, estado, codigo_alumno) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [espacio, fecha, hora, 'Confirmada', codigoAlumno]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      espacio: row.espacio,
      fecha: row.fecha,
      hora: row.hora,
      estado: row.estado,
      codigoAlumno: row.codigo_alumno
    });
  } catch (error) {
    console.error('Error creating reserva:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 7. Eliminar/Anular una reserva
app.delete('/api/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva anulada correctamente" });
  } catch (error) {
    console.error('Error deleting reserva:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 8. Obtener faltas de un alumno
app.get('/api/faltas/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query('SELECT cantidad FROM faltas WHERE codigo_alumno = $1', [codigo]);
    const cantidad = result.rows.length > 0 ? result.rows[0].cantidad : 0;
    res.json({ codigo, faltas: cantidad });
  } catch (error) {
    console.error('Error fetching faltas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// 9. Actualizar faltas de un alumno (Admin)
app.patch('/api/faltas/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { accion } = req.body;
  try {
    // Validar si el registro existe
    const checkResult = await pool.query('SELECT cantidad FROM faltas WHERE codigo_alumno = $1', [codigo]);
    let cantidad = 0;
    
    if (checkResult.rows.length === 0) {
      // Crear registro inicial con 0 faltas
      await pool.query('INSERT INTO faltas (codigo_alumno, cantidad) VALUES ($1, 0)', [codigo]);
    } else {
      cantidad = checkResult.rows[0].cantidad;
    }
    
    if (accion === 'incrementar') {
      cantidad += 1;
    } else if (accion === 'decrementar' && cantidad > 0) {
      cantidad -= 1;
    }
    
    const updateResult = await pool.query(
      'UPDATE faltas SET cantidad = $1 WHERE codigo_alumno = $2 RETURNING *',
      [cantidad, codigo]
    );
    
    res.json({ codigo, faltas: updateResult.rows[0].cantidad });
  } catch (error) {
    console.error('Error updating faltas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('API de UniReserva funcionando en PostgreSQL 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
