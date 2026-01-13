/**
 * Ultra Advisor - 會員權限控制 Hook
 * 控制工具存取權限
 * 
 * 檔案位置：src/hooks/useMembership.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// 免費/試用會員可用的工具
export const FREE_TOOLS = [
  'reservoir',      // 大小水庫
  'estate',         // 金融房產
  'tax',            // 稅務傳承
];

// 所有工具列表
export const ALL_TOOLS = [
  'golden_safe',    // 黃金保險箱
  'market_data',    // 市場數據
  'fund_machine',   // 基金時光機
  'gift',           // 百萬禮物
  'estate',         // 金融房產
  'student',        // 學貸活化
  'super_active',   // 超積極存錢
  'reservoir',      // 大小水庫
  'car',            // 換車專案
  'pension',        // 退休缺口
  'tax',            // 稅務傳承
  'free_dashboard', // 自由組合
];

// 工具名稱對照表（用於顯示和記錄）
export const TOOL_NAMES: Record<string, string> = {
  golden_safe: '黃金保險箱理論',
  market_data: '市場數據戰情室',
  fund_machine: '基金時光機',
  gift: '百萬禮物專案',
  estate: '金融房產專案',
  student: '學貸活化專案',
  super_active: '超積極存錢法',
  reservoir: '大小水庫專案',
  car: '五年換車專案',
  pension: '退休缺口試算',
  tax: '稅務傳承專案',
  free_dashboard: '自由組合戰情室',
};

// 會員等級類型
type MembershipTier = 'founder' | 'paid' | 'trial' | 'grace' | 'expired';

interface MembershipData {
  tier: MembershipTier;
  tierName: string;
  points: number;
  referralCode: string;
  referralCount: number;
  loginStreak: number;
  expiresAt?: Date;
  canAccessTool: (toolId: string) => boolean;
  isPaid: boolean;
  isExpired: boolean;
}

/**
 * 會員權限 Hook
 */
export const useMembership = (userId: string | null) => {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const tier = (data.primaryTierId || 'trial') as MembershipTier;
          
          // 判斷是否為付費會員
          const isPaid = ['founder', 'paid'].includes(tier);
          const isExpired = ['grace', 'expired'].includes(tier);
          
          // 會員等級名稱
          const tierNames: Record<MembershipTier, string> = {
            founder: '創始會員',
            paid: '付費會員',
            trial: '試用會員',
            grace: '寬限期',
            expired: '已過期',
          };

          setMembership({
            tier,
            tierName: tierNames[tier] || '試用會員',
            points: data.points || 0,
            referralCode: data.referralCode || '',
            referralCount: data.referralCount || 0,
            loginStreak: data.loginStreak || 0,
            expiresAt: data.membershipExpiresAt?.toDate(),
            isPaid,
            isExpired,
            canAccessTool: (toolId: string) => {
              // 創始/付費會員可用全部工具
              if (isPaid) return true;
              // 過期會員不能用任何工具
              if (isExpired) return false;
              // 試用會員只能用免費工具
              return FREE_TOOLS.includes(toolId);
            },
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Membership fetch error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { membership, loading };
};

/**
 * 檢查工具是否可用（靜態函數）
 */
export const canAccessTool = (tier: MembershipTier, toolId: string): boolean => {
  const isPaid = ['founder', 'paid'].includes(tier);
  const isExpired = ['grace', 'expired'].includes(tier);
  
  if (isPaid) return true;
  if (isExpired) return false;
  return FREE_TOOLS.includes(toolId);
};

/**
 * 取得工具鎖定狀態列表
 */
export const getToolLockStatus = (tier: MembershipTier): Record<string, boolean> => {
  const status: Record<string, boolean> = {};
  
  ALL_TOOLS.forEach(toolId => {
    status[toolId] = !canAccessTool(tier, toolId);
  });
  
  return status;
};

export default useMembership;
