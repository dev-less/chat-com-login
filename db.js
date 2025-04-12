const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT UNIQUE, senha_hash TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS mensagens (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, sala TEXT, mensagem TEXT, data DATETIME DEFAULT CURRENT_TIMESTAMP)');
});

db.close();