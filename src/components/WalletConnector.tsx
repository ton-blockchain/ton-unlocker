import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { billsService } from '../services/billsService';

interface WalletConnectorProps {
  onAddressSet: (address: string) => void;
  isTestnet: boolean;
}

export function WalletConnector({ onAddressSet, isTestnet }: WalletConnectorProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [manualAddress, setManualAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Preload bills data when component mounts
  useEffect(() => {
    billsService.loadBills().catch(console.error);
  }, []);

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

  const validateAndFormatAddress = async (address: string): Promise<string | null> => {
    try {
      // Try to parse the address
      const parsed = Address.parse(address);
      const nonBounceable = parsed.toString({ bounceable: false, testOnly: isTestnet });
      
      // Check if address exists in bills
      const exists = await billsService.validateUserAddress(address);
      if (!exists) {
        setAddressError('This address has no deposits in the locker');
        return null;
      }
      
      return nonBounceable;
    } catch (error) {
      setAddressError('Invalid TON address format');
      return null;
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsValidating(true);
    const formattedAddress = await validateAndFormatAddress(manualAddress);
    setIsValidating(false);
    
    if (formattedAddress) {
      onAddressSet(formattedAddress);
      setAddressError('');
      setManualAddress('');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualAddress(value);
    setAddressError(''); // Clear error on change
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">TON Unlocker</h1>
        <p className="text-gray-500 text-center mb-8">
          Unlock your vested TON tokens
          {isTestnet && <span className="text-orange-500 ml-2">(Testnet)</span>}
        </p>
        
        {!showManualInput ? (
          <div className="space-y-4">
            <button
              onClick={handleConnect}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Enter Address Manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                TON Address
              </label>
              <input
                id="address"
                type="text"
                value={manualAddress}
                onChange={handleAddressChange}
                placeholder="EQA... or UQA..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  addressError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isValidating}
              />
              {addressError && (
                <p className="mt-1 text-sm text-red-600">{addressError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualAddress('');
                  setAddressError('');
                }}
                className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={isValidating}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!manualAddress || isValidating}
                className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                  !manualAddress || isValidating
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isValidating ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}