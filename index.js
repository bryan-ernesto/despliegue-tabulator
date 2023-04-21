const express = require('express');
const app = express();
const path = require('path');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, '172.16.196.1', () => {
  console.log('Servidor iniciado en http://172.16.196.1:3000');
});
