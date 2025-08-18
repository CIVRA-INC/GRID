import { viem } from "hardhat";
import 'dotenv/config';

async function main() {
  const proofOfLocationAddress = process.env.CONTRACT_ADDRESS;
  if (!proofOfLocationAddress) throw new Error("CONTRACT_ADDRESS not set");

  const membershipNFT = await viem.deployContract("MembershipNFT", [proofOfLocationAddress]);
  console.log(`MembershipNFT deployed to: ${membershipNFT.address}`);
}
main().catch(console.error);