/**
 * ============================================================================
 * 太阁英语立志传 · 南蛮东海道商肆与有声跑商系统 (Nanban Trade & Voice Market)
 * - 纯正游戏化自然习得：告别做题考试，在买卖跑商中自然掌握日常高频词汇与数字
 * - 南蛮大商会长阿方索亲切英语寒暄：“Welcome! Fresh apples, fine swords, and strong horses!”
 * - 日常生鲜与军需集市：Apple(苹果)、Fish(鱼)、Rice(大米)、Tea(茶)、Horse(马)、Sword(剑)
 * - 礼貌英语寒暄议价：打招呼（Good morning! / Nice to meet you!）立享人情折扣
 * - 结合光荣《太阁立志传》特产跑商：清洲陶器、界港火枪、京都丝绸异地低买高卖
 * ============================================================================
 */

const SENGOKU_SPECIALTIES = [
  { id: 'spec-kiyosu', townId: 'kiyosu', name: '尾张 · 濑户烧陶器', nameEn: 'Seto Pottery', icon: '🏺', basePrice: 20, bestSellTown: 'kyoto', highPrice: 45 },
  { id: 'spec-sakai', townId: 'sakai', name: '界港 · 南蛮火绳枪', nameEn: 'Matchlock Musket', icon: '💥', basePrice: 50, bestSellTown: 'inabayama', highPrice: 110 },
  { id: 'spec-kyoto', townId: 'kyoto', name: '山城 · 京都西阵织', nameEn: 'Nishijin Silk', icon: '👘', basePrice: 35, bestSellTown: 'sakai', highPrice: 75 },
  { id: 'spec-inabayama', townId: 'inabayama', name: '美浓 · 关市打刃物', nameEn: 'Seki Katana', icon: '🗡️', basePrice: 30, bestSellTown: 'kiyosu', highPrice: 65 },
  { id: 'spec-azuchi', townId: 'azuchi', name: '近江 · 琵琶湖真珠', nameEn: 'Biwa Pearls', icon: '🦪', basePrice: 40, bestSellTown: 'kyoto', highPrice: 90 }
];

const MARKET_DAILY_GOODS = [
  {
    id: 'apple',
    name: '鲜红苹果',
    en: 'Apple',
    phonetic: '/ˈæpl/',
    icon: '🍎',
    price: 10,
    desc: '清脆甜美的红苹果！宁宁最爱的心愿点心，合战中可恢复 5 生命。',
    voicePhrase: 'Fresh and sweet Apple! Ten gold.'
  },
  {
    id: 'fish',
    name: '肥美真鲷',
    en: 'Fish',
    phonetic: '/fɪʃ/',
    icon: '🐟',
    price: 15,
    desc: '今日出海捕捞的真鲷！利家大将的最爱，赠予可加深猛将羁绊。',
    voicePhrase: 'Delicious Fish! Fifteen gold.'
  },
  {
    id: 'rice',
    name: '越光稻米',
    en: 'Rice',
    phonetic: '/raɪs/',
    icon: '🌾',
    price: 20,
    desc: '军机重粮！秀长军师管粮必备，亦是手捏温热饭团的天然原料。',
    voicePhrase: 'Good Rice for energy! Twenty gold.'
  },
  {
    id: 'tea',
    name: '宇治名茶',
    en: 'Tea',
    phonetic: '/tiː/',
    icon: '🍵',
    price: 25,
    desc: '清雅回甘的极上抹茶，半兵卫谋士的最爱，茶室会友常备名物。',
    voicePhrase: 'Aromatic green Tea! Twenty-five gold.'
  },
  {
    id: 'horse',
    name: '尾张骏马',
    en: 'Horse',
    phonetic: '/hɔːrs/',
    icon: '🐎',
    price: 60,
    desc: '神骏良驹！大地图行军如飞，冲阵气魄慑敌。',
    voicePhrase: 'A fast and strong Horse! Sixty gold.'
  },
  {
    id: 'sword',
    name: '备前名刀',
    en: 'Sword',
    phonetic: '/sɔːrd/',
    icon: '⚔️',
    price: 50,
    desc: '千锤百炼的锋锐名刃，寒光闪闪。',
    voicePhrase: 'Sharp Katana Sword! Fifty gold.'
  },
  {
    id: 'scroll-run',
    name: '神速行军草鞋',
    en: 'Run',
    phonetic: '/rʌn/',
    icon: '🏃',
    price: 30,
    desc: '【三年级动词】神行太保草鞋！购入后永久解锁战术指令【Run · 疾跑奔袭】入卡组！',
    voicePhrase: 'Run fast like the wind! Thirty gold.',
    cardReward: 'run'
  },
  {
    id: 'scroll-jump',
    name: '轻灵腾跃绑腿',
    en: 'Jump',
    phonetic: '/dʒʌmp/',
    icon: '🦘',
    price: 30,
    desc: '【三年级动词】飞跃城堑绑腿！购入后永久解锁战术指令【Jump · 凌空飞跃】入卡组！',
    voicePhrase: 'Jump high over the wall! Thirty gold.',
    cardReward: 'jump'
  },
  {
    id: 'scroll-fly',
    name: '天鹰破空羽箭',
    en: 'Fly',
    phonetic: '/flaɪ/',
    icon: '🦅',
    price: 40,
    desc: '【三年级动词】九天展翅金羽！购入后永久解锁战术指令【Fly · 鹰击长空】入卡组！',
    voicePhrase: 'Fly like an eagle in the sky! Forty gold.',
    cardReward: 'fly'
  },
  {
    id: 'scroll-swim',
    name: '水遁避水灵符',
    en: 'Swim',
    phonetic: '/swɪm/',
    icon: '🏊',
    price: 35,
    desc: '【三年级动词】如鱼得水灵符！购入后永久解锁战术指令【Swim · 激流游弋】入卡组！',
    voicePhrase: 'Swim across the wide river! Thirty-five gold.',
    cardReward: 'swim'
  }
];

class NanbanTradeManager {
  constructor() {
    this.storageKey = 'taikou_english_trade_v3';
    this.cargo = this.loadCargo();
    this.currentTown = 'kiyosu';
    this.currentTab = 'goods'; // 'goods' | 'specialty'
    this.discountRate = 1.0;
    this.hasGreeted = false;
  }

  loadCargo() {
    try {
      const d = localStorage.getItem(this.storageKey);
      if (d) return JSON.parse(d);
    } catch (e) {
      console.warn('Trade cargo load error:', e);
    }
    return {};
  }

  saveCargo() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cargo));
    } catch (e) {
      console.error('Trade cargo save error:', e);
    }
  }

  addCargo(specId, count = 1) {
    this.cargo[specId] = (this.cargo[specId] || 0) + count;
    this.saveCargo();
  }

  removeCargo(specId, count = 1) {
    const cur = this.cargo[specId] || 0;
    if (cur < count) return false;
    this.cargo[specId] = cur - count;
    this.saveCargo();
    return true;
  }

  /**
   * 打开南蛮东海道商会大集市
   */
  openTradeModal(currentTownId = 'kiyosu', tab = 'goods') {
    this.currentTown = currentTownId;
    this.currentTab = tab;
    let modal = document.getElementById('modal-trade-market');
    if (!modal) {
      this.createModal();
      modal = document.getElementById('modal-trade-market');
    }
    this.renderTradeModal(currentTownId);
    modal.classList.remove('hidden');

    // 掌柜主动打招呼
    setTimeout(() => {
      this.speakMerchantGreeting();
    }, 350);
  }

  closeTradeModal() {
    const modal = document.getElementById('modal-trade-market');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  createModal() {
    const div = document.createElement('div');
    div.id = 'modal-trade-market';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-trade-container" style="max-width: 600px;">
        <div class="modal-header">
          <h3>🚢 南蛮商馆 · 葡萄牙商会长阿方索的洋货大集</h3>
          <button class="modal-close" onclick="document.getElementById('modal-trade-market').classList.add('hidden')">✕</button>
        </div>
        <div class="modal-body" id="trade-modal-body" style="padding: 14px 16px;"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  speakMerchantGreeting() {
    const greeting = "Welcome, Lord Tokichiro! Fresh Apples, fine Swords, and strong Horses are ready for you today!";
    if (window.audioEngine) {
      window.audioEngine.speak(greeting);
    }
  }

  /**
   * 礼貌英文打招呼议价 (Bargain Greeting)
   */
  greetMerchant(phrase, replyText) {
    if (window.audioEngine) {
      window.audioEngine.speak(phrase);
    }
    this.discountRate = 0.8; // 八折人情折扣
    this.hasGreeted = true;

    setTimeout(() => {
      if (window.audioEngine) {
        window.audioEngine.speak(replyText);
      }
      if (window.ui) {
        window.ui.showToast(`✨ 阿方索掌柜开怀大笑：“有礼貌的年轻武士！今日全场物资 8 折特惠！”`, 2500);
      }
      this.renderTradeModal(this.currentTown);
    }, 1000);
  }

  /**
   * 真实生活化商肆口语对话 (Authentic Conversational English)
   */
  speakShoppingDialogue(topic) {
    let playerPhrase = '';
    let merchantReply = '';
    let toastCn = '';

    if (topic === 'apple') {
      playerPhrase = "I want an apple, please!";
      merchantReply = "Here is a fresh red apple! Sweet and juicy!";
      toastCn = "阿方索递上红苹果：“Fresh red apple! 只要 10 贯！”";
    } else if (topic === 'sword') {
      playerPhrase = "Can I look at the sword?";
      merchantReply = "Look at this sharp Katana! Perfect for a brave samurai!";
      toastCn = "阿方索拔刀出鞘：“Sharp Katana! 锋利无比的备前名刀！”";
    } else if (topic === 'shoes') {
      playerPhrase = "Can I run fast with these shoes?";
      merchantReply = "Yes! Put them on, and you can run fast like the wind!";
      toastCn = "阿方索展示草鞋：“Run fast like the wind! 行军健步如飞！”";
    } else if (topic === 'discount') {
      playerPhrase = "Can you give me a discount, please?";
      merchantReply = "Because you asked so politely in English, take 20% off!";
      toastCn = "阿方索眉开眼笑：“礼貌英语寒暄！全场立减 20% 8折优惠！”";
      this.discountRate = 0.8;
      this.hasGreeted = true;
    }

    // 1. 播放玩家口语句子
    if (window.audioEngine) {
      window.audioEngine.speak(playerPhrase);
    }

    // 2. 延迟播放商掌柜热情回应
    setTimeout(() => {
      if (window.audioEngine) {
        window.audioEngine.speak(merchantReply);
      }
      if (window.ui) {
        window.ui.showToast(`🗣️ 【英语真实对话】${toastCn}`, 2800);
      }
      this.renderTradeModal(this.currentTown);
    }, 1100);
  }

  /**
   * 采购集市日用物资 (Apple, Fish, Rice, Tea, Horse, Sword)
   */
  buyMarketGood(itemId) {
    const item = MARKET_DAILY_GOODS.find(g => g.id === itemId);
    if (!item) return;

    const actualPrice = Math.max(1, Math.round(item.price * this.discountRate));
    const heroGold = window.heroManager ? window.heroManager.getGold() : 0;

    if (heroGold < actualPrice) {
      if (window.audioEngine?.playMistake) window.audioEngine.playMistake();
      if (window.ui) window.ui.showToast(`🪙 金钱不足！购买【${item.name}】需要 ${actualPrice} 贯`, 2000);
      return;
    }

    // 扣除金币，添加物品
    if (window.heroManager) {
      window.heroManager.addGold(-actualPrice);
      window.heroManager.addItem(itemId, 1);
    }

    // 音效与真人英文致谢
    if (window.audioEngine) {
      window.audioEngine.playKobanCollect();
      setTimeout(() => {
        window.audioEngine.speak(`Thank you! One ${item.en}!`);
      }, 200);
    }

    // 若货物附带核心动词战术卡奖励，直接将新神卡永久收入卡组！
    let cardUnlockedMsg = '';
    if (item.cardReward && window.cardBattle) {
      if (!window.cardBattle.persistentDeck.includes(item.cardReward)) {
        window.cardBattle.persistentDeck.push(item.cardReward);
        window.cardBattle.savePersistentDeck();
        cardUnlockedMsg = ` 🎴 战术突破：动词指令【${item.en}】永久加入出征卡组！`;
      }
    }

    if (window.ui) {
      const discountMsg = this.discountRate < 1 ? `（礼貌 8 折立省 ${item.price - actualPrice} 贯！）` : '';
      window.ui.showToast(`🛒 成功购得【${item.name} · ${item.en}】！已存入行囊！${cardUnlockedMsg}${discountMsg}`, 2800);
    }

    this.renderTradeModal(this.currentTown);
  }

  /**
   * 采购名产特产跑商货物
   */
  buySpecialty(specId) {
    const spec = SENGOKU_SPECIALTIES.find(s => s.id === specId);
    if (!spec) return;

    const cost = Math.max(1, Math.round(spec.basePrice * this.discountRate));
    const heroGold = window.heroManager ? window.heroManager.getGold() : 0;

    if (heroGold < cost) {
      if (window.ui) window.ui.showToast(`🪙 军资金不足！采购【${spec.name}】需要 ${cost} 贯`, 2000);
      return;
    }

    if (window.heroManager) {
      window.heroManager.addGold(-cost);
    }
    this.addCargo(specId, 1);

    if (window.audioEngine) {
      window.audioEngine.playKobanCollect();
      window.audioEngine.speak(`Great trade! One ${spec.nameEn}!`);
    }

    if (window.ui) {
      window.ui.showToast(`📦 成功采购【${spec.name}】入仓！运往 ${spec.bestSellTown} 可高价倾销！`, 2500);
    }

    this.renderTradeModal(this.currentTown);
  }

  /**
   * 异地高价倾销出售特产
   */
  sellSpecialty(specId, townId, pricePerItem) {
    const count = this.cargo[specId] || 0;
    if (count <= 0) return;

    let multiplier = 1.0;
    if (window.officerSystem && window.officerSystem.state.activeCompanion === 'sokyu') {
      multiplier = 1.25; // 今井宗久豪商商脉 +25%
    }
    const totalEarn = Math.round(count * pricePerItem * multiplier);
    this.removeCargo(specId, count);

    if (window.heroManager) {
      window.heroManager.addGold(totalEarn);
    }

    if (window.audioEngine) {
      window.audioEngine.playPromotionFanfare();
      window.audioEngine.speak(`Wonderful! Here is your gold!`);
    }

    if (window.ui) {
      const bonusMsg = multiplier > 1 ? '（豪商今井宗久商脉增益 +25%！）' : '';
      window.ui.showToast(`💰 特产全部售出！入账 🪙 ${totalEarn} 贯金判！${bonusMsg}`, 2500);
    }

    this.renderTradeModal(townId);
  }

  /**
   * 渲染商馆主界面
   */
  renderTradeModal(townId = 'kiyosu') {
    const body = document.getElementById('trade-modal-body');
    if (!body) return;

    const heroGold = window.heroManager ? window.heroManager.getGold() : 0;
    const currentSpec = SENGOKU_SPECIALTIES.find(s => s.townId === townId) || SENGOKU_SPECIALTIES[0];

    // 顶部商贾信息与礼貌砍价栏
    const merchantBannerHtml = `
      <div class="market-merchant-card">
        <div class="merchant-avatar-wrap">
          <div class="merchant-avatar">🧔🏻‍♂️</div>
          <button class="btn btn-sm btn-replay-sound" onclick="window.nanbanTrade.speakMerchantGreeting()" title="重听商贾问候">
            🔊 听问候
          </button>
        </div>
        <div class="merchant-speech-box">
          <div class="merchant-name-row">
            <span class="merchant-name">南蛮商会长 · 阿方索 (Alfonso)</span>
            <span class="trade-gold-pill">🪙 商资: <strong>${heroGold}</strong> 贯</span>
          </div>
          <div class="merchant-quote-en">“Welcome, Lord Tokichiro! Fresh Apples, fine Swords, and strong Horses are ready!”</div>
          <div class="merchant-quote-cn">欢迎藤吉郎大人！今日有新鲜红苹果、备前名刀与尾张骏马，请随意挑选！</div>

          <!-- 礼貌英语寒暄议价 (生活化互动) -->
          <div class="merchant-polite-bar">
            <span class="polite-lead">💬 礼貌寒暄获人情折扣：</span>
            <button class="polite-chip ${this.hasGreeted ? 'is-active' : ''}" onclick="window.nanbanTrade.greetMerchant('Good morning!', 'Good morning! Take 20% off!')">
              ☀️ "Good morning!"
            </button>
            <button class="polite-chip ${this.hasGreeted ? 'is-active' : ''}" onclick="window.nanbanTrade.greetMerchant('Nice to meet you!', 'Nice to meet you too! Enjoy your discount!')">
              🤝 "Nice to meet you!"
            </button>
            <button class="polite-chip ${this.hasGreeted ? 'is-active' : ''}" onclick="window.nanbanTrade.greetMerchant('Thank you!', 'You are very welcome, my friend!')">
              ✨ "Thank you!"
            </button>
          </div>

          <!-- 真实口语实践对话 (自然习得生活表达) -->
          <div class="merchant-dialogue-bar">
            <span class="dialogue-lead">🗣️ 用英语向掌柜问询交流：</span>
            <button class="dialogue-chip" onclick="window.nanbanTrade.speakShoppingDialogue('apple')">
              🍎 "I want an apple, please!"
            </button>
            <button class="dialogue-chip" onclick="window.nanbanTrade.speakShoppingDialogue('sword')">
              ⚔️ "Can I look at the sword?"
            </button>
            <button class="dialogue-chip" onclick="window.nanbanTrade.speakShoppingDialogue('shoes')">
              🏃 "Can I run fast with these shoes?"
            </button>
            <button class="dialogue-chip" onclick="window.nanbanTrade.speakShoppingDialogue('discount')">
              🏷️ "Can you give me a discount, please?"
            </button>
          </div>
          ${this.discountRate < 1.0 ? `<div class="discount-active-banner">🏷️ 礼貌寒暄生效中！全场物资立享 8 折人情特惠！</div>` : ''}
        </div>
      </div>
    `;

    // 选项卡切换
    const tabsHtml = `
      <div class="market-nav-tabs">
        <button class="market-tab-btn ${this.currentTab === 'goods' ? 'active' : ''}" onclick="window.nanbanTrade.openTradeModal('${townId}', 'goods')">
          🍎 集市物资采买 (${MARKET_DAILY_GOODS.length})
        </button>
        <button class="market-tab-btn ${this.currentTab === 'specialty' ? 'active' : ''}" onclick="window.nanbanTrade.openTradeModal('${townId}', 'specialty')">
          🚢 战国特产跑商 (${SENGOKU_SPECIALTIES.length})
        </button>
      </div>
    `;

    // 视图 1：生鲜与日用物资采买 (Apple, Fish, Rice, Tea, Horse, Sword)
    const goodsGridHtml = `
      <div class="market-goods-grid">
        ${MARKET_DAILY_GOODS.map(g => {
          const count = window.heroManager ? window.heroManager.getItemCount(g.id) : 0;
          const price = Math.max(1, Math.round(g.price * this.discountRate));
          const hasDiscount = this.discountRate < 1.0;
          return `
            <div class="market-good-card">
              <div class="good-card-top">
                <span class="good-icon">${g.icon}</span>
                <div class="good-title-col">
                  <span class="good-en">${g.en} ${g.cardReward ? `<span class="market-card-badge" style="font-size:10px; background:rgba(217,119,6,0.25); color:#f59e0b; padding:1px 5px; border-radius:4px; border:1px solid rgba(245,158,11,0.4); margin-left:4px;">🎴战术卡</span>` : ''}</span>
                  <span class="good-cn">${g.name}</span>
                </div>
                <button class="btn btn-sm btn-sound-circle" onclick="window.audioEngine?.speak('${g.voicePhrase.replace(/'/g, "\\'")}')" title="朗读物名与价格">
                  🔊
                </button>
              </div>
              <p class="good-desc">${g.desc}</p>
              <div class="good-card-bottom">
                <div class="good-price-tag">
                  ${hasDiscount ? `<del>${g.price}贯</del>` : ''}
                  <span class="price-val">🪙 ${price} 贯</span>
                  <span class="good-stock-chip">已拥有: <strong>${count}</strong></span>
                </div>
                <button class="btn btn-sm btn-primary btn-buy-good" onclick="window.nanbanTrade.buyMarketGood('${g.id}')">
                  🛒 购入 1 件
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // 视图 2：特产跑商货仓与异地倾销
    const cargoEntries = Object.keys(this.cargo).filter(k => this.cargo[k] > 0);
    const cargoHtml = cargoEntries.length === 0 
      ? `<div style="font-size:12px;color:#64748b;padding:8px 0;text-align:center;">随身商运货仓空空如也，前往各大名城采购特产，异地高价倾销赚取金判！</div>`
      : cargoEntries.map(specId => {
          const spec = SENGOKU_SPECIALTIES.find(s => s.id === specId);
          if (!spec) return '';
          const isHighDemand = spec.bestSellTown === townId;
          const sellPrice = isHighDemand ? spec.highPrice : Math.round(spec.basePrice * 0.9);
          return `
            <div class="cargo-item-row">
              <span class="cargo-item-name">${spec.icon} ${spec.name} (${spec.nameEn}) × <strong>${this.cargo[specId]}</strong></span>
              <span class="cargo-sell-price ${isHighDemand ? 'high-demand' : ''}">
                ${isHighDemand ? '🔥 紧俏行情！' : ''}售价: 🪙 <strong>${sellPrice}</strong> 贯
              </span>
              <button class="btn btn-secondary btn-sm" onclick="window.nanbanTrade.sellSpecialty('${specId}', '${townId}', ${sellPrice})">
                全部出手
              </button>
            </div>
          `;
        }).join('');

    const currentTownSpecCost = Math.max(1, Math.round(currentSpec.basePrice * this.discountRate));
    const specialtyViewHtml = `
      <div class="trade-section-box">
        <div class="trade-section-title">📦 随身商运货仓 (特产名物)</div>
        <div class="cargo-list-wrap">${cargoHtml}</div>
      </div>

      <div class="trade-section-box" style="margin-top:10px;">
        <div class="trade-section-title">🏬 本町产物采购 · 【${currentSpec.name}】</div>
        <div class="local-spec-card">
          <div class="spec-icon-box">${currentSpec.icon}</div>
          <div class="spec-info-box">
            <div class="spec-title">${currentSpec.name}</div>
            <div class="spec-en">英文学名：<strong>${currentSpec.nameEn}</strong></div>
            <div class="spec-pricing">
              单价: 🪙 <strong>${currentTownSpecCost}</strong> 贯 ➔ 运往 <strong>${currentSpec.bestSellTown}</strong> 可售 <strong>${currentSpec.highPrice}</strong> 贯！
            </div>
          </div>
          <div class="spec-action-box">
            <button class="btn btn-primary" onclick="window.nanbanTrade.buySpecialty('${currentSpec.id}')">
              📦 采购 1 箱入仓
            </button>
          </div>
        </div>
      </div>
    `;

    body.innerHTML = `
      ${merchantBannerHtml}
      ${tabsHtml}
      ${this.currentTab === 'goods' ? goodsGridHtml : specialtyViewHtml}
    `;
  }
}

if (typeof window !== 'undefined') {
  window.nanbanTrade = new NanbanTradeManager();
}
