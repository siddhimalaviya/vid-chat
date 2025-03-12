"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket, io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import { OngoingCall, Participants, PeerData, SocketUser } from "@/types";
import Peer, { SignalData } from "simple-peer";

interface iSocketContext {
    onlineUsers: SocketUser[] | null;
    ongoingCall: OngoingCall | null;
    localStream: MediaStream | null;
    peers: PeerData | null;
    isCallEnded: boolean;
    handleCall: (user: SocketUser) => void;
    handleJoinCall: (ongoingCall: OngoingCall) => void;
    handleHangUp: (data: { ongoingCall: OngoingCall | null, isEmitHangUp: boolean }) => void;
    // handleEndCall: (callerId: string) => void;
}
export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [socket, setSocket] = useState<ClientSocket | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
    const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<PeerData | null>(null);
    const [isCallEnded, setIsCallEnded] = useState(false);

    const currentSocketUser = onlineUsers?.find((onlineUser) => onlineUser.userId === user?.id);

    const getMediaStream = useCallback(async (faceMode?: string) => {
        if (localStream) return localStream;
        try {
            debugger;
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === "videoinput");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 360, ideal: 720, max: 1080 },
                    frameRate: { min: 16, ideal: 30, max: 30 },
                    facingMode: videoDevices.length > 1 ? faceMode : undefined
                }
            });
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.log('Failed to get media stream', error);
            setLocalStream(null);
            return null;
        }
    }, [localStream]);

    const handleCall = useCallback(async (user: SocketUser) => {
        setIsCallEnded(false);
        if (!currentSocketUser || !socket) return;
        const stream = await getMediaStream();
        if (!stream) {
            console.log('No stream in handleCall');
            return;
        }
        const participants = { caller: currentSocketUser, receiver: user }
        setOngoingCall({
            participants,
            isRinging: false
        });
        socket?.emit("call", participants);
    }, [socket, currentSocketUser, ongoingCall]);

    const onIncomingCall = useCallback((participants: Participants) => {
        setOngoingCall({
            participants,
            isRinging: true
        });
    }, [socket, user, ongoingCall]);

    const handleHangUp = useCallback((data: { ongoingCall: OngoingCall | null, isEmitHangUp: boolean }) => {
        if (socket && user && data?.ongoingCall && data?.isEmitHangUp) {
            socket.emit("hangup", {
                ongoingCall: data.ongoingCall,
                userHangingUpId: user.id
            });
        }
        setOngoingCall(null);
        setPeers(null);
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                track.stop();
            });
            setLocalStream(null);
        }
        setIsCallEnded(true);
    }, [socket, ongoingCall, localStream]);

    const createPeer = useCallback((stream: MediaStream, initiator: boolean) => {
        const iceServers: RTCIceServer[] = [
            {
                urls: [
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun3.l.google.com:19302',
                    'stun:stun4.l.google.com:19302',
                ]
            }
        ]
        const peer = new Peer({
            stream,
            initiator,
            trickle: true,
            config: { iceServers }
        })
        peer.on('stream', (stream) => {
            setPeers((prevPeers) => {
                if (prevPeers) {
                    return { ...prevPeers, stream }
                }
                return prevPeers;
            })
        })
        peer.on('error', (error) => { console.log('Peer error', error); })
        peer.on('close', () => { handleHangUp({ ongoingCall: ongoingCall, isEmitHangUp: false }); })
        const rtcPeerConnection: RTCPeerConnection = (peer as any)._pc
        rtcPeerConnection.oniceconnectionstatechange = async () => {
            if (rtcPeerConnection.iceConnectionState === 'disconnected' || rtcPeerConnection.iceConnectionState === 'failed') {
                handleHangUp({ ongoingCall: ongoingCall, isEmitHangUp: false });
            }
        }
        return peer;
    }, [ongoingCall]);

    const completePeerConnection = useCallback(async (connectionData: { sdp: SignalData, ongoingCall: OngoingCall, isCaller: boolean }) => {
        if (!localStream) {
            console.log('No local stream in completePeerConnection');
            return;
        }
        if (peers) {
            peers.peerConnection.signal(connectionData.sdp);
            return;
        }
        const newPeer = createPeer(localStream, true);
        setPeers({
            peerConnection: newPeer,
            stream: undefined,
            participantUser: connectionData.ongoingCall.participants.receiver
        })
        newPeer.on('signal', async (data: SignalData) => {
            if (socket) {
                socket.emit('webrtcSignal', {
                    sdp: data,
                    ongoingCall,
                    isCaller: false
                })
            }
        })
    }, [localStream, createPeer, peers, ongoingCall]);

    const handleJoinCall = useCallback(async (ongoingCall: OngoingCall) => {
        setIsCallEnded(false);
        setOngoingCall(prev => {
            if (prev) {
                return { ...prev, isRinging: false }
            }
            return prev;
        });
        const stream = await getMediaStream();
        if (!stream) {
            console.log('No stream in handleJoinCall');
            handleHangUp({ ongoingCall: ongoingCall ? ongoingCall : null, isEmitHangUp: false });
            return;
        }
        const newPeer = createPeer(stream, true);
        setPeers({
            peerConnection: newPeer,
            stream: undefined,
            participantUser: ongoingCall.participants.caller
        })
        newPeer.on('signal', async (data: SignalData) => {
            if (socket) {
                socket.emit('webrtcSignal', {
                    sdp: data,
                    ongoingCall,
                    isCaller: false
                })
            }
        })

    }, [socket, currentSocketUser]);


    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        if (socket.connected) {
            onConnect();
        }
        function onConnect() {
            setIsSocketConnected(true);
        }

        function onDisconnect() {
            setIsSocketConnected(false);
        }
        socket?.on("connect", onConnect);
        socket?.on("disconnect", onDisconnect);
        return () => {
            socket?.off("connect", onConnect);
            socket?.off("disconnect", onDisconnect);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !isSocketConnected) return;

        socket.emit("addNewUser", user);
        socket.on("getUsers", (res) => {
            setOnlineUsers(res);
        });
        return () => {
            socket?.off("getUsers", (res) => {
                setOnlineUsers(res);
            });
        };
    }, [socket, isSocketConnected, user]);

    useEffect(() => {
        if (!socket || !isSocketConnected) return;
        socket.on("incomingCall", onIncomingCall);
        socket.on("webrtcSignal", completePeerConnection);
        socket.on("hangup", () => {
            handleHangUp({ ongoingCall: ongoingCall, isEmitHangUp: false });
        })
        return () => {
            socket?.off("incomingCall", onIncomingCall);
            socket?.off("webrtcSignal", completePeerConnection);
            socket?.off("hangup", () => {
                handleHangUp({ ongoingCall: ongoingCall, isEmitHangUp: false });
            })
        };
    }, [socket, isSocketConnected, ongoingCall, user, completePeerConnection]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (isCallEnded) {
            timeout = setTimeout(() => {
                setIsCallEnded(false);
            }, 2000);
        }
        return () => clearTimeout(timeout);
    }, [isCallEnded]);

    return <SocketContext.Provider value={{
        onlineUsers,
        handleCall,
        localStream,
        ongoingCall,
        handleJoinCall,
        peers,
        handleHangUp,
        isCallEnded
    }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketContextProvider");
    }
    return context;
};
