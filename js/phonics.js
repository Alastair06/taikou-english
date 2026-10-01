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
}

window.PhonicsHelper = PhonicsHelper;
