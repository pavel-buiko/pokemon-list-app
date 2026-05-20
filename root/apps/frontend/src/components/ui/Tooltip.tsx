interface TooltipProps {
  content: string;
  show: boolean;
  children: React.ReactNode;
}

export function Tooltip({ content, show, children }: TooltipProps) {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-normal text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
