import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react'

interface iVideoContainer {
    stream: MediaStream;
    isLocalStream: boolean;
    isOnCall: boolean;
}

const VideoContainer = ({ stream, isLocalStream, isOnCall }: iVideoContainer) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video className={cn('rounded border w-[800px]', isLocalStream && isOnCall && 'w-[200px] h-auto absolute  border-purple-500 border-2')} autoPlay playsInline muted={isLocalStream} ref={videoRef} />
    )
}

export default VideoContainer