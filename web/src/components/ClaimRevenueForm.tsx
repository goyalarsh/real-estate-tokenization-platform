import { useState } from 'react';
import { Contract } from 'ethers';

type Props = {
  contract: Contract | null;
};

export default function ClaimRevenueForm({ contract }: Props) {
  const [propertyId, setPropertyId] = useState('');
  const [distributionId, setDistributionId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting transaction…');
      setLoading(true);
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.claimRevenue(
        BigInt(propertyId || '0'),
        BigInt(distributionId || '0')
      );
      setStatus('Transaction pending…');
      const rec = await tx.wait();
      setStatus(`Transaction confirmed! Hash: ${rec?.hash ?? ''}`);
      // Reset form
      setPropertyId('');
      setDistributionId('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to claim');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-icon">🎁</span>
        <h3 className="card-title">Claim Revenue</h3>
        <span className="card-badge badge-investor">Investor</span>
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
          <label htmlFor="distributionId">Distribution ID</label>
          <input 
            id="distributionId"
            type="text"
            placeholder="e.g., 0"
            value={distributionId} 
            onChange={(e) => setDistributionId(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={submit} 
          disabled={loading || !contract}
          className="button-secondary"
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? '⏳ Claiming...' : '✨ Claim Revenue'}
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
