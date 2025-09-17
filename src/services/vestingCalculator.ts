// Vesting parameters from the locker contract
const DEPOSITS_END_TIME = 1698019200; // 23 Oct 2023 00:00:00 GMT
const VESTING_START_TIME = 1760227200; // Oct 12 2025 00:00:00 GMT  
const VESTING_TOTAL_DURATION = 94608000; // 3 years in seconds
const UNLOCK_PERIOD = 2592000; // 30 days in seconds

// Testnet:
// const START_TIME = 1755750831; // Thu Aug 21 07:33:51 +03 2025
// const MIN = 60;
// const DEPOSITS_DURATION = MIN * 30 * 3; // 90 minutes
// const DEPOSITS_END_TIME = START_TIME + DEPOSITS_DURATION;
// const LOCK_DURATION = MIN * 10; // 10 minutes
// const VESTING_START_TIME = START_TIME + DEPOSITS_DURATION + LOCK_DURATION;
// const VESTING_TOTAL_DURATION = MIN * 60 * 12; // 12 hours
// const UNLOCK_PERIOD = MIN * 20; // 20 minutes


export class VestingCalculator {
  static getUnlockedAmount(nowTime: number, totalAmount: bigint): bigint {
    // If vesting is complete, return full amount
    if (nowTime >= VESTING_START_TIME + VESTING_TOTAL_DURATION) {
      return totalAmount;
    }

    // If before first unlock period, return 0
    console.log('nowTime', nowTime);
    if (nowTime < VESTING_START_TIME + UNLOCK_PERIOD) {
      return 0n;
    }

    // Calculate unlocked amount based on periods passed
    const periodsPassed = BigInt(Math.floor((nowTime - VESTING_START_TIME) / UNLOCK_PERIOD));
    const totalPeriods = BigInt(Math.floor(VESTING_TOTAL_DURATION / UNLOCK_PERIOD));
    
    return (totalAmount * periodsPassed) / totalPeriods;
  }

  static getAmountToWithdraw(
    nowTime: number, 
    lastWithdrawTime: number, 
    totalUserDeposit: bigint,
    totalReward: bigint,
    totalCoinsLocked: bigint
  ): bigint {
    // Calculate total with reward
    const totalUserDepositAndReward = totalCoinsLocked > 0n
      ? totalUserDeposit + (totalUserDeposit * totalReward / totalCoinsLocked)
      : 0n;

    // Calculate previously withdrawn amount
    const oldAmountToSend = this.getUnlockedAmount(lastWithdrawTime, totalUserDepositAndReward);
    
    // Calculate current available amount
    const currentAmountToSend = this.getUnlockedAmount(nowTime, totalUserDepositAndReward);
    
    // Return the difference
    return currentAmountToSend - oldAmountToSend;
  }

  static isWithdrawAvailable(nowTime: number): boolean {
    return nowTime >= VESTING_START_TIME + UNLOCK_PERIOD;
  }

  static getVestingInfo() {
    return {
      depositsEndTime: DEPOSITS_END_TIME,
      vestingStartTime: VESTING_START_TIME,
      vestingTotalDuration: VESTING_TOTAL_DURATION,
      unlockPeriod: UNLOCK_PERIOD,
      totalPeriods: VESTING_TOTAL_DURATION / UNLOCK_PERIOD,
      vestingEndTime: VESTING_START_TIME + VESTING_TOTAL_DURATION
    };
  }
}
