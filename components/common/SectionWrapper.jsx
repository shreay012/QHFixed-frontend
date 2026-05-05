'use client';

export default function SectionWrapper({
  children,
  className = '',
  background = 'white',
  padding = 'lg',
  maxWidth = 'lg',
}) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    green: 'bg-green-50',
  };

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  const maxWidthClasses = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-7xl',
    xl: 'max-w-8xl',
  };

  return (
    <section className={`w-full ${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} px-6`}>
        {children}
      </div>
    </section>
  );
}
