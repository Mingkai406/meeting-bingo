import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, type, ...rest }: Props) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'px-4 py-2 rounded-lg font-semibold transition active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        'motion-reduce:transition-none motion-reduce:active:scale-100',
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300',
        className,
      )}
      {...rest}
    />
  );
}
