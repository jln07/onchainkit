import type { EarnContextType } from '@/earn/types';
import { usdcToken } from '@/token/constants';
import { render, screen } from '@testing-library/react';
import type { Address } from 'viem';
import { type Mock, describe, expect, it, vi } from 'vitest';
import { DepositDetails } from './DepositDetails';
import { useEarnContext } from './EarnProvider';

const baseContext: EarnContextType = {
  convertedBalance: '1000',
  setDepositAmount: vi.fn(),
  vaultAddress: '0x123' as Address,
  depositAmount: '0',
  depositedAmount: '0',
  withdrawAmount: '0',
  setWithdrawAmount: vi.fn(),
  depositCalls: [],
  withdrawCalls: [],
};
vi.mock('./EarnProvider', () => ({
  useEarnContext: vi.fn(),
}));

vi.mock('@/internal/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

describe('DepositDetails Component', () => {
  it('renders EarnDetails with default APY tag when APY is provided', () => {
    const mockApy = 5;
    vi.mocked(useEarnContext).mockReturnValue({ ...baseContext, apy: mockApy });

    const { container } = render(<DepositDetails />);

    const tokenElement = screen.getByTestId('ockTokenChip_Button');
    expect(tokenElement).toHaveTextContent(usdcToken.name);

    // const tagElement = screen.getByTestId('tag');
    expect(container).toHaveTextContent(`APY ${mockApy}`);
  });

  it('renders EarnDetails with an empty tag when APY is not provided', () => {
    vi.mocked(useEarnContext).mockReturnValue({
      ...baseContext,
      apy: undefined,
    });

    render(<DepositDetails />);

    const tokenElement = screen.getByTestId('ockTokenChip_Button');
    expect(tokenElement).toHaveTextContent(usdcToken.name);
  });

  it('applies custom className to the EarnDetails container', () => {
    const customClass = 'custom-class';
    (useEarnContext as Mock).mockReturnValue({ apy: undefined });

    render(<DepositDetails className={customClass} />);

    const earnDetails = screen.getByTestId('ockEarnDetails');
    expect(earnDetails).toHaveClass(customClass);
  });
});
