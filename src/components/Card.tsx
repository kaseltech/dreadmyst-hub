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
      <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>
      <p className="text-sm">{description}</p>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
