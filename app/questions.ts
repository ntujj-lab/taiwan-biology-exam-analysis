import { questionContent } from './question-content';

export type Question = {
  id: string;
  year: number;
  number: number;
  chapter: string;
  topic: string;
  skill: string;
  difficulty: '基礎' | '中等' | '進階';
  answer: string;
  summary: string;
  insight: string;
  trap: string;
  prompt: string;
  options: readonly { label: 'A' | 'B' | 'C' | 'D'; text: string }[];
  hasVisualMaterial: boolean;
  passRate: number | null;
  errorRate: number | null;
  statisticalDifficulty: '低' | '中' | '高' | '待統計';
  rateStatus: '全國統計' | '尚未取得';
  rateSource: string | null;
  rateAnalysis: string;
};

type QuestionAnalysis = Omit<Question, 'prompt' | 'options' | 'hasVisualMaterial' | 'passRate' | 'errorRate' | 'statisticalDifficulty' | 'rateStatus' | 'rateSource' | 'rateAnalysis'>;

export const officialSource = 'https://cap.rcpet.edu.tw/examination.html';

const analysisQuestions: QuestionAnalysis[] = [
  { id:'112-1', year:112, number:1, chapter:'生態', topic:'生物多樣性與穩定性', skill:'因果推論', difficulty:'基礎', answer:'D', summary:'原始森林改種單一樹種後，推論物種數、食物網與生態系穩定性的變化。', insight:'物種越單一，食物網通常越簡化，面對干擾時也越不穩定。', trap:'把「生產者數量增加」誤當成「生產者物種數增加」。' },
  { id:'112-4', year:112, number:4, chapter:'分類', topic:'真菌構造', skill:'概念辨識', difficulty:'基礎', answer:'C', summary:'由豆腐乳的毛黴菌發酵情境，判斷真菌細胞具有或缺少哪些構造。', insight:'真菌是真核生物，具有粒線體與細胞壁，但沒有葉綠體。', trap:'看到「菌」便誤判為原核生物，或把真菌當成植物。' },
  { id:'112-8', year:112, number:8, chapter:'協調作用', topic:'血糖調節', skill:'情境推論', difficulty:'基礎', answer:'C', summary:'食物使血糖快速上升時，判斷增加分泌的激素及其來源器官。', insight:'血糖升高會促使胰臟分泌胰島素，使血糖回降。', trap:'混淆胰島素與升糖素，或把肝臟誤認為分泌器官。' },
  { id:'112-14', year:112, number:14, chapter:'生態', topic:'生物累積', skill:'表格判讀', difficulty:'中等', answer:'B', summary:'根據食物鏈中四種生物體內的DDT濃度，推論生產者與消費者的食性關係。', insight:'難以代謝的物質會沿食物鏈逐級累積，最高階消費者濃度通常最高。', trap:'只按個體大小排序，沒有依營養階層判斷。' },
  { id:'112-16', year:112, number:16, chapter:'植物生理', topic:'光合作用與運輸', skill:'概念整合', difficulty:'基礎', answer:'A', summary:'由光合作用反應式判斷原料名稱，以及它在維管束植物中的主要運輸構造。', insight:'水由根吸收後主要經木質部向上運輸，並成為光合作用的原料。', trap:'把韌皮部運送養分的功能套用到水分運輸。' },
  { id:'112-20', year:112, number:20, chapter:'分類', topic:'分類階層', skill:'資料判讀', difficulty:'進階', answer:'B', summary:'由四種植物的分類資料，判斷哪些同科、同目或不同屬的關係能被確定。', insight:'分類階層由大至小逐層包含；同屬必同科，但同科不一定同屬。', trap:'把缺少資料解讀成「一定不同」，忽略題目問的是能否確定。' },
  { id:'112-22', year:112, number:22, chapter:'恆定性', topic:'體溫與潛伏期', skill:'時間軸推論', difficulty:'中等', answer:'B', summary:'利用十天體溫紀錄與1至3天潛伏期，反推最可能的感染日期。', insight:'先找出體溫開始超出恆定範圍的發病日，再往前推潛伏期。', trap:'把體溫異常日直接當成感染日。' },
  { id:'112-31', year:112, number:31, chapter:'循環', topic:'顯微鏡與血流', skill:'圖像判讀', difficulty:'進階', answer:'C', summary:'觀察魚尾鰭血液流向，並判斷移動培養皿時視野中血管消失的順序。', insight:'複式顯微鏡成像上下、左右相反，玻片移動方向與影像移動方向相反。', trap:'只辨認血管，卻忽略顯微鏡視野方向相反。' },
  { id:'112-39', year:112, number:39, chapter:'遺傳', topic:'突變與遺傳', skill:'系譜推論', difficulty:'中等', answer:'D', summary:'由軟骨發育不全症的顯性遺傳與新生突變情境，推論未患病父母的基因型。', insight:'父母皆未患病應為隱性同型；患者的顯性遺傳因子來自新生突變。', trap:'因患者帶有顯性因子，就反推父母必有一人帶因。' },

  { id:'113-5', year:113, number:5, chapter:'協調作用', topic:'副甲狀腺與骨骼', skill:'情境推論', difficulty:'基礎', answer:'A', summary:'判斷副甲狀腺激素的運送方式，以及分泌過多時受影響的骨骼礦物質。', insight:'激素由血液運送；副甲狀腺素會影響血鈣與骨骼中的鈣。', trap:'把激素當成消化液，或把骨骼主要礦物質誤認成鉀。' },
  { id:'113-9', year:113, number:9, chapter:'細胞', topic:'滲透作用', skill:'模型判讀', difficulty:'中等', answer:'A', summary:'高麗菜葉片灑鹽醃漬後，判斷細胞形態變化及水分移動方向。', insight:'外界濃度升高時，水由細胞內移向外界，細胞膜與細胞壁之間會出現空隙。', trap:'把鹽的移動當成主要原因，忽略水分的滲透。' },
  { id:'113-14', year:113, number:14, chapter:'生態', topic:'族群數量變化', skill:'曲線判讀', difficulty:'中等', answer:'B', summary:'根據河川鯰魚族群在四個時期的數量曲線，判斷出生、死亡及環境負荷量。', insight:'曲線上升代表淨增加，下降代表淨減少；平穩不等於沒有出生與死亡。', trap:'把族群數量不變誤解為出生率與死亡率都為零。' },
  { id:'113-22', year:113, number:22, chapter:'植物生理', topic:'形成層與韌皮部', skill:'構造推論', difficulty:'中等', answer:'C', summary:'剔除被子植物形成層外圍構造後根部缺乏養分，判斷植物類型與受損運輸組織。', insight:'形成層常見於雙子葉植物；外圍的韌皮部負責運送有機養分。', trap:'把水分運輸的木質部與養分運輸的韌皮部混淆。' },
  { id:'113-33', year:113, number:33, chapter:'恆定性', topic:'泌尿系統', skill:'圖像判讀', difficulty:'中等', answer:'D', summary:'由泌尿器官及相連血管的氧含量，判斷腎臟功能與血液進出方向。', insight:'腎臟形成尿液並消耗氧；進入腎臟的動脈血含氧量較高。', trap:'把肝臟形成尿素與腎臟形成尿液混為一談。' },
  { id:'113-39', year:113, number:39, chapter:'分類', topic:'二名法', skill:'資訊搜尋', difficulty:'基礎', answer:'C', summary:'利用金毛杜鵑的學名，找出與它同屬但不同種的植物。', insight:'二名法第一個字是屬名，第二個字是種小名。', trap:'把科名Ericaceae或種小名oldhamii誤當成屬名。' },
  { id:'113-41', year:113, number:41, chapter:'營養', topic:'酵素與溫度', skill:'流程判讀', difficulty:'中等', answer:'D', summary:'依加工流程中的溫度變化及酵素失活條件，判斷產物量最接近的兩個時間點。', insight:'超過失活溫度後，酵素不再催化，產物量不再因該酵素作用而增加。', trap:'認為降溫後已變性的酵素一定能恢復活性。' },
  { id:'113-42', year:113, number:42, chapter:'環境', topic:'食蛇龜保育', skill:'文本理解', difficulty:'基礎', answer:'C', summary:'根據保育文本，判斷食蛇龜過去野外數量下降的主要原因。', insight:'從文本中的捕捉與交易資訊辨認「過度捕捉」壓力。', trap:'看到保育議題就選棲地破壞，沒有回到文本證據。' },
  { id:'113-43', year:113, number:43, chapter:'環境', topic:'IUCN風險分類', skill:'流程判讀', difficulty:'中等', answer:'D', summary:'依IUCN物種滅絕風險流程，判斷食蛇龜所屬的受脅程度。', insight:'易危、瀕危與極危都屬於生存受脅的分類範圍。', trap:'把「尚未滅絕」誤判成低風險。' },

  { id:'114-3', year:114, number:3, chapter:'生態', topic:'種間交互作用', skill:'文本理解', difficulty:'基礎', answer:'A', summary:'由白尾八哥與麻雀爭奪巢位、食物及捕食幼鳥的資訊，判斷兩種交互作用。', insight:'共享有限資源是競爭；一方捕食另一方是掠食。', trap:'把同時出現在同一棲地誤判成共生。' },
  { id:'114-8', year:114, number:8, chapter:'植物生理', topic:'光合作用與呼吸', skill:'情境推論', difficulty:'基礎', answer:'A', summary:'比較蘆筍受光的綠色部位與未受光白色部位所釋出的氣體。', insight:'綠色受光部位可行光合作用釋氧；兩部位都可呼吸並產生二氧化碳。', trap:'以為植物只有在黑暗中才進行呼吸作用。' },
  { id:'114-12', year:114, number:12, chapter:'協調作用', topic:'神經傳導路徑', skill:'表格判讀', difficulty:'中等', answer:'C', summary:'比較看見明星後尖叫或追跑兩種行為的受器、動器、中樞與神經傳導。', insight:'視覺訊息由眼的受器接收，大腦整合後經運動神經控制骨骼肌。', trap:'把受器、動器或傳入與傳出神經的位置互換。' },
  { id:'114-20', year:114, number:20, chapter:'協調作用', topic:'餐後血糖曲線', skill:'圖表判讀', difficulty:'中等', answer:'B', summary:'比較食用兩種食物後的血糖曲線，推論胰島素開始增加的先後。', insight:'血糖越早升高，越早刺激胰島素分泌。', trap:'把血糖上升配對成升糖素增加。' },
  { id:'114-22', year:114, number:22, chapter:'植物生理', topic:'蒸散與木質部', skill:'圖像判讀', difficulty:'中等', answer:'C', summary:'依植物莖部剖面選出測量蒸散速率時應探測的運輸部位。', insight:'蒸散拉力帶動木質部水柱運輸，測量水分移動可反映蒸散速率。', trap:'選擇運送有機養分的韌皮部。' },
  { id:'114-24', year:114, number:24, chapter:'分類', topic:'鳥類分類階層', skill:'表格判讀', difficulty:'進階', answer:'A', summary:'由部分鳥類的分類資料，推論最多可能包含的目與屬數量。', insight:'同科必同目；資料未提供到屬時，只能依階層包含關係求上限。', trap:'把每個物種都直接當成不同屬或不同目。' },
  { id:'114-30', year:114, number:30, chapter:'遺傳', topic:'顯隱性遺傳', skill:'邏輯推論', difficulty:'進階', answer:'A', summary:'由黑眼孔雀魚親代及紅、黑眼子代表現，推論親子代可能的遺傳因子組合。', insight:'出現隱性表現型子代，表示雙親必須各自提供一個隱性遺傳因子。', trap:'看到黑眼表現型便判定基因型一定是AA。' },
  { id:'114-34', year:114, number:34, chapter:'分類', topic:'生物界特徵', skill:'比較判讀', difficulty:'中等', answer:'D', summary:'比較兩種生物的細胞構造與營養方式，判斷分屬真菌界或原核生物界。', insight:'有無細胞核是區分原核與真核的重要線索；真菌為異營真核生物。', trap:'只依能否移動或外觀判斷生物界。' },
  { id:'114-35', year:114, number:35, chapter:'生殖', topic:'細胞分裂與生長', skill:'模型判讀', difficulty:'中等', answer:'A', summary:'比較葉片繁殖幼苗與種子萌芽生長過程所進行的細胞分裂方式。', insight:'兩者形成與生長幼苗的過程都主要靠有絲分裂增加細胞數。', trap:'因種子來自有性生殖，就認為萌芽過程仍在減數分裂。' },
  { id:'114-36', year:114, number:36, chapter:'營養', topic:'澱粉酵素檢測', skill:'實驗判讀', difficulty:'進階', answer:'A', summary:'利用碘液與本氏液檢測結果，判斷哪組澱粉酶已完全失去作用。', insight:'澱粉仍在且沒有還原糖產生，表示澱粉酶未能分解澱粉。', trap:'只看其中一種試劑，沒有交叉判斷受質與產物。' },
  { id:'114-43', year:114, number:43, chapter:'科學探究', topic:'溫度與蒜頭變色', skill:'實驗數據', difficulty:'中等', answer:'D', summary:'比較不同低溫預處理及轉至25℃後的蒜頭變色比例，判斷溫度影響。', insight:'先低溫處理再升至25℃會加快後續變色，須依實驗組比較而非生活經驗。', trap:'把低溫期間沒有變色解讀成低溫完全沒有作用。' },
  { id:'114-44', year:114, number:44, chapter:'科學探究', topic:'酸性環境與變色', skill:'控制變因', difficulty:'進階', answer:'C', summary:'在相同pH下比較不同溶液對蒜頭變色的影響，推論有利條件。', insight:'pH已控制相同，差異應由其他化學特徵推論，而非酸性強弱。', trap:'忽略所有溶液pH都相同，仍以酸性強弱作答。' },
  { id:'114-45', year:114, number:45, chapter:'循環', topic:'出血時間檢查', skill:'資料判讀', difficulty:'中等', answer:'D', summary:'由濾紙血跡紀錄與參考範圍，判斷出血時間是否異常及可能原因。', insight:'將最後一次仍有血跡的時間與參考範圍比較，再判斷凝血異常。', trap:'只計算血跡數量，沒有換算每次間隔30秒。' },
  { id:'114-46', year:114, number:46, chapter:'循環', topic:'血小板與凝血', skill:'概念辨識', difficulty:'基礎', answer:'D', summary:'依出血時間異常的情境，判斷參與凝血的血液成分。', insight:'血小板參與止血與凝血反應；紅血球主要運輸氣體。', trap:'看到血液疾病便選白血球或紅血球。' },

  { id:'115-6', year:115, number:6, chapter:'細胞', topic:'顯微尺度', skill:'比例判讀', difficulty:'中等', answer:'D', summary:'比較斑馬魚幼魚、構造及病毒大小，判斷顯微鏡畫面中的灰色斑塊。', insight:'先用尺度排除蛋白質與病毒，再比較細胞與粒線體的典型大小。', trap:'只憑畫面形狀猜測，沒有使用比例尺。' },
  { id:'115-10', year:115, number:10, chapter:'協調作用', topic:'中樞神經系統', skill:'圖像判讀', difficulty:'中等', answer:'A', summary:'依人體中樞神經系統示意圖，判斷聽到槍聲後起跑涉及的神經系統功能。', insight:'先分辨大腦、小腦、腦幹與脊髓，再把聽覺、平衡、呼吸調節逐一配對。', trap:'把小腦的平衡功能與大腦的感覺形成混淆。' },
  { id:'115-11', year:115, number:11, chapter:'呼吸', topic:'呼吸運動', skill:'圖像判讀', difficulty:'中等', answer:'C', summary:'比較盡力吸氣與呼氣後的肺容量，判斷橫膈和肋骨的運動。', insight:'呼氣時橫膈上升、肋骨下降，胸腔體積減少。', trap:'把肺容量改變當成肺主動拉動胸腔。' },
  { id:'115-13', year:115, number:13, chapter:'生殖', topic:'玉米育種', skill:'文本推論', difficulty:'基礎', answer:'B', summary:'由人類長期選擇玉米植株雜交的過程，判斷生殖方式與親子差異。', insight:'花是生殖器官；雜交屬有性生殖，子代基因型與表現型可能不同。', trap:'把農業繁殖一概視為營養器官的無性生殖。' },
  { id:'115-20', year:115, number:20, chapter:'恆定性', topic:'排泄器官類比', skill:'功能推論', difficulty:'基礎', answer:'C', summary:'由蝦子觸角腺過濾體液、再吸收並排出含氮廢物的功能，類比人體器官。', insight:'過濾、再吸收與排出含氮廢物對應腎臟形成尿液的功能。', trap:'把排出路徑的尿道誤認為實際進行過濾的器官。' },
  { id:'115-21', year:115, number:21, chapter:'生態', topic:'捉放法', skill:'數據推論', difficulty:'中等', answer:'D', summary:'以50隻標記鯉魚及再次捕捉結果，估算魚池內黑色鯉魚的可能數量。', insight:'捉放法是估計值，不是實際清點；標記比例可用來反推族群大小。', trap:'算出總數後忘記扣除放入的紅色標記魚。' },
  { id:'115-24', year:115, number:24, chapter:'植物生理', topic:'光合作用反應物', skill:'概念整合', difficulty:'基礎', answer:'D', summary:'由光合作用反應式判斷各物質來源，並比較它們與呼吸作用的關係。', insight:'光合作用產生的氧氣與葡萄糖，都可成為呼吸作用的反應物。', trap:'把氧氣誤認為呼吸作用產物。' },
  { id:'115-25', year:115, number:25, chapter:'遺傳', topic:'遺傳機率模擬', skill:'機率推論', difficulty:'中等', answer:'B', summary:'以黑白棋模擬兩個雜合親代配子，估計100次配對中黑、白毛子代數量。', insight:'Aa×Aa的表現型期望比約為3:1，100次結果應接近75比25。', trap:'把基因型1:2:1直接當成表現型比例。' },
  { id:'115-29', year:115, number:29, chapter:'分類', topic:'種子植物特徵', skill:'特徵推論', difficulty:'基礎', answer:'C', summary:'由藥用植物具有葉、花與帶翅種子的描述，推論其繁殖構造。', insight:'具有花與種子表示是被子植物，受精後子房可發育成果實。', trap:'看到帶翅種子便誤判為具有毬果的裸子植物。' },
  { id:'115-37', year:115, number:37, chapter:'營養', topic:'蛋白質消化酵素', skill:'曲線判讀', difficulty:'中等', answer:'B', summary:'由蛋白質下降、分解產物上升的濃度曲線，推論酵素來源與催化方向。', insight:'胰液含有分解蛋白質的酵素；酵素催化受質轉成產物。', trap:'把不含消化酵素的膽汁選為來源。' },
  { id:'115-39', year:115, number:39, chapter:'循環', topic:'血液回心路徑', skill:'路徑推論', difficulty:'中等', answer:'D', summary:'判斷從肺臟與肝臟流出的血液，分別先進入心臟哪個腔室。', insight:'肺靜脈回左心房；肝靜脈經大靜脈回右心房，因此兩個說法皆錯。', trap:'把「流出器官」誤當成動脈，或跳過心房直接進心室。' },
  { id:'115-44', year:115, number:44, chapter:'植物生理', topic:'蒸散速率', skill:'圖表判讀', difficulty:'中等', answer:'C', summary:'由植物一整天每小時氣泡移動距離，判斷平均蒸散速率的時段差異。', insight:'同樣一小時內移動距離越長，表示該時段平均蒸散速率越大。', trap:'把某一時刻的累積位置誤當成該小時速率。' },
  { id:'115-45', year:115, number:45, chapter:'植物生理', topic:'蒸散實驗推論', skill:'實驗推論', difficulty:'進階', answer:'D', summary:'把蒸散裝置移到通風乾燥室內兩天，判斷最不可能出現的氣泡移動情形。', insight:'水主要由根吸收並向上運輸，氣孔不會吸水後再向下輸送。', trap:'忽略植物體內水分運輸的主要方向。' },
];

const passRates: Record<string, number> = {
  '112-1': 0.7966, '112-4': 0.8023, '112-8': 0.6598, '112-14': 0.5564, '112-16': 0.5952,
  '112-20': 0.6487, '112-22': 0.6905, '112-31': 0.5018, '112-39': 0.4689,
  '113-5': 0.8134, '113-9': 0.7433, '113-14': 0.7167, '113-22': 0.5697, '113-33': 0.4968,
  '113-39': 0.6545, '113-41': 0.3823, '113-42': 0.8642, '113-43': 0.8412,
  '114-3': 0.90, '114-8': 0.68, '114-12': 0.70, '114-20': 0.55, '114-22': 0.65,
  '114-24': 0.56, '114-30': 0.63, '114-34': 0.53, '114-35': 0.33, '114-36': 0.42,
  '114-43': 0.59, '114-44': 0.42, '114-45': 0.65, '114-46': 0.72,
};

const rateSources: Record<number, string> = {
  112: 'https://www.cpjh.cyc.edu.tw/modules/tadnews/index.php?nsn=11935',
  113: 'https://www.cpjh.cyc.edu.tw/modules/tadnews/index.php?nsn=12721',
  114: 'https://www.cpjh.ntpc.edu.tw/app/index.php?Action=downloadfile&file=WVhSMFlXTm9MekV2Y0hSaFh6STBPVGcxWHpRd09EZ3hOREpmTXpFM05ESXVjR1Jt&fname=0054RPA0IC44VXMPA4XS54SXVW30B425RKNOYSMPNPJDOKA5SWJCA0LLECHGVWQKWWTSJD05JCZSNK14XSMOUW30RKMOMPWSGGJDQPROSWB0CDFG5000UWFCLOPOPLZXVSNOUWLOVWB4JGXSSSMOYWMP4135UTSSROUSKOECFGTSYSPKROXW21XXTSPOJCWWDCJGVXNP20RORKNPZTVX30B514YWJGA4DGDCVWDCNO00XXHDHCLKJGYWPKMOVXLK',
};

const contentById = new Map<string, (typeof questionContent)[number]>(questionContent.map((item) => [item.id, item]));

function rateAnalysis(errorRate: number | null) {
  if (errorRate === null) return '目前未取得公開的全國逐題通過率，暫不判定統計難度。';
  if (errorRate < 0.25) return '多數考生能正確作答，可作為基礎概念與快速複習題。';
  if (errorRate <= 0.45) return '具有一定鑑別度，建議留意題幹轉譯、圖表判讀與概念連結。';
  return '全國答錯率偏高，建議列為優先精讀題，並回看常見誤區。';
}

export const questions: Question[] = analysisQuestions.map((analysis) => {
  const content = contentById.get(analysis.id);
  const passRate = passRates[analysis.id] ?? null;
  const errorRate = passRate === null ? null : Number((1 - passRate).toFixed(4));
  const statisticalDifficulty = errorRate === null ? '待統計' : errorRate < 0.25 ? '低' : errorRate <= 0.45 ? '中' : '高';
  const prompt = content?.prompt ?? analysis.summary;
  return {
    ...analysis,
    prompt,
    options: content?.options ?? [],
    hasVisualMaterial: /圖\(|表\(|本文|上述|實驗[一二三四]/.test(prompt),
    passRate,
    errorRate,
    statisticalDifficulty,
    rateStatus: passRate === null ? '尚未取得' : '全國統計',
    rateSource: passRate === null ? null : rateSources[analysis.year],
    rateAnalysis: rateAnalysis(errorRate),
  };
});

export const chapters = ['全部章節', ...Array.from(new Set(questions.map((question) => question.chapter)))];
