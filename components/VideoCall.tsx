"use client"
import { useSocket } from '@/context/SocketContext';
import { useCallback, useEffect, useState } from 'react';
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md';
import VideoContainer from './VideoContainer';

const VideoCall = () => {
    const { localStream, peers, ongoingCall, handleHangUp, isCallEnded } = useSocket();
    const [isMiceOn, setIsMiceOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);

    useEffect(() => {
        if (localStream) {
            setIsVideoOn(localStream.getVideoTracks()[0].enabled);
            setIsMiceOn(localStream.getAudioTracks()[0].enabled);
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks()[0];
            videoTracks.enabled = !videoTracks.enabled;
            setIsVideoOn(videoTracks.enabled);
        }
    }, [localStream]);

    const toggleMice = useCallback(() => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks()[0];
            audioTracks.enabled = !audioTracks.enabled;
            setIsMiceOn(audioTracks.enabled);
        }
    }, [localStream]);

    const isOnCall = localStream && peers && ongoingCall ? true : false;
    if (isCallEnded) {
        return <div className='mt-5 text-rose-500 text-center'>Call Ended</div>
    }

    if (!localStream && !peers) return;

    return (
        <div>
            <div className='mt-4 relative max-w-[800px] mx-auto'>
                {localStream && <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} />}
                {peers && peers.stream && <VideoContainer stream={peers.stream} isLocalStream={false} isOnCall={isOnCall} />}
            </div>
            <div className='mt-8 flex items-center justify-center bg-slate-400'>
                <button onClick={toggleMice}>
                    {isMiceOn && <MdMicOff size={28} />}
                    {!isMiceOn && <MdMic size={28} />}
                </button>
                <button onClick={() => handleHangUp({ ongoingCall: ongoingCall ? ongoingCall : null, isEmitHangUp: true })} className='px-4 py-2 bg-rose-500 text-white rounded mx-4'>
                    End Call
                </button>
                <button onClick={toggleCamera}>
                    {isVideoOn && <MdVideocamOff size={28} />}
                    {!isVideoOn && <MdVideocam size={28} />}
                </button>
            </div>
        </div>
    )
}

export default VideoCall