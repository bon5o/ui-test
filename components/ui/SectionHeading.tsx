interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h2
      className={`border-b border-gray-200 pb-3 text-lg font-semibold text-[#111111] ${className}`}
    >
      {children}
    </h2>
  );
}
