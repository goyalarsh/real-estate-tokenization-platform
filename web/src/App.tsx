import { useCallback, useState } from 'react'
import './App.css'
import ConnectWallet from './components/ConnectWallet'
import ContractControls from './components/ContractControls'
import ListPropertyForm from './components/ListPropertyForm'
import PurchaseTokensForm from './components/PurchaseTokensForm'
import DistributeRevenueForm from './components/DistributeRevenueForm'
import ClaimRevenueForm from './components/ClaimRevenueForm'
import { Contract } from 'ethers'
import { EthereumContext } from './lib/eth'

function App() {
  const [ctx, setCtx] = useState<EthereumContext | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  const onConnected = useCallback((c: EthereumContext) => setCtx(c), [])
  const onContractReady = useCallback((ctr: Contract | null) => setContract(ctr), [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Real Estate Tokenization</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <ConnectWallet onConnected={onConnected} />
      </div>
      <ContractControls ctx={ctx} onContractReady={onContractReady} />

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <ListPropertyForm contract={contract} />
        <PurchaseTokensForm contract={contract} />
        <DistributeRevenueForm contract={contract} />
        <ClaimRevenueForm contract={contract} />
      </div>
    </div>
  )
}

export default App
