import { Address, beginCell, Cell, type Contract, contractAddress, type ContractProvider, type Sender, SendMode } from '@ton/core';
import { Opcodes } from "./Locker";

export type LockerBillConfig = {
    lockerAddress: Address;
    userAddress: Address
};

export function lockerBillConfigToCell(config: LockerBillConfig): Cell {
    return beginCell()
        .storeAddress(config.lockerAddress)
        .storeCoins(0)
        .storeAddress(config.userAddress)
        .storeUint(0, 32)
        .endCell();
}

export class LockerBill implements Contract {
    readonly address: Address;
    readonly init?: { code: Cell; data: Cell };
    
    constructor(address: Address, init?: { code: Cell; data: Cell }) {
        this.address = address;
        this.init = init;
    }

    static createFromAddress(address: Address) {
        return new LockerBill(address);
    }

    static createFromConfig(config: LockerBillConfig, code: Cell, workchain = 0) {
        const data = lockerBillConfigToCell(config);
        const init = { code, data };
        return new LockerBill(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendEmpty(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .endCell(),
        });
    }

    async sendChar(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            char: string
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0, 32) // text op
                .storeStringTail(opts.char)
                .endCell(),
        });
    }

    async sendDepositFromLocker(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            depositAmount: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.deposit_to_bill, 32)
                .storeCoins(opts.depositAmount)
                .endCell(),
        });
    }

    async getData(provider: ContractProvider) {
        const result = await provider.get('get_locker_bill_data', []);
        return {
            lockerAddress: result.stack.readAddress(),
            totalCoinsDeposit: result.stack.readBigNumber(),
            userAddress: result.stack.readAddress(),
            lastWithdrawTime: result.stack.readNumber(),
        };
    }
}
