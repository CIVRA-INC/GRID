import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const networks: HardhatUserConfig['networks'] = {};

if (PRIVATE_KEY) {
  networks.coston2 = {
    url: 'https://coston2-api.flare.network/ext/C/rpc',
    accounts: [PRIVATE_KEY],
    chainId: 114,
  };
} else {
  console.log(
    'PRIVATE_KEY not found in .env, skipping coston2 network configuration.'
  );
}

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks, // Use the conditionally configured networks object
};

export default config;
