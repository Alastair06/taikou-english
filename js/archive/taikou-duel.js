/**
 * 太阁英语立志传 · 演武道场 1v1 个人战 (Taikou Sword Duel)
 * 经典还原光荣《太阁立志传5》真剑胜负与剑豪秘技：
 * - 左右阵营对阵：木下藤吉郎 vs 战国武士 / 道场师范
 * - 键盘盲打输入目标英文单词
 * - 每敲对一键：触发【一之太刀】、【神速居合】、【燕返】等战国剑术秘技斩击！
 * - 拼完单词：纯正美音大声朗读，暴击击倒对手，爆出小判金币与功勋！
 */

class TaikouDuelEngine {
  constructor() {
    this.wordsQueue = [];
    this.currentIndex = 0;
    this.currentWordObj = null;
    this.currentSpelling = '';
    this.enemyHp = 100;
    this.enemyMaxHp = 100;
    this.heroHp = 100;
    this.heroMaxHp = 100;
    this.combo = 0;

    // 经典战国秘技库
    this.swordSkills = [
      '【秘技 · 一之太刀】',
      '【秘技 · 神速居合斩】',
      '【秘技 · 燕返】',
      '【秘技 · 霞之构】',
      '【秘技 · 影分身连斩】'
    ];
  }

  startDojoBattle() {
    const quest = window.progressManager.getTodayQuest();
    // 组合今日的主命词与温故词
    this.wordsQueue = [...quest.newWords, ...quest.reviewWords];
    this.currentIndex = 0;
    this.combo = 0;

    this.bindDuelKeys();
    this.loadNextOpponent();
  }

  bindDuelKeys() {
    this.keyHandler = (e) => {
      // 仅在演武道场场景生效
      if (window.taikouTown.currentScene !== 'dojo') return;

      const k = e.key.toLowerCase();
      if (/^[a-z]$/.test(k)) {
        window.audioEngine.unlockAudio();
        this.inputLetter(k);
      } else if (k === 'backspace') {
        this.backspace();
      } else if (k === ' ' || k === 'enter') {
        if (this.currentWordObj) {
          window.audioEngine.speak(this.currentWordObj.en);
        }
      } else if (k === 'tab') {
        e.preventDefault();
        this.useHint();
      }
    };

    window.removeEventListener('keydown', this.keyHandler);
    window.addEventListener('keydown', this.keyHandler);
  }

  loadNextOpponent() {
    if (this.currentIndex >= this.wordsQueue.length) {
      this.onDojoVictory();
      return;
    }

    this.currentWordObj = this.wordsQueue[this.currentIndex];
    this.currentSpelling = '';

    // 对手资料
    const opponents = [
      { name: '美浓流浪剑客', icon: '🥷', hp: 60, title: '浪人剑豪' },
      { name: '尾张道场师范', icon: '🥋', hp: 80, title: '新阴流传人' },
      { name: '今川家影忍头领', icon: '👺', hp: 90, title: '甲贺忍众' },
      { name: '南蛮重甲剑士', icon: '💂', hp: 120, title: '佩剑骑士' }
    ];
    const opp = opponents[this.currentIndex % opponents.length];
    this.enemyMaxHp = opp.hp;
    this.enemyHp = opp.hp;

    // 渲染对阵画面
    this.renderDuelArena(opp);
  }

  renderDuelArena(opp) {
    const container = document.getElementById('dojo-battle-content');
    if (!container) return;

    const word = this.currentWordObj;
    const cleanWord = word.en.toLowerCase().replace(/[^a-z]/g, '');

    container.innerHTML = `
      <!-- 顶部战斗信息栏 -->
      <div class="duel-top-bar">
        <div class="duel-info-col">
          <span class="duel-title">⚔️ 尾张真剑胜负 · 第 ${this.currentIndex + 1}/${this.wordsQueue.length} 局</span>
          <span class="duel-mode-tag">${word.tag || '大名密令'}</span>
        </div>
        <div class="duel-combo-tag ${this.combo >= 2 ? '' : 'hidden'}" id="duel-combo-pill">
          ⚡ 秘技连斩 x${this.combo}!
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.taikouTown.returnToTown()">
          🚪 收刀返回町街
        </button>
      </div>

      <!-- 1v1 经典对阵擂台 -->
      <div class="duel-stage-arena">
        <!-- 剑气特效层 -->
        <div id="duel-fx-overlay"></div>

        <!-- 玩家：木下藤吉郎 (左) -->
        <div class="duel-fighter fighter-hero" id="duel-hero-box">
          <div class="fighter-info-plate">
            <span class="fighter-name">木下藤吉郎</span>
            <div class="fighter-hp-bar">
              <div class="fighter-hp-fill bg-blue" style="width: 100%;"></div>
            </div>
          </div>
          <div class="fighter-avatar-big hero-stance">
            🥷
            <span class="hero-blade-icon">🗡️</span>
          </div>
        </div>

        <!-- 场地中央 VS 徽记 -->
        <div class="stage-vs-emblem">
          <span class="vs-text-anim">VS</span>
          <div class="skill-name-banner hidden" id="skill-banner">【秘技 · 一之太刀】</div>
        </div>

        <!-- 对手 (右) -->
        <div class="duel-fighter fighter-enemy" id="duel-enemy-box">
          <div class="fighter-info-plate">
            <span class="fighter-name" id="opp-name">${opp.name}</span>
            <div class="fighter-hp-bar">
              <div class="fighter-hp-fill bg-red" id="opp-hp-bar" style="width: 100%;"></div>
            </div>
          </div>
          <div class="fighter-avatar-big opp-stance" id="opp-avatar">
            ${opp.icon}
          </div>
        </div>
      </div>

      <!-- 单词破译大卷轴 -->
      <div class="duel-word-scroll">
        <div class="scroll-word-header">
          <span class="sw-emoji">${word.emoji}</span>
          <span class="sw-cn">${word.cn}</span>
        </div>

        <!-- 字母方块插槽 -->
        <div class="duel-slots-container" id="duel-slots-box">
          ${this.renderSlotsHtml(cleanWord)}
        </div>

        <!-- 快捷操作栏 -->
        <div class="duel-actions-bar">
          <button class="btn btn-secondary btn-action" onclick="window.audioEngine.speak('${word.en}')">
            🔊 听纯正发音 [空格]
          </button>
          <button class="btn btn-secondary btn-action" onclick="window.taikouDuel.useHint()">
            💡 参悟密卷 [Tab]
          </button>
          <button class="btn btn-secondary btn-action" onclick="window.taikouDuel.backspace()">
            ⌫ 撤销 [Backspace]
          </button>
        </div>
      </div>
    `;

    // 进场自动播放一次标准发音磨耳朵
    window.audioEngine.speak(word.en);
  }

  renderSlotsHtml(cleanWord) {
    let html = '';
    for (let i = 0; i < cleanWord.length; i++) {
      const isFilled = i < this.currentSpelling.length;
      const isActive = i === this.currentSpelling.length;
      const char = isFilled ? this.currentSpelling[i].toUpperCase() : '';
      html += `
        <div class="letter-tile ${isFilled ? 'filled' : ''} ${isActive ? 'active' : ''}">
          ${char}
        </div>
      `;
    }
    return html;
  }

  inputLetter(letter) {
    if (!this.currentWordObj) return;

    const cleanWord = this.currentWordObj.en.toLowerCase().replace(/[^a-z]/g, '');
    const nextChar = cleanWord[this.currentSpelling.length];

    if (letter === nextChar) {
      // 命中正确字母！
      this.currentSpelling += letter;
      this.combo++;

      // 挥刀出招！
      this.triggerSwordStrike(true);

      // 刷新方块槽
      const slotsBox = document.getElementById('duel-slots-box');
      if (slotsBox) slotsBox.innerHTML = this.renderSlotsHtml(cleanWord);

      // 扣减对手血量
      const damage = Math.round(this.enemyMaxHp / cleanWord.length);
      this.enemyHp = Math.max(0, this.enemyHp - damage);
      const hpPct = Math.round((this.enemyHp / this.enemyMaxHp) * 100);
      const hpBar = document.getElementById('opp-hp-bar');
      if (hpBar) hpBar.style.width = `${hpPct}%`;

      // 单词完整拼完！
      if (this.currentSpelling.length === cleanWord.length) {
        this.onWordSuccess();
      }
    } else {
      // 拼错字母
      this.combo = 0;
      window.audioEngine.playMistake();
      const slotsBox = document.getElementById('duel-slots-box');
      if (slotsBox) {
        slotsBox.classList.add('shake-anim');
        setTimeout(() => slotsBox.classList.remove('shake-anim'), 300);
      }
    }
  }

  backspace() {
    if (this.currentSpelling.length > 0) {
      this.currentSpelling = this.currentSpelling.slice(0, -1);
      const cleanWord = this.currentWordObj.en.toLowerCase().replace(/[^a-z]/g, '');
      const slotsBox = document.getElementById('duel-slots-box');
      if (slotsBox) slotsBox.innerHTML = this.renderSlotsHtml(cleanWord);
    }
  }

  useHint() {
    if (!this.currentWordObj) return;
    const cleanWord = this.currentWordObj.en.toLowerCase().replace(/[^a-z]/g, '');
    if (this.currentSpelling.length < cleanWord.length) {
      const nextChar = cleanWord[this.currentSpelling.length];
      this.inputLetter(nextChar);
    }
  }

  /**
   * 触发拔刀剑术秘技
   */
  triggerSwordStrike(isHit) {
    const heroBox = document.getElementById('duel-hero-box');
    const enemyBox = document.getElementById('duel-enemy-box');
    const banner = document.getElementById('skill-banner');

    // 随机展示战国秘技横幅
    if (banner) {
      banner.textContent = this.swordSkills[Math.floor(Math.random() * this.swordSkills.length)];
      banner.classList.remove('hidden');
      setTimeout(() => banner.classList.add('hidden'), 500);
    }

    // 英雄突刺斩击
    if (heroBox) {
      heroBox.classList.add('hero-slash-anim');
      setTimeout(() => heroBox.classList.remove('hero-slash-anim'), 220);
    }

    // 音效
    window.audioEngine.playSlash();

    // 刀光
    const fxLayer = document.getElementById('duel-fx-overlay');
    if (fxLayer) {
      const slash = document.createElement('div');
      slash.className = 'slash-wave-fx';
      slash.textContent = '⚔️💥';
      fxLayer.appendChild(slash);
      setTimeout(() => slash.remove(), 260);
    }

    // 对手受击闪烁
    if (enemyBox) {
      setTimeout(() => {
        enemyBox.classList.add('enemy-hit-anim');
        setTimeout(() => enemyBox.classList.remove('enemy-hit-anim'), 250);
      }, 100);
    }
  }

  onWordSuccess() {
    window.audioEngine.speak(this.currentWordObj.en);

    // 记录掌握度与奖励
    window.progressManager.recordWordResult(this.currentWordObj.en, true);
    window.heroManager.addReward(25, 20); // 25功勋，20贯

    const enemyAvatar = document.getElementById('opp-avatar');
    if (enemyAvatar) {
      enemyAvatar.classList.add('enemy-ko-anim');
    }

    setTimeout(() => {
      this.currentIndex++;
      this.loadNextOpponent();
    }, 700);
  }

  onDojoVictory() {
    window.audioEngine.playPromotionFanfare();
    window.ui.showVictoryModal({
      mode: 'daily',
      totalMerit: 80,
      totalGold: 60,
      streakDays: window.progressManager.getStreakDays() + 1,
      words: this.wordsQueue
    });
  }
}

window.taikouDuel = new TaikouDuelEngine();
