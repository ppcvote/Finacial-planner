/**
 * Ultra Advisor - 每日金句資料庫
 *
 * 用於「每日限時動態」功能
 * 每天根據日期 hash 選擇一句金句
 */

export interface DailyQuote {
  text: string;
  author?: string;
}

// 金句分類：財務智慧、投資理財、銷售心法、勵志成長
export const dailyQuotes: DailyQuote[] = [
  // ========== 財務智慧 ==========
  { text: "複利是世界第八大奇蹟，理解它的人賺取它，不理解的人支付它", author: "愛因斯坦" },
  { text: "不要把所有雞蛋放在同一個籃子裡", author: "投資格言" },
  { text: "投資自己是最好的投資", author: "班傑明·富蘭克林" },
  { text: "財富不是你賺了多少，而是你留下了多少", author: "羅伯特·乾崎" },
  { text: "風險來自於你不知道自己在做什麼", author: "巴菲特" },
  { text: "別人恐懼時我貪婪，別人貪婪時我恐懼", author: "巴菲特" },
  { text: "時間是複利最好的朋友", author: "投資格言" },
  { text: "你不理財，財不理你", author: "理財格言" },
  { text: "先支付自己，再支付其他人", author: "喬治·乾森" },
  { text: "財務自由不是擁有很多錢，而是擁有選擇的自由", author: "財務格言" },

  // ========== 投資理財 ==========
  { text: "買進的最佳時機是當街上血流成河的時候", author: "羅斯柴爾德" },
  { text: "股市短期是投票機，長期是秤重機", author: "班傑明·葛拉漢" },
  { text: "投資最重要的是控制風險，而不是追求報酬", author: "霍華·乾斯" },
  { text: "最好的投資是那些你願意持有一輩子的", author: "巴菲特" },
  { text: "分散投資是對無知的保護", author: "巴菲特" },
  { text: "投資的第一條規則是不要虧錢，第二條是記住第一條", author: "巴菲特" },
  { text: "市場可以維持非理性的時間，比你維持償付能力的時間更長", author: "凱因斯" },
  { text: "如果你不願意持有一支股票十年，就不要考慮持有十分鐘", author: "巴菲特" },
  { text: "價格是你付出的，價值是你得到的", author: "巴菲特" },
  { text: "投資不是智商160打敗智商130的遊戲", author: "巴菲特" },

  // ========== 銷售心法 ==========
  { text: "銷售的本質是幫助客戶解決問題", author: "銷售格言" },
  { text: "客戶買的不是產品，是解決方案", author: "銷售格言" },
  { text: "先建立信任，再談生意", author: "銷售格言" },
  { text: "傾聽是最好的銷售技巧", author: "銷售格言" },
  { text: "專業是最好的名片", author: "銷售格言" },
  { text: "客戶的拒絕是成交的開始", author: "銷售格言" },
  { text: "成功的銷售是讓客戶感覺到他做了最好的決定", author: "銷售格言" },
  { text: "服務做到極致，銷售自然發生", author: "銷售格言" },
  { text: "了解客戶的需求比推銷產品更重要", author: "銷售格言" },
  { text: "每一次拒絕都讓你離成功更近一步", author: "銷售格言" },

  // ========== 勵志成長 ==========
  { text: "成功不是終點，失敗也不是終結，勇氣才是最重要的", author: "邱吉爾" },
  { text: "機會是留給準備好的人", author: "路易·巴斯德" },
  { text: "今天的努力是明天的基石", author: "勵志格言" },
  { text: "不要等待完美的時機，把握當下創造時機", author: "勵志格言" },
  { text: "成功的秘訣就是每天都比昨天進步一點點", author: "勵志格言" },
  { text: "行動是治癒恐懼的良藥", author: "勵志格言" },
  { text: "你的態度決定你的高度", author: "勵志格言" },
  { text: "困難是成長的階梯", author: "勵志格言" },
  { text: "專注於你能控制的事情", author: "勵志格言" },
  { text: "每一個專家都曾經是初學者", author: "勵志格言" },

  // ========== 保險理財 ==========
  { text: "保險不是消費，是資產配置的一部分", author: "理財格言" },
  { text: "沒有人會因為買了保險而變窮", author: "保險格言" },
  { text: "保險是愛與責任的體現", author: "保險格言" },
  { text: "風險管理的第一步是承認風險的存在", author: "風險管理" },
  { text: "保障是基礎，投資是加分", author: "理財格言" },
  { text: "先保障後投資，先保命後保富", author: "理財格言" },
  { text: "意外和明天不知道哪個先來", author: "保險格言" },
  { text: "買保險就是把風險轉嫁給保險公司", author: "保險格言" },
  { text: "家庭的第一張保單應該是家庭支柱的壽險", author: "保險格言" },
  { text: "醫療險是最不該省的保障", author: "保險格言" },

  // ========== 退休規劃 ==========
  { text: "退休規劃越早開始，負擔越輕", author: "理財格言" },
  { text: "退休金是給自己的禮物，早點準備", author: "理財格言" },
  { text: "靠政府不如靠自己", author: "理財格言" },
  { text: "退休後想過什麼生活，現在就要開始準備", author: "理財格言" },
  { text: "長壽是風險，要做好準備", author: "理財格言" },
  { text: "退休規劃的三支柱：政府、雇主、自己", author: "理財格言" },
  { text: "通膨是退休金的隱形殺手", author: "理財格言" },
  { text: "現在省下的每一塊錢，退休後都會感謝自己", author: "理財格言" },
  { text: "退休不是終點，是人生另一個精彩的開始", author: "理財格言" },
  { text: "為退休存錢，就是為未來的自己投票", author: "理財格言" },

  // ========== 稅務傳承 ==========
  { text: "稅務規劃是合法的權利，不是逃稅", author: "稅務格言" },
  { text: "傳承是責任，規劃是智慧", author: "傳承格言" },
  { text: "財富傳承不只是錢，還有價值觀", author: "傳承格言" },
  { text: "早規劃、多省稅、少糾紛", author: "稅務格言" },
  { text: "贈與是活著時的傳承，遺產是離開後的傳承", author: "傳承格言" },
  { text: "好的稅務規劃可以省下一棟房子", author: "稅務格言" },
  { text: "傳承規劃要趁早，等到需要時就太晚了", author: "傳承格言" },
  { text: "資產配置要考慮稅務效率", author: "稅務格言" },
  { text: "保險是傳承最有效率的工具之一", author: "傳承格言" },
  { text: "分年贈與是最簡單的節稅方式", author: "稅務格言" },

  // ========== 心態與習慣 ==========
  { text: "習慣決定命運", author: "勵志格言" },
  { text: "自律是自由的基礎", author: "勵志格言" },
  { text: "成功是一種習慣，失敗也是", author: "勵志格言" },
  { text: "你的習慣造就了你", author: "勵志格言" },
  { text: "改變從小事開始", author: "勵志格言" },
  { text: "堅持是成功的關鍵", author: "勵志格言" },
  { text: "每天進步1%，一年後你會進步37倍", author: "勵志格言" },
  { text: "紀律是成功的橋樑", author: "勵志格言" },
  { text: "你的時間花在哪裡，成就就在哪裡", author: "勵志格言" },
  { text: "專注於過程，結果自然會來", author: "勵志格言" },

  // ========== 客戶關係 ==========
  { text: "客戶不是交易對象，是長期夥伴", author: "服務格言" },
  { text: "超越客戶期待是最好的行銷", author: "服務格言" },
  { text: "一個滿意的客戶會帶來十個新客戶", author: "服務格言" },
  { text: "用心服務，客戶感受得到", author: "服務格言" },
  { text: "信任是最珍貴的資產", author: "服務格言" },
  { text: "專業贏得尊重，服務贏得客戶", author: "服務格言" },
  { text: "傾聽客戶的需求，而不是急著推銷", author: "服務格言" },
  { text: "客戶的成功就是我們的成功", author: "服務格言" },
  { text: "售後服務比售前更重要", author: "服務格言" },
  { text: "把客戶當家人對待", author: "服務格言" },

  // ========== 財商教育 ==========
  { text: "財商比智商更重要", author: "羅伯特·乾崎" },
  { text: "學校教你賺錢，卻沒教你理財", author: "財商格言" },
  { text: "窮人為錢工作，富人讓錢為他工作", author: "羅伯特·乾崎" },
  { text: "資產是把錢放進你口袋的東西", author: "羅伯特·乾崎" },
  { text: "負債是把錢從你口袋拿走的東西", author: "羅伯特·乾崎" },
  { text: "現金流比存款更重要", author: "財商格言" },
  { text: "財務知識是一輩子的投資", author: "財商格言" },
  { text: "不要用時間換錢，要用錢買時間", author: "財商格言" },
  { text: "被動收入是財務自由的關鍵", author: "財商格言" },
  { text: "增加收入來源比省錢更重要", author: "財商格言" },
];

// 底圖配置（使用漸層色，不需要實際圖片檔案）
export const storyBackgrounds = [
  { id: 1, gradient: "from-blue-900 via-blue-800 to-indigo-900", accent: "blue" },
  { id: 2, gradient: "from-purple-900 via-purple-800 to-pink-900", accent: "purple" },
  { id: 3, gradient: "from-emerald-900 via-teal-800 to-cyan-900", accent: "emerald" },
  { id: 4, gradient: "from-amber-900 via-orange-800 to-red-900", accent: "amber" },
  { id: 5, gradient: "from-slate-900 via-slate-800 to-zinc-900", accent: "slate" },
  { id: 6, gradient: "from-rose-900 via-pink-800 to-fuchsia-900", accent: "rose" },
  { id: 7, gradient: "from-cyan-900 via-sky-800 to-blue-900", accent: "cyan" },
];

/**
 * 根據日期取得當天的金句
 * 使用日期 hash 確保全平台同步
 */
export const getTodayQuote = (date: Date = new Date()): DailyQuote => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % dailyQuotes.length;
  return dailyQuotes[index];
};

/**
 * 根據日期取得當天的底圖
 */
export const getTodayBackground = (date: Date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % storyBackgrounds.length;
  return storyBackgrounds[index];
};

/**
 * 格式化日期為中文格式
 */
export const formatDateChinese = (date: Date = new Date()): string => {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};
