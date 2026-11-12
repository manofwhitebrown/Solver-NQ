import { useEffect, useState } from 'react';

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function OnlineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="bg-warn/15 px-4 py-2 text-center text-[13px] font-medium text-warn" style={{ paddingTop: 'max(.5rem, var(--sat))' }}>
      You're offline. Saved items still work; new questions will wait in a queue.
    </div>
  );
}
