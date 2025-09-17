export interface LockerData {
  totalCoinsLocked: bigint;
  totalReward: bigint;
  depositsEndTime: number;
  vestingStartTime: number;
  vestingTotalDuration: number;
  unlockPeriod: number;
}

export interface LockerBillData {
  lockerAddress: string;
  totalCoinsDeposit: bigint;
  userAddress: string;
  lastWithdrawTime: number;
}

export interface WalletBalance {
  availableToWithdraw: bigint;
  stillLocked: bigint;
  totalUserDeposit: bigint;
  totalUserDepositAndReward: bigint;
}
