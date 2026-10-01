/**
 * 太阁英语大冒险 · 2D 动作探索游戏引擎 (Canvas 60FPS Game Engine)
 * - 键盘 WASD / 方向键控制角色在地图中自由跑动
 * - 角色镜头平滑跟随 (Camera Tracking)
 * - 遇怪/宝箱即时切入挑战气泡，键盘拼词拔刀暴击
 * - 粒子爆炸、金币掉落、大门解封
 */

class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.map = new GameMap();

    // 玩家小勇士 (初始面向屏幕，大眼睛与萌宠清晰可见)
    this.player = {
      x: 540,
      y: 1030,
      radius: 20,
      speed: 4.5,
      facing: 'down',
      isMoving: false,
      animTick: 0,
      isAttacking: false,
      attackProgress: 0
    };

    // 摄像机视口与镜头缩放 (1.55倍视野最开阔舒适)
    this.zoom = 1.55;
    this.camera = {
      x: 0,
      y: 0,
      width: 800,
      height: 600
    };

    // 键盘按键状态 (WASD & 箭头键)
    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false
    };

    // 活跃怪物列表 (动态注入今日单词)
    this.monsters = [];
    this.activeEncounter = null; // 当前正在交互的怪物/宝箱
    this.currentSpelling = '';
    this.retestWords = []; // 待关底心魔复核的错词队列
    this.teachingWord = null; // 当前正在传授心法的词

    // 粒子与伤害浮动文字与武器剑气弧
    this.particles = [];
    this.floatingTexts = [];
    this.weaponSlashes = [];

    this.tick = 0;
    this.isRunning = false;

    // 关卡自由出征与历史重温机制
    this.isReplay = false;
    this.currentStageNum = 1;
    this.customStageWords = null;
  }

  /**
   * 启动指定关卡的自定义出征（支持 1~60 关任意挑战与历史温故）
   */
  startCustomStage(stageNum, stageWords, isReplay = false, cityId = null) {
    this.isReplay = !!isReplay;
    this.currentStageNum = stageNum;
    this.customStageWords = stageWords;
    this.currentCityId = cityId;
    this.loadTodayEncounters(stageWords, stageNum, isReplay, cityId);
    this.player.x = 550;
    this.player.y = 1040;
    this.player.isMoving = false;
    this.activeEncounter = null;
    this.currentSpelling = '';
    this.updateHUDTarget(null);
    this.updateHUDStats();
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeCanvas(), 250);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.resizeCanvas());
    }

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    this.bindKeyboard();
    this.loadTodayEncounters();

    this.isRunning = true;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const w = (window.visualViewport ? window.visualViewport.width : window.innerWidth) || document.documentElement.clientWidth;
    const h = (window.visualViewport ? window.visualViewport.height : window.innerHeight) || document.documentElement.clientHeight;
    this.canvas.width = Math.round(w);
    this.canvas.height = Math.round(h);
    // 动态计算最佳放大倍率，确保视野开阔且角色清晰醒目！
    this.zoom = Math.max(1.35, Math.min(1.75, w / 680));
    this.camera.width = this.canvas.width / this.zoom;
    this.camera.height = this.canvas.height / this.zoom;
  }

  /**
   * 载入今日主命对应的怪物与宝箱（支持自定义关卡词与温故模式）
   */
  loadTodayEncounters(customWords = null, customStageNum = null, isReplay = false, customCityId = null) {
    this.isReplay = !!isReplay;
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curStage = customStageNum || (Math.floor(curIdx / 3) + 1);
    this.currentStageNum = curStage;

    // 智能推导所属城池：支持显式传参、城镇当前驻留城池、大世界就近城池或依关卡自动分配
    let targetCity = customCityId || this.currentCityId;
    if (!targetCity) {
      if (window.taikouTown && window.taikouTown.isActive && window.taikouTown.currentTown) {
        targetCity = window.taikouTown.currentTown;
      } else if (window.overworld && window.overworld.nearbyCity) {
        targetCity = window.overworld.nearbyCity.id;
      }
    }
    this.currentCityId = targetCity;

    let words;
    let newWordsList;
    if (customWords && customWords.length > 0) {
      words = customWords;
      newWordsList = customWords;
    } else {
      const quest = window.progressManager.getTodayQuest();
      words = [...quest.newWords, ...quest.reviewWords];
      newWordsList = quest.newWords;
    }
    this.monsters = [];
    this.retestWords = [];

    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const curWord = (customWords && customWords[0]) || allWords[curIdx] || allWords[0] || { unitId: 'pep2024-3a-u1', unit: 'Unit 1: 结识新朋友' };
    const unitId = curWord.unitId || 'pep2024-3a-u1';

    // 1. 设置当前地图的 Biome 地貌、专属城池场景、木拒马动线与篝火盆
    if (this.map && this.map.setStage) {
      this.map.setStage(curStage, unitId, targetCity);
    }

    // 2. 保证全城大门畅通无阻，自由漫步探索
    if (this.map && this.map.gates) {
      this.map.gates.forEach(g => g.isOpen = true);
    }
    if (window.heroManager && window.heroManager.resetHearts) {
      window.heroManager.resetHearts();
    }

    // 3. 彻底去打怪化：清空敌对怪物，将本关词汇注入大地图环境探索实体
    this.monsters = [];
    if (this.map && this.map.interactiveNodes) {
      this.map.interactiveNodes.forEach((node, idx) => {
        node.isSolved = false;
        node.wordObj = words[idx % words.length];
      });
    }

    // 4. 展示开场阵地横幅与本关核心单词
    if (window.ui && window.ui.showStageIntroBanner) {
      window.ui.showStageIntroBanner(curStage, newWordsList, curWord.unit);
    }
    if (window.ui && window.ui.renderItemDock) {
      window.ui.renderItemDock();
    }
    this.updateHUDStats();
    this.updateHUDTarget(null);
  }

  /**
   * 绑定键盘 WASD 与输入
   */
  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      // WASD 行走
      if (k === 'w' || k === 'arrowup') { this.keys.w = true; }
      if (k === 's' || k === 'arrowdown') { this.keys.s = true; }
      if (k === 'a' || k === 'arrowleft') { this.keys.a = true; }
      if (k === 'd' || k === 'arrowright') { this.keys.d = true; }

      // 遇到怪物/宝箱时的拼写键入
      if (this.activeEncounter && /^[a-z]$/.test(k)) {
        this.inputLetter(k);
      } else if (this.activeEncounter && k === 'backspace') {
        this.backspace();
      } else if (this.activeEncounter && (k === ' ' || k === 'enter')) {
        // 重播发音
        window.audioEngine.speak(this.activeEncounter.wordObj.en);
      } else if (this.activeEncounter && k === 'tab') {
        e.preventDefault();
        this.useHint();
      } else if (!this.activeEncounter && (k === 'e' || (k === ' ' && this.nearInteractiveNode))) {
        // 靠近古碑或南蛮商行时触发调查/交易
        this.triggerNearbyInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') { this.keys.w = false; }
      if (k === 's' || k === 'arrowdown') { this.keys.s = false; }
      if (k === 'a' || k === 'arrowleft') { this.keys.a = false; }
      if (k === 'd' || k === 'arrowright') { this.keys.d = false; }
    });
  }

  /**
   * 主循环 60 FPS
   */
  gameLoop() {
    if (!this.isRunning) return;
    this.tick++;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * 逻辑更新
   */
  update() {
    this.updatePlayerMovement();
    this.updateCamera();
    this.updateMonsters();
    this.updateParticles();
    this.checkEncounterProximity();
  }

  /**
   * 角色移动与碰撞检测
   */
  updatePlayerMovement() {
    let dx = 0;
    let dy = 0;

    if (this.keys.w) dy -= 1;
    if (this.keys.s) dy += 1;
    if (this.keys.a) dx -= 1;
    if (this.keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      // 归一化速度
      const len = Math.hypot(dx, dy);
      dx = (dx / len) * this.player.speed;
      dy = (dy / len) * this.player.speed;

      // 朝向
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.player.facing = dy > 0 ? 'down' : 'up';
      }

      // X 轴移动并检测碰撞
      const nextX = this.player.x + dx;
      if (!this.map.isColliding(nextX, this.player.y, this.player.radius)) {
        this.player.x = nextX;
      }
      // Y 轴移动并检测碰撞
      const nextY = this.player.y + dy;
      if (!this.map.isColliding(this.player.x, nextY, this.player.radius)) {
        this.player.y = nextY;
      }

      this.player.isMoving = true;
      this.player.animTick++;
    } else {
      this.player.isMoving = false;
      this.player.animTick = 0;
    }

    // 攻击挥砍进度推进
    if (this.player.isAttacking) {
      this.player.attackProgress += 0.18;
      if (this.player.attackProgress >= 1) {
        this.player.isAttacking = false;
        this.player.attackProgress = 0;
      }
    }
  }

  /**
   * 摄像机居中跟随玩家
   */
  updateCamera() {
    const targetCamX = this.player.x - this.camera.width / 2;
    const targetCamY = this.player.y - this.camera.height / 2;

    // 平滑缓动
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;

    // 限制在地图边缘
    this.camera.x = Math.max(0, Math.min(this.map.width - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.map.height - this.camera.height, this.camera.y));
  }

  /**
   * 怪物游弋与受击闪烁
   */
  updateMonsters() {
    for (const m of this.monsters) {
      if (m.isDefeated) continue;
      if (m.hitFlash > 0) m.hitFlash--;

      // 怪物小范围原地游弋
      if (m.type !== 'chest') {
        m.x = m.originX + Math.sin(this.tick * 0.03 + m.seed) * 15;
      }
    }
  }

  /**
   * 检查是否靠近怪物、宝箱或闭锁城门，进入即时交互
   */
  checkEncounterProximity() {
    let nearest = null;
    let minDist = 75; // 触发距离

    for (const m of this.monsters) {
      if (m.isDefeated) continue;
      const d = Math.hypot(this.player.x - m.x, this.player.y - m.y);
      if (d < minDist) {
        nearest = m;
        break;
      }
    }

    // 检查是否靠近闭锁城门
    let nearGate = null;
    if (!nearest && this.map && this.map.gates) {
      for (const g of this.map.gates) {
        if (!g.isOpen) {
          const dGate = Math.hypot(this.player.x - (g.x + g.w / 2), this.player.y - (g.y + g.h / 2));
          if (dGate < 85) {
            nearGate = g;
            break;
          }
        }
      }
    }

    if (nearest !== this.activeEncounter || nearGate !== this.activeNearGate) {
      this.activeEncounter = nearest;
      this.activeNearGate = nearGate;
      this.currentSpelling = '';
      if (this.companionHelperTimer) {
        clearTimeout(this.companionHelperTimer);
        this.companionHelperTimer = null;
      }

      // 遇敌时立即收起顶部开局横幅，并隐匿十字方向盘避免按键重叠冲突
      const dpad = document.getElementById('touch-dpad');
      if (nearest) {
        if (window.ui && typeof window.ui.hideStageIntroBanner === 'function') {
          window.ui.hideStageIntroBanner();
        }
        if (dpad) dpad.classList.add('dpad-hidden');
      } else {
        if (dpad) dpad.classList.remove('dpad-hidden');
      }

      if (nearest) {
        window.audioEngine.unlockAudio();
        if (nearest.type === 'chest') {
          // 演武场宝箱：触发趣味听音辨词破锁挑战！
          this.updateHUDTarget(null);
          if (window.ui && window.ui.openChestListeningChallenge) {
            window.ui.openChestListeningChallenge(nearest);
          }
        } else {
          window.audioEngine.speak(nearest.wordObj.en);
          // 名将随行洞察：竹中半兵卫开局提醒自然拼读法则
          if (window.officerSystem && window.officerSystem.state.activeCompanion === 'hanbei' && nearest.wordObj) {
            const word = nearest.wordObj.en.toLowerCase();
            let ruleHint = '';
            if (/[aeiou][b-df-hj-np-tv-z]+e$/i.test(word)) ruleHint = 'Magic E 魔幻长元音 (末尾e不发音，前面元音发字母本音)';
            else if (/(ee|ea|oo|ai|oa|ou)/i.test(word)) ruleHint = '双元音字母组合连读规则';
            else if (/(sh|ch|th|ck|ph)/i.test(word)) ruleHint = '双辅音合音连音规则';
            if (ruleHint && window.ui) {
              window.ui.showToast(`🪭 半兵卫奇谋：“此敌暗藏【${ruleHint}】，主公留神破招！”`, '🪭');
            }
          }

          // 名将随行破招：前田利家卡壳 8 秒挺枪提示首字母
          this.companionHelperTimer = setTimeout(() => {
            if (this.activeEncounter === nearest && this.currentSpelling.length === 0 && !nearest.isDefeated) {
              if (window.officerSystem && window.officerSystem.state.activeCompanion === 'toshiie') {
                const clean = nearest.wordObj.en.toLowerCase().replace(/[^a-z]/g, '');
                if (clean.length > 0) {
                  if (window.ui) window.ui.showToast(`🦁 前田利家大喝：“藤吉郎莫慌！看我枪锋破敌，首字母为【${clean[0].toUpperCase()}】！”`, '🦁');
                  this.inputLetter(clean[0]);
                }
              }
            }
          }, 8000);
        }
      } else if (nearGate) {
        this.updateHUDGateTarget(nearGate);
      } else {
        this.updateHUDTarget(null);
      }
    }

    // 检测是否靠近环境解谜实体 (鸟居古碑、南蛮商馆、藏宝点)
    let nearNode = (!nearest && !nearGate && this.map && this.map.getNearbyNode)
      ? this.map.getNearbyNode(this.player.x, this.player.y, 80)
      : null;

    // 如果未靠近常规实体，检测是否靠近隐藏藏宝点
    if (!nearNode && window.treasureHuntSystem) {
      const nearSpotRes = window.treasureHuntSystem.getNearbySpot(this.player.x, this.player.y, 80);
      if (nearSpotRes) {
        nearNode = {
          id: nearSpotRes.spot.id,
          type: 'treasure-hunt',
          name: nearSpotRes.spot.name,
          icon: '✨',
          spot: nearSpotRes.spot
        };
      }
    }

    this.nearInteractiveNode = nearNode;
    this.updateInteractBubble(nearNode);
  }

  /**
   * 更新环境调查悬浮气泡
   */
  updateInteractBubble(nearNode) {
    const bubble = document.getElementById('interact-bubble');
    if (!bubble) return;
    if (nearNode && !this.activeEncounter) {
      bubble.classList.remove('hidden');
      const iconEl = document.getElementById('interact-bubble-icon');
      const textEl = document.getElementById('interact-bubble-text');
      if (iconEl) iconEl.textContent = nearNode.icon || '🔍';
      if (textEl) {
        if (nearNode.type === 'treasure-hunt') {
          textEl.textContent = `${nearNode.name} · 点击或按 E 挖掘秘宝`;
        } else {
          textEl.textContent = `${nearNode.name} · 点击或按 E 调查`;
        }
      }
    } else {
      bubble.classList.add('hidden');
    }
  }

  /**
   * 触发大地图环境互动 (古碑解密 / 南蛮贸易 / 寻宝)
   */
  triggerNearbyInteraction() {
    if (!this.nearInteractiveNode) return;
    const node = this.nearInteractiveNode;
    if (node.type === 'stele') {
      if (window.ui && window.ui.openSteleModal) {
        window.ui.openSteleModal(node);
      }
    } else if (node.type === 'nanban') {
      if (window.ui && window.ui.openNanbanTradeModal) {
        window.ui.openNanbanTradeModal(node);
      }
    } else if (node.type === 'chest') {
      if (window.ui && window.ui.openChestModal) {
        window.ui.openChestModal(node);
      }
    } else if (node.type === 'spirit') {
      if (window.ui && window.ui.openSpiritModal) {
        window.ui.openSpiritModal(node);
      }
    } else if (node.type === 'treasure-hunt') {
      if (window.ui && window.ui.openTreasureHuntModal) {
        window.ui.openTreasureHuntModal(node.spot);
      }
    }
  }

  /**
   * 玩家敲击字母出招拼写
   */
  inputLetter(letter) {
    if (!this.activeEncounter) return;

    const targetEn = this.activeEncounter.wordObj.en.toLowerCase();
    const cleanTarget = targetEn.replace(/[^a-z]/g, '');
    const nextChar = cleanTarget[this.currentSpelling.length];

    if (letter === nextChar) {
      // 拼对一个字母！
      this.currentSpelling += letter;

      // 播放清脆符文与击中音效
      if (window.audioEngine) {
        window.audioEngine.playKeyRune();
      }

      // 触发小勇士拔刀挥砍！
      this.player.isAttacking = true;
      this.player.attackProgress = 0;
      this.activeEncounter.hitFlash = 12;

      // 结合佩戴武器的专属自然拼读斩击特效
      const weapon = window.heroManager ? window.heroManager.getEquippedWeapon() : null;
      this.spawnWeaponSlash(this.activeEncounter.x, this.activeEncounter.y, weapon, letter);

      // 特殊武器连击与自然拼读加成判定
      if (weapon && weapon.slashType === 'muramasa' && (this.activeEncounter.mistakeCount || 0) === 0) {
        this.addFloatingText('🔥 CRITICAL 连击赤焰！+5贯', this.activeEncounter.x, this.activeEncounter.y - 45, '#ef4444');
        if (window.heroManager) {
          window.heroManager.addGold(5);
          this.updateHUDStats();
        }
      } else if (weapon && weapon.slashType === 'katana' && ['a', 'e', 'i', 'o', 'u'].includes(letter)) {
        this.addFloatingText('⚡ 流光破空剑气！', this.activeEncounter.x, this.activeEncounter.y - 35, '#38bdf8');
      } else if (this.activeEncounter.isParrying) {
        this.addFloatingText('💥 破盾！', this.activeEncounter.x, this.activeEncounter.y - 20, '#60a5fa');
      } else {
        this.addFloatingText('HIT! ✨', this.activeEncounter.x, this.activeEncounter.y - 20, '#f59e0b');
      }

      // 如果整个单词全部拼完！
      if (this.currentSpelling.length === cleanTarget.length) {
        this.onWordCompleted(this.activeEncounter);
      } else {
        this.updateKeyboardActiveHint(cleanTarget[this.currentSpelling.length]);
      }
    } else {
      // 拼错字母，温和点拨与重播真人读音，保护儿童学习兴趣
      this.activeEncounter.mistakeCount = (this.activeEncounter.mistakeCount || 0) + 1;
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
      }

      // 输错 2 次，怪物立即举盾招架并展开自然拼读心法传授！
      if (this.activeEncounter.mistakeCount >= 2) {
        this.triggerTeaching(this.activeEncounter);
      } else {
        this.addFloatingText(`💡 点拨：按 [${nextChar.toUpperCase()}] 试一试！`, this.activeEncounter.x, this.activeEncounter.y - 25, '#f59e0b');
        if (window.audioEngine) {
          window.audioEngine.speak(this.activeEncounter.wordObj.en);
        }
        this.updateKeyboardActiveHint(nextChar);
      }
    }
  }

  updateKeyboardActiveHint(nextChar) {
    const kbEl = document.getElementById('encounter-keyboard');
    if (!kbEl) return;
    const btns = kbEl.querySelectorAll('.kb-letter-btn');
    btns.forEach(btn => {
      if (btn.getAttribute('data-char') === nextChar) {
        btn.classList.add('hint-next-key');
      } else {
        btn.classList.remove('hint-next-key');
      }
    });
  }

  backspace() {
    if (this.currentSpelling.length > 0) {
      this.currentSpelling = this.currentSpelling.slice(0, -1);
    }
  }

  useHint() {
    if (!this.activeEncounter) return;
    // 点击提示直接触发名师传功教学
    this.triggerTeaching(this.activeEncounter);
  }

  /**
   * 触发战国名师传功 · 自然拼读教学卷轴
   */
  triggerTeaching(encounter) {
    encounter.wasHelped = true;
    encounter.isParrying = true;

    // 将该错词加入关底心魔复核队列（若尚未存在）
    if (!this.retestWords.some(w => w.en.toLowerCase() === encounter.wordObj.en.toLowerCase())) {
      this.retestWords.push(encounter.wordObj);
    }

    this.teachingWord = encounter.wordObj;

    // 解析自然拼读音节
    const analysis = window.PhonicsHelper ? window.PhonicsHelper.analyze(encounter.wordObj) : null;
    const modal = document.getElementById('modal-teaching-scroll');
    const badgeEl = document.getElementById('teach-word-en');
    const chunksEl = document.getElementById('teach-phonics-chunks');
    const meaningEl = document.getElementById('teach-word-cn');
    const tipEl = document.getElementById('teach-mnemonic');

    if (badgeEl) badgeEl.textContent = encounter.wordObj.en.toUpperCase();
    if (meaningEl) meaningEl.textContent = `${encounter.wordObj.emoji} ${encounter.wordObj.cn}`;
    if (tipEl && analysis) tipEl.innerHTML = `💡 <strong>拼读点拨：</strong>${analysis.phonicsTip}`;

    if (chunksEl && analysis) {
      chunksEl.innerHTML = analysis.chunks.map(c => `
        <div class="phonics-chunk ${c.type === 'v' ? 'chunk-vowel' : 'chunk-consonant'}">
          <span class="chunk-letter">${c.t}</span>
          ${c.tip ? `<span class="chunk-tip">${c.tip}</span>` : ''}
        </div>
      `).join('');
    }

    if (modal) modal.classList.remove('hidden');

    // 播放标准英音原声
    window.audioEngine.speak(encounter.wordObj.en);
    setTimeout(() => {
      if (this.teachingWord === encounter.wordObj) {
        window.audioEngine.speak(encounter.wordObj.en);
      }
    }, 1200);
  }

  /**
   * 结束教学，收起卷轴，开始盲拼破招
   */
  startBlindRetest() {
    const modal = document.getElementById('modal-teaching-scroll');
    if (modal) modal.classList.add('hidden');

    if (this.activeEncounter) {
      // 关键：清空当前拼写，必须从头完整盲拼！
      this.currentSpelling = '';
      this.activeEncounter.isParrying = true;
      this.activeEncounter.mistakeCount = 0; // 重置错误计数
      this.updateHUDTarget(this.activeEncounter.wordObj);

      if (window.ui) {
        window.ui.showToast('心法卷轴已收起！请凭记忆盲拼破盾！', '⚡');
      }
    }
  }

  /**
   * 单词拼成：击溃怪物，爆金币，开大门
   */
  onWordCompleted(monster) {
    monster.isDefeated = true;
    monster.isParrying = false;
    window.audioEngine.speak(monster.wordObj.en);

    // 记录进度掌握度
    window.progressManager.recordWordResult(monster.wordObj.en, true);
    window.heroManager.addReward(30, 20); // 30功勋，20贯

    // 推进主命（军事·军学演武）
    if (window.questSystem) {
      window.questSystem.progressQuest('military', 1);
    }

    // 触发秘技卡专属战斗被动
    if (window.cardsManager) {
      const wEn = monster.wordObj.en.toLowerCase();
      // 秘技 · 烈火之阵 (Magic E 规则)
      if (window.cardsManager.hasSkill('magic_e_burst') && /[aeiou][b-df-hj-np-tv-z]+e$/i.test(wEn)) {
        window.heroManager.addGold(15);
        this.addFloatingText('🔥 秘技·烈火之阵！+15贯', monster.x, monster.y - 70, '#f97316');
      }
      // 秘技 · 燕返 (0提示盲拼连击)
      if (window.cardsManager.hasSkill('double_kill') && !monster.wasHelped) {
        window.heroManager.addGold(20);
        this.addFloatingText('⚔️ 秘技·燕返！+20贯', monster.x, monster.y - 90, '#38bdf8');
      }
      // 秘技 · 奔雷长音 (双元音组合)
      if (window.cardsManager.hasSkill('long_vowel_thunder') && /(ee|ea|oo|ai|oa|ou)/i.test(wEn)) {
        this.addFloatingText('⚡ 秘技·奔雷长音！', monster.x, monster.y - 110, '#a855f7');
      }
    }

    // 爆炸烟雾与飞溅金币
    this.spawnExplosion(monster.x, monster.y);
    this.addFloatingText('+30 功勋', this.player.x, this.player.y - 30, '#38bdf8');
    this.addFloatingText('+20 贯', this.player.x, this.player.y - 50, '#fbbf24');

    if (monster.wasHelped) {
      this.addFloatingText('⚠️ 此词待关底心魔复核！', monster.x, monster.y - 45, '#c084fc');
    } else {
      this.addFloatingText('⭐ 完美参透！', monster.x, monster.y - 45, '#fbbf24');
    }

    // 如果对应大门，自动解封打开！
    if (monster.unlocksGate) {
      const gate = this.map.gates.find(g => g.id === monster.unlocksGate);
      if (gate) {
        gate.isOpen = true;
        this.addFloatingText('【大门解封】', gate.x + 40, gate.y - 10, '#22c55e');
      }
    }

    this.activeEncounter = null;
    const dpad = document.getElementById('touch-dpad');
    if (dpad) dpad.classList.remove('dpad-hidden');
    this.currentSpelling = '';
    this.updateHUDTarget(null);
    this.updateHUDStats();

    // 如果击溃的是心魔怪
    if (monster.isRetest) {
      this.retestWords = this.retestWords.filter(w => w.en.toLowerCase() !== monster.wordObj.en.toLowerCase());
      if (window.ui) {
        window.ui.showToast(`【心魔荡尽】已真正独立攻克：${monster.wordObj.en}！`, '🌟');
      }

      // 检查是否还有剩余心魔怪需要复核
      if (this.retestWords.length > 0) {
        setTimeout(() => this.spawnRetestBoss(), 900);
      } else {
        // 全部心魔已消灭！真正通关！
        const gate2 = this.map.gates.find(g => g.id === 'gate-2');
        if (gate2) gate2.isOpen = true;

        setTimeout(() => {
          window.ui.showVictoryModal({
            mode: 'daily',
            totalMerit: 120,
            totalGold: 100,
            streakDays: window.progressManager.getStreakDays() + 1,
            words: this.monsters.filter(m => !m.isRetest).map(m => m.wordObj),
            isReplay: this.isReplay,
            stageNum: this.currentStageNum,
            evaluation: '⭐⭐ 砥砺突破 · 错词全部复核攻克！'
          });
        }, 1000);
      }
      return;
    }

    // 检查基础怪物是否全部被消灭
    const baseMonsters = this.monsters.filter(m => !m.isRetest);
    const allBaseCleared = baseMonsters.every(m => m.isDefeated);

    if (allBaseCleared) {
      if (this.retestWords.length > 0) {
        // 还有做错过/求助过的词：触发关底心魔回马枪！
        setTimeout(() => this.spawnRetestBoss(), 1000);
      } else {
        // 0 错题，完美大捷！
        const gate2 = this.map.gates.find(g => g.id === 'gate-2');
        if (gate2) gate2.isOpen = true;

        setTimeout(() => {
          window.ui.showVictoryModal({
            mode: 'daily',
            totalMerit: 150,
            totalGold: 120,
            streakDays: window.progressManager.getStreakDays() + 1,
            words: baseMonsters.map(m => m.wordObj),
            isReplay: this.isReplay,
            stageNum: this.currentStageNum,
            evaluation: '⭐⭐⭐ 完美无瑕 · 一次全部参透！'
          });
        }, 1000);
      }
    }
  }

  /**
   * 关底召唤【心魔影忍 · 回马枪】
   */
  spawnRetestBoss() {
    if (this.retestWords.length === 0) return;
    const wordObj = this.retestWords[0];

    // 在天守铁门前召唤心魔怪
    const boss = {
      id: `retest-${Date.now()}`,
      x: 550,
      y: 470,
      originX: 550,
      originY: 470,
      type: 'ninja',
      name: `心魔影忍 · ${wordObj.en}`,
      seed: Math.random() * 10,
      wordObj: wordObj,
      isDefeated: false,
      hitFlash: 0,
      unlocksGate: null,
      mistakeCount: 0,
      isParrying: false,
      wasHelped: false,
      isRetest: true
    };

    this.monsters.push(boss);

    // 震动与音效
    window.audioEngine.playDrumHit();
    this.addFloatingText('😈【心魔回马枪降临】', 550, 430, '#c084fc');
    if (window.ui) {
      window.ui.showToast(`刚才【${wordObj.en}】未能一次领悟，心魔化形！唯有独立盲拼胜之方可通关！`, '😈');
    }
  }

  /**
   * 粒子系统
   */
  spawnSparks(x, y) {
    // 刀光金炽火星
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 9,
        vy: (Math.random() - 0.5) * 9,
        life: 20,
        size: 2.5 + Math.random() * 2.5,
        color: ['#fbbf24', '#f59e0b', '#ffffff', '#dc2626'][Math.floor(Math.random() * 4)]
      });
    }
    // 水墨飞溅墨滴
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 18,
        size: 3 + Math.random() * 2,
        color: 'rgba(15, 23, 42, 0.85)'
      });
    }
  }

  spawnExplosion(x, y) {
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        color: ['#fbbf24', '#f87171', '#34d399', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  /**
   * 武器专属自然拼读剑气与流光斩击
   */
  spawnWeaponSlash(x, y, weapon, letter) {
    const slashType = weapon ? weapon.slashType : 'wood';

    // 播放剑气挥砍音效
    if (window.audioEngine) window.audioEngine.playSlash();

    if (slashType === 'katana') {
      // 备前长船兼光：银蓝破空剑气
      this.weaponSlashes.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y - 10,
        radius: 36,
        startAngle: -Math.PI * 0.75,
        endAngle: Math.PI * 0.25,
        color: '#38bdf8',
        glowColor: '#60a5fa',
        width: 4.5,
        life: 12,
        maxLife: 12
      });
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x, y: y - 10,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 18,
          size: 3,
          color: ['#38bdf8', '#93c5fd', '#ffffff'][Math.floor(Math.random() * 3)]
        });
      }
    } else if (slashType === 'muramasa') {
      // 妖刀村正：赤红烈焰斩击弧
      this.weaponSlashes.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y - 10,
        radius: 42,
        startAngle: -Math.PI * 0.85,
        endAngle: Math.PI * 0.35,
        color: '#ef4444',
        glowColor: '#dc2626',
        width: 5,
        life: 14,
        maxLife: 14
      });
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x, y: y - 10,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 22,
          size: 3.5,
          color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)]
        });
      }
    } else if (slashType === 'spear') {
      // 蜻蛉切：金色贯穿电芒
      this.weaponSlashes.push({
        x: x,
        y: y - 10,
        radius: 44,
        startAngle: -Math.PI * 0.5,
        endAngle: 0.1,
        color: '#fbbf24',
        glowColor: '#f59e0b',
        width: 5,
        life: 10,
        maxLife: 10
      });
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x, y: y - 10,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 16,
          size: 3,
          color: ['#fbbf24', '#f59e0b', '#ffffff'][Math.floor(Math.random() * 3)]
        });
      }
    } else if (slashType === 'dojigiri') {
      // 童子切安纲：至尊紫金神光
      this.weaponSlashes.push({
        x: x,
        y: y - 10,
        radius: 50,
        startAngle: -Math.PI,
        endAngle: Math.PI * 0.5,
        color: '#c084fc',
        glowColor: '#a855f7',
        width: 6,
        life: 16,
        maxLife: 16
      });
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x, y: y - 10,
          vx: (Math.random() - 0.5) * 11,
          vy: (Math.random() - 0.5) * 11,
          life: 24,
          size: 4,
          color: ['#c084fc', '#e879f9', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)]
        });
      }
    } else if (slashType === 'musket') {
      // 南蛮重炮大铳：爆破火光与烟雾
      this.spawnExplosion(x, y - 10);
    } else {
      // 初心木剑：清脆飞星火花
      this.spawnSparks(x, y - 10);
    }
  }

  /**
   * 局内助学消耗道具快捷使用 (🍙 听音饭团 / 📜 洞察卷轴 / 💣 音节破雷)
   */
  useQuickItem(itemId) {
    if (!window.heroManager) return;
    const count = window.heroManager.getItemCount(itemId);
    if (count <= 0) {
      if (window.ui) window.ui.showToast('该锦囊道具已用罄，可在南蛮商馆补充！', '⚠️');
      return;
    }

    if (itemId === 'item-riceball') {
      // 🍙 听音兵粮丸：回复 1 颗心，慢速拆解发音
      window.heroManager.useItem(itemId);
      window.heroManager.healHeart(1);
      this.updateHUDStats();

      this.addFloatingText('🍙 兵粮丸！生命+1❤️ 慢速听音！', this.player.x, this.player.y - 45, '#22c55e');
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        if (this.activeEncounter && this.activeEncounter.wordObj) {
          window.audioEngine.speak(this.activeEncounter.wordObj.en, 0.65);
        } else {
          window.audioEngine.speak('Delicious rice ball!');
        }
      }
      // 绿色爱心治愈粒子
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: this.player.x + (Math.random() - 0.5) * 30,
          y: this.player.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 3,
          vy: -1.5 - Math.random() * 2,
          life: 25,
          size: 4,
          color: '#22c55e'
        });
      }
      if (window.ui) window.ui.showToast('🍙 食下兵粮丸：恢复 1 颗心，以 0.65 慢速纯正拆音！', '💚');

    } else if (itemId === 'item-scroll') {
      // 📜 破招洞察卷轴：展开自然拼读规则
      if (!this.activeEncounter) {
        if (window.ui) window.ui.showToast('请在遇敌对阵时使用洞察卷轴！', '💡');
        return;
      }
      window.heroManager.useItem(itemId);
      this.updateHUDStats();
      this.addFloatingText('📜 洞察卷轴！破招心法显现！', this.player.x, this.player.y - 45, '#38bdf8');
      this.triggerTeaching(this.activeEncounter);
      if (window.ui) window.ui.showToast('📜 展开秘卷：领悟当前单词自然拼读规则！', '✨');

    } else if (itemId === 'item-bomb') {
      // 💣 音节破阵雷：轰碎护盾，直接自动填入下一个正确字母
      if (!this.activeEncounter) {
        if (window.ui) window.ui.showToast('请在遭遇怪物时投掷破阵雷！', '💣');
        return;
      }
      const targetEn = this.activeEncounter.wordObj.en.toLowerCase().replace(/[^a-z]/g, '');
      const nextChar = targetEn[this.currentSpelling.length];
      if (!nextChar) return;

      window.heroManager.useItem(itemId);
      this.updateHUDStats();

      this.spawnExplosion(this.activeEncounter.x, this.activeEncounter.y);
      this.addFloatingText(`💣 破雷轰鸣！自动攻克【${nextChar.toUpperCase()}】！`, this.activeEncounter.x, this.activeEncounter.y - 45, '#ea580c');
      if (window.audioEngine) window.audioEngine.playDrumHit();
      this.inputLetter(nextChar);
      if (window.ui) window.ui.showToast(`💣 破雷轰鸣！自动填入字母 [${nextChar.toUpperCase()}]！`, '💥');
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.weaponSlashes) {
      for (let i = this.weaponSlashes.length - 1; i >= 0; i--) {
        const s = this.weaponSlashes[i];
        s.life--;
        if (s.life <= 0) this.weaponSlashes.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 1.2;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({ text, x, y, color, life: 40 });
  }

  /**
   * 渲染管线
   */
  render() {
    const ctx = this.ctx;
    const cam = this.camera;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    // 画面缩放放大 (让人物与大世界大而清晰)
    ctx.scale(this.zoom, this.zoom);
    // 摄像机平移变换
    ctx.translate(-cam.x, -cam.y);

    // 1. 绘制大地图背景
    this.map.draw(ctx, cam.x, cam.y, cam.width, cam.height, this.tick);

    // 2. 绘制怪物与宝箱
    for (const m of this.monsters) {
      if (!m.isDefeated) {
        m.inEncounter = (m === this.activeEncounter);
        CharacterRenderer.drawMonster(ctx, m, this.tick);
      }
    }

    // 3. 绘制主角小勇士 (传入 inEncounter 状态，遇敌时自动收起大名牌，避免遮挡卷轴)
    CharacterRenderer.drawHero(ctx, this.player.x, this.player.y, {
      facing: this.player.facing,
      isMoving: this.player.isMoving,
      animTick: this.player.animTick,
      isAttacking: this.player.isAttacking,
      attackProgress: this.player.attackProgress,
      inEncounter: !!this.activeEncounter
    });

    // 5. 绘制即时拼写秘卷卷轴 (置顶绘制，永不被角色遮挡，宝箱绝对不绘制拼词卷轴)
    if (this.activeEncounter && !this.activeEncounter.isDefeated && this.activeEncounter.type !== 'chest') {
      this.drawEncounterBubble(ctx, this.activeEncounter);
    }

    // 5.2 绘制武器专属自然拼读流光斩击弧
    if (this.weaponSlashes) {
      for (const s of this.weaponSlashes) {
        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, s.startAngle, s.endAngle);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5.3 绘制粒子
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. 绘制浮动战斗伤害文字
    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  /**
   * 在怪物头顶绘制和风战国秘卷木牍拼词气泡 (Secret Scroll Encounter Bubble)
   * 支持自然拼读元音/辅音分色 (朱红元音 / 靛蓝辅音)、红木金帽轴心与朱砂秘印
   */
  drawEncounterBubble(ctx, m) {
    if (!m || m.type === 'chest' || m.isDefeated) return;

    // 兜底保障：只要绘制战斗怪物卷轴，底部触控键盘必然保持同步显示，杜绝有框无字母
    const kbEl = document.getElementById('encounter-keyboard');
    if (kbEl && (kbEl.classList.contains('hidden') || kbEl.children.length === 0)) {
      this.updateHUDTarget(m.wordObj);
    }

    const word = m.wordObj;
    const cleanWord = word.en.toLowerCase().replace(/[^a-z]/g, '');
    const slotW = 40;
    const bubbleW = Math.max(220, cleanWord.length * (slotW + 10) + 72);
    const bubbleH = 98;
    const bx = m.x - bubbleW / 2;
    const by = m.y - 134;

    ctx.save();

    // 1. 卷轴地面柔和投影
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.roundRect(bx + 4, by + 6, bubbleW, bubbleH, 12);
    ctx.fill();

    // 2. 左右红木卷轴轴心 (Wooden Scroll Rollers)
    // 左轴
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 4, 12, bubbleH + 8, 4);
    ctx.fill();
    // 左轴金铜帽端
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(bx - 9, by - 6, 14, 4);
    ctx.fillRect(bx - 9, by + bubbleH + 2, 14, 4);

    // 右轴
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(bx + bubbleW - 4, by - 4, 12, bubbleH + 8, 4);
    ctx.fill();
    // 右轴金铜帽端
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(bx + bubbleW - 5, by - 6, 14, 4);
    ctx.fillRect(bx + bubbleW - 5, by + bubbleH + 2, 14, 4);

    // 3. 和纸卷轴主体 (宣纸微暖渐变底卡)
    const paperGrad = ctx.createLinearGradient(bx, by, bx, by + bubbleH);
    paperGrad.addColorStop(0, '#fffef9');
    paperGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = paperGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
    ctx.fill();

    // 细致金棕外框
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. 指向怪物的和纸尖嘴
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.moveTo(m.x - 10, by + bubbleH);
    ctx.lineTo(m.x, by + bubbleH + 13);
    ctx.lineTo(m.x + 10, by + bubbleH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x - 10, by + bubbleH);
    ctx.lineTo(m.x, by + bubbleH + 13);
    ctx.lineTo(m.x + 10, by + bubbleH);
    ctx.stroke();

    // 5. 卷轴右上角“秘”字朱砂封印印章
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(bx + bubbleW - 28, by + 8, 18, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('秘', bx + bubbleW - 19, by + 17);

    // 6. 词义标题：Emoji 与 中文释义 (面向儿童大字与高清晰度)
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 22px "PingFang SC", "Yuanti SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${word.emoji} ${word.cn}`, m.x - 6, by + 12);

    // 7. 字母木牌插槽 (Phonics-aware 将棋字母牌)
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const totalSlotsW = cleanWord.length * (slotW + 10) - 10;
    const startX = m.x - totalSlotsW / 2 + slotW / 2;

    for (let i = 0; i < cleanWord.length; i++) {
      const slotX = startX + i * (slotW + 10);
      const slotY = by + 60;
      const char = cleanWord[i];
      const isVowel = vowels.includes(char);

      if (i < this.currentSpelling.length) {
        // 已填入字母：将棋/漆牌质感
        // 元音朱红漆牌，辅音深邃靛蓝牌
        ctx.fillStyle = isVowel ? '#dc2626' : '#1e40af';
        ctx.beginPath();
        ctx.roundRect(slotX - slotW / 2, slotY - 18, slotW, 36, 10);
        ctx.fill();

        // 金色包边
        ctx.strokeStyle = isVowel ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 顶端反光高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(slotX - slotW / 2 + 2, slotY - 17, slotW - 4, 3);

        // 纯白清晰粗体大写字母 (儿童专属拼读字体)
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 26px Fredoka, Quicksand, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentSpelling[i].toUpperCase(), slotX, slotY + 2);
      } else {
        // 未填入字母槽位
        const isActiveSlot = i === this.currentSpelling.length;
        ctx.fillStyle = isActiveSlot ? '#fef9c3' : '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(slotX - slotW / 2, slotY - 18, slotW, 36, 10);
        ctx.fill();

        // 激活槽位金色呼吸光框，其余普通灰色凹槽
        ctx.lineWidth = isActiveSlot ? 2.5 : 1.5;
        ctx.strokeStyle = isActiveSlot ? '#f59e0b' : '#cbd5e1';
        ctx.stroke();

        if (isActiveSlot) {
          // 当前焦点光标提点
          ctx.fillStyle = '#d97706';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('▼', slotX, slotY - 3);
        }
      }
    }

    ctx.restore();
  }

  updateHUDTarget(wordObj) {
    const el = document.getElementById('hud-target-info');
    const kbEl = document.getElementById('encounter-keyboard');
    if (el) {
      if (wordObj) {
        el.innerHTML = `<strong>${wordObj.emoji} ${wordObj.cn}</strong> <span style="color:#d97706; margin-left:6px;">[敲击字母拼写破招]</span>`;
      } else {
        const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
        const curStage = this.currentStageNum || (Math.floor(curIdx / 3) + 1);
        const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
        const totalStages = Math.ceil((allWords.length || 178) / 3);
        const curWord = (this.customStageWords && this.customStageWords[0]) || allWords[(curStage - 1) * 3] || allWords[curIdx] || { unit: 'Unit 1' };
        const unitShort = curWord.unit ? curWord.unit.split(':')[0] : 'Unit 1';
        const cityName = (this.map && this.map.biome) ? this.map.biome.name : '尾张 · 清洲城下';
        el.innerHTML = `<span>🏯 <strong>${cityName}</strong> · 第 ${curStage} 关 [${unitShort}]</span>`;
      }
    }

    if (kbEl) {
      if (wordObj) {
        const cleanWord = wordObj.en.toLowerCase().replace(/[^a-z]/g, '');
        let letters = cleanWord.split('');
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        while (letters.length < Math.max(cleanWord.length + 2, 5)) {
          const rndChar = alphabet[Math.floor(Math.random() * alphabet.length)];
          letters.push(rndChar);
        }
        letters.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

        const vowels = ['a', 'e', 'i', 'o', 'u'];
        let html = letters.map(ch => {
          const isVowel = vowels.includes(ch);
          const cls = ['kb-letter-btn', isVowel ? 'vowel-key' : ''].filter(Boolean).join(' ');
          return `<button class="${cls}" data-char="${ch}" onclick="window.gameEngine.inputLetter('${ch}')">${ch.toUpperCase()}</button>`;
        }).join('');

        html += `<button class="kb-action-btn" onclick="window.audioEngine.speak('${wordObj.en}')">🔊 读音</button>`;
        html += `<button class="kb-action-btn" onclick="window.gameEngine.useHint()">💡 提示</button>`;

        kbEl.innerHTML = html;
        kbEl.classList.remove('hidden');
      } else {
        kbEl.classList.add('hidden');
        kbEl.innerHTML = '';
      }
    }
  }

  updateHUDStats() {
    if (!window.heroManager) return;
    const hero = window.heroManager.hero;
    const currentRank = window.heroManager.getCurrentRank();
    const goldEl = document.getElementById('hud-gold-text');
    if (goldEl && hero) goldEl.textContent = `${hero.gold} 贯`;
    const rankEl = document.getElementById('hud-rank-text');
    if (rankEl) rankEl.textContent = currentRank ? currentRank.title : (hero.rankName || '草鞋小厮');

    // 动态渲染战国勾玉生命
    const heartsEl = document.getElementById('hud-hearts');
    if (heartsEl) {
      const max = window.heroManager.getMaxHearts();
      const cur = window.heroManager.getCurrentHearts();
      let beadsHtml = '';
      for (let i = 0; i < max; i++) {
        const op = (i < cur) ? '1' : '0.25';
        beadsHtml += `<img src="assets/ui/magatama_green.png" class="magatama-bead" style="opacity:${op};" title="${cur}/${max}">`;
      }
      heartsEl.innerHTML = beadsHtml;
      heartsEl.title = `翡翠勾玉生命：${cur}/${max}（防具可扩充勾玉上限，提升容错）`;
    }

    // 动态同步锦囊道具栏存量角标
    if (window.ui && window.ui.renderItemDock) {
      window.ui.renderItemDock();
    }
  }

  /**
   * 靠近闭锁城门时的专属提示
   */
  updateHUDGateTarget(gate) {
    const el = document.getElementById('hud-target-info');
    const kbEl = document.getElementById('encounter-keyboard');
    if (el) {
      el.innerHTML = `<span>🗝️ <strong>${gate.name}</strong> 紧闭！</span> <button class="btn btn-sm btn-primary" style="margin-left:8px;padding:3px 12px;font-size:12px;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:12px;cursor:pointer;color:#fff;font-weight:bold;" onclick="window.ui.openGatePassphraseModal('${gate.id}')">🔐 暗号开门 (+20贯)</button>`;
    }
    if (kbEl) {
      kbEl.classList.add('hidden');
      kbEl.innerHTML = '';
    }
  }

  /**
   * 点击/触控画布上的实体（如战宠柴犬、闭锁城门）
   */
  handleCanvasClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = screenX / this.zoom + this.camera.x;
    const worldY = screenY / this.zoom + this.camera.y;

    // 1. 检查是否点击了闭锁城门 (60px 半径)
    if (this.map && this.map.gates) {
      for (const gate of this.map.gates) {
        if (!gate.isOpen) {
          const gateCenterX = gate.x + gate.w / 2;
          const gateCenterY = gate.y + gate.h / 2;
          const dGate = Math.hypot(worldX - gateCenterX, worldY - gateCenterY);
          if (dGate < 60) {
            if (window.ui && window.ui.openGatePassphraseModal) {
              window.ui.openGatePassphraseModal(gate.id);
            }
            return;
          }
        }
      }
    }
  }
}

window.GameEngine = GameEngine;
