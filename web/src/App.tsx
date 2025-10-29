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
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">🏘️ Real Estate Tokenization</h1>
          <p className="app-subtitle">Decentralized Property Investment Platform</p>
        </header>
        
        <div className="wallet-section">
          <ConnectWallet onConnected={onConnected} />
        </div>
        
        <ContractControls ctx={ctx} onContractReady={onContractReady} />

        <div className="content-grid">
          <ListPropertyForm contract={contract} />
          <PurchaseTokensForm contract={contract} />
          <DistributeRevenueForm contract={contract} />
          <ClaimRevenueForm contract={contract} />
        </div>
      </div>
    </div>
  )
}

export default App
