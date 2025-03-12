import { io } from "../server.js";

const onCall = (participants) => {
    if (participants.receiver.socketId) {
        io.to(participants.receiver.socketId).emit("incomingCall", participants);
    }
};

export default onCall;

