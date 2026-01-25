import { BlogArticle } from '../types';

export const article: BlogArticle = {
  id: '39',
  slug: 'labor-insurance-pension-lump-sum-vs-annuity-2026',
  title: '勞保年金 vs 一次領：2026 年怎麼選最划算？完整試算',
  excerpt: '勞保老年給付該選年金還是一次領？這個決定影響你退休後幾百萬的差異。用數據告訴你怎麼選。',
  category: 'retirement',
  tags: ['勞保年金', '勞保一次領', '老年給付', '退休規劃', '勞保試算'],
  readTime: 7,
  publishDate: '2026-01-22',
  author: 'Ultra Advisor',
  featured: false,
  metaTitle: '勞保年金 vs 一次領｜2026 完整試算教你怎麼選最划算',
  metaDescription: '勞保老年給付選年金還是一次領？完整試算比較、損益平衡點分析、各情境建議。看完這篇就知道怎麼選。',
  content: `
<p class="text-xl text-slate-300 mb-8">
「勞保年金」和「一次領」到底選哪個？<br>
這個問題困擾著每個即將退休的人。<br>
<strong class="text-white">選錯了，可能差好幾百萬。</strong>
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">先搞懂：兩種領法的差別</h2>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<table class="w-full text-slate-300">
<thead>
<tr class="border-b border-slate-600">
  <th class="text-left py-3 text-white">項目</th>
  <th class="text-left py-3 text-white">一次領（老年一次金）</th>
  <th class="text-left py-3 text-white">月領（老年年金）</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-slate-700">
  <td class="py-3">領取方式</td>
  <td class="py-3">退休時一次領完</td>
  <td class="py-3">每月領到過世</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">計算方式</td>
  <td class="py-3">平均投保薪資 × 年資 × 1個月</td>
  <td class="py-3">平均投保薪資 × 年資 × 1.55%</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">資格</td>
  <td class="py-3">年資滿 15 年</td>
  <td class="py-3">年資滿 15 年且年滿 65 歲</td>
</tr>
<tr>
  <td class="py-3">通膨調整</td>
  <td class="py-3">無</td>
  <td class="py-3">CPI 累計 ≥5% 時調整</td>
</tr>
</tbody>
</table>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">實際試算：以月投保薪資 45,800 元、年資 30 年為例</h2>

<h3 class="text-xl font-bold text-white mt-8 mb-4">選擇一：一次領</h3>

<div class="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 my-6">
<p class="text-blue-200 mb-2"><strong>計算公式：</strong></p>
<p class="text-slate-300 mb-0">
45,800 × 30 年 × 1 個月 = <strong class="text-white text-xl">1,374,000 元</strong>
</p>
</div>

<h3 class="text-xl font-bold text-white mt-8 mb-4">選擇二：月領年金</h3>

<div class="bg-green-900/20 border border-green-700/50 rounded-xl p-4 my-6">
<p class="text-green-200 mb-2"><strong>計算公式：</strong></p>
<p class="text-slate-300 mb-0">
45,800 × 30 年 × 1.55% = <strong class="text-white text-xl">每月 21,297 元</strong>
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">關鍵問題：幾年回本？</h2>

<p class="text-slate-300 mb-6">
一次領可以拿到 137.4 萬，月領每月拿 21,297 元。<br>
<strong class="text-white">損益平衡點 = 1,374,000 ÷ 21,297 = 64.5 個月 ≈ 5.4 年</strong>
</p>

<div class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6 my-8">
<p class="text-white font-bold mb-2">白話文</p>
<p class="text-slate-300 mb-0">
如果你 65 歲退休選月領，<strong class="text-white">活超過 70.4 歲就賺到了</strong>。<br>
台灣平均壽命 80+ 歲，選月領的人平均多領 10 年以上。
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">累積領取金額比較</h2>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
<table class="w-full text-slate-300">
<thead>
<tr class="border-b border-slate-600">
  <th class="text-left py-3 text-white">領取年數</th>
  <th class="text-right py-3 text-white">一次領</th>
  <th class="text-right py-3 text-white">月領累計</th>
  <th class="text-right py-3 text-white">月領多/少</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-slate-700">
  <td class="py-3">5 年（70 歲）</td>
  <td class="py-3 text-right">137.4 萬</td>
  <td class="py-3 text-right">127.8 萬</td>
  <td class="py-3 text-right text-blue-400">-9.6 萬</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">10 年（75 歲）</td>
  <td class="py-3 text-right">137.4 萬</td>
  <td class="py-3 text-right">255.6 萬</td>
  <td class="py-3 text-right text-green-400">+118.2 萬</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">15 年（80 歲）</td>
  <td class="py-3 text-right">137.4 萬</td>
  <td class="py-3 text-right">383.3 萬</td>
  <td class="py-3 text-right text-green-400">+245.9 萬</td>
</tr>
<tr class="border-b border-slate-700">
  <td class="py-3">20 年（85 歲）</td>
  <td class="py-3 text-right">137.4 萬</td>
  <td class="py-3 text-right">511.1 萬</td>
  <td class="py-3 text-right text-green-400">+373.7 萬</td>
</tr>
<tr>
  <td class="py-3">25 年（90 歲）</td>
  <td class="py-3 text-right">137.4 萬</td>
  <td class="py-3 text-right">638.9 萬</td>
  <td class="py-3 text-right text-green-400">+501.5 萬</td>
</tr>
</tbody>
</table>
</div>

<p class="text-slate-300 mb-6">
<strong class="text-white">活到 85 歲，月領比一次領多拿 373.7 萬。</strong><br>
這還沒算通膨調整，實際差距可能更大。
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">什麼情況該選一次領？</h2>

<p class="text-slate-300 mb-6">
雖然數據上月領比較划算，但這些情況可以考慮一次領：
</p>

<ul class="text-slate-300 mb-6 space-y-3">
<li><strong class="text-white">1. 健康狀況不佳</strong>：如果有重大疾病，預期壽命較短</li>
<li><strong class="text-white">2. 有更好的投資機會</strong>：一次領去投資年報酬 6% 以上（但有風險）</li>
<li><strong class="text-white">3. 急需用錢</strong>：需要一大筆錢還債、買房、創業</li>
<li><strong class="text-white">4. 擔心勞保破產</strong>：雖然政府會撥補，但心理因素也要考量</li>
</ul>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">什麼情況該選月領年金？</h2>

<ul class="text-slate-300 mb-6 space-y-3">
<li><strong class="text-white">1. 身體健康</strong>：家族有長壽基因，自己也健康</li>
<li><strong class="text-white">2. 不善理財</strong>：擔心一次領會花光或被騙</li>
<li><strong class="text-white">3. 需要穩定現金流</strong>：每月有固定收入比較安心</li>
<li><strong class="text-white">4. 有其他退休金來源</strong>：勞退、儲蓄、投資等，不缺這筆一次金</li>
</ul>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">勞保年金的隱藏優勢</h2>

<h3 class="text-xl font-bold text-white mt-8 mb-4">1. 通膨調整機制</h3>
<p class="text-slate-300 mb-6">
當消費者物價指數（CPI）累計成長 ≥5%，年金會跟著調整。<br>
一次領拿到手後，購買力只會逐年下降。
</p>

<h3 class="text-xl font-bold text-white mt-8 mb-4">2. 遺屬年金</h3>
<p class="text-slate-300 mb-6">
如果領年金期間過世，符合資格的遺屬可以繼續領（原年金的 50%～100%）。<br>
一次領走就沒有這個保障。
</p>

<h3 class="text-xl font-bold text-white mt-8 mb-4">3. 展延年金加成</h3>
<p class="text-slate-300 mb-6">
如果延後請領，每延後 1 年增給 4%，最多增給 20%。<br>
65 歲可以領，選擇 70 歲才領，年金會多 20%。
</p>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">常見迷思破解</h2>

<div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 my-6">
<p class="text-amber-200 font-bold mb-2">迷思：勞保快破產了，趕快領一領比較安全？</p>
<p class="text-slate-300 mb-0">
<strong class="text-white">事實：</strong>勞保基金確實有財務壓力，但政府已明確表示會撥補。2026 年預算撥補 1500 億。年金制度可能改革（例如調降給付率），但不會「領不到」。
</p>
</div>

<div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 my-6">
<p class="text-amber-200 font-bold mb-2">迷思：一次領拿去投資報酬更高？</p>
<p class="text-slate-300 mb-0">
<strong class="text-white">事實：</strong>要打敗月領年金，一次領的投資報酬率要達到 6%～8%。考慮到退休後風險承受度降低，真的能穩定達到這個報酬率嗎？
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">一句話結論</h2>

<div class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6 my-8">
<p class="text-slate-300 mb-0">
<strong class="text-white text-lg">身體健康、不急用錢 → 選月領年金</strong><br>
<strong class="text-white text-lg">健康有疑慮、需要資金 → 考慮一次領</strong><br><br>
大多數人選月領年金會比較划算。<br>
但這是個人化的決定，沒有標準答案。
</p>
</div>

<h2 class="text-2xl font-bold text-white mt-12 mb-6">下一步行動</h2>

<ol class="text-slate-300 mb-6 space-y-2 list-decimal list-inside">
<li><strong class="text-white">查詢你的勞保年資</strong>：勞保局 e 化服務系統</li>
<li><strong class="text-white">試算你的給付金額</strong>：勞保局官網有試算工具</li>
<li><strong class="text-white">評估你的健康狀況</strong>：誠實面對</li>
<li><strong class="text-white">計算你的退休缺口</strong>：勞保只是一部分，還要考慮勞退和其他來源</li>
</ol>

<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
  <h4 class="text-white font-bold mb-4">📚 延伸閱讀</h4>
  <ul class="text-slate-300 mb-0 space-y-2">
    <li>→ <a href="/blog/labor-insurance-pension-2026" class="text-blue-400 hover:underline">2026 勞保勞退給付速算</a></li>
    <li>→ <a href="/blog/retirement-planning-basics" class="text-blue-400 hover:underline">退休規劃入門：如何計算退休金缺口</a></li>
    <li>→ <a href="/blog/reverse-mortgage-vs-professional-planning-2026" class="text-blue-400 hover:underline">以房養老該去銀行辦嗎？</a></li>
  </ul>
</div>
`
};
