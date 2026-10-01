/**
 * 太阁英语大冒险 · 2D 高品质和风萌系武将与怪物渲染系统 (32-bit Sprite & Visual FX Engine)
 * 彻底告别粗糙几何简笔画，采用工业级 Q版 2.5头身战国高清精灵模型：
 * - 主角木下藤吉郎：热血刺猬头发髻、金纹红头巾、经典红蓝阵羽织战袍、练习木刀/名剑、草鞋白袜、水墨飞白斩击剑气
 * - 战宠小柴犬：萌系豆豆眉、双色毛发、卷曲尾巴、红绳金铃、欢跃跟随
 * - 草鞋河童小妖：编织竹斗笠、青翠身躯、单眼好奇目光、红缨竹枪
 * - 影之乱波忍者：暗夜行服、闪亮钢制“影”字护额、凌厉红光眼眸、飞旋手里剑
 * - 赤铠守城大将：朱漆大铠重甲、霸气鹿角金立物兜盔、威严面甲、关底大薙刀
 * - 黄金秘宝箱：黑漆沉香木箱、鎏金铜角、满溢金小判与勾玉宝光
 */

const CHARACTER_SPRITES = {
  hero: { src: 'assets/characters/tokichiro.png', width: 68, height: 68, anchorY: 66 },
  goblin: { src: 'assets/characters/goblin.png', width: 64, height: 64, anchorY: 62 },
  ninja: { src: 'assets/characters/ninja.png', width: 66, height: 66, anchorY: 64 },
  general: { src: 'assets/characters/general.png', width: 86, height: 86, anchorY: 82 },
  chest: { src: 'assets/characters/chest.png', width: 56, height: 56, anchorY: 52 }
};

const SPRITE_CACHE = {};

// 初始化预加载所有 2D 高精度精灵图
if (typeof window !== 'undefined') {
  window.SPRITE_CACHE = SPRITE_CACHE;
  window.CHARACTER_SPRITES = CHARACTER_SPRITES;
  for (const [key, cfg] of Object.entries(CHARACTER_SPRITES)) {
    const img = new Image();
    img.src = cfg.src;
    SPRITE_CACHE[key] = {
      img,
      loaded: false
    };
    img.onload = () => {
      SPRITE_CACHE[key].loaded = true;
    };
  }
}

class CharacterRenderer {

  /**
   * 绘制主角小勇士 (木下藤吉郎)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - 像素坐标 X
   * @param {number} y - 像素坐标 Y
   * @param {object} state - { facing, isMoving, animTick, isAttacking, attackProgress }
   */
  static drawHero(ctx, x, y, state) {
    ctx.save();
    ctx.translate(x, y);

    const facing = state.facing || 'down';
    const isMoving = state.isMoving;
    const tick = state.animTick || 0;
    const isAttacking = state.isAttacking;
    const attackProg = state.attackProgress || 0;

    // 行走弹性挤压伸缩与呼吸起伏
    const bounce = isMoving ? Math.sin(tick * 0.3) * 3.5 : Math.sin(tick * 0.08) * 1.5;
    const squashX = isMoving ? 1 + Math.sin(tick * 0.3) * 0.04 : 1;
    const squashY = isMoving ? 1 - Math.sin(tick * 0.3) * 0.04 : 1;
    const attackThrust = isAttacking ? Math.sin(attackProg * Math.PI) * 16 : 0;

    // 获取当前主角装备数据以驱动特效与标识
    const hero = (window.heroManager && window.heroManager.hero) ? window.heroManager.hero : {
      equippedWeapon: 'wpn-wood',
      equippedArmor: 'arm-cloth',
      name: '木下藤吉郎'
    };
    const weaponId = hero.equippedWeapon || 'wpn-wood';

    // 1. 脚下金色光环 (光晕随呼吸脉动)
    const ringPulse = Math.sin(tick * 0.08) * 2;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 6, 22 + ringPulse, 8 + ringPulse * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 地面柔和椭圆软投影
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 18, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. 渲染高清 Q版主角精灵图
    const cached = SPRITE_CACHE.hero;
    const cfg = CHARACTER_SPRITES.hero;

    ctx.save();
    // 攻击冲刺位移
    if (facing === 'left') {
      ctx.translate(-attackThrust, 0);
      ctx.scale(-squashX, squashY);
    } else {
      ctx.translate(attackThrust, 0);
      ctx.scale(squashX, squashY);
    }

    if (cached && cached.loaded) {
      // 高清平滑绘制透明精灵图，足底精准对齐 (0, 0)
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(cached.img, -cfg.width / 2, -cfg.anchorY + bounce, cfg.width, cfg.height);
    } else {
      // 优雅回退占位符
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -32 + bounce, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. 苍劲水墨飞白剑气斩击弧光
    if (isAttacking) {
      this.drawHeroSlash(ctx, tick, attackProg, weaponId, facing);
    }

    ctx.restore();

    // 5. 保持纯净探险视野：左上角 HUD 已有完整官职、生命勾玉与姓名展示，头顶不悬挂遮挡视线的大黑漆名牌
  }

  /**
   * 绘制主角挥刀时的苍劲水墨飞白剑气弧光与金炎星芒
   */
  static drawHeroSlash(ctx, tick, attackProg, weaponId, facing) {
    ctx.save();
    const dir = facing === 'left' ? -1 : 1;
    ctx.translate(dir * 24, -32);
    ctx.scale(dir, 1);

    const arcAngle = (attackProg - 0.5) * Math.PI * 0.8;
    ctx.rotate(arcAngle);

    // 水墨主刀光
    ctx.strokeStyle = weaponId === 'wpn-muramasa' ? 'rgba(192, 132, 252, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 38, -0.9, 0.9);
    ctx.stroke();

    // 水墨飞白羽化外缘 (浓墨残影)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 42, -0.7, 0.8);
    ctx.stroke();

    // 刀尖飞溅金色刀火星芒
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(38, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制主角头顶标识（纯净精简，无遮挡）
   */
  static drawHeroNameTag(ctx, x, y, heroName) {
    // 纯净视野：已移至左上角 HUD 展示，此处不遮挡地牢场景
  }

  /**
   * 绘制百鬼小怪 / 守城大将 / 错词心魔 / 黄金宝箱
   */
  static drawMonster(ctx, monster, tick) {
    ctx.save();
    ctx.translate(monster.x, monster.y);

    const isHit = monster.hitFlash > 0;
    const bob = Math.sin(tick * 0.15 + (monster.seed || 0)) * 3.5;
    const type = monster.type || 'goblin';
    const cfg = CHARACTER_SPRITES[type] || CHARACTER_SPRITES.goblin;
    const cached = SPRITE_CACHE[type] || SPRITE_CACHE.goblin;

    // 怪物受击发光震颤滤镜
    if (isHit) {
      const shakeX = (monster.hitFlash % 2 === 0 ? -4 : 4);
      ctx.translate(shakeX, 0);
      ctx.filter = 'brightness(2.2) drop-shadow(0 0 16px #ef4444)';
    }

    // 1. 地面柔和阴影
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    const shadowW = (cfg.width * 0.38);
    ctx.ellipse(0, 5, shadowW, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 绘制对应高清角色精灵图
    if (cached && cached.loaded) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(cached.img, -cfg.width / 2, -cfg.anchorY + bob, cfg.width, cfg.height);
    } else {
      // 优雅回退
      ctx.fillStyle = type === 'general' ? '#dc2626' : (type === 'ninja' ? '#1e293b' : '#22c55e');
      ctx.beginPath();
      ctx.arc(0, -cfg.anchorY / 2 + bob, cfg.width * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 宝箱专属：四射金光星芒
    if (type === 'chest') {
      this.drawChestSparkles(ctx, bob, tick);
    }

    // 4. 心魔怪专属：缭绕周身的幽紫业火灵气
    if (monster.isRetest) {
      this.drawRetestDemonAura(ctx, bob, tick, cfg.width * 0.55);
    }

    ctx.restore();

    // 5. 怪物头顶名字与血条 HUD (非遭遇对决时显示，避免与卷轴重叠)
    if (!monster.inEncounter) {
      this.drawMonsterHUD(ctx, monster, -cfg.anchorY - 12);
    }

    // 6. 招架防守光盾特效
    if (monster.isParrying) {
      this.drawParryShield(ctx, monster, -cfg.anchorY / 2);
    }
  }

  /**
   * 黄金宝箱周围的四射宝光星芒
   */
  static drawChestSparkles(ctx, bob, tick) {
    ctx.save();
    const starRot = tick * 0.08;
    ctx.translate(22, -38 + bob);
    ctx.rotate(starRot);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
    ctx.fillRect(-2, -8, 4, 16);
    ctx.fillRect(-8, -2, 16, 4);

    ctx.translate(-44, 16);
    ctx.rotate(-starRot * 1.5);
    ctx.fillRect(-1.5, -6, 3, 12);
    ctx.fillRect(-6, -1.5, 12, 3);
    ctx.restore();
  }

  /**
   * 错词心魔专属紫炎幽火灵息
   */
  static drawRetestDemonAura(ctx, bob, tick, radius) {
    const auraPulse = Math.sin(tick * 0.2) * 4;
    const r = radius || 32;

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.8 + bob, r + auraPulse, r + auraPulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 升腾的紫色业火小火苗
    for (let i = 0; i < 4; i++) {
      const flameX = Math.sin(tick * 0.15 + i * 1.8) * (r * 0.7);
      const flameY = -r * 1.2 - ((tick * 1.4 + i * 14) % 30);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
      ctx.beginPath();
      ctx.arc(flameX, flameY + bob, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 怪物头顶名牌与血条
   */
  static drawMonsterHUD(ctx, monster, offsetY) {
    ctx.save();
    ctx.translate(monster.x, monster.y + (offsetY || -52));

    if (monster.isRetest) {
      // 心魔怪专属紫金名牌
      ctx.fillStyle = 'rgba(88, 28, 135, 0.95)';
      ctx.beginPath();
      ctx.roundRect(-50, -11, 100, 22, 11);
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😈 心魔 · 错词复盘', 0, 1);
    } else {
      // 普通战国敌人朱红名牌
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-36, -11, 72, 22, 11);
      ctx.fill();
      ctx.strokeStyle = monster.type === 'general' ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(monster.name, 0, 1);
    }
    ctx.restore();
  }

  /**
   * 招架防守光盾
   */
  static drawParryShield(ctx, monster, offsetY) {
    ctx.save();
    ctx.translate(monster.x, monster.y + (offsetY || -24));
    ctx.fillStyle = 'rgba(59, 130, 246, 0.28)';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 护盾铭文
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-28, -10, 56, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️ 招架', 0, 1);
    ctx.restore();
  }
}

window.CharacterRenderer = CharacterRenderer;

