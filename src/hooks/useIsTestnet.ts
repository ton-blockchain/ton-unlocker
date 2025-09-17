import { useEffect, useState } from 'react';

export function useIsTestnet() {
  const [isTestnet, setIsTestnet] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTestnet(params.get('testnet') === 'true');
  }, []);
  
  return isTestnet;
}
