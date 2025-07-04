'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRoomId } from '@/lib/utils';
import { MessageCircle, Plus, ArrowRight } from 'lucide-react';

export default function ChatLobby() {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socket');
    };
    socketInitializer();
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    if (userName.trim()) {
      router.push(`/chat/${newRoomId}?userName=${userName.trim()}`);
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim() && roomCode.trim()) {
      router.push(`/chat/${roomCode.trim()}?userName=${userName.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface-tonal-100 dark:bg-surface-tonal-100 flex items-center justify-center p-4 sm:p-4">
      <div className="relative w-full max-w-md">
        {/* Main Card - responsive layout */}
        <div className="bg-transparent sm:bg-light-100/90 sm:dark:bg-surface-tonal-200/95 sm:backdrop-blur-sm sm:rounded-2xl sm:shadow-xl sm:shadow-surface-100/10 sm:dark:shadow-surface-100/30 sm:border sm:border-surface-tonal-400/30 sm:dark:border-surface-400/50 p-6 sm:p-8 space-y-8 transition-all duration-300 sm:hover:shadow-2xl sm:hover:shadow-surface-100/20 sm:dark:hover:shadow-surface-100/40">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-200 rounded-xl shadow-lg shadow-primary-100/25 dark:shadow-primary-100/30 transition-transform duration-300 hover:scale-105">
              <MessageCircle className="w-7 h-7 text-light-100" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-surface-100 dark:text-light-100">
                ChitChat
              </h1>
              <p className="text-surface-500 dark:text-surface-600 text-sm mt-1 font-medium">
                Professional team communication
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-surface-400 dark:text-surface-600 block">
                Display Name
              </label>
              <div className="relative group">
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your display name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-11 px-4 bg-surface-tonal-600/20 dark:bg-surface-tonal-300/50 border-surface-tonal-400 dark:border-surface-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-100/20 focus:border-primary-100 dark:focus:border-primary-300 hover:border-surface-tonal-500 dark:hover:border-surface-500 text-surface-100 dark:text-light-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="roomCode" className="text-sm font-medium text-surface-400 dark:text-surface-600 block">
                Room Code <span className="text-surface-500 dark:text-surface-500 font-normal">(optional)</span>
              </label>
              <div className="relative group">
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code to join"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-11 px-4 bg-surface-tonal-600/20 dark:bg-surface-tonal-300/50 border-surface-tonal-400 dark:border-surface-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-100/20 focus:border-primary-100 dark:focus:border-primary-300 hover:border-surface-tonal-500 dark:hover:border-surface-500 text-surface-100 dark:text-light-100"
                />
              </div>
              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleCreateRoom} 
              disabled={!userName.trim()}
              className="w-full h-11 bg-primary-100 cursor-pointer hover:bg-primary-200 dark:bg-primary-200 dark:hover:bg-primary-300 text-light-100 font-medium rounded-lg shadow-sm shadow-primary-100/25 transition-all duration-200 hover:shadow-md hover:shadow-primary-100/30 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
              Create New Room
            </Button>
            
            <Button 
              onClick={handleJoinRoom} 
              disabled={!userName.trim() || !roomCode.trim()}
              variant="outline"
              className="w-full h-11 border border-surface-tonal-400 cursor-pointer dark:border-surface-400 bg-light-100 dark:bg-surface-tonal-300 hover:bg-surface-tonal-600/10 dark:hover:bg-surface-tonal-400 text-surface-300 dark:text-surface-600 font-medium rounded-lg transition-all duration-200 hover:border-surface-tonal-500 dark:hover:border-surface-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <ArrowRight className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-0.5" />
              Join Room
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-surface-tonal-400/40 dark:border-surface-400/40">
            <div className="flex items-center justify-center space-x-4 text-xs text-surface-500 dark:text-surface-600">
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-primary-300 rounded-full mr-1.5"></div>
                Secure
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-primary-100 rounded-full mr-1.5"></div>
                Real-time
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-1.5"></div>
                Private
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
