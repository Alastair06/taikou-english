/**
 * 太阁英语立志传 · 每日进度与艾宾浩斯循环温故引擎 (Progress & Spaced Repetition)
 * - 每天 3 个新词严格按课本顺序推进
 * - 智能调取 3~4 个往期复习词（循环温故、专攻弱项）
 * - 家长专属进度滑块调节（与学校教学无缝对齐）
 * - 战国出勤打卡花押与连续坚持天数
 */

class ProgressManager {
  constructor() {
    this.storageKey = 'taikou_english_progress_v2';
    this.featureUnlocks = {
      parent:   { minStage: 0, title: '教学对齐', hint: '始终可用', icon: '📌' },
      lexicon:  { minStage: 1, title: '词汇图鉴', hint: '第 1 关揭封', icon: '📜' },
      chapters: { minStage: 1, title: '攻城关卡', hint: '第 1 关揭封', icon: '🏯' },
      cards:    { minStage: 2, title: '卡片录',   hint: '第 2 关揭封', icon: '🎴' },
      town:     { minStage: 3, title: '城下町',   hint: '第 3 关揭封', icon: '🏮' },
      clues:    { minStage: 4, title: '寻宝',     hint: '第 4 关揭封', icon: '🗺️' },
      estate:   { minStage: 5, title: '宅邸',     hint: '第 5 关揭封', icon: '🏡' },
      speech:   { minStage: 6, title: '发音演武', hint: '第 6 关揭封', icon: '🎙️' },
      officer:  { minStage: 7, title: '武将列传', hint: '第 7 关揭封', icon: '📜' },
      hyojo:    { minStage: 8, title: '大名评定', hint: '第 8 关揭封', icon: '🏯' },
      trade:    { minStage: 9, title: '特产商行', hint: '第 9 关揭封', icon: '🚢' },
      theater:  { minStage: 1, title: '战役',     hint: '即刻出征', icon: '⚔️' },
      overworld:{ minStage: 10, title: '天下舆图', hint: '第 10 关揭封', icon: '🗺️' }
    };
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      currentWordIndex: 0, // 当前学到全书第几个词 (0-based)
      attendanceDays: [],  // 出勤打卡日期列表 ["2026-09-01", ...]
      lastQuestDate: null, // 上次完成每日主命的日期字符串
      masteryMap: {},      // 每个单词的掌握度记录 { "meet": { correct: 3, wrong: 0, level: 3 } }
      todayQuestCache: null, // 当天的题目缓存，保证当天刷题一致性
      clearedStages: {},   // 已通关的关卡记录 { 1: true, 2: true, ... }
      maxStageCleared: 0,  // 历史最高通关关卡数
      dailyLimitUnlocked: false // 家长特许开关（解除今日主命限额）
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const loaded = { ...this.getDefaultState(), ...JSON.parse(data) };
        // 新自然日自动恢复每日限额锁定
        if (loaded.lastQuestDate !== this.getTodayDateStr()) {
          loaded.dailyLimitUnlocked = false;
        }
        return loaded;
      }
    } catch (e) {
      console.warn('Progress load failed:', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Progress save failed:', e);
    }
  }

  getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * 是否今天已经完成了每日主命
   */
  isTodayFinished() {
    return this.state.lastQuestDate === this.getTodayDateStr();
  }

  /**
   * 是否达到每日主命关卡上限（每日严格限额 1 关/3 词，10 分钟预算）
   */
  isDailyStageLimitReached() {
    return this.isTodayFinished() && !this.state.dailyLimitUnlocked;
  }

  /**
   * 家长特许：开关今日进军限制
   */
  toggleDailyLimitOverride(forceAllow) {
    if (typeof forceAllow === 'boolean') {
      this.state.dailyLimitUnlocked = forceAllow;
    } else {
      this.state.dailyLimitUnlocked = !this.state.dailyLimitUnlocked;
    }
    this.saveState();
    return this.state.dailyLimitUnlocked;
  }

  /**
   * 获取今日关联掌握的 3 个核心词汇
   */
  getTodayStageWords() {
    const allWords = window.wordManager ? window.wordManager.getAllTextbookWordsFlat() : [];
    if (!allWords || allWords.length === 0) return [];
    let targetIdx = this.state.currentWordIndex || 0;
    if (this.isTodayFinished() && targetIdx >= 3) {
      targetIdx -= 3;
    }
    return allWords.slice(targetIdx, targetIdx + 3);
  }

  /**
   * 获取今日打卡连胜天数（真正的连续打卡算法）
   */
  getStreakDays() {
    if (!this.state.attendanceDays || this.state.attendanceDays.length === 0) return 0;
    const sorted = [...new Set(this.state.attendanceDays)].sort().reverse();
    const today = this.getTodayDateStr();
    let streak = 0;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    const latest = sorted[0];
    if (latest !== today && latest !== yesterdayStr) {
      return 0; // 出现断签
    }

    let cursor = new Date(latest);
    for (const dStr of sorted) {
      const curStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      if (dStr === curStr) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  }

  /**
   * 生成或获取今日主命任务（3 新词 + 艾宾浩斯科学温故词）
   */
  getTodayQuest() {
    const allWords = window.wordManager.getAllTextbookWordsFlat();
    const curIdx = this.state.currentWordIndex;

    // 1. 今日 3 个主线探索新词（严格按课本顺序推进）
    const newWords = allWords.slice(curIdx, curIdx + 3).map(w => ({
      ...w,
      isNew: true,
      tag: '今日新词 ✨'
    }));

    // 如果全书已经学完，从头轮转新词
    if (newWords.length === 0 && allWords.length > 0) {
      newWords.push(...allWords.slice(0, 3).map(w => ({ ...w, isNew: true, tag: '总复习新词 ✨' })));
    }

    // 2. 艾宾浩斯循环温故旧词（挑选 1 个用于压轴试炼）
    const reviewPool = allWords.slice(0, curIdx);
    let reviewWords = [];

    if (reviewPool.length > 0) {
      const now = Date.now();
      // 按照艾宾浩斯到期度与易错权重综合排序
      const weighted = [...reviewPool].sort((a, b) => {
        const ma = this.state.masteryMap[a.en.toLowerCase()] || { wrong: 0, nextReviewTime: 0 };
        const mb = this.state.masteryMap[b.en.toLowerCase()] || { wrong: 0, nextReviewTime: 0 };
        const urgencyA = (now - (ma.nextReviewTime || 0)) / 86400000 + (ma.wrong || 0) * 2;
        const urgencyB = (now - (mb.nextReviewTime || 0)) / 86400000 + (mb.wrong || 0) * 2;
        return urgencyB - urgencyA;
      });
      reviewWords = weighted.slice(0, 1).map(w => ({
        ...w,
        isNew: false,
        tag: '艾宾浩斯温故 🔄'
      }));
    } else if (newWords.length > 0) {
      // 第一天尚无往期旧词，以今日核心词作为压轴试炼
      const bossTarget = newWords[newWords.length - 1];
      reviewWords = [{
        ...bossTarget,
        isNew: false,
        tag: '压轴试炼 👑'
      }];
    }

    // 组合今日冒险队列（新词与旧词穿插混合）
    const combined = [...newWords, ...reviewWords].sort(() => Math.random() - 0.5);

    return {
      date: this.getTodayDateStr(),
      newWords,
      reviewWords,
      queue: combined,
      targetIdx: curIdx
    };
  }

  /**
   * 记录单词练习结果（真正的时间衰减间隔计算）
   */
  recordWordResult(wordEn, isSuccess, hadHint = false) {
    const key = wordEn.toLowerCase();
    const now = Date.now();
    const intervals = [1, 2, 4, 7, 15, 30]; // 艾宾浩斯记忆间隔天数

    if (!this.state.masteryMap[key]) {
      this.state.masteryMap[key] = {
        correct: 0,
        wrong: 0,
        level: 1,
        stage: 0,
        lastReviewTime: now,
        nextReviewTime: now + 86400000
      };
    }
    const item = this.state.masteryMap[key];
    item.lastReviewTime = now;

    if (isSuccess && !hadHint) {
      item.correct += 1;
      item.stage = Math.min(intervals.length - 1, (item.stage || 0) + 1);
      const days = intervals[item.stage];
      item.nextReviewTime = now + days * 86400000;
      if (item.correct >= 3) item.level = 3;
      else if (item.correct >= 1) item.level = 2;
    } else {
      item.wrong += 1;
      item.stage = Math.max(0, (item.stage || 0) - 1);
      item.nextReviewTime = now + 86400000; // 错题次日必测
      item.level = Math.max(1, item.level - 1);
    }
    this.saveState();
  }

  /**
   * 完成今日主命大结
   * @param {Object} options - 可选参数 { isReplay: boolean, stageNum: number }
   */
  finishTodayQuest(options = {}) {
    const todayStr = this.getTodayDateStr();
    this.state.lastQuestDate = todayStr;
    if (!this.state.attendanceDays.includes(todayStr)) {
      this.state.attendanceDays.push(todayStr);
    }
    // 记录通关关卡
    if (options && options.stageNum) {
      this.recordStageCleared(options.stageNum);
    } else {
      const curStage = Math.floor(this.getCurrentIndex() / 3) + 1;
      this.recordStageCleared(curStage);
    }
    // 只有在非历史关卡重温(isReplay)模式下，才自动推进学校教学主命进度！
    if (!options || !options.isReplay) {
      this.state.currentWordIndex += 3;
      this.state.dailyLimitUnlocked = false;
    }
    this.saveState();
  }

  /**
   * 获取当前有效通关数（综合考虑实际通关与家长对齐进度）
   */
  getEffectiveClearedStageCount() {
    const schoolPassed = Math.floor((this.state.currentWordIndex || 0) / 3);
    return Math.max(schoolPassed, this.state.maxStageCleared || 0);
  }

  /**
   * 记录特定关卡通关
   */
  recordStageCleared(stageNum) {
    if (!this.state.clearedStages) this.state.clearedStages = {};
    this.state.clearedStages[stageNum] = true;
    this.state.maxStageCleared = Math.max(this.state.maxStageCleared || 0, stageNum);
    this.saveState();
  }

  /**
   * 判断某关卡是否已通关
   */
  isStageCleared(stageNum) {
    if (stageNum <= this.getEffectiveClearedStageCount()) return true;
    return !!(this.state.clearedStages && this.state.clearedStages[stageNum]);
  }

  /**
   * 获取功能解锁配置
   */
  getFeatureUnlockConfig(featureKey) {
    return this.featureUnlocks[featureKey] || { minStage: 0, title: featureKey, hint: '始终可用', icon: '✨' };
  }

  /**
   * 判断某项次级系统是否已解锁
   */
  isFeatureUnlocked(featureKey) {
    const cfg = this.featureUnlocks[featureKey];
    if (!cfg || cfg.minStage === 0) return true;
    return this.getEffectiveClearedStageCount() >= cfg.minStage;
  }

  /**
   * 检查关卡变动前后新解锁的系统功能列表
   */
  getNewlyUnlockedFeatures(prevClearedCount, newClearedCount) {
    const newlyUnlocked = [];
    for (const [key, cfg] of Object.entries(this.featureUnlocks)) {
      if (cfg.minStage > 0 && prevClearedCount < cfg.minStage && newClearedCount >= cfg.minStage) {
        newlyUnlocked.push({ key, ...cfg });
      }
    }
    return newlyUnlocked;
  }

  /**
   * 获取当前进度索引
   */
  getCurrentIndex() {
    return this.state.currentWordIndex || 0;
  }

  advanceProgress(delta = 3) {
    this.state.currentWordIndex = (this.state.currentWordIndex || 0) + delta;
    this.saveState();
  }

  setCurrentIndex(targetIndex) {
    this.setManualProgress(targetIndex);
  }

  /**
   * 家长专属：手动调整当前进度对齐到第几个词
   */
  setManualProgress(targetIndex) {
    const allWords = window.wordManager.getAllTextbookWordsFlat();
    this.state.currentWordIndex = Math.max(0, Math.min(allWords.length - 1, targetIndex));
    this.state.todayQuestCache = null; // 清空当日缓存，让新词立即生效刷新！
    this.saveState();
  }

  /**
   * 获取某单元的掌握进度百分比
   */
  getUnitProgress(unit) {
    let mastered = 0;
    unit.words.forEach(w => {
      const m = this.state.masteryMap[w.en.toLowerCase()];
      if (m && m.level >= 2) mastered += 1;
    });
    return {
      mastered,
      total: unit.words.length,
      pct: Math.round((mastered / unit.words.length) * 100)
    };
  }
}

window.progressManager = new ProgressManager();
