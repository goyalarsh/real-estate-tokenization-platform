import { useState } from 'react';
import { Contract } from 'ethers';

type Props = {
  contract: Contract | null;
};

export default function ListPropertyForm({ contract }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [totalTokens, setTotalTokens] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [expectedROI, setExpectedROI] = useState('');
  const [investmentType, setInvestmentType] = useState('0');
  const [fundingDuration, setFundingDuration] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting transaction…');
      setLoading(true);
      if (!contract) throw new Error('Connect and set contract address first');
      const tx = await contract.listProperty(
        name,
        location,
        documentHash,
        BigInt(totalValue || '0'),
        BigInt(totalTokens || '0'),
        BigInt(minInvestment || '0'),
        BigInt(expectedROI || '0'),
        Number(investmentType),
        BigInt(fundingDuration || '0')
      );
      setStatus('Transaction pending…');
      const rec = await tx.wait();
      setStatus(`Transaction confirmed! Hash: ${rec?.hash ?? ''}`);
      // Reset form
      setName('');
      setLocation('');
      setDocumentHash('');
      setTotalValue('');
      setTotalTokens('');
      setMinInvestment('');
      setExpectedROI('');
      setInvestmentType('0');
      setFundingDuration('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to list property');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-icon">🏢</span>
        <h3 className="card-title">List Property</h3>
        <span className="card-badge badge-owner">Owner</span>
      </div>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="name">Property Name</label>
          <input 
            id="name"
            type="text"
            placeholder="e.g., Downtown Luxury Apartments"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input 
            id="location"
            type="text"
            placeholder="e.g., New York, NY"
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="documentHash">Document Hash</label>
          <input 
            id="documentHash"
            type="text"
            placeholder="IPFS hash or document identifier"
            value={documentHash} 
            onChange={(e) => setDocumentHash(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalValue">Total Value (wei)</label>
          <input 
            id="totalValue"
            type="text"
            placeholder="e.g., 1000000000000000000"
            value={totalValue} 
            onChange={(e) => setTotalValue(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalTokens">Total Tokens</label>
          <input 
            id="totalTokens"
            type="text"
            placeholder="e.g., 1000000"
            value={totalTokens} 
            onChange={(e) => setTotalTokens(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="minInvestment">Minimum Investment (wei)</label>
          <input 
            id="minInvestment"
            type="text"
            placeholder="e.g., 100000000000000000"
            value={minInvestment} 
            onChange={(e) => setMinInvestment(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="expectedROI">Expected ROI (bps or % units)</label>
          <input 
            id="expectedROI"
            type="text"
            placeholder="e.g., 500 (for 5%)"
            value={expectedROI} 
            onChange={(e) => setExpectedROI(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="investmentType">Investment Type</label>
          <select 
            id="investmentType"
            value={investmentType} 
            onChange={(e) => setInvestmentType(e.target.value)}
          >
            <option value="0">💰 Rental</option>
            <option value="1">📈 Appreciation</option>
            <option value="2">💎 Both</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fundingDuration">Funding Duration (seconds)</label>
          <input 
            id="fundingDuration"
            type="text"
            placeholder="e.g., 2592000 (30 days)"
            value={fundingDuration} 
            onChange={(e) => setFundingDuration(e.target.value)} 
          />
        </div>
        
        <button 
          onClick={submit} 
          disabled={loading || !contract}
          className="button-primary"
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? '⏳ Creating...' : '✨ Create Property'}
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
