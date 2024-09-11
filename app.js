const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const {Chess} = require("chess.js");

const app = express();

const server = http.createServer(app);
const io = socket(server);
let rooms ={}
// const chess = new Chess();

// let players={};
// let currentPlayer = 'w';
let waitingUser = null;

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render("index",{title:"Chess Game"});
})

io.on("connection",function(uniquesocket){
    console.log("a user connected",uniquesocket.id);

    if(waitingUser===null){
        // players.white=uniquesocket.id;
        // uniquesocket.emit("playerRole","w");
        // const room = `room-${uniquesocket.id}`;
        // uniquesocket.join(room);
        // uniquesocket.roomName = room;
        // waitingUser = { id: uniquesocket.id, room };
        // uniquesocket.emit('waiting');  
        const roomName = `room-${uniquesocket.id}`;
        rooms[roomName] = {
            chess: new Chess(),
            players: { white: uniquesocket.id }
        };
        uniquesocket.join(roomName);
        uniquesocket.emit("playerRole", "w");
        uniquesocket.roomName = roomName;
        waitingUser = { id: uniquesocket.id, roomName };
        uniquesocket.emit('waiting',uniquesocket.id);  
        console.log(`Player ${uniquesocket.id} assigned as white and waiting.`);
    }
    else{
        // players.black = uniquesocket.id;
        // uniquesocket.emit("playerRole","b");
        // const room = waitingUser.room;
        // uniquesocket.join(room);
        // uniquesocket.emit('chat-start', room);
        // io.to(waitingUser.id).emit('chat-start', room);
        // console.log("A room created", room)
        // waitingUser = null;
        const roomName = waitingUser.roomName;
        rooms[roomName].players.black = uniquesocket.id;
        uniquesocket.join(roomName);
        uniquesocket.roomName = roomName;
        uniquesocket.emit("playerRole", "b");
        uniquesocket.emit('chat-start', roomName);
        io.to(waitingUser.id).emit('chat-start', roomName);
        // console.log("Room created:", roomName);
        console.log(`Player ${uniquesocket.id} assigned as black in room ${roomName}.`);
        waitingUser = null;
    }

    // if(!players.white){
    //     players.white=uniquesocket.id;
    //     uniquesocket.emit("playerRole","w");
    //     const room = `room-${socket.id}`;
    //     uniquesocket.join(room);
    //     uniquesocket.roomName = room;
    //     waitingUser = { id: socket.id, room };
    //     uniquesocket.emit('waiting');
    // }
    // else if(!players.black){
    //     players.black = uniquesocket.id;
    //     uniquesocket.emit("playerRole","b");
    // }
    // else{
    //     uniquesocket.emit("spectatorRole");
    // }
    //  uniquesocket.on("disconnect",function(){
    //     if(uniquesocket.id===room.players.white){
    //         delete players.white;
    //     }
    //     else if(uniquesocket.id===room.players.black){
    //         delete players.black;
    //     }
        
    // });


    // uniquesocket.on("disconnect", () => {
    //     const roomName = uniquesocket.roomName;
    //     if (roomName && rooms[roomName]) {
    //         const room = rooms[roomName];
    //         if (uniquesocket.id === room.players.white || uniquesocket.id === room.players.black) {
    //             delete rooms[roomName];  // Delete room if one of the players disconnects
    //         }
    //     }
    // });


    uniquesocket.on("move",(move)=>{
        const roomName = uniquesocket.roomName;
        // console.log("Move attempted:", move);
        console.log(uniquesocket.roomName);
        const room = rooms[roomName];
        if (!roomName || !rooms[roomName]) return;
        
        const chess = room.chess;
        
        console.log("Current board state (before move):", chess.fen());
        console.log("Current turn:", chess.turn());


        try {
            if(chess.turn()==="w" && uniquesocket.id !== room.players.white) {
                console.log("It's white's turn, but black tried to move.");
                return;
            }
            if(chess.turn()==="b" && uniquesocket.id !== room.players.black)
                {
                    console.log("It's black's turn, but white tried to move.");   
                    return;
                } 
                    
            const result = chess.move(move);
             console.log("Move result:", result);
            if(result){
                // currentPlayer=chess.turn();
                // const rooms = Array.from(uniquesocket.rooms);
                // const room = rooms[1];
                io.to(roomName).emit('move',move);
                io.to(roomName).emit("boardstate",chess.fen());
                console.log("moved by",uniquesocket.rooms);    
            }
            else{
                console.log("Invalid Move: ",move);
                uniquesocket.emit("invalidMOve",move);
            }
        } catch (err) {
            console.log("invalid by catch",err);
            uniquesocket.emit("Invalid Move: ",move);           
        }
    });

 });

server.listen(3000,function(){
    console.log('Connected on 3000');
    
})