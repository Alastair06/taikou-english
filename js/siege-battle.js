/**
 * ============================================================================
 * 太阁英语立志传 · 攻城战役核心合战引擎 (Castle Siege Warfare Engine)
 * 战国合战主线：率织田军开拔攻拔天下六十座战国名城！
 * 
 * 核心阶段推进：
 *  - 阶段一：破除外丸鹿砦 (Outer Moat & Palisade Breach) - 斩退游击斥候
 *  - 阶段二：轰破大手城门 (Castle Gate Assault) - 冲车大筒轰破厚木铁闸
 *  - 阶段三：本丸天守决战斩将 (Tenshu Keep Showdown) - 敌总大将单挑斩将落城
 *  - 胜利大捷：降敌旗升织田军旗，宣布落城，织田信长当面封赏武勋与金小判！
 * ============================================================================
 */

class SiegeBattleEngine {
  constructor() {
    this.isActive = false;
    this.stageNum = 1;
    this.stageWords = [];
    this.currentPhase = 1; // 1, 2, 3
    this.currentWordObj = null;
    this.currentSpelling = '';
    this.cleanTarget = '';
    this.isReplay = false;

    this.combo = 0;
    this.earnedGold = 0;
    this.earnedMerit = 0;
    this.isAttacking = false;
    this.hadHintThisPhase = false;

    // 敌方城防血条 (0 - 100)
    this.enemyHp = 100;
    this.enemyMaxHp = 100;

    // 战国六十名城地理图谱
    this.castleDatabase = this.initCastleDatabase();

    // 键盘监听
    this.bindKeyboard();
  }

  /**
   * 战国 60 大名城档案总览（覆盖尾张、美浓、近江、天下布武）
   */
  initCastleDatabase() {
    const list = [
      // 尾张风云 (1~18)
      { id: 1, name: '尾张 · 那古野城', chapter: '尾张风云', lord: '尾张先锋守备', desc: '织田信长诞生之名城，外围鹿砦把守森严！' },
      { id: 2, name: '尾张 · 鸣海城', chapter: '尾张风云', lord: '鸣海守将 · 山口教继', desc: '今川家扼守尾张南线的险要前哨城寨！' },
      { id: 3, name: '尾张 · 沓挂城', chapter: '尾张风云', lord: '沓挂代官 · 今川先锋', desc: '东海道商旅军道咽喉，城门厚木裹铁！' },
      { id: 4, name: '尾张 · 大高城', chapter: '尾张风云', lord: '大高守将 · 鹈殿长照', desc: '兵粮见阻的临海重镇，城外深堑鹿砦连绵！' },
      { id: 5, name: '尾张 · 桶狭间本阵', chapter: '尾张风云', lord: '敌军总大将 · 今川义元', desc: '暴雨雷霆奇袭！一举斩落敌军主将！' },
      { id: 6, name: '尾张 · 清洲城外砦', chapter: '尾张风云', lord: '清洲宿卫长', desc: '尾张守护斯波氏旧属把守的坚固偏砦！' },
      { id: 7, name: '尾张 · 岩仓城', chapter: '尾张风云', lord: '岩仓城主 · 织田信安', desc: '尾张上四郡要冲，城墙以巨石垒砌！' },
      { id: 8, name: '尾张 · 小口城', chapter: '尾张风云', lord: '小口砦主', desc: '横亘于浓尾平原之间的小型要塞！' },
      { id: 9, name: '尾张 · 犬山城', chapter: '尾张风云', lord: '犬山城主 · 织田信清', desc: '木曾川崖顶耸立之白帝天守，水陆险关！' },
      { id: 10, name: '尾张 · 小牧山城', chapter: '尾张风云', lord: '浓尾游击军统领', desc: '信长亲手筑造的平山城，石垣坚固绝伦！' },
      { id: 11, name: '尾张 · 守山城', chapter: '尾张风云', lord: '守山宿将', desc: '庄内川南岸的高地卫城，控扼尾东走廊！' },
      { id: 12, name: '尾张 · 末森城', chapter: '尾张风云', lord: '末森城主', desc: '三河与尾张交界的险隘重镇！' },
      { id: 13, name: '尾张 · 乐田城', chapter: '尾张风云', lord: '乐田砦主', desc: '前沿斥候密集结阵的平野木堡！' },
      { id: 14, name: '尾张 · 蟹江城', chapter: '尾张风云', lord: '蟹江水军众头领', desc: '河川交汇的水城，暗礁浅滩密布！' },
      { id: 15, name: '尾张 · 下之一色城', chapter: '尾张风云', lord: '一色守军', desc: '沿海泥沼防线环抱的坚韧土垒！' },
      { id: 16, name: '尾张 · 沓挂南砦', chapter: '尾张风云', lord: '南蛮客卿武士', desc: '西洋火枪队进驻的重装角楼！' },
      { id: 17, name: '尾张 · 鸣海前哨', chapter: '尾张风云', lord: '三河足轻头目', desc: '鸣海城下纵深布防的第一道连环鹿砦！' },
      { id: 18, name: '尾张 · 清洲本城天守', chapter: '尾张风云', lord: '敌城大将 · 织田信友', desc: '尾张一国统治中枢，平定全尾张的决战天守！' },

      // 美浓攻略 (19~34)
      { id: 19, name: '美浓 · 墨俣一夜城', chapter: '美浓攻略', lord: '美浓野伏队头目', desc: '木下藤吉郎名震天下的奇策筑城！' },
      { id: 20, name: '美浓 · 曾根城', chapter: '美浓攻略', lord: '曾根城主 · 稻叶一铁', desc: '西美浓三人众之首把守的坚固水城！' },
      { id: 21, name: '美浓 · 大垣城', chapter: '美浓攻略', lord: '大垣城主 · 氏家卜全', desc: '四重水堀环绕的水上巨城！' },
      { id: 22, name: '美浓 · 北方城', chapter: '美浓攻略', lord: '北方城主 · 安藤守就', desc: '控扼揖斐川的大型平城要塞！' },
      { id: 23, name: '美浓 · 十七条城', chapter: '美浓攻略', lord: '十七条守备武士', desc: '美浓南部一望无际的防线阻击砦！' },
      { id: 24, name: '美浓 · 垂井城', chapter: '美浓攻略', lord: '垂井关守', desc: '中山道宿场要隘，重兵严防死守！' },
      { id: 25, name: '美浓 · 加纳城', chapter: '美浓攻略', lord: '岐阜前锋代官', desc: '进窥稻叶山城门户的最后一座坚城！' },
      { id: 26, name: '美浓 · 鹭山城', chapter: '美浓攻略', lord: '斋藤氏分家宿将', desc: '美浓腹地易守难攻的悬崖山城！' },
      { id: 27, name: '美浓 · 菩提山城', chapter: '美浓攻略', lord: '美浓隐军大将', desc: '竹中半兵卫故里之名险，地势绝高！' },
      { id: 28, name: '美浓 · 郡上八幡城', chapter: '美浓攻略', lord: '奥美浓远藤城主', desc: '吉田川高耸石垣上的天空之城！' },
      { id: 29, name: '美浓 · 高须城', chapter: '美浓攻略', lord: '长良川水运众', desc: '长良川与揖斐川汇流处的水寨！' },
      { id: 30, name: '美浓 · 苗木城', chapter: '美浓攻略', lord: '苗木远山氏大将', desc: '巨石自然叠垒而成的天堑山城！' },
      { id: 31, name: '美浓 · 岩村城', chapter: '美浓攻略', lord: '岩村女城主守军', desc: '日本三大山城之一，云雾常年缭绕！' },
      { id: 32, name: '美浓 · 金山城', chapter: '美浓攻略', lord: '森氏宿敌先遣队', desc: '控御木曾川水运枢纽的要害石堡！' },
      { id: 33, name: '美浓 · 关城', chapter: '美浓攻略', lord: '名刀锻造师众头领', desc: '刀匠名镇，守军皆持锋锐名刃！' },
      { id: 34, name: '美浓 · 稻叶山天守', chapter: '美浓攻略', lord: '美浓总大将 · 斋藤龙兴', desc: '金华山巅巍峨巨城！天下布武 · 岐阜城！' },

      // 近江争霸 (35~48)
      { id: 35, name: '近江 · 佐和山城', chapter: '近江争霸', lord: '近江守备总督', desc: '东海道与北陆道交汇的名城！' },
      { id: 36, name: '近江 · 小谷城本丸', chapter: '近江争霸', lord: '浅井军大将 · 浅井长政', desc: '依险峻小谷山筑成的战国第一坚固山城！' },
      { id: 37, name: '近江 · 观音寺城', chapter: '近江争霸', lord: '六角氏宿将', desc: '巨石石垣层叠铺陈的六角家本城！' },
      { id: 38, name: '近江 · 八幡山城', chapter: '近江争霸', lord: '琵琶湖水运统制', desc: '俯瞰琵琶湖全景的巍峨水陆大城！' },
      { id: 39, name: '近江 · 坂本城', chapter: '近江争霸', lord: '比睿山水陆联军大将', desc: '琵琶湖畔水城，石垣直插浩瀚湖波！' },
      { id: 40, name: '近江 · 宇佐山城', chapter: '近江争霸', lord: '志贺防线督军', desc: '扼守京都东大门的险峻悬崖城寨！' },
      { id: 41, name: '近江 · 朽木谷城', chapter: '近江争霸', lord: '朽木谷领主', desc: '四面环山的隐秘幽谷要塞！' },
      { id: 42, name: '近江 · 虎御前山砦', chapter: '近江争霸', lord: '朝仓浅井联军前锋', desc: '与小谷城遥相对峙的前沿阻击堡垒！' },
      { id: 43, name: '近江 · 长滨城', chapter: '近江争霸', lord: '羽柴藤吉郎初建城', desc: '藤吉郎受封一国一城主之荣耀立志地！' },
      { id: 44, name: '近江 · 彦根外砦', chapter: '近江争霸', lord: '井伊赤备前锋', desc: '控锁琵琶湖东南平原的咽喉城寨！' },
      { id: 45, name: '近江 · 甲贺山砦', chapter: '近江争霸', lord: '甲贺五十三家影忍', desc: '深山密林机关重重的忍术暗堡！' },
      { id: 46, name: '近江 · 伊贺隐之砦', chapter: '近江争霸', lord: '伊贺上忍头领', desc: '烟雾缭绕的飞镖暗器陷阱城关！' },
      { id: 47, name: '近江 · 坚田水军砦', chapter: '近江争霸', lord: '坚田水军大统领', desc: '琵琶湖水面浮桥相连的船坞堡垒！' },
      { id: 48, name: '近江 · 安土山石垣天守', chapter: '近江争霸', lord: '南蛮修会与护卫军', desc: '信长天下布武象征，金碧辉煌的七层天守！' },

      // 天下布武 (49~60)
      { id: 49, name: '山城 · 胜龙寺城', chapter: '天下布武', lord: '山城郡代', desc: '细川藤孝筑造的双重石垣水濠城！' },
      { id: 50, name: '山城 · 二条御所', chapter: '天下布武', lord: '将军御所警护总管', desc: '拥立足利义昭入京之皇畿禁卫城！' },
      { id: 51, name: '摄津 · 界港商会要塞', chapter: '天下布武', lord: '南蛮重装火枪总督', desc: '洋枪铁炮大筒密布的自由繁华军港！' },
      { id: 52, name: '摄津 · 石山本愿寺外砦', chapter: '天下布武', lord: '一向宗杂贺铁炮头', desc: '战国坚壁十年激战的难攻落之砦！' },
      { id: 53, name: '丹波 · 龟山城', chapter: '天下布武', lord: '明智光秀领前锋', desc: '丹波平定战之关键战略基地！' },
      { id: 54, name: '越前 · 一乘谷城', chapter: '天下布武', lord: '朝仓军总大将 · 朝仓义景', desc: '北陆小京都之称的繁华山谷巨城！' },
      { id: 55, name: '播磨 · 姬路城', chapter: '天下布武', lord: '播磨先遣大将', desc: '白鹭振翅一般的宏伟白色天守！' },
      { id: 56, name: '备前 · 冈山城', chapter: '天下布武', lord: '宇喜多直家守军', desc: '黑色护壁威严矗立的乌城！' },
      { id: 57, name: '相模 · 小田原城', chapter: '天下布武', lord: '北条家总大将 · 北条氏政', desc: '总构周长九公里的战国第一巨防！' },
      { id: 58, name: '尾张 · 安土总本丸', chapter: '天下布武', lord: '天下魔王禁卫统领', desc: '雄视日本列岛的霸业中枢！' },
      { id: 59, name: '大坂 · 难攻落巨城', chapter: '天下布武', lord: '丰臣大名总宿将', desc: '深堀千丈、黄金茶室闪耀的天下第一城！' },
      { id: 60, name: '天下一统 · 伏见桃山巨城', chapter: '天下布武', lord: '天下合战终极守护', desc: '太阁立志天下泰平！万众臣服之总天守！' }
    ];
    return list;
  }

  /**
   * 启动一场指定关卡的攻城合战 (Castle Siege Campaign)
   */
  startSiege(stageNum = 1, customWords = null, isReplay = false) {
    this.isActive = true;
    this.stageNum = stageNum;
    this.isReplay = !!isReplay;
    this.currentPhase = 1;
    this.combo = 0;
    this.earnedGold = 0;
    this.earnedMerit = 0;
    this.isAttacking = false;
    this.hadHintThisPhase = false;

    // 提取本关 3 个核心词汇
    if (customWords && customWords.length >= 3) {
      this.stageWords = customWords.slice(0, 3);
    } else {
      const allWords = (window.wordManager && window.wordManager.getAllTextbookWordsFlat) 
        ? window.wordManager.getAllTextbookWordsFlat() 
        : [];
      const startIdx = (stageNum - 1) * 3;
      const sliced = allWords.slice(startIdx, startIdx + 3);
      if (sliced.length === 3) {
        this.stageWords = sliced;
      } else {
        this.stageWords = [
          { en: 'meet', cn: '相见 / 结识', emoji: '🤝', phonetic: '/miːt/' },
          { en: 'friend', cn: '朋友 / 知己', emoji: '🧑‍🤝‍🧑', phonetic: '/frend/' },
          { en: 'nice', cn: '极好的 / 惬意', emoji: '😊', phonetic: '/naɪs/' }
        ];
      }
    }

    // 隐藏其他所有全屏场景
    const home = document.getElementById('home-screen');
    if (home) home.classList.add('hidden');
    const town = document.getElementById('scene-town');
    if (town) town.classList.add('hidden');
    const overworld = document.getElementById('scene-overworld');
    if (overworld) overworld.classList.add('hidden');
    const scenic = document.getElementById('scene-scenic-world');
    if (scenic) scenic.classList.add('hidden');
    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    // 关闭可能遮挡战场的悬浮弹窗
    const tribute = document.getElementById('modal-feudal-tribute');
    if (tribute) tribute.remove();
    const chaptersModal = document.getElementById('modal-chapters');
    if (chaptersModal) chaptersModal.classList.add('hidden');
    const theaterModal = document.getElementById('modal-taikou-theater');
    if (theaterModal) theaterModal.classList.add('hidden');

    // 显示攻城战役主场景
    const battleScene = document.getElementById('scene-siege-battle');
    if (battleScene) {
      battleScene.classList.remove('hidden');
    }

    // 播放震天动地的出征阵太鼓
    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
      window.audioEngine.playTaikoDrum();
      setTimeout(() => {
        if (window.audioEngine) window.audioEngine.playTaikoDrum();
      }, 180);
    }

    // 初始化本阶段
    this.setupPhase(1);

    if (window.ui) {
      const castle = this.getCastleInfo(this.stageNum);
      window.ui.showToast(`⚔️ 攻城开拔！进军 ${castle.name}！`, '🚩');
    }
  }

  /**
   * 获取城池档案
   */
  getCastleInfo(stageNum) {
    const castle = this.castleDatabase.find(c => c.id === stageNum);
    if (castle) return castle;
    return {
      id: stageNum,
      name: `战国名城 · 第 ${stageNum} 关`,
      chapter: '战国合战',
      lord: '守城敌将',
      desc: '重兵驻守的战国名关要冲！'
    };
  }

  /**
   * 设置当前攻城阶段 (1: 鹿砦, 2: 城门, 3: 天守决战)
   */
  setupPhase(phaseNum) {
    this.currentPhase = phaseNum;
    this.currentWordObj = this.stageWords[phaseNum - 1] || this.stageWords[0];
    this.cleanTarget = (this.currentWordObj.en || '').toLowerCase().replace(/[^a-z]/g, '');
    this.currentSpelling = '';
    this.isAttacking = false;
    this.hadHintThisPhase = false;
    this.enemyMaxHp = 100;
    this.enemyHp = 100;

    // 动态渲染页面内容
    this.renderHUD();
    this.renderArena();
    this.renderCommandDeck();

    // 自动轻声朗读一遍真人发音，帮助孩子形成听觉印记
    setTimeout(() => {
      this.speakCurrentWord();
    }, 450);
  }

  /**
   * 渲染顶栏 HUD
   */
  renderHUD() {
    const castle = this.getCastleInfo(this.stageNum);
    const titleEl = document.getElementById('siege-castle-title');
    if (titleEl) titleEl.textContent = castle.name;

    const subEl = document.getElementById('siege-stage-sub');
    if (subEl) {
      subEl.textContent = `第 ${this.stageNum} 关 · ${this.isReplay ? '温故演武' : '主命攻拔'}`;
    }

    // 步进条激活状态
    for (let i = 1; i <= 3; i++) {
      const stepEl = document.getElementById(`siege-step-${i}`);
      if (!stepEl) continue;
      stepEl.classList.remove('active', 'completed');
      if (i < this.currentPhase) {
        stepEl.classList.add('completed');
      } else if (i === this.currentPhase) {
        stepEl.classList.add('active');
      }
    }

    const comboVal = document.getElementById('siege-combo-val');
    if (comboVal) comboVal.textContent = this.combo;
  }

  /**
   * 渲染合战舞台 (根据阶段切换敌方目标、守备状态、血条)
   */
  renderArena() {
    const castle = this.getCastleInfo(this.stageNum);
    const phaseBadge = document.getElementById('siege-phase-badge');
    const phaseTitle = document.getElementById('siege-phase-title');
    const enemyTitle = document.getElementById('siege-enemy-title');
    const enemyName = document.getElementById('siege-enemy-name');
    const enemyImg = document.getElementById('siege-enemy-img');
    const heroRank = document.getElementById('siege-hero-rank');
    const hpFill = document.getElementById('siege-enemy-hp-fill');

    if (heroRank && window.heroManager) {
      const r = window.heroManager.getCurrentRank();
      heroRank.textContent = `🔰 ${r ? r.title : '足轻组头'}`;
    }

    if (hpFill) {
      hpFill.style.width = '100%';
    }

    if (this.currentPhase === 1) {
      if (phaseBadge) phaseBadge.textContent = '阶段一 · 外丸攻坚';
      if (phaseTitle) phaseTitle.textContent = '破除鹿砦拒马木栅';
      if (enemyTitle) enemyTitle.textContent = '外丸游击防线';
      if (enemyName) enemyName.textContent = '🥷 鹿砦守备斥候';
      if (enemyImg) {
        enemyImg.src = 'assets/characters/goblin.png';
        enemyImg.alt = '鹿砦守备斥候';
      }
    } else if (this.currentPhase === 2) {
      if (phaseBadge) phaseBadge.textContent = '阶段二 · 强攻大手门';
      if (phaseTitle) phaseTitle.textContent = '冲车大筒轰破铁闸城门';
      if (enemyTitle) enemyTitle.textContent = '城堡核心关防';
      if (enemyName) enemyName.textContent = '🏯 大手厚木城门';
      if (enemyImg) {
        enemyImg.src = 'assets/environment/castle_gate.png';
        enemyImg.alt = '大手厚木城门';
      }
    } else if (this.currentPhase === 3) {
      if (phaseBadge) phaseBadge.textContent = '阶段三 · 本丸决战';
      if (phaseTitle) phaseTitle.textContent = '天守阁下一骑讨斩将！';
      if (enemyTitle) enemyTitle.textContent = '守城总大将';
      if (enemyName) enemyName.textContent = `👹 ${castle.lord || '城督主将'}`;
      if (enemyImg) {
        enemyImg.src = 'assets/characters/general.png';
        enemyImg.alt = castle.lord;
      }
    }
  }

  /**
   * 渲染底部军令指挥台与字母槽位、触屏出招按键
   */
  renderCommandDeck() {
    const word = this.currentWordObj;
    const wordCn = document.getElementById('siege-word-cn');
    if (wordCn) {
      wordCn.textContent = `${word.emoji || '📖'} ${word.cn || ''}`;
    }

    const hint = document.getElementById('siege-phonics-hint');
    if (hint) {
      const phaseNames = ['', '破除拒马', '轰碎城门', '天守斩将'];
      hint.textContent = `${word.phonetic || ''} · 拼写言灵出招【${phaseNames[this.currentPhase]}】！`;
    }

    // 渲染字母卡槽
    this.updateSpellingSlots();

    // 渲染移动端触控键盘
    this.renderKeypad();
  }

  /**
   * 动态刷新字母卡槽状态
   */
  updateSpellingSlots() {
    const slotsWrap = document.getElementById('siege-letter-slots');
    if (!slotsWrap) return;

    const clean = this.cleanTarget;
    let html = '';
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const typed = this.currentSpelling[i];
      if (typed) {
        html += `<span class="slot-char is-filled anim-pop">${typed.toUpperCase()}</span>`;
      } else if (i === this.currentSpelling.length) {
        html += `<span class="slot-char is-active">_</span>`;
      } else {
        html += `<span class="slot-char">_</span>`;
      }
    }
    slotsWrap.innerHTML = html;
  }

  /**
   * 渲染触控按键候选行（大按键，触屏单指轻松敲击，彻底杜绝翻页和误触）
   */
  renderKeypad() {
    const container = document.getElementById('siege-keypad-candidates');
    if (!container) return;

    const nextChar = this.cleanTarget[this.currentSpelling.length] || '';
    
    // 构造高频常用候选键集合（包含目标词所有字母 + 适量混淆字母，保证整洁直观）
    const targetSet = new Set(this.cleanTarget.split(''));
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const extraDistractors = alphabet.filter(c => !targetSet.has(c)).sort(() => 0.5 - Math.random()).slice(0, 4);
    
    const candidateChars = Array.from(new Set([...targetSet, ...extraDistractors])).sort();

    let html = '';
    candidateChars.forEach(char => {
      const isNext = (char === nextChar);
      html += `
        <button class="siege-key-btn ${isNext ? 'is-recommended' : ''}" 
          data-char="${char}" 
          onclick="window.siegeBattle.inputLetter('${char}')">
          ${char.toUpperCase()}
        </button>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * 绑定物理键盘监听 (桌面端、iPad 外接键盘畅快盲打)
   */
  bindKeyboard() {
    if (this._hasBoundKeys) return;
    this._hasBoundKeys = true;

    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        this.inputLetter(key);
      } else if (key === 'backspace') {
        this.backspace();
      } else if (key === ' ' || key === 'enter') {
        this.speakCurrentWord();
      } else if (key === 'tab') {
        e.preventDefault();
        this.useHint();
      }
    });
  }

  /**
   * 玩家敲击字母出招
   */
  inputLetter(char) {
    if (!this.isActive || this.isAttacking) return;
    const pressed = char.toLowerCase();
    const nextExpected = this.cleanTarget[this.currentSpelling.length];

    if (pressed === nextExpected) {
      // 敲击正确！
      this.currentSpelling += pressed;

      // 音效：太刀斩击 / 铁炮射击
      if (window.audioEngine) {
        window.audioEngine.playKeyRune();
        if (this.currentPhase === 2) {
          window.audioEngine.playMusketBlast();
        } else {
          window.audioEngine.playKatanaSlash();
        }
      }

      // 扣减敌方城防血条
      const progressRatio = this.currentSpelling.length / this.cleanTarget.length;
      this.enemyHp = Math.max(0, Math.round(100 * (1 - progressRatio)));
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) {
        hpFill.style.width = `${this.enemyHp}%`;
      }

      // 触发打击特效与浮动数字
      this.triggerHitFX(pressed.toUpperCase());

      // 刷新槽位与键盘按键推荐
      this.updateSpellingSlots();
      this.renderKeypad();

      // 整词完全拼完！
      if (this.currentSpelling.length === this.cleanTarget.length) {
        this.handlePhaseSuccess();
      }
    } else {
      // 输错一个字母：温和点拨
      if (window.audioEngine) {
        window.audioEngine.playMistake();
      }
      this.triggerMistakeShake();
    }
  }

  /**
   * 退格删除
   */
  backspace() {
    if (!this.isActive || this.isAttacking || this.currentSpelling.length === 0) return;
    this.currentSpelling = this.currentSpelling.slice(0, -1);
    
    // 恢复对应血条
    const progressRatio = this.currentSpelling.length / this.cleanTarget.length;
    this.enemyHp = Math.round(100 * (1 - progressRatio));
    const hpFill = document.getElementById('siege-enemy-hp-fill');
    if (hpFill) {
      hpFill.style.width = `${this.enemyHp}%`;
    }

    if (window.audioEngine) {
      window.audioEngine.playTone(329.63, 'sine', 0.05, 0.08);
    }
    this.updateSpellingSlots();
    this.renderKeypad();
  }

  /**
   * 锦囊点拨 (提示并填入下一个正确字母)
   */
  useHint() {
    if (!this.isActive || this.isAttacking) return;
    if (this.currentSpelling.length < this.cleanTarget.length) {
      this.hadHintThisPhase = true;
      const nextChar = this.cleanTarget[this.currentSpelling.length];
      this.inputLetter(nextChar);
      this.speakCurrentWord();
    }
  }

  /**
   * 触发纯正美音标准读音
   */
  speakCurrentWord() {
    if (this.currentWordObj && window.audioEngine) {
      window.audioEngine.speak(this.currentWordObj.en);
    }
  }

  /**
   * 攻击命中与受击颤抖特效
   */
  triggerHitFX(charText) {
    // 藤吉郎挥刀
    const heroAvatar = document.getElementById('siege-hero-avatar');
    if (heroAvatar) {
      heroAvatar.classList.remove('anim-slash');
      void heroAvatar.offsetWidth;
      heroAvatar.classList.add('anim-slash');
    }

    // 刀光弧线
    const slashEl = document.getElementById('siege-attack-slash');
    if (slashEl) {
      slashEl.classList.remove('hidden');
      setTimeout(() => slashEl.classList.add('hidden'), 220);
    }

    // 敌方受击震动与红光闪烁
    const enemyAvatar = document.getElementById('siege-enemy-avatar');
    const enemyFlash = document.getElementById('siege-enemy-flash');
    if (enemyAvatar) {
      enemyAvatar.classList.remove('anim-hit-shake');
      void enemyAvatar.offsetWidth;
      enemyAvatar.classList.add('anim-hit-shake');
    }
    if (enemyFlash) {
      enemyFlash.classList.remove('hidden');
      setTimeout(() => enemyFlash.classList.add('hidden'), 180);
    }

    // VS 区域浮动文字
    const vfxEl = document.getElementById('siege-impact-vfx');
    if (vfxEl) {
      vfxEl.textContent = `💥 [${charText}] 命中城防！`;
      vfxEl.classList.remove('hidden');
      vfxEl.classList.add('anim-float-up');
      setTimeout(() => {
        vfxEl.classList.add('hidden');
        vfxEl.classList.remove('anim-float-up');
      }, 500);
    }
  }

  /**
   * 拼错晃动提示
   */
  triggerMistakeShake() {
    const slotsWrap = document.getElementById('siege-letter-slots');
    if (slotsWrap) {
      slotsWrap.classList.remove('anim-shake');
      void slotsWrap.offsetWidth;
      slotsWrap.classList.add('anim-shake');
    }
    if (window.ui) {
      const nextChar = this.cleanTarget[this.currentSpelling.length];
      window.ui.showToast(`💡 点拨：按 [${nextChar.toUpperCase()}] 试一试！`, 1200);
    }
  }

  /**
   * 完成当前阶段 (Phase Success)
   */
  handlePhaseSuccess() {
    this.isAttacking = true;
    this.combo += 1;
    this.earnedGold += 15;
    this.earnedMerit += 15;

    // 记录熟练度
    if (window.progressManager) {
      window.progressManager.recordWordResult(this.currentWordObj.en, true, this.hadHintThisPhase);
    }

    // 大声复读一遍单词
    this.speakCurrentWord();

    // 阶段击破战报与特效
    const castle = this.getCastleInfo(this.stageNum);
    const phaseMsgs = [
      '',
      '💥 外丸突破！拒马鹿砦尽碎！全军突进大手门！',
      '🔥 大手门轰破！厚木铁闸崩裂！直捣本丸天守！',
      `⚔️ 天守决战斩将！敌大将【${castle.lord}】授首！落城大捷！`
    ];

    if (window.audioEngine) {
      window.audioEngine.playTaikoDrum();
      window.audioEngine.playCoin();
    }

    if (window.ui) {
      window.ui.showToast(phaseMsgs[this.currentPhase] || '合战突破！', '🚩');
    }

    // 动画延迟后推进至下一阶段或落城胜利
    setTimeout(() => {
      if (this.currentPhase < 3) {
        this.setupPhase(this.currentPhase + 1);
      } else {
        this.triggerCastleConquered();
      }
    }, 1200);
  }

  /**
   * 落城胜利大捷 (Castle Conquered Victory)
   */
  triggerCastleConquered() {
    this.isActive = false;
    const castle = this.getCastleInfo(this.stageNum);

    // 战胜大捷犒赏：金币与武勋
    const baseMerit = 120;
    const baseGold = 100;
    this.earnedMerit += baseMerit;
    this.earnedGold += baseGold;

    // 播放落城胜仗礼炮与大法螺
    if (window.audioEngine) {
      window.audioEngine.playPromotionFanfare();
      window.audioEngine.playTaikoDrum();
    }

    // 隐藏战斗视口
    const battleScene = document.getElementById('scene-siege-battle');
    if (battleScene) {
      battleScene.classList.add('hidden');
    }

    // 触发感状胜利大弹窗
    if (window.ui) {
      window.ui.showVictoryModal({
        mode: 'campaign',
        isReplay: this.isReplay,
        stageNum: this.stageNum,
        castleName: castle.name,
        words: this.stageWords,
        maxCombo: this.combo,
        totalGold: this.earnedGold,
        totalMerit: this.earnedMerit,
        streakDays: (window.progressManager ? window.progressManager.getStreakDays() : 1) + (this.isReplay ? 0 : 1),
        evaluation: `🏯 落城大捷 · 攻拔${castle.name}！织田军旗插上天守！`
      });
    }
  }

  /**
   * 撤退回大本营
   */
  retreat() {
    this.isActive = false;
    const battleScene = document.getElementById('scene-siege-battle');
    if (battleScene) {
      battleScene.classList.add('hidden');
    }
    if (window.ui) {
      window.ui.showHomeScreen();
      window.ui.showToast('🛡️ 鸣金收兵，返回织田本阵！', '🏠');
    }
  }
}

// 挂载至全局 Window
window.siegeBattle = new SiegeBattleEngine();
