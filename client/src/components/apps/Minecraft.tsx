
import { useEffect } from 'react';

export function Minecraft() {
  useEffect(() => {
    // Fix iframe focus issues
    const handleClick = () => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.focus();
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="w-full h-full">
      <iframe
        src="/minecraft.html"
        className="w-full h-full border-0"
        title="Minecraft"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
