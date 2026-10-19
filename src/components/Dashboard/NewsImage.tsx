import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/** Article image that degrades to a themed placeholder when the source blocks hotlinking or 404s. */
const NewsImage = ({ src, alt, className = '' }: NewsImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-[radial-gradient(120%_120%_at_30%_20%,hsl(var(--nebula-purple)/0.45),hsl(var(--space-deep)))] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Newspaper className="h-8 w-8 text-star-white/40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export default NewsImage;
