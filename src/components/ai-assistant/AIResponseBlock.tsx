import clsx from 'clsx';

interface AIResponseBlockProps {
  children: React.ReactNode;
  delay: number;
  className?: string;
}

export const AIResponseBlock = ({ children, delay, className }: AIResponseBlockProps) => {
  return (
    <div
      className={clsx('animate-fade-in-block', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
