import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { HardHat, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessModeSwitcher({ currentMode, onModeChange }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleModeSwitch = async (newMode) => {
        setIsUpdating(true);
        try {
            await base44.auth.updateMe({ business_mode: newMode });
            onModeChange(newMode);
            window.location.reload();
        } catch (error) {
            console.error('Error switching mode:', error);
        }
        setIsUpdating(false);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isUpdating}>
                    {currentMode === 'construction' ? (
                        <>
                            <HardHat className="w-4 h-4 mr-2" />
                            Construction
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Cleaning
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleModeSwitch('construction')}>
                    <HardHat className="w-4 h-4 mr-2" />
                    Construction
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModeSwitch('cleaning')}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Cleaning
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}