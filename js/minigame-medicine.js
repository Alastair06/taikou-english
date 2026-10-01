/**
 * 太阁英语立志传 · 南蛮医馆 (Medicine Dispensary Minigame)
 * 经典复刻光荣《太阁立志传5》医师调药小游戏：
 * - 拜访京町名医曲直濑道三 / 界港南蛮本草医馆
 * - 上方徐徐飘落标有英文单词的药草与灵露气泡
 * - 掌柜指派配方（如 We need leaf, water, sun!），下方控制药碾药臼左右移动接取
 * - 纯正美音发音指引，接对叮当共鸣，接错轻微反弹
 * - 闭环收益：亲手炼成实物【特级兵粮丸】放入法宝背包，随时在战斗中救命回血！
 */

class MedicineMinigame {
  constructor() {
    this.isOpen = false;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    // 调药目标配方 (3味药材)
    this.recipe = [];
    this.currentStep = 0; // 当前需要接取的药材步骤
    this.fallingHerbs = [];
    this.mortarX = 200;
    this.mortarWidth = 92;
    this.mortarHeight = 42;
    this.spawnTimer = 0;
    this.isCompleted = false;
  }

  init() {
    this.container = document.getElementById('modal-medicine-game');
    this.canvas = document.getElementById('medicine-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindInput();
    }
  }

  bindInput() {
    // 鼠标在画布内跟随横向移动
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mortarX = Math.max(this.mortarWidth / 2, Math.min(this.canvas.width - this.mortarWidth / 2, x));
    });

    // 移动端触控跟随
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
        this.mortarX = Math.max(this.mortarWidth / 2, Math.min(this.canvas.width - this.mortarWidth / 2, x));
      }
    }, { passive: false });

    // 键盘左右键控制
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen || this.isCompleted) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.mortarX = Math.max(this.mortarWidth / 2, this.mortarX - 35);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.mortarX = Math.min(this.canvas.width - this.mortarWidth / 2, this.mortarX + 35);
      }
    });
  }

  open() {
    if (!this.canvas) this.init();
    if (!this.canvas) return;

    this.isOpen = true;
    this.isCompleted = false;
    this.container.classList.remove('hidden');

    this.canvas.width = 460;
    this.canvas.height = 360;
    this.mortarX = this.canvas.width / 2;

    this.prepareRecipe();
    this.fallingHerbs = [];
    this.spawnTimer = 0;

    this.updateRecipeUI();
    this.announceCurrentHerb();

    this.startLoop();
  }

  close() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.container) {
      this.container.classList.add('hidden');
    }
    this.isOpen = false;
  }

  prepareRecipe() {
    const candidateHerbs = [
      { en: 'leaf', cn: '灵叶', emoji: '🍃' },
      { en: 'water', cn: '甘露', emoji: '💧' },
      { en: 'sun', cn: '纯阳', emoji: '☀️' },
      { en: 'root', cn: '参根', emoji: '🥕' },
      { en: 'tea', cn: '仙茗', emoji: '🍵' },
      { en: 'apple', cn: '朱果', emoji: '🍎' }
    ];

    const shuffled = [...candidateHerbs].sort(() => Math.random() - 0.5);
    this.recipe = shuffled.slice(0, 3);
    this.currentStep = 0;
  }

  announceCurrentHerb() {
    if (this.currentStep >= this.recipe.length) return;
    const target = this.recipe[this.currentStep];
    setTimeout(() => {
      if (this.isOpen && !this.isCompleted) {
        window.audioEngine.speak(target.en);
      }
    }, 300);
  }

  updateRecipeUI() {
    const box = document.getElementById('med-recipe-slots');
    if (!box) return;

    box.innerHTML = this.recipe.map((r, idx) => {
      const isDone = idx < this.currentStep;
      const isCurrent = idx === this.currentStep;
      let statusClass = isDone ? 'slot-done' : (isCurrent ? 'slot-current' : 'slot-pending');

      return '<div class="med-recipe-slot ' + statusClass + '">' +
        '<span class="slot-icon">' + (isDone ? '✅' : r.emoji) + '</span>' +
        '<span class="slot-en">' + r.en + '</span>' +
        '<span class="slot-cn">' + r.cn + '</span>' +
      '</div>';
    }).join('');

    const targetPrompt = document.getElementById('med-target-prompt');
    if (targetPrompt && this.currentStep < this.recipe.length) {
      const cur = this.recipe[this.currentStep];
      targetPrompt.innerHTML = `正在提炼第 <strong>${this.currentStep + 1}/3</strong> 味灵药：` +
        `<span class="target-highlight">${cur.emoji} ${cur.en.toUpperCase()} (${cur.cn})</span> ` +
        `<button class="btn-speak-cue" onclick="window.audioEngine.speak('${cur.en}')">🔊 听音</button>`;
    }
  }

  startLoop() {
    const loop = () => {
      if (!this.isOpen) return;
      this.update();
      this.render();
      if (!this.isCompleted) {
        this.animId = requestAnimationFrame(loop);
      }
    };
    this.animId = requestAnimationFrame(loop);
  }

  update() {
    if (this.isCompleted) return;

    this.spawnTimer++;
    if (this.spawnTimer % 55 === 0) {
      this.spawnHerb();
    }

    const curTarget = this.recipe[this.currentStep];
    const mortarTop = this.canvas.height - 45;

    for (let i = this.fallingHerbs.length - 1; i >= 0; i--) {
      const h = this.fallingHerbs[i];
      h.y += h.speed;

      // 碰撞检测：进入药臼判定范围
      if (h.y >= mortarTop && h.y <= mortarTop + 25) {
        if (Math.abs(h.x - this.mortarX) < (this.mortarWidth / 2 + 15)) {
          // 接取药材判定
          if (curTarget && h.en === curTarget.en) {
            // 接对了！
            window.audioEngine.playMatchSuccess();
            this.currentStep++;
            this.updateRecipeUI();
            this.fallingHerbs = []; // 清屏进入下一步

            if (this.currentStep >= this.recipe.length) {
              this.handleBrewSuccess();
              return;
            } else {
              this.announceCurrentHerb();
            }
            continue;
          } else {
            // 接错了：温和音效与反弹
            window.audioEngine.playTone(220, 'sine', 0.1, 0.05);
            h.y = this.canvas.height + 50; // 沉底
          }
        }
      }

      // 掉出画面移除
      if (h.y > this.canvas.height + 40) {
        this.fallingHerbs.splice(i, 1);
      }
    }
  }

  spawnHerb() {
    const curTarget = this.recipe[this.currentStep];
    if (!curTarget) return;

    // 40% 概率生成目标药材，60% 生成干扰药材
    const isTarget = Math.random() < 0.42;
    let chosen = curTarget;
    if (!isTarget) {
      const distractors = [
        { en: 'stone', cn: '顽石', emoji: '🪨' },
        { en: 'wind', cn: '疾风', emoji: '💨' },
        { en: 'fire', cn: '烈火', emoji: '🔥' },
        { en: 'rice', cn: '稻米', emoji: '🌾' },
        { en: 'wood', cn: '沉木', emoji: '🪵' }
      ].filter(d => d.en !== curTarget.en);
      chosen = distractors[Math.floor(Math.random() * distractors.length)];
    }

    this.fallingHerbs.push({
      x: 35 + Math.random() * (this.canvas.width - 70),
      y: -25,
      speed: 2.2 + Math.random() * 0.8,
      en: chosen.en,
      cn: chosen.cn,
      emoji: chosen.emoji
    });
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. 绘制背景：古朴百草药庐木壁
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, '#2a1f16');
    bgGrad.addColorStop(0.7, '#1b130e');
    bgGrad.addColorStop(1, '#110b07');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. 绘制战国药房百草药柜 (Apothecary Drawers Grid)
    const herbNames = [
      ['黄连', '当归', '茯苓', '白术'],
      ['川芎', '甘草', '人参', '灵芝'],
      ['枸杞', '柴胡', '陈皮', '薄荷']
    ];
    const drawerCols = 4;
    const drawerRows = 3;
    const drawerW = (this.canvas.width - 24) / drawerCols;
    const drawerH = 70;
    const startY = 16;

    for (let r = 0; r < drawerRows; r++) {
      for (let c = 0; c < drawerCols; c++) {
        const dx = 12 + c * drawerW;
        const dy = startY + r * drawerH;

        // 抽屉木框
        ctx.fillStyle = '#36281e';
        ctx.fillRect(dx + 3, dy + 3, drawerW - 6, drawerH - 6);
        ctx.strokeStyle = '#543e2e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx + 3, dy + 3, drawerW - 6, drawerH - 6);

        // 和纸药签标签
        ctx.fillStyle = 'rgba(250, 246, 238, 0.88)';
        const labelW = Math.min(52, drawerW - 20);
        ctx.fillRect(dx + (drawerW - labelW) / 2, dy + 10, labelW, 18);
        ctx.strokeStyle = '#b89c74';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx + (drawerW - labelW) / 2, dy + 10, labelW, 18);

        // 药材墨书
        ctx.fillStyle = '#261b12';
        ctx.font = 'bold 11px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(herbNames[r][c] || '本草', dx + drawerW / 2, dy + 19);

        // 铜环拉手
        ctx.beginPath();
        ctx.arc(dx + drawerW / 2, dy + 45, 5.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 药架下沿金箔装饰分界线
    ctx.strokeStyle = '#8c672b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, startY + drawerRows * drawerH + 10);
    ctx.lineTo(this.canvas.width, startY + drawerRows * drawerH + 10);
    ctx.stroke();

    // 3. 绘制下落药草
    this.fallingHerbs.forEach(h => {
      ctx.save();
      // 金色和纸气泡光晕
      ctx.beginPath();
      ctx.arc(h.x, h.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.92)';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji 图标
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h.emoji, h.x, h.y - 7);

      // 英文标签 (清晰加粗 13px)
      ctx.font = 'bold 13px "Noto Sans SC", sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText(h.en, h.x, h.y + 13);
      ctx.restore();
    });

    // 4. 绘制底部青瓷药碾臼 (Celadon Mortar)
    const mw = this.mortarWidth;
    const mx = this.mortarX;
    const my = this.canvas.height - 34;

    ctx.save();
    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(mx, my + 20, mw / 2 + 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 青瓷渐变碗身
    const bowlGrad = ctx.createLinearGradient(mx - mw / 2, my, mx + mw / 2, my + 28);
    bowlGrad.addColorStop(0, '#245a43');
    bowlGrad.addColorStop(0.5, '#3c8563');
    bowlGrad.addColorStop(1, '#183c2c');

    ctx.beginPath();
    ctx.ellipse(mx, my, mw / 2, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#183a2b';
    ctx.fill();
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mx - mw / 2, my);
    ctx.quadraticCurveTo(mx - mw / 2 + 4, my + 28, mx, my + 28);
    ctx.quadraticCurveTo(mx + mw / 2 - 4, my + 28, mx + mw / 2, my);
    ctx.closePath();
    ctx.fillStyle = bowlGrad;
    ctx.fill();
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 碗身金漆标识
    ctx.fillStyle = '#fff3d0';
    ctx.font = 'bold 13px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍵 青瓷药臼', mx, my + 14);
    ctx.restore();
  }

  handleBrewSuccess() {
    this.isCompleted = true;
    window.audioEngine.playFluteFanfare();

    // 奖赏：发放实物【特级兵粮丸】
    if (window.heroManager) {
      if (!window.heroManager.hero.ownedItemIds.includes('item-riceball')) {
        window.heroManager.hero.ownedItemIds.push('item-riceball');
      }
      window.heroManager.addItem('item-riceball', 1);
      window.heroManager.addGold(15);
      window.heroManager.healHeart(1);
    }

    // 推进内政主命
    if (window.questSystem) {
      window.questSystem.progressQuest('domestic', 1);
    }

    // 解锁秘技卡：金刚不坏
    if (window.cardsManager && typeof window.cardsManager.unlockCard === 'function') {
      window.cardsManager.unlockCard('skill-ironwall');
    }

    // 同步刷新法宝栏徽章数量
    const badgeEl = document.getElementById('badge-item-riceball');
    if (badgeEl && window.heroManager) {
      badgeEl.textContent = window.heroManager.getItemCount('item-riceball').toString();
    }

    const promptEl = document.getElementById('med-target-prompt');
    if (promptEl) {
      promptEl.innerHTML = '<span style="color:#10b981;font-weight:bold;">🎉 炉火纯青！灵药凝丹！</span>';
    }

    const box = document.getElementById('med-recipe-slots');
    if (box) {
      box.innerHTML = '<div class="med-victory-banner">' +
        '<h3>🍙 成功炼制【特级兵粮丸】！已入背包！</h3>' +
        '<p>名医曲直濑道三赞道：“药理通达，灵性非凡！此丸可在激战残血时回满生命，切记善用！”</p>' +
        '<div style="margin-top:12px;">' +
          '<button class="btn btn-primary" onclick="window.medicineMinigame.finishGame()">收下神药 · 归城</button>' +
        '</div>' +
      '</div>';
    }
  }

  finishGame() {
    this.close();
    window.ui.showToast('炼成【特级兵粮丸】！已放入法宝栏 🍙', '🌿');
    if (window.taikouTown) {
      window.taikouTown.updateHUD();
    }
  }
}

if (typeof window !== 'undefined') {
  window.medicineMinigame = new MedicineMinigame();
}
