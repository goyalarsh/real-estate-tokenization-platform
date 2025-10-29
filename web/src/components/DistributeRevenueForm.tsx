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
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting transaction…');
      setLoading(true);
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.distributeRevenue(
        BigInt(propertyId || '0'),
        { value: BigInt(valueWei || '0') }
      );
      setStatus('Transaction pending…');
      const rec = await tx.wait();
      setStatus(`Transaction confirmed! Hash: ${rec?.hash ?? ''}`);
      // Reset form
      setPropertyId('');
      setValueWei('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to distribute');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-icon">💰</span>
        <h3 className="card-title">Distribute Revenue</h3>
        <span className="card-badge badge-owner">Owner</span>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="propertyId">Property ID</label>
          <input 
            id="propertyId"
            type="text"
            placeholder="e.g., 0"
            value={propertyId} 
            onChange={(e) => setPropertyId(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="valueWei">Revenue Amount (wei)</label>
          <input 
            id="valueWei"
            type="text"
            placeholder="e.g., 500000000000000000"
            value={valueWei} 
            onChange={(e) => setValueWei(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={submit} 
          disabled={loading || !contract}
          className="button-primary"
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? '⏳ Distributing...' : '📤 Distribute Revenue'}
        </button>
      </div>
      
      {status && (
        <div className={`status-message ${status.includes('confirmed') ? 'status-success' : 'status-pending'}`}>
          <span>{status.includes('confirmed') ? '✅' : '⏳'}</span>
          <span>{status}</span>
        </div>
      )}
      {error && (
        <div className="status-message status-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
