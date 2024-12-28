import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function SystemInfo() {
  const [publicIP, setPublicIP] = useState<string>("Loading...");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setPublicIP(data.ip))
      .catch(() => setPublicIP("Failed to load"));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">System Information</h2>
      <Card className="p-4 space-y-2">
        <div>
          <span className="font-semibold">Operating System:</span> Xivi Linux
          14.9 Kylo
        </div>
        <div>
          <span className="font-semibold">CPU:</span> Intel® Core™ i9 14th gen
        </div>
        <div>
          <span className="font-semibold">Memory:</span> 16GB DDR5 RAM
        </div>
      </Card>
    </div>
  );
}
