/**
 * 太阁英语立志传 · 核心词库系统 (Words Database)
 * 严格按照【2024最新改版 · 人教版 PEP 三年级上册（2022新课标教材）】照片手工逐词逐字严格校准对齐
 * 全书共 4 大单元，总计 178 个单词/短语
 */

const SENGOKU_UNITS = [
  {
    id: 'pep2024-3a-u1',
    chapter: '第一章',
    name: 'Unit 1: 结识新朋',
    historicalBattle: '那古野城入仕 · 桶狭间大雨奇袭',
    historicalDesc: '主角初入织田家，从替信长暖草鞋起步。面对今川义元四万大军，以南蛮密码刺探军情，助信长大雨奇袭桶狭间！',
    boss: { name: '今川义元 · 骏河之主', icon: '🏯', title: '东海道第一弓取', hp: 120 },
    words: [
      { en: 'meet', cn: '遇见', emoji: '🤝' },
      { en: 'friend', cn: '朋友', emoji: '🧑‍🤝‍🧑' },
      { en: 'nice', cn: '高兴的', emoji: '😊' },
      { en: 'to', cn: '对；向', emoji: '➡️' },
      { en: 'you', cn: '你；您；你们', emoji: '👉' },
      { en: 'in', cn: '在……内；在……状态中', emoji: '📥' },
      { en: 'the', cn: '这（那）个；这（那）些', emoji: '👉' },
      { en: 'classroom', cn: '教室', emoji: '🏫' },
      { en: 'hello', cn: '你好', emoji: '👋' },
      { en: 'boy', cn: '男孩', emoji: '👦' },
      { en: 'and', cn: '和', emoji: '➕' },
      { en: 'girl', cn: '女孩', emoji: '👧' },
      { en: 'I', cn: '我', emoji: '🙋' },
      { en: 'am', cn: '是', emoji: '✨' },
      { en: "I'm", textbook: "I'm=I am", cn: '我是', emoji: '🙋' },
      { en: 'Miss', cn: '女士；小姐', emoji: '👩' },
      { en: 'too', cn: '也；太', emoji: '➕' },
      { en: 'a', textbook: 'a/an', cn: '一个', emoji: '1️⃣' },
      { en: 'apple', cn: '苹果', emoji: '🍎' },
      { en: 'banana', cn: '香蕉', emoji: '🍌' },
      { en: 'what', cn: '什么', emoji: '❓' },
      { en: 'is', cn: '是', emoji: '✨' },
      { en: "what's", textbook: "what's=what is", cn: '是什么', emoji: '❓' },
      { en: 'your', cn: '你的；你们的', emoji: '👉' },
      { en: 'name', cn: '名字', emoji: '📛' },
      { en: 'please', cn: '请', emoji: '🙏' },
      { en: 'at', cn: '在（某处）；在（几点钟）', emoji: '📍' },
      { en: 'school', cn: '学校', emoji: '🏫' },
      { en: 'gate', cn: '大门', emoji: '🚪' },
      { en: 'hi', cn: '你好', emoji: '👋' },
      { en: 'my', cn: '我的', emoji: '🙋‍♂️' },
      { en: 'cat', cn: '猫', emoji: '🐱' },
      { en: 'dog', cn: '狗', emoji: '🐶' },
      { en: 'how', cn: '怎样；多少；多么', emoji: '💭' },
      { en: 'are', cn: '是', emoji: '✨' },
      { en: 'home', cn: '家', emoji: '🏠' },
      { en: 'good', cn: '好的', emoji: '👍' },
      { en: 'morning', cn: '早晨；上午', emoji: '🌅' },
      { en: 'mom', cn: '妈妈', emoji: '👩' },
      { en: 'woof', cn: '（狗叫声）汪', emoji: '🐕' },
      { en: 'fine', cn: '健康的；晴朗的', emoji: '☀️' },
      { en: 'thank', cn: '谢谢', emoji: '🙏' },
      { en: 'afternoon', cn: '下午', emoji: '🌇' },
      { en: 'egg', cn: '蛋', emoji: '🥚' },
      { en: 'fish', cn: '鱼；鱼肉', emoji: '🐟' },
      { en: 'have', cn: '有；吃，喝', emoji: '🍽️' },
      { en: 'day', cn: '（一）天；（一）日', emoji: '📅' },
      { en: 'street', cn: '大街；街道', emoji: '🛣️' },
      { en: 'this', cn: '这个', emoji: '👇' },
      { en: 'goodbye', cn: '再见', emoji: '👋' },
      { en: 'bye', cn: '再见', emoji: '👋' },
      { en: 'hen', cn: '母鸡', emoji: '🐔' }
    ]
  },
  {
    id: 'pep2024-3a-u2',
    chapter: '第二章',
    name: 'Unit 2: 游戏数字',
    historicalBattle: '墨俣之野 · 神速一夜城',
    historicalDesc: '面对斋藤家防线，木下藤吉郎领命在美浓腹地筑城。主角筹集物资、按数字调配巨木，一昼夜拔地建起坚固要塞，名动天下！',
    boss: { name: '斋藤龙兴 · 美浓巨鹫', icon: '🏯', title: '稻叶山城宿敌', hp: 150 },
    words: [
      { en: 'fun', cn: '有趣的；乐趣', emoji: '🎉' },
      { en: 'number', cn: '号码；数字', emoji: '🔢' },
      { en: 'let', cn: '让', emoji: '🤝' },
      { en: 'us', cn: '我们（宾格）', emoji: '👥' },
      { en: "let's", textbook: "let's=let us", cn: '让我们', emoji: '👥' },
      { en: 'play', cn: '玩耍；演奏', emoji: '🎮' },
      { en: 'park', cn: '公园；停车场；停放（车辆等）', emoji: '🏞️' },
      { en: 'OK', cn: '行，好；不错的', emoji: '👌' },
      { en: 'one', cn: '一', emoji: '1️⃣' },
      { en: 'two', cn: '二', emoji: '2️⃣' },
      { en: 'three', cn: '三', emoji: '3️⃣' },
      { en: 'four', cn: '四', emoji: '4️⃣' },
      { en: 'five', cn: '五', emoji: '5️⃣' },
      { en: 'six', cn: '六', emoji: '6️⃣' },
      { en: 'seven', cn: '七', emoji: '7️⃣' },
      { en: 'eight', cn: '八', emoji: '8️⃣' },
      { en: 'nine', cn: '九', emoji: '9️⃣' },
      { en: 'ten', cn: '十', emoji: '🔟' },
      { en: 'great', cn: '极好的；杰出的', emoji: '🌟' },
      { en: 'ice cream', cn: '冰激凌', emoji: '🍦' },
      { en: 'jacket', cn: '夹克', emoji: '🧥' },
      { en: 'how many', cn: '多少', emoji: '🔢' },
      { en: 'duck', cn: '鸭子', emoji: '🦆' },
      { en: 'look', cn: '看', emoji: '👀' },
      { en: 'many', cn: '许多的', emoji: '✨' },
      { en: 'really', cn: '（表示惊奇、兴趣、怀疑等）当真；真正地', emoji: '😮' },
      { en: 'yes', cn: '是，是的；同意', emoji: '✅' },
      { en: 'that', cn: '那；那个', emoji: '👉' },
      { en: "that's", textbook: "that's=that is", cn: '那是', emoji: '👉' },
      { en: 'right', cn: '正确的；右边的', emoji: '✔️' },
      { en: 'kite', cn: '风筝', emoji: '🪁' },
      { en: 'lion', cn: '狮子', emoji: '🦁' },
      { en: 'how old', cn: '多大（年龄）', emoji: '🎂' },
      { en: 'go', cn: '去；走', emoji: '🚶' },
      { en: 'old', cn: '……岁；年老的；陈旧的', emoji: '👴' },
      { en: 'year', cn: '年', emoji: '📅' },
      { en: 'oh', cn: '啊，呀', emoji: '😲' },
      { en: 'sorry', cn: '对不起，抱歉', emoji: '🙇' },
      { en: 'how about', cn: '怎么样', emoji: '💭' },
      { en: 'yeah', cn: '是的', emoji: '✌️' },
      { en: 'monkey', cn: '猴子', emoji: '🐵' },
      { en: 'noodle', cn: '面条', emoji: '🍜' },
      { en: 'phone', cn: '电话', emoji: '📱' },
      { en: 'it', cn: '它', emoji: '📦' },
      { en: "it's", textbook: "it's=it is", cn: '它是', emoji: '📦' },
      { en: 'pet', cn: '宠物', emoji: '🐾' },
      { en: 'orange', cn: '橙子；橙色；橙色的', emoji: '🍊' },
      { en: 'pig', cn: '猪', emoji: '🐷' }
    ]
  },
  {
    id: 'pep2024-3a-u3',
    chapter: '第三章',
    name: 'Unit 3: 文具色彩',
    historicalBattle: '美浓平定 · 岐阜天下布武',
    historicalDesc: '织田军攻克美浓稻叶山城，信长移镇岐阜，刻下“天下布武”大印。主角以斑斓色彩绘制战阵旗帜，受封部将！',
    boss: { name: '美浓三人众 · 铁壁阵', icon: '🛡️', title: '稻叶山城守将', hp: 180 },
    words: [
      { en: 'color', cn: '颜色；给……着色', emoji: '🎨' },
      { en: 'around', cn: '围绕', emoji: '🔄' },
      { en: 'green', cn: '绿色；绿色的', emoji: '🟢' },
      { en: 'on', cn: '在……之上；在……时候', emoji: '🔛' },
      { en: 'way', cn: '路，道路；方式', emoji: '🛣️' },
      { en: 'stop', cn: '停止，停下；车站', emoji: '🛑' },
      { en: 'light', cn: '灯；光线；浅色的', emoji: '💡' },
      { en: 'red', cn: '红色；红色的', emoji: '🔴' },
      { en: 'now', cn: '现在', emoji: '⏰' },
      { en: 'question', cn: '问题', emoji: '❓' },
      { en: 'rabbit', cn: '兔子', emoji: '🐰' },
      { en: 'art', cn: '美术；艺术', emoji: '🖼️' },
      { en: 'class', cn: '课；班级', emoji: '🏫' },
      { en: 'game', cn: '游戏；比赛', emoji: '🎮' },
      { en: 'blue', cn: '蓝色；蓝色的', emoji: '🔵' },
      { en: 'yellow', cn: '黄色；黄色的', emoji: '🟡' },
      { en: 'wow', cn: '呀，哇', emoji: '🤩' },
      { en: 'white', cn: '白色；白色的', emoji: '⚪' },
      { en: 'pink', cn: '粉红色；粉红色的', emoji: '🌸' },
      { en: 'star', cn: '星星', emoji: '⭐' },
      { en: 'teacher', cn: '老师', emoji: '👩‍🏫' },
      { en: 'show', cn: '给……看；展示；展览（会）', emoji: '🎪' },
      { en: 'me', cn: '我（宾格）', emoji: '🙋' },
      { en: 'schoolbag', cn: '书包', emoji: '🎒' },
      { en: 'pencil box', cn: '笔盒', emoji: '✏️' },
      { en: 'black', cn: '黑色；黑色的', emoji: '⚫' },
      { en: 'pen', cn: '钢笔', emoji: '✒️' },
      { en: 'pencil', cn: '铅笔', emoji: '✏️' },
      { en: 'ruler', cn: '尺子', emoji: '📏' },
      { en: 'book', cn: '书', emoji: '📖' },
      { en: 'eraser', cn: '橡皮擦', emoji: '🧼' },
      { en: 'umbrella', cn: '雨伞', emoji: '☂️' },
      { en: 'violin', cn: '小提琴', emoji: '🎻' },
      { en: 'they', cn: '他们；她们；它们', emoji: '👥' },
      { en: 'colorful', cn: '多彩的', emoji: '🌈' },
      { en: 'flower', cn: '花', emoji: '🌺' },
      { en: 'after', cn: '在……之后', emoji: '⏳' },
      { en: 'step', cn: '步骤；脚步', emoji: '👣' },
      { en: 'draw', cn: '画画', emoji: '🎨' },
      { en: 'cut', cn: '剪；切', emoji: '✂️' },
      { en: 'make', cn: '制作；使变得', emoji: '🔨' },
      { en: 'window', cn: '窗户', emoji: '🪟' },
      { en: 'X-ray', cn: 'X光', emoji: '🩻' }
    ]
  },
  {
    id: 'pep2024-3a-u4',
    chapter: '第四章',
    name: 'Unit 4: 亲族生业',
    historicalBattle: '界港商船 · 南蛮秘卷与铁炮',
    historicalDesc: '信长支持南蛮商船停靠界港，主角随行出使，解密西洋医药、工匠技艺与先进大铳，晋封织田家家老！',
    boss: { name: '界港商魁 · 西洋炮舰', icon: '⛵', title: '南蛮船团首领', hp: 220 },
    words: [
      { en: 'love', cn: '爱；喜爱', emoji: '❤️' },
      { en: 'family', cn: '家庭', emoji: '👨‍👩‍👧‍👦' },
      { en: 'father', cn: '父亲；爸爸', emoji: '👨' },
      { en: 'brother', cn: '哥哥；弟弟', emoji: '👦' },
      { en: 'sister', cn: '姐姐；妹妹', emoji: '👧' },
      { en: 'welcome', cn: '欢迎', emoji: '🎉' },
      { en: 'mother', cn: '母亲；妈妈', emoji: '👩' },
      { en: 'here', cn: '这里', emoji: '📍' },
      { en: 'cake', cn: '蛋糕', emoji: '🎂' },
      { en: 'zoo', cn: '动物园', emoji: '🦁' },
      { en: 'who', cn: '谁', emoji: '❓' },
      { en: 'he', cn: '他', emoji: '👨' },
      { en: 'happy', cn: '开心的', emoji: '😄' },
      { en: 'birthday', cn: '生日', emoji: '🎂' },
      { en: 'we', cn: '我们', emoji: '👥' },
      { en: 'present', cn: '礼物', emoji: '🎁' },
      { en: 'for', cn: '（表示对象、用途等）给；因为……；对于……', emoji: '🎁' },
      { en: 'grandpa', cn: '爷爷；外公', emoji: '👴' },
      { en: 'she', cn: '她', emoji: '👩' },
      { en: 'grandma', cn: '奶奶；外婆', emoji: '👵' },
      { en: 'wish', cn: '愿望；希望', emoji: '🌠' },
      { en: 'blow out', cn: '吹灭', emoji: '💨' },
      { en: 'candle', cn: '蜡烛', emoji: '🕯️' },
      { en: 'photo', cn: '照片', emoji: '📷' },
      { en: 'so', cn: '如此，这么；所以', emoji: '✨' },
      { en: 'cute', cn: '可爱的', emoji: '🥺' },
      { en: 'doctor', cn: '医生', emoji: '🩺' },
      { en: 'English', cn: '英语；英语的；英国人的', emoji: '🇬🇧' },
      { en: 'farmer', cn: '农民', emoji: '🧑‍🌾' },
      { en: 'cook', cn: '厨师；煮', emoji: '👨‍🍳' },
      { en: 'uncle', cn: '叔；伯；姨夫', emoji: '👨' },
      { en: 'worker', cn: '工人', emoji: '👷' },
      { en: 'aunt', cn: '婶母；伯母；姨母', emoji: '👩' },
      { en: 'nurse', cn: '护士', emoji: '👩‍⚕️' },
      { en: 'big', cn: '大的', emoji: '🐘' }
    ]
  }
];

class WordManager {
  constructor() {
    this.storageKey = 'taikou_english_custom_units_v2';
    this.customUnits = this.loadCustomUnits();
  }

  loadCustomUnits() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomUnits() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customUnits));
    } catch (e) {
      console.error(e);
    }
  }

  getAllUnits() {
    return [...SENGOKU_UNITS, ...this.customUnits];
  }

  getUnitById(id) {
    return this.getAllUnits().find(u => u.id === id) || SENGOKU_UNITS[0];
  }

  /**
   * 获取全书所有平铺的单词列表（按课本出现顺序排成一条大线性轴）
   */
  getAllTextbookWordsFlat() {
    const list = [];
    SENGOKU_UNITS.forEach((u, uIdx) => {
      u.words.forEach((w, wIdx) => {
        list.push({
          ...w,
          unitId: u.id,
          unitName: u.name,
          unit: "Unit " + (uIdx + 1),
          unitIndex: uIdx + 1,
          chapter: u.chapter,
          globalIndex: list.length + 1
        });
      });
    });
    return list;
  }

  getAllWords() {
    return this.getAllTextbookWordsFlat();
  }

  parseBatchText(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/);
    const result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      line = line.replace(/^[\d]+[\.\、\)\s]+/, '').trim();
      line = line.replace(/\[.*?\]|\/.*?\/|（.*?）|\(.*?\)/g, ' ').trim();
      line = line.replace(/[\:\：\-\—\,\，\t]+/g, ' ');

      const match = line.match(/^([a-zA-Z\s\-\'\’]+?)\s+([\u4e00-\u9fa5\w\s、，。！？\(\)\uff08\uff09]+)$/);
      if (match) {
        const en = match[1].trim();
        const cn = match[2].trim();
        if (en && cn) {
          result.push({ en, cn, emoji: '📜' });
        }
      }
    }
    return result;
  }

  saveCustomUnit(unitName, rawText, chapterName = '外传篇章') {
    const words = this.parseBatchText(rawText);
    if (words.length === 0) throw new Error('未识别到有效单词（格式示例：apple 苹果）');

    const id = 'custom-' + Date.now();
    const newUnit = {
      id,
      chapter: chapterName,
      name: unitName.trim(),
      historicalBattle: '天下布武 · 外传演武',
      historicalDesc: "自定义外传课本，收录 " + words.length + " 词",
      isCustom: true,
      words,
      boss: { name: '战国猛将', icon: '👺', title: '阵前先锋', hp: 100 }
    };

    this.customUnits.unshift(newUnit);
    this.saveCustomUnits();
    return newUnit;
  }
}

window.wordManager = new WordManager();
window.wordsManager = window.wordManager;
