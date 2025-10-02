import { useEffect, useState } from "react";

export function useFitScale(baseW = 1440, baseH = 900) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const s = Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
      setScale(Math.min(1, s));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [baseW, baseH]);

  return scale;
}
