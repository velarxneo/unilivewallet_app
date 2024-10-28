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

export async function sendToAddress(senderUserId, recipientAddress, tokenSymbol, qty) {
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

export async function sendToUserId(senderUserId, recipientUserId, tokenSymbol, qty) {
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

export async function fetchTokenSendTransactions(userId, tokenSymbol, page, size) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/transactions/user?userId=${userId}&tokenSymbol=${tokenSymbol}&transactionCode=SEND&page=${page}&size=${size}&sort=timestamp,desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch token transactions');
    }
    
    const data = await response.json();
    
    // The API now returns both SND_UID and SND_ADR transactions
    // We don't need to modify the data here, just return it as is
    return data;
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
}

export async function fetchTransactionDetails(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/transaction/${transactionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}

export async function fetchConversionRate(fromToken, toToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-conversion-rate?fromToken=${fromToken}&toToken=${toToken}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversion rate');
    }
    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Error fetching conversion rate:', error);
    throw error;
  }
}

export async function convertTokens(userId, fromTokenSymbol, toTokenSymbol, qty) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fromTokenSymbol,
        toTokenSymbol,
        qty
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '兑换失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error converting tokens:', error);
    throw error;
  }
}

export async function fetchConversionHistory(userId, page, size) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wallet/transactions/user?userId=${userId}&transactionCode=CONVERT&page=${page}&size=${size}&sort=timestamp,desc`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch conversion history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversion history:', error);
    throw error;
  }
}
