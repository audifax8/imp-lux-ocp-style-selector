import type { SkeletonProps } from '@/declarations/interfaces';


export function Skeleton(props: SkeletonProps) {
  const { className, style } = props;
  return <span className={`yr-skeleton ${className}`} style={style} />;
}
