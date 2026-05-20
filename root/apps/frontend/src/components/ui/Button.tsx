import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 border-transparent hover:bg-slate-100 focus-visible:ring-slate-400',
  danger:
    'bg-white text-red-700 border-red-200 hover:bg-red-50 focus-visible:ring-red-400',
};

const baseClass =
  'inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      {...props}
    />
  );
}

interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  to,
  variant = 'secondary',
  className = '',
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`${baseClass} ${variantClass[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
