// src/services/userService.js

import { API_BASE_URL } from '@/config/apiConfig';

export async function fetchUserBalances(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/user?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user balances');
    }
    const data = await response.json();
    return data.balances; // Return only the balances array
  } catch (error) {
    console.error('Error fetching user balances:', error);
    throw error;
  }
}

export async function fetchUserBalancesWithDetails(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/user?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user balances');
    }
    const data = await response.json();
    return {
      userId: data.userId,
      address: data.address,
      balances: data.balances,
      usdtWalletBalance: calculateUsdtWalletBalance(data.balances)
    };
  } catch (error) {
    console.error('Error fetching user balances:', error);
    throw error;
  }
}

function calculateUsdtWalletBalance(balances) {
  const usdtBalance = balances.find(b => b.tokenSymbol === 'USDT');
  if (usdtBalance) {
    //return (parseFloat(usdtBalance.walletBalance) - parseFloat(usdtBalance.lockedWalletBalance)).toFixed(6);
    return parseFloat(usdtBalance.walletBalance);
  }
  return '0.000000';
}
