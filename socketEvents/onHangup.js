import { io } from "socket.io-client";


const onHangUp = (data) => {
    let socketIdToEmitTo;
    if (data.ongoingCall.participants.caller.userId === data.userHangingUpId) {
        socketIdToEmitTo = data.ongoingCall.participants.receiver.socketId;
    } else {
        socketIdToEmitTo = data.ongoingCall.participants.caller.socketId;
    }

    if (socketIdToEmitTo) {
        io.to(socketIdToEmitTo).emit("hangup");
    }
}

export default onHangUp;
