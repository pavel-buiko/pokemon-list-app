import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-4">
        <Link
          to="/"
          className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
        >
          Pokémon Collections
        </Link>
        {title ? (
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
        ) : null}
      </header>
      <main className="flex flex-col gap-4">{children}</main>
    </div>
  );
}
