// src/utils/membership.ts

import { FREE_TOOLS } from '../constants/tools';

export type MembershipStatus = 'trial' | 'active' | 'grace' | 'expired' | 'founder';

export interface MembershipInfo {
  status: MembershipStatus;
  isPro: boolean;              // 是否有 PRO 權限
  isFounder: boolean;          // 是否為創始會員
  expiresAt: Date | null;
  daysRemaining: number;
}

/**
 * 判斷用戶是否有權限使用某工具
 */
export const canAccessTool = (toolId: string, membershipInfo: MembershipInfo): boolean => {
  // 免費工具：所有人都能用
  const isFreeToolId = FREE_TOOLS.some(tool => tool.id === toolId);
  if (isFreeToolId) return true;

  // PRO 工具：需要 PRO 權限
  return membershipInfo.isPro;
};

/**
 * 根據 Firestore 用戶資料判斷會員狀態
 */
export const getMembershipInfo = (userData: any): MembershipInfo => {
  // 先檢查是否為創始會員
  const isFounder = userData?.isFounder === true || userData?.primaryTierId === 'founder';

  // 取得訂閱狀態
  const status = userData?.subscriptionStatus || userData?.primaryTierId || 'expired';

  // 取得到期時間
  const expiresAt = userData?.membershipExpiresAt?.toDate?.() ||
                    userData?.subscriptionEndDate?.toDate?.() ||
                    userData?.trialExpiresAt?.toDate?.() ||
                    null;

  const now = new Date();
  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // 判斷是否有 PRO 權限
  // 創始會員永久有權限
  // 付費會員或試用期內有權限
  const isPro = isFounder ||
                (['active', 'trial', 'paid', 'founder'].includes(status) && daysRemaining > 0);

  return {
    status: isFounder ? 'founder' : status as MembershipStatus,
    isPro,
    isFounder,
    expiresAt,
    daysRemaining: isFounder ? 999 : Math.max(0, daysRemaining)
  };
};

/**
 * 預設會員資訊（未登入或載入中）
 */
export const defaultMembershipInfo: MembershipInfo = {
  status: 'expired',
  isPro: false,
  isFounder: false,
  expiresAt: null,
  daysRemaining: 0
};
