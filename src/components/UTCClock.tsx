import React, { useEffect, useState } from "react";

function UTCClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // shift UTC time by -4 hours
      const hh = String((now.getUTCHours() + 24 - 4) % 24).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss} (UTC-4)`);
    };
    update(); // run once
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="tabular-nums">{time}</span>;
}

export default UTCClock;