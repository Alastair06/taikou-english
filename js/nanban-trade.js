/**
 * 太阁英语立志传 · 南蛮商馆名产跑商与辨词砍价 (Nanban Trade & Bargaining System)
 * 经典复刻光荣《太阁立志传5》町商业流通与特产跑商：
 * - 六大名城专属名产：清洲陶器、界港火枪、京都丝绸、美浓名刀等
 * - 采购名产或名刀装备时，触发掌柜随机英语考问，答对享 5 折砍价优惠！
 * - 携带特产在战国日本大地图上周游各町低买高卖，赚取巨额军资金贯高！
 */

const SENGOKU_SPECIALTIES = [
  { id: 'spec-kiyosu', townId: 'kiyosu', name: '尾张 · 濑户烧陶器', nameEn: 'Seto Pottery', icon: '🏺', basePrice: 20, bestSellTown: 'kyoto', highPrice: 45 },
  { id: 'spec-sakai', townId: 'sakai', name: '界港 · 南蛮火绳枪', nameEn: 'Matchlock Musket', icon: '💥', basePrice: 50, bestSellTown: 'inabayama', highPrice: 110 },
  { id: 'spec-kyoto', townId: 'kyoto', name: '山城 · 京都西阵织', nameEn: 'Nishijin Silk', icon: '👘', basePrice: 35, bestSellTown: 'sakai', highPrice: 75 },
  { id: 'spec-inabayama', townId: 'inabayama', name: '美浓 · 关市打刃物', nameEn: 'Seki Katana', icon: '🗡️', basePrice: 30, bestSellTown: 'kiyosu', highPrice: 65 },
  { id: 'spec-azuchi', townId: 'azuchi', name: '近江 · 琵琶湖真珠', nameEn: 'Biwa Pearls', icon: '🦪', basePrice: 40, bestSellTown: 'kyoto', highPrice: 90 }
];

class NanbanTradeManager {
  constructor() {
    this.storageKey = 'taikou_english_trade_v3';
    this.cargo = this.loadCargo();
  }

  loadCargo() {
    try {
      const d = localStorage.getItem(this.storageKey);
      if (d) return JSON.parse(d);
    } catch (e) {
      console.warn('Trade cargo load error:', e);
    }
    return {}; // { 'spec-kiyosu': 2 }
  }

  saveCargo() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cargo));
    } catch (e) {
      console.error('Trade cargo save error:', e);
    }
  }

  getCargoCount(specId) {
    return this.cargo[specId] || 0;
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
   * 打开特产跑商交易界面
   */
  openTradeModal(currentTownId = 'kiyosu') {
    this.currentTown = currentTownId;
    let modal = document.getElementById('modal-trade-market');
    if (!modal) {
      this.createModal();
      modal = document.getElementById('modal-trade-market');
    }
    this.renderTradeModal(currentTownId);
    modal.classList.remove('hidden');
  }

  createModal() {
    const div = document.createElement('div');
    div.id = 'modal-trade-market';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-trade-container" style="max-width: 600px;">
        <div class="modal-header">
          <h3>🚢 战国东海道商运 · 各町特产与跑商行情</h3>
          <button class="modal-close" onclick="document.getElementById('modal-trade-market').classList.add('hidden')">✕</button>
        </div>
        <div class="modal-body" id="trade-modal-body" style="padding: 16px 20px;"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  renderTradeModal(townId = 'kiyosu') {
    const body = document.getElementById('trade-modal-body');
    if (!body) return;

    const currentSpec = SENGOKU_SPECIALTIES.find(s => s.townId === townId) || SENGOKU_SPECIALTIES[0];
    const heroGold = window.heroManager ? window.heroManager.getGold() : 0;

    // 我的货仓
    const cargoEntries = Object.keys(this.cargo).filter(k => this.cargo[k] > 0);
    const cargoHtml = cargoEntries.length === 0 
      ? `<div style="font-size:13px;color:var(--text-sub);padding:8px 0;">当前行囊空空如也，暂无特产货物。</div>`
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

    body.innerHTML = `
      <div class="trade-banner">
        <div class="trade-gold-indicator">🪙 当前商资：<strong>${heroGold}</strong> 贯</div>
        <p class="trade-desc">各町特产异地紧俏！利用战国日本大地图在城市间低买高卖，答对英语题目即享 <strong>5 折砍价购入</strong>！</p>
      </div>

      <div class="trade-section-box">
        <div class="trade-section-title">📦 随身商运货仓 (背包货物)</div>
        <div class="cargo-list-wrap">${cargoHtml}</div>
      </div>

      <div class="trade-section-box" style="margin-top:14px;">
        <div class="trade-section-title">🏬 本町特色产物采购</div>
        <div class="local-spec-card">
          <div class="spec-icon-box">${currentSpec.icon}</div>
          <div class="spec-info-box">
            <div class="spec-title">${currentSpec.name}</div>
            <div class="spec-en">英文学名：<strong>${currentSpec.nameEn}</strong></div>
            <div class="spec-pricing">
              原价: <del>${currentSpec.basePrice} 贯</del> ➔ 答题砍价半价: 🪙 <strong style="color:#10b981;">${Math.round(currentSpec.basePrice * 0.5)}</strong> 贯！
            </div>
          </div>
          <div class="spec-action-box">
            <button class="btn btn-primary" onclick="window.nanbanTrade.startBuyBargain('${currentSpec.id}')">
              🏷️ 辨词砍价采购
            </button>
          </div>
        </div>
      </div>
    `;
  }

  startBuyBargain(specId) {
    const spec = SENGOKU_SPECIALTIES.find(s => s.id === specId);
    if (!spec) return;

    // 弹窗考问
    if (window.ui && window.ui.openBargainModal) {
      window.ui.openBargainModal({
        name: spec.name,
        cost: spec.basePrice,
        id: spec.id,
        icon: spec.icon,
        isSpecialty: true
      });
      this.pendingBuySpecId = spec.id;
    }
  }

  buySpecialty(specId, isDiscounted = true) {
    const spec = SENGOKU_SPECIALTIES.find(s => s.id === specId);
    if (!spec) return { success: false, msg: '特产不存在' };

    let discountRate = isDiscounted ? 0.5 : 1.0;
    // 秘技卡：算术巧舌额外打 9 折
    if (window.cardsManager && typeof window.cardsManager.hasSkill === 'function' && window.cardsManager.hasSkill('trade_discount')) {
      discountRate *= 0.9;
    }
    const cost = Math.max(1, Math.round(spec.basePrice * discountRate));
    const saved = spec.basePrice - cost;

    if (!window.heroManager || window.heroManager.getGold() < cost) {
      return { success: false, msg: `军资金不足！需要 🪙 ${cost} 贯` };
    }

    // 扣除金币
    window.heroManager.hero.gold -= cost;
    window.heroManager.saveHeroData();

    // 存入特产货仓
    this.addCargo(specId, 1);

    // 推进内政主命
    if (window.questSystem) {
      window.questSystem.progressQuest('domestic', 1);
    }

    return {
      success: true,
      spec,
      cost,
      saved,
      msg: `成功采购【${spec.name}】入仓！${saved > 0 ? `（答题砍价立省 ${saved} 贯！）` : ''}`
    };
  }

  sellSpecialty(specId, townId, pricePerItem) {
    const count = this.cargo[specId] || 0;
    if (count <= 0) return;

    let multiplier = 1.0;
    if (window.officerSystem && window.officerSystem.state.activeCompanion === 'sokyu') {
      multiplier = 1.25; // 今井宗久豪商天下商脉 +25%
    }
    const totalEarn = Math.round(count * pricePerItem * multiplier);
    this.removeCargo(specId, count);

    if (window.heroManager) {
      window.heroManager.addGold(totalEarn);
    }

    if (window.ui) {
      const bonusMsg = multiplier > 1 ? '（豪商今井宗久商脉增益 +25%！）' : '';
      window.ui.showToast(`特产全部出售！入账 🪙 ${totalEarn} 贯金判！${bonusMsg}`, '💰');
      if (window.audioEngine) window.audioEngine.playKeyRune();
    }

    // 检查是否解锁日进斗金称号
    if (window.cardsManager && window.heroManager.hero.gold >= 300) {
      window.cardsManager.unlockCard('title-merchant');
    }

    this.renderTradeModal(townId);
  }
}

if (typeof window !== 'undefined') {
  window.nanbanTrade = new NanbanTradeManager();
}
