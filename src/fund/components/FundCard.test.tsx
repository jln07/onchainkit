import { useDebounce } from '@/core-react/internal/hooks/useDebounce';
import { setOnchainKitConfig } from '@/core/OnchainKitConfig';
import { openPopup } from '@/ui-react/internal/utils/openPopup';
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccount } from 'wagmi';
import { useFundCardFundingUrl } from '../hooks/useFundCardFundingUrl';
import { fetchOnrampQuote } from '../utils/fetchOnrampQuote';
import { getFundingPopupSize } from '../utils/getFundingPopupSize';
import { FundCard } from './FundCard';
import { FundCardProvider, useFundContext } from './FundCardProvider';

const mockUpdateInputWidth = vi.fn();
vi.mock('../hooks/useInputResize', () => ({
  useInputResize: () => mockUpdateInputWidth,
}));

vi.mock('../../core-react/internal/hooks/useTheme', () => ({
  useTheme: () => 'mocked-theme-class',
}));

vi.mock('../hooks/useGetFundingUrl', () => ({
  useGetFundingUrl: vi.fn(),
}));

vi.mock('../../core-react/internal/hooks/useDebounce', () => ({
  useDebounce: vi.fn((callback) => callback),
}));

vi.mock('../hooks/useFundCardFundingUrl', () => ({
  useFundCardFundingUrl: vi.fn(),
}));

vi.mock('../../useOnchainKit');

vi.mock('../utils/setupOnrampEventListeners', () => ({
  setupOnrampEventListeners: vi.fn(),
}));

vi.mock('@/ui-react/internal/utils/openPopup', () => ({
  openPopup: vi.fn(),
}));

vi.mock('../utils/getFundingPopupSize', () => ({
  getFundingPopupSize: vi.fn(),
}));

vi.mock('../hooks/useFundCardSetupOnrampEventListeners');
vi.mock('../utils/fetchOnrampQuote');

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
}));

vi.mock('../../wallet/components/ConnectWallet', () => ({
  ConnectWallet: ({ className }: { className?: string }) => (
    <div data-testid="ockConnectWallet_Container" className={className}>
      Connect Wallet
    </div>
  ),
}));

const mockResponseData = {
  paymentTotal: { value: '100.00', currency: 'USD' },
  paymentSubtotal: { value: '120.00', currency: 'USD' },
  purchaseAmount: { value: '0.1', currency: 'BTC' },
  coinbaseFee: { value: '2.00', currency: 'USD' },
  networkFee: { value: '1.00', currency: 'USD' },
  quoteId: 'quote-id-123',
};

// Test component to access context values
const TestComponent = () => {
  const {
    fundAmountFiat,
    fundAmountCrypto,
    exchangeRate,
    exchangeRateLoading,
  } = useFundContext();

  return (
    <div>
      <span data-testid="test-value-fiat">{fundAmountFiat}</span>
      <span data-testid="test-value-crypto">{fundAmountCrypto}</span>
      <span data-testid="test-value-exchange-rate">{exchangeRate}</span>
      <span data-testid="loading-state">
        {exchangeRateLoading ? 'loading' : 'not-loading'}
      </span>
    </div>
  );
};

const renderComponent = (inputType: 'fiat' | 'crypto' = 'fiat') =>
  render(
    <FundCardProvider asset="BTC" inputType={inputType}>
      <FundCard assetSymbol="BTC" />
      <TestComponent />
    </FundCardProvider>,
  );

describe('FundCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setOnchainKitConfig({ apiKey: 'mock-api-key' });
    mockUpdateInputWidth.mockClear();
    (getFundingPopupSize as Mock).mockImplementation(() => ({
      height: 200,
      width: 100,
    }));
    (useFundCardFundingUrl as Mock).mockReturnValue('mock-funding-url');
    (useDebounce as Mock).mockImplementation((callback) => callback);
    (fetchOnrampQuote as Mock).mockResolvedValue(mockResponseData);
    (useAccount as Mock).mockReturnValue({
      address: '0x123',
    });
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('fundCardHeader')).toBeInTheDocument();
    expect(screen.getByTestId('ockFundButtonTextContent')).toBeInTheDocument();
  });

  it('displays the correct header text', () => {
    renderComponent();
    expect(screen.getByTestId('fundCardHeader')).toHaveTextContent('Buy BTC');
  });

  it('displays the correct button text', () => {
    renderComponent();
    expect(screen.getByTestId('ockFundButtonTextContent')).toHaveTextContent(
      'Buy',
    );
  });

  it('handles input changes for fiat amount', () => {
    renderComponent();

    const input = screen.getByTestId(
      'ockFundCardAmountInput',
    ) as HTMLInputElement;

    act(() => {
      fireEvent.change(input, { target: { value: '100' } });
    });

    expect(input.value).toBe('100');
  });

  it('switches input type from fiat to crypto', async () => {
    renderComponent();

    await waitFor(() => {
      const switchButton = screen.getByTestId('ockAmountTypeSwitch');
      fireEvent.click(switchButton);
    });

    expect(screen.getByTestId('currencySpan')).toHaveTextContent('BTC');
  });

  it('disables the submit button when fund amount is zero and type is fiat', () => {
    renderComponent('fiat');
    const button = screen.getByTestId('ockFundButton');
    expect(button).toBeDisabled();
  });

  it('disables the submit button when fund amount is zero and input type is crypto', () => {
    renderComponent('crypto');
    const button = screen.getByTestId('ockFundButton');
    expect(button).toBeDisabled();
  });

  it('enables the submit button when fund amount is greater than zero and type is fiat', async () => {
    renderComponent('fiat');

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe(
        'not-loading',
      );
      const input = screen.getByTestId('ockFundCardAmountInput');
      fireEvent.change(input, { target: { value: '1000' } });

      const button = screen.getByTestId('ockFundButton');
      expect(button).not.toBeDisabled();
    });
  });
  it('enables the submit button when fund amount is greater than zero and type is crypto', async () => {
    renderComponent('crypto');

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe(
        'not-loading',
      );
      const input = screen.getByTestId('ockFundCardAmountInput');
      fireEvent.change(input, { target: { value: '1000' } });

      const button = screen.getByTestId('ockFundButton');
      expect(button).not.toBeDisabled();
    });
  });

  it('shows loading state when submitting', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe(
        'not-loading',
      );
      const input = screen.getByTestId('ockFundCardAmountInput');

      fireEvent.change(input, { target: { value: '1000' } });

      const button = screen.getByTestId('ockFundButton');

      expect(screen.queryByTestId('ockSpinner')).not.toBeInTheDocument();
      act(() => {
        fireEvent.click(button);
      });

      expect(screen.getByTestId('ockSpinner')).toBeInTheDocument();
    });
  });

  it('sets submit button state to default on popup close', () => {
    vi.useFakeTimers();

    (openPopup as Mock).mockImplementation(() => ({ closed: true }));
    renderComponent();
    const button = screen.getByTestId('ockFundButton');

    // Simulate entering a valid amount
    const input = screen.getByTestId(
      'ockFundCardAmountInput',
    ) as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '100' } });
    });

    // Click the submit button to trigger loading state
    act(() => {
      fireEvent.click(button);
    });

    vi.runOnlyPendingTimers();

    const submitButton = screen.getByTestId('ockFundButton');

    // Assert that the submit button state is set to 'default'
    expect(submitButton).not.toBeDisabled();
  });

  it('renders custom children instead of default children', () => {
    render(
      <FundCard assetSymbol="ETH">
        <div data-testid="custom-child">Custom Content</div>
      </FundCard>,
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.queryByTestId('fundCardHeader')).not.toBeInTheDocument();
  });
});
