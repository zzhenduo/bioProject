const db = require('../db/init');

// 清空现有知识点
db.exec('DELETE FROM knowledge_points');

console.log('✓ 已清空所有知识点');

// 必修一·分子与细胞 完整知识点列表
const knowledgePoints = [
  // 第 1 章 走近细胞
  {
    title: '细胞是生命活动的基本单位',
    chapter: '必修一·第 1 章',
    grade_level: '高一',
    difficulty_level: 1,
    content: '细胞是生物体结构和功能的基本单位，是生命活动的基本单位。除病毒外，所有生物都由细胞构成。',
    tags: '细胞，生命活动，基本单位'
  },
  {
    title: '细胞的多样性和统一性',
    chapter: '必修一·第 1 章',
    grade_level: '高一',
    difficulty_level: 1,
    content: '细胞的多样性体现在形态、结构和功能的差异；统一性体现在都有细胞膜、细胞质、核糖体等基本结构，都以 DNA 作为遗传物质。',
    tags: '细胞多样性，细胞统一性'
  },
  {
    title: '原核细胞和真核细胞',
    chapter: '必修一·第 1 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '原核细胞没有以核膜为界限的细胞核，如细菌、蓝藻；真核细胞有真正的细胞核，如动物细胞、植物细胞、真菌细胞。',
    tags: '原核细胞，真核细胞，细胞核'
  },
  
  // 第 2 章 组成细胞的分子
  {
    title: '细胞中的元素和化合物',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 1,
    content: '细胞中常见的化学元素有 20 多种，分为大量元素（C、H、O、N、P、S、K、Ca、Mg 等）和微量元素（Fe、Mn、Zn、Cu、B、Mo 等）。化合物包括无机化合物（水和无机盐）和有机化合物（糖类、脂质、蛋白质、核酸）。',
    tags: '元素，化合物，大量元素，微量元素'
  },
  {
    title: '蛋白质的结构和功能',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '蛋白质是生命活动的主要承担者。基本单位是氨基酸，通过脱水缩合形成肽链。蛋白质结构具有多样性，决定了功能的多样性。功能包括：结构蛋白、催化作用（酶）、运输作用（血红蛋白）、调节作用（激素）、免疫作用（抗体）等。',
    tags: '蛋白质，氨基酸，酶，功能'
  },
  {
    title: '氨基酸的结构通式',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '每个氨基酸分子至少含有一个氨基（-NH₂）和一个羧基（-COOH），并且都有一个氨基和一个羧基连接在同一个碳原子上。',
    tags: '氨基酸，结构通式，氨基，羧基'
  },
  {
    title: '核酸的结构和功能',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '核酸是遗传信息的携带者，分为 DNA（脱氧核糖核酸）和 RNA（核糖核酸）。基本单位是核苷酸。DNA 主要分布在细胞核中，RNA 主要分布在细胞质中。',
    tags: '核酸，DNA, RNA，遗传信息'
  },
  {
    title: 'DNA 和 RNA 的区别',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: 'DNA 含脱氧核糖和碱基 A、T、G、C，双螺旋结构；RNA 含核糖和碱基 A、U、G、C，单链结构。',
    tags: 'DNA, RNA，区别，碱基'
  },
  {
    title: '细胞中的糖类',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '糖类是主要的能源物质。分为单糖（葡萄糖、果糖、半乳糖、核糖、脱氧核糖）、二糖（蔗糖、麦芽糖、乳糖）和多糖（淀粉、纤维素、糖原）。',
    tags: '糖类，单糖，二糖，多糖，葡萄糖'
  },
  {
    title: '细胞中的脂质',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '脂质包括脂肪（储能物质）、磷脂（细胞膜成分）、固醇（胆固醇、性激素、维生素 D）。',
    tags: '脂质，脂肪，磷脂，固醇'
  },
  {
    title: '细胞中的水和无机盐',
    chapter: '必修一·第 2 章',
    grade_level: '高一',
    difficulty_level: 1,
    content: '水是细胞中含量最多的化合物，分为自由水和结合水。无机盐主要以离子形式存在，如 Na⁺、K⁺、Ca²⁺、Mg²⁺、Fe²⁺、Cl⁻等。',
    tags: '水，无机盐，自由水，结合水'
  },
  
  // 第 3 章 细胞的基本结构
  {
    title: '细胞膜的结构和功能',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '细胞膜主要由脂质（磷脂双分子层）和蛋白质组成，还有少量糖类。功能：将细胞与外界环境分隔开；控制物质进出细胞；进行细胞间的信息交流。结构特点：具有一定的流动性。',
    tags: '细胞膜，磷脂双分子层，物质运输，信息交流'
  },
  {
    title: '细胞器的结构和功能',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '线粒体（有氧呼吸主要场所，"动力车间"）；叶绿体（光合作用场所，"养料制造车间"和"能量转换站"）；内质网（蛋白质合成和加工，脂质合成）；高尔基体（蛋白质加工、分类、包装和运输）；核糖体（蛋白质合成场所）；溶酶体（"消化车间"）；液泡（调节细胞内环境）；中心体（与细胞有丝分裂有关）。',
    tags: '细胞器，线粒体，叶绿体，内质网，高尔基体，核糖体'
  },
  {
    title: '线粒体的结构和功能',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '线粒体具有双层膜结构，内膜向内折叠形成嵴，增大了膜面积。是有氧呼吸的主要场所，为细胞生命活动提供能量。',
    tags: '线粒体，双层膜，有氧呼吸，能量'
  },
  {
    title: '叶绿体的结构和功能',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '叶绿体具有双层膜结构，内部有许多基粒，基粒由类囊体堆叠而成。是绿色植物进行光合作用的场所。',
    tags: '叶绿体，双层膜，光合作用，类囊体'
  },
  {
    title: '细胞核的结构和功能',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '细胞核由核膜（双层膜）、核仁、染色质（主要由 DNA 和蛋白质组成）组成。功能：是遗传信息库，是细胞代谢和遗传的控制中心。',
    tags: '细胞核，核膜，核仁，染色质，DNA'
  },
  {
    title: '生物膜系统',
    chapter: '必修一·第 3 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '细胞器膜和细胞膜、核膜等结构共同构成细胞的生物膜系统。生物膜系统在细胞的生命活动中作用极为重要。',
    tags: '生物膜系统，细胞器膜，细胞膜'
  },
  
  // 第 4 章 细胞的物质输入和输出
  {
    title: '物质跨膜运输的方式',
    chapter: '必修一·第 4 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '自由扩散（顺浓度梯度，不需要载体和能量，如 O₂、CO₂、水、甘油、乙醇）；协助扩散（顺浓度梯度，需要载体，不需要能量，如葡萄糖进入红细胞）；主动运输（逆浓度梯度，需要载体和能量，如离子、氨基酸、葡萄糖进入小肠上皮细胞）。',
    tags: '跨膜运输，自由扩散，协助扩散，主动运输'
  },
  {
    title: '渗透作用',
    chapter: '必修一·第 4 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '水分子（或其他溶剂分子）透过半透膜，从低浓度溶液向高浓度溶液的扩散。植物细胞的原生质层相当于一层半透膜。',
    tags: '渗透作用，半透膜，原生质层'
  },
  {
    title: '质壁分离和复原',
    chapter: '必修一·第 4 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '当外界溶液浓度大于细胞液浓度时，植物细胞失水，原生质层与细胞壁分离（质壁分离）；当外界溶液浓度小于细胞液浓度时，植物细胞吸水，原生质层恢复原状（质壁分离复原）。',
    tags: '质壁分离，复原，植物细胞'
  },
  {
    title: '流动镶嵌模型',
    chapter: '必修一·第 4 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '磷脂双分子层构成膜的基本支架，蛋白质分子有的镶在磷脂双分子层表面，有的部分或全部嵌入磷脂双分子层中，有的贯穿于整个磷脂双分子层。磷脂和大多数蛋白质是可以运动的，体现了膜的流动性。',
    tags: '流动镶嵌模型，磷脂双分子层，蛋白质'
  },
  
  // 第 5 章 细胞的能量供应和利用
  {
    title: '酶的本质和特性',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '酶是活细胞产生的具有催化作用的有机物，绝大多数是蛋白质，少数是 RNA。特性：高效性（催化效率是无机催化剂的 10⁷~10¹³倍）；专一性（一种酶只能催化一种或一类化学反应）；作用条件温和（需要适宜的温度和 pH）。',
    tags: '酶，催化作用，高效性，专一性'
  },
  {
    title: 'ATP 的结构和功能',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: 'ATP（三磷酸腺苷）的结构简式：A-P~P~P，其中 A 代表腺苷，P 代表磷酸基团，~代表高能磷酸键。ATP 是细胞内的直接能源物质，水解时远离 A 的那个高能磷酸键断裂，释放能量。',
    tags: 'ATP，三磷酸腺苷，能源物质，高能磷酸键'
  },
  {
    title: '细胞呼吸的类型和过程',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '有氧呼吸：C₆H₁₂O₆+6O₂+6H₂O→6CO₂+12H₂O+能量（三个阶段：细胞质基质→线粒体基质→线粒体内膜）。无氧呼吸：产生酒精（C₆H₁₂O₆→2C₂H₅OH+2CO₂+少量能量）或乳酸（C₆H₁₂O₆→2C₃H₆O₃+ 少量能量）。',
    tags: '细胞呼吸，有氧呼吸，无氧呼吸，酒精，乳酸'
  },
  {
    title: '有氧呼吸的三个阶段',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '第一阶段（细胞质基质）：葡萄糖分解为丙酮酸和 [H]，释放少量能量；第二阶段（线粒体基质）：丙酮酸和水反应生成 CO₂和 [H]，释放少量能量；第三阶段（线粒体内膜）：[H] 和 O₂结合生成水，释放大量能量。',
    tags: '有氧呼吸，三个阶段，线粒体'
  },
  {
    title: '光合作用的过程',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '总反应式：6CO₂+12H₂O→C₆H₁₂O₆+6O₂+6H₂O。分为光反应（类囊体薄膜上）：水的光解（2H₂O→4[H]+O₂）、ATP 的合成（ADP+Pi+ 能量→ATP）；暗反应（叶绿体基质中）：CO₂的固定（CO₂+C₅→2C₃）、C₃的还原（2C₃→(CH₂O)+C₅）。',
    tags: '光合作用，光反应，暗反应，类囊体'
  },
  {
    title: '影响光合作用的因素',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '光照强度（影响光反应）；CO₂浓度（影响暗反应）；温度（影响酶活性）；水分；矿质元素（如 Mg 是叶绿素的组成成分）。',
    tags: '光合作用，光照强度，CO₂浓度，温度'
  },
  {
    title: '活化能和酶的作用机理',
    chapter: '必修一·第 5 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '分子从常态转变为容易发生化学反应的活跃状态所需要的能量称为活化能。酶降低化学反应的活化能，从而加快反应速率。',
    tags: '活化能，酶，催化机理'
  },
  
  // 第 6 章 细胞的生命历程
  {
    title: '细胞周期',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '连续分裂的细胞，从一次分裂完成时开始，到下一次分裂完成时为止，为一个细胞周期。包括分裂间期（时间长，完成 DNA 复制和蛋白质合成）和分裂期（时间短）。',
    tags: '细胞周期，分裂间期，分裂期'
  },
  {
    title: '有丝分裂的过程',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 3,
    content: '前期：染色质螺旋化形成染色体，核仁解体，核膜消失，纺锤体形成；中期：染色体的着丝点排列在赤道板上，形态稳定，数目清晰；后期：着丝点分裂，姐妹染色单体分开，染色体数目加倍；末期：染色体解螺旋，核膜核仁重建，纺锤体消失，细胞板形成细胞壁。',
    tags: '有丝分裂，前期，中期，后期，末期，染色体'
  },
  {
    title: '有丝分裂的意义',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '将亲代细胞的染色体经过复制（实质为 DNA 的复制）之后，精确地平均分配到两个子细胞中，在细胞的亲代和子代之间保持了遗传性状的稳定性。',
    tags: '有丝分裂，遗传稳定性，染色体'
  },
  {
    title: '细胞分化',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '在个体发育中，由一个或一种细胞增殖产生的后代，在形态、结构和生理功能上发生稳定性差异的过程。实质是基因的选择性表达。',
    tags: '细胞分化，基因选择性表达'
  },
  {
    title: '细胞的全能性',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '已经分化的细胞，仍然具有发育成完整个细胞的潜能。植物细胞具有全能性，动物细胞的细胞核具有全能性。',
    tags: '细胞全能性，植物细胞，细胞核'
  },
  {
    title: '细胞的衰老',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 1,
    content: '细胞衰老的特征：水分减少，细胞萎缩，体积变小；酶活性降低；色素积累；呼吸速率减慢，细胞核体积增大，核膜内折，染色质收缩，染色加深；细胞膜通透性改变。',
    tags: '细胞衰老，特征，酶活性'
  },
  {
    title: '细胞的凋亡',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '由基因所决定的细胞自动结束生命的过程，又称细胞编程性死亡。对生物体是有利的，如蝌蚪尾巴消失、胎儿手的发育。',
    tags: '细胞凋亡，编程性死亡，基因'
  },
  {
    title: '细胞的癌变',
    chapter: '必修一·第 6 章',
    grade_level: '高一',
    difficulty_level: 2,
    content: '在致癌因子的作用下，细胞中遗传物质发生变化，变成不受机体控制的、连续进行分裂的恶性增殖细胞。癌细胞特征：无限增殖；形态结构发生显著变化；细胞表面发生变化（糖蛋白减少，黏着性降低，易扩散转移）。',
    tags: '细胞癌变，癌细胞，致癌因子，无限增殖'
  }
];

// 批量插入知识点
const stmt = db.prepare(`
  INSERT INTO knowledge_points (title, chapter, grade_level, content, difficulty_level, tags)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((points) => {
  for (const point of points) {
    stmt.run(
      point.title,
      point.chapter,
      point.grade_level,
      point.content,
      point.difficulty_level,
      point.tags
    );
  }
});

insertMany(knowledgePoints);

console.log(`✓ 成功添加 ${knowledgePoints.length} 个知识点`);
console.log('\n知识点分布：');
console.log('- 第 1 章 走近细胞：3 个');
console.log('- 第 2 章 组成细胞的分子：7 个');
console.log('- 第 3 章 细胞的基本结构：6 个');
console.log('- 第 4 章 细胞的物质输入和输出：4 个');
console.log('- 第 5 章 细胞的能量供应和利用：7 个');
console.log('- 第 6 章 细胞的生命历程：7 个');
console.log(`\n总计：${knowledgePoints.length} 个知识点`);
