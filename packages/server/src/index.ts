// packages/server/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import { utils, providers, Wallet, Contract } from "ethers";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

// Import ABIs
import proofOfLocationAbi from "./ProofOfLocation.json";
import membershipNftAbi from "./MembershipNFT.json";

// --- Basic Server Setup ---
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Database Schema ---
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorAddress: { type: String, required: true, index: true },
    // This links the post to a specific verified neighborhood
    neighborhoodHash: { type: String, required: true, index: true },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt

const Post = mongoose.model("Post", PostSchema);

// --- Ethers & Contract Setup (remains the same) ---
const rpcUrl = process.env.FLARE_RPC_URL as string;
const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY as string;
const proofOfLocationAddress = process.env.CONTRACT_ADDRESS as string;
const membershipNftAddress = process.env.NFT_CONTRACT_ADDRESS as string;
const provider = new providers.JsonRpcProvider(rpcUrl);
const backendWallet = new Wallet(privateKey, provider);
const proofOfLocationContract = new Contract(
  proofOfLocationAddress,
  proofOfLocationAbi.abi,
  backendWallet
);
const membershipNftContract = new Contract(
  membershipNftAddress,
  membershipNftAbi.abi,
  backendWallet
);
console.log(`✅ Connected to smart contracts`);

// --- Custom Request Interfaces ---
interface AuthRequest extends Request {
  user?: { address: string };
}
interface GatedRequest extends AuthRequest {
  neighborhoodHash?: string;
}

// --- Middlewares ---
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // ... (no changes here from before)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      address: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ---> NEW TOKEN-GATING MIDDLEWARE <---
const tokenGatedMiddleware = async (
  req: GatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userAddress = req.user?.address;
  if (!userAddress) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    // 1. Check if the user owns a membership NFT
    const balance = await membershipNftContract.balanceOf(userAddress);
    if (Number(balance) === 0) {
      return res
        .status(403)
        .json({ error: "Access denied. You are not a verified member." });
    }

    // 2. Fetch the user's verified location hash from the other contract
    const locationHash = await proofOfLocationContract.locationVerifications(
      userAddress
    );
    if (locationHash === utils.formatBytes32String("")) {
      // Check for empty hash
      return res
        .status(403)
        .json({ error: "Could not find user location verification." });
    }

    // 3. Attach the neighborhoodHash to the request for use in the endpoints
    req.neighborhoodHash = locationHash;
    console.log(
      `[Gate] Access granted to ${userAddress} for neighborhood ${locationHash}`
    );
    next();
  } catch (error) {
    console.error("Token gate error:", error);
    res.status(500).json({ error: "Error during on-chain verification." });
  }
};

// --- Routes ---
// Auth and Verification routes remain here...
// ...

// ---> NEW FEED ROUTES <---

/**
 * @route   POST /feed
 * @desc    Create a new post in the user's neighborhood feed
 * @access  Private, Token-Gated
 */
app.post(
  "/feed",
  [authMiddleware, tokenGatedMiddleware],
  async (req: GatedRequest, res: Response) => {
    const { content } = req.body;
    const authorAddress = req.user!.address;
    const neighborhoodHash = req.neighborhoodHash!;

    if (!content) {
      return res.status(400).json({ error: "Post content is required." });
    }

    try {
      const newPost = new Post({
        content,
        authorAddress,
        neighborhoodHash,
      });
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post." });
    }
  }
);

/**
 * @route   GET /feed
 * @desc    Get all posts for the user's neighborhood
 * @access  Private, Token-Gated
 */
app.get(
  "/feed",
  [authMiddleware, tokenGatedMiddleware],
  async (req: GatedRequest, res: Response) => {
    const neighborhoodHash = req.neighborhoodHash!;

    // Basic pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const posts = await Post.find({ neighborhoodHash })
        .sort({ createdAt: -1 }) // Show newest first
        .skip(skip)
        .limit(limit);

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts." });
    }
  }
);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
