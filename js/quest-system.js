/**
 * 太阁英语立志传 · 天守阁评定与主命系统 (Hyōjō & Shumei Quest System)
 * 经典复刻光荣《太阁立志传5》大名评定与主命受领玩法：
 * - 织田信长每月/每日天守评定会，3 选 1 自由主命（内政兵粮 / 军学演武 / 关所谍报）
 * - 功勋（Merit）增长驱动九品官阶晋升（草鞋小厮 ➡️ 足轻头 ➡️ 目付 ➡️ 侍大将 ➡️ 部将 ➡️ 家老 ➡️ 城主 ➡️ 天下人）
 * - 官职晋升朱印状封赏庆典与专属特权解锁
 */

class QuestSystem {
  constructor() {
    this.storageKey = 'taikou_english_quests_v3';
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      activeQuest: null,     // 当前正在进行的主命对象
      completedQuestsCount: 0,
      todayOfferedQuests: null, // 当天生成的 3 选 1 备选项
      lastOfferDate: null,
      lastStipendClaimDate: null, // 上次领取官位俸禄日期
      isPerfectRun: true     // 本次主命是否 0 失误大成功
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return { ...this.getDefaultState(), ...JSON.parse(data) };
    } catch (e) {
      console.warn('Quest state load error:', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Quest state save error:', e);
    }
  }

  getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * 生成 3 个不同类型的备选主命
   */
  generateThreeQuests() {
    const hero = window.heroManager ? window.heroManager.hero : { merit: 0 };
    const progress = window.progressManager ? window.progressManager.state : { currentWordIndex: 0 };
    const curIdx = progress.currentWordIndex || 0;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const sampleWords = allWords.slice(curIdx, curIdx + 3);

    const qDomestic = {
      id: 'quest-domestic-' + Date.now(),
      type: 'domestic',
      typeName: '内政 · 兵粮筹备',
      icon: '🌾',
      title: '调配物产军粮',
      desc: '前往南蛮商馆或城下町，攻克食物与日常核心词汇，调度军粮。',
      targetCount: 3,
      currentCount: 0,
      targetWords: sampleWords.map(w => w.en),
      rewardMerit: 45,
      rewardGold: 60,
      rewardItem: '🍙 兵粮丸 × 1',
      bgTheme: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.25))'
    };

    const qMilitary = {
      id: 'quest-military-' + Date.now(),
      type: 'military',
      typeName: '军事 · 军学演武',
      icon: '⚔️',
      title: '地牢破招试炼',
      desc: '出征战役，以拼读连续攻破 3 处防线，威慑东海道！',
      targetCount: 3,
      currentCount: 0,
      targetWords: sampleWords.map(w => w.en),
      rewardMerit: 55,
      rewardGold: 50,
      rewardItem: '📜 洞察卷轴 × 1',
      bgTheme: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.25))'
    };

    const qIntelligence = {
      id: 'quest-intel-' + Date.now(),
      type: 'intelligence',
      typeName: '谍报 · 关所辨词',
      icon: '🕵️',
      title: '探查破译密信',
      desc: '巡视官道关所，听音辨词刺探敌情。',
      targetCount: 3,
      currentCount: 0,
      targetWords: sampleWords.map(w => w.en),
      rewardMerit: 50,
      rewardGold: 55,
      rewardItem: '💣 破阵雷 × 1',
      bgTheme: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.25))'
    };

    return [qDomestic, qMilitary, qIntelligence];
  }

  /**
   * 打开天守阁大名评定会界面
   */
  openHyojoModal() {
    const todayStr = this.getTodayDateStr();
    if (!this.state.todayOfferedQuests || this.state.lastOfferDate !== todayStr) {
      this.state.todayOfferedQuests = this.generateThreeQuests();
      this.state.lastOfferDate = todayStr;
      this.saveState();
    }

    let modal = document.getElementById('modal-hyojo-keep');
    if (!modal) {
      this.createHyojoModal();
      modal = document.getElementById('modal-hyojo-keep');
    }

    this.renderHyojoModal();
    modal.classList.remove('hidden');
  }

  createHyojoModal() {
    const div = document.createElement('div');
    div.id = 'modal-hyojo-keep';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-hyojo-container">
        <div class="modal-header">
          <h3>🏯 清洲天守阁 · 织田信长大名主命评定</h3>
          <button class="modal-close" onclick="document.getElementById('modal-hyojo-keep').classList.add('hidden')">✕</button>
        </div>
        <div class="modal-body" id="hyojo-modal-body"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  renderHyojoModal() {
    const container = document.getElementById('hyojo-modal-body');
    if (!container) return;

    const hero = window.heroManager ? window.heroManager.hero : null;
    const currentRank = window.heroManager ? window.heroManager.getCurrentRank() : { title: '足轻组头' };
    const active = this.state.activeQuest;

    const todayStr = this.getTodayDateStr();
    const stipendClaimed = this.state.lastStipendClaimDate === todayStr;
    const stipendMap = { 'rank-1': 30, 'rank-2': 80, 'rank-3': 180, 'rank-4': 350, 'rank-5': 700, 'rank-6': 1500, 'rank-7': 3000 };
    const stipendAmount = stipendMap[currentRank.id] || 50;

    let html = `
      <div class="koei-dialogue-box hyojo-koei-dialogue">
        <div class="koei-portrait-wrap">
          <img src="assets/portraits/nobunaga.jpg" class="koei-portrait-img" alt="织田信长">
          <div class="koei-portrait-name">织田信长</div>
        </div>
        <div class="koei-speech-wrap">
          <div class="koei-speaker-title">织田弹正忠信长 · 清洲城评定之仪</div>
          <div class="koei-speech-text">
            ${active 
              ? `“藤吉郎！你当前身负<strong>【${active.title}】</strong>之重托，进度为 <strong>${active.currentCount}/${active.targetCount}</strong>！速速前去用功，休得怠慢！”`
              : `“诸将肃静！天下布武正需栋梁之材。藤吉郎，本家特予你三道机密令旨，从容择一受命！”`
            }
          </div>
        </div>
      </div>

      <div class="hyojo-stipend-bar" style="display:flex;justify-content:space-between;align-items:center;background:rgba(212,163,89,0.12);border:1px solid rgba(212,163,89,0.35);border-radius:4px;padding:8px 14px;margin-bottom:14px;">
        <div style="font-size:13px;color:#d4a359;font-weight:700;">
          <img src="assets/ui/coin_koban.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> 官职日俸【${currentRank.title}】：<strong>${stipendAmount} 贯</strong>
        </div>
        ${stipendClaimed
          ? `<span style="font-size:12px;color:#94a3b8;font-weight:600;">✓ 今日俸禄已领取</span>`
          : `<button class="btn btn-secondary btn-sm" onclick="window.questSystem.claimStipend()"><img src="assets/ui/coin_koban.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"> 支取今日俸禄</button>`
        }
      </div>
    `;

    if (active) {
      // 当前已有执行中的主命
      const isDone = active.currentCount >= active.targetCount;
      html += `
        <div class="hyojo-active-quest-box" style="background:${active.bgTheme};">
          <div class="quest-header-line">
            <span class="quest-type-badge">${active.icon} ${active.typeName}</span>
            <span class="quest-status-badge ${isDone ? 'done' : 'doing'}">
              ${isDone ? '🎉 目标已达成，可随时领赏！' : `⚡ 进行中 (${active.currentCount}/${active.targetCount})`}
            </span>
          </div>
          <h4 class="quest-title-large">${active.title}</h4>
          <p class="quest-desc-text">${active.desc}</p>
          
          <div class="quest-target-words-row">
            <span>🎯 重点操练词汇：</span>
            ${(active.targetWords || []).map(w => `<span class="q-word-pill" onclick="window.audioEngine.speak('${w}')">🔊 ${w}</span>`).join(' ')}
          </div>

          <div class="quest-rewards-bar">
            <span>🎁 完成封赏：<strong>+${active.rewardMerit} 功勋</strong></span>
            <span>🪙 <strong>+${active.rewardGold} 贯</strong></span>
            <span>${active.rewardItem}</span>
          </div>

          <div class="hyojo-actions-bar">
            ${isDone 
              ? `<button class="btn btn-primary btn-lg pulse" onclick="window.questSystem.claimActiveQuestReward()">🎌 缴令领赏 · 晋升受封！</button>`
              : `<button class="btn btn-primary" onclick="document.getElementById('modal-hyojo-keep').classList.add('hidden'); window.taikouTown.marchToDungeon();">⚔️ 立即前往出征战役</button>`
            }
            <button class="btn btn-secondary" onclick="window.questSystem.abandonActiveQuest()">放弃此命重新挑选</button>
          </div>
        </div>
      `;
    } else {
      // 3 选 1 主命卡片
      const quests = this.state.todayOfferedQuests || this.generateThreeQuests();
      html += `
        <div class="hyojo-choices-title">📜 请选择今日主命（完成可积累功勋并晋升官职）：</div>
        <div class="hyojo-quests-grid">
          ${quests.map((q, idx) => `
            <div class="hyojo-quest-card" style="background:${q.bgTheme};" onclick="window.questSystem.acceptQuest(${idx})">
              <div class="q-card-top">
                <span class="q-card-badge">${q.icon} ${q.typeName}</span>
                <span class="q-card-gold">🪙 +${q.rewardGold}贯</span>
              </div>
              <h4 class="q-card-title">${q.title}</h4>
              <p class="q-card-desc">${q.desc}</p>
              <div class="q-card-reward">
                <span>🏅 功勋 +${q.rewardMerit}</span>
                <span>${q.rewardItem}</span>
              </div>
              <button class="btn btn-primary btn-block">承领此命！</button>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * 接受某项主命
   */
  acceptQuest(index) {
    const list = this.state.todayOfferedQuests;
    if (!list || !list[index]) return;

    this.state.activeQuest = { ...list[index], currentCount: 0 };
    this.saveState();

    if (window.ui) {
      window.ui.showToast(`已受领信长大名主命：【${this.state.activeQuest.title}】！`, '📜');
    }
    this.renderHyojoModal();
    this.updateHUDQuestBanner();
  }

  /**
   * 放弃当前主命
   */
  abandonActiveQuest() {
    this.state.activeQuest = null;
    this.saveState();
    if (window.ui) window.ui.showToast('已放弃当前主命，可重新挑选！', 'ℹ️');
    this.renderHyojoModal();
    this.updateHUDQuestBanner();
  }

  /**
   * 推进当前主命进度 (如在地牢中拼对、在道场射中、商馆砍价成功)
   */
  progressQuest(type, amount = 1) {
    const q = this.state.activeQuest;
    if (!q) return;

    // 如果匹配类型或者通用的练习
    if (q.type === type || type === 'any') {
      q.currentCount = Math.min(q.targetCount, q.currentCount + amount);
      this.saveState();
      
      if (q.currentCount >= q.targetCount) {
        if (window.ui) window.ui.showToast(`🎉 主命【${q.title}】已圆满达成！速回清洲天守受赏！`, '🎌');
        if (window.audioEngine) window.audioEngine.playVictoryFanfare();
      } else {
        if (window.ui) window.ui.showToast(`主命进度：${q.currentCount}/${q.targetCount}`, '📜');
      }
      this.updateHUDQuestBanner();
    }
  }

  claimStipend() {
    const today = this.getTodayDateStr();
    if (this.state.lastStipendClaimDate === today) {
      if (window.ui) window.ui.showToast('今日已领过织田家俸禄，明日再来！', 'ℹ️');
      return;
    }
    const hero = window.heroManager;
    if (!hero) return;
    const rank = hero.getCurrentRank();
    const stipendMap = {
      'rank-1': 30,
      'rank-2': 80,
      'rank-3': 180,
      'rank-4': 350,
      'rank-5': 700,
      'rank-6': 1500,
      'rank-7': 3000
    };
    const amount = stipendMap[rank.id] || 50;
    hero.addGold(amount);
    this.state.lastStipendClaimDate = today;
    this.saveState();

    if (window.audioEngine) window.audioEngine.playCoin();
    if (window.ui) {
      window.ui.showToast(`领取【${rank.title}】今日官俸：🪙 ${amount} 贯高！`, '💰');
    }
    if (window.taikouTown) window.taikouTown.updateHUD();
    this.renderHyojoModal();
  }

  /**
   * 缴令领赏并检查官阶晋升（含大成功评定）
   */
  claimActiveQuestReward() {
    const q = this.state.activeQuest;
    if (!q || q.currentCount < q.targetCount) return;

    const hero = window.heroManager;
    const isGreatSuccess = q.isGreatSuccess || (this.state.isPerfectRun !== false);
    const meritMult = isGreatSuccess ? 1.5 : 1.0;
    const goldMult = isGreatSuccess ? 1.5 : 1.0;
    const finalMerit = Math.round((q.rewardMerit || 40) * meritMult);
    const finalGold = Math.round((q.rewardGold || 50) * goldMult);

    if (hero) {
      hero.addGold(finalGold);
      const prevRank = hero.getCurrentRank();
      hero.addMerit(finalMerit);
      const newRank = hero.getCurrentRank();

      // 如果升官了，触发隆重的升职封赏弹窗！
      if (newRank.id !== prevRank.id) {
        this.triggerRankUpModal(prevRank, newRank);
      } else {
        if (window.ui) {
          const msg = isGreatSuccess
            ? `🌟【主命大成功！】信长欣然拍案：“真乃织田家麒麟儿！” 赐功勋 +${finalMerit}，贯高 +${finalGold}！`
            : `恭领主命封赏：功勋 +${finalMerit}，贯高 +${finalGold}！`;
          window.ui.showToast(msg, isGreatSuccess ? '🌟' : '🪙');
        }
      }
    }

    // 清空完成的主命，并推进累计计数
    this.state.completedQuestsCount += 1;
    this.state.activeQuest = null;
    this.state.todayOfferedQuests = null; // 清空以便生成新一轮
    this.state.isPerfectRun = true;
    this.saveState();

    // 检查是否解锁【破阵先锋大将】称号卡
    if (window.cardsManager && this.state.completedQuestsCount >= 2) {
      window.cardsManager.unlockCard('title-pioneer');
    }

    this.renderHyojoModal();
    this.updateHUDQuestBanner();
  }

  /**
   * 触发大名亲自颁发朱印状的升官封赏盛典弹窗
   */
  triggerRankUpModal(oldRank, newRank) {
    let modal = document.getElementById('modal-rank-up');
    if (!modal) {
      this.createRankUpModal();
      modal = document.getElementById('modal-rank-up');
    }

    const body = document.getElementById('rank-up-content');
    if (body) {
      body.innerHTML = `
        <div class="rank-up-header-emblem">🎌</div>
        <div class="rank-up-title-sub">织田家右近卫中将信长 亲授朱印状</div>
        <h2 class="rank-up-title-main">官位晋升：【${newRank.title}】！</h2>
        
        <div class="rank-up-compare-box">
          <div class="rank-node old">
            <div class="r-icon">${oldRank.icon}</div>
            <div class="r-title">${oldRank.title}</div>
            <div class="r-house">${oldRank.house}</div>
          </div>
          <div class="rank-arrow">➡️ 进位 ➡️</div>
          <div class="rank-node new">
            <div class="r-icon">${newRank.icon}</div>
            <div class="r-title">${newRank.title}</div>
            <div class="r-house">${newRank.house}</div>
          </div>
        </div>

        <div class="rank-up-desc-box">
          <p>“藤吉郎恪尽职守，拼读精湛，功勋赫赫！即日起擢升为织田家 <strong>【${newRank.title}】</strong>，移居 <strong>【${newRank.house}】</strong>！”</p>
          <div class="rank-perk-item">
            ✨ <strong>解锁全新特权：</strong>${newRank.desc}
          </div>
        </div>

        <button class="btn btn-primary btn-lg pulse" style="margin-top:20px;" onclick="document.getElementById('modal-rank-up').classList.add('hidden')">
          谢主公大恩！再建功勋！
        </button>
      `;
    }

    modal.classList.remove('hidden');
    if (window.audioEngine) window.audioEngine.playVictoryFanfare();
  }

  createRankUpModal() {
    const div = document.createElement('div');
    div.id = 'modal-rank-up';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-rank-up-container" style="max-width:540px; text-align:center;">
        <div class="modal-body" id="rank-up-content" style="padding: 30px 20px;"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  updateHUDQuestBanner() {
    const q = this.state.activeQuest;
    const bannerEl = document.getElementById('home-progress-text');
    if (bannerEl) {
      if (q) {
        bannerEl.innerHTML = `📜 今日主命：<strong>${q.title}</strong> [${q.currentCount}/${q.targetCount}]`;
      } else {
        bannerEl.innerHTML = `🏯 天守待命：前往清洲天守受领织田信长今日主命`;
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.questSystem = new QuestSystem();
}
