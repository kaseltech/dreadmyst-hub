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
    <div className="card-hover h-full">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-3 text-foreground" style={{ fontWeight: 600 }}>{title}</h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>{description}</p>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
