import { viem } from "hardhat";
import 'dotenv/config';

async function main() {
  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!nftContractAddress) throw new Error("NFT_CONTRACT_ADDRESS not set");

  const polls = await viem.deployContract("Polls", [nftContractAddress]);
  console.log(`Polls contract deployed to: ${polls.address}`);
}
main().catch(console.error);
