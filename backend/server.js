// filepath: c:\Users\diego\vikingosWeb\Backend\server.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Archivo de conexión a MySQL

const app = express();
app.use(express.json()); // Middleware para manejar JSON

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para verificar el token JWT
function autenticarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Prueba de conexión
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS resultado', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ resultado: results[0].resultado });
  });
});

// Endpoint para registrar usuarios
app.post('/api/usuarios', async (req, res) => {
  const { username, email, password, rol } = req.body;

  if (!username || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO usuarios (username, email, password, rol) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, rol], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, message: 'Usuario registrado' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Endpoint para iniciar sesión
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Nombre de usuario y contraseña son obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, 'secreto', { expiresIn: '1h' });
    res.json({ token, message: 'Inicio de sesión exitoso' });
  });
});

// Endpoint para obtener jugadores
app.get('/api/jugadores', (req, res) => {
  db.query('SELECT * FROM jugadores', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Endpoint para agregar un jugador (solo administradores)
app.post('/api/jugadores', autenticarToken, (req, res) => {
  if (req.user.rol !== 1) {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { nombre, promedio, jonrones } = req.body;
  const query = 'INSERT INTO jugadores (nombre, promedio, jonrones) VALUES (?, ?, ?)';
  db.query(query, [nombre, promedio, jonrones], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, message: 'Jugador agregado' });
  });
});

// Endpoint para editar un jugador (solo administradores)
app.put('/api/jugadores/:id', autenticarToken, (req, res) => {
  if (req.user.rol !== 1) {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { id } = req.params;
  const { nombre, promedio, jonrones } = req.body;
  const query = 'UPDATE jugadores SET nombre = ?, promedio = ?, jonrones = ? WHERE id = ?';
  db.query(query, [nombre, promedio, jonrones, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Jugador actualizado' });
  });
});

// Endpoint para eliminar un jugador (solo administradores)
app.delete('/api/jugadores/:id', autenticarToken, (req, res) => {
  if (req.user.rol !== 1) {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { id } = req.params;
  const query = 'DELETE FROM jugadores WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Jugador eliminado' });
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});