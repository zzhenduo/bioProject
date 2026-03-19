const db = require('../db/init');

console.log('开始添加更多题目到题库...');

// 添加更多填空题
const fillQuestions = [
  {
    title: '细胞膜的结构',
    type: '填空题',
    content: '细胞膜的基本支架是____，它由两层____分子构成。',
    answer: '磷脂双分子层；磷脂',
    analysis: '细胞膜的基本结构是磷脂双分子层，磷脂分子具有亲水的头部和疏水的尾部。',
    knowledge_point_id: 1,
    difficulty_level: 2
  },
  {
    title: '光合作用的场所',
    type: '填空题',
    content: '绿色植物进行光合作用的场所是____，光反应阶段在____上进行，暗反应阶段在____中进行。',
    answer: '叶绿体；类囊体薄膜；叶绿体基质',
    analysis: '光合作用分为光反应和暗反应两个阶段，光反应在类囊体薄膜上进行，暗反应在叶绿体基质中进行。',
    knowledge_point_id: 3,
    difficulty_level: 2
  },
  {
    title: '细胞呼吸的类型',
    type: '填空题',
    content: '细胞呼吸分为____和____两种类型。人体细胞在缺氧条件下可以进行____呼吸，产生____。',
    answer: '有氧呼吸；无氧呼吸；无氧；乳酸',
    analysis: '细胞呼吸包括有氧呼吸和无氧呼吸。人体细胞在缺氧时进行无氧呼吸产生乳酸。',
    knowledge_point_id: 4,
    difficulty_level: 2
  },
  {
    title: '有丝分裂的过程',
    type: '填空题',
    content: '有丝分裂中期，染色体的____排列在细胞中央的____上，此时染色体形态____，数目____。',
    answer: '着丝点；赤道板；最稳定；最清晰',
    analysis: '有丝分裂中期是观察染色体的最佳时期，此时染色体形态最稳定，数目最清晰。',
    knowledge_point_id: 5,
    difficulty_level: 3
  },
  {
    title: 'DNA 的结构',
    type: '填空题',
    content: 'DNA 分子是由两条____的脱氧核苷酸长链盘旋而成的____结构。',
    answer: '反向平行；双螺旋',
    analysis: 'DNA 分子的双螺旋结构是由沃森和克里克提出的，两条链反向平行盘旋。',
    knowledge_point_id: 2,
    difficulty_level: 2
  }
];

// 添加更多简答题
const shortAnswerQuestions = [
  {
    title: '细胞膜的功能',
    type: '简答题',
    content: '简述细胞膜的主要功能有哪些？',
    answer: '①将细胞与外界环境分隔开；②控制物质进出细胞；③进行细胞间的信息交流。',
    analysis: '细胞膜的三大功能体现了它作为系统边界的重要作用。',
    knowledge_point_id: 1,
    difficulty_level: 2
  },
  {
    title: '光合作用的意义',
    type: '简答题',
    content: '简述光合作用对生物圈的重要意义。',
    answer: '①制造有机物，为生物提供食物来源；②转化并储存太阳能；③维持大气中 O₂和 CO₂含量的相对稳定；④对生物的进化具有重要意义。',
    analysis: '光合作用是生物圈中物质和能量流动的基础。',
    knowledge_point_id: 3,
    difficulty_level: 2
  },
  {
    title: '酶的特性',
    type: '简答题',
    content: '酶具有哪些特性？请简要说明。',
    answer: '①高效性：催化效率比无机催化剂高得多；②专一性：一种酶只能催化一种或一类化学反应；③作用条件温和：需要适宜的温度和 pH。',
    analysis: '酶的特性是由其蛋白质结构决定的。',
    knowledge_point_id: 6,
    difficulty_level: 2
  },
  {
    title: '细胞分化的特点',
    type: '简答题',
    content: '细胞分化具有哪些特点？',
    answer: '①持久性：贯穿于生物体整个生命进程；②稳定性：分化后的细胞将保持分化后的状态；③不可逆性：一般情况下，分化了的细胞不能再恢复到未分化状态；④普遍性：多细胞生物普遍具有。',
    analysis: '细胞分化是基因选择性表达的结果。',
    knowledge_point_id: 5,
    difficulty_level: 2
  },
  {
    title: '癌细胞的主要特征',
    type: '简答题',
    content: '癌细胞有哪些主要特征？',
    answer: '①在适宜条件下，癌细胞能够无限增殖；②癌细胞的形态结构发生显著变化；③癌细胞的表面发生了变化，糖蛋白等物质减少，细胞之间的黏着性显著降低，容易在体内分散和转移。',
    analysis: '癌细胞的特征是由其遗传物质改变导致的。',
    knowledge_point_id: 5,
    difficulty_level: 2
  }
];

// 添加实验题
const experimentQuestions = [
  {
    title: '观察植物细胞的质壁分离和复原',
    type: '实验题',
    content: '某同学进行了"观察植物细胞的质壁分离和复原"实验。请回答下列问题：\n（1）该实验应该选择什么材料？为什么？\n（2）实验中使用 0.3g/mL 蔗糖溶液的目的是什么？\n（3）如果将蔗糖溶液换成适宜浓度的 KNO₃溶液，会出现什么现象？',
    answer: '（1）应该选择紫色洋葱鳞片叶外表皮细胞。因为该细胞具有紫色大液泡，便于观察。\n（2）使用 0.3g/mL 蔗糖溶液的目的是使细胞失水，发生质壁分离。\n（3）如果换成适宜浓度的 KNO₃溶液，细胞先发生质壁分离，然后自动复原。因为 K⁺和 NO₃⁻可以进入细胞，使细胞液浓度升高，细胞吸水复原。',
    analysis: '该实验考查植物细胞的渗透作用和质壁分离现象。',
    knowledge_point_id: 4,
    difficulty_level: 3
  },
  {
    title: '探究酶的高效性',
    type: '实验题',
    content: '为探究酶的高效性，某同学设计了如下实验：\n试管 1:2mL H₂O₂溶液 + 2 滴蒸馏水\n试管 2:2mL H₂O₂溶液 + 2 滴 FeCl₃溶液\n试管 3:2mL H₂O₂溶液 + 2 滴肝脏研磨液\n请回答：\n（1）该实验的自变量是什么？\n（2）预期实验结果是什么？\n（3）该实验可以得出什么结论？',
    answer: '（1）自变量是催化剂的种类（无机催化剂和酶）。\n（2）预期结果：试管 3 产生的气泡最多，试管 2 次之，试管 1 最少。\n（3）结论：酶具有高效性，催化效率远高于无机催化剂。',
    analysis: '通过对比无机催化剂和酶的催化效率，证明酶的高效性。',
    knowledge_point_id: 6,
    difficulty_level: 3
  },
  {
    title: '观察根尖分生组织细胞的有丝分裂',
    type: '实验题',
    content: '在"观察根尖分生组织细胞的有丝分裂"实验中：\n（1）制作装片的流程是什么？\n（2）为什么要漂洗？\n（3）在显微镜下观察时，视野中处于哪个时期的细胞最多？为什么？',
    answer: '（1）制作流程：解离→漂洗→染色→制片。\n（2）漂洗的目的是洗去药液，防止解离过度，便于染色。\n（3）视野中处于分裂间期的细胞最多。因为细胞周期中间期所占时间最长（约占 90%-95%）。',
    analysis: '该实验考查有丝分裂观察实验的操作步骤和原理。',
    knowledge_point_id: 5,
    difficulty_level: 3
  }
];

// 批量插入题目
const stmt = db.prepare(`
  INSERT INTO questions (title, type, content, options, answer, analysis, knowledge_point_id, difficulty_level)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((questions) => {
  for (const q of questions) {
    stmt.run(
      q.title,
      q.type,
      q.content,
      q.options || null,
      q.answer,
      q.analysis,
      q.knowledge_point_id,
      q.difficulty_level
    );
  }
});

// 插入所有题目
insertMany([...fillQuestions, ...shortAnswerQuestions, ...experimentQuestions]);

console.log('✓ 成功添加题目：');
console.log(`  - 填空题：${fillQuestions.length} 道`);
console.log(`  - 简答题：${shortAnswerQuestions.length} 道`);
console.log(`  - 实验题：${experimentQuestions.length} 道`);
console.log(`\n总计：${fillQuestions.length + shortAnswerQuestions.length + experimentQuestions.length} 道`);

// 验证题目数量
const stats = db.prepare('SELECT type, COUNT(*) as count FROM questions GROUP BY type').all();
console.log('\n当前题库中的题目分布：');
stats.forEach(s => {
  console.log(`${s.type}: ${s.count} 道`);
});
