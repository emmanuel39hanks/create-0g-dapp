'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  if (isConnected && address) {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#E5E5E5] bg-white">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-mono text-[#333]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {balance && (
          <span className="text-xs text-[#999]">
            {parseFloat(balance.formatted).toFixed(2)} {balance.symbol}
          </span>
        )}
        <button
          onClick={() => disconnect()}
          className="text-[10px] text-[#999] hover:text-[#9200E1] font-bold"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 text-xs font-bold rounded-full border border-[#9200E1] text-[#9200E1] hover:bg-[#9200E1] hover:text-white transition-colors"
        >
          {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
        </button>
      ))}
    </div>
  );
}
