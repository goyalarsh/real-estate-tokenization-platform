import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner } from 'ethers';

export type EthereumContext = {
  provider: BrowserProvider;
  signer: JsonRpcSigner | null;
  account: string | null;
};

export async function getBrowserProvider(): Promise<BrowserProvider | null> {
  const anyProvider = (await detectEthereumProvider()) as Eip1193Provider | null;
  if (!anyProvider) return null;
  return new BrowserProvider(anyProvider);
}

export async function connectWallet(): Promise<EthereumContext> {
  const provider = await getBrowserProvider();
  if (!provider) throw new Error('MetaMask not detected. Please install or enable it.');
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { provider, signer, account };
}

export function getStoredContractAddress(): string | null {
  return localStorage.getItem('ret_contract_address');
}

export function setStoredContractAddress(addr: string) {
  localStorage.setItem('ret_contract_address', addr);
}

export function requireAddress(address: string | null): asserts address is string {
  if (!address) throw new Error('Contract address not set.');
}

export function getContract(
  contractAddress: string,
  abi: any,
  provider: BrowserProvider,
  signer?: JsonRpcSigner | null
): Contract {
  if (signer) {
    return new Contract(contractAddress, abi, signer);
  }
  return new Contract(contractAddress, abi, provider);
}

export function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}


