/**
 * ============================================================================
 * 太阁英语立志传 · 战术卡牌决斗引擎 (Tactical Card Battle Engine)
 * 灵感源自《杀戮尖塔》《炉石传说》：
 * - 纯正卡牌策略博弈，彻底摒弃做题考卷感！
 * - 0 英语基础无门槛：靠红蓝绿颜色、剑盾图标、数值即可直觉出牌！
 * - 点击即发音：真人战吼 + 即时物理打击/护盾/治愈视觉反馈，无痛自然习得！
 * - 敌人意图预警 (Intent System)：盘算算力、见招拆招！
 * - 战利品三选一 (Card Drafting)：每胜一战从 3 张新卡中挑选 1 张永久强化卡组！
 * ============================================================================
 */

class CardBattleEngine {
  constructor() {
    this.isActive = false;
    this.stageNum = 1;
    this.turn = 1;

    // 主角属性
    this.heroMaxHp = 30;
    this.heroHp = 30;
    this.heroBlock = 0;
    this.heroMaxEnergy = 3;
    this.heroEnergy = 3;
    this.heroStrength = 0; // 攻击力增益

    // 敌将属性
    this.enemy = {
      name: '尾张先锋守备',
      title: '城砦先锋',
      avatar: 'assets/characters/goblin.png',
      hp: 36,
      maxHp: 36,
      block: 0,
      intent: { type: 'attack', value: 7, icon: '⚔️', text: '准备挥砍斩击' }
    };

    // 牌库系统 (Draw Pile / Hand / Discard Pile)
    this.persistentDeck = this.loadPersistentDeck();
    this.drawPile = [];
    this.hand = [];
    this.discardPile = [];

    // 核心卡牌数据库
    this.cardDatabase = this.initCardDatabase();

    // 战胜回调
    this.onVictoryCallback = null;
    this.onDefeatCallback = null;
  }

  /**
   * 初始化核心卡牌数据库 (极简直觉、强视觉动作词汇)
   */
  initCardDatabase() {
    return {
      // 基础核心卡 (Starter Cards)
      slash: {
        id: 'slash',
        en: 'Slash',
        cn: '斩击',
        type: 'attack',
        cost: 1,
        icon: '⚔️',
        dmg: 8,
        block: 0,
        heal: 0,
        vfx: 'slash',
        desc: '造成 8 点物理伤害'
      },
      guard: {
        id: 'guard',
        en: 'Guard',
        cn: '格挡',
        type: 'defense',
        cost: 1,
        icon: '🛡️',
        dmg: 0,
        block: 6,
        heal: 0,
        vfx: 'shield',
        desc: '获得 6 点防御护甲'
      },
      shoot: {
        id: 'shoot',
        en: 'Shoot',
        cn: '射击',
        type: 'attack',
        cost: 1,
        icon: '🏹',
        dmg: 6,
        block: 0,
        pierce: true,
        vfx: 'arrow',
        desc: '射出穿甲箭！造成 6 点真实穿甲伤害'
      },
      heal: {
        id: 'heal',
        en: 'Heal',
        cn: '治愈',
        type: 'skill',
        cost: 2,
        icon: '💚',
        dmg: 0,
        block: 0,
        heal: 8,
        vfx: 'heal',
        desc: '运转生机！恢复 8 点生命值'
      },
      strike: {
        id: 'strike',
        en: 'Strike',
        cn: '突刺',
        type: 'attack',
        cost: 1,
        icon: '⚡',
        dmg: 7,
        block: 0,
        vfx: 'strike',
        desc: '枪出如龙！造成 7 点凌厉伤害'
      },
      dodge: {
        id: 'dodge',
        en: 'Dodge',
        cn: '闪避',
        type: 'defense',
        cost: 1,
        icon: '🌀',
        dmg: 0,
        block: 4,
        draw: 1,
        vfx: 'shield',
        desc: '敏捷身法！获得 4 点护甲并摸 1 张牌'
      },

      // 进阶战利品卡 (Reward Cards)
      double_slash: {
        id: 'double_slash',
        en: 'Double Slash',
        cn: '双重连斩',
        type: 'attack',
        cost: 2,
        icon: '⚔️⚔️',
        dmg: 7,
        hits: 2,
        vfx: 'slash',
        desc: '连续劈出两刀！共造成 14 点爆发伤害'
      },
      iron_wall: {
        id: 'iron_wall',
        en: 'Iron Wall',
        cn: '铁壁',
        type: 'defense',
        cost: 2,
        icon: '🛡️🛡️',
        dmg: 0,
        block: 14,
        vfx: 'shield',
        desc: '坚不可摧！获得 14 点巨额护甲'
      },
      war_cry: {
        id: 'war_cry',
        en: 'War Cry',
        cn: '战吼',
        type: 'skill',
        cost: 1,
        icon: '📢',
        dmg: 0,
        strength: 3,
        vfx: 'charge',
        desc: '鼓舞全军！本场战斗攻击力永久 +3'
      },
      piercing_arrow: {
        id: 'piercing_arrow',
        en: 'Piercing Arrow',
        cn: '破甲长矢',
        type: 'attack',
        cost: 1,
        icon: '🏹💥',
        dmg: 10,
        pierce: true,
        vfx: 'arrow',
        desc: '无视防御！直接对敌方生命造成 10 穿甲伤害'
      },
      heavy_strike: {
        id: 'heavy_strike',
        en: 'Heavy Strike',
        cn: '霸道重击',
        type: 'attack',
        cost: 2,
        icon: '🔨',
        dmg: 16,
        vfx: 'strike',
        desc: '运足气力！造成 16 点摧枯拉朽的重伤'
      },
      first_aid: {
        id: 'first_aid',
        en: 'First Aid',
        cn: '急救包扎',
        type: 'skill',
        cost: 1,
        icon: '🩹',
        dmg: 0,
        heal: 6,
        vfx: 'heal',
        desc: '临阵包扎！消耗 1 能量恢复 6 生命'
      },
      focus: {
        id: 'focus',
        en: 'Focus',
        cn: '明镜止水',
        type: 'skill',
        cost: 0,
        icon: '🧘',
        dmg: 0,
        energy: 1,
        draw: 1,
        vfx: 'charge',
        desc: '凝神静气！恢复 1 点能量并摸 1 张牌'
      },
      poison_blade: {
        id: 'poison_blade',
        en: 'Poison Blade',
        cn: '淬毒刃',
        type: 'attack',
        cost: 1,
        icon: '🧪',
        dmg: 5,
        poison: 3,
        vfx: 'slash',
        desc: '幽绿淬毒！造成 5 伤害并施加 3 层剧毒'
      },

      // 历史特殊机关战役限定神卡 (Stage Relic Cards)
      thunderstorm: {
        id: 'thunderstorm',
        en: 'Thunderstorm',
        cn: '雷暴神威',
        type: 'special',
        cost: 2,
        icon: '⛈️⚡',
        dmg: 18,
        vfx: 'thunder',
        desc: '【桶狭间秘宝】借九天雷霆轰击！造成 18 点雷电重创'
      },
      palisade: {
        id: 'palisade',
        en: 'Palisade',
        cn: '神速防栅',
        type: 'special',
        cost: 1,
        icon: '🪵🛡️',
        dmg: 0,
        block: 12,
        vfx: 'wood',
        desc: '【墨俣秘宝】一昼夜拔地耸立马防栅！获得 12 点坚固护甲'
      },

      // 随行家臣专属战术支援神卡 (Companion Signature Cards)
      eat: {
        id: 'eat',
        en: 'Eat',
        cn: '进食 (饭团)',
        type: 'skill',
        cost: 0,
        icon: '🍙',
        heal: 8,
        draw: 1,
        vfx: 'heal',
        isCompanion: true,
        desc: '【宁宁手作饭团】大快朵颐！恢复 8 点生命并抽 1 张牌'
      },
      read: {
        id: 'read',
        en: 'Read',
        cn: '察阅 (军机)',
        type: 'defense',
        cost: 0,
        icon: '📖',
        block: 8,
        draw: 1,
        vfx: 'shield',
        isCompanion: true,
        desc: '【秀长军机账本】熟读虚实！获得 8 点护盾并抽 1 张牌'
      },
      brave: {
        id: 'brave',
        en: 'Brave',
        cn: '勇武 (突锋)',
        type: 'attack',
        cost: 0,
        icon: '🦁',
        strength: 4,
        vfx: 'charge',
        isCompanion: true,
        desc: '【利家枪之又左】并肩勇武！本回合所有攻击伤害 +4'
      },
      plan: {
        id: 'plan',
        en: 'Plan',
        cn: '奇谋 (妙策)',
        type: 'skill',
        cost: 0,
        icon: '🪭',
        draw: 2,
        vfx: 'charge',
        isCompanion: true,
        desc: '【半兵卫今孔明】运筹帷幄！立即从抽牌堆摸 2 张牌'
      },
      wind: {
        id: 'wind',
        en: 'Wind',
        cn: '疾风 (如风)',
        type: 'attack',
        cost: 0,
        icon: '🐎💨',
        dmg: 10,
        block: 4,
        vfx: 'charge',
        isCompanion: true,
        desc: '【武田赤备如风】其疾如风！造成 10 点爆发伤害并获得 4 点冲锋护甲'
      },
      dragon: {
        id: 'dragon',
        en: 'Dragon',
        cn: '龙啸 (双刃)',
        type: 'attack',
        cost: 0,
        icon: '🐉⚡',
        dmg: 12,
        pierce: true,
        vfx: 'slash',
        isCompanion: true,
        desc: '【独眼龙狂澜秘剑】龙啸雷霆！造成 12 点真实穿甲伤害'
      },

      // 人教版新课标核心词汇战术卡 (Curriculum Core Vocabulary Cards)
      meet: {
        id: 'meet',
        en: 'Meet',
        cn: '相会 (结识)',
        type: 'skill',
        cost: 0,
        icon: '🤝',
        draw: 2,
        vfx: 'charge',
        isTextbook: true,
        desc: '【Unit 1 核心词】结识新战友！立即抽 2 张战术手牌'
      },
      friend: {
        id: 'friend',
        en: 'Friend',
        cn: '知己 (连携)',
        type: 'attack',
        cost: 1,
        icon: '🧑‍🤝‍🧑',
        dmg: 11,
        vfx: 'strike',
        isTextbook: true,
        desc: '【Unit 1 核心词】知己同心！呼唤随行战友合力突刺 11 伤'
      },
      nice: {
        id: 'nice',
        en: 'Nice',
        cn: '惬意 (怡神)',
        type: 'skill',
        cost: 1,
        icon: '😊',
        heal: 6,
        block: 6,
        vfx: 'heal',
        isTextbook: true,
        desc: '【Unit 1 核心词】心情愉悦！恢复 6 生命并获得 6 护盾'
      },
      book: {
        id: 'book',
        en: 'Book',
        cn: '兵书 (典籍)',
        type: 'skill',
        cost: 1,
        icon: '📕',
        energy: 1,
        draw: 1,
        vfx: 'charge',
        isTextbook: true,
        desc: '【Unit 2 核心词】研习兵书！恢复 1 气力并摸 1 张牌'
      },
      ruler: {
        id: 'ruler',
        en: 'Ruler',
        cn: '铁尺 (量衡)',
        type: 'attack',
        cost: 1,
        icon: '📏',
        dmg: 9,
        block: 3,
        vfx: 'strike',
        isTextbook: true,
        desc: '【Unit 2 核心词】矩不正不可为方！造成 9 伤害并获 3 护盾'
      },
      pencil: {
        id: 'pencil',
        en: 'Pencil',
        cn: '铅笔 (画策)',
        type: 'attack',
        cost: 1,
        icon: '✏️',
        dmg: 7,
        pierce: true,
        vfx: 'arrow',
        isTextbook: true,
        desc: '【Unit 2 核心词】笔锋如剑！造成 7 点真实穿甲伤害'
      },
      water: {
        id: 'water',
        en: 'Water',
        cn: '甘泉 (解渴)',
        type: 'skill',
        cost: 1,
        icon: '💧',
        heal: 10,
        vfx: 'heal',
        isTextbook: true,
        desc: '【高频生活词】清冽清泉！恢复 10 点生命值'
      },
      apple: {
        id: 'apple',
        en: 'Apple',
        cn: '红苹果 (粮草)',
        type: 'skill',
        cost: 0,
        icon: '🍎',
        heal: 5,
        vfx: 'heal',
        isTextbook: true,
        desc: '【高频生活词】清脆多汁的苹果！恢复 5 点生命'
      },
      look: {
        id: 'look',
        en: 'Look',
        cn: '观察 (洞悉)',
        type: 'defense',
        cost: 0,
        icon: '👀',
        block: 5,
        vfx: 'shield',
        isTextbook: true,
        desc: '【高频动作词】洞察敌将破绽！获得 5 护盾'
      },

      // 人教新课标三年级下册核心日常动词 (Action Verbs)
      run: {
        id: 'run',
        en: 'Run',
        cn: '疾跑 (奔袭)',
        type: 'attack',
        cost: 1,
        icon: '🏃💨',
        dmg: 7,
        block: 5,
        vfx: 'charge',
        isTextbook: true,
        desc: '【三年级动词】神速奔袭！造成 7 点伤害并获得 5 点护甲'
      },
      jump: {
        id: 'jump',
        en: 'Jump',
        cn: '飞跃 (腾跳)',
        type: 'defense',
        cost: 1,
        icon: '🦘⬆️',
        dmg: 0,
        block: 8,
        draw: 1,
        vfx: 'shield',
        isTextbook: true,
        desc: '【三年级动词】凌空腾跃！获得 8 点护甲并抽 1 张手牌'
      },
      fly: {
        id: 'fly',
        en: 'Fly',
        cn: '鹰击 (飞翔)',
        type: 'attack',
        cost: 1,
        icon: '🦅✨',
        dmg: 10,
        pierce: true,
        vfx: 'arrow',
        isTextbook: true,
        desc: '【三年级动词】天鹰破空！射出 10 点真实穿透伤害'
      },
      swim: {
        id: 'swim',
        en: 'Swim',
        cn: '游弋 (涉水)',
        type: 'skill',
        cost: 1,
        icon: '🏊‍♂️🌊',
        heal: 6,
        block: 4,
        vfx: 'heal',
        isTextbook: true,
        desc: '【三年级动词】如鱼得水！恢复 6 点生命并获得 4 点护甲'
      }
    };
  }

  /**
   * 读取或创建玩家的持久化战术卡组
   */
  loadPersistentDeck() {
    try {
      const saved = localStorage.getItem('taikou_card_deck');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed;
        }
      }
    } catch (e) {}

    // 默认初始新手卡组 (10 张平衡卡牌)
    return [
      'slash', 'slash', 'slash', 'slash',
      'guard', 'guard', 'guard', 'guard',
      'shoot', 'heal'
    ];
  }

  /**
   * 保存持久化卡组
   */
  savePersistentDeck() {
    try {
      localStorage.setItem('taikou_card_deck', JSON.stringify(this.persistentDeck));
    } catch (e) {}
  }

  /**
   * 将新卡永久加入玩家卡组
   */
  addCardToDeck(cardId) {
    if (this.cardDatabase[cardId]) {
      this.persistentDeck.push(cardId);
      this.savePersistentDeck();
      if (window.ui) {
        const c = this.cardDatabase[cardId];
        window.ui.showToast(`🎴 战术新卡【${c.en} · ${c.cn}】已永久加入卡组！`, '✨');
      }
    }
  }

  /**
   * 启动一场战术卡牌决斗 (Tactical Card Duel)
   */
  startBattle(config = {}) {
    this.isActive = true;
    this.stageNum = config.stageNum || 1;
    this.turn = 1;
    this.heroStrength = 0;
    this.heroBlock = 0;
    this.heroMaxEnergy = 3;
    this.heroEnergy = 3;
    this.onVictoryCallback = config.onVictory || null;
    this.onDefeatCallback = config.onDefeat || null;

    // 同步主角生命上限与当前生命
    const maxHearts = window.heroManager?.getMaxHearts ? window.heroManager.getMaxHearts() : 3;
    const curHearts = window.heroManager?.getCurrentHearts ? window.heroManager.getCurrentHearts() : 3;
    this.heroMaxHp = maxHearts * 10;
    this.heroHp = Math.max(10, curHearts * 10);

    // 家臣羁绊信物加成
    if (window.estateSystem?.hasRelic('relic-nene-sachet')) {
      this.heroMaxHp += 5;
      this.heroHp += 5;
    }
    if (window.estateSystem?.hasRelic('relic-toshiie-spear-tassel')) {
      this.heroStrength += 2;
    }

    // 配置敌将属性
    this.setupEnemy(this.stageNum, config.enemyConfig);

    // 获取当前随行家臣并注入首轮专属支援卡
    const comp = (window.estateSystem && window.estateSystem.getActiveCompanion)
      ? window.estateSystem.getActiveCompanion()
      : { id: 'hidenaga', name: '木下秀长', role: '错题军师', icon: '📜' };
    this.activeCompanion = comp;

    const companionCardMap = {
      nene: 'eat',
      hidenaga: 'read',
      toshiie: 'brave',
      hanbei: 'plan',
      shingen: 'wind',
      masamune: 'dragon'
    };
    const compCardId = companionCardMap[comp.id] || 'read';

    // 构建战斗抽牌堆 (洗牌)
    this.drawPile = [...this.persistentDeck].sort(() => 0.5 - Math.random());
    this.hand = [];
    this.discardPile = [];

    // 首轮必出：随行家臣专属战术支援卡置于堆顶！
    this.drawPile.push(compCardId);

    // 针对桶狭间与墨俣一夜城注入专属临时限定神卡
    if (this.stageNum === 5 || config.isOkehazama) {
      this.drawPile.push('thunderstorm');
    } else if (this.stageNum === 10 || config.isSunomata) {
      this.drawPile.push('palisade');
    }

    // 渲染战场视口
    this.renderBattleArena();

    // 鸣响开战太鼓
    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
      window.audioEngine.playTaikoDrum();
      setTimeout(() => window.audioEngine?.playTaikoDrum(), 160);
    }

    // 启动第 1 回合
    this.startTurn();
  }

  /**
   * 配置敌将档案与数值
   */
  setupEnemy(stageNum, customEnemy = null) {
    let name = `尾张守将 · 第 ${stageNum} 关`;
    let title = '守城大将';
    let hp = 32 + stageNum * 4;
    let baseAtk = 6 + Math.floor(stageNum * 0.8);
    let avatar = 'assets/characters/goblin.png';

    if (stageNum === 5) {
      name = '今川义元';
      title = '东海道第一弓取';
      hp = 55;
      baseAtk = 10;
      avatar = 'assets/portraits/nobunaga.jpg';
    } else if (stageNum === 10) {
      name = '斋藤防线大将 · 稻叶山先锋';
      title = '美浓总大将';
      hp = 70;
      baseAtk = 12;
      avatar = 'assets/portraits/shibata.jpg';
    } else if (stageNum === 25) {
      name = '武田信玄';
      title = '甲斐之虎 · 风林火山';
      hp = 105;
      baseAtk = 14;
      avatar = 'assets/portraits/shingen.jpg';
    } else if (stageNum === 35) {
      name = '伊达政宗';
      title = '独眼龙 · 奥州霸主';
      hp = 130;
      baseAtk = 16;
      avatar = 'assets/portraits/masamune.jpg';
    } else if (customEnemy) {
      name = customEnemy.name || name;
      title = customEnemy.title || title;
      hp = customEnemy.hp || hp;
      baseAtk = customEnemy.baseAtk || baseAtk;
      avatar = customEnemy.avatar || avatar;
    }

    this.enemy = {
      name,
      title,
      avatar,
      hp,
      maxHp: hp,
      block: 0,
      baseAtk,
      turnCount: 0,
      intent: { type: 'attack', value: baseAtk, icon: '⚔️', text: `挥刀猛攻 (${baseAtk} 伤)` }
    };
  }

  /**
   * 轮换生成敌方的下回合意图 (Intent AI)
   */
  rollEnemyIntent() {
    this.enemy.turnCount++;
    const t = this.enemy.turnCount;
    const base = this.enemy.baseAtk;

    // 特殊阶段 BOSS 意图轮换
    if (this.stageNum === 5) {
      // 桶狭间 今川义元
      if (t % 3 === 1) {
        this.enemy.intent = { type: 'attack', value: base, icon: '⚔️', text: `名弓连射 (${base} 伤)` };
      } else if (t % 3 === 2) {
        this.enemy.intent = { type: 'defend', value: 10, icon: '🛡️', text: `本阵护卫 (+10 护甲)` };
      } else {
        this.enemy.intent = { type: 'attack', value: base + 6, icon: '⛈️💥', text: `突击重创 (${base + 6} 伤！)` };
      }
      return;
    }

    if (this.stageNum === 10) {
      // 墨俣一夜城 斋藤大将
      if (t % 3 === 1) {
        this.enemy.intent = { type: 'attack', value: base, icon: '⚔️', text: `破阵重劈 (${base} 伤)` };
      } else if (t % 3 === 2) {
        this.enemy.intent = { type: 'defend', value: 12, icon: '🪵🛡️', text: `构筑拒马 (+12 护甲)` };
      } else {
        this.enemy.intent = { type: 'attack', value: base + 8, icon: '🔥', text: `放火焚城 (${base + 8} 伤！)` };
      }
      return;
    }

    if (this.stageNum === 25) {
      // 甲斐之虎 武田信玄 (风林火山)
      if (t % 3 === 1) {
        this.enemy.intent = { type: 'attack', value: base, icon: '🐎💨', text: `赤备如风突袭 (${base} 伤)` };
      } else if (t % 3 === 2) {
        this.enemy.intent = { type: 'defend', value: 15, icon: '⛰️🛡️', text: `不动如山军阵 (+15 护甲)` };
      } else {
        this.enemy.intent = { type: 'attack', value: base + 8, icon: '🔥💥', text: `侵掠如火猛攻 (${base + 8} 伤！)` };
      }
      return;
    }

    if (this.stageNum === 35) {
      // 奥州霸者 伊达政宗 (独眼龙)
      if (t % 3 === 1) {
        this.enemy.intent = { type: 'attack', value: base, icon: '🐉⚔️', text: `双刀龙牙狂岚 (${base} 伤)` };
      } else if (t % 3 === 2) {
        this.enemy.intent = { type: 'defend', value: 16, icon: '🌙🛡️', text: `黑漆金月守御 (+16 护甲)` };
      } else {
        this.enemy.intent = { type: 'attack', value: base + 10, icon: '💥⚡', text: `龙骑铁炮轰击 (${base + 10} 穿甲！)` };
      }
      return;
    }

    // 常规敌人意图 (攻击 ➔ 防守 ➔ 重攻)
    if (t % 3 === 1) {
      this.enemy.intent = { type: 'attack', value: base, icon: '⚔️', text: `蓄力突击 (${base} 伤)` };
    } else if (t % 3 === 2) {
      const defVal = Math.max(5, Math.floor(base * 0.9));
      this.enemy.intent = { type: 'defend', value: defVal, icon: '🛡️', text: `举盾坚守 (+${defVal} 护甲)` };
    } else {
      const heavyVal = base + 4;
      this.enemy.intent = { type: 'attack', value: heavyVal, icon: '💥', text: `凶猛重斩 (${heavyVal} 伤！)` };
    }
  }

  /**
   * 回合开始
   */
  startTurn() {
    this.heroEnergy = this.heroMaxEnergy;
    this.heroBlock = 0; // 回合初护甲重置
    this.enemy.block = 0; // 敌方护甲重置

    // 羁绊信物：武田信玄军配 (每回合初获得 3 点风林火山坚固护甲)
    if (window.estateSystem?.hasRelic('relic-shingen-war-fan')) {
      this.heroBlock += 3;
    }

    // 抽卡 (半兵卫军扇信物首回合多摸 1 张牌)
    let drawCount = 4;
    if (this.turn === 1 && window.estateSystem?.hasRelic('relic-hanbei-fan')) {
      drawCount += 1;
    }
    this.drawCards(drawCount);

    // 决定敌方本回合意图
    this.rollEnemyIntent();

    // 播放气力蓄满提示音
    if (window.audioEngine?.playEnergyCharge) {
      window.audioEngine.playEnergyCharge();
    }

    this.renderBattleArena();
  }

  /**
   * 从抽牌堆摸牌
   */
  drawCards(num = 1) {
    for (let i = 0; i < num; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        // 弃牌堆洗入抽牌堆
        this.drawPile = [...this.discardPile].sort(() => 0.5 - Math.random());
        this.discardPile = [];
      }
      if (this.drawPile.length > 0) {
        this.hand.push(this.drawPile.pop());
      }
    }
  }

  /**
   * 玩家点击打出一张手牌
   */
  playCard(index) {
    if (!this.isActive) return;
    if (index < 0 || index >= this.hand.length) return;

    const cardId = this.hand[index];
    const card = this.cardDatabase[cardId];
    if (!card) return;

    // 检查气力是否充足
    if (this.heroEnergy < card.cost) {
      if (window.audioEngine?.playMistake) window.audioEngine.playMistake();
      this.flashEnergyWarning();
      if (window.ui) window.ui.showToast(`⚡ 气力不足！需要 ${card.cost} 点气力`, '⚠️');
      return;
    }

    // 扣除气力
    this.heroEnergy -= card.cost;

    // 从手牌移至弃牌堆
    this.hand.splice(index, 1);
    this.discardPile.push(cardId);

    // 核心习得：真人发音大声朗读英文单词！
    if (window.audioEngine) {
      window.audioEngine.speak(card.en);
    }

    // 结算卡牌效果与音画特效
    this.applyCardEffects(card);

    // 检查敌方是否被斩杀
    if (this.enemy.hp <= 0) {
      this.enemy.hp = 0;
      this.renderBattleArena();
      setTimeout(() => this.handleVictory(), 450);
      return;
    }

    // 重新渲染手牌与状态
    this.renderBattleArena();
  }

  /**
   * 结算卡牌战斗效果
   */
  applyCardEffects(card) {
    // 1. 伤害效果 (Attack)
    if (card.dmg) {
      const hits = card.hits || 1;
      for (let h = 0; h < hits; h++) {
        let actualDmg = card.dmg + this.heroStrength;
        // 羁绊信物：伊达政宗金弦月兜盔 (穿甲与爆发伤害额外 +4)
        if (card.pierce && window.estateSystem?.hasRelic('relic-masamune-crescent')) {
          actualDmg += 4;
        }
        if (card.pierce) {
          // 破甲直接扣生命
          this.enemy.hp = Math.max(0, this.enemy.hp - actualDmg);
          this.showFloatingNumber(this.getEnemyElem(), `-${actualDmg} 🏹`, 'fct-pierce');
        } else {
          // 先扣护甲再扣生命
          if (this.enemy.block > 0) {
            if (this.enemy.block >= actualDmg) {
              this.enemy.block -= actualDmg;
              this.showFloatingNumber(this.getEnemyElem(), `-${actualDmg} 🛡️`, 'fct-block');
              actualDmg = 0;
            } else {
              actualDmg -= this.enemy.block;
              this.showFloatingNumber(this.getEnemyElem(), `破甲 -${this.enemy.block}`, 'fct-block');
              this.enemy.block = 0;
            }
          }
          if (actualDmg > 0) {
            this.enemy.hp = Math.max(0, this.enemy.hp - actualDmg);
            this.showFloatingNumber(this.getEnemyElem(), `-${actualDmg} ⚔️`, 'fct-damage');
          }
        }
      }

      // 动效与音效
      if (card.vfx === 'arrow') {
        if (window.audioEngine?.playBowShoot) window.audioEngine.playBowShoot();
        this.triggerVfx('vfx-arrow');
      } else if (card.vfx === 'thunder') {
        if (window.audioEngine?.playThunder) window.audioEngine.playThunder();
        this.triggerVfx('vfx-thunder');
      } else {
        if (window.audioEngine?.playKatanaSlash) window.audioEngine.playKatanaSlash();
        this.triggerVfx('vfx-slash');
      }
      this.shakeElement(this.getEnemyElem());
    }

    // 2. 护甲效果 (Defense)
    if (card.block) {
      this.heroBlock += card.block;
      this.showFloatingNumber(this.getHeroElem(), `+${card.block} 🛡️`, 'fct-defense');
      if (card.vfx === 'wood') {
        if (window.audioEngine?.playWoodHammer) window.audioEngine.playWoodHammer();
        this.triggerVfx('vfx-wood');
      } else {
        if (window.audioEngine?.playShieldBlock) window.audioEngine.playShieldBlock();
        this.triggerVfx('vfx-shield');
      }
    }

    // 3. 治愈效果 (Heal)
    if (card.heal) {
      const prev = this.heroHp;
      this.heroHp = Math.min(this.heroMaxHp, this.heroHp + card.heal);
      const healed = this.heroHp - prev;
      this.showFloatingNumber(this.getHeroElem(), `+${healed} 💚`, 'fct-heal');
      if (window.audioEngine?.playHealChime) window.audioEngine.playHealChime();
      this.triggerVfx('vfx-heal');
    }

    // 4. 摸牌效果 (Draw)
    if (card.draw) {
      this.drawCards(card.draw);
    }

    // 5. 气力恢复 (Energy)
    if (card.energy) {
      this.heroEnergy = Math.min(this.heroMaxEnergy + 2, this.heroEnergy + card.energy);
      if (window.audioEngine?.playEnergyCharge) window.audioEngine.playEnergyCharge();
    }

    // 6. 攻击力增益 (Strength)
    if (card.strength) {
      this.heroStrength += card.strength;
      this.showFloatingNumber(this.getHeroElem(), `+${card.strength} 战力!`, 'fct-buff');
    }
  }

  /**
   * 玩家点击【结束回合】按钮
   */
  endTurn() {
    if (!this.isActive) return;

    // 弃置当前剩余所有手牌
    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop());
    }
    this.renderBattleArena();

    // 敌方行动阶段 (Enemy Action Phase)
    const deckDeckEl = document.getElementById('siege-command-deck');
    if (deckDeckEl) {
      deckDeckEl.innerHTML = `
        <div class="card-turn-status-bar is-enemy-turn">
          <span class="status-pulse-dot">⚔️</span>
          <span>敌方回合：【${this.enemy.name}】正在执行【${this.enemy.intent.text}】...</span>
        </div>
      `;
    }

    setTimeout(() => {
      this.executeEnemyAction();
    }, 600);
  }

  /**
   * 执行敌方意图行动
   */
  executeEnemyAction() {
    if (!this.isActive) return;

    const intent = this.enemy.intent;

    if (intent.type === 'attack') {
      let dmg = intent.value;
      // 我方护甲抵挡伤害
      if (this.heroBlock > 0) {
        if (this.heroBlock >= dmg) {
          this.heroBlock -= dmg;
          this.showFloatingNumber(this.getHeroElem(), `抵挡 -${dmg} 🛡️`, 'fct-block');
          dmg = 0;
        } else {
          dmg -= this.heroBlock;
          this.showFloatingNumber(this.getHeroElem(), `破甲 -${this.heroBlock}`, 'fct-block');
          this.heroBlock = 0;
        }
      }

      if (dmg > 0) {
        this.heroHp = Math.max(0, this.heroHp - dmg);
        this.showFloatingNumber(this.getHeroElem(), `-${dmg} 💔`, 'fct-damage');
        if (window.audioEngine?.playKatanaSlash) window.audioEngine.playKatanaSlash();
        this.shakeElement(this.getHeroElem());
      } else {
        if (window.audioEngine?.playShieldBlock) window.audioEngine.playShieldBlock();
      }
    } else if (intent.type === 'defend') {
      this.enemy.block += intent.value;
      this.showFloatingNumber(this.getEnemyElem(), `+${intent.value} 🛡️`, 'fct-defense');
      if (window.audioEngine?.playShieldBlock) window.audioEngine.playShieldBlock();
    }

    // 检查我方是否阵亡
    if (this.heroHp <= 0) {
      // 检查背包是否有饭团自动护体
      const inv = window.heroManager ? window.heroManager.hero.inventory : null;
      if (inv && inv['item-riceball'] && inv['item-riceball'] > 0) {
        inv['item-riceball']--;
        this.heroHp = 15;
        this.showFloatingNumber(this.getHeroElem(), `🍙 饭团复活 +15 HP!`, 'fct-heal');
        if (window.audioEngine?.playHealChime) window.audioEngine.playHealChime();
        if (window.ui) window.ui.showToast('🍙 宁宁温热饭团发挥奇效！藤吉郎重整旗鼓！', '💖');
      } else {
        setTimeout(() => this.handleDefeat(), 500);
        return;
      }
    }

    // 回合交替，开启我方下一回合
    this.turn++;
    setTimeout(() => {
      this.startTurn();
    }, 700);
  }

  /**
   * 战胜敌将处理流程 (Slay the Spire 战利品选卡)
   */
  handleVictory() {
    this.isActive = false;

    // 播放大捷雅乐与太鼓
    if (window.audioEngine?.playVictoryFanfare) {
      window.audioEngine.playVictoryFanfare();
    }

    // 获得金小判与武勋
    let earnedGold = 25 + this.stageNum * 8;
    // 秀长黄金算盘信物增益：金币 +20%
    if (window.estateSystem?.hasRelic('relic-hidenaga-abacus')) {
      earnedGold = Math.round(earnedGold * 1.2);
    }
    const earnedMerit = 40 + this.stageNum * 10;
    if (window.heroManager) {
      window.heroManager.addGold(earnedGold);
      window.heroManager.addMerit(earnedMerit);
    }

    // 开启战利品新卡三选一界面 (Card Drafting)
    this.showCardDraftModal(() => {
      // 选卡完成后，触发城池陷落胜仗感状
      if (window.siegeBattle) {
        window.siegeBattle.triggerCastleConquered();
      } else if (this.onVictoryCallback) {
        this.onVictoryCallback({ gold: earnedGold, merit: earnedMerit });
      }
    });
  }

  /**
   * 战败处理流程
   */
  handleDefeat() {
    this.isActive = false;
    if (window.audioEngine?.playMistake) window.audioEngine.playMistake();
    if (window.ui) {
      window.ui.showToast('🛡️ 战况胶着，暂时鸣金收兵！回营休整后再战！', '⚠️');
    }
    setTimeout(() => {
      if (window.siegeBattle) {
        window.siegeBattle.retreat();
      } else if (this.onDefeatCallback) {
        this.onDefeatCallback();
      }
    }, 800);
  }

  /**
   * 弹出战利品【战术新卡三选一】选卡弹窗 (Card Draft Modal)
   */
  showCardDraftModal(onFinish) {
    // 课本学龄核心词汇卡池 (覆盖日常与新课标高频词)
    const textbookCards = [
      'meet', 'friend', 'nice', 'book', 'ruler', 'pencil', 'water', 'apple', 'look',
      'run', 'jump', 'fly', 'swim'
    ];
    // 进阶战术卡池
    const tacticalCards = [
      'double_slash', 'iron_wall', 'war_cry', 'piercing_arrow',
      'heavy_strike', 'dodge', 'first_aid', 'focus', 'poison_blade', 'strike'
    ];

    // 特殊关卡加入名物限定神卡
    if (this.stageNum === 5) tacticalCards.unshift('thunderstorm');
    if (this.stageNum === 10) tacticalCards.unshift('palisade');
    if (this.stageNum === 25) tacticalCards.unshift('wind');
    if (this.stageNum === 35) tacticalCards.unshift('dragon');

    // 智能配比：优先抽取 1 张课本核心词汇卡 + 2 张战术策略卡，让孩子将课本词汇收入囊中！
    const shuffledTextbook = [...textbookCards].sort(() => 0.5 - Math.random());
    const shuffledTactical = [...tacticalCards].sort(() => 0.5 - Math.random());

    const selected3 = [
      shuffledTextbook[0],
      shuffledTactical[0],
      shuffledTactical[1]
    ];

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop card-draft-modal-backdrop';
    modal.id = 'modal-card-draft';

    modal.innerHTML = `
      <div class="card-draft-modal-box">
        <div class="card-draft-header">
          <div class="draft-badge">🎉 合战大捷 · 战术领悟</div>
          <h2 class="draft-title">挑选 1 张战术指令加入你的永久卡组</h2>
          <p class="draft-subtitle">点击卡牌可听纯正战吼发音，选入卡组可永久提升未来战斗力！</p>
        </div>

        <div class="card-draft-grid">
          ${selected3.map(cid => {
            const c = this.cardDatabase[cid];
            return `
              <div class="tactical-card draft-card-item is-${c.type}" onclick="window.audioEngine?.speak('${c.en}')">
                <div class="card-cost-badge">${c.cost} ⚡</div>
                <div class="card-crest-icon">${c.icon}</div>
                <div class="card-title-en">${c.en}</div>
                <div class="card-title-cn">${c.cn}</div>
                <div class="card-desc-pill">${c.desc}</div>
                <button class="btn btn-primary btn-draft-pick" onclick="event.stopPropagation(); window.cardBattle.pickDraftCard('${cid}', this)">
                  📥 收入卡组
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <div class="card-draft-footer">
          <button class="btn btn-secondary btn-draft-skip" onclick="window.cardBattle.skipDraftCard()">
            ✕ 暂不添卡（跳过）
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this._draftCallback = onFinish;
  }

  /**
   * 玩家选中一张新卡加入卡组
   */
  pickDraftCard(cardId, btnElem) {
    this.addCardToDeck(cardId);
    const modal = document.getElementById('modal-card-draft');
    if (modal) modal.remove();
    if (this._draftCallback) {
      const cb = this._draftCallback;
      this._draftCallback = null;
      cb();
    }
  }

  /**
   * 玩家跳过本次选卡
   */
  skipDraftCard() {
    const modal = document.getElementById('modal-card-draft');
    if (modal) modal.remove();
    if (this._draftCallback) {
      const cb = this._draftCallback;
      this._draftCallback = null;
      cb();
    }
  }

  /**
   * 打开【我的战术卡组】查看面板 (Deck Viewer)
   */
  openDeckViewerModal() {
    const counts = {};
    this.persistentDeck.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop card-deck-viewer-backdrop';
    modal.id = 'modal-card-deck-viewer';

    modal.innerHTML = `
      <div class="card-deck-viewer-box">
        <div class="deck-viewer-header">
          <div class="viewer-title-row">
            <h3>🎴 木下藤吉郎 · 战国军略卡组 (共 ${this.persistentDeck.length} 张)</h3>
            <button class="btn-close-viewer" onclick="document.getElementById('modal-card-deck-viewer')?.remove()">✕</button>
          </div>
          <p class="viewer-tip">点击卡牌可倾听英武战吼发音！合战中将以此卡组作为出征抽牌池。</p>
        </div>

        <div class="deck-viewer-grid">
          ${Object.entries(counts).map(([cid, count]) => {
            const c = this.cardDatabase[cid] || { en: cid, cn: cid, type: 'attack', cost: 1, icon: '⚔️', desc: '' };
            return `
              <div class="tactical-card viewer-card-item is-${c.type}" onclick="window.audioEngine?.speak('${c.en}')">
                <div class="card-cost-badge">${c.cost} ⚡</div>
                <div class="card-stack-badge">x${count}</div>
                ${c.isTextbook ? '<div class="card-origin-pill">课本词</div>' : (c.isCompanion ? '<div class="card-origin-pill is-comp">家臣</div>' : '')}
                <div class="card-crest-icon">${c.icon}</div>
                <div class="card-title-en">${c.en}</div>
                <div class="card-title-cn">${c.cn}</div>
                <div class="card-desc-pill">${c.desc}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="deck-viewer-footer">
          <button class="btn btn-primary" onclick="document.getElementById('modal-card-deck-viewer')?.remove()">
            ✓ 审阅完毕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 从主界面直接开启战术卡牌决斗
   */
  startCardBattleFromHome() {
    const curStage = (window.heroManager && window.heroManager.hero.stage) || 1;
    if (window.siegeBattle) {
      window.siegeBattle.startSiege(curStage);
    } else {
      this.startBattle({ stageNum: curStage });
    }
  }

  // ==========================================================================
  // DOM 渲染与直观视觉动效 (Single-screen Mobile Layout)
  // ==========================================================================

  renderBattleArena() {
    const scene = document.getElementById('scene-siege-battle');
    if (!scene) return;
    scene.classList.remove('hidden');

    // 1. 顶部 HUD 状态栏
    const hudNode = document.getElementById('siege-step-nodes');
    if (hudNode) {
      hudNode.innerHTML = `
        <div class="card-battle-hud-pill">
          <span class="hud-crest">🎴</span>
          <span class="hud-stage-name">战国卡牌决斗 · 回合 ${this.turn}</span>
        </div>
      `;
    }

    // 2. 战场舞台 (Hero vs Enemy)
    const heroHpPct = Math.max(0, Math.min(100, (this.heroHp / this.heroMaxHp) * 100));
    const enemyHpPct = Math.max(0, Math.min(100, (this.enemy.hp / this.enemy.maxHp) * 100));

    // 我方大将主角卡牌状态栏
    const heroSide = document.getElementById('siege-side-hero');
    if (heroSide) {
      heroSide.innerHTML = `
        <div class="hero-unit-box card-hero-box">
          <div class="hero-avatar-wrap" id="siege-hero-avatar">
            <img src="assets/characters/tokichiro.png" class="hero-battle-sprite" id="siege-hero-img" alt="木下藤吉郎">
            ${this.heroBlock > 0 ? `<div class="hero-shield-aura">🛡️ ${this.heroBlock}</div>` : ''}
          </div>
          <div class="hero-meta-card">
            <div class="hero-battle-name">木下藤吉郎 ${this.heroStrength > 0 ? `<span class="buff-badge">⚔️+${this.heroStrength}</span>` : ''}</div>
            <div class="card-stat-bar-group">
              <div class="card-hp-bar">
                <div class="card-hp-fill is-hero" style="width: ${heroHpPct}%;"></div>
                <span class="card-hp-label">❤️ ${this.heroHp}/${this.heroMaxHp}</span>
              </div>
            </div>
            <!-- 随行家臣助战标牌 -->
            <div class="companion-battle-tag-strip" title="随行家臣助战">
              <span class="comp-tag-avatar">${this.activeCompanion ? (this.activeCompanion.icon || '🧑‍🤝‍🧑') : '📜'}</span>
              <span class="comp-tag-name">${this.activeCompanion ? this.activeCompanion.name : '木下秀长'}</span>
              <span class="comp-tag-role">助战</span>
            </div>
          </div>
        </div>
      `;
    }

    // 中间区域：意图告示与特效
    const vsCenter = document.querySelector('.siege-vs-center');
    if (vsCenter) {
      vsCenter.innerHTML = `
        <div class="card-battle-turn-indicator">
          <div class="turn-badge">第 ${this.turn} 回合</div>
          <div class="enemy-intent-bubble">
            <span class="intent-icon">${this.enemy.intent.icon}</span>
            <span class="intent-text">${this.enemy.intent.text}</span>
          </div>
        </div>
        <div class="siege-impact-vfx hidden" id="siege-impact-vfx"></div>
      `;
    }

    // 敌方大将状态栏
    const enemySide = document.getElementById('siege-side-enemy');
    if (enemySide) {
      enemySide.innerHTML = `
        <div class="enemy-unit-box card-enemy-box">
          <div class="enemy-meta-card">
            <div class="enemy-battle-title">${this.enemy.title}</div>
            <div class="enemy-battle-name" id="siege-enemy-name">${this.enemy.name}</div>
            <div class="card-stat-bar-group">
              <div class="card-hp-bar">
                <div class="card-hp-fill is-enemy" style="width: ${enemyHpPct}%;"></div>
                <span class="card-hp-label">❤️ ${this.enemy.hp}/${this.enemy.maxHp}</span>
              </div>
              ${this.enemy.block > 0 ? `<div class="enemy-block-pill">🛡️ 护甲: ${this.enemy.block}</div>` : ''}
            </div>
          </div>
          <div class="enemy-avatar-wrap" id="siege-enemy-avatar">
            <img src="${this.enemy.avatar}" class="enemy-battle-sprite" id="siege-enemy-img" alt="敌将">
            <div class="enemy-intent-crown">${this.enemy.intent.icon}</div>
          </div>
        </div>
      `;
    }

    // 3. 底部指令台：手牌阵列 + 气力指示 + 结束回合按钮
    const deckEl = document.getElementById('siege-command-deck');
    if (deckEl) {
      deckEl.innerHTML = `
        <div class="card-deck-container">
          <!-- 气力槽与牌堆统计 -->
          <div class="card-control-header">
            <div class="energy-orb-container" id="card-energy-orb">
              <span class="energy-crest">⚡</span>
              <span class="energy-val">${this.heroEnergy}</span>
              <span class="energy-max">/${this.heroMaxEnergy} 气力</span>
            </div>

            <div class="deck-counts-strip">
              <span class="deck-count-pill" title="抽牌堆">🎴 抽牌: ${this.drawPile.length}</span>
              <span class="deck-count-pill" title="弃牌堆">🗑️ 弃牌: ${this.discardPile.length}</span>
            </div>

            <button class="btn btn-end-turn" onclick="window.cardBattle.endTurn()">
              <span>结束回合 ➡️</span>
            </button>
          </div>

          <!-- 展开的手牌 (支持单屏横滑/平铺) -->
          <div class="card-hand-deck" id="card-hand-deck">
            ${this.hand.map((cid, idx) => {
              const c = this.cardDatabase[cid];
              if (!c) return '';
              const canPlay = this.heroEnergy >= c.cost;
              return `
                <div class="tactical-card hand-card-item is-${c.type} ${canPlay ? 'can-play' : 'no-energy'}" 
                     onclick="window.cardBattle.playCard(${idx})"
                     title="${c.desc}">
                  <div class="card-cost-badge">${c.cost} ⚡</div>
                  <div class="card-crest-icon">${c.icon}</div>
                  <div class="card-title-en">${c.en}</div>
                  <div class="card-title-cn">${c.cn}</div>
                  <div class="card-badge-val">${this.getCardBadgeVal(c)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  getCardBadgeVal(c) {
    if (!c) return '✨ 战术';
    if (c.dmg && c.block) return `⚔️${c.dmg + this.heroStrength} 🛡️${c.block}`;
    if (c.heal && c.block) return `💚${c.heal} 🛡️${c.block}`;
    if (c.dmg) return `⚔️ ${c.dmg + this.heroStrength}${c.pierce ? ' 破甲' : ''}`;
    if (c.block) return `🛡️ +${c.block}`;
    if (c.heal) return `💚 +${c.heal}`;
    if (c.draw) return `🎴 +${c.draw}`;
    if (c.strength) return `💪 +${c.strength}`;
    return '✨ 战术';
  }

  getHeroElem() {
    return document.getElementById('siege-side-hero') || document.body;
  }

  getEnemyElem() {
    return document.getElementById('siege-side-enemy') || document.body;
  }

  triggerVfx(type) {
    const vfx = document.getElementById('siege-impact-vfx');
    if (!vfx) return;
    vfx.className = `siege-impact-vfx ${type}`;
    vfx.classList.remove('hidden');
    setTimeout(() => vfx.classList.add('hidden'), 350);
  }

  shakeElement(el) {
    if (!el) return;
    el.classList.add('shake-anim');
    setTimeout(() => el.classList.remove('shake-anim'), 350);
  }

  flashEnergyWarning() {
    const orb = document.getElementById('card-energy-orb');
    if (orb) {
      orb.classList.add('energy-shortage-flash');
      setTimeout(() => orb.classList.remove('energy-shortage-flash'), 400);
    }
  }

  showFloatingNumber(parent, text, className) {
    if (!parent) return;
    const fct = document.createElement('div');
    fct.className = `floating-combat-text ${className}`;
    fct.textContent = text;
    parent.appendChild(fct);
    setTimeout(() => fct.remove(), 750);
  }
}

// 挂载全局单例
window.cardBattle = new CardBattleEngine();
