/**
 * 太阁英语立志传 · 宏观大世界：战国日本列岛行军图 (Japan Overworld Controller)
 * 经典复刻光荣《太阁立志传5》大地图周游列国系统：
 * - 展现本州战国日本版图（尾张、美浓、近江、京都、界港、三河）
 * - 玩家沿官道自由行走或骑马奔袭
 * - 官道路牌听音指路与两国关所文牒查验
 * - 抵达名城进城无缝进入【城下町小世界】
 */

class JapanOverworldManager {
  constructor() {
    this.isActive = false;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    // 预加载战国日本古绘图与名将立绘
    this.mapBgImage = new Image();
    this.mapBgImage.src = 'assets/ui/antique_japan_map.jpg';
    this.heroPortrait = new Image();
    this.heroPortrait.src = 'assets/portraits/tokichiro.jpg';

    // 玩家在大地图的位置 (以 1000 x 600 画布为基准，稍微偏离清洲中心避免遮挡城池名称)
    this.player = {
      x: 565,
      y: 335,
      targetX: null,
      targetY: null,
      speed: 3.5,
      isMoving: false,
      facing: 'right',
      stepTick: 0
    };

    this.keys = { w: false, s: false, a: false, d: false };

    // 日本战国核心名城据点
    this.cities = [
      {
        id: 'kiyosu',
        name: '尾张 · 清洲城',
        title: '织田信长根据地 · 启航之城',
        x: 520,
        y: 360,
        radius: 40,
        color: '#ef4444',
        icon: '🏯',
        facilities: ['天守阁', '演武场', '大手门']
      },
      {
        id: 'sakai',
        name: '摄津 · 界港',
        title: '堺港南蛮商都',
        x: 260,
        y: 450,
        radius: 40,
        color: '#3b82f6',
        icon: '🚢',
        facilities: ['宗休茶室', '南蛮药庐', '南蛮商馆']
      },
      {
        id: 'inabayama',
        name: '美浓 · 稻叶山城',
        title: '斋藤家坚固要塞 · 战役二',
        x: 470,
        y: 200,
        radius: 40,
        color: '#10b981',
        icon: '⛰️',
        facilities: ['美浓山砦', '战役副本']
      },
      {
        id: 'kyoto',
        name: '山城 · 京都皇城',
        title: '公家御所 · 天下之枢',
        x: 330,
        y: 300,
        radius: 40,
        color: '#a855f7',
        icon: '🌸',
        facilities: ['御所公家', '南蛮寺院']
      },
      {
        id: 'odawara',
        name: '相模 · 小田原城',
        title: '北条坚城 · 战役三',
        x: 740,
        y: 330,
        radius: 40,
        color: '#f59e0b',
        icon: '🌊',
        facilities: ['相模铁炮锻造坊']
      },
      {
        id: 'azuchi',
        name: '近江 · 安土幻城',
        title: '天下布武总本城 · 终局决战',
        x: 420,
        y: 290,
        radius: 45,
        color: '#ec4899',
        icon: '✨',
        facilities: ['安土天守', '南蛮商会总馆']
      },
      {
        id: 'okazaki',
        name: '三河 · 冈崎城',
        title: '德川家康本城 · 盟友之邦',
        x: 650,
        y: 410,
        radius: 36,
        color: '#06b6d4',
        icon: '🛡️',
        facilities: ['三河道场']
      }
    ];

    // 大世界连通各城的古代主干道网络 (Tokaido & Nakasendo)
    this.roads = [
      { from: 'kiyosu', to: 'okazaki', name: '东海道 (尾张-三河)' },
      { from: 'kiyosu', to: 'inabayama', name: '美浓官道' },
      { from: 'inabayama', to: 'azuchi', name: '中山道 (美浓-近江)' },
      { from: 'azuchi', to: 'kyoto', name: '东山道 (近江-京都)' },
      { from: 'kyoto', to: 'sakai', name: '京街道 / 淀川商道' },
      { from: 'kiyosu', to: 'azuchi', name: '伊势湾北路' }
    ];

    // 沿途英语路标与关所奇遇点
    this.checkpoints = [
      {
        id: 'sign-sakai',
        x: 380,
        y: 400,
        title: '🛣️ 摄津界港关所',
        label: '⚓ 界港商道',
        word: 'port',
        prompt: '前往繁华海港？听音辨词指路！',
        isSolved: false
      },
      {
        id: 'sign-inaba',
        x: 490,
        y: 280,
        title: '🛣️ 美浓居城关所',
        label: '🏯 美浓关所',
        word: 'castle',
        prompt: '通往巍峨城堡？听音验证文牒！',
        isSolved: false
      }
    ];

    this.nearbyCity = null;
    this.nearbyCheckpoint = null;
  }

  init() {
    this.canvas = document.getElementById('overworld-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindInput();
    }
  }

  bindInput() {
    if (!this.canvas) return;

    // 键盘移动控制
    window.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;

      if ((k === ' ' || k === 'enter') && this.nearbyCity) {
        e.preventDefault();
        this.enterCity(this.nearbyCity.id);
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

    // 触控或点击大地图直接行军
    this.canvas.addEventListener('click', (e) => {
      if (!this.isActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // 检查是否直接点击了某个城市
      for (const c of this.cities) {
        const d = Math.hypot(clickX - c.x, clickY - c.y);
        if (d < c.radius + 15) {
          // 如果已经在城边，直接进城
          if (Math.hypot(this.player.x - c.x, this.player.y - c.y) < 65) {
            this.enterCity(c.id);
            return;
          }
          // 否则设定移动目的地
          this.player.targetX = c.x;
          this.player.targetY = c.y;
          window.audioEngine.playKeyRune();
          return;
        }
      }

      // 点击空地移动
      this.player.targetX = clickX;
      this.player.targetY = clickY;
    });
  }

  show() {
    if (!this.canvas) this.init();
    if (!this.canvas) return;

    this.isActive = true;
    const sceneEl = document.getElementById('scene-overworld');
    if (sceneEl) sceneEl.classList.remove('hidden');

    // 隐藏其他所有场景
    const homeEl = document.getElementById('home-screen');
    if (homeEl) homeEl.classList.add('hidden');
    const viewportEl = document.getElementById('game-viewport');
    if (viewportEl) viewportEl.classList.add('hidden');
    const townEl = document.getElementById('scene-town');
    if (townEl) townEl.classList.add('hidden');

    this.canvas.width = 1000;
    this.canvas.height = 600;

    window.audioEngine.unlockAudio();
    this.updateHUD();
    this.startLoop();
  }

  hide() {
    this.isActive = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    const sceneEl = document.getElementById('scene-overworld');
    if (sceneEl) sceneEl.classList.add('hidden');
  }

  startLoop() {
    const loop = () => {
      if (!this.isActive) return;
      this.updateMovement();
      this.checkProximity();
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  updateMovement() {
    let dx = 0;
    let dy = 0;

    if (this.keys.w) dy -= 1;
    if (this.keys.s) dy += 1;
    if (this.keys.a) dx -= 1;
    if (this.keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      this.player.targetX = null;
      this.player.targetY = null;
      const len = Math.hypot(dx, dy);
      this.player.x += (dx / len) * this.player.speed;
      this.player.y += (dy / len) * this.player.speed;
      this.player.isMoving = true;
      this.player.facing = dx >= 0 ? 'right' : 'left';
      this.player.stepTick++;
    } else if (this.player.targetX !== null && this.player.targetY !== null) {
      const dist = Math.hypot(this.player.targetX - this.player.x, this.player.targetY - this.player.y);
      if (dist > 4) {
        const step = Math.min(this.player.speed, dist);
        const angle = Math.atan2(this.player.targetY - this.player.y, this.player.targetX - this.player.x);
        this.player.x += Math.cos(angle) * step;
        this.player.y += Math.sin(angle) * step;
        this.player.isMoving = true;
        this.player.facing = Math.cos(angle) >= 0 ? 'right' : 'left';
        this.player.stepTick++;
      } else {
        this.player.targetX = null;
        this.player.targetY = null;
        this.player.isMoving = false;
      }
    } else {
      this.player.isMoving = false;
    }

    // 限制在大地图边界内
    this.player.x = Math.max(70, Math.min(930, this.player.x));
    this.player.y = Math.max(70, Math.min(530, this.player.y));
  }

  checkProximity() {
    let nearCity = null;
    for (const c of this.cities) {
      const d = Math.hypot(this.player.x - c.x, this.player.y - c.y);
      if (d < c.radius + 25) {
        nearCity = c;
        break;
      }
    }
    this.nearbyCity = nearCity;

    let nearCp = null;
    for (const cp of this.checkpoints) {
      const d = Math.hypot(this.player.x - cp.x, this.player.y - cp.y);
      if (d < 35) {
        nearCp = cp;
        break;
      }
    }
    this.nearbyCheckpoint = nearCp;

    const bannerEl = document.getElementById('overworld-prompt');
    if (bannerEl) {
      if (nearCity) {
        bannerEl.innerHTML = `<span class="prompt-title">${nearCity.icon} 抵达【${nearCity.name}】</span> ` +
          `<button class="btn btn-primary btn-sm" onclick="window.overworld.enterCity('${nearCity.id}')">🏯 进城入町 (按空格)</button>`;
        bannerEl.classList.remove('hidden');
      } else if (nearCp && !nearCp.isSolved) {
        bannerEl.innerHTML = `<span class="prompt-title">${nearCp.title}</span> ` +
          `<button class="btn btn-secondary btn-sm" onclick="window.overworld.triggerCheckpoint('${nearCp.id}')">🗣️ 听音辨路领赏</button>`;
        bannerEl.classList.remove('hidden');
      } else {
        bannerEl.innerHTML = `<span>🗺️ 在日本大地图漫游，用 <strong>WASD</strong> 或 <strong>点击城市</strong> 奔袭行军</span>`;
        bannerEl.classList.remove('hidden');
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. 绘制战国日本水墨绢帛「天下統一國繪圖」古地图背景
    if (this.mapBgImage && this.mapBgImage.complete && this.mapBgImage.naturalWidth > 0) {
      ctx.drawImage(this.mapBgImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      // 备选绢帛和纸古底色
      ctx.fillStyle = '#231d17';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 古地图四角乌木晕影与和纸质感
    const grad = ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 220,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(15, 10, 6, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. 绘制古代官道与宿场网络 (金箔古道)
    this.roads.forEach(r => {
      const fromCity = this.cities.find(c => c.id === r.from);
      const toCity = this.cities.find(c => c.id === r.to);
      if (fromCity && toCity) {
        // 官道底层粗漆影
        ctx.strokeStyle = 'rgba(28, 22, 18, 0.75)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fromCity.x, fromCity.y);
        ctx.lineTo(toCity.x, toCity.y);
        ctx.stroke();

        // 官道金箔虚线
        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(fromCity.x, fromCity.y);
        ctx.lineTo(toCity.x, toCity.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 3. 绘制路标关所 (朱印关卡)
    this.checkpoints.forEach(cp => {
      ctx.save();
      ctx.fillStyle = cp.isSolved ? '#059669' : '#b91c1c';
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4a359';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cp.isSolved ? '通' : '关', cp.x, cp.y + 1);

      // 关所路标小牌
      const cpLabel = cp.label || (cp.id === 'sign-sakai' ? '⚓ 界港商道' : '🏯 美浓关所');
      ctx.font = 'bold 12px "Noto Serif SC", serif';
      const labelW = ctx.measureText(cpLabel).width + 16;
      ctx.fillStyle = 'rgba(28, 22, 18, 0.92)';
      ctx.fillRect(cp.x - labelW / 2, cp.y + 16, labelW, 20);
      ctx.strokeStyle = '#d4a359';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cp.x - labelW / 2, cp.y + 16, labelW, 20);

      ctx.fillStyle = '#fff3d0';
      ctx.font = 'bold 12px "Noto Serif SC", serif';
      ctx.fillText(cpLabel, cp.x, cp.y + 26);
      ctx.restore();
    });

    // 4. 绘制名城要塞据点
    this.cities.forEach(c => {
      const isNearby = this.nearbyCity && this.nearbyCity.id === c.id;

      ctx.save();
      // 外金圈与微光
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius + (isNearby ? 6 : 2), 0, Math.PI * 2);
      ctx.fillStyle = isNearby ? 'rgba(212, 163, 89, 0.4)' : 'rgba(20, 15, 10, 0.7)';
      ctx.fill();
      ctx.strokeStyle = isNearby ? '#fbbf24' : '#d4a359';
      ctx.lineWidth = isNearby ? 3.5 : 2;
      ctx.stroke();

      // 内底
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius - 4, 0, Math.PI * 2);
      ctx.fillStyle = '#261f19';
      ctx.fill();
      ctx.strokeStyle = '#8c6d37';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 城堡图标与名称
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.icon, c.x, c.y - 6);

      // 城名匾额
      const cName = c.name.split(' · ')[1] || c.name;
      ctx.font = 'bold 13px "Noto Serif SC", serif';
      const textWidth = ctx.measureText(cName).width + 18;
      ctx.fillStyle = 'rgba(28, 22, 18, 0.94)';
      ctx.fillRect(c.x - textWidth / 2, c.y + 13, textWidth, 22);
      ctx.strokeStyle = '#d4a359';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(c.x - textWidth / 2, c.y + 13, textWidth, 22);

      ctx.fillStyle = '#fff3d0';
      ctx.fillText(cName, c.x, c.y + 24);

      // 织田直辖朱印旗帜
      const capturedCities = this.getCapturedCities();
      if (capturedCities.includes(c.id)) {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(c.x + 18, c.y - c.radius - 4, 46, 20);
        ctx.strokeStyle = '#d4a359';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(c.x + 18, c.y - c.radius - 4, 46, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Noto Serif SC", serif';
        ctx.fillText('织田领', c.x + 41, c.y - c.radius + 6);
      }
      ctx.restore();
    });

    // 5. 绘制行军小武士 (Player)
    this.renderPlayerAvatar(ctx);
  }

  renderPlayerAvatar(ctx) {
    const px = this.player.x;
    const py = this.player.y;

    ctx.save();
    // 角色脚下金乌阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(px, py + 16, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = this.player.isMoving ? Math.sin(this.player.stepTick * 0.35) * 3 : 0;

    // 绘制木下藤吉郎微缩武将圆形金边头像
    const r = 18;
    const cy = py - 6 + bob;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();

    if (this.heroPortrait && this.heroPortrait.complete && this.heroPortrait.naturalWidth > 0) {
      ctx.drawImage(this.heroPortrait, px - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = '#8c6d37';
      ctx.fillRect(px - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('武', px, cy);
    }
    ctx.restore();

    // 绘制金边外圈
    ctx.beginPath();
    ctx.arc(px, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 名字军令签牌
    ctx.fillStyle = 'rgba(28, 22, 18, 0.94)';
    ctx.fillRect(px - 40, cy - 36, 80, 20);
    ctx.strokeStyle = '#d4a359';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px - 40, cy - 36, 80, 20);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('木下藤吉郎', px, cy - 26);

    ctx.restore();
  }

  updateHUD() {
    const hero = window.heroManager ? window.heroManager.hero : null;
    const goldEl = document.getElementById('ow-gold-text');
    const rankEl = document.getElementById('ow-rank-text');
    if (hero) {
      if (goldEl) goldEl.textContent = hero.gold;
      if (rankEl) rankEl.textContent = hero.rankName || '足轻组头';
    }
  }

  triggerCheckpoint(cpId) {
    const cp = this.checkpoints.find(c => c.id === cpId);
    if (!cp || cp.isSolved) return;

    window.audioEngine.speak(cp.word);
    cp.isSolved = true;
    if (window.heroManager) {
      window.heroManager.addGold(10);
    }
    this.updateHUD();
    window.ui.showToast('辨识暗号【' + cp.word + '】成功！大名犒赏 +10 贯！', '🚩');
  }

  enterCity(cityId) {
    window.audioEngine.unlockAudio();
    window.audioEngine.playTaikoDrum();

    this.hide();

    // 进入对应的城下町小世界
    if (window.taikouTown) {
      window.taikouTown.enterTown(cityId);
    } else {
      console.warn('taikouTown not initialized');
    }
  }

  getCapturedCities() {
    const captured = [];
    if (!window.wordManager || !window.progressManager) return ['kiyosu'];

    const units = window.wordManager.units || [];
    // Unit 1 (尾张清洲)
    if (units[0]) {
      const p1 = window.progressManager.getUnitProgress(units[0]);
      if (p1.pct >= 25) captured.push('kiyosu');
    } else {
      captured.push('kiyosu');
    }

    // Unit 2 (美浓稻叶山)
    if (units[1]) {
      const p2 = window.progressManager.getUnitProgress(units[1]);
      if (p2.pct >= 35) captured.push('inabayama');
    }

    // Unit 3 (近江安土)
    if (units[2]) {
      const p3 = window.progressManager.getUnitProgress(units[2]);
      if (p3.pct >= 35) captured.push('azuchi');
    }

    // Unit 4 (山城京都 & 摄津界港)
    if (units[3]) {
      const p4 = window.progressManager.getUnitProgress(units[3]);
      if (p4.pct >= 35) {
        captured.push('kyoto');
        captured.push('sakai');
      }
    }

    if (captured.length === 0) captured.push('kiyosu');
    return captured;
  }

  checkAndTriggerDailyTribute() {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('taikou_tribute_date');
    if (lastDate === today) return;

    const captured = this.getCapturedCities();
    if (!captured || captured.length === 0) return;

    const totalGold = captured.length * 45;
    const riceballs = Math.max(1, Math.floor(captured.length / 2));

    if (window.heroManager) {
      window.heroManager.addGold(totalGold);
      window.heroManager.addItem('item-riceball', riceballs);
    }

    localStorage.setItem('taikou_tribute_date', today);

    // 弹出战国领地进贡盛典弹窗
    const div = document.createElement('div');
    div.id = 'modal-feudal-tribute';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="modal-container tribute-modal-card" style="max-width:min(580px, 92vw);text-align:center;border:2.5px solid #d4a359;background:linear-gradient(180deg,#fffdf7 0%,#fef3c7 100%);padding:26px 22px;border-radius:22px;box-shadow:0 16px 40px rgba(0,0,0,0.45);max-height:94vh;overflow-y:auto;">
        <div style="font-size:48px;margin-bottom:6px;">🏯</div>
        <h3 style="color:#8c1f19;font-family:var(--font-child-cn);font-size:24px;font-weight:900;margin:6px 0 10px;letter-spacing:0.5px;">每日补给 · 守护名城奖励</h3>
        <p style="color:#4a382b;font-family:var(--font-child-cn);font-size:17px;line-height:1.6;margin-bottom:18px;">
          小勇士好！你守护的名城送来了今日金币与美味饭团，出发继续冒险吧！
        </p>
        <div style="display:flex;justify-content:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
          <div style="background:#fef9c3;border:1.5px solid #d4a359;padding:12px 24px;border-radius:14px;min-width:130px;">
            <div style="font-size:16px;color:#8c672b;font-family:var(--font-child-cn);font-weight:800;">军资金</div>
            <div style="font-size:24px;font-weight:900;color:#b45309;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:2px;">
              <img src="assets/ui/coin_koban.png" style="width:26px;height:26px;object-fit:contain;"> +${totalGold} 贯
            </div>
          </div>
          <div style="background:#fef9c3;border:1.5px solid #d4a359;padding:12px 24px;border-radius:14px;min-width:130px;">
            <div style="font-size:16px;color:#8c672b;font-family:var(--font-child-cn);font-weight:800;">听音饭团</div>
            <div style="font-size:24px;font-weight:900;color:#059669;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:2px;">
              <img src="assets/ui/item_riceball.png" style="width:26px;height:26px;object-fit:contain;"> +${riceballs} 枚
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" style="font-family:var(--font-child-cn);font-size:20px;font-weight:800;border-radius:16px;padding:12px 34px;" onclick="document.getElementById('modal-feudal-tribute').remove()">
          开心收下 ✨
        </button>
      </div>
    `;
    document.body.appendChild(div);

    if (window.audioEngine) {
      window.audioEngine.playFluteFanfare();
    }
  }
}

if (typeof window !== 'undefined') {
  window.overworld = new JapanOverworldManager();
}
