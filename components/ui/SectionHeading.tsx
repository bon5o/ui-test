interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <h2 className="shrink-0 text-xl font-bold tracking-tight text-[#111]">
        {children}
      </h2>
      <span className="h-px grow bg-[#e0e0e0]" aria-hidden="true" />
    </div>
  );
}
