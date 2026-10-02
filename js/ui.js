/**
 * 太阁英语大冒险 · 浮动面板与弹窗管理器 (Clean Safe UI Manager)
 * 专注管理：家长进度滑块、南蛮商馆、大捷封赏令与提示 Toast
 * 全防御式编码，杜绝任何 DOM 未定义报错！
 */

class UIManager {
  constructor() {
    this.shopItems = [
      { id: 'gun-tanegashima', name: '南蛮国崩铁炮 ⚡', cost: 150, type: 'weapon', bonus: '拼词剑气暴击 +50%', icon: '🔫' },
      { id: 'blade-muramasa', name: '妖刀村正 🗡️', cost: 200, type: 'weapon', bonus: '剑气附带血色烈焰', icon: '⚔️' },
      { id: 'relic-telescope', name: '南蛮西洋远望镜 🔭', cost: 120, type: 'relic', bonus: '侦察先机，金币 +25%，功勋 +10%', icon: '🔭' },
      { id: 'armor-red', name: '织田胴丸朱铠 🛡️', cost: 120, type: 'armor', bonus: '心心生命上限 +1', icon: '🥋' }
    ];
  }

  initDOMElements() {
    // 预热并绑定通用关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.onclick = (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
      };
    });
    this.initSakuraEffect();
    this.initOrientationHint();
  }

  /**
   * 樱花飘落动态视觉特效
   */
  initSakuraEffect() {
    const container = document.getElementById('home-sakura-container');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 26; i++) {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      const size = Math.random() * 8 + 8; // 8-16px
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.3}px`;
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${Math.random() * 6 + 5}s`;
      petal.style.animationDelay = `${Math.random() * 6}s`;
      petal.style.opacity = `${Math.random() * 0.5 + 0.4}`;
      container.appendChild(petal);
    }
  }

  /**
   * 移动端旋转横屏轻柔引导提示
   */
  initOrientationHint() {
    const isMobile = window.innerWidth <= 650 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const checkAndShow = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const existing = document.getElementById('mobile-orientation-hint');
      if (isPortrait && !existing && !sessionStorage.getItem('dismiss_orientation_hint')) {
        const hint = document.createElement('div');
        hint.id = 'mobile-orientation-hint';
        hint.className = 'orientation-toast';
        hint.innerHTML = `
          <span>📱 建议旋转横屏体验，视野更开阔震撼！</span>
          <span class="tip-close" onclick="sessionStorage.setItem('dismiss_orientation_hint', '1'); this.parentElement.remove();">✕</span>
        `;
        document.body.appendChild(hint);
        setTimeout(() => {
          if (hint && hint.parentElement) hint.remove();
        }, 5000);
      } else if (!isPortrait && existing) {
        existing.remove();
      }
    };

    setTimeout(checkAndShow, 1200);
    window.addEventListener('resize', checkAndShow);
  }

  /**
   * 渲染并打开游戏大本营前端主页
   */
  showHomeScreen() {
    if (window.overworld) window.overworld.hide();
    if (window.taikouTown) {
      window.taikouTown.isActive = false;
      const t = document.getElementById('scene-town');
      if (t) t.classList.add('hidden');
    }
    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');
    if (window.scenicWorld) window.scenicWorld.hide();
    const sc = document.getElementById('scene-scenic-world');
    if (sc) sc.classList.add('hidden');

    const screen = document.getElementById('home-screen');
    if (!screen) return;
    this.updateHomeProfile();
    this.initSakuraEffect();
    screen.classList.remove('hidden');

    // 检查是否有新解禁系统的破印金芒演出
    if (this.pendingUnlockAnimationKeys && this.pendingUnlockAnimationKeys.length > 0) {
      const keys = [...this.pendingUnlockAnimationKeys];
      this.pendingUnlockAnimationKeys = null;
      setTimeout(() => {
        this.playUnlockCeremony(keys);
      }, 300);
    }

    // 检查并触发领地晨参纳贡进贡弹窗
    if (window.overworld && typeof window.overworld.checkAndTriggerDailyTribute === 'function') {
      setTimeout(() => {
        window.overworld.checkAndTriggerDailyTribute();
      }, 500);
    }
  }

  /**
   * 隐藏游戏前端主页
   */
  hideHomeScreen() {
    const screen = document.getElementById('home-screen');
    if (screen) screen.classList.add('hidden');
    const toast = document.getElementById('sengoku-lock-toast');
    if (toast) toast.classList.remove('show');
  }

  /**
   * 一键从大本营出发进入晴和盛景漫游绘卷大世界 (彻底替代旧版简陋打怪走格页面)
   */
  startAdventure() {
    this.hideHomeScreen();
    if (window.overworld) window.overworld.hide();
    if (window.taikouTown) {
      window.taikouTown.isActive = false;
      const t = document.getElementById('scene-town');
      if (t) t.classList.add('hidden');
    }
    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
      window.audioEngine.playTaikoDrum();
    }
    if (window.gameEngine) {
      window.gameEngine.loadTodayEncounters();
      window.gameEngine.activeEncounter = null;
      window.gameEngine.updateHUDStats();
    }
    if (window.scenicWorld) {
      window.scenicWorld.show();
    }
  }

  /**
   * 动态刷新前端主页中的小勇士档案卡信息
   */
  updateHomeProfile() {
    if (!window.heroManager) return;
    const hero = window.heroManager.hero;
    const rank = window.heroManager.getCurrentRank();
    const gold = window.heroManager.getGold();
    const maxHearts = window.heroManager.getMaxHearts();
    const curHearts = window.heroManager.getCurrentHearts();
    const streak = window.progressManager ? window.progressManager.getStreakDays() : 1;

    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curStage = Math.floor(curIdx / 3) + 1;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const totalStages = Math.ceil((allWords.length || 178) / 3);
    const curWord = allWords[curIdx] || { unit: 'Unit 1: 结识新朋友' };

    const rankBadge = document.getElementById('home-rank-badge');
    if (rankBadge) rankBadge.textContent = `${rank ? rank.title : '足轻组头'}`;

    const goldVal = document.getElementById('home-gold-val');
    if (goldVal) goldVal.textContent = gold;

    const streakVal = document.getElementById('home-streak-val');
    if (streakVal) streakVal.textContent = Math.max(1, streak);

    const heartsVal = document.getElementById('home-hearts-val');
    if (heartsVal) {
      let heartsStr = '';
      for (let i = 0; i < maxHearts; i++) {
        heartsStr += (i < curHearts)
          ? '<img src="assets/ui/magatama_green.png" class="hud-magatama-bead" alt="勾玉" style="width:18px;height:18px;vertical-align:middle;margin-right:2px;">'
          : '<img src="assets/ui/magatama_green.png" class="hud-magatama-bead hud-bead-empty" alt="勾玉" style="width:18px;height:18px;vertical-align:middle;margin-right:2px;opacity:0.25;filter:grayscale(100%);">';
      }
      heartsVal.innerHTML = heartsStr;
    }

    const progressText = document.getElementById('home-progress-text');
    if (progressText) {
      if (window.questSystem && window.questSystem.state.activeQuest) {
        const q = window.questSystem.state.activeQuest;
        progressText.innerHTML = `📜 信长主命：<strong>${q.title}</strong> [${q.currentCount}/${q.targetCount}]`;
      } else {
        progressText.innerHTML = `🚩 当前主命：<strong>第 ${curStage} 关 / 共 ${totalStages} 关</strong> · 【${curWord.unit || 'Unit 1'}】`;
      }
    }

    const startBtnTitle = document.getElementById('home-start-btn-title') || document.querySelector('.start-main-text');
    if (startBtnTitle) {
      startBtnTitle.textContent = `出 发 · 第 ${curStage} 关`;
    }
    const stageSub = document.getElementById('home-start-stage-sub');
    if (stageSub) {
      stageSub.remove();
    }

    // 动态刷新每日立志军令主命看板
    const subMerit = document.getElementById('home-sub-merit');
    if (subMerit) {
      const merit = window.rankManager ? (window.rankManager.state?.merit || 0) : 0;
      subMerit.textContent = `⭐ ${merit} 点`;
    }
    const subVocab = document.getElementById('home-sub-vocab');
    if (subVocab) {
      const learned = window.learnedWords ? (window.learnedWords.size || 0) : curIdx;
      subVocab.textContent = `📖 ${learned} 词`;
    }
    const subRank = document.getElementById('home-sub-rank');
    if (subRank) {
      const nextRank = window.rankManager ? window.rankManager.getNextRank() : null;
      subRank.textContent = nextRank ? `🔰 ${nextRank.title}` : '👑 天下人';
    }

    // 动态刷新九大次级功能牌札的渐进式封印/解禁状态
    this.updateHomeNavLocks();
  }

  /**
   * 动态刷新主屏导航木牌的渐进式锁定/封条状态
   */
  updateHomeNavLocks() {
    if (!window.progressManager) return;
    const features = ['lexicon', 'chapters', 'cards', 'town', 'clues', 'estate', 'speech', 'officer', 'hyojo', 'trade', 'theater', 'overworld', 'parent'];

    features.forEach(key => {
      const btn = document.getElementById(`btn-nav-${key}`);
      if (!btn) return;

      const isUnlocked = window.progressManager.isFeatureUnlocked(key);
      const cfg = window.progressManager.getFeatureUnlockConfig(key);

      // 检查是否已有封条
      const existingSeal = btn.querySelector('.seal-talisman');

      if (isUnlocked) {
        btn.classList.remove('is-locked');
        if (existingSeal) existingSeal.remove();
      } else {
        btn.classList.add('is-locked');
        if (!existingSeal) {
          const sealEl = document.createElement('div');
          sealEl.className = 'seal-talisman';
          sealEl.innerHTML = `
            <span class="seal-stamp">封</span>
            <span class="seal-text">${cfg.hint || '关卡解锁'}</span>
          `;
          btn.appendChild(sealEl);
        }
      }
    });
  }

  /**
   * 拦截导航木牌点击：未解锁则弹出儿童鼓励气泡并晃动封条，已解锁则执行进入
   */
  handleNavFeatureClick(featureKey, onUnlockedAction) {
    if (!window.progressManager) {
      if (onUnlockedAction) onUnlockedAction();
      return;
    }

    const isUnlocked = window.progressManager.isFeatureUnlocked(featureKey);
    if (isUnlocked) {
      if (onUnlockedAction) onUnlockedAction();
      return;
    }

    // 锁定状态下的果冻晃动反馈
    const btn = document.getElementById(`btn-nav-${featureKey}`);
    if (btn) {
      btn.classList.remove('shake-locked');
      void btn.offsetWidth; // 触发回流重绘
      btn.classList.add('shake-locked');
      setTimeout(() => btn.classList.remove('shake-locked'), 450);
    }

    if (window.audioEngine) {
      window.audioEngine.playBlip();
    }

    this.showLockDecreeToast(featureKey);
  }

  /**
   * 弹出面向儿童的和纸封条提示气泡 Toast
   */
  showLockDecreeToast(featureKey) {
    const cfg = window.progressManager ? window.progressManager.getFeatureUnlockConfig(featureKey) : { minStage: 1, title: '奇妙功能' };
    let toast = document.getElementById('sengoku-lock-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sengoku-lock-toast';
      toast.className = 'sengoku-lock-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="lock-toast-icon">📜</div>
      <div class="lock-toast-content">
        <div class="lock-toast-title">⭐ 神秘封条贴牢啦！⭐</div>
        <div class="lock-toast-msg">小勇士加油！通关【第 ${cfg.minStage} 关】就能撕开封条，进入<strong>【${cfg.title}】</strong>啦！</div>
      </div>
      <button class="lock-toast-action" onclick="window.ui.dismissLockToastAndStartAdventure()">
        出发闯关 🚀
      </button>
    `;

    toast.classList.add('show');

    if (this._lockToastTimer) clearTimeout(this._lockToastTimer);
    this._lockToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  dismissLockToastAndStartAdventure() {
    const toast = document.getElementById('sengoku-lock-toast');
    if (toast) toast.classList.remove('show');
    this.startAdventure();
  }

  /**
   * 破印金芒演出（大本营欢庆仪式）
   */
  playUnlockCeremony(keys) {
    if (window.audioEngine) {
      window.audioEngine.playPromotionFanfare();
    }
    const unlockedTitles = [];
    keys.forEach(key => {
      const btn = document.getElementById(`btn-nav-${key}`);
      const cfg = window.progressManager ? window.progressManager.getFeatureUnlockConfig(key) : null;
      if (cfg) unlockedTitles.push(cfg.title);

      if (btn) {
        btn.classList.remove('is-locked');
        const seal = btn.querySelector('.seal-talisman');
        if (seal) seal.remove();
        btn.classList.add('unlock-burst');
        setTimeout(() => btn.classList.remove('unlock-burst'), 1500);
      }
    });

    if (unlockedTitles.length > 0) {
      this.showToast(`🎉 封印破除！【${unlockedTitles.join('、')}】现已解禁向你敞开！`, '🔓');
    }
  }

  /**
   * 打开家长专属学校教学进度对齐面板
   */
  openParentProgressModal() {
    const modal = document.getElementById('modal-parent-progress');
    if (!modal) return;

    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const slider = document.getElementById('slider-progress');
    const countInfo = document.getElementById('slider-count-info');
    const wordInfo = document.getElementById('slider-word-info');

    if (slider && allWords.length > 0) {
      slider.max = allWords.length - 1;
      const currentIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
      slider.value = currentIdx;

      const updatePreview = (idx) => {
        idx = Math.max(0, Math.min(allWords.length - 1, idx));
        slider.value = idx;
        const w = allWords[idx];
        if (countInfo) countInfo.textContent = `第 ${idx + 1} 词 / 全书共 ${allWords.length} 词`;
        if (wordInfo && w) {
          wordInfo.textContent = `【${w.unitName || w.unit}】: ${w.en} (${w.cn}) ${w.emoji || '📖'}`;
        }

        // 高亮对应的单元速选卡
        document.querySelectorAll('.unit-quick-btn').forEach(btn => {
          const start = parseInt(btn.dataset.start, 10);
          let end = 178;
          if (start === 0) end = 52;
          else if (start === 52) end = 100;
          else if (start === 100) end = 143;
          btn.classList.toggle('active', idx >= start && idx < end);
        });
      };

      // 绑定滑块拖拽事件 (支持 input 与 change，完美兼容 iPad 触屏)
      slider.oninput = (e) => updatePreview(parseInt(e.target.value, 10));
      slider.onchange = (e) => updatePreview(parseInt(e.target.value, 10));

      // 绑定 4 大单元一键直达卡
      document.querySelectorAll('.unit-quick-btn').forEach(btn => {
        btn.onclick = () => {
          const startIdx = parseInt(btn.dataset.start, 10);
          updatePreview(startIdx);
        };
      });

      // 绑定微调步进器
      const bindStep = (id, delta) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.onclick = () => {
            const cur = parseInt(slider.value, 10) || 0;
            updatePreview(cur + delta);
          };
        }
      };
      bindStep('btn-step-prev-10', -10);
      bindStep('btn-step-prev-1', -1);
      bindStep('btn-step-next-1', 1);
      bindStep('btn-step-next-10', 10);

      // 绑定生词总表单元筛选 Tabs
      document.querySelectorAll('#parent-words-unit-tabs .tab-btn').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('#parent-words-unit-tabs .tab-btn').forEach(b => b.classList.remove('active'));
          tab.classList.add('active');
          const unit = tab.dataset.unit;
          const cur = parseInt(slider.value, 10) || 0;
          this.renderParentWordsList(unit, cur);
        };
      });

      updatePreview(currentIdx);
      this.renderParentWordsList('all', currentIdx);
    }

    modal.classList.remove('hidden');
  }

  /**
   * 渲染教材 178 词对照总表
   */
  renderParentWordsList(filterUnit = 'all', currentIdx = 0) {
    const container = document.getElementById('parent-words-list-container');
    if (!container || !window.wordManager) return;

    const allWords = window.wordManager.getAllTextbookWordsFlat();
    const filtered = allWords.filter(w => {
      if (filterUnit === 'all') return true;
      return String(w.unitIndex) === String(filterUnit);
    });

    container.innerHTML = filtered.map(w => {
      const globalIdx = w.globalIndex - 1;
      const isActive = (globalIdx === currentIdx);
      const displayEn = w.textbook || w.en;
      return `
        <div class="word-item-card ${isActive ? 'is-active' : ''}" id="word-item-${globalIdx}">
          <div class="word-item-left">
            <span class="word-idx-badge">#${w.globalIndex}</span>
            <span class="word-unit-badge">${w.unit}</span>
            <span class="word-en-text">${displayEn}</span>
            <span class="word-cn-text">${w.emoji} ${w.cn}</span>
          </div>
          <div class="word-actions">
            <button class="btn-mini-audio" onclick="event.stopPropagation(); window.audioEngine.speak('${w.en}')" title="朗读发音">🔊</button>
            <button class="btn-mini-select" onclick="window.ui.selectProgressWord(${globalIdx})">
              ${isActive ? '进行中 ⭐' : '🎯 从此开练'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * 家长在总表中直接点击“🎯 从此开练”
   */
  selectProgressWord(targetIdx) {
    const slider = document.getElementById('slider-progress');
    if (slider) slider.value = targetIdx;
    if (window.progressManager) {
      window.progressManager.setCurrentIndex(targetIdx);
      if (window.gameEngine) {
        window.gameEngine.loadTodayEncounters();
        window.gameEngine.activeEncounter = null;
        if (window.gameEngine.map) {
          window.gameEngine.map.gates.forEach(g => g.isOpen = false);
        }
      }
      const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
      const curWord = allWords[targetIdx] || { en: 'meet', unit: 'Unit 1' };
      this.showToast(`已成功对齐学校进度至第 ${targetIdx + 1} 词【${curWord.unit} ${curWord.textbook || curWord.en}】！`, '📌');
      this.openParentProgressModal(); // 刷新列表高亮与滑块
    }
  }

  /**
   * 保存教学进度对齐
   */
  saveParentProgress() {
    const slider = document.getElementById('slider-progress');
    if (slider && window.progressManager) {
      const targetIdx = parseInt(slider.value, 10);
      window.progressManager.setCurrentIndex(targetIdx);

      const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
      const curWord = allWords[targetIdx] || { en: 'meet', unit: 'Unit 1' };

      if (window.gameEngine) {
        window.gameEngine.loadTodayEncounters();
        window.gameEngine.activeEncounter = null;
        if (window.gameEngine.map) {
          window.gameEngine.map.gates.forEach(g => g.isOpen = false);
        }
      }
      this.updateHomeProfile();
      this.showToast(`已成功对齐学校进度至第 ${targetIdx + 1} 词【${curWord.unit} ${curWord.textbook || curWord.en}】！`, '📌');
    }
    const modal = document.getElementById('modal-parent-progress');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * 打开战役关卡与 1~60 关自由出征总览卷轴
   */
  openChaptersModal() {
    const modal = document.getElementById('modal-chapters');
    if (!modal) return;

    if (!this.currentStageFilter) {
      this.currentStageFilter = 'all';
    }

    // 更新学校教学对齐横幅信息
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curSchoolStage = Math.floor(curIdx / 3) + 1;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const curWord = allWords[curIdx] || allWords[0] || { unit: 'Unit 1: 结识新朋友' };

    const bannerInfo = document.getElementById('banner-school-stage-info');
    if (bannerInfo) {
      bannerInfo.innerHTML = `当前正挑战：<strong>第 ${curSchoolStage} 关</strong> · 【${curWord.unit || 'Unit 1'}】`;
    }

    this.renderStagesGrid();
    modal.classList.remove('hidden');
  }

  /**
   * 筛选合战关卡章节
   */
  filterStages(unitFilter) {
    this.currentStageFilter = unitFilter;
    const tabs = document.querySelectorAll('#stage-filter-tabs .stage-tab-btn');
    tabs.forEach(t => {
      if (t.dataset.unit === unitFilter) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    this.renderStagesGrid();
  }

  /**
   * 动态渲染 60 大合战关卡网格卡片
   */
  renderStagesGrid() {
    const container = document.getElementById('stages-grid-container');
    if (!container || !window.wordManager) return;

    const allWords = window.wordManager.getAllTextbookWordsFlat();
    const totalWords = allWords.length || 178;
    const totalStages = Math.ceil(totalWords / 3); // 60 关

    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curSchoolStage = Math.floor(curIdx / 3) + 1;
    const filter = this.currentStageFilter || 'all';

    let cardsHtml = '';
    for (let s = 1; s <= totalStages; s++) {
      // 单元所属章节判定
      let unitNum = 1;
      if (s >= 1 && s <= 18) unitNum = 1;
      else if (s >= 19 && s <= 34) unitNum = 2;
      else if (s >= 35 && s <= 48) unitNum = 3;
      else unitNum = 4;

      if (filter !== 'all' && String(unitNum) !== String(filter)) {
        continue;
      }

      const startWordIdx = (s - 1) * 3;
      const stageWords = allWords.slice(startWordIdx, Math.min(totalWords, startWordIdx + 3));
      const firstWord = stageWords[0] || { unit: `Unit ${unitNum}` };
      const unitShortName = (firstWord.unit || `Unit ${unitNum}`).replace(/^Unit \d+:\s*/, '');

      const isCurrent = (s === curSchoolStage);
      const isPassed = (s < curSchoolStage);

      let badgeHtml = '';
      let btnHtml = '';
      let cardClass = 'stage-card';

      if (isCurrent) {
        cardClass += ' is-school-target';
        badgeHtml = '<span class="stage-badge current">🏫 学校主线</span>';
        btnHtml = `<button class="btn btn-sm btn-primary stage-action-btn" onclick="window.ui.launchStage(${s})">主命决战 ⚔️</button>`;
      } else if (isPassed) {
        badgeHtml = '<span class="stage-badge passed">⭐ 已平定</span>';
        btnHtml = `<button class="btn btn-sm btn-secondary stage-action-btn" onclick="window.ui.launchStage(${s})">温故出征 🔄</button>`;
      } else {
        badgeHtml = '<span class="stage-badge locked">⚔️ 预习试炼</span>';
        btnHtml = `<button class="btn btn-sm btn-secondary stage-action-btn" onclick="window.ui.launchStage(${s})">先行挑战 ➔</button>`;
      }

      const wordsChips = stageWords.map(w => `
        <span class="stage-word-tag" onclick="event.stopPropagation(); if(window.audioEngine) window.audioEngine.speak('${w.en}')" title="点击倾听标准真人发音">
          🔊 ${w.en} <small style="color:#786455; font-family:var(--font-simplified-cn); margin-left:3px;">${w.cn}</small>
        </span>
      `).join('');

      let cityName = '🏯 尾张清洲';
      if (s >= 51) cityName = '👑 近江安土';
      else if (s >= 41) cityName = '🛡️ 相模小田原';
      else if (s >= 31) cityName = '🌸 山城京都';
      else if (s >= 21) cityName = '🚢 摄津界港';
      else if (s >= 11) cityName = '⛰️ 美浓稻叶山';

      cardsHtml += `
        <div class="${cardClass}">
          <div class="stage-card-header">
            <span class="stage-card-title">第 ${s} 关 · ${unitShortName} <small style="font-size:11px; color:#92400e; font-weight:800; margin-left:4px;">${cityName}</small></span>
            ${badgeHtml}
          </div>
          <div class="stage-words-list">
            ${wordsChips}
          </div>
          ${btnHtml}
        </div>
      `;
    }

    container.innerHTML = cardsHtml;
  }

  /**
   * 启动指定关卡出征（机制保证：重温已通关卡绝不倒退学校教学对齐进度！）
   */
  launchStage(stageNum) {
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const startIdx = (stageNum - 1) * 3;
    const stageWords = allWords.slice(startIdx, Math.min(allWords.length, startIdx + 3));
    if (stageWords.length === 0) return;

    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curSchoolStage = Math.floor(curIdx / 3) + 1;
    const isReplay = (stageNum < curSchoolStage);

    let targetCity = 'kiyosu';
    if (stageNum >= 51) targetCity = 'azuchi';
    else if (stageNum >= 41) targetCity = 'odawara';
    else if (stageNum >= 31) targetCity = 'kyoto';
    else if (stageNum >= 21) targetCity = 'sakai';
    else if (stageNum >= 11) targetCity = 'inabayama';

    const modal = document.getElementById('modal-chapters');
    if (modal) modal.classList.add('hidden');

    this.hideHomeScreen();
    if (window.overworld) window.overworld.hide();
    if (window.taikouTown) {
      window.taikouTown.isActive = false;
      const t = document.getElementById('scene-town');
      if (t) t.classList.add('hidden');
    }
    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
      window.audioEngine.playTaikoDrum();
    }

    if (window.gameEngine) {
      window.gameEngine.startCustomStage(stageNum, stageWords, isReplay, targetCity);
    }
    if (window.scenicWorld) {
      window.scenicWorld.show(stageNum);
    }

    if (isReplay) {
      this.showToast(`🔄 出征第 ${stageNum} 关（温故演武，完全保留学校教学对齐进度）！`, '⚔️');
    } else if (stageNum === curSchoolStage) {
      this.showToast(`🏫 出征第 ${stageNum} 关（学校教学主命）！`, '🚩');
    } else {
      this.showToast(`⚔️ 先行预习出征第 ${stageNum} 关！`, '🚩');
    }
  }

  /**
   * 打开言灵演武 · 麦克风实时发音评测殿
   */
  openSpeechEvalModal(targetWordObj = null) {
    const modal = document.getElementById('modal-speech-eval');
    if (!modal) return;

    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;

    let word = targetWordObj;
    if (!word) {
      word = allWords[curIdx] || allWords[0] || { en: 'hello', cn: '你好', emoji: '👋', unit: 'Unit 1: 结识新朋友' };
    }
    this.activeSpeechWord = word;

    const body = document.getElementById('speech-eval-modal-body');
    if (body) {
      const isSupported = window.audioEngine && window.audioEngine.isSpeechRecognitionSupported();
      body.innerHTML = `
        <div class="speech-eval-card">
          <div style="font-size: 15px; color: var(--gold-sengoku); font-weight: 800; display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span>📜 【${word.unit || '三年级核心词'}】</span>
            <span style="font-size: 13px; color: var(--text-sub);">言灵评测殿</span>
          </div>

          <div class="speech-word-display" id="speech-target-display" style="cursor: pointer;" onclick="if(window.audioEngine) window.audioEngine.speak('${word.en}')" title="点击听真人纯正范读">
            ${word.en}
          </div>

          <div class="speech-meaning-text">
            ${word.emoji || '📖'} ${word.cn}
          </div>

          <div class="speech-phonics-hint">
            🗣️ 发音要领：<strong>${word.en.toUpperCase()}</strong> · 点击下方红色麦克风大声朗读
          </div>

          <div class="speech-controls-row">
            <button class="btn btn-secondary" onclick="if(window.audioEngine) window.audioEngine.speak('${word.en}')" style="font-size: 16px;">
              🔊 范读倾听
            </button>
            <button class="btn-mic-record" id="btn-speech-record" onclick="window.ui.triggerSpeechRecognition('${word.en}')" title="点击开始跟读录音">
              🎙️
            </button>
            <button class="btn btn-secondary" onclick="window.ui.nextSpeechEvalWord()" style="font-size: 16px;">
              🔀 换一词
            </button>
          </div>

          <div class="speech-eval-result-box" id="speech-eval-result-box">
            <div class="speech-eval-tip" id="speech-eval-status-text">
              ${isSupported 
                ? '👆 点击上方红色麦克风，对准麦克风大声读出这个单词！' 
                : '💡 提示：当前浏览器环境未开放麦克风识别接口，推荐在 iPad Safari 或桌面 Chrome 中体验实时麦克风发音评测！点击【🔊 范读倾听】也可随时跟读学习。'}
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  /**
   * 触发麦克风跟读与发音评测
   */
  triggerSpeechRecognition(targetWord) {
    if (!window.audioEngine) return;
    const btn = document.getElementById('btn-speech-record');
    const resBox = document.getElementById('speech-eval-result-box');

    if (btn) btn.classList.add('listening');
    if (resBox) {
      resBox.innerHTML = `
        <div class="speech-eval-tip" style="color: #dc2626; font-weight: 800; font-size: 16px;">
          🎙️ 正在倾听中... 请对准麦克风大声念出：【${targetWord}】！
        </div>
      `;
    }

    window.audioEngine.recognizeSpeech(
      targetWord,
      () => {
        if (btn) btn.classList.add('listening');
      },
      (res) => {
        if (btn) btn.classList.remove('listening');
        const { spoken, evalResult } = res;
        const isHigh = evalResult.score >= 80;

        // 评测优良者赠予金判与功勋奖励
        if (evalResult.matched && window.heroManager) {
          window.heroManager.addGold(15);
          window.heroManager.addMerit(20);
        }
        if (isHigh && window.audioEngine) {
          window.audioEngine.playSwordSlash();
        }

        if (resBox) {
          resBox.innerHTML = `
            <div class="speech-score-seal" style="color: ${evalResult.matched ? '#059669' : '#dc2626'};">
              <span>${evalResult.matched ? '🎖️' : '⚠️'}</span>
              <span>【${evalResult.score} 分】${evalResult.title}</span>
            </div>
            <div style="font-size: 15px; color: #2b1f17; font-family: var(--font-simplified-cn); margin-top: 4px;">
              识别到发音：<strong style="color: #8c1f19; font-family: var(--font-en); font-size: 18px;">“${spoken}”</strong>
            </div>
            <div class="speech-eval-tip">
              ${evalResult.message}
            </div>
            ${evalResult.matched ? `
              <div style="font-size: 13.5px; color: #b45309; margin-top: 6px; font-weight: 800;">
                🪙 获得赏赐：金判 +15 贯 · 功勋 +20！
              </div>
            ` : ''}
          `;
        }
      },
      (err) => {
        if (btn) btn.classList.remove('listening');
        if (resBox) {
          resBox.innerHTML = `
            <div class="speech-eval-tip" style="color: #b91c1c;">
              ⚠️ ${err.message || '未能捕捉到声音，请检查麦克风权限后重试。'}
            </div>
            <button class="btn btn-sm btn-secondary" onclick="window.ui.triggerSpeechRecognition('${targetWord}')" style="margin-top: 8px;">
              🔄 重新挑战
            </button>
          `;
        }
      }
    );
  }

  /**
   * 切换下一个发音评测词
   */
  nextSpeechEvalWord() {
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    if (allWords.length === 0) return;
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const nextIdx = (curIdx + Math.floor(Math.random() * 6)) % allWords.length;
    this.openSpeechEvalModal(allWords[nextIdx]);
  }

  /**
   * 打开南蛮商馆
   */
  openShopModal() {
    const modal = document.getElementById('modal-shop');
    if (!modal) return;

    const goldDisplay = document.getElementById('shop-gold-display');
    const hero = window.heroManager ? window.heroManager.hero : { gold: 100, ownedItemIds: [] };
    if (goldDisplay) goldDisplay.textContent = `${hero.gold} 贯`;

    const container = document.getElementById('shop-items-grid');
    const items = typeof SENGOKU_SHOP_ITEMS !== 'undefined' ? SENGOKU_SHOP_ITEMS.filter(i => i.cost > 0) : [];

    if (container && items.length > 0) {
      container.innerHTML = items.map(item => {
        const isConsumable = (item.type === 'consumable');
        const count = isConsumable ? (window.heroManager ? window.heroManager.getItemCount(item.id) : 0) : 0;
        const isOwned = isConsumable ? false : (hero.ownedItemIds ? hero.ownedItemIds.includes(item.id) : false);
        const isEquipped = isConsumable ? false : (hero.equippedWeapon === item.id || hero.equippedArmor === item.id || hero.equippedRelic === item.id || hero.equippedPet === item.id);
        const canAfford = hero.gold >= item.cost;

        // 根据品类与价格计算品质分级
        let tierClass = 'tier-common';
        let tierBadge = '良品';
        let badgeClass = 'badge-common';
        if (item.cost >= 700) {
          tierClass = 'tier-legend';
          tierBadge = '天下至宝';
          badgeClass = 'badge-legend';
        } else if (item.cost >= 300) {
          tierClass = 'tier-epic';
          tierBadge = '大名秘藏';
          badgeClass = 'badge-epic';
        } else if (item.cost >= 60 || isConsumable) {
          tierClass = 'tier-rare';
          tierBadge = isConsumable ? '锦囊法宝' : '名家造物';
          badgeClass = 'badge-rare';
        }

        const halfCost = Math.max(1, Math.round(item.cost * 0.5));
        const canAffordHalf = hero.gold >= halfCost;

        let btnText = `🪙 ${item.cost} 贯 购入 (砍价享5折⚡)`;
        let btnDisabled = !canAffordHalf;
        let btnAction = `window.ui.buyShopItem('${item.id}')`;

        if (isConsumable) {
          btnText = `🪙 ${item.cost} 贯 补充 (砍价享5折⚡)`;
          btnDisabled = !canAffordHalf;
          btnAction = `window.ui.buyShopItem('${item.id}')`;
        } else if (isOwned) {
          if (isEquipped) {
            btnText = '已装备 ⭐';
            btnDisabled = true;
          } else {
            btnText = '装备 ⚡';
            btnDisabled = false;
            btnAction = `window.ui.equipShopItem('${item.id}')`;
          }
        }

        let perkHtml = '';
        if (item.phonicsPerk) {
          perkHtml = `<div style="font-size:11px;color:#0284c7;background:#e0f2fe;padding:3px 6px;border-radius:6px;margin:6px 0;font-weight:700;">⚡ 自然拼读加成: ${item.phonicsPerk}</div>`;
        } else if (item.hearts) {
          perkHtml = `<div style="font-size:11px;color:#dc2626;background:#fee2e2;padding:3px 6px;border-radius:6px;margin:6px 0;font-weight:700;">❤️ 心心生命上限: 扩展至 ${item.hearts} 颗心</div>`;
        }

        return `
          <div class="shop-card ${tierClass} ${isEquipped ? 'equipped' : ''}">
            <div class="shop-item-badge ${badgeClass}">${tierBadge}</div>
            <div class="shop-item-icon-wrap">
              <div class="shop-item-icon">${item.icon}</div>
            </div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            ${perkHtml}
            <div class="shop-item-footer">
              <button class="btn btn-sm ${isEquipped ? 'btn-secondary' : 'btn-primary'}" 
                      ${btnDisabled ? 'disabled' : ''} 
                      onclick="${btnAction}">
                ${btnText}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.remove('hidden');
  }

  closeShopModal() {
    const modal = document.getElementById('modal-shop');
    if (modal) modal.classList.add('hidden');
  }

  buyShopItem(itemId, forceOriginalPrice = false) {
    if (!window.heroManager) return;
    const item = window.heroManager.getShopCatalog().find(i => i.id === itemId);
    if (!item) return;

    if (!forceOriginalPrice) {
      // 开启南蛮商馆 · 掌柜辨词砍价对决！
      this.openBargainModal(item);
      return;
    }

    // 玩家选择直接原价购买
    const res = window.heroManager.buyItem(itemId, 1.0);
    if (res.success) {
      if (window.audioEngine) window.audioEngine.playDrumHit();
      this.showToast(res.msg, '🎁');
      this.openShopModal();
      if (window.gameEngine) window.gameEngine.updateHUDStats();
    } else {
      this.showToast(res.msg, '⚠️');
    }
  }

  equipShopItem(itemId) {
    if (!window.heroManager) return;
    if (window.heroManager.equipItem(itemId)) {
      this.showToast('装备成功！', '⚡');
      this.openShopModal();
    }
  }

  /**
   * 今日主命通关结算弹窗 · 织田信长天守阁军功感状
   */
  showVictoryModal(data) {
    this.lastVictoryData = data;
    this.hasClaimedCurrentVictory = false;

    const modal = document.getElementById('modal-victory');
    if (!modal) return;

    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curSchoolStage = Math.floor(curIdx / 3) + 1;
    const isReplay = !!(data && data.isReplay);
    const stageNum = (data && data.stageNum) || curSchoolStage;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const totalStages = Math.ceil((allWords.length || 178) / 3);
    const curWord = (data && data.words && data.words[0]) || allWords[curIdx] || { unit: 'Unit 1: 结识新朋友' };

    const content = document.getElementById('victory-content');
    if (content) {
      const wordsHtml = (data.words && data.words.length > 0) ? `
        <div class="v-word-box">
          <div class="v-word-title">📖 本关已攻克并参透的秘传词汇（点击听音跟读）：</div>
          <div class="v-words-grid">
            ${data.words.map(w => `
              <div class="v-word-card" onclick="if(window.audioEngine) window.audioEngine.speak('${w.en}')">
                <span class="v-emoji">${w.emoji || '📖'}</span>
                <div style="flex:1; text-align:left;">
                  <span class="v-en">${w.en}</span>
                  <div class="v-cn">${w.cn}</div>
                </div>
                <span class="v-voice">🔊</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : '';

      content.innerHTML = `
        <div class="nobunaga-crest">${isReplay ? '⚡ 天下布武 · 织田信长温故感状 ⚡' : '⚡ 天下布武 · 织田信长军功感状 ⚡'}</div>
        <h2 class="victory-title">${isReplay ? '合战演武 · 温故大捷！' : '今日主命 · 大捷告成！'}</h2>
        <div class="victory-stage-tag">🚩 第 ${stageNum} 关 ${isReplay ? '温故演武大捷 · 保留学校教学主线进度' : `/ 共 ${totalStages} 关 · 【${curWord.unit || 'Unit 1'}】`}</div>
        <p class="victory-sub">
          ${isReplay 
            ? '尾张守织田信长赞道：<strong>“温故而知新，可以为师矣！重温旧阵，剑招更精，赏格分毫不差！”</strong>'
            : '尾张守织田信长大喜：<strong>“真乃不世之奇才！今日之词尽皆参透，封赏必重！”</strong>'}
        </p>
        <div class="victory-rewards-box" id="victory-rewards-box">
          <div class="v-reward-col">
            <div class="v-val">⭐ +${data.totalMerit || 120}</div>
            <div class="v-lbl">受封武勋</div>
          </div>
          <div class="v-reward-col">
            <div class="v-val">🪙 +${data.totalGold || 100} 贯</div>
            <div class="v-lbl">赐封金判</div>
          </div>
          <div class="v-reward-col">
            <div class="v-val">🔥 ${data.streakDays || 1} 天</div>
            <div class="v-lbl">演武连胜</div>
          </div>
        </div>
        ${data.evaluation ? `<div class="victory-eval-badge">🏅 评定军功：${data.evaluation}</div>` : ''}
        ${wordsHtml}
      `;
    }

    // 重置底部按钮为初始领赏状态
    const footer = document.getElementById('victory-footer-actions');
    if (footer) {
      footer.innerHTML = `
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; width:100%;">
          <button class="btn btn-primary" id="btn-victory-claim" onclick="window.ui.claimVictoryReward()" style="font-size:16px; font-weight:900; padding:12px 32px; box-shadow:0 4px 14px rgba(220,38,38,0.4);">
            🎌 领赏入仕 · 晋升太阁官位
          </button>
          <button class="btn btn-secondary" onclick="if(window.honorScroll) window.honorScroll.showCertificateModal(window.ui.lastVictoryData)" style="font-size:15px; font-weight:800; background:#fef3c7; color:#92400e; border:1.5px solid #f59e0b; padding:12px 20px; box-shadow:0 4px 12px rgba(245,158,11,0.25);">
            📜 亲子立志勋绩卡
          </button>
        </div>
      `;
    }

    if (window.audioEngine) window.audioEngine.playPromotionFanfare();
    modal.classList.remove('hidden');
  }

  /**
   * 领赏入仕：将金币与武勋真正入账，触发可能的大名晋升仪式，并呈现进军下一关通道！
   */
  claimVictoryReward() {
    this.hasClaimedCurrentVictory = true;
    const data = this.lastVictoryData || {};
    const gold = data.totalGold || 100;
    const merit = data.totalMerit || 120;
    const isReplay = !!data.isReplay;

    let goldEarned = gold;
    let meritRes = { earned: merit, promoted: false, newRank: null };

    const curIdxBefore = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const prevCleared = window.progressManager ? window.progressManager.getEffectiveClearedStageCount() : 0;
    const curSchoolStageBefore = Math.floor(curIdxBefore / 3) + 1;
    const curStageNum = data.stageNum || curSchoolStageBefore;

    if (window.heroManager) {
      goldEarned = window.heroManager.addGold(gold);
      meritRes = window.heroManager.addMerit(merit);
    }

    // 每日打卡推进（如果为温故模式，绝不推进或回退学校教学主线进度）
    if (window.progressManager) {
      window.progressManager.finishTodayQuest({ isReplay: isReplay, stageNum: curStageNum });
    }

    // 判定是否有新系统解禁
    const newCleared = window.progressManager ? window.progressManager.getEffectiveClearedStageCount() : 0;
    const newlyUnlocked = window.progressManager ? window.progressManager.getNewlyUnlockedFeatures(prevCleared, newCleared) : [];
    if (newlyUnlocked.length > 0) {
      this.pendingUnlockAnimationKeys = newlyUnlocked.map(u => u.key);
    }

    // 动态刷新大本营状态与锁
    this.updateHomeProfile();

    // 更新 HUD
    if (window.gameEngine) {
      window.gameEngine.updateHUDStats();
      window.gameEngine.updateHUDTarget(null);
    }

    // 播放封赏音乐
    if (window.audioEngine) {
      window.audioEngine.playPromotionFanfare();
    }

    // 计算下一关卡信息
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curSchoolStage = Math.floor(curIdx / 3) + 1;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const totalStages = Math.ceil((allWords.length || 178) / 3);

    // 敕封感状：将界面升华为气势恢宏且紧凑的封赏大典
    const content = document.getElementById('victory-content');
    if (content) {
      content.innerHTML = `
        <div class="nobunaga-crest">⚡ 天下布武 · 织田信长官位晋封状 ⚡</div>
        <h2 class="victory-title" style="margin-bottom: 2px;">封赏大典 · 敕命晋阶！</h2>
        <div class="victory-stage-tag">🚩 第 ${curStageNum} 关 大捷达成 ${isReplay ? '· 温故战役功赏全数入账' : `· 准备进军第 ${curSchoolStage + 1} 关`}</div>
        ${(meritRes.promoted && meritRes.newRank) ? `
          <div class="victory-promo-box">
            <div class="promo-badge">🎉 织田信长御命亲授 · 官位晋升 🎉</div>
            <div class="promo-title">${meritRes.newRank.icon} 晋升为【${meritRes.newRank.title}】！</div>
            <div class="promo-house">🏠 赐封居所：${meritRes.newRank.house}</div>
            <div class="promo-desc">“${meritRes.newRank.desc}”</div>
            <div class="promo-bonus">🪙 赐封金判 +${goldEarned} 贯 · ⭐ 受封功勋 +${meritRes.earned}</div>
          </div>
        ` : `
          <div class="victory-claimed-box">
            <div class="claimed-badge">✅ 功赏全数入账！</div>
            <div class="claimed-info">🪙 赐封金判 +${goldEarned} 贯已入宝库 · ⭐ 受封功勋 +${meritRes.earned}</div>
            <div class="claimed-rank">当前太阁品阶：<strong>${meritRes.newRank ? meritRes.newRank.title : '足轻'}</strong> · 军威日盛！</div>
          </div>
        `}
        ${newlyUnlocked.length > 0 ? `
          <div class="victory-unlock-alert-box" style="margin-top: 10px; background: linear-gradient(135deg, rgba(234,179,8,0.25) 0%, rgba(180,83,9,0.2) 100%); border: 1.5px solid #facc15; border-radius: 6px; padding: 10px 14px; text-align: center;">
            <div style="font-size: 15px; font-weight: 900; color: #fef08a; font-family: var(--font-simplified-cn);">
              🔓 织田信长御意破印 · 新殿堂解禁！
            </div>
            <div style="font-size: 13.5px; color: #fff; margin-top: 4px; font-family: var(--font-simplified-cn);">
              恭喜主公！已平定第 ${curStageNum} 关，【${newlyUnlocked.map(u => u.title).join('、')}】封印解除，现已向你敞开！
            </div>
          </div>
        ` : ''}
      `;
    }

    // 底部切换为清晰的行动面板（区分温故出征与学校主线）
    const footer = document.getElementById('victory-footer-actions');
    if (footer) {
      if (isReplay) {
        footer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center;">
            <button class="btn btn-primary" onclick="window.ui.openChaptersFromVictory()" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); font-size: 16px; font-weight: 900; padding: 13px 32px; box-shadow: 0 4px 16px rgba(37,99,235,0.4); width: 88%;">
              🗺️ 返回战役关卡全景（温故其它关卡）
            </button>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; width: 100%;">
              <button class="btn btn-secondary btn-sm" onclick="if(window.honorScroll) window.honorScroll.showCertificateModal(window.ui.lastVictoryData)" style="background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-weight:800;">
                📜 亲子立志勋绩卡
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.replayCurrentStage()">
                🔄 再战第 ${curStageNum} 关
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.proceedToSchoolTarget()">
                🏫 回到学校主线关卡（第 ${curSchoolStage} 关）
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.returnHomeFromVictory()">
                🏠 返回大本营主页
              </button>
            </div>
          </div>
        `;
      } else {
        const nextStageNum = Math.min(totalStages, curSchoolStage + 1);
        footer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center;">
            <button class="btn btn-primary btn-next-stage" onclick="window.ui.proceedToNextStage()" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); font-size: 16px; font-weight: 900; padding: 13px 32px; box-shadow: 0 4px 16px rgba(16,185,129,0.4); width: 88%;">
              ⚔️ 进军下一关（第 ${nextStageNum} 关 / 共 ${totalStages} 关）· 迎战新单词！
            </button>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; width: 100%;">
              <button class="btn btn-secondary btn-sm" onclick="if(window.honorScroll) window.honorScroll.showCertificateModal(window.ui.lastVictoryData)" style="background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-weight:800;">
                📜 亲子立志勋绩卡
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.replayCurrentStage()">
                🔄 再练一次本关（巩固冲三星）
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.openShopFromVictory()">
                🏯 南蛮商馆选购装备
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.returnHomeFromVictory()">
                🏠 返回大本营主页
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.ui.openChaptersFromVictory()">
                🗺️ 战役关卡全景地图
              </button>
            </div>
          </div>
        `;
      }
    }
  }

  returnHomeFromVictory() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');
    this.showHomeScreen();
  }

  /**
   * 进军下一关：加载下一批新单词，重置城堡阵地并即刻开战！
   */
  proceedToNextStage() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');

    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    if (window.gameEngine) {
      window.gameEngine.loadTodayEncounters();
      window.gameEngine.activeEncounter = null;
      window.gameEngine.updateHUDStats();
    }

    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const stageNum = Math.floor(curIdx / 3) + 1;
    if (window.scenicWorld) {
      window.scenicWorld.show(stageNum);
    }
    this.showToast(`🌸 已进军第 ${stageNum} 关！探索清洲城下新名胜！`, '🚩');
  }

  /**
   * 回到学校主线关卡
   */
  proceedToSchoolTarget() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');

    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    if (window.gameEngine) {
      window.gameEngine.loadTodayEncounters();
      window.gameEngine.activeEncounter = null;
      window.gameEngine.updateHUDStats();
    }
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const stageNum = Math.floor(curIdx / 3) + 1;
    if (window.scenicWorld) {
      window.scenicWorld.show(stageNum);
    }
    this.showToast(`🏫 已回到学校主线第 ${stageNum} 关！`, '🚩');
  }

  /**
   * 再次演武本关：重新挑战以巩固生词记忆（绝不倒退学校主线进度）
   */
  replayCurrentStage() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');

    const vp = document.getElementById('game-viewport');
    if (vp) vp.classList.add('hidden');

    const data = this.lastVictoryData || {};
    if (data.isReplay && data.stageNum && data.words) {
      if (window.gameEngine) {
        window.gameEngine.startCustomStage(data.stageNum, data.words, true);
      }
      if (window.scenicWorld) {
        window.scenicWorld.show(data.stageNum);
      }
      this.showToast(`🔄 重新演武第 ${data.stageNum} 关，温故知新！`, '🌸');
    } else {
      const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
      const stageNum = Math.floor(curIdx / 3) + 1;
      if (window.gameEngine) {
        window.gameEngine.loadTodayEncounters();
        window.gameEngine.activeEncounter = null;
        window.gameEngine.updateHUDStats();
      }
      if (window.scenicWorld) {
        window.scenicWorld.show(stageNum);
      }
      this.showToast('🔄 重新巡游本关，温故知新！', '🌸');
    }
  }

  /**
   * 从胜利弹窗跳转南蛮商馆
   */
  openShopFromVictory() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');
    this.openShopModal();
  }

  /**
   * 从胜利弹窗跳转战役关卡全景
   */
  openChaptersFromVictory() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');
    this.openChaptersModal();
  }

  /**
   * 关闭大捷弹窗：若已领赏，则自动平滑切入下一关
   */
  closeVictoryModal() {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.classList.add('hidden');
    if (this.hasClaimedCurrentVictory) {
      this.proceedToNextStage();
    }
  }

  /**
   * 轻量浮层 Toast 提示
   */
  showToast(text, icon = '💡') {
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.innerHTML = `<span style="font-size:18px;">${icon}</span> <span>${text}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 400);
    }, 2200);
  }

  /**
   * 开局顶部地牢阵地横幅：紧凑黑金和风状态条，展示关卡与核心词汇
   */
  showStageIntroBanner(stageNum, targetWords, unitName) {
    const banner = document.getElementById('stage-intro-banner');
    if (!banner) return;

    const wordsHtml = (targetWords || []).map(w => `
      <div class="intro-target-chip" onclick="if(window.audioEngine) window.audioEngine.speak('${w.en.replace(/'/g, "\\'")}')" title="点击跟读标准发音">
        <span class="target-chip-en">${w.emoji || '📖'} ${w.en}</span>
        <span class="target-chip-cn">${w.cn}</span>
        <span class="target-chip-voice">🔊</span>
      </div>
    `).join('');

    banner.innerHTML = `
      <div class="intro-compact-row">
        <span class="intro-stage-pill">🚩 第 ${stageNum} 关 · ${unitName ? unitName.split(':')[0] : '主线'}</span>
        <div class="intro-targets-wrap">
          ${wordsHtml}
        </div>
        <button class="intro-close-btn" onclick="window.ui.hideStageIntroBanner()" title="收起">✕</button>
      </div>
    `;

    banner.classList.remove('hidden');
    requestAnimationFrame(() => {
      banner.classList.add('banner-visible');
    });

    if (this._stageBannerTimeout) clearTimeout(this._stageBannerTimeout);
    this._stageBannerTimeout = setTimeout(() => {
      this.hideStageIntroBanner();
    }, 2400);
  }

  /**
   * 立即隐藏开局横幅（遇敌时毫秒级避让，彻底杜绝遮挡战斗框）
   */
  hideStageIntroBanner() {
    const banner = document.getElementById('stage-intro-banner');
    if (banner && banner.classList.contains('banner-visible')) {
      banner.classList.remove('banner-visible');
      setTimeout(() => banner.classList.add('hidden'), 350);
    }
  }

  /**
   * 渲染局内战国法宝道具栏数量角标
   */
  renderItemDock() {
    if (!window.heroManager) return;
    const items = ['item-riceball', 'item-scroll', 'item-bomb'];
    items.forEach(id => {
      const badge = document.getElementById(`badge-${id}`);
      const btn = document.getElementById(`btn-${id}`);
      const count = window.heroManager.getItemCount(id);
      if (badge) badge.textContent = count;
      if (btn) {
        if (count <= 0) {
          btn.classList.add('disabled');
          btn.style.opacity = '0.45';
        } else {
          btn.classList.remove('disabled');
          btn.style.opacity = '1';
        }
      }
    });
  }

  /**
   * 演武场宝箱：听音破锁挑战
   */
  openChestListeningChallenge(encounter) {
    this.activeChest = encounter;
    const modal = document.getElementById('modal-chest-listen');
    const container = document.getElementById('chest-options-container');
    if (!modal || !container || !encounter || !encounter.wordObj) return;

    const targetWord = encounter.wordObj;

    // 挑选 2 个干扰词
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const candidates = allWords.filter(w => w.en.toLowerCase() !== targetWord.en.toLowerCase());
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const distractor1 = shuffled[0] || { en: 'book', cn: '书' };
    const distractor2 = shuffled[1] || { en: 'pen', cn: '钢笔' };

    const choices = [targetWord, distractor1, distractor2].sort(() => Math.random() - 0.5);

    container.innerHTML = choices.map((c, i) => `
      <button class="chest-option-btn" onclick="window.ui.verifyChestChoice('${c.en.replace(/'/g, "\\'")}')">
        <span><strong style="color:#d97706;margin-right:8px;">${['A', 'B', 'C'][i]}.</strong> ${c.en}</span>
        <span style="font-size:14px;color:#64748b;font-weight:normal;">${c.emoji || ''} ${c.cn}</span>
      </button>
    `).join('');

    modal.classList.remove('hidden');

    // 自动播放一次标准发音
    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  playChestWordAudio() {
    if (this.activeChest && this.activeChest.wordObj && window.audioEngine) {
      window.audioEngine.speak(this.activeChest.wordObj.en);
    }
  }

  verifyChestChoice(chosenEn) {
    if (!this.activeChest || !this.activeChest.wordObj) return;
    const chest = this.activeChest;
    const target = chest.wordObj;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      // 破锁成功！
      if (window.audioEngine) window.audioEngine.playVictoryFanfare();

      const bonusItems = ['item-riceball', 'item-scroll', 'item-bomb'];
      const randomItem = bonusItems[Math.floor(Math.random() * bonusItems.length)];
      const itemName = randomItem === 'item-riceball' ? '🍙 听音饭团' : (randomItem === 'item-scroll' ? '📜 洞察卷轴' : '💣 音节破雷');

      if (window.heroManager) {
        window.heroManager.addGold(50);
        window.heroManager.addMerit(30);
        window.heroManager.addItem(randomItem, 1);
      }

      chest.isDefeated = true;

      if (window.gameEngine) {
        window.gameEngine.spawnExplosion(chest.x, chest.y);
        window.gameEngine.addFloatingText('⭐ 破锁大吉！+50贯 +30武勋', chest.x, chest.y - 40, '#fbbf24');
        window.gameEngine.addFloatingText(`🎁 获得锦囊：${itemName}！`, chest.x, chest.y - 65, '#38bdf8');
        window.gameEngine.onWordCompleted(chest);
        window.gameEngine.updateHUDStats();
      }

      this.closeChestListenModal();
      this.renderItemDock();
      this.showToast(`🎉 宝匣开启！解密成功，获得 50 贯与 ${itemName}！`, '🎁');
    } else {
      // 听音失误
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.7); // 慢速重播帮助理解
      }
      if (window.heroManager) {
        window.heroManager.damageHeart(1);
      }
      if (window.gameEngine) {
        window.gameEngine.updateHUDStats();
        window.gameEngine.addFloatingText('❌ 没听准！再听一遍！(-1 ❤️)', chest.x, chest.y - 30, '#ef4444');
      }
      this.showToast('听音有误，心心-1，点击铜铃仔细再听一遍！', '⚠️');
    }
  }

  closeChestListenModal() {
    const modal = document.getElementById('modal-chest-listen');
    if (modal) modal.classList.add('hidden');
    this.activeChest = null;
    if (window.gameEngine && window.gameEngine.activeEncounter && window.gameEngine.activeEncounter.type === 'chest') {
      window.gameEngine.activeEncounter = null;
      window.gameEngine.currentSpelling = '';
      window.gameEngine.updateHUDTarget(null);
    }
  }

  /**
   * 单词挑战辅助器：优先抽取今日主命/往期温故词汇，强化学习闭环
   */
  getChallengeWord(preferredPool = null) {
    if (preferredPool && preferredPool.length > 0) {
      return preferredPool[Math.floor(Math.random() * preferredPool.length)];
    }
    if (window.progressManager) {
      const quest = window.progressManager.getTodayQuest();
      const allToday = [...(quest.newWords || []), ...(quest.reviewWords || [])];
      if (allToday.length > 0) {
        return allToday[Math.floor(Math.random() * allToday.length)];
      }
    }
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    return allWords[Math.floor(Math.random() * allWords.length)] || { en: 'apple', cn: '苹果', emoji: '🍎' };
  }

  /**
   * 单词干扰项发生器：随机抽取 2 个不重复候选词
   */
  getDistractors(targetWord, count = 2) {
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const candidates = allWords.filter(w => w.en.toLowerCase() !== targetWord.en.toLowerCase());
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * 弹窗 6：南蛮商馆 · 掌柜辨词砍价对决
   */
  openBargainModal(item) {
    if (!item) return;
    const modal = document.getElementById('modal-bargain');
    const content = document.getElementById('bargain-box-content');
    if (!modal || !content) return;

    const targetWord = this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    const discountedPrice = Math.max(1, Math.round(item.cost * 0.5));
    const savedGold = item.cost - discountedPrice;

    this.activeBargain = {
      item,
      wordObj: targetWord,
      discountedPrice,
      savedGold
    };

    const choicesHtml = choices.map((c, i) => `
      <button class="bargain-choice-btn" onclick="window.ui.verifyBargainAnswer('${c.en.replace(/'/g, "\\'")}')">
        <span><strong style="color:#d97706;margin-right:8px;">${['A', 'B', 'C'][i]}.</strong> ${c.emoji || '📖'} ${c.cn}</span>
        <span style="font-size:12px;color:#94a3b8;font-weight:600;">[点击对决]</span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="bargain-merchant-row">
        <div class="merchant-avatar">👳‍♂️</div>
        <div class="merchant-dialog-wrap">
          <div class="merchant-dialog-title">南蛮商馆掌柜 · 今井宗久</div>
          <div class="merchant-dialog-text">
            “少侠好眼光！此物乃西番名匠所铸。若你能听老夫念出这句西番暗号，并选出对应词义，老夫便折价五成（立省 <strong>${savedGold}</strong> 贯）半价让与你！”
          </div>
        </div>
      </div>

      <div class="bargain-deal-tag">
        <div class="deal-item-name">${item.icon} ${item.name}</div>
        <div class="deal-price-compare">
          <span>原价:</span>
          <span class="deal-price-original">🪙 ${item.cost} 贯</span>
          <span>砍价五折:</span>
          <span class="deal-price-discount">⚡ 🪙 ${discountedPrice} 贯</span>
        </div>
      </div>

      <div class="bargain-question-card">
        <div style="font-size:13px;color:#64748b;font-weight:700;">🎧 点击铜铃收听番邦密令发音：</div>
        <button class="bargain-audio-btn" onclick="window.ui.playBargainAudio()">
          <span>🔊 听掌柜发音 (${targetWord.en.length} 字母)</span>
        </button>
        <div style="font-size:14px;color:#334155;font-weight:800;margin-top:4px;">
          请选出与掌柜发音相符的中文词义：
        </div>
        <div class="bargain-options-grid">
          ${choicesHtml}
        </div>
      </div>

      <div class="bargain-footer-actions">
        <button class="btn btn-sm btn-secondary" onclick="window.ui.buyBargainItemOriginalPrice('${item.id}')">
          🪙 不砍了，以原价 ${item.cost} 贯直接买
        </button>
        <button class="btn btn-sm btn-secondary" onclick="window.ui.closeBargainModal()">
          再想想
        </button>
      </div>
    `;

    modal.classList.remove('hidden');

    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  playBargainAudio() {
    if (this.activeBargain && this.activeBargain.wordObj && window.audioEngine) {
      window.audioEngine.speak(this.activeBargain.wordObj.en);
    }
  }

  verifyBargainAnswer(chosenEn) {
    if (!this.activeBargain || !this.activeBargain.wordObj) return;
    const target = this.activeBargain.wordObj;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      // 特产特权分支：若为战国名产，调用跑商专有结算
      if (this.activeBargain.item.id && this.activeBargain.item.id.startsWith('spec-')) {
        const res = window.nanbanTrade ? window.nanbanTrade.buySpecialty(this.activeBargain.item.id, true) : { success: false, msg: '跑商系统未就绪' };
        if (res.success) {
          if (window.audioEngine) window.audioEngine.playVictoryFanfare();
          this.closeBargainModal();
          this.showToast(`🎉 砍价大捷！半价入手【${res.spec.name}】，立省 ${res.saved} 贯！已放入货仓 📦`, '🎁');
          if (window.nanbanTrade) {
            window.nanbanTrade.openTradeModal(window.nanbanTrade.currentTown || 'kiyosu');
          }
          if (window.taikouTown) window.taikouTown.updateHUD();
        } else {
          this.showToast(res.msg, '⚠️');
        }
        return;
      }

      // 普通装备/道具砍价半价买下
      const res = window.heroManager.buyItem(this.activeBargain.item.id, 0.5);
      if (res.success) {
        if (window.audioEngine) window.audioEngine.playVictoryFanfare();
        const itemInfo = this.activeBargain.item;
        this.closeBargainModal();
        this.openShopModal();
        if (window.gameEngine) {
          window.gameEngine.addFloatingText(`🎉 砍价成功！立省 ${res.savedGold} 贯！`, window.gameEngine.player.x, window.gameEngine.player.y - 40, '#10b981');
          window.gameEngine.updateHUDStats();
        }
        this.showToast(`🎉 砍价大捷！五折入手【${itemInfo.name}】，立省 ${res.savedGold} 贯！`, '🎁');
      } else {
        this.showToast(res.msg, '⚠️');
      }
    } else {
      // 答错不扣心心，掌柜亲切解疑
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.75);
      }
      this.showToast(`掌柜摇了摇头：“少侠再听听，${target.en} 是【${target.cn}】哦！可以重试或直接原价买下。”`, '💡');
    }
  }

  buyBargainItemOriginalPrice(itemId) {
    if (itemId && itemId.startsWith('spec-')) {
      const res = window.nanbanTrade ? window.nanbanTrade.buySpecialty(itemId, false) : { success: false, msg: '跑商系统未就绪' };
      if (res.success) {
        if (window.audioEngine) window.audioEngine.playDrumHit();
        this.closeBargainModal();
        this.showToast(`以原价购入【${res.spec.name}】！已放入商运货仓 📦`, '📦');
        if (window.nanbanTrade) {
          window.nanbanTrade.openTradeModal(window.nanbanTrade.currentTown || 'kiyosu');
        }
        if (window.taikouTown) window.taikouTown.updateHUD();
      } else {
        this.showToast(res.msg, '⚠️');
      }
      return;
    }
    this.buyShopItem(itemId, true);
  }

  closeBargainModal() {
    const modal = document.getElementById('modal-bargain');
    if (modal) modal.classList.add('hidden');
    this.activeBargain = null;
  }

  /**
   * 弹窗 7：战国城防 · 暗号石锁机关
   */
  openGatePassphraseModal(gateIdOrGate) {
    const modal = document.getElementById('modal-gate-passphrase');
    const content = document.getElementById('gate-box-content');
    if (!modal || !content) return;

    let gate = null;
    if (typeof gateIdOrGate === 'string' && window.gameEngine && window.gameEngine.map) {
      gate = window.gameEngine.map.gates.find(g => g.id === gateIdOrGate);
    } else if (typeof gateIdOrGate === 'object') {
      gate = gateIdOrGate;
    }

    if (!gate) {
      if (window.gameEngine && window.gameEngine.map && window.gameEngine.map.gates) {
        gate = window.gameEngine.map.gates.find(g => !g.isOpen) || window.gameEngine.map.gates[0];
      }
    }
    if (!gate) return;

    if (gate.isOpen) {
      this.showToast('此城门已破关洞开，可直接通行！', '✨');
      return;
    }

    const targetWord = this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    this.activeGateChallenge = {
      gate,
      wordObj: targetWord
    };

    const choicesHtml = choices.map((c, i) => `
      <button class="bargain-choice-btn" onclick="window.ui.verifyGatePassphrase('${c.en.replace(/'/g, "\\'")}')">
        <span><strong style="color:#0284c7;margin-right:8px;">${['A', 'B', 'C'][i]}.</strong> <strong style="font-size:17px;color:#0f172a;">${c.en}</strong></span>
        <span style="font-size:13px;color:#64748b;">${c.phonics ? c.phonics.join(' · ') : (c.emoji || '')}</span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="gate-icon">🏯</div>
      <div class="gate-title">${gate.name} · 石锁机关</div>
      <div class="gate-desc">
        城防石锁紧闭去路！石壁上刻着一道神秘的中文谜面。<br>
        选出匹配的英文单词暗号即可开启重门，并犒赏 <strong>+20 贯</strong>！
      </div>

      <div class="bargain-question-card">
        <div style="font-size:17px;color:#78350f;font-weight:900;">
          机关谜面：【${targetWord.cn}】 ${targetWord.emoji || ''}
        </div>
        <button class="bargain-audio-btn" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);" onclick="window.ui.playGateAudio()">
          <span>🔊 聆听机关法音提示</span>
        </button>
        <div style="font-size:13px;color:#64748b;font-weight:700;margin-top:4px;">
          请选出对应的英文暗号：
        </div>
        <div class="bargain-options-grid">
          ${choicesHtml}
        </div>
      </div>

      <div class="bargain-footer-actions">
        <button class="btn btn-sm btn-secondary" onclick="window.ui.closeGateModal()">
          稍后再破
        </button>
      </div>
    `;

    modal.classList.remove('hidden');

    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  playGateAudio() {
    if (this.activeGateChallenge && this.activeGateChallenge.wordObj && window.audioEngine) {
      window.audioEngine.speak(this.activeGateChallenge.wordObj.en);
    }
  }

  verifyGatePassphrase(chosenEn) {
    if (!this.activeGateChallenge || !this.activeGateChallenge.wordObj) return;
    const { gate, wordObj } = this.activeGateChallenge;

    if (chosenEn.toLowerCase() === wordObj.en.toLowerCase()) {
      // 暗号破关成功！
      gate.isOpen = true;
      if (window.heroManager) {
        window.heroManager.addGold(20);
        window.heroManager.addMerit(10);
      }
      if (window.audioEngine) {
        window.audioEngine.playVictoryFanfare();
      }
      if (window.gameEngine) {
        window.gameEngine.spawnExplosion(gate.x + gate.w / 2, gate.y + gate.h / 2);
        window.gameEngine.addFloatingText('⭐ 机关解封！+20贯', gate.x + gate.w / 2, gate.y - 20, '#22c55e');
        window.gameEngine.updateHUDStats();
        window.gameEngine.updateHUDTarget(null);
      }
      this.closeGateModal();
      this.showToast(`🎉 暗号匹配大捷！【${gate.name}】已洞开，赏赐 20 贯！`, '🗝️');
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(wordObj.en, 0.7);
      }
      this.showToast(`机关发出轰鸣：“暗号不符！”，此词发音读作【${wordObj.en}】。再试一次！`, '⚠️');
    }
  }

  closeGateModal() {
    const modal = document.getElementById('modal-gate-passphrase');
    if (modal) modal.classList.add('hidden');
    this.activeGateChallenge = null;
  }

  /**
   * 弹窗 8：织田信长天下布武密牒 · 南蛮暗号探案手账 (方向4)
   */
  openNobunagaMissionModal() {
    const modal = document.getElementById('modal-nobunaga-scroll');
    const content = document.getElementById('nobunaga-scroll-content');
    if (!modal || !content) return;

    const hero = window.heroManager ? window.heroManager.hero : { name: '木下藤吉郎', merit: 0, gold: 100 };
    const curRank = window.heroManager ? window.heroManager.getCurrentRank() : { name: '足轻组头', icon: '🔰' };
    const nextRank = window.heroManager ? window.heroManager.getNextRank() : null;

    // 检查大地图上的破译进度
    const steleSolved = window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes
      ? !!window.gameEngine.map.interactiveNodes.find(n => n.type === 'stele' && n.isSolved)
      : false;
    const nanbanSolved = window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes
      ? !!window.gameEngine.map.interactiveNodes.find(n => n.type === 'nanban' && n.isSolved)
      : false;
    const chestSolved = window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes
      ? !!window.gameEngine.map.interactiveNodes.find(n => (n.type === 'chest' || n.type === 'spirit') && n.isSolved)
      : false;
    const allDone = steleSolved && nanbanSolved && chestSolved;

    // 动态生成信长当下的主命密旨
    let mainOrderTitle = '【清洲破译密令 · 探查鸟居古碑】';
    let mainOrderDesc = '主公织田信长密令：那古野与清洲古道旁伫立着散发幽光的西洋鸟居古碑，满朝文武无人识得上面的西方符文，唯有藤吉郎你通晓南蛮言灵！速速前往调查破译，取得古神庇佑与真言秘宝！';
    if (steleSolved && !nanbanSolved) {
      mainOrderTitle = '【南蛮通商密令 · 洽商西洋洋货】';
      mainOrderDesc = '主公织田信长密令：葡萄牙使节与船长抵达东林商馆，运来了大批西洋奇珍！速去商馆用南蛮语言与商队谈判采购，壮大织田家领内物产！';
    } else if (steleSolved && nanbanSolved && !chestSolved) {
      mainOrderTitle = '【草甸寻宝密令 · 探寻密宝与生灵】';
      mainOrderDesc = '主公织田信长密令：听闻城下樱花神木与草甸掩映处留有西洋密宝箱，林中还有通灵小萌狸。速速前去探查开启，收齐今日三件主命！';
    } else if (allDone) {
      mainOrderTitle = '【全境立志大捷 · 升官封赏御旨】';
      mainOrderDesc = '信长抚掌大赞：“藤吉郎真乃吾之福将！言灵古碑已破，南蛮商契已订，秘宝神物尽收！全军上下无不钦佩，速速回营领受官爵封赏！”';
    }

    content.innerHTML = `
      <div class="scroll-seal-header">
        <div class="seal-crest">🏯 織田木瓜紋 · 天下布武</div>
        <div class="seal-badge">朱印密牒</div>
      </div>

      <div class="scroll-title-wrap">
        <h2 class="scroll-title">📜 织田信长天下密牒 · 外交官南蛮手账</h2>
        <div class="scroll-subtitle">—— 唯有通晓万国真言之智将，方能助主公一统乱世！ ——</div>
      </div>

      <!-- 信长主命密旨卡片 -->
      <div class="nobunaga-order-box">
        <div class="nobunaga-avatar-row">
          <div class="nobunaga-avatar-thumb">
            <img src="assets/portraits/nobunaga.jpg" alt="织田信长" onerror="this.outerHTML='<span style=\\'font-size:32px;\\'>⚔️</span>'">
          </div>
          <div>
            <div class="nobunaga-speech-name">尾张大名 · 织田信长亲笔御押：</div>
            <div class="nobunaga-speech-quote">“藤吉郎！全军唯你独具慧眼能破南蛮洋文。办妥此事，官职俸禄重重有赏！”</div>
          </div>
        </div>

        <div class="nobunaga-mission-detail">
          <div class="mission-tag-row">
            <span class="mission-main-tag">${mainOrderTitle}</span>
            <span class="mission-status-pill ${allDone ? 'status-done' : 'status-active'}">
              ${allDone ? '已全数达成 🎉' : '执行中 ⚡'}
            </span>
          </div>
          <div class="mission-desc-text">${mainOrderDesc}</div>
        </div>
      </div>

      <!-- 密牒调查进度三步走 -->
      <div class="mission-steps-grid">
        <div class="mission-step-card ${steleSolved ? 'step-completed' : ''}">
          <div class="step-icon">${steleSolved ? '✅' : '⛩️'}</div>
          <div class="step-info">
            <div class="step-title">调查鸟居古碑</div>
            <div class="step-status">${steleSolved ? '已破译古神真言 (+25贯)' : '西侧鸟居未调查'}</div>
          </div>
        </div>

        <div class="mission-step-card ${nanbanSolved ? 'step-completed' : ''}">
          <div class="step-icon">${nanbanSolved ? '✅' : '⛵'}</div>
          <div class="step-info">
            <div class="step-title">南蛮商贸洽谈</div>
            <div class="step-status">${nanbanSolved ? '已订立商贸洋契 (+30贯)' : '东林商会未造访'}</div>
          </div>
        </div>

        <div class="mission-step-card ${chestSolved ? 'step-completed' : ''}">
          <div class="step-icon">${chestSolved ? '✅' : '🎁'}</div>
          <div class="step-info">
            <div class="step-title">开启草甸秘宝</div>
            <div class="step-status">${chestSolved ? '已探得西洋宝藏 (+30贯)' : '草甸樱花树下未探索'}</div>
          </div>
        </div>
      </div>

      <!-- 藤吉郎功勋官职晋升条 -->
      <div class="rank-promotion-bar">
        <div class="rank-promo-header">
          <span>当前官职：<strong>${curRank.title || curRank.name}</strong> (${hero.merit} 功勋)</span>
          <span>${nextRank ? `晋升【${nextRank.title || nextRank.name}】还需 ${Math.max(0, nextRank.reqMerit - hero.merit)} 功勋` : '已达最高大名位阶！'}</span>
        </div>
        <div class="promo-progress-track">
          <div class="promo-progress-fill" style="width: ${nextRank ? Math.min(100, Math.round((hero.merit / nextRank.reqMerit) * 100)) : 100}%;"></div>
        </div>
      </div>

      <!-- 底部快捷动作 -->
      <div class="scroll-actions-row">
        ${allDone ? `
          <button class="btn btn-primary" style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 14px rgba(16,185,129,0.35);" onclick="window.ui.closeNobunagaModal(); window.ui.claimExplorationPromotion();">
            🏆 呈递密牒 · 举行升官大典！
          </button>
        ` : `
          <button class="btn btn-primary" onclick="window.ui.openChaptersModal(); window.ui.closeNobunagaModal();">
            📖 查阅 178 词南蛮字汇密卷
          </button>
        `}
        <button class="btn btn-secondary" onclick="window.ui.closeNobunagaModal()">
          遵命领旨！
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.playDrumHit();
    }
  }

  closeNobunagaModal() {
    const modal = document.getElementById('modal-nobunaga-scroll');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * 弹窗 8B：鸟居古神碑 · 言灵暗语拓片破译 (方向2 塞尔达式环境解谜)
   */
  openSteleModal(node) {
    const modal = document.getElementById('modal-stele-cipher');
    const content = document.getElementById('stele-cipher-content');
    if (!modal || !content) return;

    if (!node) {
      const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
      node = nodes.find(n => n.type === 'stele') || { type: 'stele', isSolved: false };
    }
    this.activeSteleNode = node;
    const targetWord = this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    this.activeSteleChallenge = {
      wordObj: targetWord,
      node
    };

    // 构造带缺失符文的古碑石刻展示
    const cleanWord = targetWord.en.trim();
    let maskedWord = cleanWord;
    if (cleanWord.length > 2) {
      const maskIdx = Math.floor(cleanWord.length / 2);
      maskedWord = cleanWord.substring(0, maskIdx) + ' ⚡ ' + cleanWord.substring(maskIdx + 1);
    } else {
      maskedWord = cleanWord[0] + ' ⚡';
    }

    const choicesHtml = choices.map((c, i) => `
      <button class="stele-choice-btn" onclick="window.ui.verifySteleCipher('${c.en.replace(/'/g, "\\'")}')">
        <span class="stele-choice-label">${['A', 'B', 'C'][i]}</span>
        <span class="stele-choice-text">${c.emoji || '✨'} ${c.cn} <strong style="color:#0284c7; margin-left:6px; font-family:var(--font-child-en); font-size:19px;">[ ${c.en} ]</strong></span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="stele-rubbing-card">
        <div class="stele-header-row">
          <span class="stele-tag">⛩️ 鸟居古神碑 · 听音解密</span>
          <span class="stele-status-badge">${node.isSolved ? '已破译 ✨' : '探索中 🔍'}</span>
        </div>

        <div class="stele-lore">
          仔细倾听神碑读出的英语单词，选择正确的词语，就能解开宝藏秘密！
        </div>

        <!-- 古碑拓片符文中央区 -->
        <div class="stele-rune-tablet">
          <div class="stele-cipher-word">${maskedWord.toUpperCase()}</div>
          <div class="stele-cipher-hint">（这个单词一共有 ${cleanWord.length} 个字母）</div>
        </div>

        <!-- 听音读音与言灵麦克风跟读按钮 -->
        <div class="stele-audio-wrap" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button class="stele-chant-btn" onclick="window.ui.playSteleAudio()">
            <span>🔊 倾听标准发音</span>
          </button>
          <button class="stele-chant-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706); border-color:#f59e0b; box-shadow:0 4px 14px rgba(245,158,11,0.35);" onclick="window.ui.openVoiceChantModal(window.ui.activeSteleChallenge ? window.ui.activeSteleChallenge.wordObj : null)">
            <span>🎙️ 言灵麦克风跟读</span>
          </button>
        </div>

        <div class="stele-instruction">
          👉 听一听，选择正确的单词：
        </div>

        <div class="stele-choices-grid">
          ${choicesHtml}
        </div>

        <div class="stele-footer">
          <button class="btn btn-secondary" style="font-family:var(--font-child-cn); font-size:16px; font-weight:800; padding:8px 20px; border-radius:12px;" onclick="window.ui.closeSteleModal()">
            返回探索 ➔
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  playSteleAudio() {
    if (this.activeSteleChallenge && this.activeSteleChallenge.wordObj && window.audioEngine) {
      window.audioEngine.speak(this.activeSteleChallenge.wordObj.en);
    }
  }

  verifySteleCipher(chosenEn) {
    if (!this.activeSteleChallenge || !this.activeSteleChallenge.wordObj) return;
    const target = this.activeSteleChallenge.wordObj;
    const node = this.activeSteleChallenge.node;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      if (node) node.isSolved = true;
      if (window.heroManager) {
        window.heroManager.addGold(25);
        window.heroManager.addMerit(15);
      }
      if (window.audioEngine) {
        window.audioEngine.playVictoryFanfare();
      }
      if (window.gameEngine) {
        window.gameEngine.addFloatingText('✨ 神碑真言破译！+25贯 +15功勋', node ? node.x : 270, (node ? node.y : 630) - 40, '#38bdf8');
        window.gameEngine.updateHUDStats();
      }
      if (window.scenicWorld) {
        window.scenicWorld.updateLandmarks();
      }
      this.closeSteleModal();
      this.showToast(`🎉 轰然巨响！鸟居古神碑金光迸发，【${target.en} · ${target.cn}】真言彻底解开！获得 25 贯！`, '⛩️');
      this.checkAllMissionsDone();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.75);
      }
      this.showToast(`古碑发出低沉蜂鸣，符文未能契合：“${target.en} 应为【${target.cn}】”，再听一遍碑文吧！`, '⚡');
    }
  }

  closeSteleModal() {
    const modal = document.getElementById('modal-stele-cipher');
    if (modal) modal.classList.add('hidden');
    this.activeSteleChallenge = null;
  }

  /**
   * 弹窗 8C：南蛮商馆 · 西洋洋商奇珍洽购谈判 (方向4 南蛮贸易)
   */
  openNanbanTradeModal(node) {
    const modal = document.getElementById('modal-nanban-trade');
    const content = document.getElementById('nanban-trade-content');
    if (!modal || !content) return;

    if (!node) {
      const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
      node = nodes.find(n => n.type === 'nanban') || { type: 'nanban', isSolved: false };
    }
    this.activeNanbanNode = node;
    const targetWord = this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    this.activeNanbanChallenge = {
      wordObj: targetWord,
      node
    };

    const choicesHtml = choices.map((c, i) => `
      <button class="trade-choice-btn" onclick="window.ui.verifyNanbanTrade('${c.en.replace(/'/g, "\\'")}')">
        <span class="trade-box-icon">${c.emoji || '📦'}</span>
        <span class="trade-box-info">
          <strong style="color:#f59e0b;font-size:15px;">${c.cn}</strong>
          <span style="font-size:12px;color:#94a3b8;">(${c.en})</span>
        </span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="nanban-treaty-card">
        <div class="treaty-header">
          <span class="treaty-crest">⛵ 西洋葡萄牙商船队 · 奇珍采买会谈</span>
          <span class="treaty-badge">${node.isSolved ? '贸易协定已订立 🤝' : '谈判进行中 📜'}</span>
        </div>

        <div class="nanban-dialogue-wrap">
          <div class="nanban-captain-avatar">🧔🏼‍♂️</div>
          <div class="nanban-speech-bubble">
            “Olá! 亲爱的藤吉郎阁下！我是里斯本来的本托船长。我们运来了火绳铁炮、望远镜与天鹅绒，但我们的货运密契上指明需要调配一样物资，您能听懂是何物吗？”
          </div>
        </div>

        <!-- 听取洋商货契发音 -->
        <div class="treaty-request-card">
          <div class="treaty-sub-title">🎧 点击听取本托船长的西洋求购物资发音：</div>
          <button class="treaty-listen-btn" onclick="window.ui.playNanbanAudio()">
            <span>🔊 倾听西洋物资名 [ ${targetWord.en} ]</span>
          </button>
          <div class="treaty-instruction">
            请从南蛮商队货箱中选出对应的物资交割：
          </div>
        </div>

        <div class="treaty-cargo-grid">
          ${choicesHtml}
        </div>

        <div class="treaty-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.ui.closeNanbanTradeModal()">
            容后再谈
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  playNanbanAudio() {
    if (this.activeNanbanChallenge && this.activeNanbanChallenge.wordObj && window.audioEngine) {
      window.audioEngine.speak(this.activeNanbanChallenge.wordObj.en);
    }
  }

  verifyNanbanTrade(chosenEn) {
    if (!this.activeNanbanChallenge || !this.activeNanbanChallenge.wordObj) return;
    const target = this.activeNanbanChallenge.wordObj;
    const node = this.activeNanbanChallenge.node;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      if (node) node.isSolved = true;
      if (window.heroManager) {
        window.heroManager.addGold(30);
        window.heroManager.addMerit(20);
      }
      if (window.audioEngine) {
        window.audioEngine.playVictoryFanfare();
      }
      if (window.gameEngine) {
        window.gameEngine.addFloatingText('🤝 南蛮贸易达成！+30贯 +20功勋', node ? node.x : 810, (node ? node.y : 630) - 40, '#f59e0b');
        window.gameEngine.updateHUDStats();
      }
      if (window.scenicWorld) {
        window.scenicWorld.updateLandmarks();
      }
      this.closeNanbanTradeModal();
      this.showToast(`🎉 洽谈圆满大成功！本托船长大加赞赏：“Muito bem！正是【${target.en} · ${target.cn}】！” 获得 30 贯与信长功勋！`, '⛵');
      this.checkAllMissionsDone();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.75);
      }
      this.showToast(`船长耸了耸肩：“Non non，货单上写的是【${target.en} · ${target.cn}】才对”，再听一遍吧！`, '⛵');
    }
  }

  closeNanbanTradeModal() {
    const modal = document.getElementById('modal-nanban-trade');
    if (modal) modal.classList.add('hidden');
    this.activeNanbanChallenge = null;
  }

  /**
   * 弹窗 8D：西洋密宝箱 · 听音辨宝寻宝开箱
   */
  openChestModal(node) {
    const modal = document.getElementById('modal-treasure-chest');
    const content = document.getElementById('treasure-chest-content');
    if (!modal || !content) return;

    if (!node) {
      const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
      node = nodes.find(n => n.type === 'chest') || { type: 'chest', isSolved: false };
    }
    this.activeChestNode = node;
    const targetWord = (node && node.wordObj) || this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    this.activeChestChallenge = { wordObj: targetWord, node };

    const choicesHtml = choices.map((c, i) => `
      <button class="chest-choice-btn" onclick="window.ui.verifyChestChoice('${c.en.replace(/'/g, "\\'")}')">
        <span class="chest-choice-label">${['壹', '贰', '叁'][i]}</span>
        <span class="chest-choice-icon">${c.emoji || '🎁'}</span>
        <span class="chest-choice-text">
          <strong style="font-size:15px;color:#0f172a;">${c.cn}</strong>
          <span style="font-size:12px;color:#0369a1;margin-left:4px;">[ ${c.en} ]</span>
        </span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="chest-card">
        <div class="chest-header-row">
          <span class="chest-tag">🎁 尾张古禅秘宝 · 西洋藏金宝箱</span>
          <span class="chest-status-badge">${node.isSolved ? '已开启 ✨' : '待破译 🗝️'}</span>
        </div>

        <div class="chest-lore">
          落樱草甸微光闪烁，静静安置着一只铸铁包金的西洋旅行密箱。<br>
          箱盖铭文依稀回荡着神秘的口令密语，听清读音，选出对应的真言即可开箱获宝！
        </div>

        <div class="chest-audio-wrap">
          <button class="chest-listen-btn" onclick="if(window.audioEngine) window.audioEngine.speak('${targetWord.en.replace(/'/g, "\\'")}')">
            <span>🔊 倾听宝箱秘钥密语 [ ${targetWord.en} ]</span>
          </button>
        </div>

        <div class="chest-instruction">
          🗝️ 选出与密语相符的宝物真言：
        </div>

        <div class="chest-choices-grid">
          ${choicesHtml}
        </div>

        <div class="chest-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.ui.closeChestModal()">
            暂且退下
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  verifyChestChoice(chosenEn) {
    if (!this.activeChestChallenge) return;
    const target = this.activeChestChallenge.wordObj;
    const node = this.activeChestChallenge.node;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      if (node) node.isSolved = true;
      if (window.heroManager) {
        window.heroManager.addGold(30);
        window.heroManager.addMerit(20);
      }
      if (window.gameEngine) {
        window.gameEngine.addFloatingText('🎁 宝箱破启！+30贯 +20功勋！', node ? node.x : 300, (node ? node.y : 600) - 30, '#f59e0b');
        window.gameEngine.updateHUDStats();
      }
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
      }
      if (window.scenicWorld) {
        window.scenicWorld.updateLandmarks();
      }
      this.closeChestModal();
      this.showToast(`✨ 密码契合！宝箱咔哒一声打开，【${target.en} · ${target.cn}】金贯与信长功勋已入囊中！`, '🎁');
      this.checkAllMissionsDone();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.75);
      }
      this.showToast(`宝箱金锁轻轻晃了晃，似乎不是这句密语。“${target.en} 应为【${target.cn}】”，再听一遍吧！`, '🗝️');
    }
  }

  closeChestModal() {
    const modal = document.getElementById('modal-treasure-chest');
    if (modal) modal.classList.add('hidden');
    this.activeChestChallenge = null;
  }

  /**
   * 弹窗 8E：森林友善小生灵 · 小狸猫「信乐」对话
   */
  openSpiritModal(node) {
    const modal = document.getElementById('modal-friendly-spirit');
    const content = document.getElementById('friendly-spirit-content');
    if (!modal || !content) return;

    if (!node) {
      const nodes = (window.gameEngine && window.gameEngine.map && window.gameEngine.map.interactiveNodes) || [];
      node = nodes.find(n => n.type === 'spirit') || { type: 'spirit', isSolved: false };
    }
    this.activeSpiritNode = node;
    const targetWord = (node && node.wordObj) || this.getChallengeWord();
    const distractors = this.getDistractors(targetWord, 2);
    const choices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    this.activeSpiritChallenge = { wordObj: targetWord, node };

    const choicesHtml = choices.map((c, i) => `
      <button class="spirit-choice-btn" onclick="window.ui.verifySpiritChoice('${c.en.replace(/'/g, "\\'")}')">
        <span class="spirit-choice-icon">${c.emoji || '🍃'}</span>
        <span class="spirit-choice-text">
          <strong style="font-size:15px;color:#0f172a;">${c.cn}</strong>
          <span style="font-size:12px;color:#0369a1;margin-left:4px;">[ ${c.en} ]</span>
        </span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="spirit-card">
        <div class="spirit-header-row">
          <span class="spirit-tag">🍃 森林生灵奇遇 · 萌狸「信乐」</span>
          <span class="spirit-status-badge">${node.isSolved ? '已成莫逆之交 💖' : '开心问候中 🐾'}</span>
        </div>

        <div class="spirit-dialogue-wrap">
          <div class="spirit-avatar">🦝</div>
          <div class="spirit-speech-bubble">
            “哇！是藤吉郎哥哥！我今天在神木树洞里捡到了一张发光的西方小卡片，可是我不认得上面的英文字母，你能教教我这是什么意思吗？”
          </div>
        </div>

        <div class="spirit-audio-wrap" style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
          <button class="spirit-listen-btn" onclick="if(window.audioEngine) window.audioEngine.speak('${targetWord.en.replace(/'/g, "\\'")}')">
            <span>🔊 倾听小狸猫读音 [ ${targetWord.en} ]</span>
          </button>
          <button class="spirit-listen-btn" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;" onclick="window.ui.openVoiceChantModal(window.ui.activeSpiritChallenge ? window.ui.activeSpiritChallenge.wordObj : null)">
            <span>🎙️ 念给小狸猫听</span>
          </button>
        </div>

        <div class="spirit-instruction">
          🐾 帮小狸猫找出正确的词义：
        </div>

        <div class="spirit-choices-grid">
          ${choicesHtml}
        </div>

        <div class="spirit-footer">
          <button class="btn btn-sm btn-secondary" onclick="window.ui.closeSpiritModal()">
            下次再聊
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.speak(targetWord.en);
    }
  }

  verifySpiritChoice(chosenEn) {
    if (!this.activeSpiritChallenge) return;
    const target = this.activeSpiritChallenge.wordObj;
    const node = this.activeSpiritChallenge.node;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      if (node) node.isSolved = true;
      if (window.heroManager) {
        window.heroManager.addGold(25);
        window.heroManager.addMerit(20);
        window.heroManager.addItem('item-riceball', 1);
      }
      if (window.gameEngine) {
        window.gameEngine.addFloatingText('💖 信乐欢呼！+25贯 +20功勋 +饭团！', node ? node.x : 550, (node ? node.y : 520) - 30, '#10b981');
        window.gameEngine.updateHUDStats();
      }
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
      }
      if (window.scenicWorld) {
        window.scenicWorld.updateLandmarks();
      }
      this.closeSpiritModal();
      this.showToast(`🦝 信乐开心地跳了起来：“太好了！我学会【${target.cn}】啦！这个好吃的饭团送给藤吉郎哥哥！”`, '💖');
      this.checkAllMissionsDone();
    } else {
      if (window.audioEngine) {
        window.audioEngine.playDrumHit();
        window.audioEngine.speak(target.en, 0.75);
      }
      this.showToast(`信乐晃了晃毛茸茸的小耳朵：“呜呜，好像读得不太对呢，再听一遍教教我好吗？”`, '🦝');
    }
  }

  closeSpiritModal() {
    const modal = document.getElementById('modal-friendly-spirit');
    if (modal) modal.classList.add('hidden');
    this.activeSpiritChallenge = null;
  }

  /**
   * 检查大地图上的信长三大立志主命是否全部圆满达成
   */
  checkAllMissionsDone() {
    if (!window.gameEngine || !window.gameEngine.map || !window.gameEngine.map.interactiveNodes) return;
    const nodes = window.gameEngine.map.interactiveNodes;
    const steleSolved = !!nodes.find(n => n.type === 'stele' && n.isSolved);
    const nanbanSolved = !!nodes.find(n => n.type === 'nanban' && n.isSolved);
    const chestSolved = !!nodes.find(n => (n.type === 'chest' || n.type === 'spirit') && n.isSolved);

    if (steleSolved && nanbanSolved && chestSolved) {
      setTimeout(() => {
        this.claimExplorationPromotion();
      }, 700);
    }
  }

  /**
   * 触发信长公升官封赏与胜利感状仪式
   */
  claimExplorationPromotion() {
    this.closeNobunagaModal();
    const curIdx = window.progressManager ? window.progressManager.getCurrentIndex() : 0;
    const curStage = Math.floor(curIdx / 3) + 1;
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const stageWords = allWords.slice(curIdx, curIdx + 3);

    if (window.audioEngine) {
      window.audioEngine.playVictoryFanfare();
    }

    this.showVictoryModal({
      stageNum: curStage,
      words: stageWords.length > 0 ? stageWords : [
        { en: 'meet', cn: '遇见', emoji: '🤝' },
        { en: 'friend', cn: '朋友', emoji: '🧑‍🤝‍🧑' },
        { en: 'nice', cn: '高兴的', emoji: '😊' }
      ],
      totalMerit: 100,
      totalGold: 120
    });
  }

  // =========================================================================
  // 支柱一：大世界神秘藏宝图与定向寻宝系统 (Treasure Hunt UI)
  // =========================================================================

  openTreasureHuntModal(spot) {
    const modal = document.getElementById('modal-treasure-hunt');
    const content = document.getElementById('treasure-hunt-content');
    if (!modal || !content || !spot) return;

    this.activeTreasureSpot = spot;
    const target = spot.wordObj;
    const distractors = this.getDistractors(target, 2);
    const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

    const choicesHtml = choices.map((c, i) => `
      <button class="chest-choice-btn" onclick="window.ui.verifyTreasureHuntChoice('${c.en.replace(/'/g, "\\'")}')">
        <span class="chest-choice-label">${['甲', '乙', '丙'][i]}</span>
        <span class="chest-choice-icon">${c.emoji || '🎁'}</span>
        <span class="chest-choice-text">
          <strong style="font-size:15px;color:#0f172a;">${c.cn}</strong>
          <span style="font-size:12px;color:#0284c7;margin-left:4px;">[ ${c.en} ]</span>
        </span>
      </button>
    `).join('');

    content.innerHTML = `
      <div class="chest-card" style="border: 2px solid #eab308; background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);">
        <div class="chest-header-row">
          <span class="chest-tag" style="background:#fef08a; color:#854d0e;">✨ 大世界神秘藏宝点 · ${spot.name}</span>
          <span class="chest-status-badge" style="background:#e0f2fe; color:#0369a1;">💎 探寻秘宝</span>
        </div>

        <div class="chest-lore" style="color:#78350f; font-size:14px; margin: 12px 0;">
          📜 羊皮纸线索：<strong>“${spot.clueEn}”</strong><br>
          <span style="color:#92400e; font-size:13px;">（${spot.clueCn}）</span><br>
          在此处地面泛起金光，埋藏着一枚古代航海秘箱！倾听箱锁声纹，找出正确的真言密语！
        </div>

        <div class="chest-audio-wrap" style="text-align:center; margin:14px 0;">
          <button class="chest-listen-btn" style="background:linear-gradient(135deg,#eab308,#ca8a04); border-radius:999px; padding:10px 24px; color:#fff; font-weight:700; border:none; cursor:pointer;" onclick="if(window.audioEngine) window.audioEngine.speak('${target.en.replace(/'/g, "\\'")}')">
            <span>🔊 倾听秘箱声纹真言 [ ${target.en} ]</span>
          </button>
        </div>

        <div class="chest-instruction" style="font-weight:700; color:#0f172a; margin-bottom:8px;">
          🗝️ 选出契合的真言密语解锁宝箱：
        </div>

        <div class="chest-choices-grid" style="display:flex; flex-direction:column; gap:8px;">
          ${choicesHtml}
        </div>

        <div class="chest-footer" style="margin-top:14px; text-align:right;">
          <button class="btn btn-sm btn-secondary" onclick="window.ui.closeTreasureHuntModal()">
            稍后再探
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) window.audioEngine.speak(target.en);
  }

  verifyTreasureHuntChoice(chosenEn) {
    if (!this.activeTreasureSpot) return;
    const spot = this.activeTreasureSpot;
    const target = spot.wordObj;

    if (chosenEn.toLowerCase() === target.en.toLowerCase()) {
      window.treasureHuntSystem.claimSpotTreasure(spot.id);
      if (window.audioEngine) window.audioEngine.playDrumHit();
      if (window.gameEngine) {
        window.gameEngine.addFloatingText(`✨ 秘宝启！+${spot.rewardGold}贯！`, spot.x, spot.y - 30, '#eab308');
        window.gameEngine.updateHUDStats();
      }
      this.showToast(`🎉 破译大捷！获得 ${spot.rewardGold} 贯与专属家具图纸！已收录至宅邸！`, 3500);
      setTimeout(() => {
        this.closeTreasureHuntModal();
      }, 1200);
    } else {
      if (window.audioEngine) window.audioEngine.playMistake();
      this.showToast('🌟 箱锁轻轻转动了一下，再听一次发音试试看吧~', 2500);
    }
  }

  closeTreasureHuntModal() {
    const modal = document.getElementById('modal-treasure-hunt');
    if (modal) modal.classList.add('hidden');
    this.activeTreasureSpot = null;
  }

  openTreasureClueModal() {
    const modal = document.getElementById('modal-treasure-clues');
    const content = document.getElementById('treasure-clues-content');
    if (!modal || !content) return;

    const spot = window.treasureHuntSystem ? window.treasureHuntSystem.getActiveSpot() : null;
    if (!spot) {
      this.showToast('当前暂无可追寻的藏宝线索', 2000);
      return;
    }

    content.innerHTML = `
      <div class="parchment-clue-card" style="background: #fefce8; border: 2px dashed #ca8a04; border-radius: 16px; padding: 20px; box-shadow: 0 8px 24px rgba(202,138,4,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="font-size:16px; font-weight:800; color:#854d0e;">📜 航海藏宝图信件 · 【${spot.name}】</span>
          <span style="font-size:12px; background:#fef08a; padding:3px 8px; border-radius:8px; color:#a16207;">🧭 正在寻觅</span>
        </div>

        <div style="background:#ffffff; border-radius:12px; padding:16px; margin-bottom:14px; border:1px solid #fef08a;">
          <div style="font-size:17px; font-weight:800; color:#0f172a; line-height:1.5;">
            “${spot.clueEn}”
          </div>
          <div style="font-size:14px; color:#475569; margin-top:6px;">
            译文提示：${spot.clueCn}
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-sm btn-primary" onclick="if(window.audioEngine) window.audioEngine.speak('${spot.clueEn.replace(/'/g, "\\'")}')" style="background:#0284c7;">
              🔊 朗读英文寻宝线索
            </button>
          </div>
        </div>

        <div style="font-size:13px; color:#78350f; line-height:1.6;">
          💡 <strong>探险指引</strong>：根据信件提示在清洲城下町和郊外草甸漫步。当接近埋藏宝藏的神秘地点时，地面会泛起金色旋转星光粒子，靠近按 <strong>E</strong> 键即可开挖！
        </div>

        <div style="margin-top:16px; text-align:right;">
          <button class="btn btn-primary" onclick="window.ui.closeTreasureClueModal()" style="background:#ca8a04;">
            立即前往搜寻！
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeTreasureClueModal() {
    const modal = document.getElementById('modal-treasure-clues');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================================
  // 支柱二：藤吉郎小宅邸 / 一夜城建造装扮系统 (Estate UI)
  // =========================================================================

  openEstateModal() {
    const modal = document.getElementById('modal-tokichiro-estate');
    const content = document.getElementById('estate-modal-content');
    if (!modal || !content) return;

    const estate = window.estateSystem ? window.estateSystem.getEstateInfo() : { name: '清洲松林草庵', icon: '🛖' };
    const catalog = window.estateSystem ? window.estateSystem.catalog : [];
    const placed = window.estateSystem ? window.estateSystem.state.placedSlots : {};
    const heroGold = window.heroManager ? window.heroManager.hero.gold : 0;

    // 房间插槽配置
    const slots = [
      { id: 'slot-room-1', name: '书房案头', type: 'room', icon: '🪑' },
      { id: 'slot-room-2', name: '侧室软榻', type: 'room', icon: '🛏️' },
      { id: 'slot-room-3', name: '堂前屏风', type: 'room', icon: '🖼️' },
      { id: 'slot-room-4', name: '壁龛行灯', type: 'room', icon: '🏮' },
      { id: 'slot-garden-1', name: '前庭花圃', type: 'garden', icon: '🌸' },
      { id: 'slot-garden-2', name: '观星露台', type: 'garden', icon: '🔭' }
    ];

    // 渲染和风实景榻榻米居室透视图 (带交互家具与品茶藤吉郎)
    const roomConfig = (window.estateSystem && window.estateSystem.getRoomVisualConfig) ? window.estateSystem.getRoomVisualConfig() : {};
    const roomFurnSpotsHtml = slots.map(slot => {
      const coord = roomConfig[slot.id] || { x: 50, y: 50 };
      const item = placed[slot.id] ? catalog.find(f => f.id === placed[slot.id]) : null;
      if (item) {
        return `
          <div class="room-furn-spot" style="left:${coord.x}%; top:${coord.y}%;" onclick="window.ui.interactRoomFurn('${item.id}', '${slot.name}')" title="点击听读【${item.name} · ${item.en}】">
            <div class="room-furn-item">
              <span class="furn-emoji">${item.emoji}</span>
              <span class="furn-tag">${item.en}</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="room-furn-spot" style="left:${coord.x}%; top:${coord.y}%; opacity:0.65;" title="${coord.placeholder || slot.name}">
            <div class="room-furn-ghost">
              <span style="font-size:16px;">${slot.icon}</span>
              <span style="font-size:9.5px; white-space:nowrap;">${slot.name}</span>
            </div>
          </div>
        `;
      }
    }).join('');

    const tatamiRoomHtml = `
      <div class="estate-tatami-room-stage">
        <div class="room-wall-bg"></div>
        <div class="room-window-view">
          <div class="window-sun"></div>
          <div class="window-sakura-branch">🌸</div>
        </div>
        <div class="room-floor-tatami"></div>

        <!-- 藤吉郎悠闲品茶常驻小人 -->
        <div class="room-hero-tokichiro">
          <div class="tokichiro-speech-bubble" id="estate-tokichiro-bubble">🍵 居所渐具规模，继续立志！</div>
          <div class="tokichiro-sit-sprite">🥷</div>
        </div>

        <!-- 房间家具实景槽位 -->
        ${roomFurnSpotsHtml}
      </div>
    `;

    const slotsHtml = slots.map(slot => {
      const item = placed[slot.id] ? catalog.find(f => f.id === placed[slot.id]) : null;
      return `
        <div class="estate-slot-card" style="background:#f8fafc; border:2px dashed ${item ? '#10b981' : '#cbd5e1'}; border-radius:14px; padding:10px; text-align:center; min-width:90px; flex:1;">
          <div style="font-size:11px; color:#64748b; font-weight:700;">${slot.name}</div>
          <div style="font-size:26px; margin:6px 0;">${item ? item.emoji : slot.icon}</div>
          <div style="font-size:12px; font-weight:800; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${item ? item.name : '（空位）'}
          </div>
          ${item ? `
            <div style="font-size:10px; color:#0284c7; cursor:pointer;" onclick="if(window.audioEngine) window.audioEngine.speak('${item.en}')">
              🔊 [ ${item.en} ]
            </div>
            <button style="margin-top:4px; font-size:10px; border:none; background:#fee2e2; color:#ef4444; border-radius:4px; padding:2px 6px; cursor:pointer;" onclick="window.ui.removeEstateItem('${slot.id}')">
              收起
            </button>
          ` : `
            <div style="font-size:10px; color:#94a3b8;">待布置</div>
          `}
        </div>
      `;
    }).join('');

    // 家具图鉴与购置列表
    const catalogHtml = catalog.map(item => {
      const isUnlocked = window.estateSystem ? window.estateSystem.isUnlocked(item.id) : false;
      return `
        <div class="estate-furn-row">
          <div class="estate-furn-info">
            <span class="estate-furn-emoji">${item.emoji}</span>
            <div class="estate-furn-texts">
              <div class="estate-furn-name-row">
                <span class="estate-furn-name">${item.name}</span>
                <span class="estate-furn-en">[ ${item.en} ]</span>
                <span class="estate-furn-phonetic">${item.phonetic}</span>
              </div>
              <div class="estate-furn-desc">${item.desc}</div>
            </div>
          </div>
          <div class="estate-furn-actions">
            <button class="btn btn-sm btn-secondary" onclick="if(window.audioEngine) window.audioEngine.speak('${item.en}')" title="听读英文发音">
              🔊
            </button>
            ${isUnlocked ? `
              <select class="estate-furn-select" onchange="window.ui.placeEstateItem(this.value, '${item.id}')">
                <option value="">布置到...</option>
                ${slots.filter(s => s.type === item.slotType).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            ` : `
              <button class="btn btn-sm btn-primary estate-buy-btn" onclick="window.ui.buyEstateFurniture('${item.id}')">
                🪙 ${item.cost} 贯购置
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="estate-container">
        <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#0284c7,#0369a1); color:#fff; border-radius:16px; padding:16px 20px; margin-bottom:16px;">
          <div>
            <div style="font-size:18px; font-weight:900;">${estate.icon} ${estate.name}</div>
            <div style="font-size:12px; opacity:0.9; margin-top:2px;">${estate.desc}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; opacity:0.8;">持有资金</div>
            <div style="font-size:18px; font-weight:900;">🪙 ${heroGold} 贯</div>
          </div>
        </div>

        <!-- 和风实景房间透视图 -->
        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          🏡 居所实景透视图（点击房间内的家具听音互动）：
        </div>
        ${tatamiRoomHtml}

        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          🗄️ 居所空间与陈设插槽：
        </div>
        <div style="display:flex; gap:8px; overflow-x:auto; margin-bottom:20px;">
          ${slotsHtml}
        </div>

        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          🪑 西洋南蛮洋物家具订购工坊（点击 🔊 听音，赚取金判购置心仪家具）：
        </div>
        <div class="estate-catalog-list">
          ${catalogHtml}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  interactRoomFurn(furnId, slotName) {
    if (!window.estateSystem) return;
    const item = window.estateSystem.catalog.find(f => f.id === furnId);
    if (!item) return;

    if (window.audioEngine) {
      window.audioEngine.speak(item.en);
      if (typeof window.audioEngine.playVoiceRipple === 'function') {
        window.audioEngine.playVoiceRipple();
      }
    }

    const bubble = document.getElementById('estate-tokichiro-bubble');
    if (bubble) {
      bubble.textContent = `✨ 这是我的【${item.name} · ${item.en}】！`;
      bubble.style.transform = 'translateX(-50%) scale(1.1)';
      bubble.style.borderColor = '#f59e0b';
      setTimeout(() => {
        bubble.textContent = '🍵 居所渐具规模，继续立志！';
        bubble.style.transform = 'translateX(-50%) scale(1)';
        bubble.style.borderColor = '#fed7aa';
      }, 3000);
    }
    this.showToast(`✨【${item.name} · ${item.en}】发音：${item.phonetic}`, item.emoji || '🪑');
  }

  buyEstateFurniture(furnId) {
    if (!window.estateSystem) return;
    const res = window.estateSystem.buyFurniture(furnId);
    this.showToast(res.msg, 2500);
    if (res.success) {
      if (window.audioEngine) window.audioEngine.playKobanCollect();
      if (window.gameEngine) window.gameEngine.updateHUDStats();
      this.openEstateModal();
    }
  }

  placeEstateItem(slotId, furnId) {
    if (!slotId || !furnId || !window.estateSystem) return;
    window.estateSystem.placeFurniture(slotId, furnId);
    this.showToast('✨ 家具布置妥当，房间焕然一新！', 2000);
    this.openEstateModal();
  }

  removeEstateItem(slotId) {
    if (!window.estateSystem) return;
    window.estateSystem.removeFurniture(slotId);
    this.openEstateModal();
  }

  closeEstateModal() {
    const modal = document.getElementById('modal-tokichiro-estate');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  // =========================================================================
  // 支柱三：信长智将主线危机小剧场 (Taikou Story Theater UI)
  // =========================================================================

  openTheaterModal(storyId = null) {
    const modal = document.getElementById('modal-taikou-theater');
    const content = document.getElementById('theater-modal-content');
    if (!modal || !content || !window.theaterSystem) return;

    if (!storyId || storyId === 'catalog') {
      this.renderTheaterCatalog('ch1');
    } else {
      const res = window.theaterSystem.startStory(storyId);
      if (!res) {
        this.renderTheaterCatalog('ch1');
      } else {
        this.renderTheaterStep(res.story, res.step);
      }
    }
    modal.classList.remove('hidden');
  }

  renderTheaterCatalog(chapterId = 'ch1') {
    const content = document.getElementById('theater-modal-content');
    if (!content || !window.theaterSystem) return;

    const chapter = (window.theaterSystem.chapters && window.theaterSystem.chapters.find(c => c.id === chapterId)) || {
      id: 'ch1',
      title: '第一篇章 · 尾张微末篇',
      timeSpan: '1554 — 1560',
      subtitle: '草鞋侍从的自驱萌芽：以过人见识与机智，在尾张初露峥嵘',
      badge: '尾张风云 🌸'
    };

    const stories = window.theaterSystem.getChapterStories(chapterId);
    const completedCount = stories.filter(s => window.theaterSystem.isCompleted(s.id)).length;

    const cardsHtml = stories.map(s => {
      const isDone = window.theaterSystem.isCompleted(s.id);
      const wordsHtml = (s.coreWords || []).map(w => `<span class="episode-word-pill">${w}</span>`).join('');
      return `
        <div class="theater-episode-card ${isDone ? 'is-done' : ''}">
          <div>
            <div class="episode-card-top">
              <span class="episode-tag-num">第 ${s.episodeNum || 1} 回目</span>
              <span class="episode-status-badge ${isDone ? 'badge-done' : 'badge-pending'}">
                ${isDone ? '✅ 已通达参透' : '⏳ 待演武智破'}
              </span>
            </div>
            <div class="episode-title">${s.bannerIcon || '📜'} ${s.title}</div>
            <div class="episode-desc">${s.subtitle}</div>
            <div class="episode-words-wrap">
              ${wordsHtml}
            </div>
          </div>
          <div class="episode-card-bottom">
            <div class="episode-rewards">⭐ +${s.rewardMerit} 武勋 · 🪙 +${s.rewardGold} 贯</div>
            <button class="btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}"
              onclick="window.ui.openTheaterModal('${s.id}')" style="font-weight:800; font-size:12px; padding:5px 12px;">
              ${isDone ? '🔄 再次重温' : '⚔️ 智谋入阵'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="theater-catalog-wrap">
        <div class="theater-chapter-header">
          <div class="theater-chapter-info">
            <div class="theater-chapter-title">
              <span>🎭 ${chapter.title}</span>
              <span class="theater-chapter-timespan">${chapter.timeSpan}</span>
            </div>
            <div class="theater-chapter-sub">${chapter.subtitle}</div>
          </div>
          <div>
            <div class="theater-progress-badge">
              参悟进度：${completedCount} / ${stories.length} 回
            </div>
          </div>
        </div>

        <div class="theater-episode-grid">
          ${cardsHtml}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #e2e8f0; margin-top:8px;">
          <div style="font-size:12px; color:#64748b;">
            💡 历史回响：以语言洞察局势，用智谋破解死局！无战斗不刷怪！
          </div>
          <button class="btn btn-secondary" onclick="window.ui.closeTheaterModal()" style="font-weight:700; font-size:13px;">
            ✕ 暂退演武堂
          </button>
        </div>
      </div>
    `;
  }

  renderTheaterStep(story, step) {
    const content = document.getElementById('theater-modal-content');
    if (!content || !step) return;

    if (step.action === 'finish') {
      if (window.theaterSystem) {
        window.theaterSystem.finishCurrentStory();
      }
      const nextStoryId = window.theaterSystem ? window.theaterSystem.getNextStoryId(story.id) : null;
      const nextStory = nextStoryId ? window.theaterSystem.getStoryById(nextStoryId) : null;

      content.innerHTML = `
        <div class="theater-card" style="text-align:center; padding:18px 12px;">
          <div style="font-size:38px; margin-bottom:6px;">🏆</div>
          <div style="font-size:11.5px; font-weight:800; color:#b45309; margin-bottom:4px;">${story.bannerIcon || '📜'} 第 ${story.episodeNum || 1} 回目大功成</div>
          <h3 style="font-size:20px; color:#b91c1c; font-weight:900; margin-bottom:10px;">${story.title} · 圆满大捷！</h3>
          
          <div style="display:flex; gap:12px; align-items:center; background:#fffbeb; border:1px solid #fef3c7; border-radius:14px; padding:12px; margin-bottom:14px; text-align:left;">
            <img src="${step.portrait || 'assets/portraits/tokichiro.jpg'}" style="width:52px; height:52px; border-radius:12px; border:2px solid #b45309; object-fit:cover; flex-shrink:0;">
            <div style="min-width:0;">
              <div style="font-size:13px; font-weight:800; color:#0f172a;">${step.speaker} · <span style="color:#64748b; font-weight:600; font-size:11.5px;">${step.role}</span></div>
              <div style="font-size:13.5px; color:#334155; line-height:1.45; margin-top:4px;">${step.text}</div>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:10px 14px; margin-bottom:16px;">
            <div style="font-weight:800; color:#b91c1c; font-size:13px;">⭐ +${story.rewardMerit} 武勋</div>
            <div style="font-weight:800; color:#b45309; font-size:13px;">🪙 +${story.rewardGold} 贯</div>
            <div style="font-weight:800; color:#15803d; font-size:13px;">🎖️ 【${story.rewardTitle}】</div>
          </div>

          <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
            ${nextStory ? `
              <button class="btn btn-primary" onclick="window.ui.openTheaterModal('${nextStory.id}')" style="padding:9px 18px; font-weight:900; font-size:13.5px;">
                ⚔️ 进军第 ${nextStory.episodeNum} 回：${nextStory.title.split('·')[1] || nextStory.title} ➡️
              </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="window.ui.renderTheaterCatalog('${story.chapterId || 'ch1'}')" style="padding:9px 16px; font-weight:800; font-size:13px;">
              📜 返回剧目总目
            </button>
            <button class="btn btn-secondary" onclick="window.ui.closeTheaterModal()" style="padding:9px 16px; font-weight:800; font-size:13px;">
              领旨谢恩 · 返回大地图
            </button>
          </div>
        </div>
      `;
      return;
    }

    let interactiveHtml = '';
    if (step.action === 'quiz') {
      const optsHtml = step.options.map(opt => `
        <button class="theater-opt-btn" onclick="window.ui.verifyTheaterChoice(${opt.correct}, '${opt.en.replace(/'/g, "\\'")}')">
          <span style="font-size:18px;">${opt.emoji}</span>
          <span style="color:#0f172a;">${opt.cn}</span>
          <span class="theater-opt-word">[ ${opt.en} ]</span>
        </button>
      `).join('');

      interactiveHtml = `
        <div class="theater-quiz-card">
          <div class="theater-quiz-prompt">
            <span>🎯</span>
            <span>${step.prompt}</span>
          </div>
          <div class="theater-opts-list">
            ${optsHtml}
          </div>
          <div class="theater-quiz-footer">
            <div style="font-size:12px; color:#64748b;">
              💡 纯正发音指引，轻触选项直接破局
            </div>
            <button class="btn btn-sm btn-secondary" onclick="if(window.audioEngine) window.audioEngine.speak('${step.targetWord}')">
              🔊 倾听目标词汇 [ ${step.targetWord} ]
            </button>
          </div>
        </div>
      `;
    } else {
      interactiveHtml = `
        <div style="margin-top:14px; text-align:right;">
          <button class="btn btn-primary" onclick="window.ui.advanceTheaterStep()" style="padding:10px 28px; font-weight:800;">
            继续对话 ➡️
          </button>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="theater-stage">
        <div class="theater-stage-header">
          <div class="theater-stage-titles">
            <span class="theater-ep-pill">第 ${story.episodeNum || 1} 回目</span>
            <span class="theater-title-text">${story.bannerIcon || '📜'} ${story.title}</span>
          </div>
          <button class="theater-btn-catalog btn btn-xs btn-secondary" onclick="window.ui.renderTheaterCatalog('${story.chapterId || 'ch1'}')">
            📜 剧目表
          </button>
        </div>

        <div class="theater-subtitle" style="font-size:12px; color:#64748b; margin-bottom:8px; line-height:1.4;">
          ${story.subtitle}
        </div>

        <div class="theater-speaker-layout">
          <div class="theater-speaker-badge">
            <img src="${step.portrait || 'assets/portraits/tokichiro.jpg'}" class="theater-speaker-img">
            <div class="theater-speaker-meta">
              <span class="theater-speaker-name">${step.speaker}</span>
              <span class="theater-speaker-role">${step.role}</span>
            </div>
          </div>
          <div class="theater-speech-bubble">
            <div class="theater-speech-text">
              ${step.text}
            </div>
          </div>
        </div>

        ${interactiveHtml}
      </div>
    `;

    if (step.action === 'quiz' && window.audioEngine) {
      window.audioEngine.speak(step.targetWord);
    }
  }

  verifyTheaterChoice(isCorrect, optEn) {
    if (!window.theaterSystem) return;
    if (isCorrect) {
      if (window.audioEngine) {
        window.audioEngine.speak(optEn);
        window.audioEngine.playDrumHit();
      }
      this.showToast('🎯 智将妙算！破译完全正确！信长公大喜！', 2000);
      setTimeout(() => {
        this.advanceTheaterStep();
      }, 700);
    } else {
      if (window.audioEngine) window.audioEngine.playMistake();
      this.showToast('🌟 信长公微微沉吟：“此意似乎欠妥，藤吉郎再深思一番！”', 2500);
    }
  }

  advanceTheaterStep() {
    if (!window.theaterSystem) return;
    const res = window.theaterSystem.nextStep();
    if (!res) return;
    if (res.isFinished) {
      if (window.gameEngine) window.gameEngine.updateHUDStats();
      this.renderTheaterStep(res.story, {
        action: 'finish',
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '智计出世',
        text: '藤吉郎机敏应对，圆满破局！不仅赢得信长公与诸将叹服，更为织田家立下赫赫智勋！'
      });
    } else {
      this.renderTheaterStep(window.theaterSystem.currentStory, res.step);
    }
  }

  closeTheaterModal() {
    const modal = document.getElementById('modal-taikou-theater');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================================
  // 支柱四：万国洋物大绘卷 · 词汇图鉴与令旗系统 (Lexicon Scrolls UI)
  // =========================================================================

  openLexiconModal() {
    const modal = document.getElementById('modal-lexicon-scrolls');
    const content = document.getElementById('lexicon-modal-content');
    if (!modal || !content || !window.lexiconSystem) return;

    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    const standards = window.lexiconSystem.standards;
    const equipped = window.lexiconSystem.getEquippedStandard();
    const mastered = window.lexiconSystem.state.masteredWords;

    // 令旗陈列架
    const standardsHtml = standards.map(std => {
      const isUnlocked = window.lexiconSystem.state.unlockedStandardIds.includes(std.unitId);
      const isEquipped = equipped.unitId === std.unitId;
      return `
        <div style="background:#ffffff; border:2px solid ${isEquipped ? '#0284c7' : '#e2e8f0'}; border-radius:12px; padding:10px; min-width:140px; flex:1; text-align:center;">
          <div style="font-size:24px;">${std.icon}</div>
          <div style="font-size:12px; font-weight:800; color:#0f172a; margin:4px 0;">${std.standardName}</div>
          <div style="font-size:10px; color:#64748b; line-height:1.4;">${std.desc}</div>
          <div style="margin-top:8px;">
            ${isEquipped ? `
              <span style="font-size:11px; font-weight:800; color:#0284c7;">🚩 佩戴中</span>
            ` : isUnlocked ? `
              <button class="btn btn-sm btn-primary" onclick="window.ui.equipLexiconStandard(${std.unitId})" style="padding:2px 10px; font-size:11px;">
                佩戴
              </button>
            ` : `
              <span style="font-size:10px; color:#94a3b8;">🔒 攻克Unit${std.unitId}解锁</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // 取前 12 个重点词汇做精美卡片呈现
    const sampleWords = allWords.slice(0, 15);
    const wordsHtml = sampleWords.map(w => {
      const trivia = window.lexiconSystem.getWordTrivia(w.en);
      return `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:28px;">${w.emoji || '📖'}</span>
              <button class="btn btn-sm btn-secondary" onclick="if(window.audioEngine) window.audioEngine.speak('${w.en}')" style="padding:4px 8px;">
                🔊
              </button>
            </div>
            <div style="font-size:17px; font-weight:900; color:#0f172a; margin-top:6px;">
              ${w.en}
            </div>
            <div style="font-size:13px; font-weight:700; color:#0369a1;">
              ${w.cn}
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">
              ${w.phonetic || ''}
            </div>
          </div>
          <div style="font-size:11px; color:#78350f; background:#fefce8; border-radius:8px; padding:6px 8px; margin-top:8px; line-height:1.4;">
            📜 <strong>战国秘闻</strong>：${trivia}
          </div>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="lexicon-scrolls-wrap" style="max-height:75vh; overflow-y:auto;">
        <div style="background:linear-gradient(135deg,#78350f,#451a03); color:#fef3c7; border-radius:16px; padding:16px 20px; margin-bottom:16px; border:2px solid #ca8a04;">
          <div style="font-size:18px; font-weight:900;">📜 太阁万国洋物大绘卷 · 言灵军阵令旗</div>
          <div style="font-size:12px; opacity:0.85; margin-top:4px;">
            每一个参透的西洋词汇，皆凝结为大名绘卷神物！集齐单元令旗，插在藤吉郎身后引领先锋！
          </div>
        </div>

        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          🚩 战国言灵军阵令旗（佩戴后可在大世界与宅邸头顶飘扬）：
        </div>
        <div style="display:flex; gap:10px; overflow-x:auto; margin-bottom:20px;">
          ${standardsHtml}
        </div>

        <div style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          📖 万国洋物秘传词卡（点击 🔊 听纯正发音，查阅战国趣味典故）：
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;">
          ${wordsHtml}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  equipLexiconStandard(unitId) {
    if (!window.lexiconSystem) return;
    window.lexiconSystem.equipStandard(unitId);
    this.showToast('🚩 言灵令旗佩戴成功！战国风林火山气势如虹！', 2000);
    this.openLexiconModal();
  }

  closeLexiconModal() {
    const modal = document.getElementById('modal-lexicon-scrolls');
    if (modal) modal.classList.add('hidden');
  }

  // =========================================================================
  // 自然拼读“言灵声波共鸣”口语麦克风 (Voice Chant Speech Recognition)
  // =========================================================================

  openVoiceChantModal(wordObj) {
    if (!wordObj) {
      wordObj = this.getChallengeWord ? this.getChallengeWord() : { en: 'desk', cn: '书案/书桌', phonetic: '/desk/', emoji: '🪵' };
    }
    this.activeVoiceChantWord = wordObj;

    const modal = document.getElementById('modal-voice-chant');
    const content = document.getElementById('voice-chant-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="voice-chant-card">
        <div class="voice-chant-header">🎙️ 自然拼读 · 言灵声波共鸣评测</div>
        
        <div class="voice-target-word-wrap">
          <div class="voice-target-en">${wordObj.en}</div>
          <div class="voice-target-phonetic">${wordObj.phonetic || ''}</div>
          <div class="voice-target-cn">${wordObj.emoji || '✨'} ${wordObj.cn}</div>
        </div>

        <div style="margin-bottom:14px;">
          <button class="btn btn-secondary btn-sm" onclick="if(window.audioEngine) window.audioEngine.speak('${wordObj.en.replace(/'/g, "\\'")}')" style="font-weight:700;">
            🔊 倾听示范发音
          </button>
        </div>

        <div class="mic-btn-container">
          <button class="btn-voice-mic" id="btn-voice-mic-main" onclick="window.ui.toggleVoiceChant()" title="点击开始麦克风跟读">
            <span class="mic-icon-large">🎙️</span>
            <span class="mic-sub-text" id="voice-mic-label">点击跟读</span>
          </button>
          <div class="mic-ripple-ring" id="voice-ripple-ring"></div>
        </div>

        <div class="voice-status-feedback" id="voice-status-feedback">
          点击上方麦克风，大声读出【${wordObj.en}】！
        </div>

        <div style="display:flex; justify-content:center; gap:10px; margin-top:16px; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.ui.simulateVoiceMatch(100)" style="font-size:12px; background:#f0fdf4; color:#15803d; border-color:#86efac; font-weight:700;">
            🎯 模拟满分跟读测试
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.ui.closeVoiceChantModal()">
            完成返回
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.speak(wordObj.en);
    }
  }

  toggleVoiceChant() {
    if (!this.activeVoiceChantWord || !window.audioEngine) return;
    const word = this.activeVoiceChantWord.en;
    const btn = document.getElementById('btn-voice-mic-main');
    const label = document.getElementById('voice-mic-label');
    const feedback = document.getElementById('voice-status-feedback');

    if (window.audioEngine.isListening) {
      return;
    }

    window.audioEngine.recognizeSpeech(
      word,
      () => {
        // onStart
        if (btn) btn.classList.add('is-recording');
        if (label) label.textContent = '倾听中...';
        if (feedback) feedback.innerHTML = '<span style="color:#dc2626;">🔴 麦克风已开启，请大声读出来...</span>';
      },
      (res) => {
        // onResult
        if (btn) btn.classList.remove('is-recording');
        if (label) label.textContent = '再读一次';
        const evalRes = res.evalResult;
        if (evalRes.matched) {
          if (window.audioEngine && typeof window.audioEngine.playVoiceRipple === 'function') {
            window.audioEngine.playVoiceRipple();
          }
          if (window.heroManager) {
            window.heroManager.addGold(15);
            window.heroManager.addMerit(10);
          }
          if (window.gameEngine) {
            window.gameEngine.updateHUDStats();
          }
          if (feedback) {
            feedback.innerHTML = `<span style="color:#15803d; font-weight:800;">🎉 ${evalRes.title}！得分：${evalRes.score}分！+15贯 +10功勋！</span>`;
          }
          this.showToast(`🎉 言灵共鸣成功！发音【${res.spoken}】极纯正！`, '🎙️');
        } else {
          if (window.audioEngine) window.audioEngine.playMistake();
          if (feedback) {
            feedback.innerHTML = `<span style="color:#b45309;">⚡ ${evalRes.title}：识别为【${res.spoken}】。${evalRes.message}</span>`;
          }
        }
      },
      (err) => {
        // onError
        if (btn) btn.classList.remove('is-recording');
        if (label) label.textContent = '重试';
        if (feedback) {
          feedback.innerHTML = `<span style="color:#64748b;">💡 ${err.message || '未能识别，请靠近麦克风或点击模拟测试'}</span>`;
        }
      }
    );
  }

  simulateVoiceMatch(score = 100) {
    if (!this.activeVoiceChantWord) return;
    const word = this.activeVoiceChantWord;
    const btn = document.getElementById('btn-voice-mic-main');
    const label = document.getElementById('voice-mic-label');
    const feedback = document.getElementById('voice-status-feedback');

    if (btn) btn.classList.remove('is-recording');
    if (label) label.textContent = '再读一次';

    if (window.audioEngine && typeof window.audioEngine.playVoiceRipple === 'function') {
      window.audioEngine.playVoiceRipple();
    }
    if (window.heroManager) {
      window.heroManager.addGold(15);
      window.heroManager.addMerit(10);
    }
    if (window.gameEngine) {
      window.gameEngine.updateHUDStats();
    }
    if (feedback) {
      feedback.innerHTML = `<span style="color:#15803d; font-weight:800;">🎉 言灵大成功 · 纯正地道！得分：${score}分！赐封 +15贯 +10功勋！</span>`;
    }
    this.showToast(`🎉 言灵声波共鸣！【${word.en}】发音满分！+15贯 +10功勋！`, '🎙️');
  }

  closeVoiceChantModal() {
    const modal = document.getElementById('modal-voice-chant');
    if (modal) modal.classList.add('hidden');
    this.activeVoiceChantWord = null;
  }
}

window.ui = new UIManager();
