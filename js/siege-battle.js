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

    // 自然习得三阶段动态数据 (Phase 1 听音识意 / Phase 2 拼读积木 / Phase 3 语境整句)
    this.phase1Options = [];
    this.phase2Blocks = [];
    this.phase2Bank = [];
    this.phase2Filled = [];
    this.phase3Sentence = null;
    this.phase3Options = [];
    this.phase3IsFilled = false;

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
      { id: 10, name: '美浓 · 墨俣一夜城', chapter: '奇策筑拔', lord: '斋藤防线大将 · 稻叶山先锋', desc: '木下藤吉郎名震天下的神速筑城大决战！' },
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
      { id: 48, name: '近江 · 安土山石垣天守', chapter: '近江争霸', lord: '南蛮修会护卫队', desc: '信长天下布武要冲，七层巍峨石垣天守！' },

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
    const hint = document.getElementById('mobile-orientation-hint');
    if (hint) hint.remove();
    const chaptersModal = document.getElementById('modal-chapters');
    if (chaptersModal) chaptersModal.classList.add('hidden');
    const theaterModal = document.getElementById('modal-taikou-theater');
    if (theaterModal) theaterModal.classList.add('hidden');

    // 显示攻城战役主场景
    const battleScene = document.getElementById('scene-siege-battle');
    if (battleScene) {
      battleScene.classList.remove('hidden');
      battleScene.classList.remove('stage-special-okehazama', 'stage-special-sunomata');
      if (this.isOkehazamaStage()) {
        battleScene.classList.add('stage-special-okehazama');
        if (window.audioEngine?.playThunder) window.audioEngine.playThunder();
      } else if (this.isSunomataStage()) {
        battleScene.classList.add('stage-special-sunomata');
        if (window.audioEngine?.playWoodHammer) window.audioEngine.playWoodHammer();
      }
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
   * 判断是否为第 5 关桶狭间本阵大决战
   */
  isOkehazamaStage() {
    return this.stageNum === 5 || (this.getCastleInfo(this.stageNum).name || '').includes('桶狭间');
  }

  /**
   * 判断是否为第 10 关墨俣一夜城神速筑拔大决战
   */
  isSunomataStage() {
    return this.stageNum === 10 || this.stageNum === 19 || (this.getCastleInfo(this.stageNum).name || '').includes('墨俣');
  }

  /**
   * 触发桶狭间白昼电光撕裂苍穹特效
   */
  triggerLightningEffect() {
    const scene = document.getElementById('scene-siege-battle');
    if (!scene) return;
    const flash = document.createElement('div');
    flash.className = 'lightning-flash-overlay';
    scene.appendChild(flash);
    if (window.audioEngine?.playThunder) {
      window.audioEngine.playThunder();
    }
    setTimeout(() => flash.remove(), 400);
  }

  /**
   * 触发墨俣一夜城木料马防栅拔地耸立特效
   */
  triggerPalisadeRiseEffect() {
    const scene = document.getElementById('scene-siege-battle');
    if (!scene) return;
    const banner = document.createElement('div');
    banner.className = 'palisade-rise-banner';
    banner.innerHTML = '🪵 墨俣马防栅拔地筑起！坚壁固防，轰碎敌阵！';
    scene.appendChild(banner);
    if (window.audioEngine?.playWoodHammer) {
      window.audioEngine.playWoodHammer();
    }
    setTimeout(() => banner.remove(), 1800);
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
   * 设置当前攻城阶段 (1: 军机密报排查敌谍, 2: 阵前号令大筒破门, 3: 本丸天守决战斩将)
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

    // 针对不同阶段生成自然第二语言习得教学数据
    if (phaseNum === 1) {
      this.setupPhase1Data();
    } else if (phaseNum === 2) {
      this.setupPhase2Data();
    } else if (phaseNum === 3) {
      this.setupPhase3Data();
    }

    // 动态渲染页面内容
    this.renderHUD();
    this.renderArena();
    this.renderCommandDeck();

    // 自动轻声朗读一遍真人发音或情报线索，帮助孩子形成听觉直接映射
    setTimeout(() => {
      if (this.currentPhase === 3) {
        this.speakCurrentSentence();
      } else if (this.currentPhase === 1) {
        this.speakCurrentClue();
      } else {
        this.speakTacticalOrder();
      }
    }, 450);
  }

  /**
   * 阶段一数据准备：军机密报与嫌疑人阵列 (截获信件情报 + 1 目标奸细 + 2 混淆目标)
   */
  setupPhase1Data() {
    const target = this.currentWordObj;
    this.phase1Intel = (window.PhonicsHelper && window.PhonicsHelper.getSpyIntelClue)
      ? window.PhonicsHelper.getSpyIntelClue(target)
      : { en: `The spy is holding ${target.en}!`, highlightEn: target.en, cn: `密报：细作持有【${target.cn || target.en}】暗号！`, suspectTitle: `🥷 疑犯 · 持有【${target.en}】`, suspectDesc: '神色匆匆' };

    // 桶狭间与墨俣一夜城专属历史情报线索
    if (this.isOkehazamaStage()) {
      this.phase1Intel = {
        en: `Heavy rain is falling! The spy will meet near the tent. Arrest him!`,
        highlightEn: target.en,
        cn: `密报：暴雨雷霆突降！敌营避雨混乱，细作冒雨赶往中军帐【相见接头 ${target.en}】，速擒之！`,
        suspectTitle: `🌧️ 避雨亲卫 · [${target.en}]`,
        suspectDesc: '披蓑衣冒雨疾行'
      };
    } else if (this.isSunomataStage()) {
      this.phase1Intel = {
        en: `Timber rafts are floating down the river. Catch the spy!`,
        highlightEn: target.en,
        cn: `密报：长良川预制浮木顺流而下！美浓奸细正企图在河滩【接头探查 ${target.en}】，速速擒拿！`,
        suspectTitle: `🛶 潜伏筏夫 · [${target.en}]`,
        suspectDesc: '腰藏火石窥探木排'
      };
    }

    const allWords = (window.wordManager && window.wordManager.getAllTextbookWordsFlat)
      ? window.wordManager.getAllTextbookWordsFlat()
      : [];
    
    // 优先从当前课本单元或邻近词段（±10 词范围）选取学龄相符的混淆目标
    const startIdx = Math.max(0, (this.stageNum - 1) * 3 - 5);
    const nearbyPool = allWords.slice(startIdx, startIdx + 18);
    const candidatePool = nearbyPool.length >= 5 ? nearbyPool : allWords;

    const others = candidatePool.filter(w => w.en.toLowerCase() !== target.en.toLowerCase());
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 2);

    while (distractors.length < 2) {
      const fallbackPool = [
        { en: 'cat', cn: '猫咪', emoji: '🐱', phonetic: '/kæt/' },
        { en: 'dog', cn: '小狗', emoji: '🐶', phonetic: '/dɔːɡ/' },
        { en: 'apple', cn: '苹果', emoji: '🍎', phonetic: '/ˈæpl/' }
      ].filter(f => f.en !== target.en.toLowerCase());
      distractors.push(fallbackPool[distractors.length]);
    }

    const targetOpt = {
      en: target.en,
      cn: target.cn,
      emoji: target.emoji || '🥷',
      phonetic: target.phonetic,
      suspectTitle: this.phase1Intel.suspectTitle || `🥷 嫌疑人 · [${target.en}]`,
      suspectDesc: this.phase1Intel.suspectDesc || '怀揣接头暗号纸条',
      isSpy: true
    };

    const distractorOpts = distractors.map((d, idx) => {
      const dIntel = (window.PhonicsHelper && window.PhonicsHelper.getSpyIntelClue)
        ? window.PhonicsHelper.getSpyIntelClue(d)
        : null;
      return {
        en: d.en,
        cn: d.cn,
        emoji: d.emoji || (idx === 0 ? '🥋' : '🌾'),
        phonetic: d.phonetic,
        suspectTitle: dIntel?.suspectTitle || (idx === 0 ? '🥋 巡逻卫士' : '🌾 挑担老翁'),
        suspectDesc: dIntel?.suspectDesc || `随身携带【${d.cn || d.en}】`,
        isSpy: false
      };
    });

    this.phase1Options = [targetOpt, ...distractorOpts].sort(() => 0.5 - Math.random());
  }

  /**
   * 阶段二数据准备：自然拼读乐高积木块 (目标音块 + 混淆音块)
   */
  setupPhase2Data() {
    const blocksData = window.PhonicsHelper 
      ? window.PhonicsHelper.getPhonicsBlocks(this.currentWordObj)
      : { targetBlocks: [this.cleanTarget], distractors: ['ing'] };

    this.phase2Blocks = blocksData.targetBlocks || [this.cleanTarget];
    const distractors = blocksData.distractors || ['ing'];
    this.phase2Bank = [...this.phase2Blocks, ...distractors].sort(() => 0.5 - Math.random());
    this.phase2Filled = [];
  }

  /**
   * 阶段三数据准备：人教版 2024 新课标真实课本情境整句
   */
  setupPhase3Data() {
    const sentenceData = window.PhonicsHelper 
      ? window.PhonicsHelper.getPedagogySentence(this.currentWordObj)
      : { prefix: 'This is ', blank: this.currentWordObj.en, suffix: '.', full: `This is ${this.currentWordObj.en}.`, cn: `这就是${this.currentWordObj.cn || ''}。` };

    this.phase3Sentence = sentenceData;
    this.phase3IsFilled = false;

    const allWords = (window.wordManager && window.wordManager.getAllTextbookWordsFlat)
      ? window.wordManager.getAllTextbookWordsFlat()
      : [];
    const others = allWords.filter(w => w.en.toLowerCase() !== this.currentWordObj.en.toLowerCase());
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 2);

    while (distractors.length < 2) {
      const fallbackPool = [
        { en: 'cat', cn: '猫咪', emoji: '🐱' },
        { en: 'book', cn: '书本', emoji: '📖' },
        { en: 'friend', cn: '朋友', emoji: '🧑‍🤝‍🧑' }
      ].filter(f => f.en !== this.currentWordObj.en.toLowerCase());
      distractors.push(fallbackPool[distractors.length]);
    }

    this.phase3Options = [
      { en: this.currentWordObj.en, cn: this.currentWordObj.cn, emoji: this.currentWordObj.emoji },
      ...distractors
    ].sort(() => 0.5 - Math.random());
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

    // 渲染卡牌决斗模式切换按钮
    let modeBtn = document.getElementById('btn-toggle-card-mode');
    if (!modeBtn) {
      const hudRight = document.querySelector('.siege-hud-right');
      if (hudRight) {
        modeBtn = document.createElement('button');
        modeBtn.className = 'btn btn-secondary btn-sm';
        modeBtn.id = 'btn-toggle-card-mode';
        modeBtn.onclick = () => this.toggleBattleMode();
        hudRight.insertBefore(modeBtn, hudRight.firstChild);
      }
    }
    if (modeBtn) {
      const isCard = window.cardBattle && window.cardBattle.isActive;
      modeBtn.innerHTML = isCard ? '📜 切演武' : '🎴 卡牌决斗';
      modeBtn.style.background = isCard ? 'linear-gradient(135deg, #1e40af, #1e3a8a)' : 'linear-gradient(135deg, #991b1b, #7f1d1d)';
      modeBtn.style.color = '#ffffff';
      modeBtn.style.borderColor = isCard ? '#60a5fa' : '#f87171';
    }
  }

  /**
   * 启动纯战术卡牌决斗模式 (Slay-the-Spire 风格)
   */
  startCardBattle(stageNum = this.stageNum) {
    if (window.cardBattle) {
      window.cardBattle.startBattle({
        stageNum: stageNum,
        isOkehazama: this.isOkehazamaStage(),
        isSunomata: this.isSunomataStage(),
        onVictory: () => {
          this.triggerCastleConquered();
        }
      });
    }
  }

  /**
   * 在战术卡牌决斗与密报演武之间切换
   */
  toggleBattleMode() {
    if (window.cardBattle && window.cardBattle.isActive) {
      window.cardBattle.isActive = false;
      this.setupPhase(this.currentPhase);
      if (window.ui) window.ui.showToast('📜 已切换为【密报演武】模式', 'ℹ️');
    } else {
      this.startCardBattle(this.stageNum);
      if (window.ui) window.ui.showToast('🎴 已切换为【战术卡牌决斗】模式！出牌杀敌！', '⚔️');
    }
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

    // 渲染特殊历史战役专属机关横幅标牌
    let bannerSlot = document.getElementById('siege-special-banner-slot');
    if (!bannerSlot) {
      const arena = document.getElementById('siege-arena');
      if (arena) {
        bannerSlot = document.createElement('div');
        bannerSlot.id = 'siege-special-banner-slot';
        bannerSlot.style.position = 'absolute';
        bannerSlot.style.top = '6px';
        bannerSlot.style.left = '50%';
        bannerSlot.style.transform = 'translateX(-50%)';
        bannerSlot.style.zIndex = '20';
        bannerSlot.style.width = 'calc(100% - 24px)';
        bannerSlot.style.maxWidth = '520px';
        arena.appendChild(bannerSlot);
      }
    }
    if (bannerSlot) {
      if (this.isOkehazamaStage()) {
        bannerSlot.innerHTML = `
          <div class="siege-special-banner okehazama-banner">
            <span class="special-banner-tag">⛈️ 战役专属机关</span>
            <span class="special-banner-title">【桶狭间骤雨雷霆】敌四万避雨散乱！雷暴掩护奇袭今川本阵！</span>
          </div>
        `;
      } else if (this.isSunomataStage()) {
        bannerSlot.innerHTML = `
          <div class="siege-special-banner sunomata-banner">
            <span class="special-banner-tag">🪵 战役专属机关</span>
            <span class="special-banner-title">【墨俣神速筑城】长良川浮木顺流而下！边战边筑一昼夜拔地耸立！</span>
          </div>
        `;
      } else {
        bannerSlot.innerHTML = '';
      }
    }

    if (this.currentPhase === 1) {
      if (phaseBadge) phaseBadge.textContent = '阶段一 · 外丸攻坚';
      if (phaseTitle) phaseTitle.textContent = '听音识意破除鹿砦斥候';
      if (enemyTitle) enemyTitle.textContent = '外丸游击防线';
      if (enemyName) {
        enemyName.textContent = this.isOkehazamaStage()
          ? '🌧️ 桶狭间避雨斥候'
          : (this.isSunomataStage() ? '🛶 阻木斋藤野伏' : '🥷 鹿砦守备斥候');
      }
      if (enemyImg) {
        enemyImg.src = 'assets/characters/goblin.png';
        enemyImg.alt = '鹿砦守备斥候';
      }
    } else if (this.currentPhase === 2) {
      if (phaseBadge) phaseBadge.textContent = '阶段二 · 强攻大手门';
      if (phaseTitle) phaseTitle.textContent = '拼读积木大筒轰破城门';
      if (enemyTitle) enemyTitle.textContent = '城堡核心关防';
      if (enemyName) {
        enemyName.textContent = this.isOkehazamaStage()
          ? '🏯 今川大营中军辕门'
          : (this.isSunomataStage() ? '🏯 墨俣前沿拒马铁闸' : '🏯 大手厚木城门');
      }
      if (enemyImg) {
        enemyImg.src = 'assets/environment/castle_gate.png';
        enemyImg.alt = '大手厚木城门';
      }
    } else if (this.currentPhase === 3) {
      if (phaseBadge) phaseBadge.textContent = '阶段三 · 本丸决战';
      if (phaseTitle) phaseTitle.textContent = '课本语境天守一骑讨斩将！';
      if (enemyTitle) {
        enemyTitle.textContent = this.isOkehazamaStage()
          ? '东海道第一弓取'
          : (this.isSunomataStage() ? '斋藤防线总大将' : '守城总大将');
      }
      if (enemyName) {
        enemyName.textContent = this.isOkehazamaStage()
          ? '👹 敌军总大将 · 今川义元'
          : (this.isSunomataStage() ? '👹 斋藤防线大将 · 稻叶山先锋' : `👹 ${castle.lord || '城督主将'}`);
      }
      if (enemyImg) {
        enemyImg.src = 'assets/characters/general.png';
        enemyImg.alt = castle.lord;
      }
    }
  }

  /**
   * 渲染底部军令指挥台 (根据阶段呈现不同的第二语言自然习得交互界面)
   */
  renderCommandDeck() {
    const deckEl = document.getElementById('siege-command-deck');
    if (!deckEl) return;

    if (this.currentPhase === 1) {
      this.renderPhase1Deck(deckEl);
    } else if (this.currentPhase === 2) {
      this.renderPhase2Deck(deckEl);
    } else if (this.currentPhase === 3) {
      this.renderPhase3Deck(deckEl);
    }
  }

  /**
   * 阶段一指挥台：军机密报 · 截获敌信排查潜伏奸细
   */
  renderPhase1Deck(deckEl) {
    const word = this.currentWordObj;
    const intel = this.phase1Intel || {
      en: `The spy carries a secret item: ${word.en}! Catch him!`,
      highlightEn: word.en,
      cn: `密报破译：敌方密探持有【${word.cn || word.en}】暗号！速去擒拿！`,
      suspectTitle: `🥷 疑犯 · 持有【${word.en}】`,
      suspectDesc: '怀揣接头暗号纸条'
    };

    // 高亮英文线索中的核心特征词
    const hlWord = intel.highlightEn || word.en;
    const formattedClueEn = intel.en.replace(
      new RegExp(`\\b(${hlWord})\\b`, 'gi'),
      '<strong style="color:#fde047; text-decoration:underline; text-underline-offset:2px;">$1</strong>'
    );

    deckEl.innerHTML = `
      <div class="deck-phase-wrapper deck-phase-1">
        <div class="deck-instruction-bar">
          <span class="inst-badge">军机密报 · 潜伏排查</span>
          <span class="inst-text">仔细听原声，选择对应图意破除鹿砦！</span>
          <button class="btn btn-sm btn-replay-sound" onclick="window.siegeBattle.speakCurrentClue()" title="倾听斥候原声密报">🔊 听密报</button>
        </div>

        <!-- 信长军机密报展开羊皮卷轴 -->
        <div class="siege-intel-scroll">
          <div class="intel-scroll-header">
            <div class="intel-scroll-title">
              <span class="seal-tag">信长朱印状</span>
              <span>📜 织田军机密报 · 辨识潜伏敌谍</span>
            </div>
            <button class="btn btn-sm btn-replay-sound" onclick="window.siegeBattle.speakCurrentWord()" title="单字真人发音">🔊 听暗号</button>
          </div>
          <div class="intel-scroll-body">
            <div class="intel-scroll-en">“${formattedClueEn}”</div>
            <div class="intel-scroll-cn">${intel.cn}</div>
          </div>
        </div>

        <!-- 嫌疑人排查阵容卡片 -->
        <div class="siege-concept-grid">
          ${this.phase1Options.map((opt, idx) => `
            <div class="siege-concept-card is-suspect" onclick="window.siegeBattle.selectConcept('${opt.en.replace(/'/g, "\\'")}')" title="点击指认该嫌疑人">
              <span class="suspect-order-badge">嫌疑人 0${idx + 1}</span>
              <span class="concept-crest">${opt.emoji || '🥷'}</span>
              <span class="concept-label">${opt.suspectTitle || opt.cn || opt.en}</span>
              <span class="suspect-role-tag">${opt.suspectDesc || '神色可疑'}</span>
              <span class="concept-tag">${opt.en} ${opt.phonetic ? `[${opt.phonetic}]` : ''}</span>
            </div>
          `).join('')}
        </div>

        <!-- 保持 DOM 兼容节点 (供测试与自动化查询) -->
        <span id="siege-word-cn" style="display:none;">${word.emoji || ''} ${word.cn || ''}</span>
        <span id="siege-phonics-hint" style="display:none;">${word.phonetic || ''}</span>
        <div class="siege-letter-slots" id="siege-letter-slots" style="display:none;">
          ${this.renderCompatSlots()}
        </div>
      </div>
    `;
  }

  /**
   * 阶段二指挥台：阵前战术 · 神威大筒装填破门
   */
  renderPhase2Deck(deckEl) {
    const word = this.currentWordObj;
    const blockOrderStr = this.phase2Blocks.map(b => b.toUpperCase()).join(' + ');
    deckEl.innerHTML = `
      <div class="deck-phase-wrapper deck-phase-2">
        <div class="deck-instruction-bar">
          <span class="inst-badge">阵前战术 · 破门突击</span>
          <span class="inst-text">拼装自然拼读积木，装填神威大筒轰碎城门！</span>
          <button class="btn btn-sm btn-replay-sound" onclick="window.siegeBattle.speakTacticalOrder()" title="听战阵号令">🔊 听号令</button>
        </div>

        <!-- 大手门战阵传令号角 -->
        <div class="siege-tactical-banner">
          <div class="tactical-banner-text">
            ${this.isOkehazamaStage()
              ? `<span>⛈️ 战役号令：</span><span>借雷声掩护！装填雷火药包 <strong>[ ${blockOrderStr} ]</strong> 轰碎中军辕门！</span>`
              : (this.isSunomataStage()
                ? `<span>🪵 战役号令：</span><span>长良川运木！装填大筒药包 <strong>[ ${blockOrderStr} ]</strong> 拔地筑立马防栅！</span>`
                : `<span>📢 阵前号令：</span><span>装填大筒药包 <strong>[ ${blockOrderStr} ]</strong> 轰破城门！</span>`
              )
            }
          </div>
          <button class="btn btn-sm btn-replay-sound" onclick="window.siegeBattle.speakTacticalOrder()" title="听战阵号令">🔊 听号令</button>
        </div>

        <div class="siege-cannon-assembly">
          <span class="cannon-slots-label">💣 神威大筒装填:</span>
          <div class="siege-cannon-slots">
            ${this.phase2Blocks.map((blk, idx) => {
              const isFilled = this.phase2Filled.length > idx;
              const isActive = this.phase2Filled.length === idx;
              return `
                <div class="cannon-slot ${isFilled ? 'is-filled' : ''} ${isActive ? 'is-active' : ''}">
                  ${isFilled ? this.phase2Blocks[idx].toUpperCase() : (isActive ? '▶' : '·')}
                </div>
              `;
            }).join('')}
          </div>
          <button class="btn btn-sm btn-secondary btn-reset-blocks" onclick="window.siegeBattle.resetPhase2Blocks()" title="重新装填">↺ 重拆</button>
        </div>

        <div class="siege-blocks-bank">
          ${this.phase2Bank.map(chunk => `
            <button class="siege-block-btn" onclick="window.siegeBattle.selectPhonicsChunk('${chunk.replace(/'/g, "\\'")}')">
              <span class="block-chunk">${chunk.toUpperCase()}</span>
              <span class="block-type">战术大筒令</span>
            </button>
          `).join('')}
        </div>

        <!-- 保持 DOM 兼容节点 -->
        <span id="siege-word-cn" style="display:none;">${word.emoji || ''} ${word.cn || ''}</span>
        <span id="siege-phonics-hint" style="display:none;">${word.phonetic || ''}</span>
        <div class="siege-letter-slots" id="siege-letter-slots" style="display:none;">
          ${this.renderCompatSlots()}
        </div>
      </div>
    `;
  }

  /**
   * 阶段三指挥台：本丸决战 · 战术交锋斩将落城
   */
  renderPhase3Deck(deckEl) {
    const word = this.currentWordObj;
    const sent = this.phase3Sentence || { prefix: '', blank: word.en, suffix: '', full: word.en, cn: word.cn };
    const castle = this.getCastleInfo(this.stageNum);

    deckEl.innerHTML = `
      <div class="deck-phase-wrapper deck-phase-3">
        <div class="deck-instruction-bar">
          <span class="inst-badge">本丸决战 · 斩将落城</span>
          <span class="inst-text">选出恰当词汇补全课本对话，斩将落城！</span>
          <button class="btn btn-sm btn-replay-sound" onclick="window.siegeBattle.speakCurrentSentence()">🔊 读整句</button>
        </div>

        <div class="siege-dialogue-card">
          <div class="dialogue-lead">⚔️ 天守决战对峙 · 【${castle.lord || '城督总大将'}】：</div>
          <div class="dialogue-line">
            ${sent.prefix}
            <span class="dialogue-blank ${this.phase3IsFilled ? 'is-filled' : ''}">
              ${this.phase3IsFilled ? sent.blank : '______'}
            </span>
            ${sent.suffix}
          </div>
          <div class="dialogue-cn">${sent.cn}</div>
        </div>

        <div class="siege-sentence-options">
          ${this.phase3Options.map(opt => `
            <button class="siege-opt-btn" onclick="window.siegeBattle.selectSentenceWord('${opt.en.replace(/'/g, "\\'")}')">
              <span class="opt-word">${opt.en}</span>
              <span class="opt-cn">${opt.emoji || '⚔️'} ${opt.cn || ''}</span>
            </button>
          `).join('')}
        </div>

        <!-- 保持 DOM 兼容节点 -->
        <span id="siege-word-cn" style="display:none;">${word.emoji || ''} ${word.cn || ''}</span>
        <span id="siege-phonics-hint" style="display:none;">${word.phonetic || ''}</span>
        <div class="siege-letter-slots" id="siege-letter-slots" style="display:none;">
          ${this.renderCompatSlots()}
        </div>
      </div>
    `;
  }

  /**
   * 渲染兼容字母卡槽 (用于 DOM 测试断言与物理键盘状态指示)
   */
  renderCompatSlots() {
    const clean = this.cleanTarget;
    let html = '';
    for (let i = 0; i < clean.length; i++) {
      const typed = this.currentSpelling[i];
      if (typed) {
        html += `<span class="slot-char is-filled">${typed.toUpperCase()}</span>`;
      } else if (i === this.currentSpelling.length) {
        html += `<span class="slot-char is-active">_</span>`;
      } else {
        html += `<span class="slot-char">_</span>`;
      }
    }
    return html;
  }

  /**
   * 朗读当前阶段军机密报情报
   */
  speakCurrentClue() {
    if (this.phase1Intel && this.phase1Intel.en && window.audioEngine) {
      window.audioEngine.speak(this.phase1Intel.en);
    } else {
      this.speakCurrentWord();
    }
  }

  /**
   * 朗读当前战阵战术指令口令
   */
  speakTacticalOrder() {
    if (this.phase2Blocks && window.audioEngine) {
      const order = `Load the cannon: ${this.phase2Blocks.join(', ')}!`;
      window.audioEngine.speak(order);
    } else {
      this.speakCurrentWord();
    }
  }

  /**
   * 阶段一交互：玩家排查指认敌谍嫌疑人
   */
  selectConcept(selectedEn) {
    if (!this.isActive || this.isAttacking) return;
    const clean = (selectedEn || '').toLowerCase().replace(/[^a-z]/g, '');
    if (clean === this.cleanTarget) {
      this.currentSpelling = this.cleanTarget;
      this.enemyHp = 0;
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) hpFill.style.width = '0%';

      if (window.audioEngine) {
        window.audioEngine.playKatanaSlash();
        window.audioEngine.playTaikoDrum();
      }
      this.triggerHitFX('破谍');
      if (window.ui) {
        window.ui.showToast('🎯 前田利家一枪制伏敌谍！搜获【城门布防密图】！', 1600);
      }
      this.handlePhaseSuccess();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playMistake();
      }
      if (window.ui) {
        window.ui.showToast('💡 军师点拨：仔细核对密报线索，再探一次！', 1400);
      }
      this.speakCurrentClue();
    }
  }

  /**
   * 阶段二交互：玩家点击自然拼读积木装填大筒
   */
  selectPhonicsChunk(chunk) {
    if (!this.isActive || this.isAttacking) return;
    const expected = this.phase2Blocks[this.phase2Filled.length];
    if (expected && chunk.toLowerCase() === expected.toLowerCase()) {
      this.phase2Filled.push(expected);

      if (window.audioEngine) {
        window.audioEngine.playMusketBlast();
        window.audioEngine.playKeyRune();
      }

      this.triggerHitFX(chunk.toUpperCase());

      const ratio = this.phase2Filled.length / this.phase2Blocks.length;
      this.enemyHp = Math.max(0, Math.round(100 * (1 - ratio)));
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) hpFill.style.width = `${this.enemyHp}%`;

      this.renderCommandDeck();

      if (this.phase2Filled.length === this.phase2Blocks.length) {
        this.currentSpelling = this.cleanTarget;
        this.enemyHp = 0;
        if (hpFill) hpFill.style.width = '0%';
        if (this.isOkehazamaStage()) {
          this.triggerLightningEffect();
          if (window.ui) {
            window.ui.showToast('⛈️ 雷暴贯空！神威雷火炮轰碎今川大营辕门！', 1600);
          }
        } else if (this.isSunomataStage()) {
          this.triggerPalisadeRiseEffect();
          if (window.ui) {
            window.ui.showToast('🪵 墨俣马防栅拔地耸立！神威木炮轰碎敌军夜袭！', 1600);
          }
        } else {
          if (window.ui) {
            window.ui.showToast('💥 神威大筒破空轰鸣！大手城门轰然粉碎！', 1600);
          }
        }
        this.handlePhaseSuccess();
      }
    } else {
      if (window.audioEngine) {
        window.audioEngine.playMistake();
      }
      if (window.ui) {
        window.ui.showToast('💡 拼读不匹配：请听原音再挑选积木！', 1200);
      }
      this.speakCurrentWord();
    }
  }

  /**
   * 阶段二重装积木
   */
  resetPhase2Blocks() {
    if (!this.isActive || this.isAttacking) return;
    this.phase2Filled = [];
    this.enemyHp = 100;
    const hpFill = document.getElementById('siege-enemy-hp-fill');
    if (hpFill) hpFill.style.width = '100%';
    if (window.audioEngine) {
      window.audioEngine.playTone(329.63, 'sine', 0.05, 0.08);
    }
    this.renderCommandDeck();
  }

  /**
   * 阶段三交互：玩家选择语境填空词汇
   */
  selectSentenceWord(selectedEn) {
    if (!this.isActive || this.isAttacking) return;
    const clean = (selectedEn || '').toLowerCase().replace(/[^a-z]/g, '');
    if (clean === this.cleanTarget) {
      this.phase3IsFilled = true;
      this.currentSpelling = this.cleanTarget;
      this.enemyHp = 0;
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) hpFill.style.width = '0%';

      this.renderCommandDeck();

      if (window.audioEngine) {
        window.audioEngine.playKatanaSlash();
      }
      this.triggerHitFX('斩将');
      if (window.ui) {
        window.ui.showToast('⚔️ 决战对峙大捷！敌将弃刃受缚，名城告破！', 1600);
      }

      this.speakCurrentSentence();
      this.handlePhaseSuccess();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playMistake();
      }
      if (window.ui) {
        window.ui.showToast('💡 语境不匹配：请根据对话意思选择！', 1200);
      }
    }
  }

  /**
   * 朗读当前阶段整句课本对话
   */
  speakCurrentSentence() {
    if (this.phase3Sentence && this.phase3Sentence.full && window.audioEngine) {
      window.audioEngine.speak(this.phase3Sentence.full);
    }
  }

  /**
   * 绑定物理键盘监听 (桌面端、iPad 外接键盘盲打全兼容)
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
        if (this.currentPhase === 3) {
          this.speakCurrentSentence();
        } else {
          this.speakCurrentWord();
        }
      } else if (key === 'tab') {
        e.preventDefault();
        this.useHint();
      }
    });
  }

  /**
   * 玩家敲击字母出招 (全阶段兼容打字与测试脚本)
   */
  inputLetter(char) {
    if (!this.isActive || this.isAttacking) return;
    const pressed = char.toLowerCase();
    const nextExpected = this.cleanTarget[this.currentSpelling.length];

    if (pressed === nextExpected) {
      this.currentSpelling += pressed;

      if (window.audioEngine) {
        window.audioEngine.playKeyRune();
        if (this.currentPhase === 2) {
          window.audioEngine.playMusketBlast();
        } else {
          window.audioEngine.playKatanaSlash();
        }
      }

      const progressRatio = this.currentSpelling.length / this.cleanTarget.length;
      this.enemyHp = Math.max(0, Math.round(100 * (1 - progressRatio)));
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) {
        hpFill.style.width = `${this.enemyHp}%`;
      }

      this.triggerHitFX(pressed.toUpperCase());

      // 阶段二同步积木填充
      if (this.currentPhase === 2) {
        let acc = '';
        this.phase2Filled = [];
        for (const blk of this.phase2Blocks) {
          acc += blk.toLowerCase();
          if (this.currentSpelling.startsWith(acc)) {
            this.phase2Filled.push(blk);
          }
        }
        this.renderCommandDeck();
      } else if (this.currentPhase === 3) {
        if (this.currentSpelling.length === this.cleanTarget.length) {
          this.phase3IsFilled = true;
          this.renderCommandDeck();
        }
      }

      // 整词完全拼完
      if (this.currentSpelling.length === this.cleanTarget.length) {
        this.handlePhaseSuccess();
      }
    } else {
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
    if (!this.isActive || this.isAttacking) return;
    if (this.currentPhase === 2) {
      if (this.phase2Filled.length > 0) {
        this.phase2Filled.pop();
        const ratio = this.phase2Filled.length / this.phase2Blocks.length;
        this.enemyHp = Math.max(0, Math.round(100 * (1 - ratio)));
        const hpFill = document.getElementById('siege-enemy-hp-fill');
        if (hpFill) hpFill.style.width = `${this.enemyHp}%`;
        this.renderCommandDeck();
      }
    } else if (this.currentSpelling.length > 0) {
      this.currentSpelling = this.currentSpelling.slice(0, -1);
      const progressRatio = this.currentSpelling.length / this.cleanTarget.length;
      this.enemyHp = Math.round(100 * (1 - progressRatio));
      const hpFill = document.getElementById('siege-enemy-hp-fill');
      if (hpFill) hpFill.style.width = `${this.enemyHp}%`;
    }
  }

  /**
   * 锦囊点拨 (智能第二语言助攻)
   */
  useHint() {
    if (!this.isActive || this.isAttacking) return;
    this.hadHintThisPhase = true;
    if (this.currentPhase === 1) {
      this.selectConcept(this.currentWordObj.en);
    } else if (this.currentPhase === 2) {
      const nextBlock = this.phase2Blocks[this.phase2Filled.length];
      if (nextBlock) {
        this.selectPhonicsChunk(nextBlock);
      }
    } else if (this.currentPhase === 3) {
      this.selectSentenceWord(this.currentWordObj.en);
    }
  }

  /**
   * 触发纯正真人发音
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

    // 大声朗读标准原音
    if (this.currentPhase === 3) {
      this.speakCurrentSentence();
    } else {
      this.speakCurrentWord();
    }

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
    let baseMerit = 120;
    let baseGold = 100;
    let victoryEval = `🏯 落城大捷 · 攻拔${castle.name}！织田军旗插上天守！`;

    if (this.isOkehazamaStage()) {
      baseMerit += 180;
      baseGold += 200;
      victoryEval = `⛈️ 暴雨雷霆奇袭大捷！今川义元授首！信长亲赐名物名刀【宗三左文字】！`;
      if (window.heroManager) {
        window.heroManager.addMerit(100);
      }
    } else if (this.isSunomataStage()) {
      baseMerit += 220;
      baseGold += 250;
      victoryEval = `🪵 墨俣神速筑城大捷！长良川拔地耸立一夜城，名动天下！居所解锁【墨俣小天守】！`;
      if (window.estateSystem) {
        window.estateSystem.state.unlockedFurnitureIds = window.estateSystem.state.unlockedFurnitureIds || [];
        if (!window.estateSystem.state.unlockedFurnitureIds.includes('furn-screen-gold')) {
          window.estateSystem.state.unlockedFurnitureIds.push('furn-screen-gold');
        }
        window.estateSystem.saveState();
      }
    }

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
        evaluation: victoryEval
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
