import { useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import {
  EthereumContext,
  getContract,
  getStoredContractAddress,
  isAddressLike,
  setStoredContractAddress,
} from '../lib/eth';
import RealEstateTokenizationAbi from '../contracts/artifacts/contracts/project.sol/RealEstateTokenization.json';

type Props = {
  ctx: EthereumContext | null;
  onContractReady(contract: Contract | null): void;
};

export default function ContractControls({ ctx, onContractReady }: Props) {
  const [address, setAddress] = useState<string>(getStoredContractAddress() || '');
  const [counter, setCounter] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contract: Contract | null = useMemo(() => {
    try {
      if (!address || !isAddressLike(address) || !ctx?.provider) return null;
      const abi = (RealEstateTokenizationAbi as any).abi;
      return getContract(address, abi, ctx.provider, ctx.signer);
    } catch {
      return null;
    }
  }, [address, ctx]);

  useEffect(() => {
    onContractReady(contract);
  }, [contract, onContractReady]);

  async function loadCounter() {
    try {
      setError(null);
      setLoading(true);
      if (!contract) throw new Error('Set a valid contract address');
      const value = await contract.propertyCounter();
      setCounter(Number(value));
    } catch (e: any) {
      setError(e.message ?? 'Failed to read propertyCounter');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!isAddressLike(address)) {
      setError('Invalid address');
      return;
    }
    setStoredContractAddress(address);
    setError(null);
  }

  return (
    <div className="card fade-in" style={{ marginBottom: '2rem' }}>
      <div className="card-header">
        <span className="card-icon">⚙️</span>
        <h3 className="card-title">Contract Configuration</h3>
      </div>
      
      <div className="form-group">
        <label htmlFor="contract-address">
          Contract Address
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="contract-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            style={{ flex: 1, minWidth: '250px' }}
          />
          <button onClick={handleSave} className="button-primary">
            💾 Save
          </button>
          <button 
            onClick={loadCounter} 
            disabled={loading || !contract}
            className="button-secondary"
          >
            {loading ? '⏳ Loading...' : '📊 Read Counter'}
          </button>
        </div>
      </div>
      
      {counter !== null && (
        <div className="status-message status-success">
          <span>✅</span>
          <span>Property Counter: <strong>{counter}</strong></span>
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
