import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useFlare } from '../hooks/useFlare';
import { SBNFT_CONTRACT_ADDRESS, SBNFT_ABI } from '../constants';

// Define the structure for the component's props.
interface SBNFTCheckerProps {
  onVerificationResult: (isVerified: boolean) => void;
}

export const SBNFTChecker = ({ onVerificationResult }: SBNFTCheckerProps) => {
  const { provider, address, isConnected } = useFlare();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function will be called whenever the user's connection status or address changes.
    const checkBalance = async () => {
      // We can only check if the user is connected and we have a provider.
      if (!isConnected || !provider || !address) {
        onVerificationResult(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      onVerificationResult(false);

      try {
        // Create an instance of our smart contract.
        const sbnftContract = new Contract(SBNFT_CONTRACT_ADDRESS, SBNFT_ABI, provider);

        // Call the `balanceOf` function from the ERC721 standard.
        // This function returns the number of NFTs a specific address owns.
        const balance = await sbnftContract.balanceOf(address);

        // The user is considered verified if they own 1 or more SBNFTs.
        const isVerified = BigInt(balance) > 0n;
        onVerificationResult(isVerified);

      } catch (e: any) {
        console.error("Failed to check SBNFT balance:", e);
        setError("Could not verify membership. Is the contract address correct and deployed on this network?");
      } finally {
        setIsLoading(false);
      }
    };

    checkBalance();
  }, [isConnected, provider, address, onVerificationResult]);

  if (isLoading) {
    return <p>Verifying your GRID membership...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return null; // This component itself doesn't render anything, it just reports the result.
};