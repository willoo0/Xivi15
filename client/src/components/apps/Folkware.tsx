
import { useEffect } from 'react';

export function Folkware() {
  useEffect(() => {
    const handleClick = () => {
      const iframe = document.querySelector('iframe');
      if (iframe) iframe.focus();
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="w-full h-full">
      <iframe
        src="./folkware.html"
        className="w-full h-full border-0"
        title="Folkware"
      />
    </div>
  );
}
