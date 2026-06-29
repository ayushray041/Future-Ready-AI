import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const pad = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export default function GlassCard({ children, className, padding = 'md' }: GlassCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl',
      pad[padding],
      className,
    )}>
      {children}
    </div>
  );
}
