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

  async function submit() {
    try {
      setError(null);
      setStatus('Submitting…');
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
      const rec = await tx.wait();
      setStatus(`Tx confirmed: ${rec?.hash ?? ''}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to list property');
      setStatus(null);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <h3>List Property (owner)</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input placeholder="Document Hash" value={documentHash} onChange={(e) => setDocumentHash(e.target.value)} />
        <input placeholder="Total Value (wei)" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} />
        <input placeholder="Total Tokens" value={totalTokens} onChange={(e) => setTotalTokens(e.target.value)} />
        <input placeholder="Min Investment (wei)" value={minInvestment} onChange={(e) => setMinInvestment(e.target.value)} />
        <input placeholder="Expected ROI (bps or % units)" value={expectedROI} onChange={(e) => setExpectedROI(e.target.value)} />
        <label>
          Investment Type
          <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
            <option value="0">Rental</option>
            <option value="1">Appreciation</option>
            <option value="2">Both</option>
          </select>
        </label>
        <input placeholder="Funding Duration (seconds)" value={fundingDuration} onChange={(e) => setFundingDuration(e.target.value)} />
        <button onClick={submit}>Create</button>
      </div>
      {status && <div>{status}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}


