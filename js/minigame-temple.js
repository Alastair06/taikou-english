/**
 * 太阁英语立志传 · 京都大德寺经卷院 (Temple Sentence Assembly Minigame)
 * 经典复刻光荣《太阁立志传5》礼法/汉诗修行：
 * - 拜访京都大德寺古刹名僧，静坐禅修
 * - 禅宗卷轴上展出三年级日常核心交际句型
 * - 听音辨意，将散落的竹简经卷碎片按纯正英语语序依次拼接归位
 * - 闭环收益：顿悟语感，功勋 +35，赠予【破招洞察卷轴】入囊！
 */

const TEMPLE_SENTENCES = [
  {
    id: 's-1',
    full: 'Nice to meet you.',
    audio: 'Nice to meet you.',
    cn: '很高兴认识你。',
    tokens: ['Nice', 'to', 'meet', 'you.'],
    hint: '礼节相见问候，Nice 开头，to 紧跟动词'
  },
  {
    id: 's-2',
    full: 'What is your name?',
    audio: 'What is your name?',
    cn: '你叫什么名字？',
    tokens: ['What', 'is', 'your', 'name?'],
    hint: '特殊疑问句，疑问词 What 居首'
  },
  {
    id: 's-3',
    full: 'My name is Mike.',
    audio: 'My name is Mike.',
    cn: '我的名字是迈克。',
    tokens: ['My', 'name', 'is', 'Mike.'],
    hint: '自我介绍陈述句：所有格 My + 名词 name'
  },
  {
    id: 's-4',
    full: 'Good morning, Miss White.',
    audio: 'Good morning, Miss White.',
    cn: '早上好，怀特女士。',
    tokens: ['Good', 'morning,', 'Miss', 'White.'],
    hint: '清晨道安：Good morning + 称呼'
  },
  {
    id: 's-5',
    full: 'This is my friend.',
    audio: 'This is my friend.',
    cn: '这是我的朋友。',
    tokens: ['This', 'is', 'my', 'friend.'],
    hint: '引见他人句型：This is + 关系'
  },
  {
    id: 's-6',
    full: 'I have a red pencil.',
    audio: 'I have a red pencil.',
    cn: '我有一支红色的铅笔。',
    tokens: ['I have', 'a red', 'pencil.'],
    hint: '主语 I + 动词 have + 冠词颜色 + 物品'
  },
  {
    id: 's-7',
    full: 'Open your book, please.',
    audio: 'Open your book, please.',
    cn: '请打开你的书。',
    tokens: ['Open', 'your', 'book,', 'please.'],
    hint: '祈使句动词原形 Open 开头，please 礼貌置尾'
  }
];

class TempleSentenceMinigame {
  constructor() {
    this.isOpen = false;
    this.container = null;
    this.currentRound = 0;
    this.totalRounds = 3; // 一次修行 3 卷
    this.selectedSentences = [];
    this.activeSentence = null;
    this.placedTokens = [];
    this.availableTokens = [];
  }

  init() {
    this.container = document.getElementById('modal-temple-game');
    if (!this.container) {
      this.createModal();
      this.container = document.getElementById('modal-temple-game');
    }
  }

  createModal() {
    const div = document.createElement('div');
    div.id = 'modal-temple-game';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-temple-container" style="max-width: 620px;">
        <div class="modal-header">
          <h3>⛩️ 京都大德寺 · 禅宗经卷拼装修行</h3>
          <button class="modal-close" onclick="window.templeMinigame.close()">✕</button>
        </div>
        <div class="modal-body" id="temple-modal-body" style="padding: 16px 20px;"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  open() {
    this.init();
    if (!this.container) return;

    window.audioEngine.unlockAudio();
    window.audioEngine.playTaikoDrum();

    this.isOpen = true;
    this.container.classList.remove('hidden');

    // 随机抽取 3 句
    const pool = [...TEMPLE_SENTENCES].sort(() => Math.random() - 0.5);
    this.selectedSentences = pool.slice(0, this.totalRounds);
    this.currentRound = 0;

    this.loadRound(0);
  }

  close() {
    if (this.container) this.container.classList.add('hidden');
    this.isOpen = false;
  }

  loadRound(index) {
    this.currentRound = index;
    this.activeSentence = this.selectedSentences[index];
    this.placedTokens = [];

    // 打乱词块
    const tokens = this.activeSentence.tokens.map((t, idx) => ({ id: 'token-' + idx, text: t, correctIdx: idx }));
    this.availableTokens = [...tokens].sort(() => Math.random() - 0.5);

    this.render();

    // 自动朗读全句
    setTimeout(() => {
      if (window.audioEngine) {
        window.audioEngine.speak(this.activeSentence.audio);
      }
    }, 300);
  }

  playAudio() {
    if (this.activeSentence && window.audioEngine) {
      window.audioEngine.speak(this.activeSentence.audio);
    }
  }

  render() {
    const body = document.getElementById('temple-modal-body');
    if (!body || !this.activeSentence) return;

    const s = this.activeSentence;
    const isRoundDone = this.placedTokens.length === s.tokens.length;

    // 插槽渲染
    const slotsHtml = s.tokens.map((_, idx) => {
      const placed = this.placedTokens[idx];
      if (placed) {
        return `
          <div class="temple-bamboo-slip is-placed" onclick="window.templeMinigame.returnToken(${idx})">
            <span>${placed.text}</span>
            <span class="slip-remove-hint">↩</span>
          </div>
        `;
      } else {
        return `
          <div class="temple-slot-empty">
            <span class="slot-idx-num">${idx + 1}</span>
          </div>
        `;
      }
    }).join('');

    // 备选竹简
    const tokensHtml = this.availableTokens.map((t, aIdx) => `
      <div class="temple-bamboo-slip is-selectable" onclick="window.templeMinigame.placeToken(${aIdx})">
        <span>${t.text}</span>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="temple-banner">
        <div class="temple-monk-avatar">🧘</div>
        <div class="temple-monk-text">
          <div class="temple-monk-title">大德寺主持 · 泽庵禅师</div>
          <div class="temple-monk-desc">“心如止水，语贯周全。听其音，明其意，将散佚经卷按语法序位复原吧！”</div>
        </div>
      </div>

      <div class="temple-round-indicator">
        <span>卷轴修行：第 <strong>${this.currentRound + 1}</strong> / ${this.totalRounds} 卷</span>
        <button class="btn btn-secondary btn-sm" onclick="window.templeMinigame.playAudio()">
          🔊 听高僧诵经
        </button>
      </div>

      <div class="temple-scroll-board">
        <div class="temple-scroll-header">
          <span class="scroll-seal">📜 经卷奥义</span>
          <span class="scroll-cn-mean">【中文意境】：${s.cn}</span>
        </div>

        <div class="temple-slots-row">
          ${slotsHtml}
        </div>

        <div class="temple-hint-row">
          <span>💡 禅师点拨：${s.hint}</span>
        </div>
      </div>

      <div class="temple-pool-wrap">
        <div class="temple-pool-title">🎋 待归位竹简词块（点击放入下一个插槽）：</div>
        <div class="temple-tokens-grid">
          ${tokensHtml.length > 0 ? tokensHtml : '<div style="color:#10b981;font-weight:700;padding:6px 0;">🎉 本卷经文已全部嵌入插槽！</div>'}
        </div>
      </div>

      <div class="temple-footer-actions">
        ${isRoundDone 
          ? `<button class="btn btn-primary btn-lg pulse" onclick="window.templeMinigame.verifyRound()">✨ 颂念经文 · 验证通卷！</button>`
          : `<span style="font-size:12px;color:#94a3b8;">请依次点击竹简，拼接成通顺英文句子</span>`
        }
      </div>
    `;
  }

  placeToken(availableIndex) {
    if (this.placedTokens.length >= this.activeSentence.tokens.length) return;
    const token = this.availableTokens.splice(availableIndex, 1)[0];
    if (!token) return;

    this.placedTokens.push(token);
    if (window.audioEngine) window.audioEngine.playKeyRune();
    this.render();
  }

  returnToken(placedIndex) {
    const token = this.placedTokens.splice(placedIndex, 1)[0];
    if (!token) return;

    this.availableTokens.push(token);
    if (window.audioEngine) window.audioEngine.playTone(320, 'sine', 0.1, 0.05);
    this.render();
  }

  verifyRound() {
    const s = this.activeSentence;
    const isCorrect = this.placedTokens.every((t, i) => t.text === s.tokens[i]);

    if (isCorrect) {
      if (window.audioEngine) {
        window.audioEngine.playVictoryFanfare();
        window.audioEngine.speak(s.audio);
      }

      if (window.ui) {
        window.ui.showToast(`🎉 经卷通达！“${s.full}” 诵读圆满！`, '📜');
      }

      if (this.currentRound + 1 < this.totalRounds) {
        setTimeout(() => {
          this.loadRound(this.currentRound + 1);
        }, 1200);
      } else {
        this.handleCompleteAll();
      }
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
      }
      if (window.ui) {
        window.ui.showToast('禅师摇头轻叹：“语序尚有偏颇，点击竹简可取回重新斟酌。”', '💭');
      }
    }
  }

  handleCompleteAll() {
    const body = document.getElementById('temple-modal-body');
    if (!body) return;

    // 结算奖励
    if (window.heroManager) {
      window.heroManager.addMerit(35);
      window.heroManager.addGold(30);
      window.heroManager.addItem('item-scroll', 1);
    }

    // 推进主命
    if (window.questSystem) {
      window.questSystem.progressQuest('any', 1);
    }

    body.innerHTML = `
      <div class="temple-victory-card">
        <div class="temple-big-icon">⛩️✨</div>
        <h3>大德寺主持合十赞道：“善哉！少侠慧根深种，句意通达！”</h3>
        <p>三卷经文尽数勘破，礼法语序功力大增！泽庵禅师特赠宝卷入行囊！</p>
        <div class="temple-rewards-box">
          <div class="t-reward-pill">🏅 礼法功勋 <strong>+35</strong></div>
          <div class="t-reward-pill">🪙 军资金 <strong>+30 贯</strong></div>
          <div class="t-reward-pill">📜 破招洞察卷轴 <strong>+1</strong>（已入背包）</div>
        </div>
        <div style="margin-top:20px;">
          <button class="btn btn-primary btn-lg" onclick="window.templeMinigame.finish()">
            受领奥义 · 离开大德寺
          </button>
        </div>
      </div>
    `;
  }

  finish() {
    this.close();
    if (window.taikouTown) {
      window.taikouTown.updateHUD();
    }
  }
}

if (typeof window !== 'undefined') {
  window.templeMinigame = new TempleSentenceMinigame();
}
