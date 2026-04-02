import { Image } from '@/style-selector/components/img';

interface LogoProps {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

export function Logo({ url, width, height, alt = 'logo', className = '' }: LogoProps) {
  return (
    <Image
      height={height}
      width={width}
      src={url}
      alt={alt}
      priority="eager"
      fetchPriority="low"
      className={`yr-logo ${className}`}
    />
  );
}
