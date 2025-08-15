import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
import { verifyMessage } from "viem";
import {
  createPublicClient,
  createWalletClient,
  http,
  PrivateKeyAccount,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { flareCoston2 } from "viem/chains";
import contractAbi from "./ProofOfLocation.abi.json";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const originalMessage =
  "Welcome to GRID! Sign this message to prove you own this wallet.";

const publicClient = createPublicClient({
  chain: flareCoston2,
  transport: http(process.env.FLARE_RPC_URL),
});
const account = privateKeyToAccount(
  process.env.BACKEND_WALLET_PRIVATE_KEY as `0x${string}`
);
const walletClient = createWalletClient({
  account,
  chain: flareCoston2,
  transport: http(process.env.FLARE_RPC_URL),
});

interface AuthenticatedRequest extends AuthRequest {
  user?: { address: string };
}
const authMiddleware = (req: AuthenticatedRequest, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token is required for authentication" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      address: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

app.post("/auth/verify-signature", async (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res
      .status(400)
      .json({ error: "Address and signature are required." });
  }

  try {
    const isSignatureValid = await verifyMessage({
      address: address as `0x${string}`,
      message: originalMessage,
      signature: signature as `0x${string}`,
    });

    if (isSignatureValid) {
      const token = jwt.sign({ address }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: "Invalid signature." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error during verification." });
  }
});

app.post(
  "/location/verify",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { neighborhoodId } = req.body;
    const userAddress = req.user?.address as `0x${string}`;

    if (!neighborhoodId || !userAddress) {
      return res
        .status(400)
        .json({ error: "Neighborhood ID and user address are required." });
    }

    const isLocationValid = true;
    console.log(`[1/2] Simulated State Connector check: SUCCESS`);

    if (!isLocationValid) {
      return res.status(400).json({ error: "Location could not be verified." });
    }

    const locationHash = `0x${Buffer.from(neighborhoodId)
      .toString("hex")
      .padStart(64, "0")}`;
    console.log(
      `[2/2] Calling smart contract to verify location for ${userAddress}...`
    );
    try {
      const hash = await walletClient.writeContract({
        address: process.env.CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi.abi,
        functionName: "verifyLocation",
        args: [userAddress, locationHash],
        account,
      });
      console.log(`✅ Transaction sent! Hash: ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`✅ Transaction confirmed!`);
      return res.status(200).json({
        message: "Location verified on-chain.",
        transactionHash: hash,
      });
    } catch (error) {
      console.error("Contract call failed:", error);
      return res
        .status(500)
        .json({ error: "Failed to write to smart contract." });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
