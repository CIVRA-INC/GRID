import "react-native-get-random-values";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  W3mButton,
} from "@web3modal/wagmi-react-native";
import { WagmiProvider, useAccount, useSignMessage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId =
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96";

const metadata = {
  name: "GRID",
  description: "GRID App for neighborhood connectivity.",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "gridapp://",
  },
};

const flareCoston2 = {
  chainId: 114,
  name: "Flare Testnet Coston2",
  currency: "C2FLR",
  explorerUrl: "https://coston2-explorer.flare.network",
  rpcUrl: "https://coston2-api.flare.network/ext/C/rpc",
};

const chains = [flareCoston2];

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  projectId,
  wagmiConfig,
});

const queryClient = new QueryClient();

function AppContent() {
  const { isConnected, address } = useAccount();
  const { data: signature, signMessage } = useSignMessage();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");

  useEffect(() => {
    if (isConnected && !signature) {
      const messageToSign =
        "Welcome to GRID! Sign this message to prove you own this wallet.";
      signMessage({ message: messageToSign });
    }
  }, [isConnected, signature, signMessage]);

  useEffect(() => {
    const verifySignatureAndLogin = async () => {
      if (signature && address) {
        try {
          const { data } = await axios.post(
            "http://localhost:3001/auth/verify-signature",
            {
              address,
              signature,
            }
          );
          if (data.token) {
            await AsyncStorage.setItem("authToken", data.token);
            setAuthToken(data.token);
            Alert.alert("Login Successful!", "You are now authenticated.");
          }
        } catch (error) {
          Alert.alert("Login Failed", "Could not verify signature.");
        }
      }
    };
    verifySignatureAndLogin();
  }, [signature, address]);

  const handleVerifyLocation = async () => {
    if (!authToken) return;
    setVerificationStatus("pending");
    try {
      const neighborhoodId = "downtown-123"; // A sample ID
      const { data } = await axios.post(
        "http://localhost:3001/location/verify",
        { neighborhoodId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setVerificationStatus("success");
      Alert.alert(
        "Verification Success!",
        `Transaction Hash: ${data.transactionHash}`
      );
    } catch (error) {
      setVerificationStatus("failed");
      Alert.alert("Verification Failed", "An error occurred.");
    }
  };

  useEffect(() => {
    if (signature) {
      Alert.alert("Signature Successful!", `Signed as: ${address}`);
    }
  }, [signature, address]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {!isConnected ? (
          <Text style={styles.subtitle}>
            Connect your wallet to get started.
          </Text>
        ) : !authToken ? (
          <ActivityIndicator size="large" />
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify Your Neighborhood</Text>
            {verificationStatus === "idle" && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyLocation}
              >
                <Text style={styles.buttonText}>Verify Now</Text>
              </TouchableOpacity>
            )}
            {verificationStatus === "pending" && <ActivityIndicator />}
            {verificationStatus === "success" && (
              <Text style={styles.successText}>✅ Verified!</Text>
            )}
            {verificationStatus === "failed" && (
              <Text style={styles.errorText}>
                ❌ Verification Failed. Please try again.
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", alignItems: "center" },
  header: {
    width: "100%",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  mainContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
});
