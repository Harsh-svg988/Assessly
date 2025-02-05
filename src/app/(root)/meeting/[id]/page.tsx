"use client"
import LoaderUI from '@/components/LoaderUI';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

function MeetingPage() {
    const{id} = useParams();
    const{isLoaded} = useUser();

    const isCallLoading = true;
    const [isSetupComplete,setIsSetupComplete] = useState(false);

    if(!isLoaded || isCallLoading) return <LoaderUI/>

    return <StreamCall>
        <StreamTheme>
            {!isSetupComplete ? (
                <MeetingSetup onSetupComplete={()=>setIsSetupComplete(true)}/>
            ):(
                <MeetingRoom/>
            )}
        </StreamTheme>
    </StreamCall>
}

export default MeetingPage;
