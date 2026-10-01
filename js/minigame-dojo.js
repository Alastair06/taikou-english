/**
 * 太阁英语立志传 · 演武道场弓道修行 (Dojo Phonics Archery Minigame)
 * 经典复刻光荣《太阁立志传5》道场武艺弓术修业：
 * - 道场上靶位漂移，听标准美音发音，狙击正确的自然拼读音节与首辅音靶标
 * - 射中靶心靶木破裂迸发电光，强化拆音（Onset-Rime）与听音敏捷度
 * - 修行通关产出：军学武勋、贯高金币，并推进【军事·军学演武】主命！
 */

class DojoArcheryMinigame {
  constructor() {
    this.isActive = false;
    this.currentStep = 0;
    this.totalSteps = 3;
    this.score = 0;
    this.currentTarget = null;
    this.targets = [];
    this.animFrameId = null;
  }

  open() {
    this.isActive = true;
    this.currentStep = 0;
    this.score = 0;

    let modal = document.getElementById('modal-dojo-game');
    if (!modal) {
      this.createModal();
      modal = document.getElementById('modal-dojo-game');
    }

    this.initNextRound();
    modal.classList.remove('hidden');
    if (window.audioEngine) window.audioEngine.playTaikoDrum();
  }

  createModal() {
    const div = document.createElement('div');
    div.id = 'modal-dojo-game';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-dojo-container">
        <div class="modal-header">
          <h3>🏹 尾张演武道场 · 弓道自然拼读靶心狙击</h3>
          <button class="modal-close" onclick="window.dojoMinigame.close()">✕</button>
        </div>
        <div class="modal-body" style="padding: 16px;">
          <div class="dojo-top-bar">
            <div class="dojo-sensei">
              <span class="sensei-avatar">🥋</span>
              <span class="sensei-speech" id="dojo-speech-text">
                师范喝道：“凝神静气！听准单词发音，拉弓狙击包含正确拼读音节之飞靶！”
              </span>
            </div>
            <div class="dojo-step-indicator" id="dojo-step-indicator">
              试炼进度：1 / 3
            </div>
          </div>

          <div class="dojo-target-area">
            <div class="dojo-listen-panel">
              <button class="btn btn-secondary dojo-audio-btn" onclick="window.dojoMinigame.replayAudio()">
                🔊 点击重听标准原音
              </button>
              <div class="dojo-word-hint" id="dojo-word-hint">目标字词：???</div>
            </div>

            <!-- 弓道靶场画布/容器 -->
            <div class="dojo-shooting-range" id="dojo-shooting-range">
              <!-- 动态注入 3 个移动靶标 -->
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }

  close() {
    this.isActive = false;
    const modal = document.getElementById('modal-dojo-game');
    if (modal) modal.classList.add('hidden');
  }

  replayAudio() {
    if (this.currentTarget && window.audioEngine) {
      window.audioEngine.speak(this.currentTarget.en);
    }
  }

  initNextRound() {
    if (this.currentStep >= this.totalSteps) {
      this.finishTraining();
      return;
    }

    const stepEl = document.getElementById('dojo-step-indicator');
    if (stepEl) stepEl.textContent = `试炼进度：${this.currentStep + 1} / ${this.totalSteps}`;

    // 获取当前阶段词汇
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const curIdx = (window.progressManager && window.progressManager.state) ? window.progressManager.state.currentWordIndex : 0;
    const pool = allWords.slice(Math.max(0, curIdx - 5), curIdx + 6);
    const candidate = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : { en: 'cat', cn: '猫' };

    this.currentTarget = candidate;

    // 解析当前单词的首音节或首字母组合作为正确靶标
    const wordLower = candidate.en.toLowerCase();
    let correctSyllable = wordLower.length > 3 ? wordLower.slice(0, 2) : wordLower.slice(0, 1);
    
    // 生成两个干扰音节靶标
    const distractors = ['bl', 'ch', 'st', 'sh', 'tr', 'gr', 'sm', 'fl', 'dr', 'pl']
      .filter(s => s !== correctSyllable)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const options = [
      { text: correctSyllable.toUpperCase(), isCorrect: true },
      { text: distractors[0].toUpperCase(), isCorrect: false },
      { text: distractors[1].toUpperCase(), isCorrect: false }
    ].sort(() => Math.random() - 0.5);

    const hintEl = document.getElementById('dojo-word-hint');
    if (hintEl) {
      hintEl.innerHTML = `目标单词：<strong>${candidate.en}</strong> (${candidate.cn || ''}) 🎯 首音节为？`;
    }

    const range = document.getElementById('dojo-shooting-range');
    if (range) {
      range.innerHTML = options.map((opt, idx) => `
        <div class="archery-target-item target-${idx}" onclick="window.dojoMinigame.shootTarget(${opt.isCorrect}, this)">
          <div class="target-rings">🎯</div>
          <div class="target-label">${opt.text}</div>
        </div>
      `).join('');
    }

    // 播放单词发音
    setTimeout(() => {
      this.replayAudio();
    }, 200);
  }

  shootTarget(isCorrect, element) {
    if (!this.isActive) return;

    if (isCorrect) {
      element.classList.add('hit-correct');
      if (window.audioEngine) window.audioEngine.playSlashSuccess();
      
      const speech = document.getElementById('dojo-speech-text');
      if (speech) speech.innerHTML = `🎯 <strong>正中红心！</strong> 师范赞许：“好箭法！音节咬合精纯！”`;

      this.score += 1;
      this.currentStep += 1;

      setTimeout(() => {
        this.initNextRound();
      }, 1000);
    } else {
      element.classList.add('hit-wrong');
      if (window.audioEngine) window.audioEngine.playSlashMiss();
      
      const speech = document.getElementById('dojo-speech-text');
      if (speech) speech.innerHTML = `❌ <strong>偏离靶心！</strong> 师范指点：“再细听单词首发音！”`;

      setTimeout(() => {
        element.classList.remove('hit-wrong');
        this.replayAudio();
      }, 800);
    }
  }

  finishTraining() {
    this.isActive = false;
    const range = document.getElementById('dojo-shooting-range');
    if (range) {
      range.innerHTML = `
        <div class="dojo-finish-box">
          <div class="finish-icon">🏹🎌</div>
          <h3>道场弓道修业圆满达成！</h3>
          <p>师范赐予修业状：武艺大进，自然拼读心法更上一层楼！</p>
          <div class="dojo-reward-bar">
            <span>🏅 军学功勋 +35</span>
            <span>🪙 贯高 +25</span>
          </div>
          <button class="btn btn-primary btn-lg" onclick="window.dojoMinigame.close()">
            谢师范教诲！退出道场
          </button>
        </div>
      `;
    }

    // 结算奖励
    if (window.heroManager) {
      window.heroManager.addMerit(35);
      window.heroManager.addGold(25);
    }

    // 推进主命进度
    if (window.questSystem) {
      window.questSystem.progressQuest('military', 1);
    }

    // 检查是否解锁称号或秘技卡
    if (window.cardsManager) {
      window.cardsManager.unlockCard('skill-yanfan');
    }

    if (window.audioEngine) window.audioEngine.playVictoryFanfare();
  }
}

if (typeof window !== 'undefined') {
  window.dojoMinigame = new DojoArcheryMinigame();
}
