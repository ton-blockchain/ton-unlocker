export const LOCKER_ADDRESSES = {
  mainnet: '0:ED1691307050047117B998B561D8DE82D31FBF84910CED6EB5FC92E7485EF8A7',
  // mainnet: '0:01a5b07cf83f1c379e802d412212102a9eec65c707fc3fad815b14db3c8980fa', // mainnet test
  testnet: '0:ae88502062c36412b536cb34b9c8603843228975beebdb66eb3b3f884eccbc29'
};

export const WITHDRAW_AMOUNT = 1000000000n; // 1 TON in nanotons

export const TON_CENTER_API = {
  mainnet: 'https://toncenter.com/api/v2/jsonRPC',
  testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC'
};

// 2 seconds rate limit for TonCenter
export const API_RATE_LIMIT = 2000;
