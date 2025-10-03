import { useState } from 'react';
import { useFlare } from './hooks/useFlare';
import { SBNFTChecker } from './components/SBNFTChecker';
import { NeighborhoodFeed } from './components/NeighborhoodFeed';
import { PollingStation } from './components/PollingStation';

// --- NEW IMPORTS ---
import useAppStore from './store/appStore';
import CreatePostForm from './components/CreatePostForm';
// --------------------

import './App.css';
import { NeighborhoodMap } from '@/components/NeighborhoodMap';

function App() {
  const {
    address,
    chainId,
    isConnected,
    connectWallet,
    error: connectionError,
  } = useFlare();
  const [isVerifiedMember, setIsVerifiedMember] = useState(false);
  const [activeView, setActiveView] = useState<'feed' | 'polls'>('feed');

  // --- NEW: Get global state from Zustand store ---
  const { isLoading: isAppLoading, error: globalError } = useAppStore();
  // ---------------------------------------------

  const getNetworkName = (id: bigint | null) => {
    if (!id) return 'Unknown Network';
    switch (id) {
      case 114n:
        return 'Coston2 Testnet';
      case 14n:
        return 'Flare Mainnet';
      default:
        return `Unsupported Network (ID: ${id.toString()})`;
    }
  };

  const userNeighborhoodId = 101;

  return (
    <div className="App">
      <header className="App-header">
        <NeighborhoodMap userNeighborhoodId={userNeighborhoodId} />
        <h1>Welcome to GRID</h1>
        <p>A neighborhood-first social platform.</p>

        {!isConnected ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="connection-info">
            <p>
              <strong>Status:</strong> Connected
            </p>
            <p>
              <strong>Address:</strong> {address}
            </p>
            <p>
              <strong>Network:</strong> {getNetworkName(chainId)}
            </p>
            <SBNFTChecker onVerificationResult={setIsVerifiedMember} />
          </div>
        )}
        {connectionError && <p className="error-message">{connectionError}</p>}
      </header>
      
      {/* --- NEW: Global Loading and Error Indicators --- */}
      <div className="global-feedback">
        {isAppLoading && <p className="loading-message"><b>Processing transaction... Please wait.</b></p>}
        {globalError && <p className="error-message"><b>Error:</b> {globalError}</p>}
      </div>
      {/* --------------------------------------------- */}

      <main>
        {isVerifiedMember ? (
          <>
            <nav className="view-switcher">
              <button
                onClick={() => setActiveView('feed')}
                className={activeView === 'feed' ? 'active' : ''}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveView('polls')}
                className={activeView === 'polls' ? 'active' : ''}
              >
                Polls
              </button>
            </nav>
            {activeView === 'feed' && (
              <>
                {/* --- NEW: Add the create post form to the feed view --- */}
                <CreatePostForm />
                {/* --------------------------------------------------- */}
                <NeighborhoodFeed />
              </>
            )}
            {activeView === 'polls' && <PollingStation />}
          </>
        ) : (
          isConnected && (
            <p>
              You must be a verified member to see the neighborhood feed and
              polls.
            </p>
          )
        )}
      </main>
    </div>
  );
}

export default App;
