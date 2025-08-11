import { viem } from 'hardhat';

async function main() {
  const proofOfLocation = await viem.deployContract('ProofOfLocation');
  console.log(`ProofOfLocation deployed to: ${proofOfLocation.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
