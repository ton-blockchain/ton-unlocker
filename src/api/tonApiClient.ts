import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import { TON_CENTER_API } from '../utils/constants';
import { Locker } from '../contracts/Locker';
import { LockerBill } from '../contracts/LockerBill';
import type { WalletBalance } from '../contracts/types';
import { billsService } from '../services/billsService';
import { VestingCalculator } from '../services/vestingCalculator';

export class TonApiClient {
  private client: TonClient;

  constructor(isTestnet: boolean) {
    const endpoint = isTestnet ? TON_CENTER_API.testnet : TON_CENTER_API.mainnet;
    this.client = new TonClient({ endpoint });
  }

  private async withRetry<T>(action: () => Promise<T>, maxAttempts = 5): Promise<T> {
    let attempt = 1;
    const baseDelay = 2000; // Start with 2 seconds

    while (attempt <= maxAttempts) {
      try {
        return await action();
      } catch (error: any) {
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error?.message || error);

        if (attempt === maxAttempts) {
          throw error; // Last attempt failed
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random());
        console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }

    throw new Error('Should never reach here');
  }

  async getWalletBalance(
    lockerAddress: string,
    userAddress: string
  ): Promise<WalletBalance> {
    // First check if user exists in bills
    const billData = await billsService.getBillByUserAddress(userAddress);
    console.log('billData from json', billData);
    
    if (!billData) {
      // User has no deposits
      return {
        availableToWithdraw: 0n,
        stillLocked: 0n,
        totalUserDeposit: 0n,
        totalUserDepositAndReward: 0n
      };
    }

    // Get locker data from local cache
    const lockerData = await billsService.getLockerData();
    console.log('lockerData from json', lockerData);
    
    // Get last_withdraw_time from bill
    const lastWithdrawTime = await this.getLastWithdrawTime(billData.billAddress);
    console.log('lastWithdrawTime from API', lastWithdrawTime);
    
    // Get fixed values from bills.json
    const totalUserDeposit = BigInt(billData.totalDeposit);
    console.log('totalUserDeposit from json', totalUserDeposit);
    
    // Calculate total with reward using local data
    const totalUserDepositAndReward = lockerData.totalCoinsLocked > 0n
      ? totalUserDeposit + (totalUserDeposit * lockerData.totalReward / lockerData.totalCoinsLocked)
      : 0n;
    
    // Use locker's get method for precise calculation
    const nowTime = Math.floor(Date.now() / 1000);
    
    const availableToWithdraw = await this.getAmountToWithdraw(
      lockerAddress,
      nowTime,
      lastWithdrawTime,
      totalUserDeposit
    );
    console.log('availableToWithdraw from API', availableToWithdraw);
    
    const totalUnlocked = VestingCalculator.getUnlockedAmount(nowTime, totalUserDepositAndReward);
    console.log('totalUnlocked from local calc', totalUnlocked);
    const stillLocked = totalUserDepositAndReward - totalUnlocked;
    console.log('stillLocked from local calc', stillLocked);
    console.log('totalUserDepositAndReward from local calc', totalUserDepositAndReward);
    
    return {
      availableToWithdraw,
      stillLocked,
      totalUserDeposit,
      totalUserDepositAndReward
    };
  }

  private async getLastWithdrawTime(billAddress: string): Promise<number> {
    return this.withRetry(async () => {
      const bill = LockerBill.createFromAddress(Address.parse(billAddress));
      const billData = await bill.getData(this.client.provider(bill.address));
      
      if (!billData) {
        throw new Error('Bill data is null');
      }

      if (typeof billData.lastWithdrawTime !== 'number') {
        throw new Error('Invalid lastWithdrawTime format');
      }
      if (billData.lastWithdrawTime === 0) {
        console.warn("LAST WITHDRAW TIME is 0, FOR REAL");
      }
      return billData.lastWithdrawTime;
    });
  }

  private async getAmountToWithdraw(
    lockerAddress: string,
    nowTime: number,
    lastWithdrawTime: number,
    totalUserDeposit: bigint
  ): Promise<bigint> {
    if (totalUserDeposit === 0n) return 0n;
    
    return this.withRetry(async () => {
      console.log('endpoint', this.client.parameters.endpoint);
      console.log(`running getAmountToWithdraw with params: lockerAddress: ${lockerAddress}, nowTime: ${nowTime}, lastWithdrawTime: ${lastWithdrawTime}, totalUserDeposit: ${totalUserDeposit}`);
      
      const locker = Locker.createFromAddress(Address.parse(lockerAddress));
      const amount = await locker.getAmountToWithdraw(
        this.client.provider(locker.address),
        nowTime,
        lastWithdrawTime,
        totalUserDeposit
      );

      return amount;
    });
  }}
