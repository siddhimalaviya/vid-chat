'use client'
import React, { useEffect } from 'react'
import { useSocket } from '@/context/SocketContext'
import { useUser } from '@clerk/nextjs';
import Avatar from './Avatar';
import { useState } from "react";
import { FaVideo, FaPhone, FaComment } from "react-icons/fa";

const ListOnlineUsers = () => {
    const { user } = useUser();
    const { onlineUsers, handleCall } = useSocket();

    const [selectedUser, setSelectedUser] = useState<string | null>("");

    const [localIp, setLocalIp] = useState('');
    console.log('🚀 ~ App ~ localIp:', localIp);

    useEffect(() => {
        const getLocalIP = async () => {
            debugger
            // const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;

            const pc = new RTCPeerConnection({
                iceServers: [],
            });

            pc.createDataChannel('');

            pc.createOffer().then((offer) => pc.setLocalDescription(offer));

            pc.onicecandidate = (ice) => {
                if (ice && ice.candidate && ice.candidate.usernameFragment) {
                    setLocalIp(ice.candidate.usernameFragment);
                    pc.onicecandidate = null;
                }
            };
        };

        getLocalIP();
    }, []);

    console.log(localIp);


    // return (
    //     <div className='flex  w-full items-center pb-2 gap-5'>
    //         {onlineUsers && onlineUsers?.map((onlineUser) => {
    //             if (onlineUser.profile.id === user?.id) return null
    //             return (
    //                 <div key={onlineUser.userId} className='flex flex-col items-center gap-1 cursor-pointer' onClick={() => handleCall(onlineUser)}>
    //                     <Avatar src={onlineUser.profile.imageUrl} />
    //                     <p>{onlineUser.profile.firstName}</p>

    //                 </div>
    //             )
    //         })}
    //     </div>
    // );
    return (
        <div className="flex w-full items-center pb-2 gap-5">
            {onlineUsers?.map((onlineUser) => {
                if (onlineUser.profile.id === user?.id) return null;

                return (
                    <div key={onlineUser.userId} className="relative">
                        <div
                            className="flex flex-col items-center gap-1 cursor-pointer"
                            onClick={() => setSelectedUser(selectedUser === onlineUser.userId ? null : onlineUser.userId)}
                        >
                            <Avatar src={onlineUser.profile.imageUrl} />
                            <p>{onlineUser.profile.firstName}</p>
                        </div>

                        {/* Options Dropdown */}
                        {selectedUser === onlineUser.userId && (
                            <div className="absolute top-12 left-3/4 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-2">
                                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100" onClick={() => handleCall(onlineUser, 'video')}>
                                    <FaVideo className="text-blue-500" /> Video Call
                                </button>
                                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100" onClick={() => handleCall(onlineUser, 'audio')}>
                                    <FaPhone className="text-green-500" /> Audio Call
                                </button>
                                <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100" >
                                    <FaComment className="text-gray-500" /> Send Message
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ListOnlineUsers

