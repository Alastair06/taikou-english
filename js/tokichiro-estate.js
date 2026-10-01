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
    desc: '可远眺尾张山海与夜空璀璨星辰的纯铜望远镜。'
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

class TokichiroEstateSystem {
  constructor() {
    this.storageKey = 'taikou_estate_data_v1';
    this.catalog = TOKICHIRO_FURNITURE_CATALOG;
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Estate state load error:', e);
    }
    return {
      unlockedFurnitureIds: ['furn-desk', 'furn-lamp', 'furn-flower'],
      placedSlots: {
        'slot-room-1': 'furn-desk',
        'slot-room-4': 'furn-lamp',
        'slot-garden-1': 'furn-flower'
      }
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
      return { level: 4, name: '墨俣一夜城 · 雄伟小天守', icon: '🏰', bg: 'castle', desc: '傲视美浓的坚固山城天守，金碧辉煌，名扬天下。' };
    } else if (merit >= 700) {
      return { level: 3, name: '尾张清洲 · 武家气派大宅', icon: '🏯', bg: 'manor', desc: '庭院开阔的大名部将府邸，回廊通幽，气宇轩昂。' };
    } else if (merit >= 100) {
      return { level: 2, name: '清洲城下 · 雅致町屋', icon: '🏡', bg: 'townhouse', desc: '位于繁华城下町的独门町屋，前庭后院，温馨明亮。' };
    } else {
      return { level: 1, name: '清洲松林 · 闲适草庵', icon: '🛖', bg: 'cottage', desc: '松林畔由木竹搭建的闲适草庐，虽简朴却充满生机。' };
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
}

window.estateSystem = new TokichiroEstateSystem();
