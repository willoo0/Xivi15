case "rainbow":
        setIsRainbow(prev => !prev);
        output = isRainbow ? "Rainbow mode disabled" : "🌈 Rainbow mode enabled";
        break;
      case "kitty":
        output = "\x1b[35m🐱 Fetching a random cat...\x1b[0m\n";
        fetch('https://cataas.com/cat?json=true')
          .then(response => response.json())
          .then(data => {
            const newHistory = [...activeTerminal.history];
            newHistory.push(`\x1b[36mMeow! Here's your cat:\x1b[0m\nhttps://cataas.com${data.url}`);
            setTabs(prev => prev.map(tab =>
              tab.id === activeTab ? { ...tab, history: newHistory } : tab
            ));
          })
          .catch(() => {
            const newHistory = [...activeTerminal.history];
            newHistory.push("\x1b[31mFailed to fetch a cat image :(\x1b[0m");
            setTabs(prev => prev.map(tab =>
              tab.id === activeTab ? { ...tab, history: newHistory } : tab
            ));
          });
        break;
      case "help":
        output = "\x1b[36mAvailable commands:\x1b[0m ls, echo, cat, sudo, apt, pwd, whoami, clear, help, bsod, rainbow, kitty";
        break;