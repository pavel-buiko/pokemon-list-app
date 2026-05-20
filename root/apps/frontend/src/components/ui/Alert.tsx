type AlertVariant = 'error' | 'warning' | 'info';

const variantClass: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-slate-200 bg-slate-50 text-slate-600',
};

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  children,
  className = '',
}: AlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : undefined}
      className={`rounded-lg border px-3 py-2 text-sm ${variantClass[variant]} ${className}`}
    >
      {children}
    </p>
  );
}
