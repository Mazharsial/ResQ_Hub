import { useRef } from 'react';
// 3D hover tilt for cards (skipped when the user prefers reduced motion)
export default function Tilt({ children, className = '', ...rest }) {
  const ref = useRef();
  const move = (e) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = ref.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  };
  return <div ref={ref} className={'tilt ' + className} onMouseMove={move} onMouseLeave={() => (ref.current.style.transform = '')} {...rest}>{children}</div>;
}
