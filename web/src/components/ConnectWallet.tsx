import { useEffect, useState } from 'react';
import { connectWallet, EthereumContext } from '../lib/eth';

type Props = {
  onConnected(ctx: EthereumContext): void;
};

export default function ConnectWallet({ onConnected }: Props) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No auto-connect to avoid silent account requests
  }, []);

  async function handleConnect() {
    try {
      setConnecting(true);
      setError(null);
      const ctx = await connectWallet();
      setAccount(ctx.account);
      onConnected(ctx);
    } catch (e: any) {
      setError(e.message ?? 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  }

  if (account) {
    const short = `${account.slice(0, 6)}...${account.slice(-4)}`;
    return <div>Connected: {short}</div>;
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={connecting}>
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}


