import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import onCall from "./socketEvents/onCall.js";
import onWebrtcSignal from "./socketEvents/onWebrtcSignal.js";
import onHangup from "./socketEvents/onHangup.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "192.168.29.142";
const port = 3001;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export let io;

app.prepare().then(() => {
    const httpServer = createServer(handler);

    io = new Server(httpServer);
    let onlineUsers = [];

    io.on("connection", (socket) => {
        socket.on("addNewUser", (clerkUser) => {
            clerkUser && !onlineUsers.some((user) => user?.userId === clerkUser.id) && onlineUsers.push({
                userId: clerkUser.id,
                socketId: socket.id,
                profile: clerkUser
            });

            io.emit("getUsers", onlineUsers);
        });
        socket.on("disconnect", () => {
            onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
            io.emit("getUsers", onlineUsers);
        });
        socket.on("call", onCall)
        socket.on("webrtcSignal", onWebrtcSignal)
        socket.on("hangup", onHangup)
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});