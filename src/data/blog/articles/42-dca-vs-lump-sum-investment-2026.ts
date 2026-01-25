import { BlogArticle } from '../types';

export const article: BlogArticle = {
  id: '42',
  slug: 'dca-vs-lump-sum-investment-2026',
  title: '定期定額 vs 單筆投入：哪個賺更多？數據實測',
  excerpt: '存到一筆錢該一次投入，還是分批定期定額？用歷史數據告訴你真相。',
  category: 'investment',
  tags: ['定期定額', '單筆投資', 'DCA', '投資策略', 'ETF'],
  readTime: 6,
  publishDate: '2026-01-22',
  author: 'Ultra Advisor',
  featured: false,
  metaTitle: '定期定額 vs 單筆投入｜哪個賺更多？歷史數據實測',
  metaDescription: '定期定額和單筆投入哪個報酬率更高？用台股、美股歷史數據實測比較，教你選擇最適合的投資方式。',
  content: `
<p class="text-xl text-slate-300 mb-8">
手上有 100 萬，該一次投入還是分 12 個月定期定額？<br>
這個問題困擾著每個投資人。<br>
<strong class="text-white">答案可能跟你想的不一樣。</strong>
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">先搞懂：兩種策略的差別</h2>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<table class="w-full text-slate-300">
<thead>
<tr class="border-b border-slate-600">
  <th class="text-left py-3 text-white">策略</th>
  <th class="text-left py-3 text-white">單筆投入</th>
  <th class="text-left py-3 text-white">定期定額</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-slate-700">
  <td class="py-3">做法</td>
  <td class="py-3">一次把錢全部投入</td>
  <td class="py-3">分批每月固定金額投入</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">資金曝險</td>
  <td class="py-3">100% 立即曝險</td>
  <td class="py-3">逐步增加曝險</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">心理壓力</td>
  <td class="py-3">高（怕買在高點）</td>
  <td class="py-3">低（分散買點）</td>
</tr>
<tr>
  <td class="py-3">適合情境</td>
  <td class="py-3">有一筆錢要投資</td>
  <td class="py-3">每月有固定收入</td>
</tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">歷史數據怎麼說？</h2>

<p class="text-slate-300 mb-6">
Vanguard 曾做過一項研究，比較美國、英國、澳洲三個市場，橫跨 1976～2012 年的數據：
</p>

<div class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6 my-8">
<p class="text-white font-bold mb-2">研究結論</p>
<p class="text-slate-300 mb-0">
<strong class="text-white text-xl">單筆投入勝出的機率：約 66%</strong><br><br>
也就是說，大約 2/3 的時間，單筆投入的報酬會比定期定額好。
</p>
</div>

<h3 class="text-xl font-bold text-white mt-8 mb-4">為什麼單筆投入通常較優？</h3>

<p class="text-slate-300 mb-6">
原因很簡單：<strong class="text-white">市場長期向上</strong>。
</p>

<ul class="text-slate-300 mb-6 space-y-2">
<li>• 單筆投入：資金 100% 參與市場上漲</li>
<li>• 定期定額：部分資金閒置，錯過上漲機會</li>
</ul>

<p class="text-slate-300 mb-6">
假設市場一年上漲 10%：
</p>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<table class="w-full text-slate-300">
<thead>
<tr class="border-b border-slate-600">
  <th class="text-left py-3 text-white">策略</th>
  <th class="text-right py-3 text-white">年初投入</th>
  <th class="text-right py-3 text-white">平均曝險時間</th>
  <th class="text-right py-3 text-white">年末價值</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-slate-700">
  <td class="py-3">單筆 100 萬</td>
  <td class="py-3 text-right">100 萬</td>
  <td class="py-3 text-right">12 個月</td>
  <td class="py-3 text-right text-green-400">110 萬</td>
</tr>
<tr>
  <td class="py-3">定期定額 100 萬</td>
  <td class="py-3 text-right">每月 8.3 萬</td>
  <td class="py-3 text-right">約 6.5 個月</td>
  <td class="py-3 text-right">105.4 萬</td>
</tr>
</tbody>
</table>
</div>

<p class="text-slate-300 mb-6">
單筆投入多賺 <strong class="text-white">4.6 萬</strong>，差距約 4.3%。
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">那定期定額什麼時候贏？</h2>

<p class="text-slate-300 mb-6">
定期定額在<strong class="text-white">市場下跌或震盪</strong>時表現較好。
</p>

<h3 class="text-xl font-bold text-white mt-8 mb-4">情境：市場先跌 20% 再漲回原點</h3>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<ul class="text-slate-300 mb-0 space-y-2">
<li>• <strong class="text-white">單筆投入</strong>：100 萬 → 80 萬 → 100 萬（報酬 0%）</li>
<li>• <strong class="text-white">定期定額</strong>：在低點買到更多單位，最終可能賺 5%～10%</li>
</ul>
</div>

<p class="text-slate-300 mb-6">
這就是定期定額的「<strong class="text-white">攤平成本</strong>」效果：<br>
跌的時候買更多，漲回來時賺更多。
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">台股實測：0050 歷史回測</h2>

<p class="text-slate-300 mb-6">
假設 2015 年初有 120 萬要投資 0050：
</p>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<table class="w-full text-slate-300">
<thead>
<tr class="border-b border-slate-600">
  <th class="text-left py-3 text-white">策略</th>
  <th class="text-right py-3 text-white">投入方式</th>
  <th class="text-right py-3 text-white">2025 年底價值</th>
  <th class="text-right py-3 text-white">總報酬率</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-slate-700">
  <td class="py-3">單筆投入</td>
  <td class="py-3 text-right">2015/1 全部投入</td>
  <td class="py-3 text-right text-green-400">約 280 萬</td>
  <td class="py-3 text-right text-green-400">+133%</td>
</tr>
<tr>
  <td class="py-3">定期定額</td>
  <td class="py-3 text-right">每月 1 萬 × 120 個月</td>
  <td class="py-3 text-right">約 220 萬</td>
  <td class="py-3 text-right">+83%</td>
</tr>
</tbody>
</table>
</div>

<p class="text-slate-300 mb-6">
這 10 年台股大多頭，單筆投入大勝。<br>
但如果回測 2008 年金融海嘯前投入，結果會不同。
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">實際建議：根據你的情況選擇</h2>

<h3 class="text-xl font-bold text-white mt-8 mb-4">選單筆投入的情況</h3>

<div class="bg-green-900/20 border border-green-700/50 rounded-xl p-4 my-6">
<ul class="text-slate-300 mb-0 space-y-2">
<li>✓ 你有<strong class="text-white">長期投資</strong>的心理準備（5 年以上）</li>
<li>✓ 你能<strong class="text-white">承受短期波動</strong>，不會恐慌賣出</li>
<li>✓ 你相信<strong class="text-white">市場長期向上</strong></li>
<li>✓ 你有一筆閒錢，<strong class="text-white">不急用</strong></li>
</ul>
</div>

<h3 class="text-xl font-bold text-white mt-8 mb-4">選定期定額的情況</h3>

<div class="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 my-6">
<ul class="text-slate-300 mb-0 space-y-2">
<li>✓ 你<strong class="text-white">怕買在高點</strong>，心理壓力大</li>
<li>✓ 你是<strong class="text-white">投資新手</strong>，還在學習</li>
<li>✓ 你<strong class="text-white">每月有固定收入</strong>，適合持續投入</li>
<li>✓ 你想要<strong class="text-white">養成投資習慣</strong></li>
</ul>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">折衷方案：分批投入</h2>

<p class="text-slate-300 mb-6">
如果你既想把握市場上漲，又怕買在高點，可以考慮<strong class="text-white">分 3～6 次投入</strong>：
</p>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<p class="text-slate-300 mb-2"><strong class="text-white">100 萬分 3 次投入的做法：</strong></p>
<ul class="text-slate-300 mb-0 space-y-2">
<li>• 第 1 個月：投入 33 萬</li>
<li>• 第 2 個月：投入 33 萬</li>
<li>• 第 3 個月：投入 34 萬</li>
</ul>
</div>

<p class="text-slate-300 mb-6">
這樣既不會錯過太多上漲機會，也不會全部買在高點。<br>
<strong class="text-white">心理上比較好接受。</strong>
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">常見迷思破解</h2>

<div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 my-6">
<p class="text-amber-200 font-bold mb-2">迷思：定期定額一定比較安全？</p>
<p class="text-slate-300 mb-0">
<strong class="text-white">事實：</strong>定期定額降低的是「買在高點」的風險，但如果市場長期下跌，兩種方式都會虧。安全與否取決於投資標的，不是投入方式。
</p>
</div>

<div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 my-6">
<p class="text-amber-200 font-bold mb-2">迷思：現在大盤在高點，應該定期定額？</p>
<p class="text-slate-300 mb-0">
<strong class="text-white">事實：</strong>沒有人能準確判斷高點低點。歷史上每次「看起來的高點」，後來都變成低點。與其猜測，不如堅持紀律。
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">一句話結論</h2>

<div class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6 my-8">
<p class="text-slate-300 mb-0">
<strong class="text-white text-lg">數據上：單筆投入報酬通常較高</strong><br>
<strong class="text-white text-lg">心理上：定期定額比較好執行</strong><br><br>
最好的策略是<strong class="text-white">你能堅持到底的策略</strong>。<br>
如果單筆投入會讓你睡不著覺，那定期定額對你更好。
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">下一步行動</h2>

<ol class="text-slate-300 mb-6 space-y-2 list-decimal list-inside">
<li><strong class="text-white">評估你的風險承受度</strong>：跌 20% 你會恐慌賣出嗎？</li>
<li><strong class="text-white">決定投資標的</strong>：大盤 ETF 比個股更適合這兩種策略</li>
<li><strong class="text-white">選擇你能堅持的方式</strong>：紀律比報酬率更重要</li>
<li><strong class="text-white">設定自動扣款</strong>：減少人為干擾</li>
</ol>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
  <h4 class="text-white font-bold mb-4">📚 延伸閱讀</h4>
  <ul class="text-slate-300 mb-0 space-y-2">
    <li>→ <a href="/blog/compound-interest-power" class="text-blue-400 hover:underline">複利的威力：讓時間成為你的朋友</a></li>
    <li>→ <a href="/blog/high-dividend-etf-calendar-2026" class="text-blue-400 hover:underline">2026 台股高股息 ETF 配息月曆</a></li>
    <li>→ <a href="/blog/esbi-cashflow-quadrant-2026" class="text-blue-400 hover:underline">ESBI 現金流象限：四種收入來源決定你的財務命運</a></li>
  </ul>
</div>
`
};
