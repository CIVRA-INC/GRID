import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    coston2: {
      url: 'https://coston2-api.flare.network/ext/C/rpc',
      chainId: 114,
      accounts: [privateKey],
    },
  },
};

export default config;
