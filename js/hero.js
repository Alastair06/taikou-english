/**
 * 太阁英语立志传 · 勇士与太阁官职晋升系统 (Hero & Sengoku Ranks)
 * - 阶级晋升：草鞋小厮 ➡️ 足轻头 ➡️ 目付 ➡️ 部将 ➡️ 家老 ➡️ 城主 ➡️ 天下人
 * - 功勋积累与织田信长当面提拔
 * - 居所升级：清洲草庵 ➡️ 长屋 ➡️ 町屋 ➡️ 武家大宅 ➡️ 雄伟天守阁
 * - 南蛮商馆名刀、洋枪、黑漆南蛮具足
 */

const SENGOKU_RANKS = [
  { id: 'rank-1', title: '草鞋小厮', reqMerit: 0, house: '清洲城下草庵', icon: '🛖', desc: '初入织田家，侍奉信长左右，冬天用怀中体温为信长暖草鞋。' },
  { id: 'rank-2', title: '足轻头', reqMerit: 100, house: '织田家长屋', icon: '🏕️', desc: '初建功勋，受命统率十名足轻长枪手，英气初显。' },
  { id: 'rank-3', title: '目付官', reqMerit: 300, house: '清洲城下町屋', icon: '🏡', desc: '巡按城防，刺探美浓与今川家军情，深得信长信赖。' },
  { id: 'rank-4', title: '部将', reqMerit: 700, house: '武家气派大宅', icon: '🏯', desc: '独领一军大将，旌旗猎猎，战阵前锋所向披靡。' },
  { id: 'rank-5', title: '家老重臣', reqMerit: 1500, house: '美浓稻叶山城天守', icon: '🏯', desc: '织田家栋梁重臣，参与军机枢密，天下布武之股肱！' },
  { id: 'rank-6', title: '一方城主', reqMerit: 3000, house: '雄伟山城天守阁', icon: '🏰', desc: '受封一方国主城池，治下万民安居，威震东海道。' },
  { id: 'rank-7', title: '天下人', reqMerit: 6000, house: '安土巨城聚乐第', icon: '👑', desc: '一统天下，终结战国百年乱世，开创太平盛世！' }
];

const SENGOKU_SHOP_ITEMS = [
  // 名刀与洋枪 (与自然拼读及拼写视觉特效深度绑定)
  { id: 'wpn-wood', type: 'weapon', name: '初心竹木刀', icon: '🗡️', cost: 0, bonusDmg: 0, slashType: 'wood', desc: '侍从练习木剑，击键发出清脆自然拼读木音。' },
  { id: 'wpn-katana', type: 'weapon', name: '备前长船兼光 · 拼读神刃', icon: '⚔️', cost: 60, bonusDmg: 10, slashType: 'katana', phonicsPerk: '长元音拼读破招触发银蓝流光剑气', desc: '名匠千锤百炼之刃，拼出长元音/双辅音词时斩出凌厉银蓝破空剑气！' },
  { id: 'wpn-muramasa', type: 'weapon', name: '妖刀村正 · 连击铭刃', icon: '🗡️✨', cost: 180, bonusDmg: 25, slashType: 'muramasa', phonicsPerk: '0失误独立盲拼触发CRITICAL暴击与双倍金币', desc: '相传渴求连战之神刃，无提示独立拼对时迸发赤红烈焰暴击与双倍金判！' },
  { id: 'wpn-spear', type: 'weapon', name: '天下名枪 · 蜻蛉切', icon: '🔱', cost: 380, bonusDmg: 45, slashType: 'spear', phonicsPerk: '大范围贯穿电弧，金光破阵', desc: '立地断蜻蜓之神枪，大范围金色闪电突刺，伤害与武勋 +45！' },
  { id: 'wpn-dojigiri', type: 'weapon', name: '天下五剑 · 童子切安纲', icon: '⚔️🔥', cost: 700, bonusDmg: 70, slashType: 'dojigiri', phonicsPerk: '国宝破魔神刃，全屏剑气横扫', desc: '相传斩妖除魔之至尊国宝神刃，伤害 +70，剑气光华夺目！' },
  { id: 'wpn-musket', type: 'weapon', name: '西洋南蛮重炮大铳', icon: '💥🪄', cost: 1200, bonusDmg: 110, slashType: 'musket', phonicsPerk: '多音节长难词终极轰鸣爆破，浓烈硝烟火光', desc: '攻克多音节长难词专属神铳，拼成时轰天炮鸣，巨额武勋加成！' },

  // 战国防具 (直接扩充心心生命上限，包容拼写错误，提升容错率)
  { id: 'arm-cloth', type: 'armor', name: '草履侍从阵羽织', icon: '🥋', cost: 0, hearts: 3, bonusHp: 0, desc: '朴素棉布阵羽织，提供 3 颗基础心心生命（允许失误 3 次）。' },
  { id: 'arm-domaru', type: 'armor', name: '胴丸黑铁具足', icon: '🛡️', cost: 100, hearts: 4, bonusHp: 30, desc: '精铁打造的坚固胸甲，心心生命上限扩充为 4 颗心，提高拼写容错！' },
  { id: 'arm-nanban', type: 'armor', name: '黑漆丝威南蛮胴具足', icon: '🛡️✨', cost: 400, hearts: 5, bonusHp: 80, desc: '西洋板甲名品，心心生命上限扩充为 5 颗心，稳如泰山！' },
  { id: 'arm-dragon', type: 'armor', name: '黄金真龙天王大铠', icon: '👑✨', cost: 950, hearts: 6, bonusHp: 160, desc: '至尊龙纹圣铠，心心生命上限扩充为 6 颗心，固若金汤！' },

  // 战国南蛮奇珍与外交信物 (实战贸易与探案加成)
  { id: 'relic-none', type: 'relic', name: '单刀赴会', icon: '🎋', cost: 0, bonusGold: 1, bonusMerit: 1, desc: '两袖清风，凭一身孤勇与智慧闯荡战国。' },
  { id: 'relic-telescope', type: 'relic', name: '南蛮西洋远望镜', icon: '🔭', cost: 120, bonusGold: 1.25, bonusMerit: 1.1, desc: '西洋水手观测星辰之镜，能洞悉远方宝藏与先机，金币 +25%，功勋 +10%！' },
  { id: 'relic-seal', type: 'relic', name: '织田信长朱印状', icon: '📜✨', cost: 450, bonusGold: 1.5, bonusMerit: 1.25, desc: '信长亲赐的最高通行勘合，诸国商旅与奉行无不敬服，金币 +50%，功勋 +25%！' },
  { id: 'relic-clock', type: 'relic', name: '葡萄牙万国自鸣钟', icon: '🕰️✨', cost: 1100, bonusGold: 1.8, bonusMerit: 1.5, desc: '南蛮至高工艺结晶，精准把控战机与贸易节律，金币 +80%，功勋 +50%！' },

  // 局内助学消耗道具 (地牢法宝锦囊)
  { id: 'item-riceball', type: 'consumable', name: '听音兵粮丸', icon: '🍙', cost: 25, desc: '吃下一枚热腾腾的军粮饭团，回满 1 颗心，并以标准纯正美音慢速拆读当前单词！' },
  { id: 'item-scroll', type: 'consumable', name: '破招洞察卷轴', icon: '📜', cost: 40, desc: '展开自然拼读心法，点拨当前单词的核心发音规则，并高亮闪烁下一个正确字母！' },
  { id: 'item-bomb', type: 'consumable', name: '音节破阵雷', icon: '💣', cost: 60, desc: '轰碎敌人坚冰护盾，直接自动填入当前单词的首个音节/字母，破除卡壳！' }
];

class HeroManager {
  constructor() {
    this.storageKey = 'taikou_english_hero_v2';
    this.hero = this.loadHeroData();
    // 确保心心生命值同步
    if (!this.hero.currentHearts || this.hero.currentHearts > this.getMaxHearts()) {
      this.hero.currentHearts = this.getMaxHearts();
    }
    if (!this.hero.inventory) {
      this.hero.inventory = { 'item-riceball': 3, 'item-scroll': 2, 'item-bomb': 1 };
    }
  }

  getDefaultData() {
    return {
      name: '木下藤吉郎',
      merit: 0, // 累积功勋值
      gold: 100, // 初始贯高货币 (文/贯)
      baseHp: 100,
      currentHp: 100,
      currentHearts: 3,
      equippedWeapon: 'wpn-wood',
      equippedArmor: 'arm-cloth',
      equippedRelic: 'relic-none',
      ownedItemIds: ['wpn-wood', 'arm-cloth', 'relic-none'],
      inventory: {
        'item-riceball': 3,
        'item-scroll': 2,
        'item-bomb': 1
      },
      totalWordsMastered: 0,
      totalBattlesWon: 0
    };
  }

  loadHeroData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        // 兼容旧存档：清除旧战宠数据并平滑迁移至南蛮秘宝
        if (parsed.equippedPet || (parsed.ownedItemIds && parsed.ownedItemIds.some(id => id.startsWith('pet-')))) {
          parsed.equippedRelic = 'relic-none';
          parsed.ownedItemIds = (parsed.ownedItemIds || []).filter(id => !id.startsWith('pet-'));
          if (!parsed.ownedItemIds.includes('relic-none')) parsed.ownedItemIds.push('relic-none');
          delete parsed.equippedPet;
        }
        return { ...this.getDefaultData(), ...parsed };
      }
    } catch (e) {
      console.warn('Hero load failed:', e);
    }
    return this.getDefaultData();
  }

  saveHeroData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.hero));
    } catch (e) {
      console.error('Hero save failed:', e);
    }
  }

  getCurrentRank() {
    let cur = SENGOKU_RANKS[0];
    for (const r of SENGOKU_RANKS) {
      if (this.hero.merit >= r.reqMerit) cur = r;
    }
    return cur;
  }

  getNextRank() {
    const curIdx = SENGOKU_RANKS.findIndex(r => r.id === this.getCurrentRank().id);
    return SENGOKU_RANKS[curIdx + 1] || null;
  }

  getEquippedWeapon() {
    return SENGOKU_SHOP_ITEMS.find(i => i.id === this.hero.equippedWeapon) || SENGOKU_SHOP_ITEMS[0];
  }

  getEquippedArmor() {
    return SENGOKU_SHOP_ITEMS.find(i => i.id === this.hero.equippedArmor) || SENGOKU_SHOP_ITEMS[6];
  }

  getEquippedRelic() {
    return SENGOKU_SHOP_ITEMS.find(i => i.id === (this.hero.equippedRelic || 'relic-none')) || SENGOKU_SHOP_ITEMS[10];
  }

  // 兼容别名
  getEquippedPet() {
    return this.getEquippedRelic();
  }

  getGold() {
    return this.hero ? this.hero.gold : 0;
  }

  getShopCatalog() {
    return SENGOKU_SHOP_ITEMS;
  }

  getMaxHearts() {
    const armor = this.getEquippedArmor();
    let hearts = armor.hearts || 3;
    if (typeof window !== 'undefined' && window.cardsManager && window.cardsManager.state && window.cardsManager.state.equippedTitle === 'title-pioneer') {
      hearts += 1;
    }
    return hearts;
  }

  getCurrentHearts() {
    if (typeof this.hero.currentHearts === 'undefined') {
      this.hero.currentHearts = this.getMaxHearts();
    }
    return Math.min(this.getMaxHearts(), Math.max(0, this.hero.currentHearts));
  }

  healHeart(count = 1) {
    const max = this.getMaxHearts();
    this.hero.currentHearts = Math.min(max, (this.hero.currentHearts || max) + count);
    this.saveHeroData();
    return this.hero.currentHearts;
  }

  damageHeart(count = 1) {
    this.hero.currentHearts = Math.max(0, (this.hero.currentHearts || this.getMaxHearts()) - count);
    this.saveHeroData();
    return {
      currentHearts: this.hero.currentHearts,
      isAlive: this.hero.currentHearts > 0
    };
  }

  resetHearts() {
    this.hero.currentHearts = this.getMaxHearts();
    this.saveHeroData();
  }

  getItemCount(itemId) {
    if (!this.hero.inventory) this.hero.inventory = {};
    return this.hero.inventory[itemId] || 0;
  }

  addItem(itemId, count = 1) {
    if (!this.hero.inventory) this.hero.inventory = {};
    this.hero.inventory[itemId] = (this.hero.inventory[itemId] || 0) + count;
    this.saveHeroData();
    return this.hero.inventory[itemId];
  }

  useItem(itemId) {
    if (!this.hero.inventory) this.hero.inventory = {};
    const count = this.hero.inventory[itemId] || 0;
    if (count <= 0) return false;
    this.hero.inventory[itemId] = count - 1;
    this.saveHeroData();
    return true;
  }

  getMaxHp() {
    const armor = this.getEquippedArmor();
    return this.hero.baseHp + (armor.bonusHp || 0);
  }

  getAttackPower() {
    const weapon = this.getEquippedWeapon();
    const rankBonus = SENGOKU_RANKS.indexOf(this.getCurrentRank()) * 10;
    return 30 + rankBonus + (weapon.bonusDmg || 0);
  }

  addMerit(amount) {
    const pet = this.getEquippedPet();
    const multiplier = pet.bonusMerit || 1;
    const finalEarn = Math.round(amount * multiplier);

    const prevRank = this.getCurrentRank();
    this.hero.merit += finalEarn;
    const newRank = this.getCurrentRank();
    this.saveHeroData();

    return {
      earned: finalEarn,
      promoted: prevRank.id !== newRank.id,
      newRank
    };
  }

  addGold(amount) {
    const pet = this.getEquippedPet();
    let multiplier = pet.bonusGold || 1;
    if (typeof window !== 'undefined' && window.cardsManager && window.cardsManager.state && window.cardsManager.state.equippedTitle === 'title-merchant') {
      multiplier += 0.2;
    }
    const finalEarn = Math.round(amount * multiplier);
    this.hero.gold += finalEarn;
    this.saveHeroData();
    return finalEarn;
  }

  addReward(merit, gold) {
    this.addMerit(merit);
    this.addGold(gold);
  }

  buyItem(itemId, discountRate = 1.0) {
    const item = SENGOKU_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, msg: '物品不存在' };

    const effectiveCost = Math.max(1, Math.round(item.cost * discountRate));
    const savedGold = item.cost - effectiveCost;

    if (item.type === 'consumable') {
      if (this.hero.gold < effectiveCost) return { success: false, msg: '军资不足，完成主命可得金判！' };
      this.hero.gold -= effectiveCost;
      this.addItem(itemId, 1);
      const discountMsg = savedGold > 0 ? `（答题砍价省下 ${savedGold} 贯！）` : '';
      return { 
        success: true, 
        msg: `购入【${item.name}】入囊！${discountMsg}`,
        cost: effectiveCost,
        effectiveCost,
        originalCost: item.cost,
        saved: savedGold,
        savedGold
      };
    }

    if (this.hero.ownedItemIds.includes(itemId)) return { success: false, msg: '已拥有该器物' };
    if (this.hero.gold < effectiveCost) return { success: false, msg: '所持军资不足，快去为主公完成主命吧！' };

    this.hero.gold -= effectiveCost;
    this.hero.ownedItemIds.push(itemId);
    this.equipItem(itemId);
    this.saveHeroData();
    const discountMsg = savedGold > 0 ? `（答题砍价省下 ${savedGold} 贯！）` : '';
    return { 
      success: true, 
      msg: `获得并佩戴了【${item.name}】！${discountMsg}`,
      cost: effectiveCost,
      effectiveCost,
      originalCost: item.cost,
      saved: savedGold,
      savedGold
    };
  }

  equipItem(itemId) {
    const item = SENGOKU_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || !this.hero.ownedItemIds.includes(itemId)) return false;

    if (item.type === 'weapon') this.hero.equippedWeapon = itemId;
    else if (item.type === 'armor') {
      this.hero.equippedArmor = itemId;
      // 穿戴防具时重置心心
      this.resetHearts();
    }
    else if (item.type === 'relic' || item.type === 'pet') this.hero.equippedRelic = itemId;

    this.saveHeroData();
    return true;
  }

  resetHp() {
    this.hero.currentHp = this.getMaxHp();
    this.resetHearts();
  }
}

window.heroManager = new HeroManager();
