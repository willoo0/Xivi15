
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
    <iframe
      src="/minecraft.html"
      className="w-full h-full border-none"
      title="Minecraft"
    />
  );
}
