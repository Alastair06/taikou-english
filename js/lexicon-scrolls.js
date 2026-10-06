/**
 * 太阁英语立志传 · 万国洋物大绘卷 · 词汇图鉴与令旗系统 (Lexicon Scrolls & Battle Standards)
 * - 纯正自驱动力：满足孩子的超级收集癖！将178个课标词汇重构为精致金丝绘卷
 * - 每张卡片附带战国趣味冷知识与纯正美音发音
 * - 集齐单元点亮战国「言灵令旗」，可在头顶与宅邸中威风凛凛悬挂！
 */

const SENGOKU_LEXICON_TRIVIA = {
  'meet': '战国大名会盟称为“会见”，信长与家康曾在清洲城结下著名的清洲同盟！',
  'friend': '战国乱世最重莫逆之交，前田利家与木下藤吉郎从青年时期便是无话不谈的至交！',
  'nice': '信长常对部下立功赞道“大庆也！”相当于现代英语里的“Nice and excellent”！',
  'name': '战国武士成年举行“元服礼”时会改名，藤吉郎后来得信长赐姓“羽柴”，名“秀吉”！',
  'hello': '南蛮商船初到日本界港时，葡萄牙水手用英语和葡萄牙语向尾张百姓致以热情的问候！',
  'goodbye': '出阵前的誓别称为“出阵之仪”，武士们高呼“永胜而归”，绝不轻言永别！',
  'cat': '相传战国名将岛津义弘远征时，曾根据猫咪瞳孔在阳光下的开合来判定作战时辰！',
  'dog': '尾张民间以犬为忠勇祥瑞之兆，守卫庄园夜间警戒。',
  'bird': '战国大名以鹰隼传讯狩猎，信长一生最爱放鹰游猎于尾张原野！',
  'fish': '清洲护城河与琵琶湖盛产香鱼与红锦鲤，是织田家大摆武士庆功宴的名贵肴馔！',
  'panda': '来自古老东方的珍罕瑞兽，相传自唐代便是各国遣唐使最向往的友谊神兽！',
  'tiger': '甲斐之虎武田信玄与越后之龙上杉谦信，虎象征着威严与势不可挡的军阵威名！',
  'apple': '西洋商船跨越大洋带来的苹果甘甜多汁，一颗在京都南蛮馆价值三两纯金！',
  'book': '战国乱世中，足利学校被奉为最高学府，珍藏的海外典籍是天下智将梦寐以求的圣卷！',
  'desk': '信长处理全日本军政枢密的大案名为“漆金案”，上面铺满了万国洋图与兵法抄本！',
  'ruler': '建造墨俣一夜城时，藤吉郎用精准的量尺指挥工匠预制木料，一夜之间奇迹筑成！',
  'pencil': '葡萄牙使节弗洛伊斯赠予信长的石墨软铅笔，被信长誉为“无需蘸墨之神笔”！',
  'eraser': '南蛮商人用天然橡胶特制的神奇擦拭物，能抹去铅迹，在尾张评定会上引得满座称奇！'
};

const SENGOKU_BATTLE_STANDARDS = [
  {
    unitId: 1,
    unitName: 'Unit 1: 结识新朋',
    standardName: '四海知己 · 结义令旗',
    icon: '🚩🤝',
    crest: '🤝',
    color: '#0284c7',
    desc: '参透朋友与相逢言灵，得万国商旅与名将信赖，金币收益 +15%！'
  },
  {
    unitId: 2,
    unitName: 'Unit 2: 飞禽走兽',
    standardName: '生灵庇佑 · 瑞兽令旗',
    icon: '🚩🐾',
    crest: '🐾',
    color: '#059669',
    desc: '通晓天地生灵之意，森林奇遇与小动物探索奖励 +20%！'
  },
  {
    unitId: 3,
    unitName: 'Unit 3: 游戏数字',
    standardName: '锦绣军阵 · 阵羽令旗',
    icon: '🚩🎨',
    crest: '🎨',
    color: '#d97706',
    desc: '算术如神、阵容鲜明，南蛮贸易与商馆兑换尊享 9 折优待！'
  },
  {
    unitId: 4,
    unitName: 'Unit 4: 营造百宝',
    standardName: '文韬武略 · 智囊令旗',
    icon: '🚩📜',
    crest: '📜',
    color: '#7c3aed',
    desc: '执掌文房密卷与营造量尺，一夜城天守家具放置功勋 +25%！'
  },
  {
    unitId: 5,
    unitName: 'Unit 5: 仓廪军粮',
    standardName: '兵粮丰足 · 仓廪令旗',
    icon: '🚩🌾',
    crest: '🌾',
    color: '#ea580c',
    desc: '军粮满仓、民用丰足，出勤打卡额外获赠听音兵粮丸！'
  },
  {
    unitId: 6,
    unitName: 'Unit 6: 家园与自然天地',
    standardName: '天下布武 · 风林火山令旗',
    icon: '🚩🔥',
    crest: '🔥',
    color: '#dc2626',
    desc: '其疾如风、其徐如林、侵掠如火、不动如山！至尊全能统帅令旗！'
  }
];

class LexiconScrollsSystem {
  constructor() {
    this.storageKey = 'taikou_lexicon_scrolls_v1';
    this.standards = SENGOKU_BATTLE_STANDARDS;
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Lexicon scrolls load error:', e);
    }
    return {
      masteredWords: ['meet', 'friend', 'nice', 'name', 'hello', 'goodbye'],
      unlockedStandardIds: [1],
      equippedStandardId: 1
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Lexicon save error:', e);
    }
  }

  markWordMastered(en) {
    if (!this.state.masteredWords.includes(en)) {
      this.state.masteredWords.push(en);
      this.checkStandardsUnlock();
      this.saveState();
    }
  }

  checkStandardsUnlock() {
    // 检查是否有新令旗达成
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    for (const std of this.standards) {
      if (this.state.unlockedStandardIds.includes(std.unitId)) continue;
      // 检查该单元词汇掌握度
      const unitWords = allWords.filter(w => (w.unit || '').includes(`Unit ${std.unitId}`));
      if (unitWords.length > 0) {
        const masteredCount = unitWords.filter(w => this.state.masteredWords.includes(w.en)).length;
        if (masteredCount >= Math.min(3, unitWords.length)) {
          this.state.unlockedStandardIds.push(std.unitId);
        }
      }
    }
  }

  equipStandard(unitId) {
    if (this.state.unlockedStandardIds.includes(unitId)) {
      this.state.equippedStandardId = unitId;
      this.saveState();
      return true;
    }
    return false;
  }

  getEquippedStandard() {
    return this.standards.find(s => s.unitId === this.state.equippedStandardId) || this.standards[0];
  }

  getWordTrivia(en) {
    return SENGOKU_LEXICON_TRIVIA[en] || `在战国时代，通晓【${en}】的智将能在大名外交与南蛮贸易中立下奇功！`;
  }
}

window.lexiconSystem = new LexiconScrollsSystem();
