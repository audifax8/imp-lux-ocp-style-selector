import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  className?: string;
  showSkeleton?: boolean;
  priority?: 'lazy' | 'eager' | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  crossOrigin?: 'anonymous' | undefined;
  styles?: React.CSSProperties;
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return props.showSkeleton ? (
    <div className={`'yr-skeleton yr-image' ${props.className}`} />
  ) : (
    <img
      ref={ref}
      {...props}
      className={`'yr-image' ${props.className}`}
      loading={props.priority ?? 'lazy'}
      fetchPriority={props?.fetchPriority ?? 'auto'}
      crossOrigin={props?.crossOrigin ?? 'anonymous'}
      style={props.styles}
    />
  );
});

Image.displayName = 'Image';
