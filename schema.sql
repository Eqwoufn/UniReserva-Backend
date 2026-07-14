-- Crear tabla de espacios
CREATE TABLE IF NOT EXISTS espacios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    imagen VARCHAR(100) NOT NULL,
    descripcion TEXT,
    es_extra BOOLEAN DEFAULT FALSE
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    espacio VARCHAR(100) NOT NULL,
    fecha VARCHAR(100) NOT NULL,
    hora VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Confirmada',
    codigo_alumno VARCHAR(20) NOT NULL
);

-- Crear tabla de faltas
CREATE TABLE IF NOT EXISTS faltas (
    codigo_alumno VARCHAR(20) PRIMARY KEY,
    cantidad INT DEFAULT 0
);

-- Poblar la tabla de espacios con los datos iniciales
INSERT INTO espacios (nombre, categoria, capacidad, disponible, imagen, descripcion, es_extra)
VALUES 
('Piscina', 'Áreas Deportivas', 1, TRUE, 'piscina_ulima.png', 'Instalación de natación olímpica con carriles oficiales y vestuarios equipados. Contamos con instructores permanentes para supervisión y entrenamiento. Se requiere traje de baño, gorro y ducha previa para ingresar.', FALSE),
('Cancha de Fútbol', 'Áreas Deportivas', 12, TRUE, 'futbol_ulima.png', 'Terreno de césped sintético con medidas oficiales para partidos de fútbol. Contamos con docentes para arbitraje y balones a disposición de los alumnos. Se requiere calzado deportivo adecuado.', FALSE),
('Cancha de Basket', 'Áreas Deportivas', 10, TRUE, 'basket_ulima.png', 'Losa deportiva multiusos equipada con aros oficiales y tableros profesionales. Contamos con docentes a cargo del préstamo de balones e implementación de partidos. Se solicita zapatillas deportivas.', FALSE),
('Sala de Estudio A', 'Áreas de Estudio', 3, TRUE, 'salaetudio_ulima_1.png', 'Ambiente privado con aislamiento acústico completo ideal para concentrarse en grupo. Cuenta con televisores, pizarra acrílica y iPads disponibles para préstamo. Prohibido el ingreso de comida.', FALSE),
('Sala de Estudio B', 'Áreas de Estudio', 3, TRUE, 'salaetudio_ulima_2.png', 'Espacio de trabajo grupal privado dotado de conectividad HDMI y red de alta velocidad. Equipado con iPads, pantallas de proyección y paneles móviles. Prohibido el ingreso de alimentos.', FALSE),
('Laboratorio de IA', 'Laboratorios', 5, TRUE, 'laboratorioia_ulima.png', 'Sala especializada equipada con computadoras de alta gama y tarjetas de procesamiento gráfico dedicadas. Contamos con soporte técnico docente en todo momento. Exclusivo para proyectos de computación.', FALSE),
('Laboratorio de Ing. Civil', 'Laboratorios', 5, TRUE, 'laboratoriocivil_ulima.png', 'Sala técnica con computadoras de alto rendimiento equipadas con licencias de AutoCAD y SAP2000. Contamos con asesores estructurales permanentes. Exclusivo para diseño e ingeniería estructural.', FALSE)
ON CONFLICT DO NOTHING;

-- Agregar valores iniciales para faltas de prueba
INSERT INTO faltas (codigo_alumno, cantidad) VALUES ('20236694', 1) ON CONFLICT (codigo_alumno) DO NOTHING;
