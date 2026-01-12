/**
 * Ultra Advisor - Points System Hooks
 * 前端呼叫 Cloud Functions 的工具
 * 
 * 使用方式：
 * import { usePoints } from '../hooks/usePoints';
 * 
 * const { triggerDailyLogin, triggerToolUse, getUserSummary } = usePoints();
 */

import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

// 初始化 Functions
const functions = getFunctions(app, 'asia-east1'); // 或你的 region

/**
 * Points System Hook
 */
export const usePoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 每日登入（在登入成功後呼叫）
   */
  const triggerDailyLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const onDailyLogin = httpsCallable(functions, 'onDailyLogin');
      const result = await onDailyLogin();
      return result.data;
    } catch (err) {
      console.error('Daily login error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 工具使用（在使用工具後呼叫）
   */
  const triggerToolUse = useCallback(async (toolName) => {
    setLoading(true);
    setError(null);
    
    try {
      const onToolUse = httpsCallable(functions, 'onToolUse');
      const result = await onToolUse({ toolName });
      return result.data;
    } catch (err) {
      console.error('Tool use error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 建立首位客戶
   */
  const triggerFirstClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const onFirstClient = httpsCallable(functions, 'onFirstClient');
      const result = await onFirstClient();
      return result.data;
    } catch (err) {
      console.error('First client error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 使用推薦碼
   */
  const useReferralCode = useCallback(async (referralCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const processReferral = httpsCallable(functions, 'processReferral');
      const result = await processReferral({ referralCode });
      return result.data;
    } catch (err) {
      console.error('Referral error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新推薦碼
   */
  const updateMyReferralCode = useCallback(async (newCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateReferralCode = httpsCallable(functions, 'updateReferralCode');
      const result = await updateReferralCode({ newCode });
      return result.data;
    } catch (err) {
      console.error('Update referral code error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 取得用戶點數摘要
   */
  const getUserSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const getUserPointsSummary = httpsCallable(functions, 'getUserPointsSummary');
      const result = await getUserPointsSummary();
      return result.data;
    } catch (err) {
      console.error('Get summary error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    triggerDailyLogin,
    triggerToolUse,
    triggerFirstClient,
    useReferralCode,
    updateMyReferralCode,
    getUserSummary,
  };
};

/**
 * 簡化版：直接呼叫函數（不使用 Hook）
 */
export const pointsApi = {
  dailyLogin: async () => {
    const fn = httpsCallable(functions, 'onDailyLogin');
    const result = await fn();
    return result.data;
  },
  
  toolUse: async (toolName) => {
    const fn = httpsCallable(functions, 'onToolUse');
    const result = await fn({ toolName });
    return result.data;
  },
  
  firstClient: async () => {
    const fn = httpsCallable(functions, 'onFirstClient');
    const result = await fn();
    return result.data;
  },
  
  useReferral: async (code) => {
    const fn = httpsCallable(functions, 'processReferral');
    const result = await fn({ referralCode: code });
    return result.data;
  },
  
  updateReferralCode: async (newCode) => {
    const fn = httpsCallable(functions, 'updateReferralCode');
    const result = await fn({ newCode });
    return result.data;
  },
  
  getSummary: async () => {
    const fn = httpsCallable(functions, 'getUserPointsSummary');
    const result = await fn();
    return result.data;
  },
};

export default usePoints;
