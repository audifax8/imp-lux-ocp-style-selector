import React from 'react';

import { SkeletonVariant } from '@/declarations/enums';
import { Skeleton } from '@/shared/components/skeleton';
import { useProducts } from '@/style-selector/context/products-context';
import { useConfiguratorActions } from '@/style-selector/context/configurator-actions-context';

import './index.scss';

interface ModelCardProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  skeleton?: boolean;
  vendorId?: string;
  promoBadge?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  title,
  imageSrc,
  imageAlt,
  vendorId,
  promoBadge,
  onClick,
}) => {
  // Datos del catálogo headless — solo HProduct[], sin servicios de infraestructura.
  const products = useProducts();
  // Callbacks estables derivados de Core/RTRSkeleton — el componente llama
  // comportamiento, no métodos de clase en bruto.
  const actions = useConfiguratorActions();

  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? 'button' : 'div';

  const findProduct = () => products?.find(p => p.vendorId === vendorId);

  const handleMouseEnter = () => {
    const product = findProduct();
    if (!product) return;
    // Descarga el script RTR en background antes de que el usuario haga click.
    // onModelHover llama rtrSkeleton.downLoadAssets() via servicesRef.
    actions?.onModelHover(product);
  };

  const handleClick = (e: React.MouseEvent) => {
    const product = findProduct();
    if (product) {
      // Arranca render2D en Core para pre-renderizar el modelo seleccionado.
      // onModelSelect llama core.render2D() via servicesRef.
      actions?.onModelSelect(product);
    }
    onClick?.(e);
  };

  return (
    <Component
      className='model-card'
      onMouseEnter={handleMouseEnter}
      onClick={isClickable ? handleClick : undefined}
      {...(isClickable && {
        type: 'button',
        'aria-label': title,
      })}
    >
      {promoBadge && (
        <div
          className='model-card__promo-badge'
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: promoBadge }}
        />
      )}
      <div className='model-card__image-wrapper' aria-hidden="true">
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
      <div className='model-card__content' aria-hidden="true">
        <h2 className='model-card__title'>{title}</h2>
      </div>
    </Component>
  );
};