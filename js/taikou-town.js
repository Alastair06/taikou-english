/**
 * 太阁英语立志传 · 城下町小世界探索控制器 (Taikou Town Controller)
 * 经典复刻光荣《太阁立志传5》城下町与场所设施系统：
 * - 漫步在城下町大街上，走近各大特色建筑
 * - 🍵 宗休茶室：千利休茶道中英翻牌消消乐
 * - 🌿 南蛮药庐：曲直濑道三听音接药草炼制兵粮丸
 * - 🚢 南蛮商馆：今井宗久辨词砍价购置名刀洋枪
 * - 🏯 清洲天守：织田信长今日主命与功勋评定
 * - ⚔️ 演武道场：武道切磋与弓道研习
 * - 🚪 大手门：出城前往日本大世界或出征战役地牢
 */

const SENGOKU_TOWN_PROFILES = {
  kiyosu: {
    id: 'kiyosu',
    name: '尾张 · 清洲城下町',
    banner: '🏯 织田信长本据 · 启航之城',
    buildings: [
      { id: 'keep', name: '清洲天守阁', sub: '信长主命评定', icon: '🏯', x: 500, y: 150, radius: 70, prompt: '🏯 清洲天守 · 织田信长大名评定会', cssClass: 'b-keep' },
      { id: 'tea', name: '宗休茶室', sub: '翻牌消消乐·回血', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 宗休茶室 · 茶道翻牌消消乐', cssClass: 'b-tea' },
      { id: 'med', name: '南蛮药庐', sub: '听音接药·炼兵粮丸', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 南蛮药庐 · 听音接药炼兵粮丸', cssClass: 'b-med' },
      { id: 'residence', name: '武家大宅', sub: '秀长(错题)/利家', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 武家大宅 · 拜访秀长(错题军师)与利家', cssClass: 'b-residence' },
      { id: 'dojo', name: '尾张演武道场', sub: '弓道音节狙击', icon: '⚔️', x: 180, y: 440, radius: 70, prompt: '⚔️ 演武道场 · 弓道音节狙击修行', cssClass: 'b-dojo' },
      { id: 'shop', name: '南蛮商馆', sub: '陶器特产·辨词砍价', icon: '🚢', x: 820, y: 440, radius: 70, prompt: '🚢 南蛮商馆 · 辨词砍价与特产跑商', cssClass: 'b-shop' },
      { id: 'gate', name: '出阵大手门', sub: '大地图 / 战役', icon: '🚪', x: 500, y: 550, radius: 70, prompt: '🚪 出阵大手门 · 出城行军/出征', cssClass: 'b-gate' }
    ]
  },
  sakai: {
    id: 'sakai',
    name: '摄津 · 界港南蛮町',
    banner: '🚢 南蛮贸易之都 · 茶道圣地',
    buildings: [
      { id: 'shop', name: '界港洋商总会', sub: '火枪名物·外洋商贸', icon: '🚢', x: 500, y: 150, radius: 70, prompt: '🚢 界港洋商总会 · 南蛮火枪与特产跑商', cssClass: 'b-keep' },
      { id: 'tea', name: '利休茶道本庵', sub: '茶道宗匠·静心消消乐', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 利休茶道本庵 · 茶圣亲授翻牌修身', cssClass: 'b-tea' },
      { id: 'med', name: '南蛮本草医馆', sub: '名医曲直濑道三', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 南蛮本草医馆 · 炼制高阶兵粮神药', cssClass: 'b-med' },
      { id: 'residence', name: '豪商宗久公馆', sub: '今井宗久(天下商脉)', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 豪商公馆 · 拜访界港豪商今井宗久', cssClass: 'b-residence' },
      { id: 'dojo', name: '南蛮火铳靶场', sub: '铁炮狙击破招', icon: '💥', x: 180, y: 440, radius: 70, prompt: '💥 南蛮靶场 · 铁炮音节狙击', cssClass: 'b-dojo' },
      { id: 'keep', name: '会合众评定厅', sub: '界港商事主命', icon: '🏛️', x: 820, y: 440, radius: 70, prompt: '🏛️ 界港会合众 · 商贸内政主命评定', cssClass: 'b-shop' },
      { id: 'gate', name: '出海码头栈桥', sub: '扬帆出海 / 大地图', icon: '⚓', x: 500, y: 550, radius: 70, prompt: '⚓ 出海码头 · 扬帆出港/周游东海道', cssClass: 'b-gate' }
    ]
  },
  kyoto: {
    id: 'kyoto',
    name: '山城 · 京都皇城町',
    banner: '🌸 天下之枢 · 语言文化之都',
    buildings: [
      { id: 'temple', name: '大德寺经卷院', sub: '经卷拼装·句型修行', icon: '⛩️', x: 500, y: 150, radius: 70, prompt: '⛩️ 大德寺经卷院 · 禅宗英语经卷拼组', cssClass: 'b-keep' },
      { id: 'tea', name: '宇治名胜茶亭', sub: '绿茶品茗·静心', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 宇治茶亭 · 翻牌消消乐', cssClass: 'b-tea' },
      { id: 'med', name: '御医典药局', sub: '太医秘方灵丹', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 御医典药局 · 听音接药炼兵粮丸', cssClass: 'b-med' },
      { id: 'residence', name: '公卿大宅', sub: '京都名将名士', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 公卿大宅 · 拜访京都名仕与军师', cssClass: 'b-residence' },
      { id: 'dojo', name: '清水寺演武台', sub: '音节箭道研习', icon: '⚔️', x: 180, y: 440, radius: 70, prompt: '⚔️ 清水寺擂台 · 弓道音节研习', cssClass: 'b-dojo' },
      { id: 'shop', name: '西阵织锦肆', sub: '名贵丝绸特产', icon: '👘', x: 820, y: 440, radius: 70, prompt: '👘 西阵织锦肆 · 西阵织特产砍价买卖', cssClass: 'b-shop' },
      { id: 'gate', name: '罗生门大手道', sub: '上洛官道 / 大地图', icon: '🚪', x: 500, y: 550, radius: 70, prompt: '🚪 罗生门大手道 · 出京行军', cssClass: 'b-gate' }
    ]
  },
  inabayama: {
    id: 'inabayama',
    name: '美浓 · 稻叶山城下町',
    banner: '⛰️ 斋藤要塞 · 天下布武前线',
    buildings: [
      { id: 'keep', name: '稻叶山天守阁', sub: '美浓战备主命', icon: '⛰️', x: 500, y: 150, radius: 70, prompt: '⛰️ 稻叶山天守 · 军机战备主命评定', cssClass: 'b-keep' },
      { id: 'tea', name: '清溪野茶庵', sub: '山间静心回血', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 清溪野茶庵 · 翻牌消消乐', cssClass: 'b-tea' },
      { id: 'med', name: '山砦草药庐', sub: '野山草药炼丹', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 山砦草药庐 · 炼制兵粮丸', cssClass: 'b-med' },
      { id: 'residence', name: '美浓兵法馆', sub: '竹中半兵卫(智将)', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 美浓兵法馆 · 拜访半兵卫与秀长', cssClass: 'b-residence' },
      { id: 'dojo', name: '美浓一刀流道场', sub: '快剑音节狙击', icon: '⚔️', x: 180, y: 440, radius: 70, prompt: '⚔️ 美浓道场 · 自然拼读斩击修行', cssClass: 'b-dojo' },
      { id: 'shop', name: '关市名刀坊', sub: '特产打刃物', icon: '🗡️', x: 820, y: 440, radius: 70, prompt: '🗡️ 关市名刀坊 · 关市打刃物特产跑商', cssClass: 'b-shop' },
      { id: 'gate', name: '墨俣关隘门', sub: '进军东山道', icon: '🚪', x: 500, y: 550, radius: 70, prompt: '🚪 墨俣关隘门 · 奔赴战役大地图', cssClass: 'b-gate' }
    ]
  },
  azuchi: {
    id: 'azuchi',
    name: '近江 · 安土霸业城',
    banner: '🏰 琵琶湖畔霸主天守 · 黄金七重',
    buildings: [
      { id: 'keep', name: '安土金碧天守', sub: '天下霸者最高评定', icon: '🏰', x: 500, y: 150, radius: 70, prompt: '🏰 安土七重天守 · 天下布武最高主命评定', cssClass: 'b-keep' },
      { id: 'tea', name: '黄金品茗茶室', sub: '至尊静心禅境', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 黄金茶室 · 至尊静心翻牌', cssClass: 'b-tea' },
      { id: 'med', name: '近江本草署', sub: '九转回春金丹', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 近江本草署 · 炼制特级兵粮丸', cssClass: 'b-med' },
      { id: 'residence', name: '霸府家臣殿', sub: '天下名将列席', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 霸府家臣殿 · 群英会晤', cssClass: 'b-residence' },
      { id: 'dojo', name: '天下第一武道场', sub: '全规则极意修行', icon: '⚔️', x: 180, y: 440, radius: 70, prompt: '⚔️ 天下第一道场 · 终极音节修行', cssClass: 'b-dojo' },
      { id: 'shop', name: '近江琵琶商会', sub: '琵琶湖真珠特产', icon: '🦪', x: 820, y: 440, radius: 70, prompt: '🦪 琵琶商会 · 琵琶湖真珠跑商买卖', cssClass: 'b-shop' },
      { id: 'gate', name: '霸王朱雀门', sub: '周游天下大地图', icon: '🚪', x: 500, y: 550, radius: 70, prompt: '🚪 霸王朱雀门 · 出征东海道', cssClass: 'b-gate' }
    ]
  },
  okazaki: {
    id: 'okazaki',
    name: '三河 · 冈崎城下町',
    banner: '🛡️ 德川家康本据 · 坚毅盟友',
    buildings: [
      { id: 'keep', name: '冈崎本丸天守', sub: '同盟大名主命', icon: '🛡️', x: 500, y: 150, radius: 70, prompt: '🛡️ 冈崎本丸 · 德川家康同盟评定', cssClass: 'b-keep' },
      { id: 'tea', name: '松平草堂茶室', sub: '隐忍修身回血', icon: '🍵', x: 200, y: 240, radius: 70, prompt: '🍵 松平茶室 · 静心消消乐', cssClass: 'b-tea' },
      { id: 'med', name: '三河药草铺', sub: '行军兵粮调配', icon: '🌿', x: 800, y: 240, radius: 70, prompt: '🌿 三河药草铺 · 炼制兵粮丸', cssClass: 'b-med' },
      { id: 'residence', name: '三河武士馆', sub: '本多忠胜(猛将)', icon: '📜', x: 500, y: 330, radius: 65, prompt: '📜 三河武士馆 · 结交名将', cssClass: 'b-residence' },
      { id: 'dojo', name: '三河弓道修习场', sub: '弓道音节研习', icon: '🏹', x: 180, y: 440, radius: 70, prompt: '🏹 三河弓道场 · 音节精准射击', cssClass: 'b-dojo' },
      { id: 'shop', name: '八丁味噌老铺', sub: '三河军食商贸', icon: '🏺', x: 820, y: 440, radius: 70, prompt: '🏺 八丁味噌老铺 · 辨词采购', cssClass: 'b-shop' },
      { id: 'gate', name: '三河大手关门', sub: '通往尾张/骏河', icon: '🚪', x: 500, y: 550, radius: 70, prompt: '🚪 冈崎大手门 · 出征大地图', cssClass: 'b-gate' }
    ]
  }
};

class TaikouTownManager {
  constructor() {
    this.currentTown = 'kiyosu';
    this.isActive = false;

    this.player = {
      x: 500,
      y: 420,
      speed: 4.5,
      facing: 'down',
      isMoving: false,
      stepTick: 0
    };

    this.keys = { w: false, s: false, a: false, d: false };
    this.buildings = SENGOKU_TOWN_PROFILES.kiyosu.buildings;
    this.activeBuildingNearby = null;
    this.animFrameId = null;
  }

  init() {
    this.bindKeyboard();
    this.bindTouchControls();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;

      if ((k === ' ' || k === 'enter') && this.activeBuildingNearby) {
        e.preventDefault();
        this.interactWithBuilding(this.activeBuildingNearby.id);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isActive) return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = false;
      if (k === 's' || k === 'arrowdown') this.keys.s = false;
      if (k === 'a' || k === 'arrowleft') this.keys.a = false;
      if (k === 'd' || k === 'arrowright') this.keys.d = false;
    });
  }

  bindTouchControls() {
    // 触屏方向键由全局或城镇视口共享
  }

  enterTown(townId = 'kiyosu') {
    this.currentTown = townId;
    this.isActive = true;

    // 隐藏其他场景
    const homeEl = document.getElementById('home-screen');
    if (homeEl) homeEl.classList.add('hidden');
    const owEl = document.getElementById('scene-overworld');
    if (owEl) owEl.classList.add('hidden');
    const vpEl = document.getElementById('game-viewport');
    if (vpEl) vpEl.classList.add('hidden');

    const townEl = document.getElementById('scene-town');
    if (townEl) townEl.classList.remove('hidden');

    // 重置坐标
    this.player.x = 500;
    this.player.y = 380;
    this.keys = { w: false, s: false, a: false, d: false };

    // 获取当前城镇配置
    const profile = SENGOKU_TOWN_PROFILES[townId] || SENGOKU_TOWN_PROFILES.kiyosu;
    this.buildings = profile.buildings;

    // 刷新町标题
    const townNameEl = document.getElementById('town-title-text');
    if (townNameEl) {
      townNameEl.textContent = profile.name;
    }

    // 动态重构城镇建筑地标节点
    this.renderTownBuildings(profile);

    this.updateHUD();
    this.renderPlayerPosition();
    this.startLoop();
  }

  renderTownBuildings(profile) {
    const stage = document.querySelector('.town-stage-wrap');
    if (!stage) return;

    const heroEl = document.getElementById('town-hero-figure');
    const oldNodes = stage.querySelectorAll('.town-building-node');
    oldNodes.forEach(n => n.remove());

    profile.buildings.forEach(b => {
      const node = document.createElement('div');
      node.className = `town-building-node ${b.cssClass}`;
      node.onclick = () => window.taikouTown.interactWithBuilding(b.id);
      node.innerHTML = `
        <div class="b-icon">${b.icon}</div>
        <div class="b-label">${b.name}</div>
        <div class="b-sub">${b.sub}</div>
      `;
      stage.insertBefore(node, heroEl);
    });
  }

  startLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = () => {
      if (this.isActive) {
        this.updatePlayerMovement();
        this.checkBuildingProximity();
        this.renderPlayerPosition();
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  updatePlayerMovement() {
    let dx = 0;
    let dy = 0;

    if (this.keys.w) dy -= 1;
    if (this.keys.s) dy += 1;
    if (this.keys.a) dx -= 1;
    if (this.keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx = (dx / len) * this.player.speed;
      dy = (dy / len) * this.player.speed;

      this.player.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      this.player.x = Math.max(90, Math.min(910, this.player.x + dx));
      this.player.y = Math.max(130, Math.min(540, this.player.y + dy));
      this.player.isMoving = true;
      this.player.stepTick++;
    } else {
      this.player.isMoving = false;
    }
  }

  checkBuildingProximity() {
    let nearby = null;
    for (const b of this.buildings) {
      const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
      if (dist < b.radius) {
        nearby = b;
        break;
      }
    }

    this.activeBuildingNearby = nearby;
    const promptEl = document.getElementById('town-action-prompt');
    if (promptEl) {
      if (nearby) {
        promptEl.innerHTML = `<strong>${nearby.prompt}</strong> ` +
          `<button class="btn btn-primary btn-sm" onclick="window.taikouTown.interactWithBuilding('${nearby.id}')">进入场所 (空格)</button>`;
        promptEl.classList.remove('hidden');
      } else {
        promptEl.innerHTML = `<span>🏮 漫步清洲城下町，走近建筑即可入内修行互动</span>`;
      }
    }
  }

  renderPlayerPosition() {
    const heroEl = document.getElementById('town-hero-figure');
    if (!heroEl) return;

    heroEl.style.left = this.player.x + 'px';
    heroEl.style.top = this.player.y + 'px';

    const innerSprite = heroEl.querySelector('.hero-sprite-inner');
    if (innerSprite) {
      innerSprite.style.transform = (this.player.facing === 'left') ? 'scaleX(-1)' : 'scaleX(1)';
      if (this.player.isMoving) innerSprite.classList.add('is-walking');
      else innerSprite.classList.remove('is-walking');
    }
  }

  interactWithBuilding(buildingId) {
    window.audioEngine.unlockAudio();
    window.audioEngine.playTaikoDrum();

    if (buildingId === 'temple') {
      // 京都大德寺 · 经卷拼装修行
      if (window.templeMinigame) window.templeMinigame.open();
    } else if (buildingId === 'tea') {
      // 1. 茶室 · 茶道翻牌消消乐
      if (window.teaMinigame) window.teaMinigame.open();
    } else if (buildingId === 'med') {
      // 2. 药庐 · 听音接药炼兵粮丸
      if (window.medicineMinigame) window.medicineMinigame.open();
    } else if (buildingId === 'residence') {
      // 3. 武家大宅 · 拜访名将
      const defaultOfficer = this.currentTown === 'inabayama' ? 'hanbei' : (this.currentTown === 'sakai' ? 'sokyu' : 'hidenaga');
      if (window.officerSystem) window.officerSystem.openResidenceModal(defaultOfficer);
    } else if (buildingId === 'shop') {
      // 4. 商馆 · 辨词砍价与特产跑商
      if (window.nanbanTrade) {
        window.nanbanTrade.openTradeModal(this.currentTown || 'kiyosu');
      } else if (window.ui) {
        window.ui.openShopModal();
      }
    } else if (buildingId === 'keep') {
      // 5. 天守阁 · 大名主命评定会
      this.openKeepModal();
    } else if (buildingId === 'dojo') {
      // 6. 演武道场 · 弓道音节狙击
      if (window.dojoMinigame) {
        window.dojoMinigame.open();
      } else if (window.ui) {
        window.ui.openChapterSelect();
      }
    } else if (buildingId === 'gate') {
      // 7. 出阵大手门
      this.openGateModal();
    }
  }

  openKeepModal() {
    if (window.questSystem) {
      window.questSystem.openHyojoModal();
      return;
    }
    const quest = window.progressManager ? window.progressManager.getTodayQuest() : { newWords: [] };
    const wordsHtml = quest.newWords.map(w =>
      `<div class="keep-word-chip" onclick="window.audioEngine.speak('${w.en}')">` +
        `<span>${w.emoji}</span> <strong>${w.en}</strong> <span>${w.cn}</span> 🔊` +
      `</div>`
    ).join('');

    const modal = document.getElementById('modal-keep-dialog');
    if (modal) {
      const content = document.getElementById('keep-dialog-body');
        content.innerHTML = `
          <div class="koei-dialogue-box">
            <div class="koei-portrait-wrap">
              <img src="assets/portraits/nobunaga.jpg" class="koei-portrait-img" alt="织田信长">
              <div class="koei-portrait-name">织田信长</div>
            </div>
            <div class="koei-speech-wrap">
              <div class="koei-speaker-title">织田弹正忠信长 · 清洲城主阁</div>
              <div class="koei-speech-text">
                “藤吉郎！天下布武非一日之功，今日务必将这 <strong>${quest.newWords.length} 个秘传英词</strong> 尽数通晓！功成之日，本家赐你高阶战马与名刀！”
              </div>
              <div class="keep-words-row" style="margin-top:12px;">${wordsHtml}</div>
            </div>
          </div>
          <div style="margin-top:16px;text-align:right;">
            <button class="btn btn-primary" onclick="document.getElementById('modal-keep-dialog').classList.add('hidden')">遵命！退下用功</button>
          </div>
        `;
      modal.classList.remove('hidden');
    }
  }

  openGateModal() {
    const modal = document.getElementById('modal-town-gate');
    if (modal) modal.classList.remove('hidden');
  }

  leaveToOverworld() {
    const gateModal = document.getElementById('modal-town-gate');
    if (gateModal) gateModal.classList.add('hidden');

    this.isActive = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const townEl = document.getElementById('scene-town');
    if (townEl) townEl.classList.add('hidden');

    if (window.overworld) {
      window.overworld.show();
    }
  }

  marchToDungeon() {
    const gateModal = document.getElementById('modal-town-gate');
    if (gateModal) gateModal.classList.add('hidden');

    this.isActive = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const townEl = document.getElementById('scene-town');
    if (townEl) townEl.classList.add('hidden');

    if (window.ui) {
      window.ui.startAdventure();
    }
  }

  updateHUD() {
    const hero = window.heroManager ? window.heroManager.hero : null;
    const goldEl = document.getElementById('town-gold-text');
    const heartsEl = document.getElementById('town-hearts-text');
    const rankEl = document.getElementById('town-rank-text');

    if (hero) {
      if (goldEl) goldEl.textContent = hero.gold;
      if (heartsEl) {
        const curHearts = window.heroManager.getCurrentHearts();
        const maxHearts = window.heroManager.getMaxHearts();
        let beadsHtml = '';
        for (let i = 0; i < maxHearts; i++) {
          beadsHtml += (i < curHearts)
            ? '<img src="assets/ui/magatama_green.png" class="hud-magatama-bead" alt="勾玉" style="width:18px;height:18px;vertical-align:middle;margin-right:2px;">'
            : '<img src="assets/ui/magatama_green.png" class="hud-magatama-bead hud-bead-empty" alt="勾玉" style="width:18px;height:18px;vertical-align:middle;margin-right:2px;opacity:0.25;filter:grayscale(100%);">';
        }
        heartsEl.innerHTML = beadsHtml;
      }
      if (rankEl) rankEl.textContent = window.heroManager.getCurrentRank().title;
    }
  }
}

if (typeof window !== 'undefined') {
  window.taikouTown = new TaikouTownManager();
}
