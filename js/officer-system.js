/**
 * 太阁英语立志传 · 名将武家宅邸与家臣羁绊助战 (Officer Residences & Retainer Bonds)
 * 经典复刻光荣《太阁立志传5》武家宅邸拜访、名将结交与随行助战系统：
 * - 📜 木下小一郎（秀长）：胞弟兼智囊，专属【错题军师案卷】帮玩家复习薄弱单词
 * - 🦁 前田利家（枪之又左）：终生挚友与先锋大将，出征随行，卡壳时挥枪提示首字母
 * - 🍵 千利休：绝代茶圣，指点茶道心法与静心禅意
 */

class OfficerSystem {
  constructor() {
    this.storageKey = 'taikou_english_officers_v3';
    this.state = this.loadState();
    this.currentOfficerId = null;
  }

  getDefaultState() {
    return {
      bonds: {
        'hidenaga': { name: '木下小一郎（秀长）', avatar: '📜', hearts: 3, role: '错题军师' },
        'toshiie': { name: '前田利家', avatar: '🦁', hearts: 2, role: '随行护卫大将' },
        'hanbei': { name: '竹中半兵卫', avatar: '🪭', hearts: 2, role: '奇谋军师' },
        'sokyu': { name: '今井宗久', avatar: '👳‍♂️', hearts: 2, role: '天下商脉' },
        'rikyu': { name: '千利休', avatar: '🍵', hearts: 2, role: '茶道宗匠' }
      },
      activeCompanion: 'toshiie' // 默认随行助战武将
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return { ...this.getDefaultState(), ...JSON.parse(data) };
    } catch (e) {
      console.warn('Officer state load error:', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Officer state save error:', e);
    }
  }

  /**
   * 打开武家宅邸列表或特定武将宅邸
   */
  openResidenceModal(officerId = 'hidenaga') {
    this.currentOfficerId = officerId;
    let modal = document.getElementById('modal-officer-residence');
    if (!modal) {
      this.createModal();
      modal = document.getElementById('modal-officer-residence');
    }
    this.renderResidence(officerId);
    modal.classList.remove('hidden');
  }

  createModal() {
    const div = document.createElement('div');
    div.id = 'modal-officer-residence';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-officer-container">
        <div class="modal-header">
          <h3 id="officer-residence-title"><img src="assets/ui/seal_taikou.png" style="width:22px;height:22px;vertical-align:middle;margin-right:6px;"> 武家府邸 · 名将结交</h3>
          <button class="modal-close" onclick="document.getElementById('modal-officer-residence').classList.add('hidden')">✕</button>
        </div>
        <div class="officer-tabs-row" style="flex-wrap:wrap;gap:6px;">
          <button class="officer-tab-btn" data-officer="hidenaga" onclick="window.officerSystem.renderResidence('hidenaga')">
            秀长 (错题参谋)
          </button>
          <button class="officer-tab-btn" data-officer="toshiie" onclick="window.officerSystem.renderResidence('toshiie')">
            利家 (枪阵先锋)
          </button>
          <button class="officer-tab-btn" data-officer="hanbei" onclick="window.officerSystem.renderResidence('hanbei')">
            半兵卫 (奇策军师)
          </button>
          <button class="officer-tab-btn" data-officer="sokyu" onclick="window.officerSystem.renderResidence('sokyu')">
            宗久 (南蛮商脉)
          </button>
          <button class="officer-tab-btn" data-officer="rikyu" onclick="window.officerSystem.renderResidence('rikyu')">
            利休 (茶道宗匠)
          </button>
        </div>
        <div class="modal-body" id="officer-residence-body" style="padding: 16px 20px;"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  renderResidence(officerId) {
    this.currentOfficerId = officerId;
    const body = document.getElementById('officer-residence-body');
    if (!body) return;

    // 更新 tabs
    document.querySelectorAll('.officer-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.officer === officerId);
    });

    const bond = this.state.bonds[officerId] || { name: '名将', hearts: 2 };
    let heartsStr = '';
    const hCount = bond.hearts || 2;
    for (let i = 0; i < 5; i++) {
      if (i < hCount) {
        heartsStr += '<img src="assets/ui/magatama_green.png" style="width:16px;height:16px;vertical-align:middle;margin-right:2px;">';
      } else {
        heartsStr += '<img src="assets/ui/magatama_green.png" style="width:16px;height:16px;vertical-align:middle;margin-right:2px;opacity:0.25;filter:grayscale(100%);">';
      }
    }

    if (officerId === 'hidenaga') {
      this.renderHidenagaReview(body, bond, heartsStr);
    } else if (officerId === 'toshiie') {
      this.renderToshiieCompanion(body, bond, heartsStr);
    } else if (officerId === 'hanbei') {
      this.renderHanbei(body, bond, heartsStr);
    } else if (officerId === 'sokyu') {
      this.renderSokyu(body, bond, heartsStr);
    } else if (officerId === 'rikyu') {
      this.renderRikyuZen(body, bond, heartsStr);
    }
  }

  renderHidenagaReview(container, bond, heartsStr) {
    // 获取近期错题
    const progress = window.progressManager ? window.progressManager.state : {};
    const mastery = progress.masteryMap || {};
    const wrongWords = Object.keys(mastery)
      .filter(k => mastery[k] && mastery[k].wrong > 0)
      .slice(0, 4);

    let reviewHtml = '';
    if (wrongWords.length === 0) {
      reviewHtml = `
        <div class="officer-empty-box">
          <p>“兄长近来用功勤勉，案卷上竟无一处错漏！愚弟深感佩服！”</p>
          <div class="officer-reward-pill">兄长当前无薄弱错词，请继续保持！</div>
        </div>
      `;
    } else {
      reviewHtml = `
        <div class="officer-wrong-list">
          <p style="font-size:14px;color:var(--text-sub);margin-bottom:8px;">
            秀长翻阅案卷：“兄长，这几个英词近期稍有反复，待愚弟出题考考兄长！”
          </p>
          <div class="wrong-chips-grid">
            ${wrongWords.map(w => `
              <div class="wrong-chip" onclick="window.audioEngine.speak('${w}')">
                <span><strong>${w}</strong></span>
                <span style="font-size:12px;color:#ef4444;">(错${mastery[w].wrong}次)</span>
                <span>🔊</span>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="window.officerSystem.startHidenagaQuiz('${wrongWords[0]}')">
            立即与秀长温故核心错词：【${wrongWords[0]}】
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="officer-profile-card">
        <div class="koei-portrait-wrap officer-portrait-box">
          <img src="assets/portraits/hidenaga.jpg" class="koei-portrait-img" alt="木下秀长">
          <div class="koei-portrait-name">木下小一郎（秀长）</div>
          <div class="o-bond" style="margin-top:8px;font-size:12px;color:#d4a359;text-align:center;">羁绊：${heartsStr}</div>
        </div>
        <div class="officer-dialogue-box">
          <div class="o-quote">“兄长！治军治国犹如砌筑石垣，每一个单词皆不可遗漏偏差。愚弟每日在此为兄长把关！”</div>
          ${reviewHtml}
        </div>
      </div>
    `;
  }

  startHidenagaQuiz(wordKey) {
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const targetObj = allWords.find(w => w.en.toLowerCase() === wordKey.toLowerCase()) || { en: wordKey, cn: '释义' };
    
    // 生成选项
    const others = allWords.filter(w => w.en.toLowerCase() !== wordKey.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [
      { text: targetObj.cn, isCorrect: true },
      { text: others[0] ? others[0].cn : '其他', isCorrect: false },
      { text: others[1] ? others[1].cn : '选项', isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    const body = document.getElementById('officer-residence-body');
    if (!body) return;

    body.innerHTML = `
      <div class="hidenaga-quiz-box">
        <h4>📜 秀长错题考校：【${targetObj.en}】之准确释义为？</h4>
        <button class="btn btn-secondary btn-sm" style="margin: 8px auto 16px; display:block;" onclick="window.audioEngine.speak('${targetObj.en}')">
          🔊 点击仔细听发音
        </button>
        <div class="quiz-options-list">
          ${options.map(opt => `
            <button class="btn btn-secondary btn-block quiz-opt-btn" onclick="window.officerSystem.answerHidenagaQuiz('${wordKey}', ${opt.isCorrect}, this)">
              ${opt.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    if (window.audioEngine) window.audioEngine.speak(targetObj.en);
  }

  answerHidenagaQuiz(wordKey, isCorrect, btnElement) {
    if (isCorrect) {
      btnElement.style.background = '#10b981';
      btnElement.style.color = '#fff';
      if (window.audioEngine) window.audioEngine.playSlashSuccess();
      
      // 修正错题本
      if (window.progressManager && window.progressManager.state.masteryMap[wordKey.toLowerCase()]) {
        const item = window.progressManager.state.masteryMap[wordKey.toLowerCase()];
        item.wrong = Math.max(0, item.wrong - 1);
        item.correct = (item.correct || 0) + 1;
        window.progressManager.saveState();
      }

      setTimeout(() => {
        if (window.ui) window.ui.showToast('答对了！秀长赞叹：“兄长领悟如神，此词已然铭记于心！”', '👏');
        if (window.heroManager) {
          window.heroManager.addItem('item-riceball', 1);
          window.ui.showToast('秀长奉上热腾腾的【听音兵粮丸 × 1】！', '🍙');
        }
        this.renderResidence('hidenaga');
      }, 900);
    } else {
      btnElement.style.background = '#ef4444';
      btnElement.style.color = '#fff';
      if (window.audioEngine) window.audioEngine.playSlashMiss();
      setTimeout(() => {
        if (window.ui) window.ui.showToast('秀长细声提醒：“兄长莫急，再听一遍原音！”', '👂');
        btnElement.style.background = '';
        btnElement.style.color = '';
        if (window.audioEngine) window.audioEngine.speak(wordKey);
      }, 800);
    }
  }

  renderToshiieCompanion(container, bond, heartsStr) {
    const isEquipped = this.state.activeCompanion === 'toshiie';
    container.innerHTML = `
      <div class="officer-profile-card">
        <div class="koei-portrait-wrap officer-portrait-box">
          <img src="assets/portraits/toshiie.jpg" class="koei-portrait-img" alt="前田利家">
          <div class="koei-portrait-name">前田利家（枪之又左）</div>
          <div class="o-bond" style="margin-top:8px;font-size:12px;color:#d4a359;text-align:center;">羁绊：${heartsStr}</div>
        </div>
        <div class="officer-dialogue-box">
          <div class="o-quote">“哈哈哈！藤吉郎！你我生死之交，你的事就是我利家的事！出征战役只要带上我，若遇拼写卡壳，我利家必挺枪为你破开敌阵！”</div>
          <div class="companion-perk-card">
            <h4>随行助战特权：【豪杰枪阵破招】</h4>
            <p>地牢战斗中若 <strong>8 秒钟未输入字母</strong>，前田利家将狂吼一声挺枪突刺，<strong>直接替你填入首个正确字母</strong>！</p>
          </div>
          <div style="margin-top:16px;">
            ${isEquipped 
              ? `<button class="btn btn-primary btn-block" disabled>当前已作为【随行副将】随同出征</button>`
              : `<button class="btn btn-primary btn-block" onclick="window.officerSystem.setCompanion('toshiie')">邀请利家出征助战！</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  setCompanion(officerId) {
    this.state.activeCompanion = officerId;
    this.saveState();
    const bond = this.state.bonds[officerId];
    const name = bond ? bond.name : '名将';
    const msg = officerId === 'hanbei'
      ? '竹中半兵卫摇羽扇微笑道：“承蒙主公信赖，必竭智尽忠，洞察敌阵破绽！”'
      : (officerId === 'toshiie'
        ? '前田利家拔枪大喝：“好！今日便随藤吉郎同赴沙场！”'
        : `已委任【${name}】为随行随从！`);
    if (window.ui) window.ui.showToast(msg, '🔰');
    this.renderResidence(officerId);
  }

  renderRikyuZen(container, bond, heartsStr) {
    container.innerHTML = `
      <div class="officer-profile-card">
        <div class="koei-portrait-wrap officer-portrait-box">
          <img src="assets/portraits/rikyu.jpg" class="koei-portrait-img" alt="千利休">
          <div class="koei-portrait-name">千利休（茶圣）</div>
          <div class="o-bond" style="margin-top:8px;font-size:12px;color:#d4a359;text-align:center;">羁绊：${heartsStr}</div>
        </div>
        <div class="officer-dialogue-box">
          <div class="o-quote">“心无杂念，万物皆空。英语之音律，正如水沸茶烟，唯有静心聆听，方能体悟其原本真意。”</div>
          <div class="companion-perk-card" style="border-color:#10b981;">
            <h4>茶圣指点：【和敬清寂】</h4>
            <p>前往城下町【宗休茶室】修习茶道，每次翻牌双语共鸣消除，不仅能回满生命心心，还可领悟【禅心护盾】！</p>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-primary btn-block" onclick="document.getElementById('modal-officer-residence').classList.add('hidden'); window.teaMinigame.open();">
              立即前往宗休茶室修行
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderHanbei(container, bond, heartsStr) {
    const isEquipped = this.state.activeCompanion === 'hanbei';
    container.innerHTML = `
      <div class="officer-profile-card">
        <div class="koei-portrait-wrap officer-portrait-box">
          <img src="assets/portraits/hanbei.jpg" class="koei-portrait-img" alt="竹中半兵卫">
          <div class="koei-portrait-name">竹中半兵卫（美浓智将）</div>
          <div class="o-bond" style="margin-top:8px;font-size:12px;color:#d4a359;text-align:center;">羁绊：${heartsStr}</div>
          <div style="margin-top:8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.officerSystem.giftTea('hanbei')">敬献茶汤 (+1心)</button>
          </div>
        </div>
        <div class="officer-dialogue-box">
          <div class="o-quote">“‘知己知彼，百战不殆。’敌阵妖魔的拼读护盾看似坚固，实则皆依循自然拼读奥妙之法则。只要主公带上我，开战必勘破其发音破绽！”</div>
          <div class="companion-perk-card" style="border-color:#38bdf8;">
            <h4>随行助战特权：【奇策洞察发音规则】</h4>
            <p>出征战役地牢时，遭遇敌人<strong>自动提醒其背后的自然拼读法则</strong>（如 Magic E 魔幻长元音、双元音连读、双辅音合音），提前预知破阵秘诀！</p>
          </div>
          <div style="margin-top:16px;">
            ${isEquipped 
              ? `<button class="btn btn-primary btn-block" disabled>当前已作为【随行军师】出征</button>`
              : `<button class="btn btn-primary btn-block" onclick="window.officerSystem.setCompanion('hanbei')">邀请半兵卫作为随行军师！</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  renderSokyu(container, bond, heartsStr) {
    container.innerHTML = `
      <div class="officer-profile-card">
        <div class="koei-portrait-wrap officer-portrait-box">
          <img src="assets/portraits/sokyu.jpg" class="koei-portrait-img" alt="今井宗久">
          <div class="koei-portrait-name">今井宗久（界港豪商）</div>
          <div class="o-bond" style="margin-top:8px;font-size:12px;color:#d4a359;text-align:center;">羁绊：${heartsStr}</div>
          <div style="margin-top:8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.officerSystem.giftTea('sokyu')">敬献茶汤 (+1心)</button>
          </div>
        </div>
        <div class="officer-dialogue-box">
          <div class="o-quote">“哈哈！东海道虽大，商脉尽在老夫股掌之中。少侠若肯多跑商，老夫愿为你开辟南蛮商道，各町特产包你大赚特赚！”</div>
          <div class="companion-perk-card" style="border-color:#f59e0b;">
            <h4>豪商羁绊特权：【天下商脉利润上浮】</h4>
            <p>随行或结交后，在各町商馆<strong>出售特产时售价额外上浮 +25%</strong>！且采购名刀神兵时常驻 9 折特惠！</p>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-primary btn-block" onclick="document.getElementById('modal-officer-residence').classList.add('hidden'); window.nanbanTrade.openTradeModal('sakai');">
              前往界港南蛮商馆周游列国
            </button>
          </div>
        </div>
      </div>
    `;
  }

  giftTea(officerId) {
    const hero = window.heroManager;
    if (!hero || hero.getGold() < 15) {
      if (window.ui) window.ui.showToast('军资不足 15 贯，无法奉上上品茶汤！', '⚠️');
      return;
    }
    hero.hero.gold -= 15;
    hero.saveHeroData();

    const bond = this.state.bonds[officerId];
    if (bond) {
      bond.hearts = Math.min(5, (bond.hearts || 2) + 1);
      this.saveState();
    }

    if (window.audioEngine) window.audioEngine.playCoin();
    if (window.ui) window.ui.showToast(`奉上特级宇治茶汤！${bond ? bond.name : '名将'}喜笑颜开，羁绊加深 ❤️！`, '🍵');
    if (window.taikouTown) window.taikouTown.updateHUD();
    this.renderResidence(officerId);
  }
}

if (typeof window !== 'undefined') {
  window.officerSystem = new OfficerSystem();
}
