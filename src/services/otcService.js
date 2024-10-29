// src/services/otcService.js

import { API_BASE_URL } from '@/config/apiConfig';

export async function fetchOrderBook() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otc/orderbook?baseTokenSymbol=SEE&quoteTokenSymbol=USDT`);
    if (!response.ok) {
      throw new Error('Failed to fetch order book');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order book:', error);
    throw error;
  }
}

export async function fetchFeeConfiguration() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-fee-configuration?code=TRADE`);
    if (!response.ok) {
      throw new Error('Failed to fetch fee configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    throw error;
  }
}

export async function fetchTransactionHistory(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otc/transactions/user?userId=${userId}&page=0&size=10&sort=transactionDate,desc`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

export async function matchOrder(requestBody) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/otc/match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
        throw new Error('Failed to match order');
        }

        return await response.json();
    } catch (error) {
        console.error('Error matching order:', error);
        throw error;
    }
}

export async function fetchTransactionDetails(userId, orderId) {
  try {
    const response = await fetch(`http://localhost:8081/api/otc/transactions/user?userId=${userId}&page=0&size=10&orderId=${orderId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
}

export async function fetchOrderHistory(userId, currentPage, pageSize, orderType, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otc/orders/user?userId=${userId}&page=${currentPage}&size=${pageSize}&orderType=${orderType}&status=${status}&sort=createdAt,desc`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}

export async function cancelOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otc/cancel?orderId=${orderId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
}

export async function fetchRawOrderBook(baseTokenSymbol, quoteTokenSymbol) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/otc/raw-orderbook?baseTokenSymbol=${baseTokenSymbol}&quoteTokenSymbol=${quoteTokenSymbol}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch raw order book');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching raw order book:', error);
    throw error;
  }
}

export async function fillSelectedOrders(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/otc/fill-selected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      throw new Error('Failed to fill selected orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error filling selected orders:', error);
    throw error;
  }
}

export async function fetchTransactionFee(token, qty) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-fee?token=${token}&qty=${qty}&code=TRADE`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction fee');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction fee:', error);
    throw error;
  }
}
