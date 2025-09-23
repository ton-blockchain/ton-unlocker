import { Address } from "@ton/core";
import { inflate } from "pako";

interface BillData {
  billAddress: string;
  userAddress: string;
  totalDeposit: string;
  lastWithdrawTime: number;
}

interface BillsData {
  total_deposits: number;
  total_coins_locked: number;
  total_reward: number;
  bills: BillData[];
}

class BillsService {
  private billsData: BillsData | null = null;
  private userToBillMap: Map<string, BillData> = new Map();
  private loadingPromise: Promise<void> | null = null;

  async loadBills(): Promise<void> {
    if (this.billsData) return;

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    const billsPath = "https://locker.ton.org/bills.gz";
    console.log(billsPath);

    this.loadingPromise = fetch(billsPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.arrayBuffer();
      })
      .then((compressedData) => {
        const decompressedData = inflate(new Uint8Array(compressedData), {
          to: "string",
        });
        return JSON.parse(decompressedData);
      })
      .then((data: BillsData) => {
        this.billsData = data;

        // Create a map for quick lookup by user address
        data.bills.forEach((bill) => {
          // Normalize address to raw format for consistent lookup
          const normalizedAddress = Address.parse(
            bill.userAddress
          ).toRawString();
          this.userToBillMap.set(normalizedAddress, bill);
        });
      })
      .catch((error) => {
        console.error("Failed to load bills data:", error);
        throw error;
      });

    return this.loadingPromise;
  }

  async getBillByUserAddress(userAddress: string): Promise<BillData | null> {
    await this.loadBills();

    try {
      const normalizedAddress = Address.parse(userAddress).toRawString();
      return this.userToBillMap.get(normalizedAddress) || null;
    } catch {
      return null;
    }
  }

  async getLockerData() {
    await this.loadBills();

    if (!this.billsData) {
      throw new Error("Bills data not loaded");
    }

    return {
      totalCoinsLocked: BigInt(this.billsData.total_coins_locked),
      totalReward: BigInt(this.billsData.total_reward),
    };
  }

  async validateUserAddress(userAddress: string): Promise<boolean> {
    const bill = await this.getBillByUserAddress(userAddress);
    return bill !== null;
  }
}

// Singleton instance
export const billsService = new BillsService();
