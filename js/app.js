/**
 * 太阁英语大冒险 · 核心控制器 (Adventure Controller)
 * 启动 2D Canvas 游戏引擎，绑定触控方向键与弹窗
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化 2D 动作游戏引擎
  try {
    window.gameEngine = new GameEngine();
    window.gameEngine.init('game-canvas');
  } catch (err) {
    console.error('GameEngine init error:', err);
  }

  // 2. 初始化双层世界与小游戏模块
  try {
    if (window.taikouTown && window.taikouTown.init) window.taikouTown.init();
    if (window.overworld && window.overworld.init) window.overworld.init();
    if (window.teaMinigame && window.teaMinigame.init) window.teaMinigame.init();
    if (window.medicineMinigame && window.medicineMinigame.init) window.medicineMinigame.init();

    if (window.ui) {
      if (window.ui.initDOMElements) {
        window.ui.initDOMElements();
      }
      window.ui.showHomeScreen(); // 默认启动展示战国大本营主页！
    }
  } catch (err) {
    console.error('UI/World init error:', err);
  }

  // 3. 全局点击/触摸解锁音频与前后台切换自动唤醒
  const unlockAudio = () => {
    if (window.audioEngine) {
      window.audioEngine.unlockAudio();
    }
  };
  ['pointerdown', 'touchstart', 'touchend', 'click'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.audioEngine) {
      window.audioEngine.ensureAudioContext();
    }
  });

  // 4. 绑定 iPad 触控虚拟方向键 (D-Pad，多场景自适应路由)
  const dpadBtns = document.querySelectorAll('.dpad-btn');
  dpadBtns.forEach(btn => {
    const dir = btn.dataset.dir;

    const startMove = (e) => {
      e.preventDefault();
      if (window.audioEngine) window.audioEngine.unlockAudio();
      if (window.gameEngine && window.gameEngine.keys) window.gameEngine.keys[dir] = true;
      if (window.overworld && window.overworld.isActive) window.overworld.keys[dir] = true;
      if (window.taikouTown && window.taikouTown.isActive) window.taikouTown.keys[dir] = true;
      btn.classList.add('active');
    };

    const stopMove = (e) => {
      e.preventDefault();
      if (window.gameEngine && window.gameEngine.keys) window.gameEngine.keys[dir] = false;
      if (window.overworld && window.overworld.isActive) window.overworld.keys[dir] = false;
      if (window.taikouTown && window.taikouTown.isActive) window.taikouTown.keys[dir] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('mousedown', startMove);
    btn.addEventListener('mouseup', stopMove);
    btn.addEventListener('mouseleave', stopMove);

    btn.addEventListener('touchstart', startMove, { passive: false });
    btn.addEventListener('touchend', stopMove, { passive: false });
    btn.addEventListener('touchcancel', stopMove, { passive: false });
  });

  // 5. 顶栏功能按钮：战役关卡与章节总览
  const btnChapters = document.getElementById('btn-nav-chapters');
  if (btnChapters) {
    btnChapters.addEventListener('click', () => {
      if (window.ui) window.ui.openChaptersModal();
    });
  }

  // 6. 顶栏功能按钮：家长专属教学对齐
  const btnProgress = document.getElementById('btn-nav-progress');
  if (btnProgress) {
    btnProgress.addEventListener('click', () => {
      if (window.ui) window.ui.openParentProgressModal();
    });
  }

  const btnSaveProg = document.getElementById('btn-save-progress');
  if (btnSaveProg) {
    btnSaveProg.addEventListener('click', () => {
      if (window.ui) window.ui.saveParentProgress();
    });
  }

  const btnShop = document.getElementById('btn-nav-shop');
  if (btnShop) {
    btnShop.addEventListener('click', () => {
      if (window.ui) window.ui.openShopModal();
    });
  }

  // 胜利结算按钮
  const btnReplay = document.getElementById('btn-victory-replay');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      const modal = document.getElementById('modal-victory');
      if (modal) modal.classList.add('hidden');
      if (window.gameEngine) {
        window.gameEngine.loadTodayEncounters();
        window.gameEngine.player.x = 550;
        window.gameEngine.player.y = 1040;
      }
    });
  }

  const btnHome = document.getElementById('btn-victory-home');
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      const modal = document.getElementById('modal-victory');
      if (modal) modal.classList.add('hidden');
      if (window.ui) window.ui.showHomeScreen();
    });
  }
});
