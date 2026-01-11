import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Card({ title, description, href, icon, children }: CardProps) {
  const content = (
    <div className="p-6 rounded-xl border border-card-border bg-card-bg hover:border-accent/50 transition-all duration-200 h-full">
      {icon && <div className="text-3xl mb-3">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted text-sm">{description}</p>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
