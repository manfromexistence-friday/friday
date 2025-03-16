import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap rounded font-medium ring-offset-white transition-all duration-500 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
        destructive:
          'bg-red-500 text-zinc-50 dark:bg-red-900 dark:text-zinc-50',
        outline:
          'border border-zinc-300 bg-white hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 hover:dark:bg-zinc-800',
        secondary:
          'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50',
        ghost: 'hover:bg-zinc-200 dark:hover:bg-zinc-700',
        link: 'text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8 text-lg',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  hideIcon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      rightIcon,
      leftIcon,
      hideIcon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {leftIcon && (
          <span className="mr-0 w-0 opacity-0 transition-all duration-200 group-hover:mr-1 group-hover:w-5 group-hover:opacity-100">
            {leftIcon}
          </span>
        )}
        <Slottable>{props.children}</Slottable>
        {rightIcon && (
          <span className="ml-0 w-0 opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:w-5 group-hover:opacity-100">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
