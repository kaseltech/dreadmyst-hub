'use client';

import dynamic from 'next/dynamic';

// Lazy load ChatWidget so it doesn't block page render
const ChatWidget = dynamic(() => import('./ChatWidget'), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidgetLoader() {
  return <ChatWidget />;
}
