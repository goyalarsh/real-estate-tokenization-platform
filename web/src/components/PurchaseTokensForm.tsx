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
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting transaction…');
      setLoading(true);
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.purchaseTokens(
        BigInt(propertyId || '0'),
        BigInt(tokenAmount || '0'),
        { value: BigInt(valueWei || '0') }
      );
      setStatus('Transaction pending…');
      const rec = await tx.wait();
      setStatus(`Transaction confirmed! Hash: ${rec?.hash ?? ''}`);
      // Reset form
      setPropertyId('');
      setTokenAmount('');
      setValueWei('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to purchase');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-icon">💵</span>
        <h3 className="card-title">Purchase Tokens</h3>
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
          <label htmlFor="tokenAmount">Token Amount</label>
          <input 
            id="tokenAmount"
            type="text"
            placeholder="e.g., 1000"
            value={tokenAmount} 
            onChange={(e) => setTokenAmount(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="valueWei">Value (wei)</label>
          <input 
            id="valueWei"
            type="text"
            placeholder="e.g., 1000000000000000000"
            value={valueWei} 
            onChange={(e) => setValueWei(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={submit} 
          disabled={loading || !contract}
          className="button-secondary"
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? '⏳ Processing...' : '🛒 Buy Tokens'}
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
