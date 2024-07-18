const express = require('express');
const app = express();
const path = require('path');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, '10.10.10.59', () => {
  console.log('Servidor iniciado en http://10.10.10.59:3000');
});
