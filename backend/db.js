const mysql = require('mysql2');

// Configurar la conexión
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'degolol123', // Cambia esto por la contraseña de tu usuario root
  database: 'vikingos'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

module.exports = db;