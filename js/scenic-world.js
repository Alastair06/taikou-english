/**
 * ============================================================================
 * 盛唐晴和 · 清洲立志漫游绘卷 (Scenic World Engine)
 * 彻底替换旧版简陋 2D 走格打怪视口，打造吉卜力/动物森友会式清雅画卷漫游探索
 * ============================================================================
 */

class ScenicWorld {
  constructor() {
    this.isActive = false;
    this.container = null;
    this.petalsContainer = null;
    this.petalsTimer = null;
    this.currentStageNum = 1;
    this.isInitialized = false;

    // 动森式环境微交互彩蛋（零压力自然拼读音画探索）
    this.ambientEggs = [
      {
        id: 'koi',
        name: '清溪锦鲤',
        emoji: '🐟',
        en: 'fish',
        phonetic: '/fɪʃ/',
        cn: '游鱼',
        tag: '🐟 fish [fɪʃ] 鱼儿在水里自由游泳~',
        x: 68,
        y: 84,
        sound: 'splash'
      },
      {
        id: 'bell',
        name: '茶亭风铃',
        emoji: '🎐',
        en: 'bell',
        phonetic: '/bel/',
        cn: '风铃',
        tag: '🎐 bell [bel] 檐下铜铃随风轻吟~',
        x: 35,
        y: 53,
        sound: 'chime'
      },
      {
        id: 'bird',
        name: '樱梢啼鸟',
        emoji: '🐦',
        en: 'bird',
        phonetic: '/bɜːrd/',
        cn: '小鸟',
        tag: '🐦 bird [bɜːrd] 樱花枝头展翅欢歌~',
        x: 10,
        y: 38,
        sound: 'chirp'
      },
      {
        id: 'flower',
        name: '草甸灵花',
        emoji: '🌸',
        en: 'flower',
        phonetic: '/ˈflaʊər/',
        cn: '花朵',
        tag: '🌸 flower [ˈflaʊər] 芬芳随风轻旋起舞~',
        x: 10,
        y: 88,
        sound: 'chime'
      },
      {
        id: 'frog',
        name: '荷塘青蛙',
        emoji: '🐸',
        en: 'frog',
        phonetic: '/frɔːɡ/',
        cn: '青蛙',
        tag: '🐸 frog [frɔːɡ] 荷叶上一跃入水~',
        x: 48,
        y: 91,
        sound: 'croak'
      }
    ];
    this.bubbleTimers = {};
  }

  /**
   * 初始化绘卷世界与事件监听
   */
  init() {
    this.container = document.getElementById('scene-scenic-world');
    this.petalsContainer = document.getElementById('scenic-petals-container');
    if (!this.container) return;

    this.initAmbientEggs();
    this.bindEvents();
    this.isInitialized = true;
  }

  /**
   * 事件绑定
   */
  bindEvents() {
    // 窗口尺寸自适应
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.updateHUD();
      }
    });
  }

  /**
   * 显示全景绘卷大世界
   */
  show(stageNum = null) {
    if (!this.isInitialized) {
      this.init();
    }
    this.isActive = true;

    // 隐藏其他所有全屏页面
    const home = document.getElementById('home-screen');
    if (home) home.classList.add('hidden');

    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    const ow = document.getElementById('scene-overworld');
    if (ow) ow.classList.add('hidden');

    const town = document.getElementById('scene-town');
    if (town) town.classList.add('hidden');

    if (this.container) {
      this.container.classList.remove('hidden');
    }

    // 确定关卡编号
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    this.currentStageNum = stageNum || (Math.floor(curIdx / 3) + 1);

    // 刷新大地图交互实体词汇与状态
    if (window.gameEngine && window.gameEngine.loadTodayEncounters) {
      if (!window.gameEngine.map || !window.gameEngine.map.interactiveNodes || window.gameEngine.map.interactiveNodes.length === 0) {
        window.gameEngine.loadTodayEncounters();
      }
    }

    // 刷新 HUD 与地标状态
    this.updateHUD();
    this.updateLandmarks();
    this.initAmbientEggs();
    this.resetAmbientEggs();
    this.startPetals();

    // 播放和风开场音效
    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
      window.audioEngine.playTaikoDrum();
    }
  }

  /**
   * 隐藏全景绘卷
   */
  hide() {
    this.isActive = false;
    if (this.container) {
      this.container.classList.add('hidden');
    }
    this.stopPetals();
  }

  /**
   * 刷新顶部主政仪表盘与任务目标
   */
  updateHUD() {
    if (!this.container) return;

    // 品阶
    const rank = window.heroManager ? window.heroManager.getCurrentRank() : { title: '足轻组头' };
    const rankEl = document.getElementById('scenic-hud-rank');
    if (rankEl) rankEl.textContent = rank ? rank.title : '足轻组头';

    // 军资金
    const gold = window.heroManager ? window.heroManager.getGold() : 100;
    const goldEl = document.getElementById('scenic-hud-gold');
    if (goldEl) goldEl.textContent = `${gold} 贯`;

    // 关卡单元
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curWord = allWords[curIdx] || { unit: 'Unit 1: 结识新朋友' };
    const stageTitleEl = document.getElementById('scenic-hud-stage-title');
    if (stageTitleEl) {
      stageTitleEl.textContent = `第 ${this.currentStageNum} 关 · ${curWord.unit || '城下立志巡游'}`;
    }

    // 三大立志探索进度更新
    const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
    const steleNode = nodes.find(n => n.type === 'stele');
    const nanbanNode = nodes.find(n => n.type === 'nanban');
    const chestNode = nodes.find(n => n.type === 'chest' || n.type === 'spirit');

    const steleSolved = steleNode ? steleNode.isSolved : false;
    const nanbanSolved = nanbanNode ? nanbanNode.isSolved : false;
    const chestSolved = chestNode ? chestNode.isSolved : false;

    const stelePill = document.getElementById('scenic-quest-stele');
    if (stelePill) {
      stelePill.className = `scenic-quest-pill ${steleSolved ? 'solved' : ''}`;
      stelePill.innerHTML = `⛩️ 古碑拓片 <span class="pill-dot">${steleSolved ? '✓ 破译' : '○ 待访'}</span>`;
    }

    const nanbanPill = document.getElementById('scenic-quest-nanban');
    if (nanbanPill) {
      nanbanPill.className = `scenic-quest-pill ${nanbanSolved ? 'solved' : ''}`;
      nanbanPill.innerHTML = `⛵ 南蛮贸易 <span class="pill-dot">${nanbanSolved ? '✓ 达成' : '○ 待访'}</span>`;
    }

    const chestPill = document.getElementById('scenic-quest-chest');
    if (chestPill) {
      chestPill.className = `scenic-quest-pill ${chestSolved ? 'solved' : ''}`;
      chestPill.innerHTML = `🎁 草甸宝箱 <span class="pill-dot">${chestSolved ? '✓ 开箱' : '○ 待访'}</span>`;
    }

    // 底部指导条
    const footerPrompt = document.getElementById('scenic-footer-prompt');
    const allDone = steleSolved && nanbanSolved && chestSolved;
    if (footerPrompt) {
      if (allDone) {
        footerPrompt.className = 'scenic-footer-prompt highlight-victory';
        footerPrompt.innerHTML = `
          <span class="prompt-icon">🎊</span>
          <span class="prompt-text">三大探求全部圆满！请轻触 <strong>【清洲天守】</strong> 觐见信长公受封！</span>
          <button class="btn btn-primary btn-sm prompt-btn" onclick="window.ui.claimExplorationPromotion()">🏯 觐见受封</button>
        `;
      } else {
        const solvedCount = (steleSolved ? 1 : 0) + (nanbanSolved ? 1 : 0) + (chestSolved ? 1 : 0);
        footerPrompt.className = 'scenic-footer-prompt';
        footerPrompt.innerHTML = `
          <span class="prompt-icon">🌸</span>
          <span class="prompt-text"><strong>晴和漫游</strong>：轻触地标开启听音探秘 [ ${solvedCount} / 3 完成 ]</span>
        `;
      }
    }
  }

  /**
   * 刷新画面上所有地标 POI 的状态微标
   */
  updateLandmarks() {
    const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];

    // 1. 鸟居神碑
    const steleNode = nodes.find(n => n.type === 'stele');
    const steleBadge = document.getElementById('poi-badge-stele');
    if (steleBadge) {
      const isSolved = steleNode && steleNode.isSolved;
      steleBadge.className = `poi-status-tag ${isSolved ? 'tag-solved' : 'tag-pending'}`;
      steleBadge.innerHTML = isSolved ? '✨ 已破译' : '🔍 言灵拓片';
    }

    // 2. 南蛮商船
    const nanbanNode = nodes.find(n => n.type === 'nanban');
    const nanbanBadge = document.getElementById('poi-badge-nanban');
    if (nanbanBadge) {
      const isSolved = nanbanNode && nanbanNode.isSolved;
      nanbanBadge.className = `poi-status-tag ${isSolved ? 'tag-solved' : 'tag-pending'}`;
      nanbanBadge.innerHTML = isSolved ? '🤝 协议已订' : '⛵ 舶来奇珍';
    }

    // 3. 草甸秘宝箱
    const chestNode = nodes.find(n => n.type === 'chest');
    const chestBadge = document.getElementById('poi-badge-chest');
    if (chestBadge) {
      const isSolved = chestNode && chestNode.isSolved;
      chestBadge.className = `poi-status-tag ${isSolved ? 'tag-solved' : 'tag-pending'}`;
      chestBadge.innerHTML = isSolved ? '✨ 已开箱' : '🗝️ 听音解密';
    }

    // 4. 萌狸信乐
    const spiritNode = nodes.find(n => n.type === 'spirit');
    const spiritBadge = document.getElementById('poi-badge-spirit');
    if (spiritBadge) {
      const isSolved = spiritNode && spiritNode.isSolved;
      spiritBadge.className = `poi-status-tag ${isSolved ? 'tag-solved' : 'tag-pending'}`;
      spiritBadge.innerHTML = isSolved ? '💖 莫逆之交' : '🐾 树洞灵兽';
    }

    // 5. 羊皮纸寻宝
    const clueBadge = document.getElementById('poi-badge-treasure');
    if (clueBadge) {
      const foundCount = (window.treasureHuntSystem && window.treasureHuntSystem.state && window.treasureHuntSystem.state.foundSpotIds) ? window.treasureHuntSystem.state.foundSpotIds.length : 0;
      const totalSpots = (window.treasureHuntSystem && window.treasureHuntSystem.spots) ? window.treasureHuntSystem.spots.length : 5;
      clueBadge.className = `poi-status-tag ${foundCount > 0 ? 'tag-solved' : 'tag-pending'}`;
      clueBadge.innerHTML = foundCount > 0 ? `📜 ${foundCount}/${totalSpots} 秘宝` : '🗺️ 羊皮纸卷';
    }

    // 6. 藤吉郎宅邸
    const estateBadge = document.getElementById('poi-badge-estate');
    if (estateBadge) {
      const placedCount = (window.estateSystem && window.estateSystem.state && window.estateSystem.state.placedSlots) ? Object.keys(window.estateSystem.state.placedSlots).length : 1;
      estateBadge.className = 'poi-status-tag tag-solved';
      estateBadge.innerHTML = `🏡 雅居 ${placedCount} 件`;
    }

    this.updateHUD();
  }

  /**
   * 点击地标 POI 卡片直接触发互动
   */
  interact(type) {
    if (!window.ui) return;

    if (window.audioEngine) {
      window.audioEngine.playDrumHit();
    }

    switch (type) {
      case 'stele': {
        const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
        const node = nodes.find(n => n.type === 'stele');
        window.ui.openSteleModal(node);
        break;
      }
      case 'nanban': {
        const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
        const node = nodes.find(n => n.type === 'nanban');
        window.ui.openNanbanTradeModal(node);
        break;
      }
      case 'chest': {
        const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
        const node = nodes.find(n => n.type === 'chest');
        window.ui.openChestModal(node);
        break;
      }
      case 'spirit': {
        const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
        const node = nodes.find(n => n.type === 'spirit');
        window.ui.openSpiritModal(node);
        break;
      }
      case 'nobunaga': {
        window.ui.openNobunagaMissionModal();
        break;
      }
      case 'estate': {
        window.ui.openEstateModal();
        break;
      }
      case 'clues': {
        window.ui.openTreasureClueModal();
        break;
      }
      case 'theater': {
        window.ui.openTheaterModal();
        break;
      }
      case 'lexicon': {
        window.ui.openLexiconModal();
        break;
      }
      default:
        console.warn('Unknown scenic POI:', type);
    }
  }

  /**
   * 初始化动森式环境微交互彩蛋（清溪锦鲤、茶亭风铃、樱梢啼鸟、草甸奇花、荷塘青蛙）
   */
  initAmbientEggs() {
    const stage = this.container ? this.container.querySelector('.scenic-stage-canvas') : null;
    if (!stage) return;

    if (stage.querySelector('.scenic-ambient-node')) return;

    this.ambientEggs.forEach(egg => {
      const node = document.createElement('div');
      node.className = `scenic-ambient-node ambient-${egg.id} node-egg-${egg.id}`;
      node.style.left = `${egg.x}%`;
      node.style.top = `${egg.y}%`;
      node.title = `${egg.name} · 点击探索惊喜自然拼读！`;
      node.innerHTML = `
        <div class="ambient-inner-core">
          <span class="ambient-emoji">${egg.emoji}</span>
          <span class="ambient-sparkle">✨</span>
        </div>
        <div class="ambient-pop-bubble hidden" id="bubble-ambient-${egg.id}">
          <strong class="ambient-pop-en">${egg.en}</strong>
          <span class="ambient-pop-phonetic">${egg.phonetic}</span>
          <div class="ambient-pop-cn">${egg.cn}</div>
        </div>
      `;
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerAmbient(egg.id);
      });
      stage.appendChild(node);
    });
  }

  /**
   * 重置所有环境微交互彩蛋状态（重新进入绘卷大地图时恢复显示）
   */
  resetAmbientEggs() {
    const stage = this.container ? this.container.querySelector('.scenic-stage-canvas') : null;
    if (!stage) return;
    stage.querySelectorAll('.scenic-ambient-node').forEach(node => {
      node.classList.remove('egg-collected', 'anim-disappearing', 'anim-fly-away', 'anim-dive-away', 'anim-leap-away', 'anim-gather-away', 'anim-chime-away', 'anim-bouncing');
    });
  }

  /**
   * 触发动森式环境微交互彩蛋
   * - 惊起飞走/潜水/跳跃/采撷等生动离场动效，随后在画面中消失，不可重复点击
   * - 每日首次探索奖励 5 贯，彻底杜绝无限制点击刷钱
   * - 停留静赏片刻（35秒）或重新进入地图后轻柔归来栖息，随时可跟读自然发音
   */
  triggerAmbient(eggId) {
    const egg = this.ambientEggs.find(e => e.id === eggId);
    if (!egg) return;

    const nodeEl = this.container ? this.container.querySelector(`.ambient-${egg.id}`) : null;
    if (!nodeEl || nodeEl.classList.contains('egg-collected') || nodeEl.classList.contains('anim-disappearing')) {
      return;
    }

    // 立即标记为正在离场，防止短时间内重复连击
    nodeEl.classList.add('anim-disappearing');

    // 1. 播放自然和风音效与纯正真人美音
    if (window.audioEngine) {
      if (egg.sound === 'splash') window.audioEngine.playWaterSplash();
      else if (egg.sound === 'chime') window.audioEngine.playWindChime();
      else if (egg.sound === 'chirp') window.audioEngine.playBirdChirp();
      else if (egg.sound === 'croak') window.audioEngine.playFrogCroak();
      else window.audioEngine.playBlip();

      setTimeout(() => {
        window.audioEngine.speak(egg.en);
      }, 150);
    }

    // 2. 每日首次探索奖励（严谨防刷：每天每只彩蛋仅首次奖励 5 贯）
    const today = new Date().toISOString().slice(0, 10);
    const claimKey = `scenic_egg_claimed_${today}_${egg.id}`;
    let isFirstToday = false;
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem(claimKey)) {
        localStorage.setItem(claimKey, '1');
        isFirstToday = true;
      }
    } catch (e) {
      isFirstToday = false;
    }

    if (isFirstToday) {
      if (window.heroManager) {
        window.heroManager.addGold(5);
      }
      this.updateHUD();
      if (window.ui && window.ui.showToast) {
        window.ui.showToast(`✨ 好奇发现！【${egg.name}】跃然画中，参透词汇【${egg.en} · ${egg.cn}】，获赠 5 贯！`, egg.emoji);
      }
    } else {
      if (window.ui && window.ui.showToast) {
        window.ui.showToast(`🎵 再次探寻【${egg.name} · ${egg.en}】纯正发音！（今日 5 贯发现奖励已领取）`, egg.emoji);
      }
    }

    // 3. 词汇拼读气泡生动展现
    const bubble = document.getElementById(`bubble-ambient-${egg.id}`);
    if (bubble) {
      bubble.classList.remove('hidden');
      bubble.classList.add('bubble-show');
      if (this.bubbleTimers && this.bubbleTimers[egg.id]) {
        clearTimeout(this.bubbleTimers[egg.id]);
      }
      if (!this.bubbleTimers) this.bubbleTimers = {};
      this.bubbleTimers[egg.id] = setTimeout(() => {
        bubble.classList.remove('bubble-show');
        bubble.classList.add('hidden');
      }, 2600);
    }

    // 4. 生动的离场/潜水/飞走消失动效
    if (egg.id === 'bird') {
      nodeEl.classList.add('anim-fly-away');
    } else if (egg.id === 'koi') {
      nodeEl.classList.add('anim-dive-away');
    } else if (egg.id === 'frog') {
      nodeEl.classList.add('anim-leap-away');
    } else if (egg.id === 'flower') {
      nodeEl.classList.add('anim-gather-away');
    } else {
      nodeEl.classList.add('anim-chime-away');
    }

    // 动效结束后进入隐藏收集状态（从画卷中消失，不可重复点击）
    setTimeout(() => {
      nodeEl.classList.add('egg-collected');
      nodeEl.classList.remove('anim-disappearing', 'anim-fly-away', 'anim-dive-away', 'anim-leap-away', 'anim-gather-away', 'anim-chime-away');
    }, 850);

    // 动森式栖息再现：在绘卷驻足欣赏 35 秒后，小动物悄悄回巢，可再次复习发音
    setTimeout(() => {
      if (nodeEl && nodeEl.classList.contains('egg-collected')) {
        nodeEl.classList.remove('egg-collected');
        nodeEl.classList.add('anim-reappear');
        setTimeout(() => nodeEl.classList.remove('anim-reappear'), 600);
      }
    }, 35000);
  }

  /**
   * 启动优雅飘落的落樱粒子
   */
  startPetals() {
    this.stopPetals();
    if (!this.petalsContainer) return;
    this.petalsContainer.innerHTML = '';

    const spawnPetal = () => {
      if (!this.isActive) return;
      const petal = document.createElement('div');
      petal.className = 'scenic-petal';
      const startX = Math.random() * 100;
      const duration = 6 + Math.random() * 6;
      const size = 10 + Math.random() * 8;
      const opacity = 0.5 + Math.random() * 0.4;

      petal.style.left = `${startX}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.75}px`;
      petal.style.opacity = opacity;
      petal.style.animationDuration = `${duration}s`;

      this.petalsContainer.appendChild(petal);
      setTimeout(() => {
        if (petal && petal.parentNode) {
          petal.parentNode.removeChild(petal);
        }
      }, duration * 1000);
    };

    // 初始生成少量
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnPetal, i * 400);
    }
    this.petalsTimer = setInterval(spawnPetal, 1200);
  }

  /**
   * 停止落樱
   */
  stopPetals() {
    if (this.petalsTimer) {
      clearInterval(this.petalsTimer);
      this.petalsTimer = null;
    }
    if (this.petalsContainer) {
      this.petalsContainer.innerHTML = '';
    }
  }
}

// 挂载全局单例
window.scenicWorld = new ScenicWorld();
document.addEventListener('DOMContentLoaded', () => {
  window.scenicWorld.init();
});
