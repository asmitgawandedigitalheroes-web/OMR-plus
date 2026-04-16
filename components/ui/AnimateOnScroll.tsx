import { ReactNode } from 'react';

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimateOnScroll({ children, className = '' }: AnimateOnScrollProps) {
  return <div className={className}>{children}</div>;
}
