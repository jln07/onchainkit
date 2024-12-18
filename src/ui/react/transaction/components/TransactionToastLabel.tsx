import { cn, color, text } from '@/styles/theme';
import { useGetTransactionToastLabel } from '@/core-react/transaction/hooks/useGetTransactionToastLabel';
import type { TransactionToastLabelReact } from '@/core-react/transaction/types';

export function TransactionToastLabel({
  className,
}: TransactionToastLabelReact) {
  const { label } = useGetTransactionToastLabel();
  return (
    <div className={cn(text.label1, 'text-nowrap', className)}>
      <p className={color.foreground}>{label}</p>
    </div>
  );
}
