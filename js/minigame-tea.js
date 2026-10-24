/**
 * 太阁英语立志传 · 宗休茶室 (Tea Ceremony Minigame)
 * 经典复刻光荣《太阁立志传5》茶道修行小游戏：
 * - 拜访茶仙千利休 / 津田宗休，茶室对坐品茗
 * - 桌面 6~8 盏和风陶器茶碗（黑乐茶碗、曜变天目），中英记忆配对消消乐
 * - 翻开英文茶盏：朗读纯正全词美音（无 Capital A 杂音）
 * - 翻开中文茶盏：配对成功瓷响消除并触发金光
 * - 闭环收益：心心生命恢复满格 ❤️，获得【禅心静气护盾】（下次战斗免错 1 次）+ 军资奖励
 */

class TeaCeremonyMinigame {
  constructor() {
    this.isOpen = false;
    this.cards = [];
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.totalPairs = 3; // 3对 (6张牌)，非常适合快节奏少儿专注力
    this.isProcessing = false;
    this.container = null;
    this.hasEatenRiceball = false;
    this.hasAuditedTribute = false;
    this._customCompanionQuote = null;
  }

  init() {
    this.container = document.getElementById('modal-tea-ceremony');
  }

  open() {
    if (!this.container) this.init();
    if (!this.container) return;

    window.audioEngine.unlockAudio();
    window.audioEngine.playTaikoDrum();

    this.isOpen = true;
    this.container.classList.remove('hidden');
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.isProcessing = false;
    this.hasEatenRiceball = false;
    this.hasAuditedTribute = false;
    this._customCompanionQuote = null;

    this.prepareCards();
    this.render();
    this.renderCompanionBanquet();

    setTimeout(() => {
      window.audioEngine.playTone(520, 'sine', 0.25, 0.1);
    }, 200);
  }

  /**
   * 渲染随行家臣同席茶会与领地进贡互动席位
   */
  renderCompanionBanquet() {
    const barEl = document.getElementById('tea-companion-banquet-bar');
    if (!barEl) return;

    // 1. 获取当前随行家臣信息
    const comp = (window.estateSystem && window.estateSystem.getActiveCompanion)
      ? window.estateSystem.getActiveCompanion()
      : { id: 'hidenaga', name: '木下秀长', role: '错题军师', portrait: '📜', greeting: '兄长莫急！温故而知新，弟已将今日学识整理在册！' };

    // 2. 获取背包饭团数
    const riceballs = (window.heroManager && window.heroManager.hero && window.heroManager.hero.inventory)
      ? (window.heroManager.hero.inventory['item-riceball'] || 0)
      : 0;

    // 3. 获取平定名城数与每日进贡总贯
    const curStage = window.progressManager ? window.progressManager.getCurrentIndex() + 1 : 1;
    const conqueredCount = Math.min(60, Math.max(0, curStage - 1));
    const tributeKoban = conqueredCount * 45;

    // 家臣茶室专属迎宾台词
    let quote = `“藤吉郎，今日茶汤幽香，尝尝我新捏的温热饭团，合战冲阵倍有精神~”`;
    if (comp.id === 'hidenaga') {
      quote = `“兄长！已平定名城送来领地进贡，弟已将账册核算妥当，且在此品茗定神！”`;
    } else if (comp.id === 'toshiie') {
      quote = `“好茶！宗休大师的浓茶爽口！猴子，喝罢此盏，随我去阵前大显身手！”`;
    } else if (comp.id === 'hanbei') {
      quote = `“主公，心静则神明。茶道如兵法，融通音律意境，名城自破也。”`;
    }

    if (this._customCompanionQuote) {
      quote = this._customCompanionQuote;
    }

    barEl.innerHTML = `
      <div class="tea-companion-banquet-card">
        <div class="tea-companion-seat">
          <div class="companion-avatar-icon">${comp.portrait && comp.portrait.includes('/') ? `<img src="${comp.portrait}" class="seat-avatar-img">` : (comp.portrait || '👥')}</div>
          <div class="companion-seat-meta">
            <div class="companion-seat-name">${comp.name} <span class="seat-role-pill">${comp.role}</span></div>
            <div class="companion-seat-bubble" id="tea-companion-speech">${quote}</div>
          </div>
        </div>

        <div class="tea-banquet-actions">
          <!-- 宁宁爱心饭团盘 -->
          <div class="banquet-item-pod">
            <div class="pod-info">
              <span class="pod-icon">🍙</span>
              <div class="pod-texts">
                <span class="pod-title">宁宁手作饭团</span>
                <span class="pod-sub">库存: <strong>${riceballs}</strong> 枚</span>
              </div>
            </div>
            <button class="btn btn-sm btn-riceball-feast ${riceballs <= 0 || this.hasEatenRiceball ? 'is-disabled' : ''}" onclick="window.teaMinigame.eatRiceballWithCompanion()">
              ${this.hasEatenRiceball ? '✨ 饱腹元气' : '🍙 共品饭团'}
            </button>
          </div>

          <!-- 领地进贡清点册 -->
          <div class="banquet-item-pod">
            <div class="pod-info">
              <span class="pod-icon">🪙</span>
              <div class="pod-texts">
                <span class="pod-title">领地进贡军饷</span>
                <span class="pod-sub">平定: <strong>${conqueredCount}</strong>座 · +${tributeKoban}贯/日</span>
              </div>
            </div>
            <button class="btn btn-sm btn-tribute-audit ${this.hasAuditedTribute ? 'is-disabled' : ''}" onclick="window.teaMinigame.auditTributeLedger()">
              ${this.hasAuditedTribute ? '📜 已清点' : '📜 清点进贡'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 互动：与家臣在茶室共品温热饭团
   */
  eatRiceballWithCompanion() {
    if (this.hasEatenRiceball) {
      if (window.ui) window.ui.showToast('🍙 刚才已品尝过温热饭团，腹中暖洋洋元气满满！', 1600);
      return;
    }

    const hero = window.heroManager ? window.heroManager.hero : null;
    const riceballs = hero?.inventory?.['item-riceball'] || 0;

    if (riceballs <= 0) {
      this._customCompanionQuote = `“哎呀，今天的爱心饭团已经吃完了。明日早起记得来居所找我捏新饭团哦~”`;
      this.renderCompanionBanquet();
      if (window.ui) window.ui.showToast('🍙 背包中暂无饭团，可每日在居所向宁宁领取！', 1800);
      return;
    }

    // 消耗 1 枚饭团
    hero.inventory['item-riceball']--;
    this.hasEatenRiceball = true;

    if (window.heroManager) {
      window.heroManager.healHeart(99);
      hero.zenShield = true;
      hero.riceballBuff = true;
    }

    if (window.audioEngine) {
      window.audioEngine.playCoin();
      window.audioEngine.playFluteFanfare();
    }

    this._customCompanionQuote = `“【宁宁开怀笑道】：“真香！多吃些，合战时精神饱满绝不慌张！后方有我在，藤吉郎放心冲阵！””`;
    this.renderCompanionBanquet();

    if (window.ui) {
      window.ui.showToast('✨ 享用了热气腾腾的爱心饭团！心心生命回满，获【饭团元气】双倍武勋增益！', 2200);
    }
  }

  /**
   * 互动：在茶室核查平定名城领地进贡军饷
   */
  auditTributeLedger() {
    if (this.hasAuditedTribute) {
      if (window.ui) window.ui.showToast('📜 今日领地进贡已清点核验无误！', 1500);
      return;
    }

    this.hasAuditedTribute = true;
    const curStage = window.progressManager ? window.progressManager.getCurrentIndex() + 1 : 1;
    const conqueredCount = Math.min(60, Math.max(0, curStage - 1));
    const tributeKoban = conqueredCount * 45;

    // 奖励 20 贯茶室犒赏金币
    if (window.heroManager) {
      window.heroManager.addGold(20);
    }
    if (window.audioEngine?.playKobanCollect) {
      window.audioEngine.playKobanCollect();
    }

    this._customCompanionQuote = `“【木下秀长拿出算盘】：“兄长！已平定 ${conqueredCount} 座名城，每日进贡 +${tributeKoban} 贯稳固无误！奉上今日茶会特赏金 20 贯！””`;
    this.renderCompanionBanquet();

    if (window.ui) {
      window.ui.showToast(`🪙 清点领地进贡完成！获得茶会赏金 +20 贯！`, 2000);
    }
  }

  close() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    this.isOpen = false;
  }

  prepareCards() {
    let wordPool = [];
    if (window.wordManager && typeof window.wordManager.getAllTextbookWordsFlat === 'function') {
      const allWords = window.wordManager.getAllTextbookWordsFlat();
      const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
      const start = Math.max(0, curIdx - 2);
      const recentWords = allWords.slice(start, start + 12);
      wordPool = recentWords.length >= this.totalPairs ? recentWords : allWords;
    }

    if (!wordPool || wordPool.length < this.totalPairs) {
      wordPool = [
        { en: 'apple', cn: '苹果', emoji: '🍎' },
        { en: 'cat', cn: '小猫', emoji: '🐱' },
        { en: 'book', cn: '书本', emoji: '📖' },
        { en: 'tea', cn: '绿茶', emoji: '🍵' },
        { en: 'fish', cn: '游鱼', emoji: '🐟' },
        { en: 'tree', cn: '大树', emoji: '🌲' }
      ];
    }

    const shuffledPool = [...wordPool].sort(() => Math.random() - 0.5);
    const chosenWords = shuffledPool.slice(0, this.totalPairs);

    const generated = [];
    chosenWords.forEach((item, idx) => {
      generated.push({
        id: 'en-' + idx,
        pairId: idx,
        type: 'en',
        text: item.en,
        speakText: item.en,
        display: item.en,
        isMatched: false,
        isFlipped: false
      });
      generated.push({
        id: 'cn-' + idx,
        pairId: idx,
        type: 'cn',
        text: item.cn,
        speakText: item.en,
        display: item.emoji + ' ' + item.cn,
        isMatched: false,
        isFlipped: false
      });
    });

    this.cards = generated.sort(() => Math.random() - 0.5);
  }

  render() {
    const boardEl = document.getElementById('tea-board');
    const msgEl = document.getElementById('tea-status-msg');
    const scoreEl = document.getElementById('tea-pairs-count');

    if (scoreEl) {
      scoreEl.textContent = this.matchedPairs + ' / ' + this.totalPairs;
    }

    if (msgEl) {
      msgEl.innerHTML = '<span>🍵 点击翻开茶盏，寻得中英意境相通之一对！</span>';
    }

    if (boardEl) {
      boardEl.innerHTML = this.cards.map((card, idx) => {
        let stateClass = '';
        if (card.isMatched) stateClass = 'card-matched';
        else if (card.isFlipped) stateClass = 'card-flipped';

        return '<div class="tea-card-wrap ' + stateClass + '" onclick="window.teaMinigame.flipCard(' + idx + ')">' +
          '<div class="tea-card-inner">' +
            '<div class="tea-card-back">' +
              '<div class="tea-bowl-icon">🍵</div>' +
              '<div class="tea-bowl-pattern">和敬清寂</div>' +
            '</div>' +
            '<div class="tea-card-front ' + card.type + '">' +
              '<div class="tea-card-text">' + card.display + '</div>' +
              '<div class="tea-card-sub">' + (card.type === 'en' ? '🔊 听音' : '释义') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  flipCard(idx) {
    if (this.isProcessing) return;
    const card = this.cards[idx];
    if (card.isMatched || card.isFlipped) return;
    if (this.flippedIndices.length >= 2) return;

    window.audioEngine.unlockAudio();
    window.audioEngine.playKeyRune();

    card.isFlipped = true;
    this.flippedIndices.push(idx);

    if (card.type === 'en') {
      window.audioEngine.speak(card.text);
    } else {
      window.audioEngine.playTone(440, 'sine', 0.1, 0.08);
    }

    this.render();

    if (this.flippedIndices.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.isProcessing = true;
    const [firstIdx, secondIdx] = this.flippedIndices;
    const card1 = this.cards[firstIdx];
    const card2 = this.cards[secondIdx];

    const isMatch = (card1.pairId === card2.pairId && card1.type !== card2.type);

    if (isMatch) {
      setTimeout(() => {
        window.audioEngine.playCoin();
        card1.isMatched = true;
        card2.isMatched = true;
        this.matchedPairs++;
        this.flippedIndices = [];
        this.isProcessing = false;

        const msgEl = document.getElementById('tea-status-msg');
        if (msgEl) {
          msgEl.innerHTML = '<span style="color:#10b981;">✨ 妙极！【' + (card1.type === 'en' ? card1.text : card2.text) + '】心神融通！</span>';
        }

        this.render();

        if (this.matchedPairs === this.totalPairs) {
          this.handleVictory();
        }
      }, 500);
    } else {
      setTimeout(() => {
        window.audioEngine.playTone(200, 'triangle', 0.15, 0.1);
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedIndices = [];
        this.isProcessing = false;

        const msgEl = document.getElementById('tea-status-msg');
        if (msgEl) {
          msgEl.innerHTML = '<span style="color:#f59e0b;">💭 意境未合，再试一番！</span>';
        }

        this.render();
      }, 900);
    }
  }

  handleVictory() {
    setTimeout(() => {
      window.audioEngine.playFluteFanfare();

      if (window.heroManager) {
        window.heroManager.healHeart(99);
        window.heroManager.addGold(20);
        window.heroManager.hero.zenShield = true;
      }

      // 推进内政主命
      if (window.questSystem) {
        window.questSystem.progressQuest('domestic', 1);
      }

      // 解锁茶道宗匠称号卡
      if (window.cardsManager && typeof window.cardsManager.unlockCard === 'function') {
        window.cardsManager.unlockCard('title-teasaint');
      }

      if (window.gameEngine) {
        window.gameEngine.updateHUDStats();
      }

      const comp = (window.estateSystem && window.estateSystem.getActiveCompanion)
        ? window.estateSystem.getActiveCompanion()
        : { name: '木下秀长', role: '错题军师', portrait: '📜' };

      let cheerText = `兄长心神融通！今日所悟词汇已化为随行军阵之力，所向披靡！`;
      if (comp.id === 'nene') {
        cheerText = `太好了！藤吉郎饮了热茶、吃了饭团，精神百倍！此去出征定能旗开得胜！`;
      } else if (comp.id === 'toshiie') {
        cheerText = `哈哈痛快！利休大师好茶！猴子，随我去阵前大显身手！`;
      } else if (comp.id === 'hanbei') {
        cheerText = `主公茶道已通达化境，今日所悟自然拼读神机，胜过万千甲兵！`;
      }

      let extraBonusHtml = '';
      if (this.hasEatenRiceball) {
        if (window.heroManager) window.heroManager.addMerit(60);
        extraBonusHtml += `<div class="tea-reward-item" style="color:#fef08a;">🍙 <strong>【爱心饭团加护】：合战武勋额外 +60 点！</strong></div>`;
      }
      if (this.hasAuditedTribute) {
        extraBonusHtml += `<div class="tea-reward-item" style="color:#6ee7b7;">🪙 <strong>【领地进贡喜报】：城下军民士气大振！</strong></div>`;
      }

      const boardEl = document.getElementById('tea-board');
      if (boardEl) {
        boardEl.innerHTML = '<div class="tea-victory-box">' +
          '<div class="tea-master-portrait">🍵</div>' +
          '<h3>千利休抚须笑道：“善哉！少侠深谙一期一会之真意！”</h3>' +
          '<div class="tea-companion-cheer">' +
            '<div class="companion-cheer-avatar">' + (comp.portrait && comp.portrait.includes('/') ? `<img src="${comp.portrait}" class="seat-avatar-img">` : (comp.portrait || '👥')) + '</div>' +
            '<div class="companion-cheer-bubble">' +
              '<strong>【' + comp.name + '】</strong>：“' + cheerText + '”' +
            '</div>' +
          '</div>' +
          '<div class="tea-rewards-list">' +
            '<div class="tea-reward-item">❤️ <strong>心心生命：已全满复苏！</strong></div>' +
            '<div class="tea-reward-item">🛡️ <strong>获得【禅心静气护盾】：下次出征免错 1 次！</strong></div>' +
            '<div class="tea-reward-item">🪙 <strong>宗休礼赠：+20 贯军资！</strong></div>' +
            extraBonusHtml +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="window.teaMinigame.finishCeremony()">' +
            '🙏 谢过大师与同席家臣，回转出征' +
          '</button>' +
        '</div>';
      }
    }, 400);
  }

  finishCeremony() {
    this.close();
    window.ui.showToast('茶道修心圆满！生命回满并获禅心护盾 ✨', '🍵');
    if (window.taikouTown) {
      window.taikouTown.updateHUD();
    }
  }
}

if (typeof window !== 'undefined') {
  window.teaMinigame = new TeaCeremonyMinigame();
}
