import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border-2 border-gray-200 bg-white p-4', className)} {...rest} />;
}
