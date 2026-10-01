/**
 * 太阁英语立志传 · 信长智将主线危机小剧场 (Taikou Story Theater)
 * - 纯正自驱动力：英语不是考卷，而是藤吉郎在战国历史大事件中化解危机、崭露头角的“智谋破局”！
 * - 动态立绘、生动对话、纯正美音发音、零挫败鼓励式分支
 * - 战国大历史第一篇章：尾张微末篇 · 草鞋侍从的自驱萌芽（1554—1560，共6大回目）
 */

const TAIKOU_THEATER_CHAPTERS = [
  {
    id: 'ch1',
    title: '第一篇章 · 尾张微末篇',
    timeSpan: '1554 — 1560',
    subtitle: '草鞋侍从的自驱萌芽：以过人见识与机智，在尾张初露峥嵘',
    badge: '尾张风云 🌸'
  }
];

const TAIKOU_THEATER_STORIES = [
  // =========================================================================
  // 第一回：怀揣一文闯天下
  // =========================================================================
  {
    id: 'story-ch1-one-coin',
    chapterId: 'ch1',
    episodeNum: 1,
    title: '第一回 · 怀揣一文闯天下',
    subtitle: '流浪少年初至清洲城下町，辨识南蛮货摊标牌与算账，赚取落脚第一步！',
    bannerIcon: '🪙🧭',
    rewardMerit: 100,
    rewardGold: 80,
    rewardTitle: '精明行商 · 破局初阵',
    coreWords: ['one', 'coin', 'needle', 'market'],
    steps: [
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '流浪少年',
        text: '“怀中只有离家时母亲给的一枚铜钱，清洲城下町真是热闹非凡！南蛮商人的货摊前聚满了人，若能看懂这洋文标牌，便能买到做行商的缝衣针和干粮！”',
        action: 'continue'
      },
      {
        speaker: '葡萄牙洋商达席尔瓦',
        portrait: 'assets/portraits/sokyu.jpg',
        role: '界港南蛮客商',
        text: '“OlÃ¡! 远东的小朋友，我这里有从海外运来的上等铜钱与西洋钢针，你手里的铜板能买哪一件？”',
        action: 'continue'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '流浪少年',
        text: '“我虽然只有一文钱，但我认得西洋数字与货币！让我瞧瞧标牌！”',
        action: 'quiz',
        prompt: '藤吉郎手心里仅有的唯一一枚铜板，西洋数字读作：',
        targetWord: 'one',
        wordObj: { en: 'one', cn: '一 / 唯一的', phonetic: '/wʌn/', emoji: '1️⃣' },
        options: [
          { en: 'one', cn: '一个 / 一枚', emoji: '1️⃣', correct: true },
          { en: 'ten', cn: '十个 / 很多', emoji: '🔟', correct: false },
          { en: 'six', cn: '六个', emoji: '6️⃣', correct: false }
        ],
        successVoice: 'one',
        successText: '藤吉郎亮出掌心：“我这里正好有【one】枚铜板！”洋商点头称赞：“Very good!”'
      },
      {
        speaker: '葡萄牙洋商达席尔瓦',
        portrait: 'assets/portraits/sokyu.jpg',
        role: '界港南蛮客商',
        text: '“不错！在西洋跨海商贸中，泛指所有金属钱币的词汇，你可认得？”',
        action: 'quiz',
        prompt: '找出代表【硬币 / 铜钱】的商贸词：',
        targetWord: 'coin',
        wordObj: { en: 'coin', cn: '硬币 / 铜钱', phonetic: '/kɔɪn/', emoji: '🪙' },
        options: [
          { en: 'coin', cn: '硬币 / 铜钱', emoji: '🪙', correct: true },
          { en: 'book', cn: '书籍 / 书卷', emoji: '📖', correct: false },
          { en: 'tree', cn: '树木 / 森林', emoji: '🌲', correct: false }
        ],
        successVoice: 'coin',
        successText: '藤吉郎笑道：“这便是流通的【coin】！”洋商赞许：“小兄弟眼力真准！”'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '流浪少年',
        text: '“我这一枚钱，换一盒能卖给城下织布绣女的精钢小工具，最是实惠！”',
        action: 'quiz',
        prompt: '找出代表【缝衣针 / 顶针】的小商品词：',
        targetWord: 'needle',
        wordObj: { en: 'needle', cn: '缝衣针 / 绣花针', phonetic: '/ˈniː.dəl/', emoji: '🪡' },
        options: [
          { en: 'needle', cn: '缝衣针 / 绣针', emoji: '🪡', correct: true },
          { en: 'apple', cn: '红苹果', emoji: '🍎', correct: false },
          { en: 'chair', cn: '木椅子', emoji: '🪑', correct: false }
        ],
        successVoice: 'needle',
        successText: '藤吉郎选了一盒精细的西洋缝衣针【needle】，转手就能在集市换得三餐饭食！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '流浪少年',
        text: '“走！趁着日头正好，快去那人声鼎沸、四方交易的繁华大集市！”',
        action: 'quiz',
        prompt: '找出代表【集市 / 市场】的商业场所词：',
        targetWord: 'market',
        wordObj: { en: 'market', cn: '集市 / 市场', phonetic: '/ˈmɑːr.kɪt/', emoji: '🛍️' },
        options: [
          { en: 'market', cn: '集市 / 市场', emoji: '🛍️', correct: true },
          { en: 'sleep', cn: '睡眠 / 歇息', emoji: '💤', correct: false },
          { en: 'water', cn: '溪流 / 清水', emoji: '💧', correct: false }
        ],
        successVoice: 'market',
        successText: '藤吉郎快步跑向热闹的【market】，靠勤快的小本买卖在清洲城下稳稳立下了脚跟！'
      },
      {
        speaker: '织田家招募使',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张武官',
        text: '“城头告示：织田主公广开言路，招募机灵勤恳之殿前侍从！小兄弟，你算账精明、见识不凡，正是主公要找的人才！”',
        action: 'finish'
      }
    ]
  },

  // =========================================================================
  // 第二回：雪中怀暖草鞋志
  // =========================================================================
  {
    id: 'story-ch1-warm-sandals',
    chapterId: 'ch1',
    episodeNum: 2,
    title: '第二回 · 雪中怀暖草鞋志',
    subtitle: '清洲天守朔风飞雪，侍从草履温润如春，以真诚热忱打动织田信长！',
    bannerIcon: '❄️👞',
    rewardMerit: 120,
    rewardGold: 100,
    rewardTitle: '至诚侍从 · 暖履智士',
    coreWords: ['cold', 'shoes', 'warm', 'heart'],
    steps: [
      {
        speaker: '前田利家',
        portrait: 'assets/portraits/toshiie.jpg',
        role: '赤母衣众随侍',
        text: '“好大的暴风雪！主公清晨便要登殿议事，廊下滴水成冰。不知是哪个新来的草鞋侍从在殿外候着，怕不是要冻成冰雕了！”',
        action: 'continue'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“取我的草履来！哼，今日天寒地冻，不知能否顺遂……咦？！这草履怎会如此温热舒适？！”',
        action: 'quiz',
        prompt: '信长形容殿外大雪纷飞、冰冷刺骨的天气词是：',
        targetWord: 'cold',
        wordObj: { en: 'cold', cn: '寒冷的 / 冰凉', phonetic: '/koʊld/', emoji: '❄️' },
        options: [
          { en: 'cold', cn: '寒冷的 / 严寒', emoji: '❄️', correct: true },
          { en: 'hot', cn: '炎热的', emoji: '🔥', correct: false },
          { en: 'green', cn: '青绿的', emoji: '🍃', correct: false }
        ],
        successVoice: 'cold',
        successText: '信长大声道：“天虽【cold】，鞋底却暖如火炉，难道你方才把它当坐垫坐过了？！”'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '草鞋侍从',
        text: '“主公明鉴！小人双手恭托的正是主公随身出巡之履，万万不敢有丝毫怠慢不敬！”',
        action: 'quiz',
        prompt: '找出代表【鞋子 / 草鞋】的衣物词：',
        targetWord: 'shoes',
        wordObj: { en: 'shoes', cn: '鞋子 / 鞋履', phonetic: '/ʃuːz/', emoji: '👞' },
        options: [
          { en: 'shoes', cn: '鞋子 / 鞋履', emoji: '👞', correct: true },
          { en: 'hats', cn: '斗笠 / 帽子', emoji: '👒', correct: false },
          { en: 'cups', cn: '茶杯 / 茶盏', emoji: '🍵', correct: false }
        ],
        successVoice: 'shoes',
        successText: '藤吉郎伏地道：“小人深知主公每日都要穿这双【shoes】巡城，断不敢有半分亵渎！”'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“那你且说来，漫天风雪之中，这草履何以温润如春？”',
        action: 'quiz',
        prompt: '找出代表【温暖的 / 暖和】的词汇：',
        targetWord: 'warm',
        wordObj: { en: 'warm', cn: '温暖的 / 暖和', phonetic: '/wɔːrm/', emoji: '☀️' },
        options: [
          { en: 'warm', cn: '温暖的 / 暖和', emoji: '☀️', correct: true },
          { en: 'dark', cn: '黑暗的', emoji: '🌑', correct: false },
          { en: 'slow', cn: '迟缓的', emoji: '🐢', correct: false }
        ],
        successVoice: 'warm',
        successText: '藤吉郎道：“小人一直将草履紧贴怀中，以体温捂得【warm】，只为主公登殿不觉冻足！”'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“常人侍奉只用双手，而你却用一片至诚之心！这份真心，胜过千言万语！”',
        action: 'quiz',
        prompt: '找出代表【心灵 / 真心】的核心词：',
        targetWord: 'heart',
        wordObj: { en: 'heart', cn: '心灵 / 真心', phonetic: '/hɑːrt/', emoji: '💖' },
        options: [
          { en: 'heart', cn: '心灵 / 真心', emoji: '💖', correct: true },
          { en: 'stone', cn: '岩石 / 石头', emoji: '🪨', correct: false },
          { en: 'wall', cn: '城墙 / 砖墙', emoji: '🧱', correct: false }
        ],
        successVoice: 'heart',
        successText: '信长大笑：“以赤子之【heart】侍奉，真乃忠笃奇才！传我御令：升任藤吉郎为殿前足轻组头！”'
      },
      {
        speaker: '前田利家',
        portrait: 'assets/portraits/toshiie.jpg',
        role: '赤母衣众侍大将',
        text: '“恭喜藤吉郎！能得信长公这般赞誉的侍从，满尾张唯你一人！快换上新武服吧！”',
        action: 'finish'
      }
    ]
  },

  // =========================================================================
  // 第三回：巧策三日补城垣
  // =========================================================================
  {
    id: 'story-ch1-repair-wall',
    chapterId: 'ch1',
    episodeNum: 3,
    title: '第三回 · 巧策三日补城垣',
    subtitle: '清洲外城暴风雨塌陷二十丈，老臣拖延数月，藤吉郎立下三日完工军令状！',
    bannerIcon: '🧱🪵',
    rewardMerit: 140,
    rewardGold: 110,
    rewardTitle: '筑垣神策 · 经世之才',
    coreWords: ['wall', 'stone', 'wood', 'fast', 'work'],
    steps: [
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“清洲城西面大墙被连日暴雨冲垮二十丈，家老督造数月互相推诿、拖延至今！敌军若趁虚而入，全城皆危！满堂武将，可有人敢三日修峻？！”',
        action: 'continue'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '足轻组头',
        text: '“主公！小人愿立三日军令状！只要将全城工匠交由小人统一调度，三日之内若修不好，甘当重罚！”',
        action: 'quiz',
        prompt: '清洲城外守护大名本营的宏伟城垣，英文词是：',
        targetWord: 'wall',
        wordObj: { en: 'wall', cn: '城墙 / 墙壁', phonetic: '/wɔːl/', emoji: '🧱' },
        options: [
          { en: 'wall', cn: '城墙 / 围墙', emoji: '🧱', correct: true },
          { en: 'bed', cn: '软榻 / 床铺', emoji: '🛏️', correct: false },
          { en: 'pen', cn: '钢笔 / 毛笔', emoji: '🖊️', correct: false }
        ],
        successVoice: 'wall',
        successText: '藤吉郎胸有成竹：“修复这段【wall】，不在蛮力堆人，而在工序科学分段！”'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '足轻组头',
        text: '“工匠们！底层基座必须牢不可破，先铺设从近江采买的坚硬条石！”',
        action: 'quiz',
        prompt: '夯实地基、垒砌护坡必须用到的坚硬建筑材料是：',
        targetWord: 'stone',
        wordObj: { en: 'stone', cn: '石头 / 块石', phonetic: '/stoʊn/', emoji: '🪨' },
        options: [
          { en: 'stone', cn: '石头 / 块石', emoji: '🪨', correct: true },
          { en: 'paper', cn: '纸张', emoji: '📄', correct: false },
          { en: 'water', cn: '清水', emoji: '💧', correct: false }
        ],
        successVoice: 'stone',
        successText: '大块巨型基石【stone】咬合紧密，护坡稳如泰山！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '足轻组头',
        text: '“上层堞楼与遮雨挑檐，需用轻便结实的干燥木料！”',
        action: 'quiz',
        prompt: '搭建棚架、横梁不可或缺的木料材料词是：',
        targetWord: 'wood',
        wordObj: { en: 'wood', cn: '木材 / 木料', phonetic: '/wʊd/', emoji: '🪵' },
        options: [
          { en: 'wood', cn: '木材 / 木料', emoji: '🪵', correct: true },
          { en: 'milk', cn: '牛奶', emoji: '🥛', correct: false },
          { en: 'cloth', cn: '布匹', emoji: '🧣', correct: false }
        ],
        successVoice: 'wood',
        successText: '优质杉木【wood】打入排桩，构架整齐划一！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '足轻组头',
        text: '“我将城垣分为十段，设十支工匠小队分组竞赛！前三名竣工者，每人赏酒两坛、白米一斗！”',
        action: 'quiz',
        prompt: '工匠们热情高涨、争先恐后干得飞快的形容词是：',
        targetWord: 'fast',
        wordObj: { en: 'fast', cn: '飞快 / 迅速', phonetic: '/fæst/', emoji: '⚡' },
        options: [
          { en: 'fast', cn: '飞快 / 迅速', emoji: '⚡', correct: true },
          { en: 'slow', cn: '迟缓的', emoji: '🐢', correct: false },
          { en: 'sleepy', cn: '困倦的', emoji: '🥱', correct: false }
        ],
        successVoice: 'fast',
        successText: '人人争先，进度飞速【fast】，竟比预定时间提前了整整半日！'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“登城一望，二十丈新垣巍然挺立，固若金汤！赏罚分明、巧用众力，藤吉郎真乃经世奇才！重重有赏！”',
        action: 'finish'
      }
    ]
  },

  // =========================================================================
  // 第四回：粮仓明断杜蠹虫
  // =========================================================================
  {
    id: 'story-ch1-granary-count',
    chapterId: 'ch1',
    episodeNum: 4,
    title: '第四回 · 粮仓明断杜蠹虫',
    subtitle: '兵粮库账目亏空烂账如麻，藤吉郎携胞弟小一郎盘点四海给养，粮草充盈！',
    bannerIcon: '🌾🍙',
    rewardMerit: 150,
    rewardGold: 120,
    rewardTitle: '理财名手 · 天下仓官',
    coreWords: ['rice', 'salt', 'food', 'clean', 'count'],
    steps: [
      {
        speaker: '木下小一郎（秀长）',
        portrait: 'assets/portraits/hidenaga.jpg',
        role: '胞弟兼管家',
        text: '“兄长！主公命你兼管清洲大粮库，但前任仓吏留下的账簿全是糊涂账，米袋里掺粗糠沙子，亏空惊人，这分明是个火坑陷阱！”',
        action: 'continue'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '清洲粮仓奉行',
        text: '“小一郎莫忧！算账正是为兄的拿手好戏。咱们用南蛮分类盘库法，一包包称重定标，让假账蠹虫无所遁形！”',
        action: 'quiz',
        prompt: '战国大军最重要的主食与俸禄计量的稻米词是：',
        targetWord: 'rice',
        wordObj: { en: 'rice', cn: '大米 / 稻谷', phonetic: '/raɪs/', emoji: '🍚' },
        options: [
          { en: 'rice', cn: '大米 / 稻米', emoji: '🍚', correct: true },
          { en: 'iron', cn: '铁器 / 铁块', emoji: '⚙️', correct: false },
          { en: 'bell', cn: '铜铃', emoji: '🔔', correct: false }
        ],
        successVoice: 'rice',
        successText: '藤吉郎领人将每袋金黄白米【rice】逐一抽检去沙，称重归仓！'
      },
      {
        speaker: '木下小一郎（秀长）',
        portrait: 'assets/portraits/hidenaga.jpg',
        role: '胞弟兼管家',
        text: '“兄长，那库房深处堆积的沿海运来的白色矿盐呢？受潮受损严重！”',
        action: 'quiz',
        prompt: '行军打仗补充将士气力、腌渍保存干粮的食用盐词是：',
        targetWord: 'salt',
        wordObj: { en: 'salt', cn: '食用盐 / 盐巴', phonetic: '/sɑːlt/', emoji: '🧂' },
        options: [
          { en: 'salt', cn: '食用盐 / 盐巴', emoji: '🧂', correct: true },
          { en: 'sugar', cn: '白糖', emoji: '🍬', correct: false },
          { en: 'sand', cn: '沙子', emoji: '🏖️', correct: false }
        ],
        successVoice: 'salt',
        successText: '藤吉郎吩咐将海盐【salt】垫高防潮、木桶密封，颗颗纯白如霜！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '清洲粮仓奉行',
        text: '“全军将士维系生命的万千给养，不可有毫厘疏漏！”',
        action: 'quiz',
        prompt: '统称全军维系体能与士气的一切粮食食物词是：',
        targetWord: 'food',
        wordObj: { en: 'food', cn: '食物 / 粮食', phonetic: '/fuːd/', emoji: '🍙' },
        options: [
          { en: 'food', cn: '食物 / 粮食', emoji: '🍙', correct: true },
          { en: 'game', cn: '游戏', emoji: '🎮', correct: false },
          { en: 'boat', cn: '小舟', emoji: '🛶', correct: false }
        ],
        successVoice: 'food',
        successText: '全库各色粮食【food】分门别类，码放得整齐如兵阵！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '清洲粮仓奉行',
        text: '“旧吏贪污被革职拿办，新账册明明白白，一尘不染！”',
        action: 'quiz',
        prompt: '形容账目清爽分明、库房整洁清白的词是：',
        targetWord: 'clean',
        wordObj: { en: 'clean', cn: '整洁 / 清白干练', phonetic: '/kliːn/', emoji: '✨' },
        options: [
          { en: 'clean', cn: '整洁 / 清白干练', emoji: '✨', correct: true },
          { en: 'dirty', cn: '肮脏污秽', emoji: '💩', correct: false },
          { en: 'noisy', cn: '喧闹嘈杂', emoji: '📢', correct: false }
        ],
        successVoice: 'clean',
        successText: '账目彻底核算得清白明澈【clean】，粮仓反而盈余上百石！'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“哈哈哈哈！粮秣充裕，账目明断！藤吉郎此举不仅除尽蛀虫，更为全军备足了东征之粮！善！大善！”',
        action: 'finish'
      }
    ]
  },

  // =========================================================================
  // 第五回：桶狭间前夜探风云
  // =========================================================================
  {
    id: 'story-ch1-okehazama-spy',
    chapterId: 'ch1',
    episodeNum: 5,
    title: '第五回 · 桶狭间前夜探风云',
    subtitle: '今川义元四万大军压境，藤吉郎潜入鸣海前线，借西洋气压计预知雷暴天象！',
    bannerIcon: '⛈️🧭',
    rewardMerit: 180,
    rewardGold: 150,
    rewardTitle: '神机密探 · 听风智将',
    coreWords: ['weather', 'cloud', 'wind', 'rain', 'storm'],
    steps: [
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“今川义元领四万精锐浩荡压境，鸣海、大高前锋受挫，重臣皆劝我降伏或笼城等死！藤吉郎，前方斥候探得虚实如何？！”',
        action: 'continue'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '斥候密探',
        text: '“主公！小人刚自桶狭间田乐洼探查归来！今川军虽众，但在狭长山隘拉成十里长蛇！更惊人的是，南蛮水银气压管急跌，天象即将大变！”',
        action: 'quiz',
        prompt: '刺探山川风云、掌握大军行止的天气气候词是：',
        targetWord: 'weather',
        wordObj: { en: 'weather', cn: '天气 / 气象', phonetic: '/ˈweð.ɚ/', emoji: '⛅' },
        options: [
          { en: 'weather', cn: '天气 / 气象', emoji: '⛅', correct: true },
          { en: 'silver', cn: '白银', emoji: '🪙', correct: false },
          { en: 'flower', cn: '花朵', emoji: '🌸', correct: false }
        ],
        successVoice: 'weather',
        successText: '藤吉郎道：“明辨【weather】之变，方能握天时而胜强敌！”'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '斥候密探',
        text: '“主公请看东南天际！黑云翻墨，雷声已在地平线隐隐轰鸣！”',
        action: 'quiz',
        prompt: '遮天蔽日、层层汇聚的浓重乌云词是：',
        targetWord: 'cloud',
        wordObj: { en: 'cloud', cn: '乌云 / 云层', phonetic: '/klaʊd/', emoji: '☁️' },
        options: [
          { en: 'cloud', cn: '乌云 / 云层', emoji: '☁️', correct: true },
          { en: 'grass', cn: '青草', emoji: '🌱', correct: false },
          { en: 'star', cn: '繁星', emoji: '⭐', correct: false }
        ],
        successVoice: 'cloud',
        successText: '厚重的墨黑【cloud】席卷苍穹，山雨欲来！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '斥候密探',
        text: '“狂风骤起，顺风直扑今川军大营，敌军必定难以睁眼！”',
        action: 'quiz',
        prompt: '山林呼啸、刮落草木枝叶的大风狂风词是：',
        targetWord: 'wind',
        wordObj: { en: 'wind', cn: '狂风 / 烈风', phonetic: '/wɪnd/', emoji: '🍃' },
        options: [
          { en: 'wind', cn: '狂风 / 烈风', emoji: '🍃', correct: true },
          { en: 'fire', cn: '火焰', emoji: '🔥', correct: false },
          { en: 'stone', cn: '石头', emoji: '🪨', correct: false }
        ],
        successVoice: 'wind',
        successText: '东南大风【wind】怒号，今川战旗被吹得东倒西歪！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '斥候密探',
        text: '“大雨倾盆，今川军自持胜券在握，必在洼地卸甲避雨，火绳枪尽皆受潮失灵！”',
        action: 'quiz',
        prompt: '即将倾泻而下、能掩盖马蹄声响的倾盆大雨词是：',
        targetWord: 'rain',
        wordObj: { en: 'rain', cn: '雨水 / 暴雨', phonetic: '/reɪn/', emoji: '🌧️' },
        options: [
          { en: 'rain', cn: '雨水 / 暴雨', emoji: '🌧️', correct: true },
          { en: 'sun', cn: '烈日', emoji: '☀️', correct: false },
          { en: 'snow', cn: '雪花', emoji: '❄️', correct: false }
        ],
        successVoice: 'rain',
        successText: '瓢泼大雨【rain】如瀑布倒灌，天地混沌难辨！'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“哈哈哈哈！好一场天地雷暴【storm】！上天助我织田家！全军冒雨秘密出阵，目标——今川义元本阵田乐洼！”',
        action: 'finish'
      }
    ]
  },

  // =========================================================================
  // 第六回：骤雨雷霆斩敌酋
  // =========================================================================
  {
    id: 'story-ch1-okehazama-battle',
    chapterId: 'ch1',
    episodeNum: 6,
    title: '第六回 · 骤雨雷霆斩敌酋',
    subtitle: '倾盆雷雨中如狂飙突进，藤吉郎前锋传令，信长一举斩杀义元定乾坤！',
    bannerIcon: '⚡🎌',
    rewardMerit: 220,
    rewardGold: 200,
    rewardTitle: '破阵奇才 · 天下布武基石',
    coreWords: ['silent', 'listen', 'run', 'win'],
    steps: [
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“暴雨如注，敌军毫无防备！藤吉郎，命你为全军先锋传令官，各队马蹄裹厚布、军士衔枚，悄然包围田乐洼！”',
        action: 'continue'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '先锋传令官',
        text: '“全军屏息敛声，严禁喧哗，借雨声雷声掩护逼近敌阵！”',
        action: 'quiz',
        prompt: '向各队下达绝对安静、不可发出声响的军令词是：',
        targetWord: 'silent',
        wordObj: { en: 'silent', cn: '寂静的 / 沉默肃穆', phonetic: '/ˈsaɪ.lənt/', emoji: '🤫' },
        options: [
          { en: 'silent', cn: '寂静沉默 / 肃穆', emoji: '🤫', correct: true },
          { en: 'loud', cn: '大声喧哗', emoji: '📢', correct: false },
          { en: 'sing', cn: '唱歌高呼', emoji: '🎤', correct: false }
        ],
        successVoice: 'silent',
        successText: '全军如夜行猎豹般肃穆【silent】，神不知鬼不觉压至田乐洼山口！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '先锋传令官',
        text: '“各队长官注意！仔细分辨前方帐幔中传来的动静！”',
        action: 'quiz',
        prompt: '在雨幕中全神贯注倾听敌营动向的词是：',
        targetWord: 'listen',
        wordObj: { en: 'listen', cn: '倾听 / 侧耳听', phonetic: '/ˈlɪs.ən/', emoji: '👂' },
        options: [
          { en: 'listen', cn: '倾听 / 侧耳听', emoji: '👂', correct: true },
          { en: 'speak', cn: '大声讲话', emoji: '🗣️', correct: false },
          { en: 'jump', cn: '跳跃奔腾', emoji: '🦘', correct: false }
        ],
        successVoice: 'listen',
        successText: '侧耳倾听【listen】，敌军大帐果然在奏乐饮酒避雨，毫无戒备！'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“暴雨暂歇，乌云裂开金光！全军出击！直取今川义元首级！”',
        action: 'quiz',
        prompt: '信长大喝冲锋，全军如猛虎下山疾速奔袭的词是：',
        targetWord: 'run',
        wordObj: { en: 'run', cn: '奔跑 / 猛冲', phonetic: '/rʌn/', emoji: '🏃' },
        options: [
          { en: 'run', cn: '奔跑 / 冲锋', emoji: '🏃', correct: true },
          { en: 'sleep', cn: '休息睡觉', emoji: '🛌', correct: false },
          { en: 'sit', cn: '端坐静止', emoji: '🧘', correct: false }
        ],
        successVoice: 'run',
        successText: '两千织田精锐顺着山坡雷霆冲锋【run】，如泰山压顶般砸向敌营！'
      },
      {
        speaker: '木下藤吉郎',
        portrait: 'assets/portraits/tokichiro.jpg',
        role: '先锋传令官',
        text: '“服部小平太与毛利新介斩下今川义元首级！敌阵全线溃退！”',
        action: 'quiz',
        prompt: '全军将士热泪盈眶、欢呼夺得终极胜利的词是：',
        targetWord: 'win',
        wordObj: { en: 'win', cn: '获胜 / 赢得大捷', phonetic: '/wɪn/', emoji: '🏆' },
        options: [
          { en: 'win', cn: '获胜 / 赢得大捷', emoji: '🏆', correct: true },
          { en: 'lose', cn: '惨败', emoji: '🥀', correct: false },
          { en: 'wait', cn: '等待', emoji: '⏳', correct: false }
        ],
        successVoice: 'win',
        successText: '震天动地的欢呼响彻桶狭间：“我们赢了！【We win！】”'
      },
      {
        speaker: '织田信长',
        portrait: 'assets/portraits/nobunaga.jpg',
        role: '尾张大名',
        text: '“哈哈哈哈！桶狭间一战定天下！木下藤吉郎，探天象、传号令，屡立不世奇功！我亲赐你正式官位【足轻头】！尾张微末篇圆满大成，随我继续开拓天下布武大业！”',
        action: 'finish'
      }
    ]
  }
];

class TaikouTheaterSystem {
  constructor() {
    this.storageKey = 'taikou_theater_v2';
    this.chapters = TAIKOU_THEATER_CHAPTERS;
    this.stories = TAIKOU_THEATER_STORIES;
    this.state = this.loadState();
    this.currentStory = null;
    this.currentStepIdx = 0;
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Theater state load error:', e);
    }
    return {
      completedStoryIds: []
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Theater state save error:', e);
    }
  }

  isCompleted(storyId) {
    return this.state.completedStoryIds.includes(storyId);
  }

  getChapterStories(chapterId = 'ch1') {
    return this.stories.filter(s => s.chapterId === chapterId);
  }

  getStoryById(storyId) {
    return this.stories.find(s => s.id === storyId);
  }

  getNextStoryId(currentStoryId) {
    const idx = this.stories.findIndex(s => s.id === currentStoryId);
    if (idx >= 0 && idx < this.stories.length - 1) {
      return this.stories[idx + 1].id;
    }
    return null;
  }

  startStory(storyId) {
    const story = this.stories.find(s => s.id === storyId) || this.stories[0];
    if (!story) return null;
    this.currentStory = story;
    this.currentStepIdx = 0;
    return { story, step: story.steps[0] };
  }

  getCurrentStep() {
    if (!this.currentStory) return null;
    return this.currentStory.steps[this.currentStepIdx];
  }

  nextStep() {
    if (!this.currentStory) return null;
    this.currentStepIdx++;
    if (this.currentStepIdx >= this.currentStory.steps.length) {
      this.finishCurrentStory();
      return { isFinished: true, story: this.currentStory };
    }
    return { isFinished: false, step: this.currentStory.steps[this.currentStepIdx] };
  }

  finishCurrentStory() {
    if (!this.currentStory) return;
    const storyId = this.currentStory.id;
    const isFirstTime = !this.state.completedStoryIds.includes(storyId);
    if (isFirstTime) {
      this.state.completedStoryIds.push(storyId);
      this.saveState();
      if (window.heroManager) {
        window.heroManager.addMerit(this.currentStory.rewardMerit || 100);
        window.heroManager.addGold(this.currentStory.rewardGold || 80);
      }
    }

    if (window.audioEngine) {
      window.audioEngine.playVictoryFanfare();
    }

    if (window.gameEngine) {
      window.gameEngine.updateHUDStats();
    }
  }
}

window.theaterSystem = new TaikouTheaterSystem();
