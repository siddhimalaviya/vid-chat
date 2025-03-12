'use client'

import { useAuth, UserButton } from '@clerk/nextjs'
import { VideoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import Container from './Container'

const Navbar = () => {
    const router = useRouter()
    const { userId } = useAuth()
    return (
        <div className='sticky top-0 border border-b-primary/10'>
            <Container>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1 cursor-pointer' onClick={() => router.push('/')}>
                        <VideoIcon className='w-6 h-6' />
                        <div className='font-bold text-xl'>VidChat</div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <UserButton />
                        {!userId && (
                            <>
                                <Button size='sm' variant='outline' onClick={() => router.push('/sign-in')}>
                                    Sign in
                                </Button>
                                <Button size='sm' variant='outline' onClick={() => router.push('/sign-up')}>
                                    Sign up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Navbar