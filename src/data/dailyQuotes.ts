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
  },
  // ========== 房貸思維 ==========
  {
    title: "房貸不是負擔，是槓桿",
    lines: [
      "有錢人借錢買資產",
      "窮人存錢買負債",
      "房貸是銀行給你的",
      "最便宜的資金"
    ]
  },
  {
    title: "提前還房貸，真的划算嗎？",
    lines: [
      "房貸利率 2%",
      "投資報酬率 7%",
      "提前還款",
      "可能讓你少賺 5%"
    ]
  },
  {
    title: "買房不是終點，是起點",
    lines: [
      "很多人買了房",
      "就停止理財規劃",
      "其實買房之後",
      "才是資產配置的開始"
    ]
  },
  {
    title: "租房 vs 買房，沒有標準答案",
    lines: [
      "租房不一定是幫房東繳房貸",
      "買房不一定是最好的投資",
      "關鍵是",
      "你的錢有沒有在增值"
    ]
  },
  // ========== 保險思維 ==========
  {
    title: "保險不是買心安，是買保障",
    lines: [
      "很多人買了保險",
      "卻不知道自己買了什麼",
      "保險是轉嫁風險",
      "不是投資工具"
    ]
  },
  {
    title: "你的保險，保障夠嗎？",
    lines: [
      "壽險保額建議",
      "是年收入的 10 倍",
      "你的保額",
      "夠家人生活幾年？"
    ]
  },
  {
    title: "醫療險，不是有就好",
    lines: [
      "住院一天自費可能上萬",
      "你的醫療險",
      "日額夠不夠？",
      "實支實付有沒有？"
    ]
  },
  {
    title: "保險要趁年輕買",
    lines: [
      "25 歲買和 35 歲買",
      "保費可能差一倍",
      "而且年紀越大",
      "體況越難通過"
    ]
  },
  {
    title: "儲蓄險不是存錢的好方法",
    lines: [
      "儲蓄險報酬率 2%",
      "定存利率也差不多",
      "但流動性",
      "差很多"
    ]
  },
  // ========== 債務思維 ==========
  {
    title: "不是所有的債都是壞債",
    lines: [
      "壞債：消費性貸款",
      "好債：投資性貸款",
      "關鍵是",
      "借來的錢有沒有在賺錢"
    ]
  },
  {
    title: "信用卡循環利息，是財務殺手",
    lines: [
      "循環利息年利率 15%",
      "10 萬塊一年變 11.5 萬",
      "這是合法的",
      "高利貸"
    ]
  },
  {
    title: "先還高利率的債",
    lines: [
      "信用卡 15%",
      "信貸 5%",
      "房貸 2%",
      "先還利率最高的"
    ]
  },
  {
    title: "借錢投資，你準備好了嗎？",
    lines: [
      "借錢投資是雙面刃",
      "賺的時候賺更多",
      "賠的時候",
      "連本金都沒了"
    ]
  },
  // ========== 存錢思維 ==========
  {
    title: "存錢的第一步，是記帳",
    lines: [
      "你不知道錢花去哪",
      "怎麼知道哪裡可以省？",
      "記帳不是為了省錢",
      "是為了了解自己"
    ]
  },
  {
    title: "六個罐子理財法",
    lines: [
      "生活必需 55%",
      "財務自由 10%",
      "教育學習 10%",
      "長期儲蓄 10%"
    ]
  },
  {
    title: "緊急預備金，你有嗎？",
    lines: [
      "建議存 3-6 個月生活費",
      "放在隨時可以領的地方",
      "這筆錢不是用來投資",
      "是用來保命"
    ]
  },
  {
    title: "自動轉帳，強迫儲蓄",
    lines: [
      "發薪日自動轉存",
      "剩下的才是可花的錢",
      "看不到的錢",
      "就不會想花"
    ]
  },
  {
    title: "存錢不是目的，增值才是",
    lines: [
      "存 100 萬放定存",
      "10 年後購買力剩 70 萬",
      "存錢之後",
      "要讓錢去工作"
    ]
  },
  // ========== 理財觀念 ==========
  {
    title: "理財不是有錢人的事",
    lines: [
      "越沒錢",
      "越需要理財",
      "因為你沒有",
      "犯錯的本錢"
    ]
  },
  {
    title: "不要把雞蛋放在同一個籃子",
    lines: [
      "但也不要放太多籃子",
      "3-5 個標的就夠了",
      "太分散",
      "報酬也會被稀釋"
    ]
  },
  {
    title: "投資自己，報酬率最高",
    lines: [
      "學一個新技能",
      "薪水可能多 20%",
      "這個報酬率",
      "股票做不到"
    ]
  },
  {
    title: "時間是最寶貴的資產",
    lines: [
      "年輕時用時間換錢",
      "中年後用錢換時間",
      "但很多人",
      "一輩子都在用時間換錢"
    ]
  },
  {
    title: "別人的建議，聽聽就好",
    lines: [
      "每個人的情況不同",
      "適合別人的不一定適合你",
      "理財這件事",
      "要自己做功課"
    ]
  },
  // ========== 股票思維 ==========
  {
    title: "股票不是賭博",
    lines: [
      "賭博是零和遊戲",
      "股票是參與企業成長",
      "長期持有好公司",
      "是最穩的投資"
    ]
  },
  {
    title: "不要試圖預測市場",
    lines: [
      "沒有人能準確預測",
      "連巴菲特都做不到",
      "與其預測",
      "不如長期持有"
    ]
  },
  {
    title: "股災是機會，不是災難",
    lines: [
      "好公司打折賣",
      "你應該高興才對",
      "股災",
      "是財富重新分配的時刻"
    ]
  },
  {
    title: "ETF 是懶人的好朋友",
    lines: [
      "不會選股沒關係",
      "買整個市場就好",
      "0050、006208",
      "都是好選擇"
    ]
  },
  {
    title: "股息不是白賺的",
    lines: [
      "配息會從股價扣除",
      "左手換右手而已",
      "重點是",
      "公司有沒有持續成長"
    ]
  },
  // ========== 基金思維 ==========
  {
    title: "基金的手續費，比你想的貴",
    lines: [
      "申購手續費 1.5%",
      "管理費每年 1.5%",
      "10 年下來",
      "吃掉你 20% 報酬"
    ]
  },
  {
    title: "過去績效不代表未來",
    lines: [
      "去年漲 50% 的基金",
      "今年可能跌 30%",
      "不要追高",
      "要看長期表現"
    ]
  },
  // ========== 人生階段理財 ==========
  {
    title: "20 歲：最重要的是學習",
    lines: [
      "這時候本金小",
      "投資報酬有限",
      "投資自己",
      "才是最好的投資"
    ]
  },
  {
    title: "30 歲：該認真理財了",
    lines: [
      "收入穩定了",
      "支出也增加了",
      "這時候不開始",
      "以後會很辛苦"
    ]
  },
  {
    title: "40 歲：要開始保守一點",
    lines: [
      "離退休越來越近",
      "承受風險的能力降低",
      "穩定比報酬",
      "更重要"
    ]
  },
  {
    title: "50 歲：退休倒數計時",
    lines: [
      "檢視你的退休金準備",
      "還差多少？",
      "還有 10-15 年",
      "可以補足缺口"
    ]
  },
  // ========== 家庭理財 ==========
  {
    title: "結婚前，先談錢",
    lines: [
      "金錢觀不合",
      "是離婚的主因之一",
      "婚前談清楚",
      "婚後少吵架"
    ]
  },
  {
    title: "生小孩的財務準備",
    lines: [
      "一個小孩養到大",
      "至少 500 萬",
      "這還不包括",
      "你的生活品質下降"
    ]
  },
  {
    title: "教育基金，越早準備越輕鬆",
    lines: [
      "18 年後要用的錢",
      "現在開始存",
      "每月 5000",
      "就能存到 100 萬"
    ]
  },
  {
    title: "家庭保障缺口，算過了嗎？",
    lines: [
      "如果你明天走了",
      "家人可以撐多久？",
      "這個數字",
      "就是你需要的保額"
    ]
  },
  // ========== 職場理財 ==========
  {
    title: "薪水不是唯一的收入",
    lines: [
      "正職、副業、投資",
      "三管齊下",
      "才能",
      "加速財務自由"
    ]
  },
  {
    title: "跳槽是加薪最快的方式",
    lines: [
      "內部調薪 3-5%",
      "跳槽加薪 20-30%",
      "忠誠度",
      "不會讓你變有錢"
    ]
  },
  {
    title: "年終獎金的正確用法",
    lines: [
      "不是拿來花掉",
      "是拿來投資",
      "每年投入年終",
      "10 年後差距很大"
    ]
  },
  {
    title: "勞退自提，有人在意嗎？",
    lines: [
      "自提 6% 可以節稅",
      "等於加薪 6%",
      "而且還有保證收益",
      "為什麼不做？"
    ]
  },
  // ========== 心理財商 ==========
  {
    title: "恐懼和貪婪，是投資的敵人",
    lines: [
      "漲的時候怕錯過",
      "跌的時候怕套牢",
      "情緒化操作",
      "是虧錢的主因"
    ]
  },
  {
    title: "慢慢變富，才是正道",
    lines: [
      "想要快速致富",
      "通常會快速變窮",
      "財富累積",
      "沒有捷徑"
    ]
  },
  {
    title: "別跟風投資",
    lines: [
      "大家都在買的時候",
      "通常已經太貴了",
      "跟風的下場",
      "就是被割韭菜"
    ]
  },
  {
    title: "認賠是一種能力",
    lines: [
      "死抱著虧損的股票",
      "只會越虧越多",
      "停損",
      "是為了保護本金"
    ]
  },
  {
    title: "不要借錢給朋友",
    lines: [
      "借出去的錢",
      "要有回不來的準備",
      "如果回不來",
      "你失去的是錢和朋友"
    ]
  },
  // ========== 數字思維 ==========
  {
    title: "72 法則：錢多久翻倍？",
    lines: [
      "72 ÷ 報酬率 = 翻倍年數",
      "7% 報酬率",
      "大約 10 年翻倍",
      "複利的力量"
    ]
  },
  {
    title: "4% 法則：退休要存多少？",
    lines: [
      "年支出 ÷ 4%",
      "就是你需要的退休金",
      "年花 60 萬",
      "需要存 1500 萬"
    ]
  },
  {
    title: "50/30/20 法則",
    lines: [
      "50% 必要支出",
      "30% 想要支出",
      "20% 儲蓄投資",
      "簡單的理財比例"
    ]
  },
  // ========== 消費陷阱 ==========
  {
    title: "分期付款的陷阱",
    lines: [
      "0 利率不是真的 0 成本",
      "商品價格已經加上去了",
      "分期",
      "只會讓你買更多"
    ]
  },
  {
    title: "訂閱服務正在吃掉你的錢",
    lines: [
      "Netflix、Spotify、健身房",
      "每個月幾百塊",
      "一年下來",
      "可能好幾萬"
    ]
  },
  {
    title: "特價不是省錢，是花錢",
    lines: [
      "買一送一",
      "第二件 5 折",
      "如果你本來不需要",
      "就是多花錢"
    ]
  },
  {
    title: "炫耀性消費，最愚蠢",
    lines: [
      "買名牌讓別人覺得你有錢",
      "但你的戶頭",
      "只有你自己知道",
      "有多空"
    ]
  },
  // ========== 致富心態 ==========
  {
    title: "富人思考的是機會成本",
    lines: [
      "花 1 萬買包包",
      "就是少了 1 萬投資",
      "10 年後",
      "那 1 萬可能變 2 萬"
    ]
  },
  {
    title: "有錢人的時間比較貴",
    lines: [
      "花 3 小時省 500 元",
      "時薪 166 元",
      "你的時間",
      "值這個價嗎？"
    ]
  },
  {
    title: "窮人買彩券，富人買股票",
    lines: [
      "彩券中獎率百萬分之一",
      "股票長期報酬率 7%",
      "你選擇",
      "希望還是機率？"
    ]
  },
  {
    title: "先有收入，才談被動收入",
    lines: [
      "很多人想靠被動收入",
      "卻沒有主動收入",
      "被動收入",
      "是主動收入累積來的"
    ]
  },
  // ========== 理財迷思 ==========
  {
    title: "高報酬一定高風險？",
    lines: [
      "不一定",
      "有時候是資訊不對稱",
      "學習",
      "可以降低風險"
    ]
  },
  {
    title: "保本的投資最安全？",
    lines: [
      "保本保的是名目金額",
      "不是購買力",
      "通膨會讓你的錢",
      "越來越不值錢"
    ]
  },
  {
    title: "投資要看長線？",
    lines: [
      "長線不是買了就不管",
      "是定期檢視、適時調整",
      "被動投資",
      "不是被動不管"
    ]
  },
  {
    title: "專家說的一定對？",
    lines: [
      "專家也常常看錯",
      "2008 年沒人預測到金融海嘯",
      "專家的話",
      "參考就好"
    ]
  },
  // ========== 台灣特色 ==========
  {
    title: "台灣人最愛的投資：房地產",
    lines: [
      "有土斯有財",
      "但房價已經這麼高",
      "年輕人買得起嗎？",
      "要重新思考"
    ]
  },
  {
    title: "台股的殖利率，世界前幾名",
    lines: [
      "台股平均殖利率 4%",
      "比定存高很多",
      "存股領息",
      "是不錯的選擇"
    ]
  },
  {
    title: "健保不是萬能的",
    lines: [
      "很多項目要自費",
      "新藥、新技術都不便宜",
      "醫療險",
      "還是要買"
    ]
  },
  {
    title: "台灣的通膨，比你感覺的高",
    lines: [
      "官方數字 2-3%",
      "但房租、學費、醫療",
      "漲幅都超過這個數字",
      "實質購買力在下降"
    ]
  },
  // ========== 財商金句 ==========
  {
    title: "錢不是萬能，沒錢萬萬不能",
    lines: [
      "錢不能買到快樂",
      "但沒錢會很不快樂",
      "理財不是為了變有錢",
      "是為了有選擇的自由"
    ]
  },
  {
    title: "最好的投資，是現在開始",
    lines: [
      "不是等到有錢再開始",
      "是從現在開始累積",
      "1000 元也可以投資",
      "重點是養成習慣"
    ]
  },
  {
    title: "財商決定你的人生高度",
    lines: [
      "同樣的薪水",
      "不同的財商",
      "10 年後",
      "財富差距可能 10 倍"
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
