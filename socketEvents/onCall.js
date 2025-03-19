import { io } from "../server.js";

const onCall = (participants, callType) => {
    if (participants.receiver.socketId) {
        io.to(participants.receiver.socketId).emit("incomingCall", { participants, callType });
    }
};

export default onCall;

