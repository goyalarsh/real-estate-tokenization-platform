import { useState } from 'react';
import { Contract } from 'ethers';

type Props = {
  contract: Contract | null;
};

export default function PurchaseTokensForm({ contract }: Props) {
  const [propertyId, setPropertyId] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [valueWei, setValueWei] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting…');
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.purchaseTokens(
        BigInt(propertyId || '0'),
        BigInt(tokenAmount || '0'),
        { value: BigInt(valueWei || '0') }
      );
      const rec = await tx.wait();
      setStatus(`Tx confirmed: ${rec?.hash ?? ''}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to purchase');
      setStatus(null);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3>Purchase Tokens (investor)</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
        <input placeholder="Token Amount" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} />
        <input placeholder="Value (wei)" value={valueWei} onChange={(e) => setValueWei(e.target.value)} />
        <button onClick={submit}>Buy</button>
      </div>
      {status && <div>{status}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}


