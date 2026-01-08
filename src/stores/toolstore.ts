import { create } from 'zustand';

// 定義所有工具的預設值
const defaultStates = {
  golden_safe: { mode: 'time', amount: 60000, years: 10, rate: 6, isLocked: false },
  gift: { loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 },
  estate: { loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6, existingLoanBalance: 700, existingMonthlyPayment: 38000 },
  student: { loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0, isQualified: false },
  super_active: { monthlySaving: 10000, investReturnRate: 6, activeYears: 15 },
  car: { carPrice: 100, investReturnRate: 6, resaleRate: 50, cycleYears: 5 },
  pension: { currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 },
  reservoir: { initialCapital: 1000, dividendRate: 5, reinvestRate: 8, years: 20 },
  tax: { spouse: true, children: 2, minorYearsTotal: 0, parents: 0, cash: 3000, realEstateMarket: 4000, stocks: 1000, insurancePlan: 0 },
  free_dashboard: { layout: [null, null, null, null] as (string | null)[] }
};

// 定義 Store 的類型
interface ToolState {
  // 所有工具的數據
  goldenSafeData: typeof defaultStates.golden_safe;
  giftData: typeof defaultStates.gift;
  estateData: typeof defaultStates.estate;
  studentData: typeof defaultStates.student;
  superActiveData: typeof defaultStates.super_active;
  carData: typeof defaultStates.car;
  pensionData: typeof defaultStates.pension;
  reservoirData: typeof defaultStates.reservoir;
  taxData: typeof defaultStates.tax;
  freeDashboardLayout: (string | null)[];

  // 更新函數
  updateGoldenSafe: (data: any) => void;
  updateGift: (data: any) => void;
  updateEstate: (data: any) => void;
  updateStudent: (data: any) => void;
  updateSuperActive: (data: any) => void;
  updateCar: (data: any) => void;
  updatePension: (data: any) => void;
  updateReservoir: (data: any) => void;
  updateTax: (data: any) => void;
  updateFreeDashboardLayout: (layout: (string | null)[]) => void;

  // 重置所有數據
  resetAllData: () => void;
  
  // 從 Firebase 載入數據
  loadFromFirebase: (data: any) => void;
}

// 創建 Store
export const useToolStore = create<ToolState>((set) => ({
  // 初始狀態
  goldenSafeData: defaultStates.golden_safe,
  giftData: defaultStates.gift,
  estateData: defaultStates.estate,
  studentData: defaultStates.student,
  superActiveData: defaultStates.super_active,
  carData: defaultStates.car,
  pensionData: defaultStates.pension,
  reservoirData: defaultStates.reservoir,
  taxData: defaultStates.tax,
  freeDashboardLayout: defaultStates.free_dashboard.layout,

  // 更新函數
  updateGoldenSafe: (data) => set({ goldenSafeData: data }),
  updateGift: (data) => set({ giftData: data }),
  updateEstate: (data) => set({ estateData: data }),
  updateStudent: (data) => set({ studentData: data }),
  updateSuperActive: (data) => set({ superActiveData: data }),
  updateCar: (data) => set({ carData: data }),
  updatePension: (data) => set({ pensionData: data }),
  updateReservoir: (data) => set({ reservoirData: data }),
  updateTax: (data) => set({ taxData: data }),
  updateFreeDashboardLayout: (layout) => set({ freeDashboardLayout: layout }),

  // 重置所有數據
  resetAllData: () => set({
    goldenSafeData: defaultStates.golden_safe,
    giftData: defaultStates.gift,
    estateData: defaultStates.estate,
    studentData: defaultStates.student,
    superActiveData: defaultStates.super_active,
    carData: defaultStates.car,
    pensionData: defaultStates.pension,
    reservoirData: defaultStates.reservoir,
    taxData: defaultStates.tax,
    freeDashboardLayout: defaultStates.free_dashboard.layout,
  }),

  // 從 Firebase 載入數據
  loadFromFirebase: (data) => set({
    goldenSafeData: data.goldenSafeData || defaultStates.golden_safe,
    giftData: data.giftData || defaultStates.gift,
    estateData: data.estateData || defaultStates.estate,
    studentData: data.studentData || defaultStates.student,
    superActiveData: data.superActiveData || defaultStates.super_active,
    carData: data.carData || defaultStates.car,
    pensionData: data.pensionData || defaultStates.pension,
    reservoirData: data.reservoirData || defaultStates.reservoir,
    taxData: data.taxData || defaultStates.tax,
    freeDashboardLayout: data.freeDashboardLayout || defaultStates.free_dashboard.layout,
  }),
}));