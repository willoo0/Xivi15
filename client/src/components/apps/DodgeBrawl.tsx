
import { useEffect } from 'react';

export function DodgeBrawl() {
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
        src="./dodgebrawl.html"
        className="w-full h-full border-0"
        title="Dodge Brawl"
      />
    </div>
  );
}
