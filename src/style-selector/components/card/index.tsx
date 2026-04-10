import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';

interface CardProps {
  length?: number;
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  skeleton?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  length,
  imageSrc,
  imageAlt,
  skeleton,
  onClick,
}) => {
  const isClickable = typeof onClick === 'function';

  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      className='card'
      onClick={onClick}
      {...(isClickable && {
        type: 'button',
        'aria-label': title,
      })}
    >
      <div className='card-content'>
        {!skeleton ?
          <h2 className='card-title'>{title} ({length})</h2> :
          <Skeleton className='card-title' variant={SkeletonVariant.text} />}
      </div>

      <div className='card-image-wrapper'>
        {!skeleton ?
          <img
            src={imageSrc}
            alt={imageAlt}
            className="card-image"
            loading='eager'
          /> :
          <Skeleton
            className="card-image card-image__skeleton"
            variant={SkeletonVariant.rectangular}
          />
}
      </div>
    </Component>
  );
};