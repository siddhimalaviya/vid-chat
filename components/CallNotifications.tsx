"use client"

import { useSocket } from '@/context/SocketContext';
import React from 'react'
import Avatar from './Avatar';
import { MdCall, MdCallEnd } from 'react-icons/md';

const CallNotifications = () => {
    const { ongoingCall, handleJoinCall, handleHangUp } = useSocket();
    if (!ongoingCall?.isRinging) return;
    return (
        <div className='absolute w-screen h-screen top-0 bottom-0 flex items-center justify-center bg-slate-500 opacity-80'>
            <div className='bg-white min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4'>
                <div>
                    <Avatar src={ongoingCall.participants.caller.profile.imageUrl} />
                    <h3 className='text-sm'>{ongoingCall.participants.caller.profile.firstName}</h3>
                </div>
                <p className='text-sm mb-2'>Incoming Call</p>
                <div className='flex gap-8'>
                    <button onClick={() => handleJoinCall(ongoingCall)} className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center'><MdCall size={24} color='white' /></button>
                    <button onClick={() => handleHangUp({ ongoingCall: ongoingCall, isEmitHangUp: true })} className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center'><MdCallEnd size={24} color='white' /></button>
                </div>
            </div>
        </div>
    )
}

export default CallNotifications