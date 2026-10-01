/**
 * 太阁英语立志传 · 核心合战与主命执行引擎 (Combat & Mission Engine)
 * - 支持【大名每日主命】(3 新词 + 循环温故)
 * - 支持【单元史诗大合战】(桶狭间奇袭、墨俣一夜城、岐阜天下布武、界港商会)
 * - 键盘优先打字：敲击 A~Z 直接命中，自动平滑跳过空格与撇号（如输入 icecream 自动命中 ice cream）
 * - 刀剑连斩、铁炮齐射、浮动伤害与织田信长当面封赏
 */

class CombatEngine {
  constructor() {
    this.mode = 'daily'; // 'daily' (每日主命) | 'campaign' (单元史诗合战)
    this.currentUnit = null;
    this.encounterQueue = [];
    this.currentIndex = 0;
    this.currentWordObj = null;

    this.currentEnemy = null;
    this.enemyMaxHp = 60;
    this.enemyHp = 60;

    this.currentSpelling = ''; // 当前打出的纯字母串
    this.combo = 0;
    this.earnedMerit = 0;
    this.earnedGold = 0;
    this.isAttacking = false;
    this.hadHintThisWord = false;
  }

  /**
   * 开启【大名每日主命】
   */
  startDailyQuest() {
    this.mode = 'daily';
    const quest = window.progressManager.getTodayQuest();
    this.encounterQueue = quest.queue;
    this.currentIndex = 0;
    this.combo = 0;
    this.earnedMerit = 0;
    this.earnedGold = 0;

    window.heroManager.resetHp();
    this.nextEncounter();
  }

  /**
   * 开启【单元史诗大合战】
   */
  startCampaignBattle(unit) {
    this.mode = 'campaign';
    this.currentUnit = unit;
    // 打乱该单元所有单词进行战役考核
    this.encounterQueue = [...unit.words].sort(() => Math.random() - 0.5).map(w => ({
      ...w,
      tag: '合战敌将 ⚔️'
    }));
    this.currentIndex = 0;
    this.combo = 0;
    this.earnedMerit = 0;
    this.earnedGold = 0;

    window.heroManager.resetHp();
    this.nextEncounter();
  }

  /**
   * 推进至下一遭遇战/敌将
   */
  nextEncounter() {
    if (this.currentIndex >= this.encounterQueue.length) {
      this.triggerVictory();
      return;
    }

    this.currentWordObj = this.encounterQueue[this.currentIndex];
    this.currentSpelling = '';
    this.isAttacking = false;
    this.hadHintThisWord = false;

    // 生成敌方角色
    const isBoss = (this.currentIndex === this.encounterQueue.length - 1);
    if (this.mode === 'campaign' && isBoss && this.currentUnit.boss) {
      this.currentEnemy = { ...this.currentUnit.boss };
    } else {
      this.currentEnemy = this.generateEnemy(this.currentIndex, isBoss);
    }

    const heroAtk = window.heroManager.getAttackPower();
    this.enemyMaxHp = isBoss ? heroAtk * 2 : heroAtk;
    this.enemyHp = this.enemyMaxHp;
    this.currentEnemy.maxHp = this.enemyMaxHp;
    this.currentEnemy.hp = this.enemyHp;

    // 自动轻声朗读一遍（帮助孩子磨耳朵）
    setTimeout(() => {
      window.audioEngine.speak(this.currentWordObj.en);
    }, 350);

    if (window.ui) {
      window.ui.renderCombatField();
    }
  }

  generateEnemy(index, isBoss) {
    const enemies = [
      { name: '美浓斥候', icon: '🥷', title: '探查前锋' },
      { name: '今川家足轻', icon: '👺', title: '长枪先锋' },
      { name: '野武士浪人', icon: '🤺', title: '拦路豪杰' },
      { name: '南蛮海寇', icon: '🏴‍☠️', title: '西洋劫匪' },
      { name: '界港铁炮武者', icon: '🪖', title: '重装精锐' }
    ];
    if (isBoss) {
      return { name: '敌阵守关大将', icon: '👹', title: '合战敌总大将' };
    }
    return enemies[index % enemies.length];
  }

  /**
   * 键盘敲入或点击字母
   */
  inputLetter(char) {
    if (this.isAttacking) return;
    const cleanTarget = this.currentWordObj.en.toLowerCase().replace(/[^a-z]/g, '');
    const pressed = char.toLowerCase();

    // 检查下一步期望的字母
    const nextExpected = cleanTarget[this.currentSpelling.length];

    if (pressed === nextExpected) {
      // 敲击正确
      this.currentSpelling += pressed;
      window.audioEngine.playKeyRune();
      window.audioEngine.speakLetter(pressed);

      if (window.ui) window.ui.updateSpellingSlots();

      // 检查是否完成整词
      if (this.currentSpelling === cleanTarget) {
        this.handleCorrectWord();
      }
    } else {
      // 敲错：温和提示
      window.audioEngine.playMistake();
      if (window.ui) window.ui.shakeSpelling();
    }
  }

  /**
   * 退格删除一个字母
   */
  backspace() {
    if (this.isAttacking || this.currentSpelling.length === 0) return;
    this.currentSpelling = this.currentSpelling.slice(0, -1);
    window.audioEngine.playTone(329.63, 'sine', 0.06, 0.08);
    if (window.ui) window.ui.updateSpellingSlots();
  }

  /**
   * 提示法术（Tab键或点击提示）：自动填入下一个正确字母
   */
  useHint() {
    if (this.isAttacking) return;
    const cleanTarget = this.currentWordObj.en.toLowerCase().replace(/[^a-z]/g, '');
    if (this.currentSpelling.length < cleanTarget.length) {
      this.hadHintThisWord = true;
      const nextChar = cleanTarget[this.currentSpelling.length];
      this.inputLetter(nextChar);
    }
  }

  /**
   * 正确拼完单词：触发拔刀斩击/铁炮齐射与伤害结算
   */
  handleCorrectWord() {
    this.isAttacking = true;
    this.combo += 1;

    // 纯正美音标准发音完整单词
    window.audioEngine.speak(this.currentWordObj.en);

    // 记录熟练度
    window.progressManager.recordWordResult(this.currentWordObj.en, true, this.hadHintThisWord);

    // 伤害与功勋计算
    const hero = window.heroManager;
    const weapon = hero.getEquippedWeapon();
    let dmg = hero.getAttackPower();
    let isCrit = false;

    if (this.combo >= 2) {
      dmg = Math.round(dmg * (1 + (this.combo - 1) * 0.25));
      isCrit = true;
    }

    // 扣减敌方血量
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.currentEnemy.hp = this.enemyHp;

    // 奖励金币与功勋
    const baseGold = 12 + (this.currentEnemy.isBoss ? 30 : 0);
    const goldEarned = hero.addGold(baseGold);
    this.earnedGold += goldEarned;

    const baseMerit = 10 + (this.currentEnemy.isBoss ? 25 : 0);
    const meritResult = hero.addMerit(baseMerit);
    this.earnedMerit += meritResult.earned;

    // 音效
    if (weapon.id === 'wpn-musket') {
      window.audioEngine.playMusketBlast();
    } else {
      window.audioEngine.playKatanaSlash();
    }

    // 触发攻击动画与受击特效
    if (window.ui) {
      window.ui.triggerAttackAnim(dmg, isCrit, goldEarned, meritResult.earned, () => {
        if (this.enemyHp <= 0) {
          window.audioEngine.playTaikoDrum();
          window.audioEngine.playCoin();

          if (window.ui) {
            window.ui.triggerEnemyDefeat(() => {
              this.currentIndex += 1;
              this.nextEncounter();
            });
          }
        } else {
          this.currentSpelling = '';
          this.isAttacking = false;
          if (window.ui) window.ui.renderCombatField();
        }
      });
    }
  }

  /**
   * 战役/每日主命胜利大捷
   */
  triggerVictory() {
    window.audioEngine.playPromotionFanfare();

    if (this.mode === 'daily') {
      // 记录每日打卡推进
      window.progressManager.finishTodayQuest();
      // 额外赏赐今日大名特别奉加
      const bonusGold = window.heroManager.addGold(50);
      const meritRes = window.heroManager.addMerit(40);
      this.earnedGold += bonusGold;
      this.earnedMerit += meritRes.earned;
    } else {
      const bonusGold = window.heroManager.addGold(80);
      const meritRes = window.heroManager.addMerit(80);
      this.earnedGold += bonusGold;
      this.earnedMerit += meritRes.earned;
    }

    if (window.ui) {
      window.ui.showVictoryModal({
        mode: this.mode,
        unit: this.currentUnit,
        words: this.encounterQueue,
        maxCombo: this.combo,
        totalGold: this.earnedGold,
        totalMerit: this.earnedMerit,
        streakDays: window.progressManager.getStreakDays()
      });
    }
  }
}

window.combatEngine = new CombatEngine();
