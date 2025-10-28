import { useState } from 'react';
import { Contract } from 'ethers';

type Props = {
  contract: Contract | null;
};

export default function DistributeRevenueForm({ contract }: Props) {
  const [propertyId, setPropertyId] = useState('');
  const [valueWei, setValueWei] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting…');
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.distributeRevenue(
        BigInt(propertyId || '0'),
        { value: BigInt(valueWei || '0') }
      );
      const rec = await tx.wait();
      setStatus(`Tx confirmed: ${rec?.hash ?? ''}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to distribute');
      setStatus(null);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3>Distribute Revenue (owner)</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
        <input placeholder="Revenue (wei)" value={valueWei} onChange={(e) => setValueWei(e.target.value)} />
        <button onClick={submit}>Distribute</button>
      </div>
      {status && <div>{status}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}


