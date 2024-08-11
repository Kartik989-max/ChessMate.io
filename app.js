const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const {Chess} = require("chess.js");
const { log } = require("console");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players={};
let currentPlater = 'w';

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render("index",{title:"Chess Game"});
})

io.on("connection",function(uniquesocket){
    uniquesocket.on("churan",function(){
        io.emit("churan from back");
    })
    
});

server.listen(3000,function(){
    console.log('Connected on 3000');
    
})