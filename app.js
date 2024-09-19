const express = require("express");
const socket = require("socket.io");
const http = require("http");
const path = require("path");
const {Chess} = require("chess.js");
const { log } = require("console");

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

let name;
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
            players: { white: uniquesocket.id, name:'' }
        };
        uniquesocket.join(roomName);
        uniquesocket.emit("playerRole", "w");
        uniquesocket.roomName = roomName;
        waitingUser = { id: uniquesocket.id, roomName, };
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
        // uniquesocket.on('PlayerName',(data,id)=>{
        uniquesocket.emit('chat-start',roomName);
        //     io.to(id).emit('chat-start',roomName,data);
        //     console.log(data);
            
        // })
        io.to(waitingUser.id).emit('chat-start', roomName);
        
        // console.log("Room created:", roomName);
        console.log(`Player ${uniquesocket.id} assigned as black in room ${roomName}.`);
        waitingUser = null;
    }

    uniquesocket.on("disconnect",()=>{
        // console.log(`waiting user: ${waitingUser.id}`);
        const roomName = uniquesocket.roomName;
        // if white player leave the match....
        if(uniquesocket.id===rooms[roomName].players.white){
            // goes to waiting state
            io.to(rooms[roomName].players.black).emit('waiting',rooms[roomName].players.black);
            //if no waitinguser 
            if(!waitingUser){
                io.to(rooms[roomName].players.black).emit('playerRole','w');
                rooms[roomName].players.white = rooms[roomName].players.black;
                rooms[roomName].players.black = ''; 
                waitingUser={id:rooms[roomName].players.white,roomName};
                // waitingUser=null;
            }
            // if waitinguser
            else if(waitingUser){
                const roomName2 = waitingUser.roomName;
                const leftSocketId = rooms[roomName].players.black;
                const left = io.sockets.sockets.get(leftSocketId);
                console.log(io.sockets.adapter.rooms);
                left.leave(left.roomName);
                left.join(roomName2);
                left.roomName = roomName2;
                rooms[roomName2].players.black = leftSocketId;
                io.to(rooms[roomName2].players.black).emit('playerRole','b');
                io.to(rooms[roomName2].players.black).emit('chat-start',roomName2);
                io.to(rooms[roomName2].players.white).emit('chat-start',roomName2);
                waitingUser=null;

                console.log(rooms[roomName2]);
                console.log(io.sockets.adapter.rooms);
                
                // rooms[roomName].players.white=wt.id;
                // console.log(wt.roomName);
                // io.to(rooms[roomName].players.white).emit('playerRole','w');
                // io.to(rooms[roomName].players.white).emit('chat-start',roomName);
                // io.to(rooms[roomName].players.black).emit('chat-start',roomName);
                // waitingUser=null;
                // const roomName2 = waitingUser.roomName;
                // rooms[roomName2].players ={ white: waitingUser.id, black: rooms[roomName].players.black};
                // const socketId = rooms[roomName2].players.black;
                // const whiteRoom = io.sockets.sockets.get(socketId);
                // whiteRoom.leave(roomName);
                // whiteRoom.join(waitingUser.roomName);
                // io.to(rooms[roomName2].players.black).emit("playerRole","b");
                // io.to(rooms[roomName2].players.white).emit('chat-start',roomName2);
                // io.to(rooms[roomName2].players.black).emit('chat-start',roomName2);
                // console.log(rooms[roomName2]);
                // waitingUser=null;
            }
            
            // waitingUser=null;
            
        } 


        //if black player leaves
        else if(uniquesocket.id===rooms[roomName].players.black){
            io.to(rooms[roomName].players.white).emit('waiting',rooms[roomName].players.white); 
            // // if waitinguser
            if(!waitingUser){
                waitingUser = { id: rooms[roomName].players.white, roomName:roomName };
                delete rooms[roomName].players.black;
            }

            // //if not waiting user
            else{
                const roomName2 = waitingUser.roomName;
                const leftSocketId = rooms[roomName].players.white;
                const left = io.sockets.sockets.get(leftSocketId);
                console.log(io.sockets.adapter.rooms);
                left.leave(left.roomName);
                left.join(roomName2);
                left.roomName = roomName2;
                rooms[roomName2].players.black = leftSocketId;
                io.to(rooms[roomName2].players.black).emit('playerRole','b');
                io.to(rooms[roomName2].players.black).emit('chat-start',roomName2);
                io.to(rooms[roomName2].players.white).emit('chat-start',roomName2);
                waitingUser=null;


                // const wt = io.sockets.sockets.get(waitingUser.id);
                // console.log(`waiting user id ${waitingUser.id} , wt ${wt.players}`);
                // wt.leave(`room-${wt.id}`);
                // wt.join(roomName);
                // wt.roomName = roomName;
                // console.log(io.sockets.adapter.rooms);
                // rooms[roomName].players.black=wt.id;
                // console.log(wt.roomName);
                // io.to(rooms[roomName].players.black).emit('playerRole','b');
                // io.to(rooms[roomName].players.white).emit('chat-start',roomName);
                // io.to(rooms[roomName].players.black).emit('chat-start',roomName);
                // waitingUser=null;
                
            }
        }

        console.log(`user disconnected ${uniquesocket.id} and ${uniquesocket.roomName}`);
    })
    

    uniquesocket.on("move",(move)=>{
        const roomName = uniquesocket.roomName;
        const room = rooms[roomName];
        
        if (!roomName || !rooms[roomName]) return;
        
        const chess = room.chess;
        
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
