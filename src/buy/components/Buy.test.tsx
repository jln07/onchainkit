import { fireEvent, render, screen } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOutsideClick } from '../../ui/react/internal/hooks/useOutsideClick';
import { Buy } from './Buy';
import { useBuyContext } from './BuyProvider';
import { degenToken } from '../../token/constants';

vi.mock('./BuyProvider', () => ({
  useBuyContext: vi.fn(),
  BuyProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-BuyProvider">{children}</div>
  ),
}));

vi.mock('./BuyDropdown', () => ({
  BuyDropdown: () => <div data-testid="mock-BuyDropdown">BuyDropdown</div>,
}));

vi.mock('../../core-react/internal/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../../ui/react/internal/hooks/useOutsideClick', () => ({
  useOutsideClick: vi.fn(),
}));

type useOutsideClickType = ReturnType<
  typeof vi.fn<
    (
      ref: React.RefObject<HTMLElement>,
      callback: (event: MouseEvent) => void,
    ) => void
  >
>;

describe('Buy', () => {
  let mockSetIsOpen: ReturnType<typeof vi.fn>;
  let mockOutsideClickCallback: (e: MouseEvent) => void;

  beforeEach(() => {
    mockSetIsOpen = vi.fn();
    (useBuyContext as Mock).mockReturnValue({
      isDropdownOpen: false,
      setIsDropdownOpen: mockSetIsOpen,
      lifecycleStatus: {
        statusName: 'idle',
        statusData: {
          maxSlippage: 10,
        },
      },
      to: {
        token: degenToken,
        amount: 10,
        setAmount: vi.fn(),
      },
    });

    (useOutsideClick as unknown as useOutsideClickType).mockImplementation(
      (_, callback) => {
        mockOutsideClickCallback = callback;
      },
    );

    vi.clearAllMocks();
  });

  it('renders the Buy component', () => {
    render(<Buy className="test-class" toToken={degenToken} projectId="123" />);

    expect(screen.getByText('Buy')).toBeInTheDocument();
    expect(screen.getByText('DEGEN')).toBeInTheDocument();
  });

  it('closes the dropdown when clicking outside the container', () => {
    (useBuyContext as Mock).mockReturnValue({
      isDropdownOpen: true,
      setIsDropdownOpen: mockSetIsOpen,
      lifecycleStatus: {
        statusName: 'idle',
        statusData: {
          maxSlippage: 10,
        },
      },
      to: {
        token: degenToken,
        amount: 10,
        setAmount: vi.fn(),
      },
    });

    render(<Buy className="test-class" toToken={degenToken} projectId="123" />);

    expect(screen.getByTestId('mock-BuyDropdown')).toBeDefined();
    mockOutsideClickCallback({} as MouseEvent);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('does not close the dropdown when clicking inside the container', () => {
    (useBuyContext as Mock).mockReturnValue({
      isDropdownOpen: true,
      setIsDropdownOpen: mockSetIsOpen,
      lifecycleStatus: {
        statusName: 'idle',
        statusData: {
          maxSlippage: 10,
        },
      },
      to: {
        token: degenToken,
        amount: 10,
        setAmount: vi.fn(),
      },
    });

    render(<Buy className="test-class" toToken={degenToken} projectId="123" />);

    expect(screen.getByTestId('mock-BuyDropdown')).toBeDefined();
    fireEvent.click(screen.getByTestId('mock-BuyDropdown'));
    expect(mockSetIsOpen).not.toHaveBeenCalled();
  });

  it('should not trigger click handler when dropdown is closed', () => {
    render(<Buy className="test-class" toToken={degenToken} projectId="123" />);
    expect(screen.queryByTestId('mock-BuyDropdown')).not.toBeInTheDocument();
  });
});
