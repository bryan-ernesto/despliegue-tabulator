const express = require('express');
const app = express();
const path = require('path');

// Configura la carpeta "public" como carpeta de recursos estáticos
app.use(express.static('public'));

// Manejador de ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia el servidor en el puerto 3000
app.listen(3000, '172.16.196.1', () => {
  console.log('Servidor iniciado en http://172.16.196.1:3000');
});
