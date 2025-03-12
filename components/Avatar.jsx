import React from 'react'
import Image from 'next/image'
import { FaUserCircle } from 'react-icons/fa'

const Avatar = ({ src }) => {
    if (src) {
        return (
            <Image
                src={src}
                alt="Avtar"
                className='rounded-full'
                width={40}
                height={40}
            />
        )
    }
    return <FaUserCircle size={24} />
}

export default Avatar