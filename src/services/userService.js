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

export async function transferToAddress(senderUserId, recipientAddress, tokenSymbol, qty) {
  try {
    const response = await fetch('http://localhost:8081/api/wallet/send-to-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderUserId,
        recipientAddress,
        tokenSymbol,
        qty
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '转账失败');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function transferToUserId(senderUserId, recipientUserId, tokenSymbol, qty) {
  try {
    const response = await fetch('http://localhost:8081/api/wallet/send-to-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderUserId,
        recipientUserId,
        tokenSymbol,
        qty
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '转账失败');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchTokenTransactions(userId, tokenSymbol, page, size) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/transactions/user?userId=${userId}&tokenSymbol=${tokenSymbol}&page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token transactions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
}
