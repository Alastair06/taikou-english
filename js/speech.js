/**
 * 太阁英语立志传 · 语音与战国和风音效合成引擎 (Audio & Speech Synthesis)
 * - 纯正美音真人录音双引擎（有道标准美音 CDN + 本地 Web Speech API 离线备用）
 * - Web Audio API 纯代码即时合成：战国太鼓、名刀出鞘、铁炮轰鸣、法螺贝号角
 * - 移动端全兼容硬件音频通道解锁（iOS 静音策略绕过、安卓无 TTS 引擎降级）
 */

// 移动端轻量触感反馈系统 (Tactile Haptics)
window.haptics = {
  tap() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) {}
    }
  },
  success() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([25, 40, 35]); } catch (e) {}
    }
  },
  defeat() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([60, 50, 80]); } catch (e) {}
    }
  }
};

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.speechRate = 0.85; // 稍微稳健温和的语速，适合三年级跟读
    this.isUnlocked = false;
    this.hasShownAudioHint = false;

    // 移动端专用 HTML5 Audio 词典真人发音播放器
    this.wordAudio = null;
    this.activeUtterance = null;

    // Web Speech API 麦克风发音评测引擎
    this.recognizer = null;
    this.isListening = false;

    this.ensureAudioContext();
    this.initVoices();
    this.initSpeechRecognition();
  }

  ensureAudioContext() {
    try {
      const AudioClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        if (AudioClass) this.audioCtx = new AudioClass();
      }
      if (this.audioCtx && (this.audioCtx.state === 'suspended' || this.audioCtx.state === 'interrupted')) {
        this.audioCtx.resume().catch(() => {});
      }
    } catch (e) {}
    return this.audioCtx;
  }

  initAudioContext() {
    return this.ensureAudioContext();
  }

  unlockAudio() {
    const ctx = this.ensureAudioContext();

    if (this.isUnlocked) {
      if (ctx && (ctx.state === 'suspended' || ctx.state === 'interrupted')) {
        ctx.resume().catch(() => {});
      }
      return;
    }

    // 1. 解锁 Web Audio API：播放 1 采样微小无声缓冲，彻底激活 iOS/Android 硬件音频输出管线
    if (ctx) {
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {}
    }

    // 2. 解锁 HTML5 Audio 媒体播放通道 (避免移动端浏览器拦截动态 play)
    if (!this.wordAudio && typeof document !== 'undefined') {
      try {
        this.wordAudio = document.createElement('audio');
        this.wordAudio.id = 'taikou-word-audio';
        this.wordAudio.setAttribute('playsinline', '');
        this.wordAudio.setAttribute('webkit-playsinline', '');
        this.wordAudio.preload = 'auto';
        document.body.appendChild(this.wordAudio);
      } catch (e) {}
    }
    if (this.wordAudio) {
      try {
        this.wordAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8A';
        const p = this.wordAudio.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      } catch (e) {}
    }

    // 3. 解锁 Web Speech API
    if (this.speechSynth) {
      try {
        if (this.speechSynth.paused) {
          this.speechSynth.resume();
        }
        const dummy = new SpeechSynthesisUtterance('');
        dummy.volume = 0;
        this.speechSynth.speak(dummy);
      } catch (e) {}
    }

    this.isUnlocked = true;
  }

  initVoices() {
    if (!this.speechSynth) return;
    const update = () => {
      try {
        const voices = this.speechSynth.getVoices();
        // 优先寻找苹果 iPad 自带的标准美音/英音
        const preferred = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google') || v.name.includes('Natural')));
        this.selectedVoice = preferred || voices.find(v => v.lang.startsWith('en')) || null;
      } catch (e) {}
    };
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = update;
    }
    update();
  }

  initSpeechRecognition() {
    try {
      const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
      if (SpeechRec) {
        this.recognizer = new SpeechRec();
        this.recognizer.lang = 'en-US';
        this.recognizer.continuous = false;
        this.recognizer.interimResults = false;
        this.recognizer.maxAlternatives = 3;
      }
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
    }
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * 启动麦克风跟读识别并评测
   */
  recognizeSpeech(targetWord, onStart, onResult, onError) {
    if (!this.recognizer) {
      this.initSpeechRecognition();
    }
    if (!this.recognizer) {
      if (onError) onError(new Error('当前浏览器暂未开启麦克风语音识别，请在 iPad Safari 或 Chrome 中使用。'));
      return;
    }
    this.unlockAudio();

    this.recognizer.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognizer.onresult = (event) => {
      this.isListening = false;
      const results = event.results;
      if (results && results.length > 0 && results[0].length > 0) {
        const spoken = results[0][0].transcript.trim().toLowerCase();
        const conf = results[0][0].confidence || 0.85;
        const evalResult = this.evaluatePronunciation(spoken, targetWord);
        if (onResult) onResult({ spoken, evalResult, confidence: conf });
      } else {
        if (onError) onError(new Error('未能捕捉到清晰发音，请再试一次'));
      }
    };

    this.recognizer.onerror = (err) => {
      this.isListening = false;
      if (onError) onError(err);
    };

    this.recognizer.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognizer.start();
    } catch (e) {
      try {
        this.recognizer.abort();
        setTimeout(() => this.recognizer.start(), 150);
      } catch (err2) {
        this.isListening = false;
        if (onError) onError(err2);
      }
    }
  }

  /**
   * 发音精确度与相似度评估
   */
  evaluatePronunciation(spokenText, targetWord) {
    if (!spokenText) return { score: 0, matched: false, level: 'miss', message: '未检测到声音，请大声念出来！' };
    const cleanSpoken = spokenText.trim().toLowerCase().replace(/[^a-z]/g, '');
    const cleanTarget = targetWord.trim().toLowerCase().replace(/[^a-z]/g, '');

    // 1. 完全命中
    if (cleanSpoken === cleanTarget) {
      return { score: 100, matched: true, level: 'perfect', title: '言灵大成功 · 纯正地道', message: '发音极准！大名击节赞赏，剑气暴击！' };
    }

    // 2. 包含目标词
    if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
      return { score: 90, matched: true, level: 'good', title: '言灵命中 · 气势如虹', message: '发音非常到位！破敌有效！' };
    }

    // 3. 莱文斯坦编辑距离模糊匹配 (容忍儿童略微连读或单音节偏差)
    const dist = this.levenshtein(cleanSpoken, cleanTarget);
    const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
    const similarity = Math.max(0, 1 - dist / maxLen);

    if (similarity >= 0.65) {
      return { score: Math.round(similarity * 100), matched: true, level: 'pass', title: '言灵过关 · 勉励进取', message: '声调大致准确，继续练习定成大器！' };
    } else {
      return { score: Math.round(similarity * 100), matched: false, level: 'retry', title: '言灵未中 · 再接再厉', message: `识别到的是【${spokenText}】，再听一遍示范，大声试一次！` };
    }
  }

  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * 纯正真人美音单词朗读系统 (双引擎智能降级)
   * 引擎 1 (主): HTML5 Audio 播放在线有道纯正美音真人录音 (100% 覆盖所有手机，包括无 Google TTS 的安卓手机与各版本 iOS)
   * 引擎 2 (备): Web Speech API 本地离线合成 (断网或无网络环境下自动兜底)
   */
  speak(text, rate = null) {
    if (!text || typeof text !== 'string') return;
    this.unlockAudio();

    const clean = text.trim();
    if (!clean) return;

    // 手机端贴心提示（首次触发，提醒检查静音拨片与音量）
    if (!this.hasShownAudioHint) {
      this.hasShownAudioHint = true;
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('taikou_audio_tip_seen')) {
        localStorage.setItem('taikou_audio_tip_seen', '1');
        if (window.ui && typeof window.ui.showToast === 'function') {
          window.ui.showToast('🔊 正在发音！若手机无声，请检查是否处于静音模式并调大音量', '🔈');
        }
      }
    }

    // 优先尝试词典真人录音
    this.speakViaAudioElement(clean, rate);
  }

  speakViaAudioElement(text, rate = null) {
    if (!this.wordAudio && typeof document !== 'undefined') {
      try {
        this.wordAudio = document.createElement('audio');
        this.wordAudio.id = 'taikou-word-audio';
        this.wordAudio.setAttribute('playsinline', '');
        this.wordAudio.setAttribute('webkit-playsinline', '');
        this.wordAudio.preload = 'auto';
        document.body.appendChild(this.wordAudio);
      } catch (e) {}
    }

    if (this.wordAudio) {
      try {
        this.wordAudio.pause();
        this.wordAudio.currentTime = 0;
      } catch (e) {}

      // 有道词典真人美音 API (type=2 代表标准美音，国内与海外 CDN 极速分发)
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
      this.wordAudio.src = audioUrl;
      if (rate !== null && rate > 0) {
        this.wordAudio.playbackRate = rate;
      } else {
        this.wordAudio.playbackRate = 1.0;
      }

      let started = false;
      const playPromise = this.wordAudio.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            started = true;
          })
          .catch((err) => {
            console.warn('Word audio play error, falling back to Web Speech API:', err);
            if (!started) {
              this.speakViaSpeechSynth(text, rate);
            }
          });
      }

      this.wordAudio.onerror = () => {
        if (!started) {
          console.warn('Word audio network error, falling back to Web Speech API');
          this.speakViaSpeechSynth(text, rate);
        }
      };
    } else {
      this.speakViaSpeechSynth(text, rate);
    }
  }

  speakViaSpeechSynth(text, rate = null) {
    if (!this.speechSynth) return;
    try {
      if (this.speechSynth.paused) {
        this.speechSynth.resume();
      }

      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.volume = 1.0;
      if (this.selectedVoice) u.voice = this.selectedVoice;
      u.rate = rate !== null ? rate : this.speechRate;
      u.pitch = 1.0;

      // 保持长引用，防止 iOS 垃圾回收器过早回收 utterance 导致静音
      this.activeUtterance = u;
      u.onend = () => { this.activeUtterance = null; };
      u.onerror = (e) => {
        this.activeUtterance = null;
        console.warn('SpeechSynthesis utterance error:', e);
      };

      this.speechSynth.speak(u);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  testAudio() {
    this.unlockAudio();
    this.playPromotionFanfare();
    setTimeout(() => {
      this.speak('Hello! Welcome to Taikou English!');
    }, 450);
    if (window.ui && typeof window.ui.showToast === 'function') {
      window.ui.showToast('🔊 已播放测试音效与英语发音！若仍无声，请检查手机静音开关与音量', '🔉');
    }
  }

  speakLetter(char) {
    // 依少儿英语教育与游戏沉浸体验设计：
    // 输入单个字母时不调用 TTS 朗读单字母（彻底解决 iPad/Safari 将大写字母念成 "Capital A", "Capital B" 的生硬打断问题）
    // 字母敲击由清脆符文与斩击打击音（playKeyRune）提供即时正向反馈，整词拼成后由 TTS 朗读纯正全词美音。
    return;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // 1. 战国太鼓点兵 (Deep Taiko Drum)
  playTaikoDrum() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 2. 名刀出鞘拔刀斩 (Katana Slash)
  playKatanaSlash() {
    if (window.haptics) window.haptics.success();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // 3. 西洋铁炮轰鸣 (Matchlock Musket Fire)
  playMusketBlast() {
    if (window.haptics) window.haptics.success();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // 4. 键盘按键音 (Key tap)
  playKeyRune() {
    if (window.haptics) window.haptics.tap();
    this.playTone(659.25, 'triangle', 0.06, 0.1); // E5
  }

  // 5. 小判金币掉落 (Gold coin)
  playCoin() {
    if (window.haptics) window.haptics.tap();
    this.playTone(987.77, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.12, 0.18), 70);
  }

  // 6. 晋升封赏法螺贝号角 (Sengoku Fanfare)
  playPromotionFanfare() {
    if (window.haptics) window.haptics.success();
    this.playTaikoDrum();
    setTimeout(() => {
      [440, 554, 659, 880].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.25), idx * 140);
      });
    }, 150);
  }

  // 7. 拼错温和提示音 (Gentle notice)
  playMistake() {
    if (window.haptics) window.haptics.defeat();
    this.playTone(196, 'sine', 0.12, 0.08);
  }

  // 别名兼容
  playSlash() {
    this.playKatanaSlash();
  }

  playDrumHit() {
    this.playTaikoDrum();
  }

  playFanfare() {
    this.playPromotionFanfare();
  }

  playVictoryFanfare() {
    this.playPromotionFanfare();
  }

  playFluteFanfare() {
    this.playTone(523.25, 'sine', 0.15, 0.15);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.15), 120);
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.2), 240);
    setTimeout(() => this.playTone(1046.50, 'sine', 0.35, 0.25), 360);
  }

  playSlashSuccess() {
    this.playKatanaSlash();
  }

  playSlashMiss() {
    this.playMistake();
  }

  playBlip() {
    this.playTone(392, 'sine', 0.08, 0.12);
  }

  playLockDeflection() {
    this.playTone(220, 'triangle', 0.1, 0.15);
  }

  // 动森式环境微交互音效合成 (Web Audio API 纯代码合成)
  playWaterSplash() {
    this.unlockAudio();
    this.playTone(600, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(900, 'sine', 0.06, 0.15), 50);
    setTimeout(() => this.playTone(1200, 'triangle', 0.1, 0.08), 90);
  }

  playWindChime() {
    this.unlockAudio();
    const chimes = [1318.51, 1567.98, 1760.00, 2093.00];
    chimes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.12), idx * 80);
    });
  }

  playBirdChirp() {
    this.unlockAudio();
    this.playTone(1800, 'sine', 0.05, 0.12);
    setTimeout(() => this.playTone(2400, 'sine', 0.08, 0.15), 50);
    setTimeout(() => this.playTone(2100, 'sine', 0.06, 0.1), 120);
  }

  playFrogCroak() {
    this.unlockAudio();
    this.playTone(180, 'sawtooth', 0.08, 0.15);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.12, 0.18), 70);
  }

  playVoiceRipple() {
    this.unlockAudio();
    this.playTone(523.25, 'sine', 0.15, 0.12); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.14), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.18, 0.16), 200); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.25, 0.18), 300); // C6
  }
}

window.audioEngine = new AudioEngine();
