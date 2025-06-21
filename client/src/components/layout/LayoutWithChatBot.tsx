'use client';
import { ReactNode } from 'react';
import ChatBot from '@/components/common/ChatBot';

interface LayoutWithChatBotProps {
  children: ReactNode;
}

export default function LayoutWithChatBot({ children }: LayoutWithChatBotProps) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
