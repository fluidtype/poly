import { useCallback, useEffect, useState } from "react";

export function useViewportScale(baseW = 1920, baseH = 1080) {
  const calc = useCallback(
    () => Math.min(window.innerWidth / baseW, window.innerHeight / baseH),
    [baseW, baseH],
  );
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onResize = () => setScale(calc());
    setScale(calc());

    let t: ReturnType<typeof setTimeout> | undefined;
    const handle = () => {
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(onResize, 100);
    };

    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("resize", handle);
      if (t) {
        clearTimeout(t);
      }
    };
  }, [calc]);

  return scale;
}
