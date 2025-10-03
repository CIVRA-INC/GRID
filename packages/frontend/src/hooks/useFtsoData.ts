

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';


const FTSO_REGISTRY_ADDRESS = '0x1000000000000000000000000000000000000003'; 


const FTSO_REGISTRY_ABI = [
  "function getFtso(string calldata _symbol) external view returns (address)",
  "function getCurrentPrice(string calldata _symbol) external view returns (uint256 _price, uint256 _timestamp)"
];


export interface FtsoData {
  price: number;
  timestamp: number;
  symbol: string;
}


export const useFtsoData = (symbol: string, refreshIntervalSeconds: number = 60) => {
  const [data, setData] = useState<FtsoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider('https://flare-api.flare.network/ext/C/rpc');
        const ftsoRegistry = new ethers.Contract(FTSO_REGISTRY_ADDRESS, FTSO_REGISTRY_ABI, provider);

        
        const [priceBigInt, timestampBigInt] = await ftsoRegistry.getCurrentPrice(symbol);
        
        
        const formattedPrice = Number(ethers.formatUnits(priceBigInt, 5));

        setData({
          price: formattedPrice,
          timestamp: Number(timestampBigInt),
          symbol,
        });
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch FTSO data for ${symbol}:`, err);
        setError(`Could not retrieve data for ${symbol}.`);
      } finally {
        setIsLoading(false);
      }
    };

    
    fetchData();

    
    const intervalId = setInterval(fetchData, refreshIntervalSeconds * 1000);

    
    return () => clearInterval(intervalId);

  }, [symbol, refreshIntervalSeconds]);

  return { data, error, isLoading };
};