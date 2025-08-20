import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
  W3mButton,
} from '@web3-modal/wagmi-react-native';
import { WagmiConfig, useAccount, useSignMessage, useContractRead } from 'wagmi';
import { mainnet, arbitrum } from 'wagmi/chains';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import MembershipNftAbi from './src/MembershipNFT.json';

const projectId =
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";

const metadata = {
  name: 'GRID',
  description: 'Your neighborhood, connected.',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'gridapp://',
  },
};

const flareCoston2 = {
  id: 114,
  name: 'Flare Testnet Coston2',
  network: 'coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Coston2 Explorer',
      url: 'https://coston2-explorer.flare.network',
    },
  },
  testnet: true,
};

const chains = [flareCoston2, mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});


const API_URL = 'http://localhost:3001';
const NFT_CONTRACT_ADDRESS = 'YOUR_NFT_CONTRACT_ADDRESS';


const MembershipBadge = () => (
  <View style={styles.card}>
    <Text style={styles.badgeEmoji}>🛡️</Text>
    <Text style={styles.cardTitle}>Verified Resident</Text>
    <Text style={styles.cardDescription}>
      Your membership is confirmed. You now have access to the neighborhood feed
      and features.
    </Text>
  </View>
);

const LocationVerifier = ({ onVerify, status }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Neighborhood Verification</Text>
    <Text style={styles.cardDescription}>
      Verify your neighborhood to unlock the private community feed and features.
    </Text>

    {status === 'idle' && (
      <TouchableOpacity style={styles.verifyButton} onPress={onVerify}>
        <Text style={styles.buttonText}>Verify My Neighborhood</Text>
      </TouchableOpacity>
    )}
    {status === 'pending' && (
      <View style={styles.statusContainer}>
        <ActivityIndicator />
        <Text style={styles.statusText}>Verifying on-chain...</Text>
      </View>
    )}
    {status === 'success' && (
      <Text style={styles.statusTextSuccess}>✅ Verification Complete!</Text>
    )}
    {status === 'failed' && (
      <>
        <Text style={styles.statusTextFailed}>❌ Verification Failed</Text>
        <TouchableOpacity style={styles.verifyButton} onPress={onVerify}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);


const AppContent = () => {
  const { address, isConnected } = useAccount();
  const { data: signature, signMessage, reset } = useSignMessage();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('idle');


  const { data: nftBalance, refetch: refetchNftBalance } = useContractRead({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: MembershipNftAbi.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  const hasNft = nftBalance ? Number(nftBalance) > 0 : false;


  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) setAuthToken(token);
    };
    checkToken();
  }, []);


  const handleSign = useCallback(() => {
    const message = 'Welcome to GRID! Sign this message to prove you own this wallet. This does not cost any gas.';
    signMessage({ message });
  }, [signMessage]);

  useEffect(() => {
    if (isConnected && !authToken && !signature) {
      handleSign();
    }
  }, [isConnected, authToken, signature, handleSign]);

  useEffect(() => {
    const verifyAndLogin = async () => {
      if (signature && address) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/verify-signature`, { address, signature });
          if (data.token) {
            await AsyncStorage.setItem('authToken', data.token);
            setAuthToken(data.token);
          }
        } catch (error) {
          console.error('Login failed:', error);
          reset();
        }
      }
    };
    verifyAndLogin();
  }, [signature, address, reset]);


  const handleVerifyLocation = async () => {
    if (!authToken) return;
    setVerificationStatus('pending');
    try {
      const neighborhoodId = 'downtown-seattle-wa-98101';
      await axios.post(
        `${API_URL}/location/verify`,
        { neighborhoodId },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      setVerificationStatus('success');
      refetchNftBalance();
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('failed');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthToken(null);
    reset();
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>GRID</Text>
        <W3mButton balance="show" />
      </View>

      <View style={styles.mainContent}>
        {!isConnected ? (
          <Text style={styles.subtitle}>Connect your wallet to begin.</Text>
        ) : !authToken ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.statusText}>Please sign the message...</Text>
          </View>
        ) : hasNft ? ( // <-- Check if user has NFT
          <MembershipBadge />
        ) : (
          <LocationVerifier
            onVerify={handleVerifyLocation}
            status={verificationStatus}
          />
        )}
        {authToken && <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>}
      </View>
    </>
  );
};

// --- App Wrapper ---
function App(): React.JSX.Element {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
      <Web3Modal />
    </WagmiConfig>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    width: '100%',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center' },
  card: {
    width: '100%',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  statusText: { fontSize: 16, marginLeft: 10, color: '#555' },
  statusTextSuccess: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    marginVertical: 20,
  },
  statusTextFailed: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
});

export default App;