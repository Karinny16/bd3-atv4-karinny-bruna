const express = require('express');
const http = require('http');       
const socketIo = require('socket.io'); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server); 
const mongoose = require('mongoose'); 
const ejs = require('ejs');
const path = require('path');
const {Socket} = require('dgram');
const { error } = require('console');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);

app.use('/', (req, res) => {
    res.render('index.html');
});

function connectDB() {
    let dbURL = "mongodb+srv://karinnymedeiros:lunar16@cluster0.oqv0t.mongodb.net/bd3post";
    mongoose.connect(dbURL);
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log('ATLAS MONGO DB CONECTADO COM SUCESSO!');
    });
}

// Use a função correta para estabelecer a conexão com o banco de dados.
connectDB();

let Message = mongoose.model('MessagesChat',{
   titulo: String,
   data_hora: String,
   post: String
});

/* LOGICA DO SOCKET.IO - ENVIO PROPAGAÇÃO DE MENSAGENS */
let messages = [];
Message.find({})
   .then(docs => {
      messages = docs;
   }).catch(error => {
      console.log(error);
   });

io.on('connection', socket => {
   console.log('Usuário conectado! ' + socket.id);

   // Buscar mensagens do MongoDB sempre que um usuário se conectar
   Message.find({})
      .then(docs => {
         socket.emit('previousMessages', docs);
      })
      .catch(error => {
         console.log(error);
      });

   socket.on('sendMessage', data => {
      let message = new Message(data); 
      message.save()
         .then(() => {
            // Envia para todos, inclusive para quem enviou
            io.emit('receivedMessage', data);
         })
         .catch(error => {
            console.error(error);
         });
      console.log('Mensagem salva e enviada!');
   });
});

server.listen(3000, () => {
   console.log('CHAT RODANDO EM - http://localhost:3000');
});