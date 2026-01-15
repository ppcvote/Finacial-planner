/**
 * Ultra Advisor - UA 商城 Modal
 * 點數兌換商城介面
 *
 * 檔案位置：src/components/StoreModal.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  ChevronLeft,
  Check,
  Loader2,
  Gift,
  Truck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useStore, StoreItem, Order, ShippingInfo } from '../hooks/useStore';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  onPointsChange?: () => void;
}

type ViewMode = 'list' | 'detail' | 'orders' | 'shipping' | 'success';

// 分類設定
const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  subscription: { label: '訂閱延長', color: 'blue', icon: '📅' },
  merchandise: { label: '實體商品', color: 'green', icon: '🎁' },
  digital: { label: '數位商品', color: 'purple', icon: '💎' },
  experience: { label: '體驗服務', color: 'amber', icon: '⭐' },
};

// 訂單狀態設定
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '待處理', color: 'amber', icon: <Clock className="w-4 h-4" /> },
  processing: { label: '處理中', color: 'blue', icon: <Package className="w-4 h-4" /> },
  shipped: { label: '已出貨', color: 'purple', icon: <Truck className="w-4 h-4" /> },
  completed: { label: '已完成', color: 'emerald', icon: <Check className="w-4 h-4" /> },
  cancelled: { label: '已取消', color: 'slate', icon: <X className="w-4 h-4" /> },
};

const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  userPoints,
  onPointsChange,
}) => {
  const { items, orders, loading, error, fetchItems, fetchOrders, redeemItem } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
  });
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{
    orderNumber: string;
    message: string;
    isVirtual: boolean;
  } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // 載入商品和訂單
  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchOrders();
      setViewMode('list');
      setSelectedItem(null);
      setRedeemError(null);
    }
  }, [isOpen, fetchItems, fetchOrders]);

  // 處理商品點擊
  const handleItemClick = (item: StoreItem) => {
    setSelectedItem(item);
    setSelectedVariant('');
    setRedeemError(null);
    setViewMode('detail');
  };

  // 處理兌換
  const handleRedeem = async () => {
    if (!selectedItem) return;

    // 實體商品需要填寫收件資訊
    if (selectedItem.requiresShipping) {
      setViewMode('shipping');
      return;
    }

    // 虛擬商品直接兌換
    await executeRedeem();
  };

  // 執行兌換
  const executeRedeem = async () => {
    if (!selectedItem) return;

    setRedeeming(true);
    setRedeemError(null);

    try {
      const result = await redeemItem(
        selectedItem.id,
        selectedVariant || undefined,
        selectedItem.requiresShipping ? shippingInfo : undefined
      );

      setRedeemResult(result);
      setViewMode('success');
      onPointsChange?.();
    } catch (err: any) {
      setRedeemError(err.message || '兌換失敗，請稍後再試');
    } finally {
      setRedeeming(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    if (viewMode === 'shipping') {
      setViewMode('detail');
    } else if (viewMode === 'detail' || viewMode === 'orders' || viewMode === 'success') {
      setViewMode('list');
      setSelectedItem(null);
      setRedeemResult(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal 內容 */}
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 標題列 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {viewMode !== 'list' && (
              <button
                onClick={handleBack}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                {viewMode === 'orders' ? '我的兌換紀錄' : 'UA 商城'}
              </h2>
              <p className="text-white/70 text-xs">用點數兌換好禮</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 px-3 py-1.5 rounded-lg">
              <span className="text-white font-bold">{userPoints.toLocaleString()}</span>
              <span className="text-white/70 text-sm ml-1">UA</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Tab 切換 */}
        {viewMode === 'list' && (
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className="flex-1 px-4 py-3 text-sm font-medium text-purple-400 border-b-2 border-purple-400 bg-purple-500/10"
            >
              商品列表
            </button>
            <button
              onClick={() => { setViewMode('orders'); fetchOrders(); }}
              className="flex-1 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              兌換紀錄
            </button>
          </div>
        )}

        {viewMode === 'orders' && (
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className="flex-1 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              商品列表
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className="flex-1 px-4 py-3 text-sm font-medium text-purple-400 border-b-2 border-purple-400 bg-purple-500/10"
            >
              兌換紀錄
            </button>
          </div>
        )}

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto">
          {loading && viewMode === 'list' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 m-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 商品列表 */}
          {viewMode === 'list' && !loading && (
            <ItemList
              items={items}
              userPoints={userPoints}
              onItemClick={handleItemClick}
            />
          )}

          {/* 商品詳情 */}
          {viewMode === 'detail' && selectedItem && (
            <ItemDetail
              item={selectedItem}
              userPoints={userPoints}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              onRedeem={handleRedeem}
              redeeming={redeeming}
              error={redeemError}
            />
          )}

          {/* 收件資訊 */}
          {viewMode === 'shipping' && selectedItem && (
            <ShippingForm
              shippingInfo={shippingInfo}
              onChange={setShippingInfo}
              onSubmit={executeRedeem}
              onBack={() => setViewMode('detail')}
              redeeming={redeeming}
              error={redeemError}
              item={selectedItem}
              variant={selectedVariant}
            />
          )}

          {/* 兌換成功 */}
          {viewMode === 'success' && redeemResult && (
            <SuccessView
              result={redeemResult}
              onViewOrders={() => { setViewMode('orders'); fetchOrders(); }}
              onClose={onClose}
            />
          )}

          {/* 訂單列表 */}
          {viewMode === 'orders' && (
            <OrderList orders={orders} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

// 商品列表元件
const ItemList: React.FC<{
  items: StoreItem[];
  userPoints: number;
  onItemClick: (item: StoreItem) => void;
}> = ({ items, userPoints, onItemClick }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
        <p>商城準備中，敬請期待</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {items.map((item) => {
        const canAfford = userPoints >= item.pointsCost;
        const isOutOfStock = item.remaining === 0;
        const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.merchandise;

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            disabled={isOutOfStock}
            className={`
              text-left bg-slate-800/50 rounded-xl overflow-hidden
              border transition-all duration-200
              ${isOutOfStock
                ? 'border-slate-700/50 opacity-60 cursor-not-allowed'
                : canAfford
                  ? 'border-purple-500/30 hover:border-purple-400 hover:bg-slate-800'
                  : 'border-slate-700/50 hover:border-slate-600'
              }
            `}
          >
            {/* 商品圖片 */}
            <div className="aspect-square bg-slate-700/30 relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {cat.icon}
                </div>
              )}

              {/* 精選標籤 */}
              {item.isFeatured && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  精選
                </div>
              )}

              {/* 售罄標籤 */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold">已售罄</span>
                </div>
              )}

              {/* 低庫存標籤 */}
              {!isOutOfStock && item.remaining > 0 && item.remaining <= 5 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  剩 {item.remaining} 件
                </div>
              )}
            </div>

            {/* 商品資訊 */}
            <div className="p-3">
              <div className={`text-xs ${`text-${cat.color}-400`} bg-${cat.color}-500/20 px-2 py-0.5 rounded-full inline-block mb-1`}>
                {cat.icon} {cat.label}
              </div>
              <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className={`font-bold ${canAfford ? 'text-purple-400' : 'text-slate-400'}`}>
                  {item.pointsCost.toLocaleString()} UA
                </span>
                {item.remaining === -1 ? (
                  <span className="text-xs text-slate-500">無限</span>
                ) : (
                  <span className="text-xs text-slate-500">庫存 {item.remaining}</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// 商品詳情元件
const ItemDetail: React.FC<{
  item: StoreItem;
  userPoints: number;
  selectedVariant: string;
  onVariantChange: (v: string) => void;
  onRedeem: () => void;
  redeeming: boolean;
  error: string | null;
}> = ({ item, userPoints, selectedVariant, onVariantChange, onRedeem, redeeming, error }) => {
  const canAfford = userPoints >= item.pointsCost;
  const isOutOfStock = item.remaining === 0;
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.merchandise;
  const pointsAfter = userPoints - item.pointsCost;

  return (
    <div className="p-4">
      {/* 商品圖片 */}
      <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden mb-4">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {cat.icon}
          </div>
        )}
      </div>

      {/* 商品資訊 */}
      <div className={`text-xs text-${cat.color}-400 bg-${cat.color}-500/20 px-2 py-0.5 rounded-full inline-block mb-2`}>
        {cat.icon} {cat.label}
      </div>

      <h2 className="text-white text-xl font-bold mb-2">{item.name}</h2>

      {item.description && (
        <p className="text-slate-400 text-sm mb-4">{item.description}</p>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div>
          <span className="text-purple-400 text-2xl font-bold">
            {item.pointsCost.toLocaleString()}
          </span>
          <span className="text-slate-400 ml-1">UA</span>
        </div>
        <div className="text-slate-500 text-sm">
          {item.remaining === -1 ? '庫存：無限' : `庫存：${item.remaining} 件`}
        </div>
      </div>

      {/* 規格選擇 (如果有的話，未來擴充) */}

      {/* 點數計算 */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">你的點數</span>
          <span className="text-white">{userPoints.toLocaleString()} UA</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">兌換所需</span>
          <span className="text-purple-400">-{item.pointsCost.toLocaleString()} UA</span>
        </div>
        <div className="border-t border-slate-700/50 my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">兌換後剩餘</span>
          <span className={canAfford ? 'text-emerald-400' : 'text-red-400'}>
            {canAfford ? pointsAfter.toLocaleString() : '點數不足'} {canAfford && 'UA'}
          </span>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 兌換按鈕 */}
      <button
        onClick={onRedeem}
        disabled={!canAfford || isOutOfStock || redeeming}
        className={`
          w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2
          transition-all duration-200
          ${canAfford && !isOutOfStock
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {redeeming ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            處理中...
          </>
        ) : isOutOfStock ? (
          '已售罄'
        ) : !canAfford ? (
          <>
            <AlertCircle className="w-5 h-5" />
            點數不足，繼續努力！
          </>
        ) : (
          <>
            <Gift className="w-5 h-5" />
            確認兌換（{item.pointsCost.toLocaleString()} UA）
          </>
        )}
      </button>

      {!canAfford && !isOutOfStock && (
        <p className="text-center text-slate-500 text-xs mt-2">
          還差 {(item.pointsCost - userPoints).toLocaleString()} UA，完成任務可快速獲得點數！
        </p>
      )}
    </div>
  );
};

// 收件資訊表單
const ShippingForm: React.FC<{
  shippingInfo: ShippingInfo;
  onChange: (info: ShippingInfo) => void;
  onSubmit: () => void;
  onBack: () => void;
  redeeming: boolean;
  error: string | null;
  item: StoreItem;
  variant: string;
}> = ({ shippingInfo, onChange, onSubmit, onBack, redeeming, error, item, variant }) => {
  const isValid = shippingInfo.name && shippingInfo.phone && shippingInfo.address;

  return (
    <div className="p-4">
      <h3 className="text-white font-bold text-lg mb-1">填寫收件資訊</h3>
      <p className="text-slate-400 text-sm mb-4">
        兌換「{item.name}」{variant && ` (${variant})`}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">收件人姓名 *</label>
          <input
            type="text"
            value={shippingInfo.name}
            onChange={(e) => onChange({ ...shippingInfo, name: e.target.value })}
            placeholder="請輸入收件人姓名"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-1">手機號碼 *</label>
          <input
            type="tel"
            value={shippingInfo.phone}
            onChange={(e) => onChange({ ...shippingInfo, phone: e.target.value })}
            placeholder="如：0912345678"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-1">收件地址 *</label>
          <textarea
            value={shippingInfo.address}
            onChange={(e) => onChange({ ...shippingInfo, address: e.target.value })}
            placeholder="請輸入完整收件地址"
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={redeeming}
          className="flex-1 py-3 rounded-xl font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          返回
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid || redeeming}
          className={`
            flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2
            ${isValid
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
            disabled:opacity-70 disabled:cursor-not-allowed transition-all
          `}
        >
          {redeeming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              處理中...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              確認兌換
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// 兌換成功畫面
const SuccessView: React.FC<{
  result: { orderNumber: string; message: string; isVirtual: boolean };
  onViewOrders: () => void;
  onClose: () => void;
}> = ({ result, onViewOrders, onClose }) => {
  return (
    <div className="p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <Check className="w-10 h-10 text-emerald-400" />
      </div>

      <h3 className="text-white text-xl font-bold mb-2">{result.message}</h3>

      <p className="text-slate-400 text-sm mb-2">
        訂單編號：{result.orderNumber}
      </p>

      {!result.isVirtual && (
        <p className="text-slate-500 text-sm mb-6">
          實體商品將在 7 個工作天內寄出
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onViewOrders}
          className="flex-1 py-3 rounded-xl font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
        >
          查看訂單
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          繼續逛逛
        </button>
      </div>
    </div>
  );
};

// 訂單列表元件
const OrderList: React.FC<{
  orders: Order[];
  loading: boolean;
}> = ({ orders, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Package className="w-12 h-12 mb-3 opacity-50" />
        <p>還沒有兌換紀錄</p>
        <p className="text-sm text-slate-500">快去商城看看有什麼好康！</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

        return (
          <div
            key={order.id}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex gap-3">
              {/* 商品圖片 */}
              <div className="w-16 h-16 bg-slate-700/50 rounded-lg overflow-hidden flex-shrink-0">
                {order.itemImage ? (
                  <img
                    src={order.itemImage}
                    alt={order.itemName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🎁
                  </div>
                )}
              </div>

              {/* 訂單資訊 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {order.itemName}
                  {order.variant && <span className="text-slate-400"> ({order.variant})</span>}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`
                    inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                    text-${status.color}-400 bg-${status.color}-500/20
                  `}>
                    {status.icon}
                    {status.label}
                  </span>

                  {order.trackingNumber && (
                    <span className="text-xs text-slate-500">
                      追蹤號：{order.trackingNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('zh-TW')
                      : '-'}
                  </span>
                  <span className="text-purple-400">-{order.pointsCost.toLocaleString()} UA</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StoreModal;
