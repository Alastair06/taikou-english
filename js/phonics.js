/**
 * 太阁英语大冒险 · 自然拼读与破招心法解析器 (Phonics & Mnemonic Engine)
 * 专门针对人教版三年级单词进行音节切分、核心元音字母组合高亮与记忆点拨
 */

class PhonicsHelper {
  // 重点词库专属拼读拆解与点拨库
  static WORD_TIPS = {
    'meet': {
      chunks: [{ t: 'm', type: 'c' }, { t: 'ee', type: 'v', tip: '长元音 /i:/' }, { t: 't', type: 'c' }],
      phonicsTip: '双写字母组合 <strong>ee</strong> 发长元音 <strong>/i:/</strong>，发音像微笑“衣~”，拼读：/m-i:-t/！'
    },
    'friend': {
      chunks: [{ t: 'fr', type: 'c' }, { t: 'ie', type: 'v', tip: '短元音 /e/' }, { t: 'nd', type: 'c' }],
      phonicsTip: '字母组合 <strong>ie</strong> 在这里发短元音 <strong>/e/</strong>，结尾 nd 连读，拼读：/f-r-e-n-d/！'
    },
    'nice': {
      chunks: [{ t: 'n', type: 'c' }, { t: 'i', type: 'v', tip: '发字母音 /aɪ/' }, { t: 'ce', type: 'c', tip: '发 /s/' }],
      phonicsTip: '末尾哑巴 <strong>e</strong> 让前面的 <strong>i</strong> 发本身音 <strong>/aɪ/</strong>，ce 软音读 /s/：/n-aɪ-s/！'
    },
    'hello': {
      chunks: [{ t: 'h', type: 'c' }, { t: 'e', type: 'v' }, { t: 'll', type: 'c' }, { t: 'o', type: 'v', tip: '/əʊ/' }],
      phonicsTip: '双写 <strong>ll</strong> 发一个 /l/ 音，末尾字母 <strong>o</strong> 读 /əʊ/：/h-e-l-əʊ/！'
    },
    'name': {
      chunks: [{ t: 'n', type: 'c' }, { t: 'a', type: 'v', tip: '发字母音 /eɪ/' }, { t: 'm', type: 'c' }, { t: 'e', type: 'silent', tip: '不发音' }],
      phonicsTip: '经典 a_e 相对开音节！末尾 <strong>e</strong> 不发音，<strong>a</strong> 发字母本音 <strong>/eɪ/</strong>：/n-eɪ-m/！'
    },
    'school': {
      chunks: [{ t: 'sch', type: 'c', tip: '/sk/' }, { t: 'oo', type: 'v', tip: '长元音 /u:/' }, { t: 'l', type: 'c' }],
      phonicsTip: '字母组合 <strong>oo</strong> 读圆唇长音 <strong>/u:/</strong>，sch 读 /sk/：/s-k-u:-l/！'
    },
    'good': {
      chunks: [{ t: 'g', type: 'c' }, { t: 'oo', type: 'v', tip: '短元音 /ʊ/' }, { t: 'd', type: 'c' }],
      phonicsTip: '这里的 <strong>oo</strong> 读短促的 <strong>/ʊ/</strong>，像轻拍肚子“唔”：/g-ʊ-d/！'
    },
    'morning': {
      chunks: [{ t: 'm', type: 'c' }, { t: 'or', type: 'v', tip: '卷舌音 /ɔ:/' }, { t: 'n', type: 'c' }, { t: 'ing', type: 'v', tip: '/ɪŋ/' }],
      phonicsTip: '前段 <strong>or</strong> 读 /ɔ:/，后段 <strong>ing</strong> 读轻音 /ɪŋ/：/m-ɔ:-n-ɪŋ/！'
    },
    'apple': {
      chunks: [{ t: 'a', type: 'v', tip: '大嘴梅花音 /æ/' }, { t: 'pp', type: 'c' }, { t: 'le', type: 'c', tip: '/l/' }],
      phonicsTip: '首字母 <strong>a</strong> 张大嘴读 <strong>/æ/</strong>，末尾 le 读成舌尖轻顶上牙龈的 /l/：/æ-p-l/！'
    },
    'banana': {
      chunks: [{ t: 'ba', type: 'c' }, { t: 'na', type: 'v' }, { t: 'na', type: 'v' }],
      phonicsTip: '三个音节重音在中间！读成 /bə-ˈnɑː-nə/！'
    },
    'cat': {
      chunks: [{ t: 'c', type: 'c', tip: '/k/' }, { t: 'a', type: 'v', tip: '梅花音 /æ/' }, { t: 't', type: 'c' }],
      phonicsTip: 'CVC 结构：c 读 /k/，a 读 /æ/，t 读清脆的 /t/：/k-æ-t/！'
    },
    'dog': {
      chunks: [{ t: 'd', type: 'c' }, { t: 'o', type: 'v', tip: '短元音 /ɒ/' }, { t: 'g', type: 'c' }],
      phonicsTip: 'CVC 结构：o 发短元音 /ɒ/，舌后部轻碰软腭发 g：/d-ɒ-g/！'
    },
    'ruler': {
      chunks: [{ t: 'ru', type: 'v', tip: '/ru:/' }, { t: 'ler', type: 'c', tip: '/lə/' }],
      phonicsTip: '前音节 ru 读 /ru:/，末尾 er 弱读为 /ə/：/ˈruː-lə/！'
    },
    'pencil': {
      chunks: [{ t: 'pen', type: 'c' }, { t: 'cil', type: 'c', tip: 'c在i前软读/s/' }],
      phonicsTip: '两音节词！pen (钢笔) + cil (/sɪl/)，c 在 i 前读软音 /s/：/ˈpen-sl/！'
    }
  };

  /**
   * 智能获取单词的音节与拼读拆解
   */
  static analyze(wordObj) {
    if (!wordObj || !wordObj.en) return null;
    const cleanEn = wordObj.en.toLowerCase().replace(/[^a-z]/g, '');

    // 1. 如果字典中命中专属拆解
    if (this.WORD_TIPS[cleanEn]) {
      const item = this.WORD_TIPS[cleanEn];
      return {
        word: cleanEn,
        cn: wordObj.cn,
        emoji: wordObj.emoji,
        chunks: item.chunks,
        phonicsTip: item.phonicsTip
      };
    }

    // 2. 通用自然拼读正则启发式切分
    const chunks = [];
    let i = 0;
    const vowels = 'aeiouy';
    const teams = ['ee', 'ea', 'oo', 'ai', 'ay', 'ou', 'ow', 'oi', 'oy', 'oa', 'igh', 'ar', 'er', 'ir', 'or', 'ur', 'th', 'ch', 'sh', 'ph', 'wh', 'ck', 'ng'];

    while (i < cleanEn.length) {
      // 检查 2-3 字母组合
      const two = cleanEn.slice(i, i + 2);
      const three = cleanEn.slice(i, i + 3);

      if (three === 'igh') {
        chunks.push({ t: three, type: 'v', tip: '/aɪ/' });
        i += 3;
      } else if (teams.includes(two)) {
        const isV = 'aeiouy'.includes(two[0]);
        chunks.push({ t: two, type: isV ? 'v' : 'c' });
        i += 2;
      } else {
        const ch = cleanEn[i];
        chunks.push({ t: ch, type: vowels.includes(ch) ? 'v' : 'c' });
        i++;
      }
    }

    return {
      word: cleanEn,
      cn: wordObj.cn,
      emoji: wordObj.emoji,
      chunks: chunks,
      phonicsTip: `请跟着标准英音仔细听原声，辅音干脆、元音饱满：<strong>${cleanEn.toUpperCase()}</strong>！`
    };
  }

  /**
   * 获取自然拼读乐高积木块 (用于阶段二：大手轰城拼读装填)
   */
  static getPhonicsBlocks(wordObj) {
    if (!wordObj || !wordObj.en) return { targetBlocks: ['m', 'eet'], distractors: ['oat'] };
    const cleanEn = wordObj.en.toLowerCase().replace(/[^a-z]/g, '');

    const customBlocks = {
      'meet': ['m', 'eet'],
      'friend': ['fr', 'iend'],
      'nice': ['n', 'ice'],
      'hello': ['hel', 'lo'],
      'name': ['n', 'ame'],
      'school': ['sch', 'ool'],
      'good': ['g', 'ood'],
      'morning': ['mor', 'ning'],
      'apple': ['ap', 'ple'],
      'banana': ['ba', 'na', 'na'],
      'cat': ['c', 'at'],
      'dog': ['d', 'og'],
      'ruler': ['ru', 'ler'],
      'pencil': ['pen', 'cil'],
      'book': ['b', 'ook'],
      'fish': ['f', 'ish'],
      'egg': ['e', 'gg'],
      'this': ['th', 'is'],
      'day': ['d', 'ay'],
      'have': ['h', 'ave'],
      'boy': ['b', 'oy'],
      'girl': ['g', 'irl'],
      'classroom': ['class', 'room'],
      'afternoon': ['after', 'noon'],
      'goodbye': ['good', 'bye'],
      'fine': ['f', 'ine'],
      'thank': ['th', 'ank'],
      'miss': ['m', 'iss'],
      'gate': ['g', 'ate'],
      'home': ['h', 'ome']
    };

    let targetBlocks = customBlocks[cleanEn];
    if (!targetBlocks) {
      if (cleanEn.length <= 3) {
        targetBlocks = [cleanEn.slice(0, 1), cleanEn.slice(1)];
      } else {
        const vowels = 'aeiouy';
        let vIdx = -1;
        for (let i = 0; i < cleanEn.length; i++) {
          if (vowels.includes(cleanEn[i])) {
            vIdx = i;
            break;
          }
        }
        if (vIdx > 0 && vIdx < cleanEn.length - 1) {
          targetBlocks = [cleanEn.slice(0, vIdx), cleanEn.slice(vIdx)];
        } else {
          const mid = Math.ceil(cleanEn.length / 2);
          targetBlocks = [cleanEn.slice(0, mid), cleanEn.slice(mid)];
        }
      }
    }

    const distractorPool = ['sh', 'ch', 'th', 'ing', 'ed', 'un', 'op', 'at', 'it', 'en', 'ay', 'ee', 'ar', 'ow', 'oo'];
    const filtered = distractorPool.filter(d => !targetBlocks.includes(d));
    const distractor = filtered[Math.floor(Math.random() * filtered.length)] || 'ing';

    return {
      targetBlocks,
      distractors: [distractor]
    };
  }

  /**
   * 获取人教版 2024 新课标真实语境整句 (用于阶段三：本丸斩将语境交际)
   */
  static getPedagogySentence(wordObj) {
    if (!wordObj || !wordObj.en) {
      return { prefix: 'This is ', blank: 'it', suffix: '.', full: 'This is it.', cn: '就是这个。' };
    }
    const en = wordObj.en.toLowerCase().replace(/[^a-z]/g, '');

    const sentenceDict = {
      'meet': { prefix: 'Nice to ', blank: 'meet', suffix: ' you!', full: 'Nice to meet you!', cn: '很高兴遇见你！' },
      'friend': { prefix: 'This is my good ', blank: 'friend', suffix: '.', full: 'This is my good friend.', cn: '这是我的好朋友。' },
      'nice': { prefix: 'Have a ', blank: 'nice', suffix: ' day!', full: 'Have a nice day!', cn: '祝你有美好的一天！' },
      'hello': { prefix: '', blank: 'Hello', suffix: ', my teacher!', full: 'Hello, my teacher!', cn: '你好，我的老师！' },
      'hi': { prefix: '', blank: 'Hi', suffix: '! How are you?', full: 'Hi! How are you?', cn: '嗨！你好吗？' },
      'you': { prefix: 'Nice to meet ', blank: 'you', suffix: '!', full: 'Nice to meet you!', cn: '很高兴认识你！' },
      'name': { prefix: "What is your ", blank: 'name', suffix: '?', full: "What is your name?", cn: '你叫什么名字？' },
      'school': { prefix: 'Let us go to ', blank: 'school', suffix: '!', full: 'Let us go to school!', cn: '我们一起去上学吧！' },
      'morning': { prefix: 'Good ', blank: 'morning', suffix: ', everyone!', full: 'Good morning, everyone!', cn: '大家早上好！' },
      'apple': { prefix: 'I want a red ', blank: 'apple', suffix: '.', full: 'I want a red apple.', cn: '我想要一个红苹果。' },
      'banana': { prefix: 'This is a sweet ', blank: 'banana', suffix: '.', full: 'This is a sweet banana.', cn: '这是一根甜香蕉。' },
      'cat': { prefix: 'Look at the cute ', blank: 'cat', suffix: '.', full: 'Look at the cute cat.', cn: '看这只可爱的小猫。' },
      'dog': { prefix: 'I have a loyal ', blank: 'dog', suffix: '.', full: 'I have a loyal dog.', cn: '我有一只忠诚的狗。' },
      'boy': { prefix: 'He is a brave ', blank: 'boy', suffix: '.', full: 'He is a brave boy.', cn: '他是一个勇敢的男孩。' },
      'girl': { prefix: 'She is a clever ', blank: 'girl', suffix: '.', full: 'She is a clever girl.', cn: '她是一个聪明的女孩。' },
      'book': { prefix: 'Open your English ', blank: 'book', suffix: '.', full: 'Open your English book.', cn: '打开你的英语书。' },
      'ruler': { prefix: 'Use the long ', blank: 'ruler', suffix: '.', full: 'Use the long ruler.', cn: '使用这把长尺子。' },
      'pencil': { prefix: 'Write with a ', blank: 'pencil', suffix: '.', full: 'Write with a pencil.', cn: '用铅笔写字。' },
      'fish': { prefix: 'The little ', blank: 'fish', suffix: ' can swim.', full: 'The little fish can swim.', cn: '小鱼会游泳。' },
      'good': { prefix: 'You did a ', blank: 'good', suffix: ' job!', full: 'You did a good job!', cn: '你做得很好！' },
      'afternoon': { prefix: 'Good ', blank: 'afternoon', suffix: ', sir!', full: 'Good afternoon, sir!', cn: '下午好，先生！' },
      'goodbye': { prefix: '', blank: 'Goodbye', suffix: ', see you tomorrow!', full: 'Goodbye, see you tomorrow!', cn: '再见，明天见！' },
      'classroom': { prefix: 'Our ', blank: 'classroom', suffix: ' is very clean.', full: 'Our classroom is very clean.', cn: '我们的教室很干净。' }
    };

    if (sentenceDict[en]) {
      return sentenceDict[en];
    }

    return {
      prefix: 'Look at this ',
      blank: wordObj.en,
      suffix: '!',
      full: `Look at this ${wordObj.en}!`,
      cn: `看这个${wordObj.cn || ''}！`
    };
  }

  /**
   * 战国名侦探 · 军机密报破案线索生成器 (用于阶段一：截获密报排查抓奸细)
   */
  static getSpyIntelClue(wordObj) {
    if (!wordObj || !wordObj.en) {
      return {
        en: 'The spy carries a secret scroll!',
        highlightEn: 'scroll',
        cn: '密报线索：敌方细作怀揣接头密卷！速去擒拿！',
        suspectTitle: '🥷 怀揣密信者',
        suspectDesc: '可疑黑衣密探'
      };
    }
    const en = wordObj.en.toLowerCase().replace(/[^a-z]/g, '');
    const cn = wordObj.cn || '';

    const clueDict = {
      'meet': {
        en: 'The spy will meet a traitor near the gate. Arrest the spy!',
        highlightEn: 'meet',
        cn: '密报：敌军细作正赶往关前【接头相见 meet】，速去擒拿！',
        suspectTitle: '🥷 怀揣密信者',
        suspectDesc: '东张西望等待接头'
      },
      'friend': {
        en: 'The spy is disguised as an old friend with a bamboo hat.',
        highlightEn: 'friend',
        cn: '密报：细作伪装成戴斗笠的【友人知己 friend】潜伏在侧！',
        suspectTitle: '🧑‍🤝‍🧑 伪装故交者',
        suspectDesc: '神色慌张假装熟络'
      },
      'nice': {
        en: 'Look for a nice box hidden under the cart!',
        highlightEn: 'nice',
        cn: '密报：细作把粮饷暗号藏在【精致匣子 nice】之中！',
        suspectTitle: '📦 护送宝匣者',
        suspectDesc: '紧抱雕花漆木精匣'
      },
      'hello': {
        en: 'The spy said hello to the guard with a strange accent.',
        highlightEn: 'hello',
        cn: '密报：细作操着外邦口音向前哨打招呼【问好 hello】！',
        suspectTitle: '🗣️ 攀谈问候者',
        suspectDesc: '口音生硬攀附守卫'
      },
      'hi': {
        en: 'The scout heard the spy whisper hi in the shadows.',
        highlightEn: 'hi',
        cn: '密报：斥候听见潜伏者在阴影中发出【暗号问候 hi】！',
        suspectTitle: '🥷 暗影低语者',
        suspectDesc: '躲在暗处发出暗号'
      },
      'name': {
        en: 'The spy gave a fake name to pass the gate inspection.',
        highlightEn: 'name',
        cn: '密报：细作在关所查验时报出了虚假的【姓名 name】！',
        suspectTitle: '📜 谎报姓名者',
        suspectDesc: '通关文牒字迹涂改'
      },
      'school': {
        en: 'The spy is hiding near the village school building.',
        highlightEn: 'school',
        cn: '密报：细作正潜伏在町屋【学堂 school】旁的古树下！',
        suspectTitle: '🏫 学堂潜伏者',
        suspectDesc: '倚靠学堂外墙窥视'
      },
      'morning': {
        en: 'The attack will begin early in the morning before sunrise.',
        highlightEn: 'morning',
        cn: '密报：敌军计划在明日【清晨 morning】天明前突袭！',
        suspectTitle: '🌅 拂晓斥候',
        suspectDesc: '观测日出测算天色'
      },
      'apple': {
        en: 'The spy stole a sweet red apple from the supply camp.',
        highlightEn: 'apple',
        cn: '密报：敌军细作在粮仓旁偷拿了一个【红苹果 apple】！',
        suspectTitle: '🍎 偷藏苹果者',
        suspectDesc: '袖口露出鲜红苹果'
      },
      'banana': {
        en: 'Look for the merchant with a basket of yellow banana fruit.',
        highlightEn: 'banana',
        cn: '密报：细作假扮成挑着【香蕉 banana】的南蛮果贩！',
        suspectTitle: '🍌 挑担果贩',
        suspectDesc: '果筐下藏有短刃'
      },
      'cat': {
        en: 'The spy has a black cat sleeping in his bamboo basket.',
        highlightEn: 'cat',
        cn: '密报：敌方密探竹篓里藏着一只【黑色猫咪 cat】！',
        suspectTitle: '🐱 怀抱猫咪者',
        suspectDesc: '竹篓中传出猫叫声'
      },
      'dog': {
        en: 'Follow the suspicious traveler walking a brown dog.',
        highlightEn: 'dog',
        cn: '密报：可疑分子正牵着一条【忠犬小狗 dog】四处刺探！',
        suspectTitle: '🐶 牵犬游荡者',
        suspectDesc: '借遛犬暗探城防鹿砦'
      },
      'book': {
        en: 'The spy dropped an English book on the path.',
        highlightEn: 'book',
        cn: '密报：敌军信使在山径遗落了一卷【英文书本 book】！',
        suspectTitle: '📖 携带书卷者',
        suspectDesc: '腰间别着古旧行军书'
      },
      'ruler': {
        en: 'The engineer is measuring our stone wall with a ruler.',
        highlightEn: 'ruler',
        cn: '密报：敌方工兵正用【尺子 ruler】暗测我方城墙石垣！',
        suspectTitle: '📏 量度石垣者',
        suspectDesc: '持尺测量城垣高度'
      },
      'pencil': {
        en: 'The spy is drawing our castle map with a pencil.',
        highlightEn: 'pencil',
        cn: '密报：密探正用【铅笔 pencil】在手绘城防要塞草图！',
        suspectTitle: '✏️ 执笔绘图者',
        suspectDesc: '怀中藏有炭笔图纸'
      },
      'fish': {
        en: 'The spy is disguised as a fishmonger carrying fish.',
        highlightEn: 'fish',
        cn: '密报：密探假扮成提着【活鱼 fish】的渔夫混入正街！',
        suspectTitle: '🐟 提篮渔夫',
        suspectDesc: '鱼鳞中暗藏敌军令旗'
      }
    };

    if (clueDict[en]) {
      return clueDict[en];
    }

    return {
      en: `The spy carries a secret item marked with "${wordObj.en}". Catch him!`,
      highlightEn: wordObj.en,
      cn: `密报：斥候探得敌方细作持有与【${cn || wordObj.en}】相关的暗号证物！`,
      suspectTitle: `🥷 疑犯 · 持有【${wordObj.en}】`,
      suspectDesc: `携带【${cn || wordObj.en}】密记证物`
    };
  }
}

window.PhonicsHelper = PhonicsHelper;
