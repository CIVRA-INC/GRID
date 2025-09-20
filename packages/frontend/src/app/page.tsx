import { useState } from 'react';
import { useFlare } from './hooks/useFlare';
import { SBNFTChecker } from './components/SBNFTChecker'; // Import the new component
import './App.css';

function App() {
  const { address, chainId, isConnected, connectWallet, error } = useFlare();
  // Add a new state to track if the user is a verified member.
  const [isVerifiedMember, setIsVerifiedMember] = useState(false);

  const getNetworkName = (id: bigint | null) => {
    if (!id) return "Unknown Network";
    switch (id) {
      case 114n:
        return "Coston2 Testnet";
      case 14n:
        return "Flare Mainnet";
      default:
        return `Unsupported Network (ID: ${id.toString()})`;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to GRID</h1>
        <p>Your neighborhood-first social platform.</p>

        {!isConnected ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="connection-info">
            <p><strong>Status:</strong> Connected</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Network:</strong> {getNetworkName(chainId)}</p>

            {/* Use the SBNFTChecker to determine the user's status */}
            <SBNFTChecker onVerificationResult={setIsVerifiedMember} />

            {/* Display a different message based on verification status */}
            {isVerifiedMember ? (
              <p className="verified-message">✅ You are a verified GRID member.</p>
            ) : (
              <p className="unverified-message">❌ You are not yet a verified member of any neighborhood.</p>
            )}
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </header>
    </div>
  );
}

export default App;