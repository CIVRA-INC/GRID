/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

// Add a type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// This defines the structure of the state that our hook will manage and return.
interface FlareState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: bigint | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  error: string | null;
}

// A custom hook to manage connection to the Flare network via a browser wallet (e.g., MetaMask).
export const useFlare = (): FlareState => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  // This function handles the logic of connecting to the user's wallet.
  const connectWallet = useCallback(async () => {
    // Check if the user has a wallet like MetaMask installed.
    if (typeof window.ethereum === "undefined") {
      setError("Please install a wallet like MetaMask.");
      return;
    }

    try {
      setError(null);
      // Request access to the user's accounts.
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const currentSigner = await browserProvider.getSigner();
      setSigner(currentSigner);

      const currentAddress = await currentSigner.getAddress();
      setAddress(currentAddress);

      const network = await browserProvider.getNetwork();
      setChainId(network.chainId);
    } catch (e: any) {
      console.error("Connection failed:", e);
      setError("Failed to connect wallet. Please try again.");
    }
  }, []);

  // This effect runs once on component mount to set up event listeners.
  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      return;
    }

    // Handles what happens when the user switches accounts in MetaMask.
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected.
        setAddress(null);
        setSigner(null);
      } else {
        // User switched account.
        setAddress(accounts[0]);
        connectWallet(); // Re-connect to get the new signer info.
      }
    };

    // Handles what happens when the user changes the network (e.g., from Mainnet to Coston2).
    const handleChainChanged = () => {
      // Reload the page to ensure the app state is consistent with the new network.
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Cleanup function to remove listeners when the component unmounts.
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet]);

  return {
    provider,
    signer,
    address,
    chainId,
    isConnected: !!address, // The user is considered connected if we have their address.
    connectWallet,
    error,
  };
};
