const express = require('express');

const http = require('http');

const SocketIO = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = SocketIO(server);
const mongoose = require('mongoose');

const ejs = require('ejs');

const path = require('path');
const { Socket } = require('dgram');

app.use(express.static(path.join(__dirname, 'public')));
// console.log(path.join(__dirname, 'public'));


app.set('views', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);

app.use('/', (req, res) => {
    res.render('index.html');
})
function connectDB() {
    let dbURL = "mongodb+srv://karinnymedeiros:lunar16@cluster0.oqv0t.mongodb.net/bd3post"
    mongoose.connect(dbURL);
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log('ATLAS MONGO DB CONECTADO COM SUCESSO!');
    })

}
connectDB();

let Message = mongoose.model('message', { usuario: String, data_hora: String, message: String });

/*##### LOGICA DO SOCKET.IO - ENVIO E PROPRAGAÇÃO DE MENSAGEM #####*/

let messages = [];

Message.find({}).then(docs => {
    messages = docs
}).catch(error => {
    console.log(error);
});

/*##### ESTRUTURA DE CONEXÃO DO SOCKET.IO  #####*/

io.on('connection', socket => {

    //Teste de conexão:

    console.log('NOVO USUÁRIO CONECTADO:' + socket.id)
    // recupera e mantem (exibe) as mensagens entre o fron e o back:
    socket.emit('previousMessage', messages);

    // Logica de chat quando uma mensagem é enviada:
    socket.on('sendMessage', data => {

        //Adiciona a mensagem no final do array da mensagens:
        //   messages.push(data);
        let message = new Message(data)

        message.save()
            .then(
                socket.broadcast.emit('receiveMessage', data)
            )
            .catch(error => {
                console.log(error);

            });
        console.log("QTD MENSAGENS:" + messages.length);

    });
    console.log("QTD MENSAGENS:" + messages.length);

})

server.listen(3000, () => {
    console.log('CHAT RODANDO EM - http://localhost:3000')
});