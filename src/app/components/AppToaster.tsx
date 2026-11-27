"use client";

import "sileo/styles.css";
import { useEffect, useState } from "react";
import { Toaster } from "sileo";

export default function AppToaster() {
  const [sky, setSky] = useState<"day" | "night">("day");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setSky(root.getAttribute("data-sky") === "night" ? "night" : "day");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-sky"],
    });
    return () => observer.disconnect();
  }, []);

  const isNight = sky === "night";

  return (
    <Toaster
      position="top-right"
      offset={{ top: 16, right: 16 }}
      theme={isNight ? "dark" : "light"}
      options={{
        fill: isNight ? "#F5F2EB" : "#07142B",
        roundness: 12,
        styles: {
          description: isNight ? "!text-[#2E4263]" : "!text-[#D4DFEE]",
        },
      }}
    />
  );
}
