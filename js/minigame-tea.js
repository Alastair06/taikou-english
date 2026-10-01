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

    this.prepareCards();
    this.render();

    setTimeout(() => {
      window.audioEngine.playTone(520, 'sine', 0.25, 0.1);
    }, 200);
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

      const boardEl = document.getElementById('tea-board');
      if (boardEl) {
        boardEl.innerHTML = '<div class="tea-victory-box">' +
          '<div class="tea-master-portrait">🍵</div>' +
          '<h3>千利休抚须笑道：“善哉！少侠深谙一期一会之真意！”</h3>' +
          '<div class="tea-rewards-list">' +
            '<div class="tea-reward-item">❤️ <strong>心心生命：已全满复苏！</strong></div>' +
            '<div class="tea-reward-item">🛡️ <strong>获得【禅心静气护盾】：下次出征免错 1 次！</strong></div>' +
            '<div class="tea-reward-item">🪙 <strong>宗休礼赠：+20 贯军资！</strong></div>' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="window.teaMinigame.finishCeremony()">' +
            '🙏 谢过宗休大师，归去城下町' +
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
