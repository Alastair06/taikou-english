/**
 * 太阁英语立志传 · 大世界神秘藏宝图与定向寻宝系统 (Treasure Hunt System)
 * - 纯正自驱探险：孩子根据羊皮纸上的英语线索（如 "Near the big pink tree..."）在地图上搜寻
 * - 接近隐藏点时地面泛起金色旋风星光粒子
 * - 挖掘并倾听声纹密码，零挫败解锁金判、稀有南蛮家具图纸与战国秘宝
 */

class TreasureHuntSystem {
  constructor() {
    this.storageKey = 'taikou_treasure_hunt_v1';
    this.spots = [
      {
        id: 'spot-sakura-east',
        x: 1220,
        y: 950,
        name: '东麓千本樱古树',
        clueEn: 'Go near the big pink tree on the east side.',
        clueCn: '前往东侧那棵巨大的粉红樱花树下。',
        targetWord: 'tree',
        wordObj: { en: 'tree', cn: '树木', phonetic: '/triː/', emoji: '🌳' },
        rewardGold: 80,
        rewardFurniture: 'furn-clock' // 葡萄牙自鸣钟
      },
      {
        id: 'spot-bridge-bank',
        x: 420,
        y: 840,
        name: '清洲晶莹石桥畔',
        clueEn: 'Walk to the stone bridge, and listen to the water.',
        clueCn: '走到碧波石桥旁，倾听流水潺潺。',
        targetWord: 'water',
        wordObj: { en: 'water', cn: '水', phonetic: '/ˈwɔːtər/', emoji: '💧' },
        rewardGold: 60,
        rewardFurniture: 'furn-tea' // 茶道茶具
      },
      {
        id: 'spot-stone-lantern',
        x: 466,
        y: 730,
        name: '长明春日石灯笼',
        clueEn: 'Look beside the stone lantern on the quiet path.',
        clueCn: '在幽静小径的长明石灯笼旁搜寻。',
        targetWord: 'lantern',
        wordObj: { en: 'light', cn: '光芒 / 灯火', phonetic: '/laɪt/', emoji: '🏮' },
        rewardGold: 70,
        rewardFurniture: 'furn-lamp' // 和纸行灯
      },
      {
        id: 'spot-stepping-stones',
        x: 340,
        y: 540,
        name: '草甸飞石曲径',
        clueEn: 'Follow the flat stepping stones on green grass.',
        clueCn: '沿着嫩绿草甸上排列的平整飞石小路。',
        targetWord: 'grass',
        wordObj: { en: 'grass', cn: '青草', phonetic: '/ɡræs/', emoji: '🌱' },
        rewardGold: 75,
        rewardFurniture: 'furn-flower' // 四季樱盆景
      },
      {
        id: 'spot-torii-secret',
        x: 280,
        y: 980,
        name: '神社朱红鸟居后',
        clueEn: 'Behind the red torii gate, find the ancient box.',
        clueCn: '在朱红色的神社鸟居后方，寻找古老的盒子。',
        targetWord: 'box',
        wordObj: { en: 'box', cn: '盒子 / 宝箱', phonetic: '/bɑːks/', emoji: '📦' },
        rewardGold: 90,
        rewardFurniture: 'furn-telescope' // 西洋远望镜
      }
    ];

    this.state = this.loadState();
    this.sparkleTimer = 0;
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Treasure state load error:', e);
    }
    return {
      activeSpotId: 'spot-sakura-east',
      unlockedSpotIds: ['spot-sakura-east'],
      foundSpotIds: [],
      inventoryParchments: ['spot-sakura-east']
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Treasure state save error:', e);
    }
  }

  getActiveSpot() {
    const spot = this.spots.find(s => s.id === this.state.activeSpotId);
    if (!spot || this.state.foundSpotIds.includes(spot.id)) {
      // 自动轮换至下一个未发掘的藏宝点
      const next = this.spots.find(s => !this.state.foundSpotIds.includes(s.id));
      if (next) {
        this.state.activeSpotId = next.id;
        this.saveState();
        return next;
      }
    }
    return spot || this.spots[0];
  }

  /**
   * 判断玩家是否接近当前活跃藏宝点
   */
  getNearbySpot(playerX, playerY, radius = 90) {
    const spot = this.getActiveSpot();
    if (!spot || this.state.foundSpotIds.includes(spot.id)) return null;

    const dx = playerX - spot.x;
    const dy = playerY - spot.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= radius) {
      return { spot, dist };
    }
    return null;
  }

  /**
   * 绘制地图上的金色微光旋转粒子
   */
  drawMapSparkles(ctx, camera) {
    const spot = this.getActiveSpot();
    if (!spot || this.state.foundSpotIds.includes(spot.id)) return;

    this.sparkleTimer += 0.05;
    const screenX = spot.x - camera.x;
    const screenY = spot.y - camera.y;

    // 旋转神圣微光光环
    ctx.save();
    ctx.translate(screenX, screenY);

    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.65)');
    grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();

    // 4 颗围绕旋转的星芒粒子
    for (let i = 0; i < 4; i++) {
      const angle = this.sparkleTimer + (i * Math.PI) / 2;
      const r = 24 + Math.sin(this.sparkleTimer * 2 + i) * 6;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;

      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 中心小金光标志
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨', 0, -4 + Math.sin(this.sparkleTimer * 3) * 3);

    ctx.restore();
  }

  /**
   * 成功解密发掘藏宝点
   */
  claimSpotTreasure(spotId) {
    const spot = this.spots.find(s => s.id === spotId);
    if (!spot) return;

    if (!this.state.foundSpotIds.includes(spotId)) {
      this.state.foundSpotIds.push(spotId);
    }

    // 奖励金判
    if (window.heroManager) {
      window.heroManager.addGold(spot.rewardGold);
      window.heroManager.addMerit(40);
    }

    // 解锁对应家具图纸
    if (window.estateSystem && spot.rewardFurniture) {
      window.estateSystem.unlockFurniture(spot.rewardFurniture);
    }

    // 自动激活下一个藏宝点
    const next = this.spots.find(s => !this.state.foundSpotIds.includes(s.id));
    if (next) {
      this.state.activeSpotId = next.id;
      if (!this.state.inventoryParchments.includes(next.id)) {
        this.state.inventoryParchments.push(next.id);
      }
    }

    this.saveState();
  }
}

window.treasureHuntSystem = new TreasureHuntSystem();
