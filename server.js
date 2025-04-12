const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new sqlite3.Database('./db.sqlite');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'segredo', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

function auth(req, res, next) {
  if (req.session.usuario) return next();
  res.redirect('/login.html');
}

app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  db.run('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)', [nome, email, hash], err => {
    if (err) return res.send('Erro ao cadastrar');
    res.redirect('/login.html');
  });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.send('Login inválido');
    }
    req.session.usuario = usuario;
    res.redirect('/chat.html');
  });
});

app.get('/chat.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

io.on('connection', socket => {
  socket.on('mensagem', msg => {
    io.emit('mensagem', msg);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});