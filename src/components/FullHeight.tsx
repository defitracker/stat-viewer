import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export default function FullHeight({
  children,
  minus,
  className,
}: {
  children: React.ReactNode;
  minus?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(350);

  const recalc = () => {
    if (!ref.current) return;

    const offset = ref.current.offsetTop;
    const winHeight = window.innerHeight;
    const remainingHeight = winHeight - offset - (minus || 0);
    setHeight(Math.max(remainingHeight, 350));
  };

  useEffect(() => {
    recalc();
  }, [minus]);

  useEffect(() => {
    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(`p-2`, className)}
      style={{ height: `${height}px` }}
    >
      {children}
    </div>
  );
}
