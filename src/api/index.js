//封装 API 接口

import request from './request';

export const login = (data) => request.post('/auth/login', data);
export const register = (data) => request.post('/auth/register', data);

export const getTransactions = (params) => request.get('/transactions', { params });
export const addTransaction = (data) => request.post('/transactions', data);

export const deleteTransaction = (id) => request.delete(`/transactions/${id}`);
export const updateTransaction = (id, data) => request.put(`/transactions/${id}`, data);

export const getSummary = (month) => request.get(`/stats/summary?month=${month}`);
export const getCategoryStats = (month, type = 'EXPENSE') => request.get(`/stats/category?month=${month}&type=${type}`);

export const getCategories = (type) => request.get(`/meta/categories?type=${type}`);

export const createCategory = (data) => request.post('/meta/categories', data);
export const updateCategory = (id, data) => request.put(`/meta/categories/${id}`, data);
export const deleteCategory = (id) => request.delete(`/meta/categories/${id}`);

export const getAccounts = () => request.get('/meta/accounts');
export const createAccount = (data) => request.post('/meta/accounts', data);
export const updateAccount = (id, data) => request.put(`/meta/accounts/${id}`, data);
export const deleteAccount = (id) => request.delete(`/meta/accounts/${id}`);

export const getMe = () => request.get('/users/me');
export const updateProfile = (data) => request.put('/users/me', data);
export const resetPassword = (data) => request.post('/auth/reset-password', data);
export const sendCode = (email) => request.post(`/auth/send-code?email=${email}`);

export const getTrend = (months = 6) => request.get(`/stats/trend?months=${months}`);