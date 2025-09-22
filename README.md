# TON Unlocker

A minimalist web application for unlocking vested TON tokens from the TON Locker contract.

## Development

```bash
# Install dependencies
yarn

# Run development server
yarn dev

# Build for production
yarn build
```

## Usage

### Mainnet
Visit the app at https://locker.ton.org

### Testnet
Add `?testnet=true` parameter: https://locker.ton.org/?testnet=true

## Contract Address

TON Believers Fund Locker contract address:
`0:ED1691307050047117B998B561D8DE82D31FBF84910CED6EB5FC92E7485EF8A7`

## Withdrawal Process

To withdraw available tokens:
1. Connect your wallet or enter address manually
2. Check your available balance
3. Click "Withdraw Available" button
4. For TON Connect: Approve the transaction
5. For manual entry: Send 1 TON with comment "w" to the locker address

## Architecture

The app uses:
- React + TypeScript + Vite
- @tonconnect/ui-react for wallet integration
- @ton/ton, @ton/core for blockchain interaction
- Tailwind CSS for styling
- TonCenter API without key
