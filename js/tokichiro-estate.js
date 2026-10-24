/**
 * 太阁英语立志传 · 藤吉郎小宅邸 / 一夜城建造装扮系统 (Tokichiro Estate System)
 * - 纯正自驱动力：孩子赚得的金判用于购置心仪的英文南蛮家具与庭院景观
 * - 随着官位晋升，从草庵升级为町屋、武家大宅与一夜城天守
 * - 每次选购、点击与放置家具均带有原声美音朗读，孩子为了把家装扮得更漂亮而自发想认识所有家具！
 */

const TOKICHIRO_FURNITURE_CATALOG = [
  {
    id: 'furn-desk',
    name: '文房黑漆书案',
    en: 'desk',
    phonetic: '/desk/',
    icon: '🪵',
    emoji: '🪑',
    cost: 50,
    slotType: 'room',
    desc: '红木雕花书案，研墨习字、绘制军机行军图之宝。'
  },
  {
    id: 'furn-chair',
    name: '南蛮丝绒扶手椅',
    en: 'chair',
    phonetic: '/tʃer/',
    icon: '🪑',
    emoji: '🪑',
    cost: 45,
    slotType: 'room',
    desc: '葡萄牙手工天鹅绒靠椅，触感温润高雅。'
  },
  {
    id: 'furn-bed',
    name: '锦缎丝棉软榻',
    en: 'bed',
    phonetic: '/bed/',
    icon: '🛏️',
    emoji: '🛏️',
    cost: 80,
    slotType: 'room',
    desc: '铺就尾张木棉与金丝锦被的舒适睡榻，安心休息。'
  },
  {
    id: 'furn-clock',
    name: '葡萄牙万国自鸣钟',
    en: 'clock',
    phonetic: '/klɑːk/',
    icon: '🕰️',
    emoji: '🕰️',
    cost: 110,
    slotType: 'room',
    desc: '每到整点发出清脆银铃声的珍罕西洋机械自鸣钟。'
  },
  {
    id: 'furn-lamp',
    name: '和纸长明行灯',
    en: 'lamp',
    phonetic: '/læmp/',
    icon: '🏮',
    emoji: '🏮',
    cost: 35,
    slotType: 'room',
    desc: '美浓纯手工和纸透出温馨暖黄烛火，夜读不伤眼。'
  },
  {
    id: 'furn-screen',
    name: '金碧松鹤屏风',
    en: 'screen',
    phonetic: '/skriːn/',
    icon: '🖼️',
    emoji: '🖼️',
    cost: 95,
    slotType: 'room',
    desc: '名画师亲笔绘制的金箔障子屏风，气宇非凡。'
  },
  {
    id: 'furn-tea',
    name: '千利休名物茶具',
    en: 'tea set',
    phonetic: '/tiː set/',
    icon: '🍵',
    emoji: '🍵',
    cost: 60,
    slotType: 'room',
    desc: '黑乐茶碗与青竹茶筅，品味战国清寂茶道。'
  },
  {
    id: 'furn-flower',
    name: '落樱四季神木盆景',
    en: 'flower',
    phonetic: '/ˈflaʊ.ər/',
    icon: '🌸',
    emoji: '🌸',
    cost: 40,
    slotType: 'garden',
    desc: '微型神木盆景，四季花开不谢，飘落粉红花瓣。'
  },
  {
    id: 'furn-telescope',
    name: '南蛮西洋远望镜',
    en: 'telescope',
    phonetic: '/ˈtel.ə.skoʊp/',
    icon: '🔭',
    emoji: '🔭',
    cost: 130,
    slotType: 'garden',
    desc: '可远眺尾张海防与夜空的纯铜望远镜。'
  },
  {
    id: 'furn-pond',
    name: '庭院白石锦鲤池',
    en: 'pond',
    phonetic: '/pɑːnd/',
    icon: '🐟',
    emoji: '🐟',
    cost: 120,
    slotType: 'garden',
    desc: '清水环绕的鹅卵石水池，两尾朱红锦鲤在池中游弋。'
  }
];

// 战国名将家臣团常驻与随行伴读体系
const SENGOKU_COMPANIONS = [
  {
    id: 'hidenaga',
    name: '木下秀长',
    nickname: '小一郎 · 胞弟',
    role: '错题军师',
    portrait: 'assets/portraits/hidenaga.jpg',
    reqMerit: 0,
    reqStage: 1,
    greeting: '兄长莫急！温故而知新，弟已将今日学识整理在册！',
    voiceEn: 'Welcome back, brother!',
    desc: '藤吉郎同母异父胞弟，沉稳贤明，统揽后勤辎重与温故知新。',
    bonusText: '随行效果：攻城合战武勋 +10%，温故出征金判 +15%'
  },
  {
    id: 'toshiie',
    name: '前田利家',
    nickname: '枪之又左 · 先锋护卫',
    role: '先锋护卫',
    portrait: 'assets/portraits/toshiie.jpg',
    reqMerit: 100,
    reqStage: 4,
    greeting: '猴子，打起精神来！我的长枪随时为你开道！今日再拔一城！',
    voiceEn: 'Charge forward! My spear is ready!',
    desc: '织田家赤母衣众笔头，英勇盖世的枪之名将，与藤吉郎情同手足。',
    bonusText: '随行效果：破除外丸与城门时伤害 +25，冲阵气魄倍增'
  },
  {
    id: 'nene',
    name: '宁宁',
    nickname: '北政所 · 贤内助',
    role: '内助贤妻',
    portrait: '👘',
    reqMerit: 300,
    reqStage: 10,
    greeting: '藤吉郎辛苦了！尝尝我新捏的热腾腾饭团吧，早些歇息莫太劳累哦~',
    voiceEn: 'Have a rice ball, Tokichiro!',
    desc: '秀吉发妻，精明宽厚，每日亲自为出征将士捏制热气腾腾的兵粮丸。',
    bonusText: '每日特权：每日在宅邸问候可领 🍙 兵粮丸 ×1；心心容错 +1'
  },
  {
    id: 'hanbei',
    name: '竹中半兵卫',
    nickname: '奇策军师 · 今孔明',
    role: '奇策军师',
    portrait: 'assets/portraits/hanbei.jpg',
    reqMerit: 700,
    reqStage: 19,
    greeting: '主公，攻心为上，熟读其音，则天下名城自破也！',
    voiceEn: 'Knowledge is power. The castle will fall!',
    desc: '战国绝顶奇策军师，十六人巧夺稻叶山城。洞察自然拼读神机！',
    bonusText: '随行效果：合战中长难词自动点拨首音节，破招洞察卷轴效果提升'
  }
];

class TokichiroEstateSystem {
  constructor() {
    this.storageKey = 'taikou_estate_data_v1';
    this.catalog = TOKICHIRO_FURNITURE_CATALOG;
    this.companions = SENGOKU_COMPANIONS;
    this.state = this.loadState();
  }

  loadState() {
    let loaded = null;
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) loaded = JSON.parse(data);
    } catch (e) {
      console.warn('Estate state load error:', e);
    }
    const defaultState = {
      unlockedFurnitureIds: ['furn-desk', 'furn-lamp', 'furn-flower'],
      placedSlots: {
        'slot-room-1': 'furn-desk',
        'slot-room-4': 'furn-lamp',
        'slot-garden-1': 'furn-flower'
      },
      activeCompanionId: 'hidenaga',
      lastNeneClaimDate: ''
    };
    if (!loaded) return defaultState;
    return {
      ...defaultState,
      ...loaded,
      unlockedFurnitureIds: loaded.unlockedFurnitureIds || defaultState.unlockedFurnitureIds,
      placedSlots: loaded.placedSlots || defaultState.placedSlots,
      activeCompanionId: loaded.activeCompanionId || 'hidenaga',
      lastNeneClaimDate: loaded.lastNeneClaimDate || ''
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Estate save error:', e);
    }
  }

  getEstateInfo() {
    const merit = window.heroManager ? window.heroManager.hero.merit : 0;
    if (merit >= 3000) {
      return { level: 4, name: '墨俣一夜城 · 雄伟小天守', icon: '🏰', bg: 'castle', desc: '傲视美浓的山城天守，森严巍峨，名扬天下。' };
    } else if (merit >= 700) {
      return { level: 3, name: '尾张清洲 · 武家气派大宅', icon: '🏯', bg: 'manor', desc: '庭院开阔的大名部将府邸，回廊通幽，气派沉稳。' };
    } else if (merit >= 100) {
      return { level: 2, name: '清洲城下 · 雅致町屋', icon: '🏡', bg: 'townhouse', desc: '城下町正街的独门町屋，前庭后院，明净整洁。' };
    } else {
      return { level: 1, name: '清洲松林 · 简朴草庵', icon: '🛖', bg: 'cottage', desc: '松林畔由竹木搭建的质朴草庐，虽简朴却足避风雨。' };
    }
  }

  isUnlocked(furnId) {
    return this.state.unlockedFurnitureIds.includes(furnId);
  }

  unlockFurniture(furnId) {
    if (!this.state.unlockedFurnitureIds.includes(furnId)) {
      this.state.unlockedFurnitureIds.push(furnId);
      this.saveState();
    }
  }

  buyFurniture(furnId) {
    const item = this.catalog.find(f => f.id === furnId);
    if (!item) return { success: false, msg: '家具不存在' };

    if (this.isUnlocked(furnId)) {
      return { success: false, msg: '您已拥有该家具图纸' };
    }

    const heroGold = window.heroManager ? window.heroManager.hero.gold : 0;
    if (heroGold < item.cost) {
      return { success: false, msg: `金判不足！需要 ${item.cost} 贯，当前持有 ${heroGold} 贯。快去城下巡游探宝吧！` };
    }

    if (window.heroManager) {
      window.heroManager.addGold(-item.cost);
    }
    this.unlockFurniture(furnId);

    // 播放地道英文朗读
    if (window.audioEngine) {
      window.audioEngine.speak(item.en);
    }

    return { success: true, msg: `成功购置【${item.name} · ${item.en}】！已收入居所行囊！` };
  }

  placeFurniture(slotId, furnId) {
    if (furnId && !this.isUnlocked(furnId)) return false;
    this.state.placedSlots[slotId] = furnId;
    this.saveState();

    if (furnId && window.audioEngine) {
      const item = this.catalog.find(f => f.id === furnId);
      if (item) window.audioEngine.speak(item.en);
    }
    return true;
  }

  removeFurniture(slotId) {
    delete this.state.placedSlots[slotId];
    this.saveState();
  }

  getPlacedItem(slotId) {
    const furnId = this.state.placedSlots[slotId];
    if (!furnId) return null;
    return this.catalog.find(f => f.id === furnId);
  }

  getRoomVisualConfig() {
    return {
      'slot-room-1': { x: 26, y: 64, name: '书房案头', placeholder: '🪵 可置【书案 desk】' },
      'slot-room-2': { x: 74, y: 68, name: '侧室软榻', placeholder: '🛏️ 可置【软榻 bed】' },
      'slot-room-3': { x: 50, y: 44, name: '堂前屏风', placeholder: '🖼️ 可置【屏风 screen】' },
      'slot-room-4': { x: 14, y: 76, name: '壁龛行灯', placeholder: '🏮 可置【行灯 lamp】' },
      'slot-garden-1': { x: 86, y: 46, name: '前庭花圃', placeholder: '🌸 可置【樱花 flower】' },
      'slot-garden-2': { x: 88, y: 80, name: '观星露台', placeholder: '🔭 可置【望远镜 telescope】' }
    };
  }

  // =========================================================================
  // 战国名将家臣团随行与交互体系
  // =========================================================================

  getCompanions() {
    const merit = window.heroManager ? (window.heroManager.hero.merit || 0) : 0;
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curStage = Math.floor(curIdx / 3) + 1;

    return this.companions.map(comp => {
      const isUnlocked = (merit >= comp.reqMerit) || (curStage >= comp.reqStage);
      const isActive = (this.state.activeCompanionId === comp.id);
      return {
        ...comp,
        isUnlocked,
        isActive
      };
    });
  }

  getActiveCompanion() {
    const all = this.getCompanions();
    return all.find(c => c.id === this.state.activeCompanionId) || all[0];
  }

  setActiveCompanion(companionId) {
    const comp = this.getCompanions().find(c => c.id === companionId);
    if (!comp || !comp.isUnlocked) return { success: false, msg: '该名将尚未出仕！' };
    this.state.activeCompanionId = companionId;
    this.saveState();
    return { success: true, msg: `已任命【${comp.name}】为随行先锋！`, companion: comp };
  }

  claimNeneDailyRiceball() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.lastNeneClaimDate === today) {
      return { success: false, alreadyClaimed: true, msg: '宁宁今日已备好爱心便当，明日再来吧！' };
    }
    this.state.lastNeneClaimDate = today;
    this.saveState();
    if (window.heroManager) {
      window.heroManager.addItem('item-riceball', 1);
    }
    return {
      success: true,
      msg: '宁宁微笑着递来一枚热腾腾的【🍙 听音兵粮丸】！可带往【宗休茶室】共品温热饭团触发专属茶会小剧情！'
    };
  }

  interactCompanion(companionId) {
    const comp = this.getCompanions().find(c => c.id === companionId);
    if (!comp) return null;

    let extraMsg = '';
    let extraAudio = comp.voiceEn;

    if (companionId === 'nene') {
      const today = new Date().toISOString().slice(0, 10);
      if (this.state.lastNeneClaimDate !== today) {
        const claimRes = this.claimNeneDailyRiceball();
        extraMsg = `\n${claimRes.msg}`;
      } else {
        extraMsg = `\n（今日已领爱心兵粮丸，明日可继续领取）`;
      }
    }

    if (window.audioEngine && extraAudio) {
      window.audioEngine.speak(extraAudio);
    }

    return {
      companion: comp,
      dialogue: comp.greeting,
      extraMsg
    };
  }
}

window.estateSystem = new TokichiroEstateSystem();
