import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import React, { useState } from 'react'
import { DialogHeader } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import useMeetingActions from '@/hooks/useMeetingActions';

interface MeetingModalProps{
    isOpen:boolean;
    onClose:() => void;
    title:string;
    isJoinMeeting:boolean;
}

function MeetingModal({isOpen,onClose,title,isJoinMeeting}:MeetingModalProps) {
    const [meetingUrl,setMeetingUrl] = useState("");
    const {createInstantMeeting,joinMeeting} = useMeetingActions()

    const handleStart = ()=>{
        if(isJoinMeeting){
            // getting id from the meeting link & calling the fn to join the meeting 
            const meetingId = meetingUrl ? meetingUrl.split("/").pop()?.replace("meeting", "") : "";
            console.log(meetingId);
            if(meetingId)joinMeeting(meetingId);
        }else{
            createInstantMeeting();
        }
        setMeetingUrl("")
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:mx-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className='space-y-4 pt-4'></div>

                {isJoinMeeting && (
                    <Input
                    placeholder='Paste meeting link here'
                    value={meetingUrl}
                    onChange={(e)=>setMeetingUrl(e.target.value)} 
                    />
                )}

                <div className='flex justify-end gap-3'>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleStart} disabled={isJoinMeeting && !meetingUrl.trim()}>
                        {isJoinMeeting ? "Join Meeting" : "Start Meeting"}
                    </Button>
                </div> 
            </DialogContent>
        </Dialog>
    )
}

export default MeetingModal
