'use client';

export default function SectionHeader({
  title,
  subtitle,
  titleHighlight,
  centered = true,
  size = 'lg',
}) {
  const titleSizes = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-3xl md:text-4xl lg:text-5xl',
  };

  const containerClasses = centered ? 'text-center' : 'text-left';

  // Split title and highlight
  const titleParts = titleHighlight 
    ? title.split(titleHighlight)
    : [title];

  return (
    <div className={containerClasses}>
      <h2 
        className="font-bold leading-tight text-3xl md:text-[48px]"
        style={{ color: '#484848' }}
      >
        {titleParts[0]}
        {titleHighlight && (
          <span className="text-[#45A735]">{titleHighlight}</span>
        )}
        {titleParts[1]}
      </h2>
      {subtitle && (
        <p 
          className="mt-3  mx-auto font-normal text-base md:text-[20px]"
          style={{ color: '#636363' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
