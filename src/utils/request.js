const request = {
  async send(options) {
    const token = uni.getStorageSync('admin_token');
    if (token) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      };
    }
    
    try {
      const response = await uni.request(options);
      return response;
    } catch (error) {
      if (error.statusCode === 401) {
        uni.removeStorageSync('admin_token');
        uni.navigateTo({
          url: '/pages/admin/Login'
        });
      }
      throw error;
    }
  }
};

export default request; 