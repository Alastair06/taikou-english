/**
 * ============================================================================
 * 太阁英语立志传 · 织田信长护眼御令 & 亲子立志勋绩卡系统 (Honor Scroll & Eye Rest)
 * - 20 分钟织田信长健康休整御令（远眺青山绿水，保护小学生视力）
 * - 纯正和风 Canvas 水彩军功勋绩长图生成，一键导出与父母真诚分享
 * ============================================================================
 */

class EyeRestGuard {
  constructor() {
    this.activeSeconds = 0;
    this.restInterval = 600; // 10 分钟 (600秒) 严格对齐每日10分钟专注上限
    this.timer = null;
    this.countdownSeconds = 180; // 3 分钟休整
    this.countdownTimer = null;
    this.isResting = false;
  }

  init() {
    this.startTracking();
  }

  startTracking() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      // 只有在页面处于前台时计时
      if (!document.hidden) {
        this.activeSeconds++;
        if (this.activeSeconds >= this.restInterval && !this.isResting) {
          this.triggerRestPrompt();
        }
      }
    }, 1000);
  }

  triggerRestPrompt() {
    this.isResting = true;
    const modal = document.getElementById('modal-nobunaga-rest');
    if (!modal) return;

    if (window.audioEngine) {
      window.audioEngine.playFluteFanfare();
    }

    // 动态拉取今日掌握的 3 词
    let wordsSummaryHtml = '';
    if (window.progressManager && typeof window.progressManager.getTodayStageWords === 'function') {
      const words = window.progressManager.getTodayStageWords();
      if (words && words.length > 0) {
        wordsSummaryHtml = `
          <div class="rest-words-summary" style="margin-bottom:12px; background:rgba(255,255,255,0.85); border:1px solid #bbf7d0; border-radius:10px; padding:8px 12px; text-align:left;">
            <div style="font-size:13px; font-weight:800; color:#15803d; margin-bottom:4px;">📖 今日掌握言灵（3 词全达成）：</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${words.map(w => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:13px; background:#ecfdf5; border:1px solid #86efac; border-radius:6px; padding:2px 8px; color:#166534;"><strong>${w.en}</strong> ${w.cn}</span>`).join('')}
            </div>
          </div>
        `;
      }
    }

    const content = document.getElementById('nobunaga-rest-content');
    if (content) {
      content.innerHTML = `
        <div class="nobunaga-rest-card">
          <div class="rest-crest">🍵 尾张织田家 · 信长主公鸣金收兵御令 🍵</div>
          <div class="rest-avatar-row">
            <div class="rest-nobunaga-avatar">🏯</div>
            <div class="rest-speech-bubble">
              “藤吉郎！演武十刻（十分钟）已至，天下布武非一日之功。<br>
              汝今日攻城斩将，词意已烙入心怀。<strong>全军即刻鸣金收兵，远眺窗外青山绿水！</strong><br>
              劳逸兼修，保重双目，方成日后统领尾张之栋梁大器！”
            </div>
          </div>

          ${wordsSummaryHtml}

          <div class="rest-visual-stage">
            <div class="rest-landscape">
              <span class="rest-mountain">⛰️ 远山苍翠</span>
              <span class="rest-cloud">☁️ 白云悠悠</span>
              <span class="rest-trees">🌲 眺望绿野</span>
            </div>
            <div class="rest-timer-display" id="rest-timer-val">03:00</div>
            <div class="rest-tip-text">闭目养神或极目远眺，让眼睛完全放松</div>
          </div>

          <div class="rest-actions">
            <button class="btn btn-primary" onclick="window.honorScroll.startRestCountdown()">
              🌿 遵令休整（开始3分钟护眼倒计时）
            </button>
            <div style="display:flex; gap:8px; width:100%; justify-content:center; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="window.honorScroll.snooze(3)">
                ⏰ 稍后提醒（3分钟后再歇）
              </button>
              <button class="btn btn-secondary btn-sm" onclick="if(window.honorScroll) window.honorScroll.showCertificateModal()">
                📜 检阅军功状
              </button>
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  startRestCountdown() {
    this.countdownSeconds = 180;
    const timerVal = document.getElementById('rest-timer-val');
    const actions = document.querySelector('.rest-actions');
    if (actions) {
      actions.innerHTML = `
        <div style="font-size:13px; color:#15803d; font-weight:800; text-align:center; width:100%;">
          🍃 护眼倒计时进行中... 深呼吸，望向远处 🍃
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="window.honorScroll.finishRestEarly()">
          提前结束休整
        </button>
      `;
    }

    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      const m = Math.floor(this.countdownSeconds / 60).toString().padStart(2, '0');
      const s = (this.countdownSeconds % 60).toString().padStart(2, '0');
      if (timerVal) timerVal.textContent = `${m}:${s}`;

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.finishRest();
      }
    }, 1000);
  }

  finishRest() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.isResting = false;
    this.activeSeconds = 0;

    const modal = document.getElementById('modal-nobunaga-rest');
    if (modal) modal.classList.add('hidden');

    if (window.heroManager) {
      window.heroManager.addGold(20);
    }
    if (window.audioEngine) {
      window.audioEngine.playVictoryFanfare();
    }
    if (window.ui && window.ui.showToast) {
      window.ui.showToast('🍵 休整大功告成！目力充沛，信长公嘉奖 20 贯军资金！', '✨');
    }
  }

  finishRestEarly() {
    this.finishRest();
  }

  snooze(minutes = 5) {
    this.isResting = false;
    this.activeSeconds = Math.max(0, this.restInterval - minutes * 60);
    const modal = document.getElementById('modal-nobunaga-rest');
    if (modal) modal.classList.add('hidden');

    if (window.ui && window.ui.showToast) {
      window.ui.showToast(`⏰ 信长御令将在 ${minutes} 分钟后再次提醒休整~`, '🍵');
    }
  }

  // 供自动化测试秒开验证
  triggerForTest() {
    this.triggerRestPrompt();
  }
}

class HonorScrollGenerator {
  constructor() {
    this.canvas = null;
  }

  /**
   * 生成高清和风亲子军功勋绩卡
   */
  generateCertificate(options = {}) {
    const width = 640;
    const height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Retina 2x
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const heroName = '木下藤吉郎';
    const rankTitle = (window.heroManager && window.heroManager.getCurrentRank && window.heroManager.getCurrentRank().title) || '足轻头';
    const curGold = (window.heroManager && window.heroManager.getGold) ? window.heroManager.getGold() : 305;
    const streak = (window.progressManager && window.progressManager.getStreakDays) ? window.progressManager.getStreakDays() : 1;
    const curIdx = (window.progressManager && window.progressManager.getCurrentIndex) ? window.progressManager.getCurrentIndex() : 0;
    const curStage = Math.floor(curIdx / 3) + 1;

    const allWords = (window.wordManager && window.wordManager.getAllTextbookWordsFlat) ? window.wordManager.getAllTextbookWordsFlat() : [];
    const stageWords = (options.words && options.words.length > 0) ? options.words : allWords.slice(curIdx, curIdx + 3);
    const sampleWords = stageWords.length > 0 ? stageWords : [
      { en: 'meet', cn: '遇见', phonetic: '/miːt/', emoji: '🤝' },
      { en: 'friend', cn: '朋友', phonetic: '/frend/', emoji: '🧑‍🤝‍🧑' },
      { en: 'nice', cn: '高兴的', phonetic: '/naɪs/', emoji: '😊' }
    ];

    // 1. 和纸底色 (温润和风米黄宣纸)
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, width, height);

    // 金粉斑驳散点
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(217, 119, 6, ${0.05 + Math.random() * 0.08})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 外部双重雅致金线边框
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    // 四角回纹装饰
    const drawCorner = (x, y) => {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawCorner(22, 22);
    drawCorner(width - 22, 22);
    drawCorner(22, height - 22);
    drawCorner(width - 22, height - 22);

    // 3. 顶部横幅名号
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 尾张织田家 · 军令御奉封赏 ⚡', width / 2, 54);

    // 主标题
    ctx.fillStyle = '#1e1b4b';
    ctx.font = '900 28px -apple-system, sans-serif';
    ctx.fillText('太阁立志 · 军功勋绩状', width / 2, 94);

    // 官位与名号徽章
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 140, 114, 280, 36, 18);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.fillText(`🔰 赐封：小勇士 ${heroName} · 【${rankTitle}】`, width / 2, 137);

    // 4. 今日平定关卡与日期
    ctx.fillStyle = '#64748b';
    ctx.font = '600 13px -apple-system, sans-serif';
    const nowStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`🚩 第 ${curStage} 关主命圆满达成 · 录于 ${nowStr}`, width / 2, 178);

    // 5. 今日参透之南蛮秘传词汇卡片
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📖 今日参透并精研之西方言灵词汇：', 40, 215);

    sampleWords.slice(0, 3).forEach((w, idx) => {
      const cardY = 230 + idx * 82;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(40, cardY, width - 80, 70, 12);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Emoji
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(w.emoji || '✨', 75, cardY + 44);

      // English Word
      ctx.font = '900 20px -apple-system, sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'left';
      ctx.fillText(w.en, 115, cardY + 33);

      // Phonetic & Meaning
      ctx.font = '600 13px -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(w.phonetic || '', 115, cardY + 54);

      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'right';
      ctx.fillText(w.cn, width - 65, cardY + 42);
    });

    // 6. 军资成就三联栏
    const statY = 500;
    const statW = (width - 80 - 24) / 3;
    const stats = [
      { lbl: '累积金判', val: `${curGold} 贯`, icon: '🪙', color: '#d97706' },
      { lbl: '连胜出勤', val: `${streak} 天`, icon: '🔥', color: '#dc2626' },
      { lbl: '攻克关卡', val: `第 ${curStage} 关`, icon: '🚩', color: '#2563eb' }
    ];

    stats.forEach((s, idx) => {
      const sx = 40 + idx * (statW + 12);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(sx, statY, statW, 80, 12);
      ctx.fill();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = s.color;
      ctx.font = '900 18px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${s.icon} ${s.val}`, sx + statW / 2, statY + 36);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 12px -apple-system, sans-serif';
      ctx.fillText(s.lbl, sx + statW / 2, statY + 60);
    });

    // 7. 织田信长主公亲笔评语
    const commentY = 605;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(40, commentY, width - 80, 110, 14);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏯 尾张守 · 织田信长公评语：', 56, commentY + 32);

    ctx.fillStyle = '#1e293b';
    ctx.font = '600 13.5px -apple-system, sans-serif';
    ctx.fillText('“敏而笃学，一日参透南蛮诸物。听音辨字无有差池，', 56, commentY + 60);
    ctx.fillText('假以时日，必成通晓万国大略之太阁柱石，全家咸服！”', 56, commentY + 84);

    // 8. 织田信长朱红方印 (天下布武)
    const sealX = width - 130;
    const sealY = 735;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(sealX, sealY, 80, 80);
    ctx.strokeRect(sealX + 3, sealY + 3, 74, 74);

    ctx.fillStyle = '#dc2626';
    ctx.font = '900 20px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('天下', sealX + 40, sealY + 34);
    ctx.fillText('布武', sealX + 40, sealY + 62);

    // 底部寄语
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✨ 《太阁英语立志传》亲子伴读成就证明 · 见证每日成长', 40, 840);

    return canvas.toDataURL('image/png');
  }

  showCertificateModal(data = {}) {
    const modal = document.getElementById('modal-honor-scroll');
    const content = document.getElementById('honor-scroll-content');
    if (!modal || !content) return;

    const imgDataUrl = this.generateCertificate(data);

    content.innerHTML = `
      <div style="text-align:center; padding:10px;">
        <div style="margin-bottom:12px; font-weight:800; font-size:16px; color:#1e1b4b;">
          📜 今日军功立志勋绩卡已铸就！
        </div>
        <div style="box-shadow:0 8px 30px rgba(0,0,0,0.18); border-radius:12px; overflow:hidden; display:inline-block; max-width:100%;">
          <img src="${imgDataUrl}" alt="军功勋状" style="width:100%; max-width:360px; height:auto; display:block;" id="honor-scroll-img">
        </div>
        <div style="margin-top:14px; font-size:12px; color:#64748b;">
          💡 手机/iPad 可长按上方图片保存到相册，发给爸爸妈妈看！
        </div>
        <div style="display:flex; justify-content:center; gap:12px; margin-top:16px;">
          <a class="btn btn-primary" href="${imgDataUrl}" download="太阁英语军功勋绩状.png" style="font-weight:800; padding:10px 24px;">
            📥 下载并保存勋状
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.honorScroll.closeCertificateModal()">
            关闭
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.audioEngine) {
      window.audioEngine.playVictoryFanfare();
    }
  }

  closeCertificateModal() {
    const modal = document.getElementById('modal-honor-scroll');
    if (modal) modal.classList.add('hidden');
  }
}

// 统一挂载
window.eyeRestGuard = new EyeRestGuard();
window.honorScroll = new HonorScrollGenerator();
window.honorScroll.eyeRestGuard = window.eyeRestGuard;

// 代理方法供全局便捷调用
window.honorScroll.startRestCountdown = () => window.eyeRestGuard.startRestCountdown();
window.honorScroll.finishRest = () => window.eyeRestGuard.finishRest();
window.honorScroll.finishRestEarly = () => window.eyeRestGuard.finishRestEarly();
window.honorScroll.snooze = (m) => window.eyeRestGuard.snooze(m);
window.honorScroll.triggerEyeRestForTesting = () => window.eyeRestGuard.triggerForTest();

document.addEventListener('DOMContentLoaded', () => {
  window.eyeRestGuard.init();
});
