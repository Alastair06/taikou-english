/**
 * 太阁英语立志传 · 太阁卡片系统 (Taikou Cards & Phonics Secret Arts)
 * 复刻光荣《太阁立志传5》卡片一览与秘技收集系统：
 * - 🎴 秘技卡 (Skill Cards)：装备后在战役副本中触发自然拼读剑气、护盾、必杀
 * - 🏆 称号卡 (Title Cards)：达成特定成就解锁，赋予全局被动增益
 * - 📜 名将卡 (Hero Cards)：结交战国名将，解锁双语典故与助战特权
 */

const TAIKOU_CARDS_DATABASE = {
  skills: [
    {
      id: 'skill-yanfan',
      name: '秘技 · 燕返',
      icon: '⚔️⚡',
      rarity: 'SSR',
      category: 'skill',
      unlocked: true,
      tag: '盲拼连斩',
      rule: '连续 2 次无提示独立拼对时，斩出双重凌厉剑气，击破当前敌人并额外获得 20 贯！',
      effect: 'double_kill',
      desc: '相传剑圣佐佐木小次郎之绝技，拼读如飞者方能顿悟。'
    },
    {
      id: 'skill-magice',
      name: '秘技 · 烈火之阵',
      icon: '🔥🪄',
      rarity: 'SR',
      category: 'skill',
      unlocked: true,
      tag: 'Magic E 破甲',
      rule: '击破含 Magic E 规则单词（元音+辅音+e，如 name, fine, home）时，迸发全屏烈焰，金币 +50%！',
      effect: 'magic_e_burst',
      desc: '织田家火器奥义，让沉睡的元音字母发出原本的字母音！'
    },
    {
      id: 'skill-ironwall',
      name: '秘技 · 金刚不坏',
      icon: '🛡️✨',
      rarity: 'SR',
      category: 'skill',
      unlocked: false,
      reqDesc: '官位达到【目付官】或药庐调药 2 次解锁',
      tag: '免伤护盾',
      rule: '地牢战斗中首次拼写失误时不扣除心心 ❤️，自动转为高亮拼读点拨！',
      effect: 'death_save',
      desc: '如同穿着黑漆南蛮铠，心如止水，从容化解拼读险境。'
    },
    {
      id: 'skill-thunder',
      name: '秘技 · 奔雷长音',
      icon: '⚡🌩️',
      rarity: 'SSR',
      category: 'skill',
      unlocked: false,
      reqDesc: '掌握 15 个长元音单词解锁',
      tag: '长元音破阵',
      rule: '拼出长元音双字母组合（如 ee, ea, oo）时，引动九天玄雷，直接击穿敌人半数生命！',
      effect: 'long_vowel_thunder',
      desc: '双字母共振如雷霆万钧，势不可挡！'
    },
    {
      id: 'skill-bargain-king',
      name: '秘技 · 算术巧舌',
      icon: '🪙🏷️',
      rarity: 'R',
      category: 'skill',
      unlocked: false,
      reqDesc: '商馆成功砍价 2 次解锁',
      tag: '商道奇术',
      rule: '在南蛮商馆或各町买卖时，砍价题目排除 1 个错误选项，且额外打 9 折！',
      effect: 'trade_discount',
      desc: '界港豪商今井宗久亲授商术心经。'
    }
  ],

  titles: [
    {
      id: 'title-novice',
      name: '初阵草鞋小厮',
      icon: '🛖',
      rarity: 'R',
      category: 'title',
      unlocked: true,
      perk: '基础属性无修正',
      desc: '初入织田家侍奉左右，胸怀天下大志。'
    },
    {
      id: 'title-pioneer',
      name: '破阵先锋大将',
      icon: '🚩',
      rarity: 'SR',
      category: 'title',
      unlocked: false,
      reqDesc: '完成 2 次天守阁主命解锁',
      perk: '出征战役初始心心生命 +1 ❤️',
      desc: '临危受命勇冠三军，信长御赐大赤母衣！'
    },
    {
      id: 'title-teasaint',
      name: '茶道宗匠',
      icon: '🍵',
      rarity: 'SR',
      category: 'title',
      unlocked: false,
      reqDesc: '茶室翻牌消消乐通关 2 次解锁',
      perk: '茶室修行金币翻倍，禅心护盾持续时间加倍',
      desc: '千利休赞叹：“此子胸中自有山水，一碗茶汤洗尽战阵征尘。”'
    },
    {
      id: 'title-merchant',
      name: '日进斗金 · 豪商',
      icon: '💎',
      rarity: 'SSR',
      category: 'title',
      unlocked: false,
      reqDesc: '累积军资金达到 300 贯解锁',
      perk: '所有战斗与主命金币奖励永久 +20%',
      desc: '手握东海道商脉，富可敌国之战国豪商！'
    },
    {
      id: 'title-master',
      name: '天下第一 · 拼读剑豪',
      icon: '👑',
      rarity: 'UR',
      category: 'title',
      unlocked: false,
      reqDesc: '累积掌握 30 个单词解锁',
      perk: '全拼读秘技威力提升 50%，战马行军速度 +25%',
      desc: '剑气所及，字母归位，天下英雄莫敢争锋！'
    }
  ],

  heroes: [
    {
      id: 'hero-nobunaga',
      name: '织田信长',
      title: '第六天魔王 · 尾张霸主',
      icon: '👺',
      rarity: 'UR',
      unlocked: true,
      bioEn: 'Oda Nobunaga: A visionary warlord who began the unification of Japan.',
      bioCn: '织田信长：破旧立新的战国风云儿，以天下布武为志，提携木下藤吉郎于微末之中。',
      bondLevel: 3
    },
    {
      id: 'hero-hideyoshi',
      name: '木下藤吉郎',
      title: '日轮之子 · 太阁秀吉',
      icon: '🥷',
      rarity: 'UR',
      unlocked: true,
      bioEn: 'Kinoshita Tokichiro: From humble beginnings to the ruler of Japan.',
      bioCn: '木下藤吉郎：本作主角。聪明勤勉，凭借英语拼读智慧从暖鞋小厮一路逆袭为关白太阁！',
      bondLevel: 5
    },
    {
      id: 'hero-toshiie',
      name: '前田利家',
      title: '枪之又左 · 豪杰先锋',
      icon: '🦁',
      rarity: 'SSR',
      unlocked: true,
      bioEn: 'Maeda Toshiie: A fierce spear master and loyal friend to Tokichiro.',
      bioCn: '前田利家：织田家头号猛将，藤吉郎终生挚友。率长枪队冲锋陷阵，拼写卡壳时长枪破空提示！',
      bondLevel: 3
    },
    {
      id: 'hero-hidenaga',
      name: '木下小一郎（秀长）',
      title: '筑城贤佐 · 错题军师',
      icon: '📜',
      rarity: 'SSR',
      unlocked: true,
      bioEn: 'Hashiba Hidenaga: The indispensable strategist and devoted younger brother.',
      bioCn: '木下秀长：藤吉郎胞弟兼智囊。专攻错题案卷，每日整理易错词汇为兄长分忧！',
      bondLevel: 4
    },
    {
      id: 'hero-rikyu',
      name: '千利休（千宗易）',
      title: '和敬清寂 · 绝代茶圣',
      icon: '🍵',
      rarity: 'SSR',
      unlocked: true,
      bioEn: 'Sen no Rikyu: The legendary tea master who perfected the Japanese tea ceremony.',
      bioCn: '千利休：界港茶道宗师，将英语单词之音律融入茶器翻转之间，传授禅心护盾。',
      bondLevel: 3
    }
  ]
};

class TaikouCardsManager {
  constructor() {
    this.storageKey = 'taikou_english_cards_v3';
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      equippedSkills: ['skill-yanfan', 'skill-magice'],
      equippedTitle: 'title-novice',
      unlockedCardIds: [
        'skill-yanfan',
        'skill-magice',
        'title-novice',
        'hero-nobunaga',
        'hero-hideyoshi',
        'hero-toshiie',
        'hero-hidenaga',
        'hero-rikyu'
      ]
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return { ...this.getDefaultState(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Cards data load error:', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Cards data save error:', e);
    }
  }

  isUnlocked(cardId) {
    return this.state.unlockedCardIds.includes(cardId);
  }

  unlockCard(cardId) {
    if (!this.isUnlocked(cardId)) {
      this.state.unlockedCardIds.push(cardId);
      this.saveState();
      
      const card = this.getCardById(cardId);
      if (card && window.ui) {
        window.ui.showToast(`🎉 习得太阁卡片：【${card.name}】！`, '🎴');
        if (window.audioEngine) window.audioEngine.playVictoryFanfare();
      }
    }
  }

  getCardById(cardId) {
    for (let list of [TAIKOU_CARDS_DATABASE.skills, TAIKOU_CARDS_DATABASE.titles, TAIKOU_CARDS_DATABASE.heroes]) {
      const found = list.find(c => c.id === cardId);
      if (found) return found;
    }
    return null;
  }

  equipSkill(skillId) {
    if (!this.isUnlocked(skillId)) return false;
    const idx = this.state.equippedSkills.indexOf(skillId);
    if (idx !== -1) {
      this.state.equippedSkills.splice(idx, 1);
      this.saveState();
      return true;
    }

    const maxSlots = 3;
    if (this.state.equippedSkills.length >= maxSlots) {
      this.state.equippedSkills.shift();
    }
    this.state.equippedSkills.push(skillId);
    this.saveState();
    return true;
  }

  equipTitle(titleId) {
    if (!this.isUnlocked(titleId)) return false;
    this.state.equippedTitle = titleId;
    this.saveState();
    return true;
  }

  getEquippedSkills() {
    return this.state.equippedSkills
      .map(id => TAIKOU_CARDS_DATABASE.skills.find(s => s.id === id))
      .filter(Boolean);
  }

  getEquippedTitle() {
    return TAIKOU_CARDS_DATABASE.titles.find(t => t.id === this.state.equippedTitle) || TAIKOU_CARDS_DATABASE.titles[0];
  }

  hasSkill(skillEffect) {
    const active = this.getEquippedSkills();
    return active.some(s => s.effect === skillEffect);
  }

  openCardsBookModal(activeTab = 'skills') {
    let modal = document.getElementById('modal-cards-book');
    if (!modal) {
      this.createCardsBookModal();
      modal = document.getElementById('modal-cards-book');
    }
    this.renderCardsBook(activeTab);
    modal.classList.remove('hidden');
  }

  createCardsBookModal() {
    const div = document.createElement('div');
    div.id = 'modal-cards-book';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-container modal-cards-container">
        <div class="modal-header">
          <h3>🎴 太阁卡片绘卷一览 · 秘技与名将图鉴</h3>
          <button class="modal-close" onclick="document.getElementById('modal-cards-book').classList.add('hidden')">✕</button>
        </div>
        <div class="cards-book-tabs">
          <button class="card-tab-btn active" data-tab="skills" onclick="window.cardsManager.switchTab('skills')">⚔️ 拼读秘技卡</button>
          <button class="card-tab-btn" data-tab="titles" onclick="window.cardsManager.switchTab('titles')">🏆 太阁称号卡</button>
          <button class="card-tab-btn" data-tab="heroes" onclick="window.cardsManager.switchTab('heroes')">📜 战国名将传</button>
        </div>
        <div class="cards-book-body" id="cards-book-content"></div>
      </div>
    `;
    document.body.appendChild(div);
  }

  switchTab(tabName) {
    document.querySelectorAll('.card-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    this.renderCardsBook(tabName);
  }

  renderCardsBook(tab) {
    const container = document.getElementById('cards-book-content');
    if (!container) return;

    if (tab === 'skills') {
      const equippedIds = this.state.equippedSkills;
      const html = TAIKOU_CARDS_DATABASE.skills.map(card => {
        const unlocked = this.isUnlocked(card.id);
        const isEquipped = equippedIds.includes(card.id);
        return `
          <div class="taikou-card-box ${unlocked ? 'card-unlocked' : 'card-locked'} ${isEquipped ? 'card-equipped' : ''}"
               onclick="${unlocked ? `window.cardsManager.toggleCardEquip('${card.id}', 'skills')` : ''}">
            <div class="card-rarity-badge ${card.rarity.toLowerCase()}">${card.rarity}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-title">${card.name}</div>
            <div class="card-tag">${card.tag}</div>
            <div class="card-rule">${card.rule}</div>
            <div class="card-status-label">
              ${!unlocked ? `🔒 ${card.reqDesc || '未习得'}` : (isEquipped ? '✅ 战斗装备中 (点击卸下)' : '⚡ 点击装备')}
            </div>
          </div>
        `;
      }).join('');
      container.innerHTML = `
        <div class="cards-tips-bar">
          💡 点击已掌握的秘技卡，可装备到战斗槽位（最多同时装备 3 张秘技卡）。
        </div>
        <div class="cards-grid">${html}</div>
      `;
    } else if (tab === 'titles') {
      const equippedTitle = this.state.equippedTitle;
      const html = TAIKOU_CARDS_DATABASE.titles.map(card => {
        const unlocked = this.isUnlocked(card.id);
        const isEquipped = equippedTitle === card.id;
        return `
          <div class="taikou-card-box ${unlocked ? 'card-unlocked' : 'card-locked'} ${isEquipped ? 'card-equipped' : ''}"
               onclick="${unlocked ? `window.cardsManager.toggleCardEquip('${card.id}', 'titles')` : ''}">
            <div class="card-rarity-badge ${card.rarity.toLowerCase()}">${card.rarity}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-title">${card.name}</div>
            <div class="card-rule"><strong>特权加成：</strong>${card.perk}</div>
            <div class="card-desc">${card.desc}</div>
            <div class="card-status-label">
              ${!unlocked ? `🔒 ${card.reqDesc || '未达成'}` : (isEquipped ? '👑 当前佩戴中' : '✨ 点击佩戴')}
            </div>
          </div>
        `;
      }).join('');
      container.innerHTML = `
        <div class="cards-tips-bar">
          🏆 佩戴威震天下的太阁称号，享有专属被动属性加成与大名特权！
        </div>
        <div class="cards-grid">${html}</div>
      `;
    } else if (tab === 'heroes') {
      const html = TAIKOU_CARDS_DATABASE.heroes.map(card => {
        const unlocked = this.isUnlocked(card.id);
        return `
          <div class="taikou-card-box card-hero ${unlocked ? 'card-unlocked' : 'card-locked'}">
            <div class="card-rarity-badge ur">${card.rarity}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-title">${card.name}</div>
            <div class="card-hero-sub">${card.title}</div>
            <div class="card-hero-bio">
              <p class="hero-bio-en">“${card.bioEn}”</p>
              <p class="hero-bio-cn">${card.bioCn}</p>
            </div>
            <div class="card-status-label">
              ${unlocked ? `🤝 羁绊度：${'★'.repeat(card.bondLevel || 3)}` : '🔒 未结交'}
            </div>
          </div>
        `;
      }).join('');
      container.innerHTML = `
        <div class="cards-tips-bar">
          📜 结识战国名将，双语典故与家臣助战！
        </div>
        <div class="cards-grid">${html}</div>
      `;
    }
  }

  toggleCardEquip(cardId, type) {
    if (type === 'skills') {
      this.equipSkill(cardId);
      if (window.ui) window.ui.showToast('秘技卡装备状态已更新！', '⚔️');
    } else if (type === 'titles') {
      this.equipTitle(cardId);
      if (window.ui) window.ui.showToast('已佩戴新称号！', '👑');
    }
    this.renderCardsBook(type);
  }
}

if (typeof window !== 'undefined') {
  window.cardsManager = new TaikouCardsManager();
}
