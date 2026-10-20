<!-- src/components/ScrollPopup.vue -->
<template>
  <div class="scroll-popup-overlay" v-if="show" @click.self="close">
    <div class="scroll-popup">
      <div class="scroll-rod scroll-rod-left"></div>
      <div class="scroll-rod scroll-rod-right"></div>

      <div class="scroll-content" ref="scrollContent">
        <button class="scroll-close" @click="close">✕</button>

        <div class="scroll-inner" ref="scrollInner">
          <!-- ===== 标题 ===== -->
          <div class="scroll-title-area">
            <div class="title-row">
              <span class="scroll-title-deco">◆</span>
              <h2 class="scroll-title">生态环境法典</h2>
              <span class="scroll-title-deco">◆</span>
              <!-- 字体控制按钮 -->
              <div class="font-controls">
                <button class="font-btn" @click="decreaseFont" title="缩小字体">A−</button>
                <span class="font-size-display">{{ fontSize }}px</span>
                <button class="font-btn" @click="increaseFont" title="放大字体">A+</button>
              </div>
            </div>
            <div class="scroll-subtitle">
              Ecological Environment Code
              <span class="scroll-badge">2026.8.15 正式施行</span>
            </div>
          </div>

          <!-- ===== 正文 ===== -->
          <div class="scroll-body">
            <!-- 板块一：法典速览 -->
            <div class="scroll-section">
              <h3>一部「绿色法典」的诞生</h3>
              <p>
                <strong>《中华人民共和国生态环境法典》</strong>是我国继民法典之后的
                <strong>第二部法典</strong>，于
                <strong>2026年8月15日</strong>（第四个全国生态日）正式施行。
                法典共 <strong>5编、1242条、16万余字</strong>，涵盖
                <strong>污染防治、生态保护、绿色低碳发展</strong>等领域。
              </p>
              <p style="margin-top: 6px; font-size: 0.9em; color: #8a7a5a;">
                阅读全文：
                <a
                  href="https://www.npc.gov.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: #8a7a5a; text-decoration: underline;"
                >
                  中国人大网 www.npc.gov.cn
                </a>
                <span style="margin: 0 6px;">｜</span>
                <span style="font-size: 0.85em; opacity: 0.7;">
                  法典第1条、第2条、第6条
                </span>
              </p>
              <div style="margin-top: 8px; background: rgba(200,180,150,0.12); padding: 10px 14px; border-radius: 6px; border-left: 3px solid #8a7a5a;">
                <p style="margin: 0; line-height: 1.7;">
                  <strong>立法目的</strong>（法典第1条）：<br>
                  「为了保护生态环境，防治污染和其他公害，保障公众健康和生态环境权益，维护生态安全，推动绿色低碳发展，建设生态文明，全面推进美丽中国建设，加快推进人与自然和谐共生的现代化，实现中华民族永续发展，根据宪法，制定本法。」
                </p>
                <p style="margin: 6px 0 0; line-height: 1.7;">
                  <strong>基本原则</strong>（法典第6条）：<br>
                  「生态环境保护应当坚持<strong>预防为主、系统治理、生态优先、绿色发展、公众参与、损害担责</strong>的原则。」
                </p>
                <p style="margin: 6px 0 0; line-height: 1.7;">
                  <strong>生态环境定义</strong>（法典第2条）：<br>
                  「本法所称生态环境，是指影响人类生存和发展以及生态系统功能的各种天然的和经过人工改造的自然空间、自然因素及其相互联系与作用的总体。」
                </p>
              </div>
            </div>

            <!-- 板块二：法典的五大编 -->
            <div class="scroll-section">
              <h3>法典五大编</h3>
              <div class="scroll-grid">
                <div class="scroll-grid-item">
                  <span style="font-weight: 600;">总则</span>
                  <span style="font-size: 0.85em; color: #8a7a6a;">基础性、统领性规定</span>
                </div>
                <div class="scroll-grid-item">
                  <span style="font-weight: 600;">污染防治</span>
                  <span style="font-size: 0.85em; color: #8a7a6a;">大气、水、海洋、土壤、固废、噪声等</span>
                </div>
                <div class="scroll-grid-item">
                  <span style="font-weight: 600;">生态保护</span>
                  <span style="font-size: 0.85em; color: #8a7a6a;">生态系统、自然资源、物种、生态修复</span>
                </div>
                <div class="scroll-grid-item">
                  <span style="font-weight: 600;">绿色低碳发展</span>
                  <span style="font-size: 0.85em; color: #8a7a6a;">循环经济、能源节约、气候变化</span>
                </div>
                <div class="scroll-grid-item" style="grid-column: span 2;">
                  <span style="font-weight: 600;">法律责任和附则</span>
                  <span style="font-size: 0.85em; color: #8a7a6a;">罚则设置、过罚相当、精准执法</span>
                </div>
              </div>
            </div>

            <!-- 板块三：生态保护编亮点 -->
            <div class="scroll-section">
              <h3>生态保护编 · 守护山河</h3>
              <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>首次系统规范生态修复全流程</strong><br>
                    现行单行法律缺少关于生态修复总体性、原则性、程序性的规定。法典生态保护编首次对生态修复活动的原则、程序和重点领域作出系统规定，既适用于各级政府及有关部门开展的生态修复活动，也适用于有关单位和个人造成生态破坏后依法应承担的生态修复义务。
                  </p>
                </div>
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>细化人与野生动物共处规则</strong><br>
                    法典设立“野生动物保护”专节，着重平衡野生动物保护与群众生命财产安全。针对野生动物与家畜争草场问题，增加规定：县级以上地方人民政府林业草原主管部门核定草原载畜量时，应当考虑野生动物生存繁衍合理需求。
                  </p>
                </div>
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>固化治沙经验 填补立法空白</strong><br>
                    法典把我国多年防沙治沙和“三北”工程的成功经验上升为法律，首次专门规范荒漠生态系统保护，明确其重要生态功能，与森林、草原、湿地等其他生态系统同等受到法律保护。
                  </p>
                </div>
              </div>
            </div>

            <!-- 板块四：法律责任和附则编亮点 -->
            <div class="scroll-section">
              <h3>法律责任和附则编 · 精准执法</h3>
              <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>新增罚则 违法成本“水涨船高”</strong><br>
                    新增多项处罚条款，针对群众反映强烈的环境违法行为逐一明确法律责任。光污染入法：对广告屏、广告牌、灯箱、媒体立面墙等设施产生光污染，未采取有效措施防止、减轻光污染，干扰他人正常生活、交通出行的，由有关部门责令改正；拒不改正的，<strong>处5000元以上5万元以下罚款</strong>。对已有法律责任规定的情节较重环境违法行为，坚持罚款力度不降低，部分违法行为进一步提高处罚额度，让违法成本高于违法收益。
                  </p>
                </div>
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>告别执法“一刀切”</strong><br>
                    坚持科学合理设置法律责任，针对不同违法情形、违法主体不搞“一刀切”，精准区分违法环节与主体类型，差异化设置罚则，实现过罚相当，让执法处罚更精准、更合理，确保处罚落地执行。
                  </p>
                </div>
              </div>
            </div>

            <!-- 板块五：秦岭非法穿越案 -->
            <div class="scroll-section">
              <h3>法治抵达群山深处 · 秦岭案</h3>
              <p style="font-size: 0.9em; color: #7a6a5a; margin-bottom: 6px;">
                西安铁路运输中级法院 · 民事公益诉讼 · 新时代推动法治进程2025年度十大提名案件
              </p>
              <p style="line-height: 1.8; margin-bottom: 8px;">
                某户外组织在 <strong>2024年1月至2025年6月</strong> 期间，通过线上平台招募参与者，
                先后 <strong>25次</strong> 组织人员进入鳌山、顶棚梁、光头山等位于海拔2000米以上的秦岭核心保护区及国家级自然保护区开展登山、穿越活动，
                累计 <strong>148人次</strong> 参与，收费共计 <strong>30,894元</strong>，对太白山国家级自然保护区、牛背梁国家级自然保护区的生态环境和秦岭脆弱的高海拔生态系统造成持续性损害。
              </p>

              <div class="case-timeline">
                <div class="case-step">
                  <span class="case-dot"></span>
                  <div>
                    <strong>① 违法组织</strong>
                    <p>苏某通过微信群、小红书等平台招募队员，组织穿越秦岭核心保护区</p>
                  </div>
                </div>
                <div class="case-step">
                  <span class="case-dot"></span>
                  <div>
                    <strong>② 违法实施</strong>
                    <p>进入鳌山、光头山、鹿角梁等区域，进行穿越、露营活动</p>
                  </div>
                </div>
                <div class="case-step">
                  <span class="case-dot"></span>
                  <div>
                    <strong>③ 检察介入</strong>
                    <p>检察机关提起民事公益诉讼，本着生态优先、预防为主原则申请诉前禁止令，要求苏某立即停止组织穿越活动</p>
                  </div>
                </div>
                <div class="case-step">
                  <span class="case-dot"></span>
                  <div>
                    <strong>④ 法院审理</strong>
                    <p>西安铁路运输中级法院当庭宣判，支持检察院全部诉请</p>
                  </div>
                </div>
                <div class="case-step case-step-last">
                  <span class="case-dot case-dot-green"></span>
                  <div>
                    <strong>⑤ 判决结果</strong>
                    <p>判令<strong>停止组织穿越及登山活动</strong>、<strong>赔偿生态环境修复费用1万元</strong>、<strong>在省级媒体上公开赔礼道歉</strong></p>
                  </div>
                </div>
              </div>

              <div style="margin-top: 10px; padding: 10px 14px; background: rgba(26,42,108,0.06); border-radius: 8px; border-left: 3px solid #1a2a6c;">
                <p style="margin: 0; line-height: 1.8;">
                  <strong>案件评述：</strong>
                  本案系全国法院首例非法穿越自然保护区核心区生态环境民事公益诉讼案。人民法院按照“明确规则+惩戒预防+生态恢复+综合治理”的办案思路，运用诉前禁止令保全措施预防性生态保护司法手段，及时制止生态环境损害扩大；综合适用生态环境侵权证明责任、专家证人意见，构建生态修复金综合量化模型，破解事实认定难、因果关系确定难、生态修复金鉴定难等问题。审理后还通过联席会议、司法保护项目、审判“进乡村、进校园、进机关”活动深化综合治理，实现政治、法律、社会、生态“四个效果”的统一。
                </p>
                <p style="font-size: 1.05em; color: #1a2a6c; font-weight: 600; margin: 6px 0 0; text-align: center; font-style: italic;">
                  「法律不仅在城市，也抵达群山深处」
                </p>
                <p style="font-size: 0.8em; color: #8a7a6a; margin: 2px 0 0; text-align: center;">
                  —— 2026年3月最高人民法院公众号
                </p>
              </div>
            </div>

            <!-- 板块六：法典在身边 -->
            <div class="scroll-section">
              <h3>法典在身边</h3>
              <p style="line-height: 1.8; margin-bottom: 6px;">
                生态环境法典不只是一部遥远的法律，它关系到每个人的日常生活。习近平总书记强调：“良好生态环境是最公平的公共产品，是最普惠的民生福祉。”
              </p>

              <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 6px;">
                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>生活垃圾分类</strong>（法典第499条、第506条）<br>
                    国家推行生活垃圾分类制度，单位和个人负有分类投放义务，禁止随意倾倒、焚烧生活垃圾。
                  </p>
                  <p style="font-size: 0.85em; color: #8a7a6a; margin: 4px 0 0; padding-top: 4px; border-top: 1px dashed rgba(200,180,150,0.2);">
                    个人随意倾倒生活垃圾，拒不改正的，<strong>处一百元以上一千元以下罚款</strong>（法典第1169条第3款）
                  </p>
                </div>

                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>自然保护地管理</strong>（法典第287条、第290条）<br>
                    国家建立以国家公园为主体的自然保护地体系，禁止在自然保护区内进行非法采伐、狩猎、采药、开垦等活动。
                  </p>
                  <p style="font-size: 0.85em; color: #8a7a6a; margin: 4px 0 0; padding-top: 4px; border-top: 1px dashed rgba(200,180,150,0.2);">
                    非法进入自然保护区核心区，最高可处<strong>五千元以上一万元以下罚款</strong>（法典第1152条）
                  </p>
                </div>

                <div style="background: rgba(255,248,235,0.5); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(200,180,150,0.15);">
                  <p style="margin: 0; line-height: 1.8;">
                    <strong>水环境保护</strong>（法典第221条、第225条）<br>
                    国家实行水环境保护目标责任制，禁止向水体排放油类、酸液、碱液或者剧毒废液。
                  </p>
                  <p style="font-size: 0.85em; color: #8a7a6a; margin: 4px 0 0; padding-top: 4px; border-top: 1px dashed rgba(200,180,150,0.2);">
                    违法排放水污染物，最高可处<strong>一百万元以下罚款</strong>（法典第1176条）
                  </p>
                </div>
              </div>
            </div>

            <!-- 板块七：生态修复与补偿 -->
            <div class="scroll-section">
              <h3>生态修复与补偿机制</h3>
              <p style="line-height: 1.8;">
                生态环境法典确立了 <strong>「损害担责」</strong> 和 <strong>「修复优先」</strong> 原则，
                要求造成生态环境损害的责任人承担修复责任。同时，国家建立健全
                <strong>生态保护补偿机制</strong>，对因保护生态环境而利益受损的地区和个人给予合理补偿。
              </p>
              <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="background: rgba(82,140,126,0.10); padding: 4px 14px; border-radius: 12px; font-size: 0.85em; color: #528c7e; border: 1px solid rgba(82,140,126,0.15);">
                  损害赔偿
                </span>
                <span style="background: rgba(82,140,126,0.10); padding: 4px 14px; border-radius: 12px; font-size: 0.85em; color: #528c7e; border: 1px solid rgba(82,140,126,0.15);">
                  修复责任
                </span>
                <span style="background: rgba(82,140,126,0.10); padding: 4px 14px; border-radius: 12px; font-size: 0.85em; color: #528c7e; border: 1px solid rgba(82,140,126,0.15);">
                  生态补偿
                </span>
                <span style="background: rgba(82,140,126,0.10); padding: 4px 14px; border-radius: 12px; font-size: 0.85em; color: #528c7e; border: 1px solid rgba(82,140,126,0.15);">
                  公益诉讼
                </span>
              </div>
            </div>

            <!-- ===== 分隔线 ===== -->
            <div style="height: 2px; background: linear-gradient(90deg, transparent, rgba(180,150,100,0.2), transparent); margin: 16px 0;"></div>

            <!-- ===== 板块八：知识小测试 ===== -->
            <div class="quiz-section">
              <h3>法典知识小测试</h3>
              <p style="font-size: 0.85em; color: #8a7a6a; margin-bottom: 10px;">
                答完所有题目，看看你对生态环境法典了解多少！
              </p>

              <div
                v-for="(question, index) in quizQuestions"
                :key="index"
                class="quiz-item"
                :class="{ 'quiz-answered': question.answered }"
              >
                <div class="quiz-question">
                  <span class="quiz-number">{{ index + 1 }}.</span>
                  <span>{{ question.text }}</span>
                </div>
                <div class="quiz-options">
                  <button
                    v-for="(option, oi) in question.options"
                    :key="oi"
                    class="quiz-option"
                    :class="{
                      'quiz-option-selected': question.selected === oi,
                      'quiz-option-correct': question.answered && oi === question.correct,
                      'quiz-option-wrong': question.answered && question.selected === oi && oi !== question.correct
                    }"
                    @click="selectOption(index, oi)"
                    :disabled="question.answered"
                  >
                    {{ 'ABCD'[oi] }}. {{ option }}
                  </button>
                </div>
                <div v-if="question.answered" class="quiz-feedback" :class="{ 'quiz-feedback-correct': question.selected === question.correct }">
                  <span v-if="question.selected === question.correct">正确！</span>
                  <span v-else>正确答案是 {{ 'ABCD'[question.correct] }}</span>
                  <span class="quiz-source">—— {{ question.source }}</span>
                </div>
              </div>

              <div v-if="allAnswered" class="quiz-result" :class="{ 'quiz-result-perfect': perfectScore }">
                <span v-if="perfectScore">太棒了！你获得了「生态合伙人」徽章！</span>
                <span v-else>
                  你答对了 {{ score }}/{{ quizQuestions.length }} 题，再复习一下上面的内容吧！
                </span>
              </div>
            </div>

            <!-- 底部 -->
            <div class="scroll-footer">
              <span class="scroll-footer-text">法律不仅在城市，也抵达群山深处</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// ============================================================
// 字体大小控制
// ============================================================

const fontSize = ref(16)
const MIN_FONT_SIZE = 13
const MAX_FONT_SIZE = 22
const scrollInner = ref(null)

const increaseFont = () => {
  if (fontSize.value < MAX_FONT_SIZE) {
    fontSize.value += 1
    applyFontSize(fontSize.value)
  }
}

const decreaseFont = () => {
  if (fontSize.value > MIN_FONT_SIZE) {
    fontSize.value -= 1
    applyFontSize(fontSize.value)
  }
}

const saveFontSize = (size) => {
  try {
    localStorage.setItem('scroll-popup-font-size', size.toString())
  } catch (e) {}
}

const loadFontSize = () => {
  try {
    const saved = localStorage.getItem('scroll-popup-font-size')
    if (saved) {
      const size = parseInt(saved, 10)
      if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
        return size
      }
    }
  } catch (e) {}
  return 16
}

const applyFontSize = (size) => {
  if (scrollInner.value) {
    scrollInner.value.style.fontSize = size + 'px'
  }
  saveFontSize(size)
}

onMounted(() => {
  const savedSize = loadFontSize()
  fontSize.value = savedSize
  applyFontSize(savedSize)
})

// ============================================================
// 题库
// ============================================================

const quizQuestions = ref([
  {
    text: '《中华人民共和国生态环境法典》于哪一天正式施行？',
    options: ['2026年3月12日', '2026年6月5日', '2026年8月15日', '2026年10月1日'],
    correct: 2,
    selected: null,
    answered: false,
    source: '法典正式施行日期'
  },
  {
    text: '以下哪项是《生态环境法典》确立的基本原则？',
    options: ['先污染后治理', '生态优先', '发展优先于保护', '自然资源无限利用'],
    correct: 1,
    selected: null,
    answered: false,
    source: '法典第6条'
  },
  {
    text: '在秦岭非法穿越案中，法院要求被告承担的民事责任不包括以下哪项？',
    options: ['停止组织非法穿越', '赔偿生态修复费用', '承担刑事责任', '公开赔礼道歉'],
    correct: 2,
    selected: null,
    answered: false,
    source: '西安铁路运输中级法院判决'
  },
  {
    text: '根据法典，个人随意倾倒生活垃圾，拒不改正的，可能会面临什么处罚？',
    options: ['仅警告', '处一百元以上一千元以下罚款', '处一万元以上十万元以下罚款', '处十日以上行政拘留'],
    correct: 1,
    selected: null,
    answered: false,
    source: '法典第1169条第3款'
  },
  {
    text: '《生态环境法典》是我国第几部法典？',
    options: ['第一部', '第二部', '第三部', '第四部'],
    correct: 1,
    selected: null,
    answered: false,
    source: '继民法典之后的第二部法典'
  },
  {
    text: '秦岭非法穿越案中，被告共组织了多少次非法穿越活动？',
    options: ['10次', '15次', '20次', '25次'],
    correct: 3,
    selected: null,
    answered: false,
    source: '2024年1月-2025年6月案件数据'
  }
])

const allAnswered = computed(() => {
  return quizQuestions.value.every(q => q.answered)
})

const score = computed(() => {
  return quizQuestions.value.filter(q => q.selected === q.correct).length
})

const perfectScore = computed(() => {
  return score.value === quizQuestions.value.length
})

const selectOption = (qIndex, oIndex) => {
  const q = quizQuestions.value[qIndex]
  if (q.answered) return
  q.selected = oIndex
  q.answered = true
}
</script>

<style scoped>
/* ============================================================
   ===== 卷轴弹窗样式 =====
   ============================================================ */

.scroll-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 25, 20, 0.45);
  backdrop-filter: blur(3px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 60px;
}

.scroll-popup {
  position: relative;
  width: 800px;
  max-width: 94vw;
  max-height: 86vh;
  background: linear-gradient(180deg, #f5ede0 0%, #e8dcc8 100%);
  border-radius: 8px 8px 12px 12px;
  box-shadow: 0 20px 80px rgba(30, 25, 20, 0.35);
  border: 1px solid rgba(180, 150, 100, 0.25);
  overflow: hidden;
}

.scroll-rod {
  position: absolute;
  top: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(180deg, #8a7a5a, #6a5a4a, #8a7a5a);
  border-radius: 4px;
  z-index: 5;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.scroll-rod::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 30px;
  background: radial-gradient(ellipse, #c4a86a, #8a7a5a);
  border-radius: 50%;
  box-shadow: inset 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.scroll-rod-left { left: -10px; border-radius: 20px 0 0 20px; }
.scroll-rod-left::before { left: 60%; }

.scroll-rod-right { right: -10px; border-radius: 0 20px 20px 0; }
.scroll-rod-right::before { left: 40%; }

.scroll-content {
  position: relative;
  z-index: 2;
  padding: 16px 28px 20px;
  max-height: 86vh;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(245, 237, 224, 0.92) 0%, rgba(232, 220, 200, 0.95) 100%);
}

.scroll-content::-webkit-scrollbar { width: 5px; }
.scroll-content::-webkit-scrollbar-track {
  background: rgba(200, 180, 150, 0.2);
  border-radius: 4px;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: #c4a86a;
  border-radius: 4px;
}

.scroll-close {
  position: sticky;
  top: 0;
  float: right;
  z-index: 10;
  background: rgba(139, 115, 85, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(139, 115, 85, 0.2);
  color: #5a4a3a;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.scroll-close:hover {
  background: rgba(139, 115, 85, 0.5);
  transform: rotate(90deg);
}

.scroll-inner { clear: both; }

/* ===== 标题 ===== */
.scroll-title-area {
  text-align: center;
  padding: 4px 0 12px;
  border-bottom: 2px solid rgba(180, 150, 100, 0.2);
  margin-bottom: 14px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  position: relative;
}

.scroll-title-deco {
  color: #b8a080;
  font-size: 14px;
  letter-spacing: 8px;
}

.scroll-title {
  margin: 4px 0 2px;
  font-size: 32px;
  font-weight: 700;
  color: #3a2a1a;
  letter-spacing: 8px;
  font-family: '华文楷体', 'KaiTi', serif;
}

.scroll-subtitle {
  font-size: 13px;
  color: #8a7a6a;
  letter-spacing: 4px;
  font-weight: 300;
}

.scroll-badge {
  display: inline-block;
  margin-left: 10px;
  background: #8a7a5a;
  color: white;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 12px;
  letter-spacing: 1px;
}

/* ===== 字体控制按钮 ===== */
.font-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  background: rgba(200, 180, 150, 0.15);
  padding: 2px 6px;
  border-radius: 16px;
  border: 1px solid rgba(200, 180, 150, 0.1);
}

.font-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(139, 115, 85, 0.15);
  border-radius: 50%;
  color: #5a4a3a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.font-btn:hover {
  background: rgba(139, 115, 85, 0.3);
  transform: scale(1.05);
}

.font-btn:active {
  transform: scale(0.95);
}

.font-size-display {
  font-size: 12px;
  color: #8a7a6a;
  min-width: 32px;
  text-align: center;
  font-weight: 500;
}

/* ===== 正文 ===== */
.scroll-body { padding: 2px 0; }

.scroll-section { margin-bottom: 14px; }

.scroll-section h3 {
  font-size: 1.1em;
  font-weight: 600;
  color: #4a3a2a;
  margin-bottom: 4px;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
}

.scroll-section p {
  color: #5a4a3a;
  line-height: 1.8;
  margin: 0;
}

/* ===== 网格 ===== */
.scroll-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 4px;
}

.scroll-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  background: rgba(255, 248, 235, 0.4);
  border-radius: 8px;
  color: #5a4a3a;
  border: 1px solid rgba(200, 180, 150, 0.1);
}

/* ===== 案件时间线 ===== */
.case-timeline { margin-top: 6px; }

.case-step {
  display: flex;
  gap: 10px;
  padding: 4px 0 6px;
  border-bottom: 1px dashed rgba(200, 180, 150, 0.2);
}

.case-step-last { border-bottom: none; }

.case-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 50%;
  background: #1a2a6c;
  border: 2px solid rgba(255,255,255,0.5);
}

.case-dot-green { background: #2E7D32; }

.case-step strong {
  color: #3a2a1a;
}

.case-step p {
  color: #6a5a4a;
  margin: 0;
  line-height: 1.5;
}

/* ===== 知识小测试 ===== */
.quiz-section { margin-top: 4px; }

.quiz-section h3 {
  font-size: 1.1em;
  font-weight: 600;
  color: #4a3a2a;
  margin-bottom: 2px;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
}

.quiz-item {
  background: rgba(255, 248, 235, 0.5);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(200, 180, 150, 0.1);
  transition: all 0.3s;
}

.quiz-answered {
  background: rgba(255, 248, 235, 0.8);
  border-color: rgba(200, 180, 150, 0.2);
}

.quiz-question {
  font-weight: 500;
  color: #3a2a1a;
  margin-bottom: 6px;
  line-height: 1.6;
}

.quiz-number {
  font-weight: 700;
  color: #8a7a5a;
  margin-right: 4px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quiz-option {
  text-align: left;
  padding: 5px 12px;
  border: 1px solid rgba(200, 180, 150, 0.15);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.3);
  color: #4a3a2a;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1.6;
}

.quiz-option:hover:not(:disabled) {
  background: rgba(200, 180, 150, 0.1);
  border-color: rgba(180, 150, 100, 0.3);
}

.quiz-option:disabled { cursor: default; }

.quiz-option-selected {
  background: rgba(26, 42, 108, 0.08);
  border-color: #1a2a6c;
}

.quiz-option-correct {
  background: rgba(46, 125, 50, 0.12);
  border-color: #2E7D32;
  color: #1e5a24;
}

.quiz-option-wrong {
  background: rgba(211, 47, 47, 0.10);
  border-color: #c62828;
  color: #b71c1c;
}

.quiz-feedback {
  margin-top: 6px;
  color: #5a4a3a;
  padding: 4px 10px;
  background: rgba(255, 248, 235, 0.4);
  border-radius: 4px;
  border-left: 3px solid #c62828;
}

.quiz-feedback-correct { border-left-color: #2E7D32; }

.quiz-source {
  font-size: 0.8em;
  color: #8a7a6a;
  margin-left: 8px;
}

.quiz-result {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(200, 180, 150, 0.12);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  border: 1px solid rgba(200, 180, 150, 0.15);
}

.quiz-result-perfect {
  background: rgba(46, 125, 50, 0.08);
  border-color: #2E7D32;
  color: #1e5a24;
}

/* ===== 底部 ===== */
.scroll-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 2px solid rgba(180, 150, 100, 0.15);
  text-align: center;
}

.scroll-footer-text {
  font-size: 1.05em;
  font-style: italic;
  color: #8a7a5a;
  letter-spacing: 2px;
  font-family: '华文楷体', 'KaiTi', serif;
}

/* ============================================================
   ===== 响应式 =====
   ============================================================ */

@media (max-width: 768px) {
  .scroll-popup { max-width: 96vw; max-height: 88vh; }
  .scroll-content { padding: 12px 16px 16px; max-height: 88vh; }
  .scroll-title { font-size: 26px; letter-spacing: 4px; }
  .scroll-rod { width: 12px; }
  .scroll-rod-left { left: -6px; }
  .scroll-rod-right { right: -6px; }
  .scroll-rod::before { width: 10px; height: 20px; }
  .scroll-grid { grid-template-columns: repeat(2, 1fr); }
  .scroll-badge { font-size: 10px; padding: 1px 8px; margin-left: 6px; }
  .font-controls { margin-left: 8px; }
  .font-btn { width: 22px; height: 22px; font-size: 11px; }
  .font-size-display { font-size: 10px; min-width: 26px; }
}

@media (max-width: 480px) {
  .scroll-popup { max-width: 98vw; border-radius: 4px; }
  .scroll-content { padding: 10px 12px 14px; }
  .scroll-title { font-size: 20px; letter-spacing: 2px; }
  .scroll-title-deco { font-size: 10px; letter-spacing: 4px; }
  .scroll-subtitle { font-size: 11px; letter-spacing: 2px; }
  .scroll-badge { font-size: 9px; padding: 1px 6px; display: block; margin: 4px auto 0; }
  .scroll-footer-text { font-size: 14px; }
  .scroll-close { width: 26px; height: 26px; font-size: 13px; }
  .scroll-rod { width: 8px; }
  .scroll-rod-left { left: -4px; }
  .scroll-rod-right { right: -4px; }
  .scroll-rod::before { width: 6px; height: 14px; }
  .scroll-grid { grid-template-columns: repeat(2, 1fr); gap: 4px; }
  .quiz-item { padding: 8px 10px; }
  .quiz-result { font-size: 13px; padding: 8px 12px; }
  .case-step { gap: 6px; padding: 3px 0 4px; }
  .case-dot { width: 8px; height: 8px; margin-top: 3px; }
  .scroll-popup-overlay { padding-left: 10px; }
  .font-controls { margin-left: 0; margin-top: 4px; }
  .font-btn { width: 20px; height: 20px; font-size: 10px; }
  .font-size-display { font-size: 9px; min-width: 22px; }
}
</style>
