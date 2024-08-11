const socket = io();
const a=prompt();
if(a==="churan"){
    socket.emit("churan");
}
socket.on('churan from back',function(){
    console.log("recieved from back")
})