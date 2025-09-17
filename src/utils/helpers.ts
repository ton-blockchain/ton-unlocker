import { Address, beginCell } from '@ton/core';
import { WITHDRAW_AMOUNT } from './constants';

export function formatTON(amount: bigint): string {
  const tons = Number(amount) / 1e9;
  
  if (tons === 0) return '0';
  
  // format with commas for thousands
  const formatted = tons.toFixed(9);
  const trimmed = formatted.replace(/\.?0+$/, '');
  
  const parts = trimmed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return parts.join('.');
}

// For user wallets - always non-bounceable
export function shortenAddress(address: string, isTestnet: boolean = false): string {
  const addr = Address.parse(address);
  const formatted = addr.toString({ bounceable: false, testOnly: isTestnet });
  return `${formatted.slice(0, 6)}...${formatted.slice(-4)}`;
}

// For user wallets - always non-bounceable
export function formatUserAddress(address: string, isTestnet: boolean = false): string {
  const addr = Address.parse(address);
  return addr.toString({ bounceable: false, testOnly: isTestnet });
}

// For smart contracts - always bounceable
export function formatContractAddress(address: string, isTestnet: boolean = false): string {
  const addr = Address.parse(address);
  return addr.toString({ bounceable: true, testOnly: isTestnet });
}

export function generateWithdrawDeepLink(lockerAddress: string, isTestnet: boolean): string {
  const body = beginCell()
    .storeUint(0, 32) // op
    .storeStringTail('w')
    .endCell();
  
  const bodyBase64 = body.toBoc().toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // Use bounceable address for locker contract
  const address = Address.parse(lockerAddress).toString({ 
    bounceable: true, 
    testOnly: isTestnet 
  });
  
  return `ton://transfer/${address}?amount=${WITHDRAW_AMOUNT.toString()}&bin=${bodyBase64}`;
}