// src/hooks/useAutoSave.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SaveStatus } from '../components/SaveStatusIndicator';

interface UseAutoSaveOptions {
  debounceMs?: number;        // Debounce 延遲（毫秒）
  onSaveSuccess?: () => void; // 儲存成功回調
  onSaveError?: (error: Error) => void; // 儲存失敗回調
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  triggerSave: () => void;    // 手動觸發儲存
  isSaving: boolean;
}

/**
 * 自動存檔 Hook
 *
 * @param data - 要儲存的資料
 * @param userId - 用戶 ID
 * @param clientId - 客戶 ID
 * @param options - 選項配置
 */
export const useAutoSave = (
  data: Record<string, any> | null,
  userId: string | null,
  clientId: string | null,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn => {
  const {
    debounceMs = 2000,  // 預設 2 秒
    onSaveSuccess,
    onSaveError
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 使用 ref 追蹤前一次資料，避免無謂儲存
  const prevDataRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 清理 timeout
  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // 執行儲存
  const performSave = useCallback(async (dataToSave: Record<string, any>) => {
    if (!userId || !clientId) return;

    setSaveStatus('saving');

    try {
      // 儲存到 Firestore
      // 路徑: users/{userId}/clients/{clientId}
      const clientRef = doc(db, 'users', userId, 'clients', clientId);

      await updateDoc(clientRef, {
        ...dataToSave,
        updatedAt: serverTimestamp()
      });

      if (isMountedRef.current) {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        onSaveSuccess?.();
      }
    } catch (error) {
      console.error('自動存檔失敗:', error);
      if (isMountedRef.current) {
        setSaveStatus('error');
        onSaveError?.(error as Error);
      }
    }
  }, [userId, clientId, onSaveSuccess, onSaveError]);

  // 手動觸發儲存
  const triggerSave = useCallback(() => {
    if (data) {
      clearSaveTimeout();
      performSave(data);
    }
  }, [data, clearSaveTimeout, performSave]);

  // 監聽資料變化，Debounce 自動存檔
  useEffect(() => {
    if (!data || !userId || !clientId) return;

    // 序列化資料用於比較
    const dataString = JSON.stringify(data);

    // 資料沒變就不處理
    if (prevDataRef.current === dataString) return;

    prevDataRef.current = dataString;
    setSaveStatus('unsaved');

    // 清除舊的 timeout
    clearSaveTimeout();

    // 設定新的 debounce timeout
    saveTimeoutRef.current = setTimeout(() => {
      performSave(data);
    }, debounceMs);

    return clearSaveTimeout;
  }, [data, userId, clientId, debounceMs, clearSaveTimeout, performSave]);

  // 元件卸載時清理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearSaveTimeout();
    };
  }, [clearSaveTimeout]);

  // 頁面關閉前強制儲存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' && data) {
        // 嘗試同步儲存（不保證成功）
        triggerSave();

        // 顯示離開確認
        e.preventDefault();
        e.returnValue = '您有未儲存的變更，確定要離開嗎？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus, data, triggerSave]);

  return {
    saveStatus,
    lastSavedAt,
    triggerSave,
    isSaving: saveStatus === 'saving'
  };
};

export default useAutoSave;
