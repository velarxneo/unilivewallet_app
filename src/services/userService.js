// src/services/userService.js

import { API_BASE_URL } from '@/config/apiConfig';

export async function fetchUserBalances(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wallet/balances/user?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user balances');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user balances:', error);
    throw error;
  }
}