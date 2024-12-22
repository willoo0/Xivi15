
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Terminal() {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleCommand = (cmd: string) => {
    const args = cmd.split(" ");
    const command = args[0];
    
    let output = "";
    switch (command) {
      case "ls":
        output = "Desktop  Documents  Downloads  Music  Pictures  Videos";
        break;
      case "echo":
        output = args.slice(1).join(" ");
        break;
      case "cat":
        output = "Error: No such file or directory";
        break;
      case "sudo":
        output = "Error: Permission denied";
        break;
      case "apt":
        output = "Error: Command not found. This is a simulated environment.";
        break;
      case "pwd":
        output = "/home/xivi-15-user";
        break;
      case "whoami":
        output = "xivi-15-user";
        break;
      case "clear":
        setHistory([]);
        return;
      case "help":
        output = "Available commands: ls, echo, cat, sudo, apt, pwd, whoami, clear, help";
        break;
      default:
        output = `Command not found: ${command}`;
    }
    
    setHistory(prev => [...prev, `xivi-15-user> ${cmd}`, output]);
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-500 font-mono p-2">
      <ScrollArea className="flex-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
      </ScrollArea>
      <div className="flex items-center mt-2">
        <span>xivi-15-user&gt; </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              handleCommand(input.trim());
              setInput("");
            }
          }}
          className="flex-1 bg-transparent border-none outline-none ml-2"
          autoFocus
        />
      </div>
    </div>
  );
}
