import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';

//impl example
//<Card title="Test" skeleton={true} />
//<Card title="Test" skeleton={false} />

interface CardProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  skeleton?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
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
      <div className='card__content'>
        {!skeleton ?
          <h2 className='card__title'>{title}</h2> :
          <Skeleton className='card__title' variant={SkeletonVariant.text} />}
      </div>

      <div className='card__image-wrapper'>
        {!skeleton ?
          <img
            src={imageSrc}
            alt={imageAlt}
            className='card__image'
            loading='lazy'
          /> :
          <Skeleton
            className={'card__image'}
            variant={SkeletonVariant.rectangular}
          />
}
      </div>
    </Component>
  );
};