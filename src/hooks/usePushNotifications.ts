/**
 * Ultra Advisor - 推播通知 Hook
 * 處理 FCM 訂閱、Token 管理、通知權限
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db, getFCMToken, onForegroundMessage, initMessaging } from '../firebase';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  checkPermission: () => void;
}

/**
 * 推播通知 Hook
 * @param userId - 當前用戶的 UID（用於儲存 FCM token）
 */
export function usePushNotifications(userId: string | null): UsePushNotificationsReturn {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  // 檢查瀏覽器是否支援推播
  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;

      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission: supported ? Notification.permission : 'default',
        isLoading: false,
      }));

      // 如果已經有權限且有用戶，檢查是否已訂閱
      if (supported && userId && Notification.permission === 'granted') {
        await checkSubscription(userId);
      }
    };

    checkSupport();
  }, [userId]);

  // 檢查用戶是否已訂閱
  const checkSubscription = async (uid: string) => {
    try {
      const tokenDoc = await getDoc(doc(db, 'fcmTokens', uid));
      if (tokenDoc.exists()) {
        const data = tokenDoc.data();
        setState(prev => ({
          ...prev,
          isSubscribed: data.enabled !== false,
        }));
      }
    } catch (error) {
      console.error('[Push] Failed to check subscription:', error);
    }
  };

  // 檢查權限狀態
  const checkPermission = useCallback(() => {
    if ('Notification' in window) {
      setState(prev => ({
        ...prev,
        permission: Notification.permission,
      }));
    }
  }, []);

  // 訂閱推播通知
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: '您的瀏覽器不支援推播通知' }));
      return false;
    }

    if (!userId) {
      setState(prev => ({ ...prev, error: '請先登入' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // 請求通知權限
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: '需要通知權限才能接收推播'
        }));
        return false;
      }

      // 初始化 Messaging
      await initMessaging();

      // 取得 FCM Token
      const token = await getFCMToken();
      if (!token) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: '無法取得推播 Token'
        }));
        return false;
      }

      // 儲存 Token 到 Firestore
      await setDoc(doc(db, 'fcmTokens', userId), {
        token,
        enabled: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        platform: getPlatform(),
        userAgent: navigator.userAgent,
      }, { merge: true });

      console.log('[Push] Subscribed successfully');
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      console.error('[Push] Subscribe error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '訂閱失敗',
      }));
      return false;
    }
  }, [state.isSupported, userId]);

  // 取消訂閱
  const unsubscribe = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 更新 Firestore 中的訂閱狀態
      await setDoc(doc(db, 'fcmTokens', userId), {
        enabled: false,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      console.log('[Push] Unsubscribed successfully');
    } catch (error: any) {
      console.error('[Push] Unsubscribe error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '取消訂閱失敗',
      }));
    }
  }, [userId]);

  // 設定前景訊息監聽
  useEffect(() => {
    if (!state.isSubscribed) return;

    const unsubscribeMessage = onForegroundMessage((payload) => {
      console.log('[Push] Foreground message received:', payload);

      // 顯示瀏覽器通知（前景時 FCM 不會自動顯示）
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        new Notification(title || 'Ultra Advisor', {
          body: body || '',
          icon: icon || '/logo.png',
          badge: '/logo.png',
        });
      }
    });

    return () => {
      if (typeof unsubscribeMessage === 'function') {
        unsubscribeMessage();
      }
    };
  }, [state.isSubscribed]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkPermission,
  };
}

// 輔助函數：判斷平台
function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'mac';
  if (/Linux/.test(ua)) return 'linux';
  return 'web';
}

export default usePushNotifications;
