/**
 * 太阁英语大冒险 · 2D 开放大地图与探索要素 (Adventure World Map)
 * 极致和风商业级 32-bit HD 像素/绘本美术引擎：
 * - 无缝青翠和风草坪地表 (Seamless Grass Turf Tile)
 * - 延段青石板大道与枯山水白砂砂带 (Paved Stone Avenue & Karesansui)
 * - 碧水波光护城河与野面积石岸 (Sparkling Water Caustics & Stone Embankment)
 * - 雄伟天守阁主殿与东西双翼橹舍 (Tenshu Palace Keep & Annex Wings)
 * - 朱红太鼓木桥 (Taiko Arched Bridge) 与红漆鸟居 (Torii Gate)
 * - 盛开樱花巨木 (Grand Sakura Trees with Wind Sway) 与漫天飞樱 (Petal Storm)
 * - 春日型夜明石灯笼 (Stone Lanterns with Warm Candle Glow)
 * - 锦簇杜鹃灌木与苍翠蕨类 (Garden Azalea & Fern Foliage)
 * - 闭锁封印/洞开通关重木城门 (Castle Gates)
 */

// 1. 环境美术资源配置表 (商业级像素模型素材)
const ENV_ASSETS = {
  grass: 'assets/environment/tile_grass.png',
  road: 'assets/environment/tile_road.png',
  stoneWall: 'assets/environment/tile_stone_wall.png',
  water: 'assets/environment/tile_water.png',
  sakuraTree: 'assets/environment/sakura_tree.png',
  tenshuCastle: 'assets/environment/tenshu_castle.png',
  palaceWing: 'assets/environment/palace_wing.png',
  bridgeTaiko: 'assets/environment/bridge_taiko_ns.png',
  castleGate: 'assets/environment/castle_gate.png',
  toriiGate: 'assets/environment/torii_gate.png',
  stoneLantern: 'assets/environment/stone_lantern.png',
  gardenBush: 'assets/environment/garden_bush.png',
  fernBush: 'assets/environment/fern_bush.png',
  steppingStone: 'assets/environment/stepping_stone.png',
  stoneWallBlock: 'assets/environment/stone_wall_block.png'
};

const ENV_CACHE = {};
const ENV_PATTERNS = {};

// 初始化预加载所有环境贴图与模型
if (typeof window !== 'undefined') {
  window.ENV_CACHE = ENV_CACHE;
  window.ENV_ASSETS = ENV_ASSETS;
  for (const [key, src] of Object.entries(ENV_ASSETS)) {
    const img = new Image();
    img.src = src;
    ENV_CACHE[key] = {
      img,
      loaded: false
    };
    img.onload = () => {
      ENV_CACHE[key].loaded = true;
    };
  }
}

/**
 * 缓存并获取平铺 Pattern
 */
function getEnvPattern(ctx, key) {
  if (ENV_PATTERNS[key]) return ENV_PATTERNS[key];
  if (ENV_CACHE[key] && ENV_CACHE[key].loaded) {
    try {
      ENV_PATTERNS[key] = ctx.createPattern(ENV_CACHE[key].img, 'repeat');
      return ENV_PATTERNS[key];
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * 六大战国名城专属地貌风貌体系 (City Biome Architecture)
 * 彻底消除千篇一律的绿草皮，为每座名城赋予独一无二的地表、植被、水体与氛围
 */
const CITY_BIOMES = {
  kiyosu: {
    id: 'kiyosu',
    name: '尾张 · 清洲城下',
    subtitle: '春日漫樱 · 织田家根据地',
    groundType: 'spring_meadow',
    roadType: 'stone_paved',
    waterType: 'moat_koi',
    waterGradient: ['#38bdf8', '#0ea5e9', '#0284c7'],
    bridgeType: 'taiko_vermilion',
    treeType: 'sakura_pink',
    treeHueRotate: 0,
    petalType: 'sakura',
    bannerType: 'oda',
    hasBraziers: false,
    hasTorii: true,
    hasLanterns: true
  },
  inabayama: {
    id: 'inabayama',
    name: '美浓 · 稻叶山城',
    subtitle: '赤枫险岳 · 斋藤家坚城要塞',
    groundType: 'autumn_mountain',
    roadType: 'mountain_slate',
    waterType: 'mountain_torrent',
    waterGradient: ['#0284c7', '#0369a1', '#075985'],
    bridgeType: 'timber_fortress',
    treeType: 'autumn_maple',
    treeHueRotate: 42,
    petalType: 'maple',
    bannerType: 'saito',
    hasBraziers: true,
    hasTorii: false,
    hasLanterns: false
  },
  sakai: {
    id: 'sakai',
    name: '摄津 · 界港商埠',
    subtitle: '金沙碧浪 · 南蛮黑船大商都',
    groundType: 'golden_beach',
    roadType: 'wooden_pier',
    waterType: 'ocean_waves',
    waterGradient: ['#06b6d4', '#0284c7', '#1e40af'],
    bridgeType: 'harbor_dock',
    treeType: 'coastal_palm',
    treeHueRotate: 135,
    petalType: 'sea_spray',
    bannerType: 'nanban',
    hasBraziers: false,
    hasTorii: false,
    hasLanterns: true
  },
  kyoto: {
    id: 'kyoto',
    name: '山城 · 京都御苑',
    subtitle: '枯山御砂 · 金银杏皇家名苑',
    groundType: 'karesansui_white',
    roadType: 'imperial_vermilion',
    waterType: 'lotus_pond',
    waterGradient: ['#0d9488', '#0f766e', '#115e59'],
    bridgeType: 'imperial_marble',
    treeType: 'golden_ginkgo',
    treeHueRotate: 75,
    petalType: 'ginkgo',
    bannerType: 'imperial',
    hasBraziers: false,
    hasTorii: true,
    hasLanterns: true
  },
  odawara: {
    id: 'odawara',
    name: '相模 · 小田原城',
    subtitle: '玄武坚壁 · 北条氏海防名城',
    groundType: 'basalt_rampart',
    roadType: 'fortress_slate',
    waterType: 'stormy_sea',
    waterGradient: ['#1e293b', '#0f172a', '#0369a1'],
    bridgeType: 'iron_drawbridge',
    treeType: 'black_pine',
    treeHueRotate: 160,
    petalType: 'sea_mist',
    bannerType: 'hojo',
    hasBraziers: true,
    hasTorii: false,
    hasLanterns: true
  },
  azuchi: {
    id: 'azuchi',
    name: '近江 · 安土幻城',
    subtitle: '紫藤神木 · 琵琶湖畔七层金阙',
    groundType: 'emerald_lakeside',
    roadType: 'gilded_marble',
    waterType: 'lake_biwa',
    waterGradient: ['#6366f1', '#4f46e5', '#3730a3'],
    bridgeType: 'golden_lacquer',
    treeType: 'purple_wisteria',
    treeHueRotate: 240,
    petalType: 'wisteria',
    bannerType: 'oda_gold',
    hasBraziers: false,
    hasTorii: true,
    hasLanterns: true
  }
};

if (typeof window !== 'undefined') {
  window.CITY_BIOMES = CITY_BIOMES;
}

class GameMap {
  constructor() {
    this.width = 1600;
    this.height = 1200;
    this.currentCityId = 'kiyosu';
    this.biome = CITY_BIOMES.kiyosu;
    this.theme = 'spring_sakura';

    // 地图静态障碍物 (保持碰撞判定完全精准)
    this.obstacles = [
      // 外围城墙边界
      { x: 0, y: 0, w: 1600, h: 40 },
      { x: 0, y: 1160, w: 1600, h: 40 },
      { x: 0, y: 0, w: 40, h: 1200 },
      { x: 1560, y: 0, w: 40, h: 1200 },

      // 樱花庭院内侧石墙 (两侧各留出中央御道 104px 门楼)
      { x: 40, y: 416, w: 448, h: 32 },
      { x: 592, y: 416, w: 968, h: 32 },

      // 护城河阻挡区域 (两岸河体，留出桥面通路 x: 488..592)
      { x: 40, y: 800, w: 448, h: 44 },
      { x: 592, y: 800, w: 968, h: 44 },

      // 天守阁两翼配殿 (Palace Wings)
      { x: 200, y: 100, w: 220, h: 180 },
      { x: 1180, y: 100, w: 220, h: 180 },

      // 天守阁主城楼基座屏障 (阻挡穿墙)
      { x: 380, y: 0, w: 320, h: 150 }
    ];

    // 盛开樱花巨木分布点位 (树干落地点及碰撞半径)
    this.trees = [
      { x: 220, y: 950, r: 46 },
      { x: 390, y: 1040, r: 44 },
      { x: 1220, y: 950, r: 46 },
      { x: 1400, y: 1040, r: 44 },
      { x: 150, y: 640, r: 46 }, // 避让西侧演武场黄金宝箱(260, 620)
      { x: 360, y: 520, r: 44 },
      { x: 1240, y: 620, r: 46 },
      { x: 1400, y: 520, r: 44 },
      { x: 740, y: 220, r: 48 },
      { x: 940, y: 220, r: 48 }
    ];

    // 春日型长明石灯笼点位
    this.lanterns = [
      { x: 466, y: 870 },
      { x: 614, y: 870 },
      { x: 466, y: 730 },
      { x: 614, y: 730 },
      { x: 466, y: 460 },
      { x: 614, y: 460 },
      { x: 460, y: 220 },
      { x: 620, y: 220 }
    ];

    // 庭院自然灌木簇分布
    this.bushes = [
      { x: 120, y: 782, type: 'bush' },
      { x: 260, y: 782, type: 'fern' },
      { x: 420, y: 782, type: 'bush' },
      { x: 660, y: 782, type: 'fern' },
      { x: 880, y: 782, type: 'bush' },
      { x: 1120, y: 782, type: 'fern' },
      { x: 1360, y: 782, type: 'bush' },
      { x: 150, y: 980, type: 'bush' },
      { x: 310, y: 1060, type: 'fern' },
      { x: 1290, y: 980, type: 'bush' },
      { x: 1460, y: 1060, type: 'fern' },
      { x: 160, y: 560, type: 'bush' },
      { x: 310, y: 470, type: 'fern' },
      { x: 1200, y: 560, type: 'fern' },
      { x: 1360, y: 470, type: 'bush' },
      { x: 430, y: 310, type: 'fern' },
      { x: 650, y: 310, type: 'bush' },
      { x: 770, y: 260, type: 'bush' },
      { x: 890, y: 260, type: 'fern' }
    ];

    // 庭院自然踏脚石步道 (草地上优雅蜿蜒的飞石)
    this.steppingStones = [
      // 西侧草坪小径通往黄金宝箱
      { x: 460, y: 565 },
      { x: 420, y: 550 },
      { x: 380, y: 540 },
      { x: 340, y: 540 },
      { x: 300, y: 555 },
      { x: 270, y: 585 },
      // 东侧草坪通往幽静樱花林
      { x: 620, y: 565 },
      { x: 660, y: 550 },
      { x: 700, y: 540 },
      { x: 740, y: 545 },
      { x: 780, y: 565 }
    ];

    // 关卡守门配置 (默认全开，畅通无阻，自由巡游探索)
    this.gates = [
      { id: 'gate-1', x: 488, y: 740, w: 104, h: 36, isOpen: true, name: '清洲城下南回廊' },
      { id: 'gate-2', x: 488, y: 414, w: 104, h: 36, isOpen: true, name: '天守御道正阙门' }
    ];

    // 护城河悠游锦鲤 (Nishikigoi)
    this.koiFish = [
      { x: 180, y: 822, speed: 0.6, length: 18, color: '#ea580c', spotColor: '#ffffff' },
      { x: 360, y: 818, speed: 0.45, length: 16, color: '#dc2626', spotColor: '#0f172a' },
      { x: 780, y: 824, speed: 0.55, length: 20, color: '#f59e0b', spotColor: '#ffffff' },
      { x: 1020, y: 816, speed: 0.7, length: 17, color: '#ea580c', spotColor: '#7c2d12' },
      { x: 1320, y: 822, speed: 0.5, length: 19, color: '#dc2626', spotColor: '#fde047' }
    ];

    // 随风漫天飘落的环境氛围粒子池
    this.petals = [];
    this.barricades = [];
    this.braziers = [];
    this.banners = [];
    this.theme = 'spring_sakura';
    this.stageIndex = 1;

    // 自驱立志探索实体：鸟居古神碑、南蛮商馆、藏金宝箱、森林小狸猫
    this.interactiveNodes = [
      {
        id: 'node-stele',
        type: 'stele',
        x: 340,
        y: 960,
        w: 52,
        h: 70,
        name: '鸟居神秘古神碑',
        icon: '⛩️',
        desc: '残存着西洋言灵符文的古代石碑，破译可得古神庇佑与真言宝藏',
        isSolved: false
      },
      {
        id: 'node-nanban',
        type: 'nanban',
        x: 740,
        y: 960,
        w: 64,
        h: 60,
        name: '西洋南蛮商馆',
        icon: '⛵',
        desc: '葡萄牙船长的商馆，用南蛮英语达成外交贸易与货物调配',
        isSolved: false
      },
      {
        id: 'node-chest-1',
        type: 'chest',
        x: 240,
        y: 620,
        w: 48,
        h: 40,
        name: '落樱古禅宝箱',
        icon: '🎁',
        desc: '落樱神木旁遗留的纯金宝箱，解开密语可得西洋密宝',
        isSolved: false
      },
      {
        id: 'node-spirit',
        type: 'spirit',
        x: 550,
        y: 520,
        w: 48,
        h: 48,
        name: '尾张萌狸「信乐」',
        icon: '🍃',
        desc: '森林里爱收集西方卡片的小狸猫，渴望听懂发音',
        isSolved: false
      },
      {
        id: 'node-chest-2',
        type: 'chest',
        x: 820,
        y: 460,
        w: 48,
        h: 40,
        name: '东林秘藏金箱',
        icon: '✨',
        desc: '掩映在东林竹径的珍稀财宝箱',
        isSolved: false
      }
    ];

    // 塞尔达式自然草甸生态野花点位
    this.wildflowers = [];
    this.initWildflowers();

    this.setStage(1);
  }

  /**
   * 初始化春日草甸野花点位 (雏菊、毛茛、三叶草)
   */
  initWildflowers() {
    this.wildflowers = [
      { x: 120, y: 920, type: 'chamomile' },
      { x: 180, y: 980, type: 'clover' },
      { x: 260, y: 930, type: 'buttercup' },
      { x: 290, y: 1010, type: 'chamomile' },
      { x: 380, y: 920, type: 'clover' },
      { x: 420, y: 1000, type: 'buttercup' },
      { x: 640, y: 930, type: 'chamomile' },
      { x: 680, y: 1020, type: 'clover' },
      { x: 800, y: 940, type: 'buttercup' },
      { x: 840, y: 1010, type: 'chamomile' },
      { x: 920, y: 960, type: 'clover' },
      { x: 1000, y: 920, type: 'buttercup' },
      { x: 1060, y: 1010, type: 'chamomile' },
      { x: 1140, y: 950, type: 'clover' },
      { x: 1280, y: 930, type: 'chamomile' },
      { x: 1340, y: 1010, type: 'buttercup' },
      { x: 1440, y: 940, type: 'clover' },
      { x: 1480, y: 1020, type: 'chamomile' },
      // 北部草坪
      { x: 120, y: 520, type: 'chamomile' },
      { x: 180, y: 480, type: 'buttercup' },
      { x: 220, y: 560, type: 'clover' },
      { x: 320, y: 510, type: 'chamomile' },
      { x: 400, y: 490, type: 'buttercup' },
      { x: 660, y: 490, type: 'clover' },
      { x: 720, y: 530, type: 'chamomile' },
      { x: 820, y: 490, type: 'buttercup' },
      { x: 900, y: 530, type: 'clover' },
      { x: 1020, y: 500, type: 'chamomile' },
      { x: 1100, y: 540, type: 'buttercup' },
      { x: 1200, y: 490, type: 'clover' },
      { x: 1300, y: 530, type: 'chamomile' },
      { x: 1420, y: 490, type: 'buttercup' },
      { x: 1480, y: 540, type: 'clover' },
      // 南部下方
      { x: 160, y: 1080, type: 'buttercup' },
      { x: 240, y: 1120, type: 'chamomile' },
      { x: 330, y: 1100, type: 'clover' },
      { x: 430, y: 1110, type: 'chamomile' },
      { x: 640, y: 1110, type: 'buttercup' },
      { x: 750, y: 1120, type: 'chamomile' },
      { x: 860, y: 1100, type: 'clover' },
      { x: 960, y: 1120, type: 'buttercup' },
      { x: 1080, y: 1110, type: 'chamomile' },
      { x: 1200, y: 1120, type: 'clover' },
      { x: 1320, y: 1100, type: 'buttercup' },
      { x: 1420, y: 1120, type: 'chamomile' }
    ];
  }

  /**
   * 根据当前关卡序号与战役单元设置地貌 Biome 与专属城池场景
   */
  setStage(stageIndex = 1, unitId = null, cityId = null) {
    this.stageIndex = stageIndex;

    // 1. 确定名城专属场景 Biome (支持显式指定城池或依关卡自动对应)
    if (cityId && CITY_BIOMES[cityId]) {
      this.currentCityId = cityId;
    } else {
      if (stageIndex >= 51) this.currentCityId = 'azuchi';
      else if (stageIndex >= 41) this.currentCityId = 'odawara';
      else if (stageIndex >= 31) this.currentCityId = 'kyoto';
      else if (stageIndex >= 21) this.currentCityId = 'sakai';
      else if (stageIndex >= 11) this.currentCityId = 'inabayama';
      else this.currentCityId = 'kiyosu';
    }

    this.biome = CITY_BIOMES[this.currentCityId] || CITY_BIOMES.kiyosu;
    this.theme = this.biome.id;

    // 2. 桥梁护栏（大地图全面自由畅通，移除所有阻挡行动的拒马）
    this.barricades = [
      { x: 446, y: 810, w: 38, h: 26, name: '桥西护栏' },
      { x: 596, y: 810, w: 38, h: 26, name: '桥东护栏' }
    ];
    if (this.gates) {
      this.gates.forEach(g => g.isOpen = true);
    }

    // 3. 行军篝火盆 (依据城池地貌布置：美浓山城/小田原要塞配置战国篝火)
    this.braziers = [];
    if (this.biome.hasBraziers) {
      this.braziers.push({ x: 440, y: 860 });
      this.braziers.push({ x: 640, y: 860 });
      this.braziers.push({ x: 440, y: 460 });
      this.braziers.push({ x: 640, y: 460 });
      this.braziers.push({ x: 260, y: 680 });
    }

    // 4. 战国名城军旗 (依各城所属大名阵营家纹)
    this.banners = [
      { x: 454, y: 710, type: this.biome.bannerType },
      { x: 626, y: 710, type: this.biome.bannerType },
      { x: 454, y: 396, type: this.biome.bannerType },
      { x: 626, y: 396, type: this.biome.bannerType }
    ];

    // 5. 初始化当前城池专属环境粒子 (落樱 / 枫叶 / 银杏 / 海沫 / 紫藤)
    this.initThemeParticles();
  }

  initThemeParticles() {
    this.petals = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 4 + Math.random() * 4,
        speedX: 0.6 + Math.random() * 1.0,
        speedY: 0.4 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0.5 + Math.random() * 0.45
      });
    }
  }

  isColliding(x, y, radius = 18) {
    // 1. 矩形墙体与水体
    for (const ob of this.obstacles) {
      if (
        x + radius > ob.x &&
        x - radius < ob.x + ob.w &&
        y + radius > ob.y &&
        y - radius < ob.y + ob.h
      ) {
        return true;
      }
    }

    // 2. 闭锁大门
    for (const gate of this.gates) {
      if (!gate.isOpen) {
        if (
          x + radius > gate.x &&
          x - radius < gate.x + gate.w &&
          y + radius > gate.y &&
          y - radius < gate.y + gate.h
        ) {
          return true;
        }
      }
    }

    // 3. 树木圆形树干阻挡
    for (const tree of this.trees) {
      const dx = x - tree.x;
      const dy = y - (tree.y + 15);
      if (Math.hypot(dx, dy) < radius + tree.r * 0.35) {
        return true;
      }
    }

    // 4. 木拒马尖刺路障阻挡 (真正的地牢障碍判定)
    for (const bar of this.barricades) {
      if (
        x + radius > bar.x &&
        x - radius < bar.x + bar.w &&
        y + radius > bar.y &&
        y - radius < bar.y + bar.h
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * 绘制大地图与全景环境
   */
  draw(ctx, viewX, viewY, viewW, viewH, tick) {
    // 1. 底层：青翠高精度无缝和风草坪地表 (Grass Turf Tile)
    this.drawGrassGround(ctx);

    // 2. 枯山水白砂砂砾缓冲带 (Karesansui Raked Gravel)
    this.drawKaresansuiBorders(ctx);

    // 3. 延段青石板大道 (南北中央御道与东西演武大道)
    this.drawStoneAvenues(ctx);

    // 4. 踏脚石步道 (Stepping Stones on lawn)
    this.drawSteppingStones(ctx);

    // 5. 护城河波光流水、石垣驳岸与悠游锦鲤 (Sparkling Moat & Nishikigoi)
    this.drawMoatAndKoi(ctx, tick);

    // 6. 朱红太鼓木桥 (Taiko Arched Bridge across the moat)
    this.drawTaikoBridge(ctx);

    // 7. 雄伟天守阁殿宇 (Tenshu Palace Keep Pagoda)
    this.drawTenshuCastle(ctx);

    // 8. 战国石垣城垣、黑瓦当飞檐与殿宇配殿 (Castle Ramparts & Palace Wings)
    this.drawCastleRamparts(ctx);

    // 9. 朱红神圣鸟居 (Torii Gate)
    this.drawToriiGate(ctx);

    // 10. 守关城门 (闭锁封印或洞开通关)
    this.drawGates(ctx, tick);

    // 10.1 战国尖刺木拒马 (随关卡变动的地牢障碍物)
    this.drawBarricades(ctx);

    // 10.2 迎风猎猎战国军旗
    this.drawBanners(ctx, tick);

    // 11. 庭院自然花灌木与苍翠蕨类 (Garden Azaleas & Ferns)
    this.drawGardenFoliage(ctx, tick);

    // 12. 春日型长明石灯笼 (带夜明柔和暖晕)
    this.drawLanterns(ctx, tick);

    // 12.1 跳动烈焰的行军篝火盆
    this.drawBraziers(ctx, tick);

    // 12.2 方向2：塞尔达式环境解谜互动实体 (神社古碑、南蛮商会)
    this.drawInteractiveNodes(ctx, tick);

    // 12.3 大世界神秘宝藏微光星辰粒子
    if (window.treasureHuntSystem) {
      window.treasureHuntSystem.drawMapSparkles(ctx, { x: 0, y: 0 });
    }

    // 13. 盛开古木 (春日漫樱 / 秋暮红枫 / 幽夜古松竹林 / 破晓紫藤花瀑)
    this.drawCherryBlossomTrees(ctx, tick);

    // 14. 漫天环境氛围粒子 (落樱花瓣 / 金红落枫 / 幽夜萤火虫 / 破晓金箔)
    this.drawGlobalPetals(ctx, tick);

    // 15. 全局主题氛围光照滤镜 (晨曦金辉 / 夕阳暮色 / 幽蓝月色)
    this.drawAmbientLighting(ctx);
  }

  /**
   * 1. 绘制高精度地貌地表 (吉卜力/塞尔达荒野之息 清新明媚草甸)
   */
  drawGrassGround(ctx) {
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const gType = biome.groundType;

    if (gType === 'autumn_mountain') {
      // 美浓 · 稻叶山城：赤褐险峻山岳岩地与深秋红土
      ctx.fillStyle = '#672a08';
      ctx.fillRect(0, 0, this.width, this.height);

      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, '#532005');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#3b1603');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 山岳天然岩盘深色暗斑与碎石块
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let rx = 30; rx < this.width; rx += 75) {
        for (let ry = 30; ry < this.height; ry += 85) {
          const shift = Math.sin(rx * 0.3 + ry * 0.5) * 20;
          ctx.beginPath();
          ctx.ellipse(rx + shift, ry, 14, 8, shift * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 散落碎红枫叶在岩地上
      ctx.fillStyle = '#dc2626';
      for (let lx = 50; lx < this.width; lx += 90) {
        for (let ly = 60; ly < this.height; ly += 110) {
          const ox = Math.cos(lx + ly) * 25;
          const oy = Math.sin(lx * 2) * 20;
          ctx.beginPath();
          ctx.arc(lx + ox, ly + oy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (gType === 'golden_beach') {
      // 摄津 · 界港：温暖细腻金色海滩沙丘
      const sandGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      sandGrad.addColorStop(0, '#fef08a');
      sandGrad.addColorStop(0.3, '#fde047');
      sandGrad.addColorStop(0.7, '#facc15');
      sandGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 海风吹拂的柔和波状沙纹
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
      ctx.lineWidth = 2;
      for (let sy = 50; sy < this.height; sy += 38) {
        ctx.beginPath();
        for (let sx = 0; sx < this.width; sx += 40) {
          const wave = Math.sin(sx * 0.05 + sy * 0.1) * 4;
          if (sx === 0) ctx.moveTo(sx, sy + wave);
          else ctx.lineTo(sx, sy + wave);
        }
        ctx.stroke();
      }

      // 散落五彩海贝与小海星
      for (let bx = 70; bx < this.width; bx += 120) {
        for (let by = 90; by < this.height; by += 130) {
          const sx = bx + Math.sin(by) * 35;
          const sy = by + Math.cos(bx) * 25;
          // 小白贝壳
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI);
          ctx.fill();
          // 小橘海星
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(sx + 15, sy + 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (gType === 'karesansui_white') {
      // 山城 · 京都皇城：白砂枯山水庭院
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, this.width, this.height);

      // 细腻白砂平铺条纹
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      for (let y = 10; y < this.height; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // 枯山水回旋石波纹与禅宗奇石
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      const zenCenters = [
        { x: 300, y: 700 }, { x: 1200, y: 700 },
        { x: 280, y: 350 }, { x: 1250, y: 350 }
      ];
      for (const z of zenCenters) {
        for (let r = 16; r <= 60; r += 10) {
          ctx.beginPath();
          ctx.arc(z.x, z.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        // 核心青石
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(z.x, z.y, 16, 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (gType === 'basalt_rampart') {
      // 相模 · 小田原城：坚硬玄武岩要塞石坪
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let x = 0; x < this.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = 0; y < this.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

    } else if (gType === 'emerald_lakeside') {
      // 近江 · 安土幻城：浓翠翡翠湖畔神域
      const lakeGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      lakeGrad.addColorStop(0, '#14532d');
      lakeGrad.addColorStop(0.5, '#166534');
      lakeGrad.addColorStop(1, '#0f3c22');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // 紫藤花瓣与金粉落英
      ctx.fillStyle = 'rgba(216, 180, 254, 0.45)';
      for (let x = 40; x < this.width; x += 80) {
        for (let y = 50; y < this.height; y += 90) {
          const ox = Math.sin(x + y) * 20;
          ctx.beginPath();
          ctx.arc(x + ox, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else {
      // 尾张 · 清洲城（默认）：温润平原春日嫩绿草坪
      const grassPattern = getEnvPattern(ctx, 'grass');
      if (grassPattern) {
        ctx.fillStyle = grassPattern;
        ctx.fillRect(0, 0, this.width, this.height);
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(0, 0, this.width, this.height);
      }

      const vGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      vGrad.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
      vGrad.addColorStop(0.3, 'rgba(134, 239, 172, 0.16)');
      vGrad.addColorStop(0.7, 'rgba(74, 222, 128, 0.12)');
      vGrad.addColorStop(1, 'rgba(34, 197, 94, 0.06)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      this.drawMeadowWildflowers(ctx);
    }
  }

  /**
   * 1.1 绘制草甸野花点缀 (雏菊、毛茛、三叶草)
   */
  drawMeadowWildflowers(ctx) {
    if (!this.wildflowers) return;
    for (const f of this.wildflowers) {
      if (f.type === 'chamomile') {
        // 小白菊：5 个圆润白花瓣 + 金色花蕊
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(f.x + Math.cos(ang) * 3, f.y + Math.sin(ang) * 3, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.type === 'buttercup') {
        // 金黄毛茛野花
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI * 2) / 4 + 0.3;
          ctx.beginPath();
          ctx.arc(f.x + Math.cos(ang) * 2.8, f.y + Math.sin(ang) * 2.8, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.type === 'clover') {
        // 翠绿三叶草草茎与叶片
        ctx.fillStyle = '#86efac';
        for (let i = 0; i < 3; i++) {
          const ang = (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(f.x + Math.cos(ang) * 2.5, f.y + Math.sin(ang) * 2.5, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * 2. 绘制枯山水白砂砂带 (纯净白砂美学)
   */
  drawKaresansuiBorders(ctx) {
    const biome = this.biome || CITY_BIOMES.kiyosu;
    if (biome.groundType === 'golden_beach') {
      // 界港海港：两侧由深木桩与缆绳护边
      ctx.fillStyle = '#78350f';
      ctx.fillRect(478, 40, 10, 1120);
      ctx.fillRect(592, 40, 10, 1120);
      return;
    }
    if (biome.groundType === 'autumn_mountain') {
      // 稻叶山城：碎石护路石
      ctx.fillStyle = '#451a03';
      ctx.fillRect(478, 40, 10, 1120);
      ctx.fillRect(592, 40, 10, 1120);
      return;
    }
    if (biome.groundType === 'basalt_rampart') {
      // 小田原：玄武铁骨压条
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(478, 40, 10, 1120);
      ctx.fillRect(592, 40, 10, 1120);
      return;
    }
    // 默认/京都/清洲/安土
    ctx.fillStyle = biome.groundType === 'emerald_lakeside' ? '#f59e0b' : '#f8fafc';
    ctx.fillRect(476, 40, 12, 1120);
    ctx.fillRect(592, 40, 12, 1120);
    ctx.fillRect(78, 584, 1444, 11);
    ctx.fillRect(78, 665, 1444, 11);

    // 砂石梳理线条
    ctx.strokeStyle = biome.groundType === 'emerald_lakeside' ? '#d97706' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let sy = 40; sy < 1160; sy += 16) {
      ctx.beginPath();
      ctx.moveTo(478, sy);
      ctx.lineTo(486, sy);
      ctx.moveTo(594, sy);
      ctx.lineTo(602, sy);
      ctx.stroke();
    }
  }

  /**
   * 3. 绘制名城专属大道 (青石/山道碎石/码头木栈道/皇家朱红砖/汉白玉)
   */
  drawStoneAvenues(ctx) {
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const rType = biome.roadType;

    if (rType === 'mountain_slate') {
      // 美浓稻叶山：崎岖山道碎石小径 (深灰岩石拼合)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(486, 40, 108, 1120);
      ctx.fillRect(76, 593, 1448, 74);

      ctx.fillStyle = '#334155';
      ctx.fillRect(488, 40, 104, 1120);
      ctx.fillRect(78, 595, 1444, 70);

      // 岩石拼缝
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      for (let y = 45; y < 1160; y += 32) {
        ctx.beginPath();
        ctx.moveTo(488, y);
        ctx.lineTo(592, y + (y % 16) - 8);
        ctx.stroke();
      }

    } else if (rType === 'wooden_pier') {
      // 摄津界港：海港木质栈桥栈道 (横条厚木板与铁钉)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(486, 40, 108, 1120);
      ctx.fillRect(76, 593, 1448, 74);

      ctx.fillStyle = '#b45309';
      ctx.fillRect(488, 40, 104, 1120);
      ctx.fillRect(78, 595, 1444, 70);

      // 木板横纹与铁钉
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      for (let y = 44; y < 1160; y += 18) {
        ctx.beginPath();
        ctx.moveTo(488, y);
        ctx.lineTo(592, y);
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(492, y - 2, 2, 2);
        ctx.fillRect(588, y - 2, 2, 2);
      }

    } else if (rType === 'imperial_vermilion') {
      // 山城京都：皇家朱红御道砖与金饰边
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(486, 40, 108, 1120);
      ctx.fillRect(76, 593, 1448, 74);

      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(488, 40, 104, 1120);
      ctx.fillRect(78, 595, 1444, 70);

      // 皇家回纹御砖缝
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      for (let y = 40; y < 1160; y += 24) {
        ctx.beginPath();
        ctx.moveTo(488, y);
        ctx.lineTo(592, y);
        ctx.stroke();
      }

    } else if (rType === 'gilded_marble') {
      // 近江安土：汉白玉金嵌御道
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(484, 40, 112, 1120);
      ctx.fillRect(74, 591, 1452, 78);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(488, 40, 104, 1120);
      ctx.fillRect(78, 595, 1444, 70);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let y = 40; y < 1160; y += 30) {
        ctx.beginPath();
        ctx.moveTo(488, y);
        ctx.lineTo(592, y);
        ctx.stroke();
      }

    } else if (rType === 'fortress_slate') {
      // 相模小田原：重甲要塞石路
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(486, 40, 108, 1120);
      ctx.fillRect(76, 593, 1448, 74);

      ctx.fillStyle = '#475569';
      ctx.fillRect(488, 40, 104, 1120);
      ctx.fillRect(78, 595, 1444, 70);

    } else {
      // 尾张清洲（默认）：温润和风青石板大道
      const roadPattern = getEnvPattern(ctx, 'road');
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(486, 40, 108, 1120);
      ctx.fillRect(76, 593, 1448, 74);

      if (roadPattern) {
        ctx.fillStyle = roadPattern;
        ctx.fillRect(488, 40, 104, 1120);
        ctx.fillRect(78, 595, 1444, 70);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(488, 40, 104, 1120);
        ctx.fillRect(78, 595, 1444, 70);
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(488, 40, 104, 1120);
        ctx.fillRect(78, 595, 1444, 70);
      }

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(487, 40, 3, 1120);
      ctx.fillRect(590, 40, 3, 1120);
      ctx.fillRect(78, 594, 1444, 3);
      ctx.fillRect(78, 663, 1444, 3);
    }
  }

  /**
   * 4. 绘制踏脚石步道 (草地飞石)
   */
  drawSteppingStones(ctx) {
    const stoneAsset = ENV_CACHE.steppingStone;
    if (stoneAsset && stoneAsset.loaded) {
      for (const st of this.steppingStones) {
        // 泥土浅坑倒影
        ctx.fillStyle = 'rgba(20, 35, 20, 0.18)';
        ctx.beginPath();
        ctx.ellipse(st.x, st.y + 4, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(stoneAsset.img, st.x - 24, st.y - 17, 48, 34);
      }
    }
  }

  /**
   * 5. 绘制透亮琉璃护城河/急流山涧/港口波涛/御池莲花 (依据名城地貌)
   */
  drawMoatAndKoi(ctx, tick) {
    const moatY = 800;
    const moatH = 44;
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const wType = biome.waterType;

    // 1. 两岸驳岸基座
    let bankColor = '#e2e8f0';
    if (wType === 'ocean_waves') bankColor = '#ca8a04'; // 沙岸木桩
    else if (wType === 'mountain_torrent') bankColor = '#451a03'; // 岩岸
    else if (wType === 'stormy_sea') bankColor = '#1e293b'; // 玄武石堤
    else if (wType === 'lotus_pond') bankColor = '#f59e0b'; // 金玉石岸

    ctx.fillStyle = bankColor;
    ctx.fillRect(40, moatY - 14, 448, 14);
    ctx.fillRect(592, moatY - 14, 968, 14);
    ctx.fillRect(40, moatY + moatH, 448, 14);
    ctx.fillRect(592, moatY + moatH, 968, 14);

    // 2. 水体渐变
    const waterGrad = ctx.createLinearGradient(0, moatY, 0, moatY + moatH);
    const colors = biome.waterGradient || ['#38bdf8', '#0ea5e9', '#0284c7'];
    waterGrad.addColorStop(0, colors[0]);
    waterGrad.addColorStop(0.5, colors[1]);
    waterGrad.addColorStop(1, colors[2]);

    ctx.fillStyle = waterGrad;
    ctx.fillRect(40, moatY, 448, moatH);
    ctx.fillRect(592, moatY, 968, moatH);

    // 3. 水体专属动态特征
    if (wType === 'ocean_waves') {
      // 摄津界港：大海浪花白沫与浮标
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.5;
      for (let rx = 50; rx < this.width - 60; rx += 55) {
        if (rx >= 475 && rx <= 605) continue;
        const wave = Math.sin(tick * 0.09 + rx * 0.07) * 4;
        ctx.beginPath();
        ctx.moveTo(rx, moatY + 12 + wave);
        ctx.bezierCurveTo(rx + 15, moatY + 6 + wave, rx + 30, moatY + 18 + wave, rx + 45, moatY + 12 + wave);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rx + 22, moatY + 10 + wave, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 海上红色浮标
      for (let bx = 160; bx < this.width - 160; bx += 280) {
        if (bx >= 460 && bx <= 620) continue;
        const bBob = Math.sin(tick * 0.08 + bx) * 3;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, moatY + 22 + bBob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.fillRect(bx - 1.5, moatY + 14 + bBob, 3, 5);
      }

    } else if (wType === 'mountain_torrent') {
      // 美浓稻叶山：湍急山涧飞瀑急流与溪石
      ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)';
      ctx.lineWidth = 2;
      for (let rx = 50; rx < this.width - 60; rx += 35) {
        if (rx >= 475 && rx <= 605) continue;
        const speed = (tick * 4 + rx * 3) % 40;
        ctx.beginPath();
        ctx.moveTo(rx + speed, moatY + 8);
        ctx.lineTo(rx + speed + 18, moatY + 8);
        ctx.moveTo(rx - speed + 20, moatY + 24);
        ctx.lineTo(rx - speed + 42, moatY + 24);
        ctx.stroke();
      }

      // 溪水凸起巨石与溅水花
      const rocks = [140, 290, 720, 950, 1280];
      for (const rx of rocks) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(rx, moatY + 22, 10, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(rx - 8, moatY + 22, 3, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (wType === 'lotus_pond') {
      // 山城京都：静谧御池与碧绿荷叶粉莲
      for (let lx = 90; lx < this.width - 90; lx += 110) {
        if (lx >= 460 && lx <= 620) continue;
        const ly = moatY + 14 + (lx % 16);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(lx, ly, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(lx, ly, 2, 0, Math.PI * 2);
        ctx.fill();

        if (lx % 2 === 0) {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(lx + 6, ly - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(lx + 6, ly - 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    } else if (wType === 'lake_biwa') {
      // 近江安土：烟波浩渺琵琶湖神光微波
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1.5;
      for (let rx = 60; rx < this.width - 60; rx += 45) {
        if (rx >= 475 && rx <= 605) continue;
        const wave = Math.sin(tick * 0.05 + rx * 0.06) * 3;
        ctx.beginPath();
        ctx.moveTo(rx, moatY + 16 + wave);
        ctx.lineTo(rx + 28, moatY + 16 + wave);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(rx + 14, moatY + 15 + wave, 2, 2);
      }

    } else {
      // 尾张清洲（默认）：碧波护城河与锦鲤
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      for (let rx = 55; rx < this.width - 60; rx += 42) {
        if (rx >= 475 && rx <= 605) continue;
        const wave = Math.sin(tick * 0.08 + rx * 0.08) * 3;
        ctx.beginPath();
        ctx.moveTo(rx, moatY + 14 + wave);
        ctx.quadraticCurveTo(rx + 14, moatY + 9 + wave, rx + 28, moatY + 14 + wave);
        ctx.stroke();

        if ((rx + Math.floor(tick / 15)) % 84 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + 13, moatY + 10 + wave, 2.5, 2.5);
        }
      }

      if (this.koiFish) {
        for (const koi of this.koiFish) {
          koi.x += koi.speed;
          if (koi.x > this.width - 60) koi.x = 60;
          if (koi.x >= 485 && koi.x <= 595) continue;

          const wiggle = Math.sin(tick * 0.2 + koi.x * 0.1) * 3;
          const ky = koi.y + wiggle * 0.5;

          ctx.save();
          ctx.translate(koi.x, ky);

          ctx.fillStyle = 'rgba(2, 44, 34, 0.22)';
          ctx.beginPath();
          ctx.ellipse(0, 4, koi.length * 0.6, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = koi.color;
          ctx.beginPath();
          ctx.moveTo(-koi.length * 0.5, 0);
          ctx.quadraticCurveTo(0, -4.5, koi.length * 0.5, 0);
          ctx.quadraticCurveTo(0, 4.5, -koi.length * 0.5, 0);
          ctx.fill();

          ctx.fillStyle = koi.spotColor;
          ctx.beginPath();
          ctx.ellipse(koi.length * 0.1, -1, 3.2, 2.2, 0.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = koi.color;
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(-koi.length * 0.5, 0);
          ctx.lineTo(-koi.length * 0.8, wiggle * 1.5);
          ctx.stroke();

          ctx.restore();
        }
      }
    }
  }

  /**
   * 6. 绘制名城专属桥梁 (太鼓桥/要塞重木栈桥/海港栈桥/汉白玉金栏桥)
   */
  drawTaikoBridge(ctx) {
    const bx = 488;
    const by = 784;
    const bw = 104;
    const bh = 76;
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const bType = biome.bridgeType;

    // 桥底阴影
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(bx, 800, bw, 44);

    if (bType === 'timber_fortress') {
      // 美浓稻叶山：重木要塞栈桥 (深色厚原木排)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx, by, bw, bh);

      ctx.fillStyle = '#78350f';
      for (let y = by + 4; y < by + bh - 4; y += 12) {
        ctx.fillRect(bx + 4, y, bw - 8, 9);
      }
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx, by, 8, bh);
      ctx.fillRect(bx + bw - 8, by, 8, bh);

    } else if (bType === 'harbor_dock') {
      // 摄津界港：海港木质栈桥与系缆桩
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx, by, bw, bh);

      ctx.fillStyle = '#b45309';
      for (let y = by + 3; y < by + bh - 3; y += 10) {
        ctx.fillRect(bx + 6, y, bw - 12, 7);
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx + 2, by + 10, 8, 14);
      ctx.fillRect(bx + 2, by + bh - 24, 8, 14);
      ctx.fillRect(bx + bw - 10, by + 10, 8, 14);
      ctx.fillRect(bx + bw - 10, by + bh - 24, 8, 14);

    } else if (bType === 'imperial_marble') {
      // 山城京都：汉白玉拱桥与金莲花望柱
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx, by, bw, bh);

      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(bx + 18, by, bw - 36, bh);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx, by, 12, bh);
      ctx.fillRect(bx + bw - 12, by, 12, bh);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bx + 6, by + 6, 5, 0, Math.PI * 2);
      ctx.arc(bx + 6, by + bh - 6, 5, 0, Math.PI * 2);
      ctx.arc(bx + bw - 6, by + 6, 5, 0, Math.PI * 2);
      ctx.arc(bx + bw - 6, by + bh - 6, 5, 0, Math.PI * 2);
      ctx.fill();

    } else if (bType === 'golden_lacquer') {
      // 近江安土：纯金泥漆御桥
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(bx, by, bw, bh);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(bx + 8, by + 4, bw - 16, bh - 8);

      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(bx + 24, by, bw - 48, bh);

    } else {
      // 尾张清洲（默认）：朱红太鼓木桥
      const bridgeAsset = ENV_CACHE.bridgeTaiko;
      if (bridgeAsset && bridgeAsset.loaded) {
        ctx.drawImage(bridgeAsset.img, bx, by, bw, bh);
      } else {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx + 4, by, 8, bh);
        ctx.fillRect(bx + bw - 12, by, 8, bh);
      }
    }
  }

  /**
   * 7. 绘制北方王座：雄伟天守阁殿宇 (Tenshu Palace Keep Pagoda)
   */
  drawTenshuCastle(ctx) {
    const tenshuAsset = ENV_CACHE.tenshuCastle;
    if (tenshuAsset && tenshuAsset.loaded) {
      // 位于北侧大将身后主殿中心 (大将位于 x: 550, y: 180)
      const cw = 380;
      const ch = 410;
      const cx = 540 - cw / 2; // 350
      const cy = -230;

      // 城堡地面基座投射阴影 (刚好托在天守阁基座底部 y: 175)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
      ctx.beginPath();
      ctx.ellipse(540, 172, 190, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // 绘制天守阁模型
      ctx.drawImage(tenshuAsset.img, cx, cy, cw, ch);
    }
  }

  /**
   * 8. 绘制战国野面积城垣石垣、黑瓦当飞檐与殿宇配殿 (Palace Wings)
   */
  drawCastleRamparts(ctx) {
    const wallPattern = getEnvPattern(ctx, 'stoneWall');
    const palaceAsset = ENV_CACHE.palaceWing;

    // 1. 绘制东西两侧殿宇配殿 (取代粗糙几何方块)
    if (palaceAsset && palaceAsset.loaded) {
      // 左翼配殿 (x: 200, y: 100, w: 220, h: 180)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(310, 276, 105, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(palaceAsset.img, 195, 92, 230, 188);

      // 右翼配殿 (x: 1180, y: 100, w: 220, h: 180)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(1290, 276, 105, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(palaceAsset.img, 1175, 92, 230, 188);
    }

    // 2. 绘制常规城垣石墙与内侧回廊
    for (const ob of this.obstacles) {
      // 护城河、天守阁与配殿由专属逻辑绘制
      if (
        ob.y === 800 ||
        (ob.x === 380 && ob.y === 0) ||
        (ob.x === 200 && ob.y === 100) ||
        (ob.x === 1180 && ob.y === 100)
      ) {
        continue;
      }

      // 1. 石垣墙体
      if (wallPattern) {
        ctx.fillStyle = wallPattern;
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      }

      // 墙下泥土阴影
      ctx.fillStyle = 'rgba(10, 25, 15, 0.3)';
      ctx.fillRect(ob.x, ob.y + ob.h - 1, ob.w, 4);

      // 2. 顶部和瓦当黑瓦飞檐 (Kawara Roof Ridge)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(ob.x - 3, ob.y - 4, ob.w + 6, 8, 2);
      ctx.fill();

      // 瓦当金边
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ob.x - 1, ob.y + 1, ob.w + 2, 2);

      // 瓦当圆头滴水
      ctx.fillStyle = '#1e293b';
      for (let rx = ob.x + 8; rx < ob.x + ob.w - 6; rx += 18) {
        ctx.beginPath();
        ctx.arc(rx, ob.y + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * 9. 绘制北侧圣域朱红鸟居 (Torii Gate - 位于通往天守阁的御道中轴)
   */
  drawToriiGate(ctx) {
    const toriiAsset = ENV_CACHE.toriiGate;
    if (toriiAsset && toriiAsset.loaded) {
      // 位于 Gate 2 (y: 408) 与 Boss (y: 180) 之间: y: 280
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.beginPath();
      ctx.ellipse(540, 345, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(toriiAsset.img, 540 - 28, 275, 56, 76);
    }
  }

  /**
   * 10. 绘制守关城门
   */
  drawGates(ctx, tick) {
    const gateAsset = ENV_CACHE.castleGate;

    for (const gate of this.gates) {
      if (gate.isOpen) {
        // 门开启：两侧门扉敞开靠壁，道路保持干净通畅，不遮挡路面
        ctx.fillStyle = '#334155';
        ctx.fillRect(gate.x - 12, gate.y - 8, 10, 36);
        ctx.fillRect(gate.x + gate.w + 2, gate.y - 8, 10, 36);
      } else {
        // 门紧闭：优先绘制精灵图或重木寨门
        if (gateAsset && gateAsset.loaded) {
          ctx.drawImage(gateAsset.img, gate.x - 5, gate.y - 8, gate.w + 10, gate.h + 16);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(gate.x - 4, gate.y - 10, gate.w + 8, 36);
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(gate.x, gate.y - 8, gate.w, 32);
        }

        // 呼吸式黄金锁链
        const chainGlow = Math.sin(tick * 0.1) * 2;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(gate.x + 8, gate.y + 8);
        ctx.lineTo(gate.x + gate.w - 8, gate.y + 8);
        ctx.stroke();

        // 核心朱砂封印符
        ctx.save();
        ctx.translate(gate.x + gate.w / 2, gate.y + 8);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 13 + chainGlow * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('封', 0, 1);
        ctx.restore();

        // 门头交互提示气泡
        const badgeBob = Math.sin(tick * 0.1) * 2;
        ctx.save();
        ctx.translate(gate.x + gate.w / 2, gate.y - 18 + badgeBob);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-45, -10, 90, 20, 6);
        } else {
          ctx.rect(-45, -10, 90, 20);
        }
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🗝️ 暗号开门', 0, 1);
        ctx.restore();
      }
    }
  }

  /**
   * 11. 绘制庭院自然花灌木与苍翠蕨类 (Garden Foliage)
   */
  drawGardenFoliage(ctx, tick) {
    const bushAsset = ENV_CACHE.gardenBush;
    const fernAsset = ENV_CACHE.fernBush;

    for (const b of this.bushes) {
      const sway = Math.sin(tick * 0.05 + b.x) * 1.2;
      const asset = (b.type === 'bush' ? bushAsset : fernAsset);
      if (asset && asset.loaded) {
        ctx.drawImage(asset.img, b.x - 22 + sway, b.y - 18, 44, 36);
      }
    }
  }

  /**
   * 12. 绘制春日型长明石灯笼 (带夜明暖晕)
   */
  drawLanterns(ctx, tick) {
    const lanternAsset = ENV_CACHE.stoneLantern;

    for (const l of this.lanterns) {
      const flicker = Math.sin(tick * 0.15 + l.x) * 2;

      // 1. 地面散发暖色柔和黄晕
      const lightGrad = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, 40 + flicker);
      lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 40 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // 2. 精灵石灯笼
      if (lanternAsset && lanternAsset.loaded) {
        ctx.drawImage(lanternAsset.img, l.x - 14, l.y - 36, 28, 50);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(l.x - 8, l.y - 20, 16, 24);
      }
    }
  }

  /**
   * 10.1 绘制战国木拒马尖刺障碍物
   */
  drawBarricades(ctx) {
    for (const b of this.barricades) {
      // 阴影
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.ellipse(b.x + b.w / 2, b.y + b.h + 4, b.w / 2 + 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 木架横梁
      ctx.fillStyle = '#78350f';
      ctx.fillRect(b.x, b.y + 6, b.w, b.h - 12);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y + 6, b.w, b.h - 12);

      // 交叉尖锐木桩
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(b.x - 4, b.y);
      ctx.lineTo(b.x + b.w + 4, b.y + b.h);
      ctx.moveTo(b.x + b.w + 4, b.y);
      ctx.lineTo(b.x - 4, b.y + b.h);
      ctx.stroke();

      // 铁箍加固
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(b.x + b.w / 2 - 3, b.y + b.h / 2 - 3, 6, 6);
    }
  }

  /**
   * 10.2 绘制迎风猎猎战国军旗
   */
  drawBanners(ctx, tick) {
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const bType = biome.bannerType || 'oda';

    for (const bn of this.banners) {
      const sway = Math.sin(tick * 0.08 + bn.x) * 4;
      // 旗杆
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bn.x, bn.y + 20);
      ctx.lineTo(bn.x, bn.y - 50);
      ctx.stroke();

      // 旗面颜色
      let flagBg = '#ffffff';
      let crestColor = '#0284c7';
      let borderCol = '#38bdf8';

      if (bType === 'saito') {
        flagBg = '#991b1b';
        crestColor = '#fde047';
        borderCol = '#ea580c';
      } else if (bType === 'nanban') {
        flagBg = '#0284c7';
        crestColor = '#facc15';
        borderCol = '#ffffff';
      } else if (bType === 'imperial') {
        flagBg = '#581c87';
        crestColor = '#facc15';
        borderCol = '#fde047';
      } else if (bType === 'hojo') {
        flagBg = '#0f172a';
        crestColor = '#facc15';
        borderCol = '#e2e8f0';
      } else if (bType === 'oda_gold') {
        flagBg = '#6b21a8';
        crestColor = '#fde047';
        borderCol = '#f59e0b';
      }

      ctx.fillStyle = flagBg;
      ctx.beginPath();
      ctx.moveTo(bn.x, bn.y - 48);
      ctx.lineTo(bn.x + 20 + sway, bn.y - 44);
      ctx.lineTo(bn.x + 18 + sway, bn.y - 8);
      ctx.lineTo(bn.x, bn.y - 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 家纹徽记
      ctx.fillStyle = crestColor;
      ctx.beginPath();
      ctx.arc(bn.x + 9 + sway * 0.5, bn.y - 28, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 12.1 绘制行军铜鼎篝火盆 (跳跃火焰与暖色光晕)
   */
  drawBraziers(ctx, tick) {
    for (const br of this.braziers) {
      // 底座阴影
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.ellipse(br.x, br.y + 12, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 铜鼎火盆
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(br.x, br.y + 4, 12, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 动态暖色光晕
      const flamePulse = Math.sin(tick * 0.15 + br.x) * 6;
      const glowGrad = ctx.createRadialGradient(br.x, br.y - 6, 4, br.x, br.y - 6, 45 + flamePulse);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      glowGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
      glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(br.x, br.y - 6, 45 + flamePulse, 0, Math.PI * 2);
      ctx.fill();

      // 跳跃外焰
      const flameH = 14 + Math.sin(tick * 0.2 + br.x) * 4;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(br.x - 7, br.y + 2);
      ctx.quadraticCurveTo(br.x, br.y - flameH - 4, br.x + 7, br.y + 2);
      ctx.fill();

      // 内焰金心
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(br.x - 3, br.y + 2);
      ctx.quadraticCurveTo(br.x, br.y - flameH + 3, br.x + 3, br.y + 2);
      ctx.fill();
    }
  }

  /**
   * 获取玩家附近的解谜或商会交互实体
   */
  getNearbyNode(x, y, radius = 75) {
    if (!this.interactiveNodes) return null;
    for (const node of this.interactiveNodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.hypot(dx, dy) <= radius) {
        return node;
      }
    }
    return null;
  }

  /**
   * 12.2 绘制大地图塞尔达式环境解谜实体 (鸟居古碑、南蛮商船)
   */
  drawInteractiveNodes(ctx, tick) {
    if (!this.interactiveNodes) return;

    for (const node of this.interactiveNodes) {
      if (node.type === 'stele') {
        // --- 鸟居古神碑 ---
        const bob = Math.sin(tick * 0.08) * 3;
        
        // 1. 基座台阶阴影 (柔和自然淡影)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + 24, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 双层青石台基 (温润浅青灰)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(node.x - 22, node.y + 14, 44, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(node.x - 18, node.y + 8, 36, 6);

        // 3. 古神碑碑身 (青碧灵石质感与破角刻痕)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(node.x - 15, node.y - 28, 30, 36, [6, 6, 2, 2]);
        } else {
          ctx.rect(node.x - 15, node.y - 28, 30, 36);
        }
        ctx.fill();
        ctx.strokeStyle = node.isSolved ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 4. 碑文微光符文 (未解密为青蓝古符文脉动，解密为金光流转)
        const glowPulse = Math.sin(tick * 0.12) * 0.3 + 0.7;
        ctx.fillStyle = node.isSolved 
          ? `rgba(251, 191, 36, ${glowPulse})` 
          : `rgba(56, 189, 248, ${glowPulse})`;
        ctx.font = 'bold 15px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.isSolved ? '⚡' : 'ᚱ', node.x, node.y - 10);

        // 5. 顶端鸟居式神道绳结 (注连绳与纸垂)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(node.x - 14, node.y - 20);
        ctx.lineTo(node.x + 14, node.y - 20);
        ctx.stroke();

        // 6. 悬浮调查引导徽标 (通透白玉微光气泡)
        const badgeY = node.y - 44 + bob;
        ctx.save();
        ctx.translate(node.x, badgeY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.isSolved ? '#10b981' : '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-44, -11, 88, 22, 11);
        } else {
          ctx.rect(-44, -11, 88, 22);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = node.isSolved ? '#047857' : '#0369a1';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.isSolved ? '✨ 神碑已破' : '⛩️ 调查古碑', 0, 1);
        ctx.restore();

      } else if (node.type === 'nanban') {
        // --- 南蛮西洋商馆篷车 ---
        const bob = Math.sin(tick * 0.07 + 1) * 3;

        // 1. 地面地毯与阴影
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + 20, 32, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 西洋红木商柜与货物箱
        ctx.fillStyle = '#78350f';
        ctx.fillRect(node.x - 24, node.y + 2, 48, 18);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(node.x - 22, node.y + 4, 44, 4);

        // 3. 欧式条纹遮阳蓬 (红白相间)
        const awningW = 56;
        const stripeW = 8;
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#fef08a';
          ctx.fillRect(node.x - awningW / 2 + i * stripeW, node.y - 18, stripeW, 14);
        }
        // 蓬顶金边
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(node.x - awningW / 2, node.y - 20, awningW, 3);

        // 4. 西洋旗帜 (带微风飘动)
        const flagSway = Math.sin(tick * 0.1) * 3;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(node.x + 22, node.y - 20);
        ctx.lineTo(node.x + 22, node.y - 38);
        ctx.stroke();

        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.moveTo(node.x + 22, node.y - 38);
        ctx.lineTo(node.x + 36 + flagSway, node.y - 33);
        ctx.lineTo(node.x + 22, node.y - 28);
        ctx.closePath();
        ctx.fill();

        // 5. 南蛮商行老板 NPC 头像/剪影
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧔🏼‍♂️', node.x, node.y - 2);

        // 6. 悬浮商贸提示徽标 (通透白玉微光气泡)
        const badgeY = node.y - 48 + bob;
        ctx.save();
        ctx.translate(node.x, badgeY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.isSolved ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-44, -11, 88, 22, 11);
        } else {
          ctx.rect(-44, -11, 88, 22);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = node.isSolved ? '#047857' : '#b45309';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.isSolved ? '🤝 贸易已成' : '⛵ 南蛮商馆', 0, 1);
        ctx.restore();

      } else if (node.type === 'chest') {
        // --- 藏金密宝箱 ---
        const bob = Math.sin(tick * 0.08 + node.x * 0.05) * 2.5;

        // 1. 投影
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + 16, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 宝箱箱身 (金漆红木雕纹)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(node.x - 18, node.y - 4, 36, 18);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(node.x - 16, node.y - 2, 32, 14);

        // 3. 黄金镶边与铆钉
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(node.x - 18, node.y + 2, 36, 3);
        ctx.fillRect(node.x - 4, node.y - 4, 8, 18);

        // 4. 锁扣与光效
        if (node.isSolved) {
          // 开启态：宝箱大开，金光四射
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(node.x, node.y - 8, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨', node.x, node.y - 12);
        } else {
          // 闭锁态：纯金锁头
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(node.x, node.y + 3, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. 悬浮调查引导徽标
        const badgeY = node.y - 28 + bob;
        ctx.save();
        ctx.translate(node.x, badgeY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.isSolved ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-42, -11, 84, 22, 11);
        } else {
          ctx.rect(-42, -11, 84, 22);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = node.isSolved ? '#047857' : '#b45309';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.isSolved ? '✨ 宝箱已启' : '🎁 探索宝箱', 0, 1);
        ctx.restore();

      } else if (node.type === 'spirit') {
        // --- 森林友善小生灵：小狸猫「信乐」 ---
        const bob = Math.sin(tick * 0.12) * 3;

        // 1. 柔和地影
        ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + 18, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 蓬松大尾巴
        const tailWag = Math.sin(tick * 0.15) * 4;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(node.x + 16, node.y + 6 + tailWag, 10, 6, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 3. 萌狸圆滚滚身躯
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(node.x, node.y + 4 + bob, 15, 0, Math.PI * 2);
        ctx.fill();

        // 4. 奶黄肚皮
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(node.x, node.y + 6 + bob, 9, 0, Math.PI * 2);
        ctx.fill();

        // 5. 尖耳朵与头顶绿叶
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(node.x - 10, node.y - 8 + bob, 5, 0, Math.PI * 2);
        ctx.arc(node.x + 10, node.y - 8 + bob, 5, 0, Math.PI * 2);
        ctx.fill();

        // 头顶小绿叶
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(node.x, node.y - 12 + bob, 6, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 6. 萌萌面部特征
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦝', node.x, node.y + 1 + bob);

        // 7. 悬浮交互引导徽标
        const badgeY = node.y - 32 + bob;
        ctx.save();
        ctx.translate(node.x, badgeY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = node.isSolved ? '#10b981' : '#0ea5e9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-44, -11, 88, 22, 11);
        } else {
          ctx.rect(-44, -11, 88, 22);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = node.isSolved ? '#047857' : '#0369a1';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.isSolved ? '💖 狸猫挚友' : '🍃 森林小狸猫', 0, 1);
        ctx.restore();
      }
    }
  }

  /**
   * 13. 绘制四大战役主题古木 (Sakura / Momiji / Mystic Pine / Wisteria)
   */
  drawCherryBlossomTrees(ctx, tick) {
    const sakuraAsset = ENV_CACHE.sakuraTree;
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const tType = biome.treeType;

    for (const tree of this.trees) {
      // 树底深邃阴影
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(tree.x, tree.y + 26, 52, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // 随风优雅轻拂
      const sway = Math.sin(tick * 0.03 + tree.x * 0.08) * 3.5;

      if (sakuraAsset && sakuraAsset.loaded) {
        const tw = 176;
        const th = 178;
        ctx.save();

        if (tType === 'autumn_maple') {
          // 美浓 · 烈焰深红枫树 (Momiji)
          ctx.filter = 'hue-rotate(42deg) saturate(2.8) contrast(1.25)';
        } else if (tType === 'coastal_palm') {
          // 摄津 · 海滨迎风翠松/椰风
          ctx.filter = 'hue-rotate(135deg) saturate(2.0) brightness(0.95)';
        } else if (tType === 'golden_ginkgo') {
          // 京都 · 参天金黄银杏
          ctx.filter = 'hue-rotate(75deg) saturate(2.4) brightness(1.15)';
        } else if (tType === 'black_pine') {
          // 小田原 · 苍黑古松
          ctx.filter = 'hue-rotate(160deg) saturate(1.2) brightness(0.65)';
        } else if (tType === 'purple_wisteria') {
          // 安土 · 梦幻紫藤神木
          ctx.filter = 'hue-rotate(240deg) saturate(2.2) brightness(1.1)';
        }

        ctx.drawImage(sakuraAsset.img, tree.x - tw / 2 + sway, tree.y - th + 36, tw, th);
        ctx.restore();
      } else {
        // 多层次手绘树冠 fallback
        let c1 = '#db2777', c2 = '#f472b6', c3 = '#fbcfe8';
        if (tType === 'autumn_maple') { c1 = '#991b1b'; c2 = '#dc2626'; c3 = '#ea580c'; }
        else if (tType === 'coastal_palm') { c1 = '#065f46'; c2 = '#059669'; c3 = '#34d399'; }
        else if (tType === 'golden_ginkgo') { c1 = '#ca8a04'; c2 = '#eab308'; c3 = '#fde047'; }
        else if (tType === 'black_pine') { c1 = '#0f172a'; c2 = '#064e3b'; c3 = '#0d9488'; }
        else if (tType === 'purple_wisteria') { c1 = '#6b21a8'; c2 = '#9333ea'; c3 = '#c084fc'; }

        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(tree.x + sway * 0.5, tree.y - 20, tree.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(tree.x + sway, tree.y - 24, tree.r * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c3;
        ctx.beginPath();
        ctx.arc(tree.x + sway * 1.2, tree.y - 30, tree.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * 14. 绘制名城专属氛围天气粒子 (落樱 / 枫叶 / 银杏 / 海风水沫 / 紫藤花雨)
   */
  drawGlobalPetals(ctx, tick) {
    if (!this.petals) return;
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const pType = biome.petalType || 'sakura';

    ctx.save();
    for (const p of this.petals) {
      p.x += p.speedX;
      p.y += p.speedY + Math.sin(tick * 0.08 + p.x * 0.05) * 0.35;
      p.rot += p.rotSpeed;

      if (p.x > this.width) p.x = 0;
      if (p.y > this.height) p.y = 0;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (pType === 'maple') {
        // 美浓稻叶山：飘零深秋红枫叶
        ctx.fillStyle = `rgba(234, 88, 12, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.7, 0);
        ctx.lineTo(p.size * 0.4, p.size * 0.8);
        ctx.lineTo(-p.size * 0.4, p.size * 0.8);
        ctx.lineTo(-p.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(185, 28, 28, ${p.alpha * 0.8})`;
        ctx.fillRect(-0.5, -p.size * 0.5, 1, p.size);

      } else if (pType === 'ginkgo') {
        // 山城京都：扇形金黄银杏叶
        ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, -p.size * 0.8, p.size * 0.9, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.closePath();
        ctx.fill();

      } else if (pType === 'sea_spray') {
        // 摄津界港：海风水沫与阳光浮星
        ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
        ctx.fillRect(-0.8, -0.8, 1.6, 1.6);

      } else if (pType === 'wisteria') {
        // 近江安土：紫藤小花与金色神芒
        ctx.fillStyle = `rgba(192, 132, 252, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(254, 240, 138, ${p.alpha * 0.85})`;
        ctx.fillRect(-0.6, -0.6, 1.2, 1.2);

      } else if (pType === 'sea_mist') {
        // 相模小田原：海雾灰白水汽
        ctx.fillStyle = `rgba(203, 213, 225, ${p.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // 尾张清洲（默认）：粉白落樱花瓣
        ctx.fillStyle = `rgba(253, 232, 240, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha * 0.8})`;
        ctx.fillRect(-p.size * 0.3, -0.5, p.size * 0.6, 1);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * 15. 全局主题氛围光照滤镜 (根据城池地貌动态渲染)
   */
  drawAmbientLighting(ctx) {
    const biome = this.biome || CITY_BIOMES.kiyosu;
    const gType = biome.groundType;

    if (gType === 'autumn_mountain') {
      // 美浓稻叶山：壮丽夕阳暮色
      const sunsetGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      sunsetGrad.addColorStop(0, 'rgba(234, 88, 12, 0.12)');
      sunsetGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
      sunsetGrad.addColorStop(1, 'rgba(120, 53, 15, 0.16)');
      ctx.fillStyle = sunsetGrad;
      ctx.fillRect(0, 0, this.width, this.height);

    } else if (gType === 'golden_beach') {
      // 摄津界港：海港明媚海天一色湛蓝阳光
      const seaGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      seaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      seaGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.06)');
      seaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.08)');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 0, this.width, this.height);

    } else if (gType === 'karesansui_white') {
      // 山城京都：皇苑金辉与素雅白石
      const courtGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      courtGrad.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
      courtGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.08)');
      courtGrad.addColorStop(1, 'rgba(245, 158, 11, 0.06)');
      ctx.fillStyle = courtGrad;
      ctx.fillRect(0, 0, this.width, this.height);

    } else if (gType === 'basalt_rampart') {
      // 相模小田原：海防坚城海风微冷
      const fortGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      fortGrad.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
      fortGrad.addColorStop(0.5, 'rgba(51, 65, 85, 0.12)');
      fortGrad.addColorStop(1, 'rgba(15, 23, 42, 0.22)');
      ctx.fillStyle = fortGrad;
      ctx.fillRect(0, 0, this.width, this.height);

    } else if (gType === 'emerald_lakeside') {
      // 近江安土：梦幻神域紫霞与金华
      const mysticGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      mysticGrad.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      mysticGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.1)');
      mysticGrad.addColorStop(1, 'rgba(126, 34, 206, 0.14)');
      ctx.fillStyle = mysticGrad;
      ctx.fillRect(0, 0, this.width, this.height);

    } else {
      // 尾张清洲（默认）：晴空晨曦轻光晕
      const sunGrad = ctx.createLinearGradient(0, 0, this.width * 0.8, this.height * 0.8);
      sunGrad.addColorStop(0, 'rgba(254, 249, 195, 0.08)');
      sunGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
      sunGrad.addColorStop(1, 'rgba(240, 253, 244, 0.05)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}

window.GameMap = GameMap;
