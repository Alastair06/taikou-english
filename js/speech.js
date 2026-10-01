/**
 * 太阁英语立志传 · 语音与战国和风音效合成引擎 (Audio & Speech Synthesis)
 * - 纯正美音真人离线朗读（支持 iPad 离线自带 Samantha 语音库）
 * - Web Audio API 纯代码即时合成：战国太鼓、名刀出鞘、铁炮轰鸣、法螺贝号角
 * - 零外部音频文件加载，100% 离线，毫秒级响应
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.speechRate = 0.85; // 稍微稳健温和的语速，适合三年级跟读
    this.isUnlocked = false;

    // Web Speech API 麦克风发音评测引擎
    this.recognizer = null;
    this.isListening = false;

    this.initAudioContext();
    this.initVoices();
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    try {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
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

  initAudioContext() {
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    } catch (e) {}
  }

  unlockAudio() {
    if (this.isUnlocked) return;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.speechSynth) {
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      this.speechSynth.speak(dummy);
    }
    this.isUnlocked = true;
  }

  initVoices() {
    if (!this.speechSynth) return;
    const update = () => {
      const voices = this.speechSynth.getVoices();
      // 优先寻找苹果 iPad 自带的标准美音/英音
      const preferred = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google') || v.name.includes('Natural')));
      this.selectedVoice = preferred || voices.find(v => v.lang.startsWith('en')) || null;
    };
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = update;
    }
    update();
  }

  speak(text, rate = null) {
    if (!this.speechSynth) return;
    this.unlockAudio();
    this.speechSynth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (this.selectedVoice) u.voice = this.selectedVoice;
    u.rate = rate !== null ? rate : this.speechRate;
    u.pitch = 1.0;
    this.speechSynth.speak(u);
  }

  speakLetter(char) {
    // 依少儿英语教育与游戏沉浸体验设计：
    // 输入单个字母时不调用 TTS 朗读单字母（彻底解决 iPad/Safari 将大写字母念成 "Capital A", "Capital B" 的生硬打断问题）
    // 字母敲击由清脆符文与斩击打击音（playKeyRune）提供即时正向反馈，整词拼成后由 TTS 朗读纯正全词美音。
    return;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  // 1. 战国太鼓点兵 (Deep Taiko Drum)
  playTaikoDrum() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 2. 名刀出鞘拔刀斩 (Katana Slash)
  playKatanaSlash() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // 3. 西洋铁炮轰鸣 (Matchlock Musket Fire)
  playMusketBlast() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // 4. 键盘按键音 (Key tap)
  playKeyRune() {
    this.playTone(659.25, 'triangle', 0.06, 0.1); // E5
  }

  // 5. 小判金币掉落 (Gold coin)
  playCoin() {
    this.playTone(987.77, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.12, 0.18), 70);
  }

  // 6. 晋升封赏法螺贝号角 (Sengoku Fanfare)
  playPromotionFanfare() {
    this.playTaikoDrum();
    setTimeout(() => {
      [440, 554, 659, 880].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.25), idx * 140);
      });
    }, 150);
  }

  // 7. 拼错温和提示音 (Gentle notice)
  playMistake() {
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
