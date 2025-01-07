import { useIsMounted } from '@/core-react/internal/hooks/useIsMounted';
import { useTheme } from '@/core-react/internal/hooks/useTheme';
import { findComponent } from '@/core-react/internal/utils/findComponent';
import { Draggable } from '@/internal/components/Draggable';
import { cn } from '@/styles/theme';
import { useOutsideClick } from '@/ui-react/internal/hooks/useOutsideClick';
import { Children, useEffect, useMemo, useRef, useState } from 'react';
import {
  WALLET_ISLAND_MAX_HEIGHT,
  WALLET_ISLAND_MAX_WIDTH,
} from '../constants';
import type { WalletReact } from '../types';
import { ConnectWallet } from './ConnectWallet';
import { WalletDropdown } from './WalletDropdown';
import { WalletIsland } from './WalletIsland';
import { WalletProvider, useWalletContext } from './WalletProvider';

export const Wallet = ({
  children,
  className,
  draggable = false,
  startingPosition = {
    x: window.innerWidth - 250,
    y: window.innerHeight - 100,
  },
}: WalletReact) => {
  const componentTheme = useTheme();
  const isMounted = useIsMounted();

  // prevents SSR hydration issue
  if (!isMounted) {
    return null;
  }

  return (
    <WalletProvider>
      <WalletContent
        draggable={draggable}
        startingPosition={startingPosition}
        className={cn(componentTheme, className)}
      >
        {children}
      </WalletContent>
    </WalletProvider>
  );
};

function WalletContent({
  children,
  className,
  draggable,
  startingPosition,
}: WalletReact) {
  const [showSubComponentAbove, setShowSubComponentAbove] = useState(false);
  const [alignSubComponentRight, setAlignSubComponentRight] = useState(false);
  const { isOpen, handleClose } = useWalletContext();
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const connectRef = useRef<HTMLDivElement>(null);

  useOutsideClick(walletContainerRef, handleClose);

  const { connect, dropdown, island } = useMemo(() => {
    const childrenArray = Children.toArray(children);
    return {
      connect: childrenArray.find(findComponent(ConnectWallet)),
      dropdown: childrenArray.find(findComponent(WalletDropdown)),
      island: childrenArray.find(findComponent(WalletIsland)),
    };
  }, [children]);

  if (dropdown && island) {
    console.error(
      'Defaulted to WalletDropdown. Wallet cannot have both WalletDropdown and WalletIsland as children.',
    );
  }

  useEffect(() => {
    if (isOpen && connectRef.current) {
      const connectRect = connectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceAvailableBelow = viewportHeight - connectRect.bottom;
      const spaceAvailableRight = viewportWidth - connectRect.left;

      setShowSubComponentAbove(spaceAvailableBelow < WALLET_ISLAND_MAX_HEIGHT);
      setAlignSubComponentRight(spaceAvailableRight < WALLET_ISLAND_MAX_WIDTH);
    }
  }, [isOpen]);

  if (draggable) {
    return (
      <div
        ref={walletContainerRef}
        className={cn('relative w-fit shrink-0', className)}
      >
        <Draggable startingPosition={startingPosition}>
          <WalletSubComponent
            connect={connect}
            connectRef={connectRef}
            dropdown={dropdown}
            island={island}
            isOpen={isOpen}
            alignSubComponentRight={alignSubComponentRight}
            showSubComponentAbove={showSubComponentAbove}
          />
        </Draggable>
      </div>
    );
  }

  return (
    <div
      ref={walletContainerRef}
      className={cn('relative w-fit shrink-0', className)}
    >
      <WalletSubComponent
        connect={connect}
        connectRef={connectRef}
        dropdown={dropdown}
        island={island}
        isOpen={isOpen}
        alignSubComponentRight={alignSubComponentRight}
        showSubComponentAbove={showSubComponentAbove}
      />
    </div>
  );
}

function WalletSubComponent({
  connect,
  connectRef,
  dropdown,
  island,
  isOpen,
  alignSubComponentRight,
  showSubComponentAbove,
}: {
  connect: React.ReactNode;
  connectRef: React.RefObject<HTMLDivElement>;
  dropdown: React.ReactNode;
  island: React.ReactNode;
  isOpen: boolean;
  alignSubComponentRight: boolean;
  showSubComponentAbove: boolean;
}) {
  if (dropdown) {
    return (
      <>
        {connect}
        {isOpen && dropdown}
      </>
    );
  }

  return (
    <>
      <div ref={connectRef}>{connect}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute',
            showSubComponentAbove ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            alignSubComponentRight ? 'right-0' : 'left-0',
          )}
        >
          {island}
        </div>
      )}
    </>
  );
}
