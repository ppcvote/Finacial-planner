/**
 * Ultra Advisor - 每日金句資料庫
 *
 * 用於「每日限時動態」功能
 * 每天根據日期 hash 選擇一句金句
 *
 * 金句風格：30-50 字財商思維，適合分享到社群
 */

export interface DailyQuote {
  text: string;
}

// 財商思維金句（30-50 字）
export const dailyQuotes: DailyQuote[] = [
  // ========== 現金流思維 ==========
  { text: "窮人買負債以為是資產，富人買資產創造現金流。差別不在收入多少，而在錢流向哪裡。" },
  { text: "薪水是用時間換錢，被動收入是用錢賺錢。真正的財務自由，是讓錢為你工作。" },
  { text: "月薪 10 萬但月光，不如月薪 5 萬但每月存下 2 萬。財富是留下來的，不是賺來的。" },
  { text: "大多數人一輩子在追求更高的薪水，卻從不思考如何讓錢自己長大。這就是窮忙的原因。" },
  { text: "財務自由不是賺很多錢，而是被動收入大於生活支出。達到這個門檻，你就自由了。" },
  { text: "先支付自己，再支付帳單。這個簡單的順序改變，是富人和窮人最大的差別。" },
  { text: "你的收入有天花板，但你的資產沒有。停止追求更高薪水，開始累積能增值的資產。" },
  { text: "一份工作只能給你一份收入，但一個系統可以給你無限收入。建立系統，而不是找工作。" },

  // ========== 複利思維 ==========
  { text: "複利的威力不在報酬率，而在時間。早開始 10 年，勝過晚開始卻投入 2 倍本金。" },
  { text: "每月投入 5000 元，年化 7%，30 年後是 600 萬。複利不是魔法，是紀律加時間。" },
  { text: "愛因斯坦說複利是世界第八大奇蹟。理解的人賺取它，不理解的人支付它。你是哪一種？" },
  { text: "25 歲開始每月存 5000，比 35 歲開始每月存 10000 還多。時間是複利最強的催化劑。" },
  { text: "複利有兩種：讓你的錢翻倍，或讓你的債務翻倍。信用卡循環利息就是負向複利。" },
  { text: "股神巴菲特 99% 的財富是 50 歲後才累積的。複利的爆發力，需要時間醞釀。" },
  { text: "每天進步 1%，一年後你會強 37 倍。複利不只適用於金錢，也適用於能力和人脈。" },
  { text: "通膨也是複利，每年 3% 的通膨，24 年後你的錢只剩一半購買力。不投資就是慢性虧損。" },

  // ========== 風險思維 ==========
  { text: "投資最大的風險不是虧錢，是你不知道自己在做什麼。無知才是真正的風險。" },
  { text: "分散投資不是買很多標的，是買不相關的標的。全部買科技股不叫分散，叫集中。" },
  { text: "意外和明天，你不知道哪個先來。保險不是消費，是給家人的一份承諾。" },
  { text: "股市短期是投票機，長期是秤重機。恐慌時賣出，你就把投票權交給了情緒。" },
  { text: "別人恐懼時貪婪，別人貪婪時恐懼。聽起來簡單，但 99% 的人做不到。" },
  { text: "投資第一條規則：不要虧錢。第二條規則：記住第一條。本金沒了，複利也沒用。" },
  { text: "風險管理的第一步是承認風險存在。自以為穩賺不賠的人，往往賠得最慘。" },
  { text: "高報酬必然伴隨高風險。如果有人告訴你低風險高報酬，他不是在騙你，就是他自己也被騙了。" },

  // ========== 稅務思維 ==========
  { text: "合法節稅是你的權利，不是逃稅。不懂稅法的人，多繳的稅可能比投資虧的還多。" },
  { text: "遺產稅最高 20%，贈與稅每年有 244 萬免稅額。及早規劃，可以省下一棟房子。" },
  { text: "買保險不是為了理賠，是為了稅務效率和資產保全。這是富人都知道的秘密。" },
  { text: "年收入 100 萬和 500 萬，稅率差了 2 倍以上。收入越高，稅務規劃越重要。" },
  { text: "股票賺錢要繳稅，但有些方式可以延後或減少。不是逃稅，是運用規則。" },
  { text: "退休金領取方式不同，稅負也不同。多想一步，多領幾十萬。這就是財商的價值。" },
  { text: "很多人一輩子努力賺錢，卻在傳承時被政府分走一大塊。提早規劃，才是完整的理財。" },
  { text: "稅是賺錢最大的成本之一。認真學稅法的人，會發現原來錢可以少繳這麼多。" },

  // ========== 消費思維 ==========
  { text: "買東西前問自己：這是需要還是想要？一個簡單的問題，可以省下一半的開銷。" },
  { text: "信用卡分期 12 期，年利率其實是 14.8%，不是 0%。免利率只是話術。" },
  { text: "如果你買不起兩個，你就買不起一個。用現金能買得起的東西，才是你真正買得起的。" },
  { text: "拿鐵因子：每天一杯 150 元的咖啡，30 年是 164 萬。小錢不小，習慣會吃掉你的財富。" },
  { text: "富人買資產，窮人買負債，中產階級買以為是資產的負債。你買的車是哪一種？" },
  { text: "最好的投資往往不是買什麼，而是不買什麼。克制慾望也是一種財商。" },
  { text: "奢侈品讓你看起來有錢，資產讓你真的有錢。選擇展示財富，還是累積財富？" },
  { text: "延遲享樂不是不享樂，是先讓資產替你享樂。等到被動收入超過支出，想買什麼都行。" },

  // ========== 投資思維 ==========
  { text: "投資最好的時機是十年前，其次是現在。與其等待完美時機，不如現在就開始。" },
  { text: "定期定額不是最佳策略，但是最能堅持的策略。能堅持的策略，就是最好的策略。" },
  { text: "追高殺低是人性，但違反人性才能賺錢。投資賺的不是聰明錢，是紀律錢。" },
  { text: "如果你不願意持有一支股票十年，就不要考慮持有十分鐘。頻繁交易只會貢獻手續費。" },
  { text: "預測市場的人很多，預測對的人很少。與其猜測，不如長期持有好資產。" },
  { text: "投資不是比誰賺得多，是比誰活得久。留在市場裡，時間會獎勵你。" },
  { text: "價格是你付出的，價值是你得到的。便宜的東西可能很貴，貴的東西可能很便宜。" },
  { text: "分散投資是承認自己不知道哪個會漲。這不是弱點，是智慧。" },

  // ========== 退休思維 ==========
  { text: "勞保 + 勞退只能替代 40% 的薪水。如果退休想維持生活品質，剩下的 60% 要自己準備。" },
  { text: "退休規劃最大的敵人不是報酬率，是通膨。現在的 1000 萬，30 年後只剩一半購買力。" },
  { text: "60 歲退休活到 90 歲，要準備 30 年的生活費。長壽不是福氣，是風險。要準備好。" },
  { text: "退休金準備越早開始，每月壓力越小。30 歲開始和 40 歲開始，每月金額差一倍。" },
  { text: "退休不是終點，是人生另一個階段。你想要什麼樣的退休生活，現在就要開始規劃。" },
  { text: "靠政府不如靠自己。勞保可能破產，但你自己存的錢不會背叛你。" },
  { text: "很多人退休後最後悔的事，是沒有早點開始存錢。時間是站在年輕人這邊的。" },
  { text: "退休金不是存多少的問題，是能花多久的問題。計算清楚，才能安心退休。" },

  // ========== 心態思維 ==========
  { text: "財務自由的第一步不是賺更多錢，是改變對錢的看法。心態對了，錢就來了。" },
  { text: "窮人說「我買不起」，富人問「我怎麼買得起」。一個放棄思考，一個開始思考。" },
  { text: "學校教你成為好員工，但沒教你成為老闆或投資人。財商要靠自己學。" },
  { text: "大多數人終其一生在解決錢的問題，卻從不花時間學習錢的知識。這就是問題所在。" },
  { text: "有錢人和你想的不一樣。他們買資產，你買負債；他們投資自己，你投資娛樂。" },
  { text: "財商高的人不一定收入高，但一定存得下錢。因為他們知道錢該流向哪裡。" },
  { text: "抱怨薪水太低的時間，拿來學習投資理財，幾年後結果會完全不同。" },
  { text: "很多人工作幾十年還是月光，不是賺太少，是財商太低。這是可以改變的。" },
];

// 底圖配置（使用 Unsplash 風景照，灰階處理）
// 圖片會在元件中套用 grayscale filter
// 共 90 張背景圖，確保每天都有不同的視覺體驗
export const storyBackgrounds = [
  // ========== 山脈系列 (1-15) ==========
  { id: 1, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 2, imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 3, imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 4, imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 5, imageUrl: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 6, imageUrl: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 7, imageUrl: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 8, imageUrl: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 9, imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 10, imageUrl: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 11, imageUrl: "https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 12, imageUrl: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 13, imageUrl: "https://images.unsplash.com/photo-1445363692815-ebcd599f7621?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 14, imageUrl: "https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 15, imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },

  // ========== 海洋系列 (16-30) ==========
  { id: 16, imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 17, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 18, imageUrl: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 19, imageUrl: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 20, imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 21, imageUrl: "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 22, imageUrl: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 23, imageUrl: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 24, imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 25, imageUrl: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 26, imageUrl: "https://images.unsplash.com/photo-1489914099268-1dad649f76bf?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 27, imageUrl: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 28, imageUrl: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 29, imageUrl: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 30, imageUrl: "https://images.unsplash.com/photo-1494791368093-85217fbbf8de?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },

  // ========== 森林系列 (31-45) ==========
  { id: 31, imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 32, imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 33, imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 34, imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 35, imageUrl: "https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 36, imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 37, imageUrl: "https://images.unsplash.com/photo-1440581572325-0bea30075d9d?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 38, imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c036bc8ce3?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 39, imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 40, imageUrl: "https://images.unsplash.com/photo-1503435824048-a799a3a84bf7?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 41, imageUrl: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 42, imageUrl: "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 43, imageUrl: "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 44, imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80", fallbackGradient: "from-gray-900 via-slate-800 to-gray-800" },
  { id: 45, imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },

  // ========== 沙漠 & 日落系列 (46-55) ==========
  { id: 46, imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },
  { id: 47, imageUrl: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },
  { id: 48, imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 49, imageUrl: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },
  { id: 50, imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 51, imageUrl: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },
  { id: 52, imageUrl: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 53, imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },
  { id: 54, imageUrl: "https://images.unsplash.com/photo-1506259091721-347e791bab0f?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 55, imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", fallbackGradient: "from-zinc-900 via-stone-800 to-zinc-800" },

  // ========== 湖泊 & 河流系列 (56-65) ==========
  { id: 56, imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 57, imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 58, imageUrl: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 59, imageUrl: "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 60, imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 61, imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 62, imageUrl: "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 63, imageUrl: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },
  { id: 64, imageUrl: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80", fallbackGradient: "from-slate-800 via-gray-800 to-slate-900" },
  { id: 65, imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", fallbackGradient: "from-slate-900 via-zinc-800 to-slate-800" },

  // ========== 雲 & 天空系列 (66-75) ==========
  { id: 66, imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },
  { id: 67, imageUrl: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },
  { id: 68, imageUrl: "https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 69, imageUrl: "https://images.unsplash.com/photo-1463947628408-f8581a2f4aca?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },
  { id: 70, imageUrl: "https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 71, imageUrl: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },
  { id: 72, imageUrl: "https://images.unsplash.com/photo-1517495306984-f84210f9daa8?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 73, imageUrl: "https://images.unsplash.com/photo-1498496294664-d9372eb521f3?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },
  { id: 74, imageUrl: "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=800&q=80", fallbackGradient: "from-slate-900 via-slate-800 to-zinc-900" },
  { id: 75, imageUrl: "https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=800&q=80", fallbackGradient: "from-gray-800 via-slate-900 to-gray-900" },

  // ========== 星空 & 夜景系列 (76-90) ==========
  { id: 76, imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 77, imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 78, imageUrl: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 79, imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 80, imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 81, imageUrl: "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 82, imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 83, imageUrl: "https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 84, imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 85, imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 86, imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 87, imageUrl: "https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 88, imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
  { id: 89, imageUrl: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&q=80", fallbackGradient: "from-slate-950 via-gray-900 to-slate-900" },
  { id: 90, imageUrl: "https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=800&q=80", fallbackGradient: "from-slate-950 via-slate-900 to-gray-900" },
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

/**
 * 隨機取得一句金句
 */
export const getRandomQuote = (): DailyQuote => {
  const index = Math.floor(Math.random() * dailyQuotes.length);
  return dailyQuotes[index];
};

/**
 * 隨機取得一張底圖
 */
export const getRandomBackground = () => {
  const index = Math.floor(Math.random() * storyBackgrounds.length);
  return storyBackgrounds[index];
};

// ==========================================
// IG 風格專用文案（標題 + 分段內文）
// ==========================================
export interface IGStyleQuote {
  title: string;      // 黃色大標題
  lines: string[];    // 白色分段內文
}

export const igStyleQuotes: IGStyleQuote[] = [
  // ========== 最低標準思維 ==========
  {
    title: "你的人生，其實一直在用『最低標準』過日子",
    lines: [
      "你有沒有發現",
      "你的人生",
      "好像一直都在「剛剛好就好」",
      "不求更好",
      "只求不要出事"
    ]
  },
  {
    title: "為什麼你總是『差一點』就成功？",
    lines: [
      "差一點存到錢",
      "差一點升遷",
      "差一點達標",
      "因為你的目標",
      "一直都是『差不多就好』"
    ]
  },
  // ========== 現金流思維 ==========
  {
    title: "窮人和富人的差別，只有一個",
    lines: [
      "窮人買負債以為是資產",
      "富人買資產創造現金流",
      "差別不在收入多少",
      "而在錢流向哪裡"
    ]
  },
  {
    title: "為什麼月薪十萬還是月光？",
    lines: [
      "月薪 10 萬但月光",
      "不如月薪 5 萬但每月存下 2 萬",
      "財富是留下來的",
      "不是賺來的"
    ]
  },
  {
    title: "真正的財務自由，不是賺很多錢",
    lines: [
      "財務自由的定義",
      "是被動收入大於生活支出",
      "達到這個門檻",
      "你就自由了"
    ]
  },
  {
    title: "一個簡單的順序改變，讓你變有錢",
    lines: [
      "先支付自己",
      "再支付帳單",
      "這個簡單的順序改變",
      "是富人和窮人最大的差別"
    ]
  },
  // ========== 複利思維 ==========
  {
    title: "複利的威力，不在報酬率",
    lines: [
      "複利的威力不在報酬率",
      "而在時間",
      "早開始 10 年",
      "勝過晚開始卻投入 2 倍本金"
    ]
  },
  {
    title: "愛因斯坦說這是世界第八大奇蹟",
    lines: [
      "複利是世界第八大奇蹟",
      "理解的人賺取它",
      "不理解的人支付它",
      "你是哪一種？"
    ]
  },
  {
    title: "巴菲特 99% 的財富，是 50 歲後才有的",
    lines: [
      "股神巴菲特",
      "99% 的財富是 50 歲後才累積的",
      "複利的爆發力",
      "需要時間醞釀"
    ]
  },
  {
    title: "不投資，就是慢性虧損",
    lines: [
      "通膨也是複利",
      "每年 3% 的通膨",
      "24 年後你的錢",
      "只剩一半購買力"
    ]
  },
  // ========== 風險思維 ==========
  {
    title: "投資最大的風險，不是虧錢",
    lines: [
      "投資最大的風險",
      "是你不知道自己在做什麼",
      "無知",
      "才是真正的風險"
    ]
  },
  {
    title: "分散投資，你可能做錯了",
    lines: [
      "分散投資",
      "不是買很多標的",
      "是買不相關的標的",
      "全部買科技股不叫分散"
    ]
  },
  {
    title: "意外和明天，你不知道哪個先來",
    lines: [
      "意外和明天",
      "你不知道哪個先來",
      "保險不是消費",
      "是給家人的一份承諾"
    ]
  },
  {
    title: "為什麼 99% 的人做不到？",
    lines: [
      "別人恐懼時貪婪",
      "別人貪婪時恐懼",
      "聽起來簡單",
      "但 99% 的人做不到"
    ]
  },
  // ========== 退休思維 ==========
  {
    title: "勞保 + 勞退，只能替代 40% 薪水",
    lines: [
      "勞保加勞退",
      "只能替代 40% 的薪水",
      "如果退休想維持生活品質",
      "剩下的 60% 要自己準備"
    ]
  },
  {
    title: "長壽不是福氣，是風險",
    lines: [
      "60 歲退休活到 90 歲",
      "要準備 30 年的生活費",
      "長壽不是福氣",
      "是風險，要準備好"
    ]
  },
  {
    title: "靠政府不如靠自己",
    lines: [
      "勞保可能破產",
      "但你自己存的錢",
      "不會背叛你",
      "靠政府不如靠自己"
    ]
  },
  // ========== 稅務思維 ==========
  {
    title: "合法節稅是你的權利",
    lines: [
      "合法節稅是你的權利",
      "不是逃稅",
      "不懂稅法的人",
      "多繳的稅可能比投資虧的還多"
    ]
  },
  {
    title: "及早規劃，可以省下一棟房子",
    lines: [
      "遺產稅最高 20%",
      "贈與稅每年有 244 萬免稅額",
      "及早規劃",
      "可以省下一棟房子"
    ]
  },
  // ========== 消費思維 ==========
  {
    title: "一個簡單問題，省下一半開銷",
    lines: [
      "買東西前問自己",
      "這是需要還是想要？",
      "一個簡單的問題",
      "可以省下一半的開銷"
    ]
  },
  {
    title: "拿鐵因子：小錢不小",
    lines: [
      "每天一杯 150 元的咖啡",
      "30 年是 164 萬",
      "小錢不小",
      "習慣會吃掉你的財富"
    ]
  },
  {
    title: "你買的車，是資產還是負債？",
    lines: [
      "富人買資產",
      "窮人買負債",
      "中產階級買以為是資產的負債",
      "你買的車是哪一種？"
    ]
  },
  // ========== 心態思維 ==========
  {
    title: "財務自由的第一步",
    lines: [
      "財務自由的第一步",
      "不是賺更多錢",
      "是改變對錢的看法",
      "心態對了，錢就來了"
    ]
  },
  {
    title: "窮人說『我買不起』",
    lines: [
      "窮人說「我買不起」",
      "富人問「我怎麼買得起」",
      "一個放棄思考",
      "一個開始思考"
    ]
  },
  {
    title: "學校沒教你的事",
    lines: [
      "學校教你成為好員工",
      "但沒教你成為老闆或投資人",
      "財商",
      "要靠自己學"
    ]
  },
  {
    title: "抱怨薪水低的時間，拿來學投資",
    lines: [
      "抱怨薪水太低的時間",
      "拿來學習投資理財",
      "幾年後",
      "結果會完全不同"
    ]
  },
  // ========== 投資思維 ==========
  {
    title: "投資最好的時機",
    lines: [
      "投資最好的時機是十年前",
      "其次是現在",
      "與其等待完美時機",
      "不如現在就開始"
    ]
  },
  {
    title: "能堅持的策略，就是最好的策略",
    lines: [
      "定期定額不是最佳策略",
      "但是最能堅持的策略",
      "能堅持的策略",
      "就是最好的策略"
    ]
  },
  {
    title: "如果你不願意持有一支股票十年",
    lines: [
      "如果你不願意持有一支股票十年",
      "就不要考慮持有十分鐘",
      "頻繁交易",
      "只會貢獻手續費"
    ]
  },
  {
    title: "投資不是比誰賺得多",
    lines: [
      "投資不是比誰賺得多",
      "是比誰活得久",
      "留在市場裡",
      "時間會獎勵你"
    ]
  }
];

/**
 * 根據日期取得當天的 IG 風格文案
 */
export const getTodayIGQuote = (date: Date = new Date()): IGStyleQuote => {
  const dateStr = date.toISOString().split('T')[0];
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % igStyleQuotes.length;
  return igStyleQuotes[index];
};

/**
 * 隨機取得一組 IG 風格文案
 */
export const getRandomIGQuote = (): IGStyleQuote => {
  const index = Math.floor(Math.random() * igStyleQuotes.length);
  return igStyleQuotes[index];
};
