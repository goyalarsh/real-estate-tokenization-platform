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
      if (!contract) throw new Error('Set a valid contract address');
      const value = await contract.propertyCounter();
      setCounter(Number(value));
    } catch (e: any) {
      setError(e.message ?? 'Failed to read propertyCounter');
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
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <label>
          Contract Address:{' '}
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            style={{ width: 360 }}
          />
        </label>
        <button onClick={handleSave} style={{ marginLeft: 8 }}>Save</button>
        <button onClick={loadCounter} style={{ marginLeft: 8 }}>Read propertyCounter</button>
      </div>
      {counter !== null && <div>propertyCounter: {counter}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}


