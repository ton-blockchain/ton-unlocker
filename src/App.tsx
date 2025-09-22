import { useState, useEffect } from 'react';
import { TonConnectUIProvider, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { WalletConnector } from './components/WalletConnector';
import { BalanceDisplay } from './components/BalanceDisplay';
import { useIsTestnet } from './hooks/useIsTestnet';
import { billsService } from './services/billsService';

function AppContent() {
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [isValidatingTonConnect, setIsValidatingTonConnect] = useState(false);
  const [tonConnectError, setTonConnectError] = useState<string | null>(null);
  const isTestnet = useIsTestnet();

  const currentAddress = tonAddress || manualAddress;

  const handleAddressSet = (address: string) => {
    setManualAddress(address);
    setIsManual(true);
    setTonConnectError(null);
  };

  const handleDisconnect = () => {
    setManualAddress(null);
    setIsManual(false);
    setTonConnectError(null);
  };

  // Validate TON Connect address
  useEffect(() => {
    if (tonAddress) {
      setIsValidatingTonConnect(true);
      setTonConnectError(null);
      
      billsService.validateUserAddress(tonAddress)
        .then(isValid => {
          if (isValid) {
            setIsManual(false);
            setManualAddress(null);
          } else {
            setTonConnectError('This wallet has no deposits in the locker');
          }
        })
        .catch(error => {
          console.error('Failed to validate address:', error);
          setTonConnectError('Failed to validate wallet');
        })
        .finally(() => {
          setIsValidatingTonConnect(false);
        });
    } else {
      setTonConnectError(null);
    }
  }, [tonAddress]);

  // Show loading while validating TON Connect
  if (isValidatingTonConnect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Validating wallet...</p>
        </div>
      </div>
    );
  }

  // Show error for invalid TON Connect wallet
  if (tonAddress && tonConnectError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-center mb-4">Wallet Not Found</h2>
          <p className="text-center text-gray-600 mb-6">{tonConnectError}</p>
          <p className="text-center text-sm text-gray-500 mb-6">
            Please disconnect and try with a different wallet that has deposits in the TON Locker.
          </p>
          <div className="text-center">
            <button
              onClick={() => {
                if (tonConnectUI.connected) {
                  tonConnectUI.disconnect();
                }
                setTonConnectError(null);
              }}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {!currentAddress ? (
        <WalletConnector onAddressSet={handleAddressSet} isTestnet={isTestnet} />
      ) : (
        <BalanceDisplay
          address={currentAddress}
          isManual={isManual}
          onDisconnect={handleDisconnect}
          isTestnet={isTestnet}
        />
      )}
    </div>
  );
}

function App() {
  const isTestnet = useIsTestnet();
  const manifestUrl = `https://locker.ton.org/tonconnect-manifest.json`;
  console.log("Manifest URL: " + manifestUrl);

  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      walletsListConfiguration={{
        includeWallets: isTestnet ? [] : undefined,
      }}
    >
      <AppContent />
    </TonConnectUIProvider>
  );
}

export default App;
