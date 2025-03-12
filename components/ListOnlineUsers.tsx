'use client'
import React from 'react'
import { useSocket } from '@/context/SocketContext'
import { useUser } from '@clerk/nextjs';
import Avatar from './Avatar';
const ListOnlineUsers = () => {
    const { user } = useUser();
    const { onlineUsers, handleCall } = useSocket();
    return (
        <div className='flex  w-full items-center pb-2 gap-5'>
            {onlineUsers && onlineUsers?.map((onlineUser) => {
                if (onlineUser.profile.id === user?.id) return null
                return (
                    <div key={onlineUser.userId} className='flex flex-col items-center gap-1 cursor-pointer' onClick={() => handleCall(onlineUser)}>
                        <Avatar src={onlineUser.profile.imageUrl} />
                        <p>{onlineUser.profile.firstName}</p>

                    </div>
                )
            })}
        </div>
    );
};

export default ListOnlineUsers