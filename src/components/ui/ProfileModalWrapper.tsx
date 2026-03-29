'use client';

import ProfileModal from './ProfileModal';

interface ProfileModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModalWrapper({ isOpen, onClose }: ProfileModalWrapperProps) {
    // Simplified - no longer passing dashboard context
    return (
        <ProfileModal 
            isOpen={isOpen} 
            onClose={onClose} 
        />
    );
}