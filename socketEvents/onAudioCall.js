export default function onAudioCall({ senderId, receiverId }, callback) {
    const callData = { senderId, receiverId, callType: "audio" };
    this.to(receiverId).emit("incomingAudioCall", callData);
    callback({ success: true });
}