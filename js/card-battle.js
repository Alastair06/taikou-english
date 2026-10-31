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

// 常见高频连词成句配置表 (English Phrase Collocations)
// 培养小学学龄自然词汇组合习惯 (动词+副词、动词+名词、连词并列)
const ENGLISH_PHRASE_COMBOS = [
  {
    pair: ['run', 'jump'],
    phraseEn: "Run and jump!",
    phraseCn: "奔跑飞跃！",
    desc: "动作连贯！获得 +6 护甲并抽 1 张牌",
    effect: (battle) => { battle.heroBlock += 6; battle.drawCards(1); }
  },
  {
    pair: ['run', 'dodge'],
    phraseEn: "Run fast!",
    phraseCn: "神速奔袭！",
    desc: "身法如风！摸 1 张牌并恢复 1 气力",
    effect: (battle) => { battle.drawCards(1); battle.heroEnergy = Math.min(battle.heroMaxEnergy + 2, battle.heroEnergy + 1); }
  },
  {
    pair: ['jump', 'dodge'],
    phraseEn: "Jump high!",
    phraseCn: "凌空高跃！",
    desc: "身轻如燕！获得 8 护甲与空中闪避",
    effect: (battle) => { battle.heroBlock += 8; }
  },
  {
    pair: ['look', 'book'],
    phraseEn: "Read the book!",
    phraseCn: "研读兵书！",
    desc: "博览群书！摸 2 张牌并回馈 1 气力",
    effect: (battle) => { battle.drawCards(2); battle.heroEnergy = Math.min(battle.heroMaxEnergy + 2, battle.heroEnergy + 1); }
  },
  {
    pair: ['apple', 'water'],
    phraseEn: "Apple and water!",
    phraseCn: "粮草甘霖！",
    desc: "饱食甘泉！额外恢复 8 点生命值",
    effect: (battle) => { battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + 8); }
  },
  {
    pair: ['swim', 'water'],
    phraseEn: "Swim in water!",
    phraseCn: "如鱼得水！",
    desc: "涉水无阻！获得 8 护甲并恢复 6 生命",
    effect: (battle) => { battle.heroBlock += 8; battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + 6); }
  },
  {
    pair: ['nice', 'friend'],
    phraseEn: "Nice friend!",
    phraseCn: "莫逆之交！",
    desc: "战友同心！全场攻击力 +2 并获 6 护甲",
    effect: (battle) => { battle.heroStrength += 2; battle.heroBlock += 6; }
  },
  {
    pair: ['fly', 'shoot'],
    phraseEn: "Fly and shoot!",
    phraseCn: "天鹰飞射！",
    desc: "居高临下！追加 8 点真实穿甲伤害",
    effect: (battle) => { 
      battle.enemy.hp = Math.max(0, battle.enemy.hp - 8); 
      battle.showFloatingNumber(battle.getEnemyElem(), '-8 🦅💥', 'fct-pierce');
    }
  },
  {
    pair: ['strike', 'slash'],
    phraseEn: "Slash and strike!",
    phraseCn: "刀光枪影！",
    desc: "迅猛连招！追加 6 点物理伤害",
    effect: (battle) => {
      let dmg = 6;
      if (battle.enemy.block > 0) {
        if (battle.enemy.block >= dmg) { battle.enemy.block -= dmg; }
        else { dmg -= battle.enemy.block; battle.enemy.block = 0; battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg); }
      } else {
        battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
      }
      battle.showFloatingNumber(battle.getEnemyElem(), '-6 ⚔️', 'fct-damage');
    }
  },
  {
    pair: ['guard', 'iron_wall'],
    phraseEn: "Iron shield and wall!",
    phraseCn: "铜墙铁壁！",
    desc: "坚如磐石！获得 10 点坚固护甲",
    effect: (battle) => { battle.heroBlock += 10; }
  },
  {
    pair: ['ruler', 'pencil'],
    phraseEn: "Ruler and pencil!",
    phraseCn: "规矩画策！",
    desc: "智谋超群！造成 6 穿甲伤害并摸 1 张牌",
    effect: (battle) => { 
      battle.enemy.hp = Math.max(0, battle.enemy.hp - 6); 
      battle.drawCards(1); 
    }
  }
];

/**
 * 战国敌将专属战术技能卡库 (Enemy Skill Cards Database)
 * 杀戮尖塔 (Slay the Spire) 式敌我互相出技能博弈体系：
 * 敌将不仅拥有意图预告，更在敌方回合具象化打出技能卡牌！
 * 包含英文全名、国际音标、中文意译、纯正 TTS 战吼与震撼物理打击演出！
 */
const ENEMY_SKILL_DATABASE = {
  // --- 常规敌将基础战术技能 ---
  strike: {
    id: 'strike',
    nameEn: 'Blade Strike',
    nameCn: '刀刃重斩',
    phonetic: '/bleɪd straɪk/',
    icon: '⚔️',
    type: 'attack',
    baseVal: 8,
    vfx: 'vfx-slash',
    speechEn: 'Blade Strike! Take this!',
    speechCn: '看我太刀重斩！接招！',
    keyword: 'strike',
    counterWords: ['guard', 'iron_wall', 'dodge', 'strike'],
    counterHint: '敌将出【Blade Strike】！出【Guard/Dodge】格挡招架！',
    desc: '敌将挥动锋锐太刀发起冲斩，造成直接物理伤害。'
  },
  heavy_strike: {
    id: 'heavy_strike',
    nameEn: 'Heavy Strike',
    nameCn: '破阵重劈',
    phonetic: '/ˈhevi straɪk/',
    icon: '💥⚔️',
    type: 'attack',
    baseVal: 13,
    vfx: 'vfx-thunder',
    speechEn: 'Heavy Strike! Smash the line!',
    speechCn: '力劈千钧！崩碎你的防线！',
    keyword: 'strike',
    counterWords: ['guard', 'iron_wall', 'dodge', 'run'],
    counterHint: '敌将蓄力【Heavy Strike】！必须出【Guard/Iron Wall】固守！',
    desc: '聚全身力道于刀刃的强力一击，造成巨额重创。'
  },
  double_slash: {
    id: 'double_slash',
    nameEn: 'Double Slash',
    nameCn: '疾风二段连斩',
    phonetic: '/ˈdʌbl slæʃ/',
    icon: '⚔️⚔️',
    type: 'attack',
    baseVal: 5,
    hits: 2,
    vfx: 'vfx-slash',
    speechEn: 'Double Slash! One, two!',
    speechCn: '一刀！两刀！疾风二连击！',
    keyword: 'strike',
    counterWords: ['guard', 'iron_wall', 'jump', 'dodge'],
    counterHint: '敌将疾风【Double Slash】！出【Guard】挡住多段攻击！',
    desc: '迅捷利落的二段连续挥砍，共造成 2 次打击。'
  },
  arrows: {
    id: 'arrows',
    nameEn: 'Volley of Arrows',
    nameCn: '飞矢连射',
    phonetic: '/ˈvɒli əv ˈærəʊz/',
    icon: '🏹💨',
    type: 'attack',
    baseVal: 10,
    vfx: 'vfx-arrow',
    speechEn: 'Arrows incoming! Watch out!',
    speechCn: '乱箭齐发！小心头顶！',
    keyword: 'arrows',
    counterWords: ['guard', 'jump', 'dodge', 'run'],
    counterHint: '敌弓兵齐射【Arrows】！出【Jump/Guard/Run】腾跃盾挡或跑开！',
    desc: '弓箭队远距离乱射箭雨，难以捉摸。'
  },
  shield: {
    id: 'shield',
    nameEn: 'Iron Shield',
    nameCn: '铁盾坚守',
    phonetic: '/ˈaɪən ʃiːld/',
    icon: '🛡️✨',
    type: 'defend',
    baseVal: 10,
    vfx: 'vfx-shield',
    speechEn: 'Iron Shield! My armor is solid!',
    speechCn: '铁壁玄武！坚不可摧！',
    keyword: 'shield',
    counterWords: ['shoot', 'fly', 'pencil', 'piercing_arrow'],
    counterHint: '敌将立【Iron Shield】！出【Shoot/Fly/Pencil】弱点穿透！',
    desc: '举起沉重的铁裹精盾，为自己提供坚厚护甲。'
  },
  wall: {
    id: 'wall',
    nameEn: 'Wood Barricade',
    nameCn: '扎立拒马木栅',
    phonetic: '/wʊd ˌbærɪˈkeɪd/',
    icon: '🪵🛡️',
    type: 'defend',
    baseVal: 14,
    vfx: 'vfx-wood',
    speechEn: 'Wooden wall! You cannot pass!',
    speechCn: '扎紧木栅！休想越过一步！',
    keyword: 'wall',
    counterWords: ['jump', 'fly', 'shoot', 'piercing_arrow'],
    counterHint: '敌将筑【Wooden Wall】！出【Jump/Fly】轻功腾跃无视阻拦！',
    desc: '战场快速布设木桩拒马，大幅增强驻守防御。'
  },
  fire: {
    id: 'fire',
    nameEn: 'Fire Attack',
    nameCn: '烈焰焚营',
    phonetic: '/ˈfaɪər əˈtæk/',
    icon: '🔥💥',
    type: 'attack',
    baseVal: 12,
    vfx: 'vfx-thunder',
    speechEn: 'Fire Attack! Burn everything down!',
    speechCn: '放火！烈焰将吞噬一切！',
    keyword: 'fire',
    counterWords: ['water', 'swim', 'run'],
    counterHint: '敌引燃【Fire】！出【Water】清泉灭火或【Run】迅速脱险！',
    desc: '发射引火之箭点燃草料，烈火熊熊造成灼热重击。'
  },
  horse: {
    id: 'horse',
    nameEn: 'Cavalry Charge',
    nameCn: '铁骑奔袭冲锋',
    phonetic: '/ˈkævlri tʃɑːdʒ/',
    icon: '🐎💨',
    type: 'attack',
    baseVal: 11,
    vfx: 'vfx-slash',
    speechEn: 'Cavalry Charge! Running fast like the wind!',
    speechCn: '战马嘶鸣！全军神速奔袭！',
    keyword: 'horse',
    counterWords: ['jump', 'dodge', 'run', 'wind'],
    counterHint: '敌军【Horse】冲杀！出【Jump/Dodge】侧跃规避铁蹄！',
    desc: '铁甲骏马集群突刺，具有强烈的压迫力与冲撞伤害。'
  },
  war_cry: {
    id: 'war_cry',
    nameEn: 'War Cry',
    nameCn: '战吼壮胆',
    phonetic: '/wɔː kraɪ/',
    icon: '😤💪',
    type: 'buff',
    strength: 2,
    block: 6,
    vfx: 'vfx-shield',
    speechEn: 'War Cry! Hear my thunderous roar!',
    speechCn: '全军呐喊！军心大振！战意澎湃！',
    keyword: 'strike',
    counterWords: ['strike', 'slash', 'heavy_strike'],
    counterHint: '敌将在【War Cry】提振战意！下回合攻击暴增，速速攻击！',
    desc: '引吭战吼震慑三军，获得 6 护甲并使自身战力永久 +2。'
  },

  // --- 战国名将专属传奇神技 ---
  imagawa_bow: {
    id: 'imagawa_bow',
    nameEn: 'Master Bow Shoot',
    nameCn: '东海道名弓神射',
    phonetic: '/ˈmɑːstə bəʊ ʃuːt/',
    icon: '🏹✨',
    type: 'attack',
    baseVal: 12,
    vfx: 'vfx-arrow',
    speechEn: 'I will shoot arrows from my great bow!',
    speechCn: '东海道第一弓取名不虚传！接此神矢！',
    keyword: 'arrows',
    counterWords: ['guard', 'jump', 'dodge', 'iron_wall'],
    counterHint: '义元射出名弓【Arrows】！出【Guard/Jump/Dodge】避其锋芒！',
    desc: '今川家传国重弓，离弦之箭破风啸空。'
  },
  imagawa_thunder: {
    id: 'imagawa_thunder',
    nameEn: 'Thunder Rain',
    nameCn: '桶狭间骤雨雷霆',
    phonetic: '/ˈθʌndə reɪn/',
    icon: '⛈️⚡',
    type: 'attack',
    baseVal: 16,
    vfx: 'vfx-thunder',
    speechEn: 'Heavy thunder and strike from the storm!',
    speechCn: '狂风暴雨！雷霆重击！',
    keyword: 'strike',
    counterWords: ['guard', 'iron_wall', 'run', 'dodge'],
    counterHint: '暴雨雷击【Strike】！出【Guard/Iron Wall】固守阵地！',
    desc: '借暴雨与雷电之势奋力挥斩，威力极大。'
  },
  shingen_wind: {
    id: 'shingen_wind',
    nameEn: 'Wind Cavalry',
    nameCn: '其疾如风 · 赤备突刺',
    phonetic: '/wɪnd ˈkævlri/',
    icon: '🐎🔥',
    type: 'attack',
    baseVal: 14,
    vfx: 'vfx-slash',
    speechEn: 'My war horse is running fast like the wind!',
    speechCn: '疾如风！赤备如烈火席卷！',
    keyword: 'horse',
    counterWords: ['jump', 'dodge', 'run', 'wind'],
    counterHint: '信玄【Horse】神骑突入！出【Jump/Dodge/Run】跃起躲避！',
    desc: '甲斐武田家赤备精锐，如狂风席卷战场。'
  },
  shingen_mountain: {
    id: 'shingen_mountain',
    nameEn: 'Mountain Shield',
    nameCn: '不动如山 · 金汤军配',
    phonetic: '/ˈmaʊntɪn ʃiːld/',
    icon: '⛰️🛡️',
    type: 'defend',
    baseVal: 20,
    vfx: 'vfx-shield',
    speechEn: 'My shield stands firm like a mountain!',
    speechCn: '不动如山！谁敢动摇甲斐金汤！',
    keyword: 'shield',
    counterWords: ['shoot', 'fly', 'pencil', 'piercing_arrow'],
    counterHint: '信玄【Mountain Shield】！出【Shoot/Fly/Pencil】寻找破绽！',
    desc: '军配一展，三军如山岳般岿然不动，获得坚固护甲。'
  },
  shingen_fire: {
    id: 'shingen_fire',
    nameEn: 'Raging Fire',
    nameCn: '侵掠如火 · 龙虎燎原',
    phonetic: '/ˈreɪdʒɪŋ ˈfaɪər/',
    icon: '🔥💥',
    type: 'attack',
    baseVal: 18,
    vfx: 'vfx-thunder',
    speechEn: 'Fire is raging! Total charge!',
    speechCn: '侵掠如火！甲斐龙虎踏平四方！',
    keyword: 'fire',
    counterWords: ['water', 'swim', 'run', 'iron_wall'],
    counterHint: '信玄【Fire】燎原！出【Water】扑灭烈焰或【Run】躲避！',
    desc: '势如燎原烈火，不可阻挡的全军冲锋。'
  },
  masamune_dragon: {
    id: 'masamune_dragon',
    nameEn: 'Dragon Fangs',
    nameCn: '独眼龙牙 · 狂岚三段',
    phonetic: '/ˈdræɡən fæŋz/',
    icon: '🐉⚔️',
    type: 'attack',
    baseVal: 6,
    hits: 3,
    vfx: 'vfx-slash',
    speechEn: 'Look at the dragon in the sky! It is ready to fly!',
    speechCn: '九天独眼黑龙降临！撕裂敌阵！',
    keyword: 'dragon',
    counterWords: ['jump', 'fly', 'dragon', 'dodge'],
    counterHint: '政宗【Dragon】啸空！出【Jump/Fly】凌空飞跃对抗！',
    desc: '独眼龙奥州绝技，黑龙怒啸的三段疾风狂斩。'
  },
  masamune_crescent: {
    id: 'masamune_crescent',
    nameEn: 'Crescent Moon Guard',
    nameCn: '黑漆金月 · 无双坚盔',
    phonetic: '/ˈkresnt muːn ɡɑːd/',
    icon: '🌙🛡️',
    type: 'defend',
    baseVal: 18,
    vfx: 'vfx-shield',
    speechEn: 'Look at my crescent moon helmet! Unbreakable!',
    speechCn: '金弦月兜盔！天下无双！刀枪不入！',
    keyword: 'look',
    counterWords: ['look', 'book', 'piercing_arrow', 'pencil'],
    counterHint: '政宗亮盔【Look】！出【Look/Book】窥测刀锋隙间！',
    desc: '黑漆五枚胴与黄金弦月盔提供周密防护。'
  },
  masamune_cannon: {
    id: 'masamune_cannon',
    nameEn: 'Dragon Cannon',
    nameCn: '南蛮国崩 · 龙骑轰天炮',
    phonetic: '/ˈdræɡən ˈkænən/',
    icon: '💥⚡',
    type: 'attack',
    baseVal: 22,
    pierce: true,
    vfx: 'vfx-thunder',
    speechEn: 'I will shoot heavy fire from my guns!',
    speechCn: '西洋国崩大筒轰鸣！震天动地！',
    keyword: 'shoot',
    counterWords: ['guard', 'dodge', 'jump', 'water'],
    counterHint: '政宗大筒【Shoot】！出【Guard/Dodge/Jump】翻滚闪避！',
    desc: '南蛮巨炮与铁炮龙骑联合轰鸣，直接穿透护甲！'
  }
};

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
      intent: { 
        type: 'attack', 
        value: 7, 
        icon: '⚔️', 
        text: '蓄力突击 (7 伤)',
        speechEn: 'I will strike you with my blade!',
        speechCn: '看我挥刀斩击！',
        keyword: 'strike',
        counterWords: ['guard', 'iron_wall', 'dodge', 'strike'],
        counterHint: '听到了【strike】！出【Guard/Dodge】格挡招架！'
      }
    };

    // 牌库系统 (Draw Pile / Hand / Discard Pile)
    this.persistentDeck = this.loadPersistentDeck();
    this.drawPile = [];
    this.hand = [];
    this.discardPile = [];
    this.turnCardsPlayed = []; // 本回合出牌记录，用于连词成句
    this.countersTriggeredThisBattle = 0; // 本局英语识策克制计数

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
        phonetic: '/slæʃ/',
        phonics: 's-l-a-sh',
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
        phonetic: '/ɡɑːrd/',
        phonics: 'g-u-ar-d',
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
        phonetic: '/ʃuːt/',
        phonics: 'sh-oo-t',
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
        phonetic: '/hiːl/',
        phonics: 'h-ea-l',
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
        phonetic: '/straɪk/',
        phonics: 's-t-r-i-k-e',
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
        phonetic: '/dɒdʒ/',
        phonics: 'd-o-dge',
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
        phonetic: '/ˈdʌbl slæʃ/',
        phonics: 'd-ou-ble-s-l-a-sh',
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
        phonetic: '/ˈaɪərn wɔːl/',
        phonics: 'i-ron-w-a-ll',
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
        phonetic: '/wɔːr kraɪ/',
        phonics: 'w-ar-c-r-y',
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
        phonetic: '/ˈpɪərsɪŋ ˈærəʊ/',
        phonics: 'p-ier-ce-a-rr-ow',
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
        phonetic: '/ˈhevi straɪk/',
        phonics: 'h-ea-vy-s-t-r-i-k-e',
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
        phonetic: '/fɜːrst eɪd/',
        phonics: 'f-ir-st-a-i-d',
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
        phonetic: '/ˈfəʊkəs/',
        phonics: 'f-o-c-u-s',
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
        phonetic: '/ˈpɔɪzn bleɪd/',
        phonics: 'p-oi-son-b-l-a-de',
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
        phonetic: '/ˈθʌndərstɔːrm/',
        phonics: 'th-un-der-s-t-or-m',
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
        phonetic: '/ˌpælɪˈseɪd/',
        phonics: 'p-a-l-i-s-a-de',
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
        phonetic: '/iːt/',
        phonics: 'ea-t',
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
        phonetic: '/riːd/',
        phonics: 'r-ea-d',
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
        phonetic: '/breɪv/',
        phonics: 'b-r-a-ve',
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
        phonetic: '/plæn/',
        phonics: 'p-l-a-n',
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
        phonetic: '/wɪnd/',
        phonics: 'w-i-n-d',
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
        phonetic: '/ˈdræɡən/',
        phonics: 'd-r-a-g-o-n',
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
        phonetic: '/miːt/',
        phonics: 'm-ee-t',
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
        phonetic: '/frend/',
        phonics: 'f-r-ie-n-d',
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
        phonetic: '/naɪs/',
        phonics: 'n-i-ce',
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
        phonetic: '/bʊk/',
        phonics: 'b-oo-k',
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
        phonetic: '/ˈruːlər/',
        phonics: 'r-u-l-er',
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
        phonetic: '/ˈpensl/',
        phonics: 'p-e-n-c-i-l',
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
        phonetic: '/ˈwɔːtər/',
        phonics: 'w-a-t-er',
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
        phonetic: '/ˈæpl/',
        phonics: 'a-p-p-le',
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
        phonetic: '/lʊk/',
        phonics: 'l-oo-k',
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
        phonetic: '/rʌn/',
        phonics: 'r-u-n',
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
        phonetic: '/dʒʌmp/',
        phonics: 'j-u-m-p',
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
        phonetic: '/flaɪ/',
        phonics: 'f-l-y',
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
        phonetic: '/swɪm/',
        phonics: 's-w-i-m',
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

    // 构建战斗抽牌堆 (真随机洗牌)
    this.drawPile = window.shuffleArray ? window.shuffleArray(this.persistentDeck) : [...this.persistentDeck];
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
   * 调优敌方血量与抗击打能力，确保双方有来有回互相出招 (Slay the Spire Balance)
   */
  setupEnemy(stageNum, customEnemy = null) {
    let name = `尾张守将 · 第 ${stageNum} 关`;
    let title = '守城大将';
    let hp = 44 + stageNum * 4;
    let baseAtk = 7 + Math.floor(stageNum * 0.7);
    let avatar = 'assets/characters/goblin.png';

    if (stageNum === 5) {
      name = '今川义元';
      title = '东海道第一弓取';
      hp = 70;
      baseAtk = 10;
      avatar = 'assets/portraits/nobunaga.jpg';
    } else if (stageNum === 10) {
      name = '斋藤防线大将 · 稻叶山先锋';
      title = '美浓总大将';
      hp = 85;
      baseAtk = 12;
      avatar = 'assets/portraits/shibata.jpg';
    } else if (stageNum === 25) {
      name = '武田信玄';
      title = '甲斐之虎 · 风林火山';
      hp = 120;
      baseAtk = 14;
      avatar = 'assets/portraits/shingen.jpg';
    } else if (stageNum === 35) {
      name = '伊达政宗';
      title = '独眼龙 · 奥州霸主';
      hp = 145;
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
      strength: 0,
      turnCount: 0,
      currentSkill: null,
      intent: null
    };
    this.rollEnemyIntent();
  }

  /**
   * 将技能卡数据转换为杀戮尖塔风格的意图对象 (Intent Object)
   */
  skillToIntent(skill) {
    if (!skill) skill = ENEMY_SKILL_DATABASE.strike;
    const enemyAtk = (this.enemy && this.enemy.strength) || 0;
    let text = '';
    let val = 0;

    if (skill.type === 'attack') {
      const dmg = skill.baseVal + enemyAtk;
      val = dmg;
      text = skill.hits > 1 ? `${skill.nameCn} (${dmg}x${skill.hits} 连斩)` : `${skill.nameCn} (${dmg} 伤${skill.pierce ? ' 穿甲' : ''})`;
    } else if (skill.type === 'defend') {
      val = skill.baseVal;
      text = `${skill.nameCn} (+${skill.baseVal} 护甲)`;
    } else if (skill.type === 'buff') {
      val = skill.strength || 2;
      text = `${skill.nameCn} (+${val} 战力)`;
    }

    return {
      skillId: skill.id,
      type: skill.type,
      value: val,
      hits: skill.hits || 1,
      icon: skill.icon,
      text: text,
      nameEn: skill.nameEn,
      nameCn: skill.nameCn,
      phonetic: skill.phonetic,
      speechEn: skill.speechEn,
      speechCn: skill.speechCn,
      keyword: skill.keyword,
      counterWords: skill.counterWords,
      counterHint: skill.counterHint
    };
  }

  /**
   * 轮换生成敌方的下回合意图与准备释放的技能卡牌 (Intent AI & Skill Deck)
   * 深度融合人教版英语听音辨意与语义克制 (Task-Based Learning)
   */
  rollEnemyIntent() {
    this.enemy.turnCount++;
    const t = this.enemy.turnCount;
    let selectedSkill = null;

    // 特殊阶段 BOSS 专属技能卡牌轮转
    if (this.stageNum === 5) {
      // 桶狭间 今川义元
      if (t % 3 === 1) {
        selectedSkill = ENEMY_SKILL_DATABASE.imagawa_bow;
      } else if (t % 3 === 2) {
        selectedSkill = ENEMY_SKILL_DATABASE.shield;
      } else {
        selectedSkill = ENEMY_SKILL_DATABASE.imagawa_thunder;
      }
    } else if (this.stageNum === 10) {
      // 墨俣一夜城 斋藤大将
      if (t % 3 === 1) {
        selectedSkill = ENEMY_SKILL_DATABASE.heavy_strike;
      } else if (t % 3 === 2) {
        selectedSkill = ENEMY_SKILL_DATABASE.wall;
      } else {
        selectedSkill = ENEMY_SKILL_DATABASE.fire;
      }
    } else if (this.stageNum === 25) {
      // 甲斐之虎 武田信玄 (风林火山)
      if (t % 3 === 1) {
        selectedSkill = ENEMY_SKILL_DATABASE.shingen_wind;
      } else if (t % 3 === 2) {
        selectedSkill = ENEMY_SKILL_DATABASE.shingen_mountain;
      } else {
        selectedSkill = ENEMY_SKILL_DATABASE.shingen_fire;
      }
    } else if (this.stageNum === 35) {
      // 奥州霸者 伊达政宗 (独眼龙)
      if (t % 3 === 1) {
        selectedSkill = ENEMY_SKILL_DATABASE.masamune_dragon;
      } else if (t % 3 === 2) {
        selectedSkill = ENEMY_SKILL_DATABASE.masamune_crescent;
      } else {
        selectedSkill = ENEMY_SKILL_DATABASE.masamune_cannon;
      }
    } else {
      // 常规城池敌将技能库循环：刀斩 ➔ 铁盾 ➔ 箭雨 ➔ 双刀连击 ➔ 战吼壮胆 ➔ 破阵重劈
      const regularSkills = [
        ENEMY_SKILL_DATABASE.strike,
        ENEMY_SKILL_DATABASE.shield,
        ENEMY_SKILL_DATABASE.arrows,
        ENEMY_SKILL_DATABASE.double_slash,
        ENEMY_SKILL_DATABASE.war_cry,
        ENEMY_SKILL_DATABASE.heavy_strike
      ];
      selectedSkill = regularSkills[(t - 1) % regularSkills.length];
    }

    this.enemy.currentSkill = selectedSkill;
    this.enemy.intent = this.skillToIntent(selectedSkill);
  }

  /**
   * 大声朗读当前敌将的英语战术意图 (儿童有声英语输入)
   */
  speakEnemyIntent() {
    if (!this.enemy || !this.enemy.intent || !this.enemy.intent.speechEn) return;
    if (window.audioEngine) {
      window.audioEngine.speak(this.enemy.intent.speechEn);
    }
  }

  /**
   * 回合开始 (杀戮尖塔风格：横幅演出 + 气力注满 + 手牌重置 + 意图播报)
   */
  startTurn() {
    this.isEnemyActing = false;
    this.heroEnergy = this.heroMaxEnergy;
    this.heroBlock = 0; // 回合初护甲重置
    this.enemy.block = 0; // 敌方护甲重置
    this.turnCardsPlayed = []; // 重置本回合打出卡牌记录

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

    // 决定敌方本回合将要释放的技能与意图 (第 1 回合已在 setupEnemy 初始化)
    if (this.turn > 1) {
      this.rollEnemyIntent();
    }

    // 弹出【我方行动回合 YOUR TURN】全屏交锋横幅
    this.showTurnBanner('hero');

    // 播放气力蓄满提示音
    if (window.audioEngine?.playEnergyCharge) {
      window.audioEngine.playEnergyCharge();
    }

    this.renderBattleArena();

    // 回合开始：敌将用英语呼喊战术意图！(儿童英语纯正美音输入)
    setTimeout(() => {
      this.speakEnemyIntent();
    }, 550);
  }

  /**
   * 从抽牌堆摸牌
   */
  drawCards(num = 1) {
    for (let i = 0; i < num; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        // 弃牌堆洗入抽牌堆 (真随机洗牌)
        this.drawPile = window.shuffleArray ? window.shuffleArray(this.discardPile) : [...this.discardPile];
        this.discardPile = [];
      }
      if (this.drawPile.length > 0) {
        this.hand.push(this.drawPile.pop());
      }
    }
  }

  /**
   * 触发英语语义克制破敌反馈 (Tactical Semantic Counter Feedback)
   */
  triggerCounterFeedback(msg) {
    if (window.audioEngine) {
      if (window.audioEngine.playKatanaSlash) window.audioEngine.playKatanaSlash();
      setTimeout(() => {
        window.audioEngine.speak("Great counter!");
      }, 300);
    }

    // 弹出战场中央识策破敌横幅
    const arena = document.getElementById('siege-arena') || document.getElementById('scene-siege-battle');
    if (arena) {
      const banner = document.createElement('div');
      banner.className = 'tactical-counter-banner animate-pop-in';
      banner.innerHTML = `
        <div class="counter-badge-icon">⚡ PERFECT COUNTER</div>
        <div class="counter-badge-title">妙策破敌！</div>
        <div class="counter-badge-desc">${msg}</div>
      `;
      arena.appendChild(banner);
      setTimeout(() => banner.remove(), 1600);
    }

    if (window.ui) {
      window.ui.showToast(msg, '⚡');
    }
  }

  /**
   * 触发连词成句双词连携反馈 (Phrase Collocation Feedback)
   */
  triggerComboFeedback(combo) {
    // 朗读合成完整短语
    if (window.audioEngine) {
      window.audioEngine.speak(combo.phraseEn);
    }

    // 执行短语组合技能效果
    combo.effect(this);

    // 弹出连词成句金色学习弹条
    const arena = document.getElementById('siege-arena') || document.getElementById('scene-siege-battle');
    if (arena) {
      const banner = document.createElement('div');
      banner.className = 'phrase-combo-banner animate-pop-in';
      banner.innerHTML = `
        <div class="phrase-combo-tag">🎴 COMBO!</div>
        <div class="phrase-combo-en">"${combo.phraseEn}"</div>
        <div class="phrase-combo-cn">${combo.phraseCn} · ${combo.desc}</div>
      `;
      arena.appendChild(banner);
      setTimeout(() => banner.remove(), 1800);
    }

    if (window.ui) {
      window.ui.showToast(`🌟【${combo.phraseEn}】${combo.desc}`, '🎴');
    }
  }

  /**
   * 自然拼读拆解朗读 (Phonics Synthetic Spelling)
   */
  playPhonicsSpelling(cardId) {
    const card = this.cardDatabase[cardId];
    if (!card || !card.phonics) return;

    const parts = card.phonics.split('-');
    if (window.ui) {
      window.ui.showToast(`🔤 自然拼读：${parts.join(' - ')} ➔ ${card.en}!`, '🔈');
    }

    if (window.audioEngine) {
      // 逐个发音音素，随后连读全词
      let delay = 0;
      parts.forEach((p) => {
        setTimeout(() => {
          window.audioEngine.speak(p);
        }, delay);
        delay += 550;
      });
      setTimeout(() => {
        window.audioEngine.speak(card.en);
      }, delay + 250);
    }
  }

  /**
   * 玩家点击打出一张手牌
   * 融入英语听力理解与语义克制：打出克制卡触发妙策破敌！
   * 融入英语词汇连词成句：打出连携卡触发 Phrase Combo！
   */
  playCard(index) {
    if (!this.isActive || this.isEnemyActing) return;
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

    // 从手牌移至弃牌堆并记录本回合出牌
    this.hand.splice(index, 1);
    this.discardPile.push(cardId);
    this.turnCardsPlayed.push(cardId);

    // 核心习得：真人发音大声朗读英文单词！
    if (window.audioEngine) {
      window.audioEngine.speak(card.en);
    }

    // 1. 检查是否达成【语义克制破敌】(Tactical Semantic Counter)
    let isCounter = false;
    let counterMsg = '';
    if (this.enemy.intent && Array.isArray(this.enemy.intent.counterWords)) {
      if (this.enemy.intent.counterWords.includes(card.id)) {
        isCounter = true;
        this.countersTriggeredThisBattle = (this.countersTriggeredThisBattle || 0) + 1;

        if (this.enemy.intent.keyword === 'arrows') {
          this.heroBlock += 6;
          counterMsg = '🎯 识破箭雨 (Arrows)！腾跃规避，额外获得 +6 护甲！';
        } else if (this.enemy.intent.keyword === 'shield' || this.enemy.intent.keyword === 'wall') {
          if (this.enemy.block > 0) {
            this.enemy.block = 0;
            counterMsg = '💥 识破坚盾 (Shield)！弱点贯穿，瞬间破除敌方全部护甲！';
          } else {
            counterMsg = '🏹 破甲突刺！直接造成弱点暴击！';
          }
        } else if (this.enemy.intent.keyword === 'fire') {
          const prev = this.heroHp;
          this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 8);
          counterMsg = `💧 清泉熄灭烈火 (Fire)！恢复 ${this.heroHp - prev} 点生命！`;
        } else if (this.enemy.intent.keyword === 'horse') {
          this.heroEnergy = Math.min(this.heroMaxEnergy + 2, this.heroEnergy + 1);
          counterMsg = '🐎 飞跃神驹 (Horse)！避其锋芒，顺势恢复 1 点气力！';
        } else if (this.enemy.intent.keyword === 'strike') {
          this.heroBlock += 8;
          counterMsg = '⚔️ 招架重击 (Strike)！稳如磐石，额外获得 +8 坚固护盾！';
        } else if (this.enemy.intent.keyword === 'dragon') {
          this.heroBlock += 8;
          this.drawCards(1);
          counterMsg = '🐉 黑龙破空 (Dragon)！借力翻腾，获 8 护甲并多摸 1 张牌！';
        } else {
          this.heroBlock += 5;
          counterMsg = '✨ 完美看破敌意！获得 +5 军心护甲！';
        }
      }
    }

    // 2. 检查是否达成【连词成句 · 双词连携】(Collocation Combo)
    let comboTriggered = null;
    if (this.turnCardsPlayed.length >= 2) {
      const prevId = this.turnCardsPlayed[this.turnCardsPlayed.length - 2];
      const curId = card.id;
      comboTriggered = ENGLISH_PHRASE_COMBOS.find(c => {
        return (c.pair[0] === prevId && c.pair[1] === curId) || (c.pair[0] === curId && c.pair[1] === prevId);
      });
    }

    // 结算卡牌基础效果
    this.applyCardEffects(card);

    // 触发语义克制反馈
    if (isCounter) {
      this.triggerCounterFeedback(counterMsg);
    }

    // 触发连词成句反馈
    if (comboTriggered) {
      setTimeout(() => {
        this.triggerComboFeedback(comboTriggered);
      }, isCounter ? 650 : 150);
    }

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
   * 杀戮尖塔风格：弹出敌方行动大横幅，锁定出牌，转交敌方回合
   */
  endTurn() {
    if (!this.isActive || this.isEnemyActing) return;

    this.isEnemyActing = true;

    // 弃置当前剩余所有手牌
    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop());
    }
    this.renderBattleArena();

    // 1. 弹出【敌方行动回合 ENEMY TURN】全屏交锋横幅
    this.showTurnBanner('enemy');

    if (window.audioEngine?.playTaikoDrum) {
      window.audioEngine.playTaikoDrum();
    }

    // 敌方行动指令台状态指示
    const deckDeckEl = document.getElementById('siege-command-deck');
    if (deckDeckEl) {
      deckDeckEl.innerHTML = `
        <div class="card-turn-status-bar is-enemy-turn">
          <span class="status-pulse-dot">⚔️</span>
          <span>敌方回合：【${this.enemy.name}】正在出招【${this.enemy.intent?.nameEn || this.enemy.intent?.text}】...</span>
        </div>
      `;
    }

    // 2. 800ms 后敌方正式打出技能卡牌
    setTimeout(() => {
      this.executeEnemyAction();
    }, 850);
  }

  /**
   * 弹出全屏回合转换横幅 (杀戮尖塔 Slay the Spire 风格)
   * @param {'enemy' | 'hero'} type 
   */
  showTurnBanner(type) {
    const arena = document.getElementById('siege-arena') || document.getElementById('scene-siege-battle');
    if (!arena) return;

    // 移除历史旧横幅
    arena.querySelectorAll('.turn-change-banner').forEach(b => b.remove());

    const banner = document.createElement('div');
    banner.className = `turn-change-banner is-${type}`;
    if (type === 'enemy') {
      banner.innerHTML = `
        <div class="banner-main-title">⚔️ 敌方回合 · ENEMY TURN</div>
      `;
    } else {
      banner.innerHTML = `
        <div class="banner-main-title">🎴 我方回合 · YOUR TURN</div>
      `;
    }
    arena.appendChild(banner);
    setTimeout(() => {
      if (banner && banner.parentElement) banner.remove();
    }, 1150);
  }

  /**
   * 战场正中央具象化弹出敌方技能卡牌 (Enemy Skill Card Pop)
   */
  showEnemySkillCard(skill, enemyAtk = 0) {
    const arena = document.getElementById('siege-arena') || document.getElementById('scene-siege-battle');
    if (!arena) return;

    this.dismissEnemySkillCard();

    const pop = document.createElement('div');
    pop.id = 'enemy-skill-card-pop';
    pop.className = `enemy-skill-card-pop is-${skill.type}`;

    let valText = '';
    if (skill.type === 'attack') {
      const dmg = skill.baseVal + enemyAtk;
      valText = skill.hits > 1 ? `⚔️ ${dmg} x ${skill.hits}` : `⚔️ ${dmg}${skill.pierce ? ' 破甲' : ''}`;
    } else if (skill.type === 'defend') {
      valText = `🛡️ +${skill.baseVal}`;
    } else if (skill.type === 'buff') {
      valText = `💪 +${skill.strength || 2}${skill.block ? ` 🛡️+${skill.block}` : ''}`;
    }

    pop.innerHTML = `
      <div class="enemy-card-top-tag">${skill.type === 'attack' ? '⚔️ ATTACK' : (skill.type === 'defend' ? '🛡️ DEFEND' : '✨ BUFF')}</div>
      <div class="enemy-card-icon">${skill.icon}</div>
      <div class="enemy-card-title-en">${skill.nameEn}</div>
      ${skill.phonetic ? `<div class="enemy-card-phonetic">${skill.phonetic}</div>` : ''}
      <div class="enemy-card-title-cn">${skill.nameCn}</div>
      <div class="enemy-card-val-badge">${valText}</div>
    `;

    arena.appendChild(pop);
  }

  /**
   * 收回/消散战场中央敌方技能卡
   */
  dismissEnemySkillCard() {
    const pop = document.getElementById('enemy-skill-card-pop');
    if (pop) {
      pop.classList.add('is-leaving');
      setTimeout(() => pop.remove(), 260);
    }
  }

  /**
   * 敌将人物立绘猛烈冲刺攻击动画 (Lunge Animation)
   */
  animateEnemyLunge() {
    const enemyImg = document.getElementById('siege-enemy-avatar') || document.getElementById('siege-enemy-img');
    if (enemyImg) {
      enemyImg.classList.add('enemy-lunge-anim');
      setTimeout(() => enemyImg.classList.remove('enemy-lunge-anim'), 480);
    }
  }

  /**
   * 我方受到伤害时的全屏暗红受击闪烁 (Screen Damage Flash)
   */
  flashDamageScreen() {
    const arena = document.getElementById('siege-arena') || document.getElementById('scene-siege-battle');
    if (!arena) return;
    const flash = document.createElement('div');
    flash.className = 'screen-damage-flash';
    arena.appendChild(flash);
    setTimeout(() => flash.remove(), 360);
  }

  /**
   * 实时平滑刷新双方血条、血量文字与护甲药丸
   */
  updateHpAndBlockBars() {
    const heroHpPct = Math.max(0, Math.min(100, (this.heroHp / this.heroMaxHp) * 100));
    const enemyHpPct = Math.max(0, Math.min(100, (this.enemy.hp / this.enemy.maxHp) * 100));

    // 主角血条与文字
    const heroFill = document.querySelector('.card-hp-fill.is-hero');
    if (heroFill) heroFill.style.width = `${heroHpPct}%`;
    const heroHpLabel = document.querySelector('#siege-side-hero .card-hp-label');
    if (heroHpLabel) heroHpLabel.textContent = `❤️ ${this.heroHp}/${this.heroMaxHp}`;

    // 主角护甲光晕
    const heroAvatar = document.getElementById('siege-hero-avatar');
    if (heroAvatar) {
      let shieldAura = heroAvatar.querySelector('.hero-shield-aura');
      if (this.heroBlock > 0) {
        if (!shieldAura) {
          shieldAura = document.createElement('div');
          shieldAura.className = 'hero-shield-aura';
          heroAvatar.appendChild(shieldAura);
        }
        shieldAura.textContent = `🛡️ ${this.heroBlock}`;
      } else if (shieldAura) {
        shieldAura.remove();
      }
    }

    // 敌人血条与文字
    const enemyFill = document.querySelector('.card-hp-fill.is-enemy');
    if (enemyFill) enemyFill.style.width = `${enemyHpPct}%`;
    const enemyHpLabel = document.querySelector('#siege-side-enemy .card-hp-label');
    if (enemyHpLabel) enemyHpLabel.textContent = `❤️ ${this.enemy.hp}/${this.enemy.maxHp}`;

    // 敌人护甲药丸
    const enemyStatGroup = document.querySelector('#siege-side-enemy .card-stat-bar-group');
    if (enemyStatGroup) {
      let enemyBlockPill = enemyStatGroup.querySelector('.enemy-block-pill');
      if (this.enemy.block > 0) {
        if (!enemyBlockPill) {
          enemyBlockPill = document.createElement('div');
          enemyBlockPill.className = 'enemy-block-pill';
          enemyStatGroup.appendChild(enemyBlockPill);
        }
        enemyBlockPill.textContent = `🛡️ 护甲: ${this.enemy.block}`;
      } else if (enemyBlockPill) {
        enemyBlockPill.remove();
      }
    }
  }

  /**
   * 执行敌方意图技能 (杀戮尖塔风格：出牌展开 + TTS战吼 + 冲锋打击 + 受击闪红 + 血条平滑缩减)
   */
  executeEnemyAction() {
    if (!this.isActive) return;

    const skill = this.enemy.currentSkill || ENEMY_SKILL_DATABASE[this.enemy.intent?.skillId] || ENEMY_SKILL_DATABASE.strike;
    const enemyAtk = this.enemy.strength || 0;

    // 1. 战场正中央具象化弹出敌方技能卡
    this.showEnemySkillCard(skill, enemyAtk);

    // 2. 敌将用纯正美音大声朗读出英文技能名与战吼台词！
    if (window.audioEngine && skill.speechEn) {
      window.audioEngine.speak(skill.speechEn);
    }

    // 3. 700ms 后敌将发起物理冲刺打击 (Lunge Animation)
    setTimeout(() => {
      this.animateEnemyLunge();

      // 4. 结算技能数值效果
      let finalDmg = 0;
      if (skill.type === 'attack') {
        const hits = skill.hits || 1;
        const perHitDmg = (skill.baseVal + enemyAtk);
        finalDmg = perHitDmg * hits;

        // 特效与打击音效
        this.triggerVfx(skill.vfx || 'vfx-slash');
        if (skill.vfx === 'vfx-arrow') {
          if (window.audioEngine?.playBowShoot) window.audioEngine.playBowShoot();
        } else if (skill.vfx === 'vfx-thunder') {
          if (window.audioEngine?.playThunder) window.audioEngine.playThunder();
        } else {
          if (window.audioEngine?.playKatanaSlash) window.audioEngine.playKatanaSlash();
        }

        // 玩家护甲抵挡伤害
        let actualDmg = finalDmg;
        if (!skill.pierce && this.heroBlock > 0) {
          if (this.heroBlock >= actualDmg) {
            this.heroBlock -= actualDmg;
            this.showFloatingNumber(this.getHeroElem(), `抵挡 -${actualDmg} 🛡️`, 'fct-block');
            if (window.audioEngine?.playShieldBlock) window.audioEngine.playShieldBlock();
            actualDmg = 0;
          } else {
            actualDmg -= this.heroBlock;
            this.showFloatingNumber(this.getHeroElem(), `破甲 -${this.heroBlock}`, 'fct-block');
            this.heroBlock = 0;
          }
        }

        if (actualDmg > 0) {
          this.heroHp = Math.max(0, this.heroHp - actualDmg);
          this.showFloatingNumber(this.getHeroElem(), `-${actualDmg} 💔`, 'fct-damage');
          // 主角受击剧烈震动 & 全屏血红受击闪烁！
          this.shakeElement(this.getHeroElem());
          this.flashDamageScreen();
        }
      } else if (skill.type === 'defend') {
        const gainBlock = skill.baseVal;
        this.enemy.block += gainBlock;
        this.showFloatingNumber(this.getEnemyElem(), `+${gainBlock} 🛡️`, 'fct-defense');
        if (window.audioEngine?.playShieldBlock) window.audioEngine.playShieldBlock();
        this.triggerVfx('vfx-shield');
      } else if (skill.type === 'buff') {
        if (skill.strength) {
          this.enemy.strength = (this.enemy.strength || 0) + skill.strength;
          this.showFloatingNumber(this.getEnemyElem(), `+${skill.strength} 力量 💪`, 'fct-buff');
        }
        if (skill.block) {
          this.enemy.block += skill.block;
          this.showFloatingNumber(this.getEnemyElem(), `+${skill.block} 🛡️`, 'fct-defense');
        }
        if (window.audioEngine?.playEnergyCharge) window.audioEngine.playEnergyCharge();
      }

      // 实时平滑刷新双方血条与护甲
      this.updateHpAndBlockBars();

      // 5. 1100ms 后收回技能卡，检查是否阵亡，或进入我方下一回合
      setTimeout(() => {
        this.dismissEnemySkillCard();

        // 检查我方阵亡与饭团复活
        if (this.heroHp <= 0) {
          const inv = window.heroManager ? window.heroManager.hero.inventory : null;
          if (inv && inv['item-riceball'] && inv['item-riceball'] > 0) {
            inv['item-riceball']--;
            this.heroHp = 15;
            this.updateHpAndBlockBars();
            this.showFloatingNumber(this.getHeroElem(), `🍙 饭团复活 +15 HP!`, 'fct-heal');
            if (window.audioEngine?.playHealChime) window.audioEngine.playHealChime();
            if (window.ui) window.ui.showToast('🍙 宁宁温热饭团发挥奇效！藤吉郎重整旗鼓！', '💖');
          } else {
            setTimeout(() => this.handleDefeat(), 400);
            return;
          }
        }

        // 回合交替：进入玩家下一回合！
        this.turn++;
        this.isEnemyActing = false;
        this.startTurn();
      }, 1000);
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
    const shuffledTextbook = window.shuffleArray ? window.shuffleArray(textbookCards) : [...textbookCards];
    const shuffledTactical = window.shuffleArray ? window.shuffleArray(tacticalCards) : [...tacticalCards];

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
          <h2 class="draft-title">🎁 挑选 1 张新卡</h2>
        </div>

        <div class="card-draft-grid">
          ${selected3.map(cid => {
            const c = this.cardDatabase[cid];
            return `
              <div class="tactical-card draft-card-item is-${c.type}" onclick="window.audioEngine?.speak('${c.en}')">
                <div class="card-cost-badge">${c.cost} ⚡</div>
                <div class="card-crest-icon">${c.icon}</div>
                <div class="card-title-en">${c.en}</div>
                ${c.phonetic ? `<div class="card-phonetic-badge">${c.phonetic}</div>` : ''}
                <div class="card-title-cn">${c.cn}</div>
                <div class="card-badge-val">${this.getCardBadgeVal(c)}</div>
                <button class="btn btn-primary btn-draft-pick" onclick="event.stopPropagation(); window.cardBattle.pickDraftCard('${cid}', this)">
                  📥 选择
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <div class="card-draft-footer">
          <button class="btn btn-secondary btn-draft-skip" onclick="window.cardBattle.skipDraftCard()">
            跳过 ✕
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
   * 融入自然拼读 (Phonics) 与纯正发音教学
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
          <p class="viewer-tip">点击卡牌可听纯正美音发音，点击【🔤 拼读】可倾听自然拼读拆解！</p>
        </div>

        <div class="deck-viewer-grid">
          ${Object.entries(counts).map(([cid, count]) => {
            const c = this.cardDatabase[cid] || { en: cid, cn: cid, type: 'attack', cost: 1, icon: '⚔️', desc: '', phonetic: '' };
            return `
              <div class="tactical-card viewer-card-item is-${c.type}">
                <div class="card-cost-badge">${c.cost} ⚡</div>
                <div class="card-stack-badge">x${count}</div>
                ${c.isTextbook ? '<div class="card-origin-pill">课本词</div>' : (c.isCompanion ? '<div class="card-origin-pill is-comp">家臣</div>' : '')}
                <div class="card-crest-icon">${c.icon}</div>
                <div class="card-title-en">${c.en}</div>
                ${c.phonetic ? `<div class="card-phonetic-badge">${c.phonetic}</div>` : ''}
                <div class="card-title-cn">${c.cn}</div>
                <div class="card-desc-pill">${c.desc}</div>
                <div class="viewer-card-actions">
                  <button class="btn btn-xs btn-sound-read" onclick="window.audioEngine?.speak('${c.en}')" title="朗读全词">
                    🔊 朗读
                  </button>
                  ${c.phonics ? `
                    <button class="btn btn-xs btn-phonics-spell" onclick="window.cardBattle.playPhonicsSpelling('${cid}')" title="自然拼读拆解">
                      🔤 拼读
                    </button>
                  ` : ''}
                </div>
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
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curStage = Math.floor(curIdx / 3) + 1;
    this.startBattle({ stageNum: curStage });
  }

  // ==========================================================================
  // DOM 渲染与直观视觉动效 (Single-screen Mobile Layout)
  // ==========================================================================

  renderBattleArena() {
    const home = document.getElementById('home-screen');
    if (home) home.classList.add('hidden');
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

    // 中间区域：意图告示与听音辨敌
    const intent = (this.enemy && this.enemy.intent) || { 
      icon: '⚔️', 
      text: '准备行动', 
      keyword: 'strike', 
      speechEn: 'I will strike!', 
      speechCn: '接招！',
      counterHint: '根据英语词义选择克制战术！'
    };

    const vsCenter = document.querySelector('.siege-vs-center');
    if (vsCenter) {
      vsCenter.innerHTML = `
        <div class="card-battle-turn-indicator">
          <div class="turn-badge">第 ${this.turn} 回合</div>
          <div class="enemy-tactical-bubble" onclick="window.cardBattle.speakEnemyIntent()" title="点击倾听敌将语音">
            <div class="bubble-speech-en">🔊 "${intent.speechEn}"</div>
            <div class="bubble-speech-cn">${intent.speechCn}</div>
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
            <div class="enemy-intent-crown">${intent.icon}</div>
          </div>
        </div>
      `;
    }

    // 3. 底部指令台：手牌阵列 + 气力指示 + 结束回合按钮
    const deckEl = document.getElementById('siege-command-deck');
    if (deckEl) {
      // 检查是否有任何手牌可以打出，智能引导点击【结束回合】
      const hasPlayableCard = this.hand.some(cid => {
        const c = this.cardDatabase[cid];
        return c && this.heroEnergy >= c.cost;
      });
      const shouldUrgeEndTurn = (!hasPlayableCard || this.heroEnergy === 0) && !this.isEnemyActing;

      deckEl.innerHTML = `
        <div class="card-deck-container">
          <!-- 气力槽与牌堆统计 -->
          <div class="card-control-header">
            <div class="energy-orb-container ${this.heroEnergy === 0 ? 'is-empty' : ''}" id="card-energy-orb">
              <span class="energy-crest">⚡</span>
              <span class="energy-val">${this.heroEnergy}</span>
              <span class="energy-max">/${this.heroMaxEnergy}</span>
            </div>

            <div class="deck-counts-strip">
              <span class="deck-count-pill" title="抽牌堆">🎴 ${this.drawPile.length}</span>
              <span class="deck-count-pill" title="弃牌堆">🗑️ ${this.discardPile.length}</span>
            </div>

            <div class="end-turn-btn-wrapper" style="position:relative;">
              <button class="btn btn-end-turn ${shouldUrgeEndTurn ? 'pulse-urgent' : ''}" 
                      onclick="window.cardBattle.endTurn()"
                      ${this.isEnemyActing ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                ${shouldUrgeEndTurn ? '<span class="end-turn-tip-bubble">⚡ 结束出牌</span>' : ''}
                <span>结束回合 ➡️</span>
              </button>
            </div>
          </div>

          <!-- 展开的手牌 (支持单屏横滑/平铺) -->
          <div class="card-hand-deck" id="card-hand-deck" style="${this.isEnemyActing ? 'pointer-events:none; opacity:0.6;' : ''}">
            ${this.hand.map((cid, idx) => {
              const c = this.cardDatabase[cid];
              if (!c) return '';
              const canPlay = !this.isEnemyActing && this.heroEnergy >= c.cost;
              const isCounter = this.enemy.intent && Array.isArray(this.enemy.intent.counterWords) && this.enemy.intent.counterWords.includes(cid);
              return `
                <div class="tactical-card hand-card-item is-${c.type} ${canPlay ? 'can-play' : 'no-energy'} ${isCounter ? 'is-counter-ready' : ''}" 
                     onclick="window.cardBattle.playCard(${idx})"
                     title="${c.desc}">
                  <div class="card-cost-badge">${c.cost} ⚡</div>
                  ${isCounter ? `<div class="card-counter-sparkle-badge">⚡ 克制</div>` : ''}
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

  /**
   * 检查并高亮【结束回合】按钮指引
   */
  checkEndTurnGuidance() {
    const hasPlayableCard = this.hand.some(cid => {
      const c = this.cardDatabase[cid];
      return c && this.heroEnergy >= c.cost;
    });
    const btn = document.querySelector('.btn-end-turn');
    if (btn && (!hasPlayableCard || this.heroEnergy === 0) && !this.isEnemyActing) {
      btn.classList.add('pulse-urgent');
      if (!btn.querySelector('.end-turn-tip-bubble')) {
        const bubble = document.createElement('span');
        bubble.className = 'end-turn-tip-bubble';
        bubble.textContent = '⚡ 结束出牌';
        btn.appendChild(bubble);
      }
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
