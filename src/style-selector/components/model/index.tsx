import React from 'react';

import { SkeletonVariant } from '@/declarations/enums';
import { Skeleton } from '@/shared/components/skeleton';

import './index.scss';
interface ModelCardProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  skeleton?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  title,
  imageSrc,
  imageAlt,
  onClick,
}) => {
  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? 'button' : 'div';

  return (
    <Component
      className='model-card'
      onClick={onClick}
      {...(isClickable && {
        type: 'button',
        'aria-label': title,
      })}
    >
      <div className='model-card__image-wrapper'>
        {!imageSrc ?
          <Skeleton className="model-card__image__skeleton yr-skeleton" variant={SkeletonVariant.text} /> :
          (<img
            src={imageSrc}
            alt={imageAlt}
            className='model-card__image'
            loading='eager'
          />)
        }
      </div>
      <div className='model-card__content'>
        <h2 className='model-card__title'>{title}</h2>
      </div>
    </Component>
  );
};