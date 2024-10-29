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
    console.log('Sending request with:', { senderUserId, recipientAddress, tokenSymbol, qty });
    
    const response = await fetch(`${API_BASE_URL}/api/wallet/send-to-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderUserId,
        recipientAddress,
        tokenSymbol,
        qty: parseFloat(qty) // Ensure qty is a number
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '转账失败');
    }
    
    return data;
  } catch (error) {
    console.error('Send to address error:', error);
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
    const response = await fetch(`${API_BASE_URL}/api/wallet/transactions/user?userId=${userId}&tokenSymbol=${tokenSymbol}&page=${page}&size=${size}&sort=timestamp,desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch token transactions');
    }
    
    const data = await response.json();
    console.log(data); // Log the fetched data for debugging
    
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

// Add this function to userService.js

export async function transferBalance(userId, tokenSymbol, amount, toOTC) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        tokenSymbol,
        qty: amount,
        toOTC
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '划转失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error transferring balance:', error);
    throw error;
  }
}

// Add this new function
export async function fetchTransferFee(token, qty) {
  try {
    //console.log(`Fetching fee for token: ${token}, qty: ${qty}`);
    const response = await fetch(`${API_BASE_URL}/api/get-fee?token=${token}&qty=${qty}&code=BAL_TRF`);
    //console.log('Fee API response:', response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch fee');
    }
    const data = await response.json();
    return {
      feeConfiguration: data.feeConfiguration, // Fee configuration (e.g., "5%-8%")
      totalFee: data.totalFee // Actual fee amount
    };
  } catch (error) {
    console.error('Error fetching fee:', error);
    throw error;
  }
}

// Add this new function to fetch transfer history
export async function fetchTransferHistory(userId, page, size) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wallet/transactions/user?userId=${userId}&transactionCode=BAL_TRF&page=${page}&size=${size}&sort=timestamp,desc`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transfer history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    throw error;
  }
}

// Add this new function to userService.js
export async function checkWalletDeposits(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet-deposits/check?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    // First check the content type of the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // If it's not JSON, get the text response
      const text = await response.text();
      return { message: text }; // Wrap the text in an object
    }
    
  } catch (error) {
    console.error('Error checking wallet deposits:', error);
    throw error;
  }
}

// Add this new function to check if address is internal
export async function isInternalAddress(address) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/is-internal-address?address=${address}`);
    
    if (!response.ok) {
      throw new Error('Failed to check address');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking internal address:', error);
    throw error;
  }
}

export async function getEstimatedGasFee(toAddress, token, qty) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/get-estimated-gas-fee?to-address=${toAddress}&token=${token}&qty=${qty}`);
    
    if (!response.ok) {
      throw new Error('Failed to get gas fee estimate');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting gas fee estimate:', error);
    throw error;
  }
}

export async function withdrawBalance(userId, tokenSymbol, qty, recipientAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        tokenSymbol,
        qty,
        recipientAddress
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '提现失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error withdrawing balance:', error);
    throw error;
  }
}
