import { Toaster } from 'sonner';

// 這個組件只需要放在 App.tsx 一次就好
export function NotificationProvider() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }}
    />
  );
}