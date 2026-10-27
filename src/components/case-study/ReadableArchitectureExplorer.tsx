import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Braces, Database, FileCode2, Layers3, Network, Workflow } from 'lucide-react';

type NodeData = {
  label: string;
  path: string;
  type: string;
  color: string;
  description: string;
  responsibilities: string[];
  usage?: { label: string; purpose: string }[];
  usedBy?: string[];
  groupsLabel?: string;
  groups?: { title: string; description: string; items: string[] }[];
  principlesLabel?: string;
  principles?: string[];
  structure?: string[];
  boundary?: string;
  code?: string;
};

const icons = { Pages: FileCode2, Components: Box, Contexts: Layers3, Hooks: Workflow, Domains: Braces, Types: Database, Services: Database, Infrastructure: Network };

const nodes: Node<NodeData>[] = [
  { id: 'pages', type: 'readable', position: { x: 330, y: 30 }, data: {
    label: 'pages/', path: 'pages/campaign-list/index.tsx', type: 'Pages', color: 'blue',
    description: 'pages 是每道菜的食譜：一個網址對應一個畫面，寫明要用哪些食材（資料）、怎麼擺盤（元件），但不負責種菜或煮醬（API 和商業邏輯）。',
    responsibilities: ['對應網址與讀取案件參數', '組合頁面元件', '透過 hooks 接上資料與操作', '設定新增／編輯模式與欄位權限', '管理分頁、搜尋條件與表單狀態'],
    usage: [
      { label: 'components', purpose: '組合畫面' },
      { label: 'hooks', purpose: '取得資料與操作' },
      { label: 'types', purpose: '描述資料型別' },
      { label: 'utils', purpose: '使用通用工具' },
      { label: 'contexts', purpose: '取得共用狀態' },
      { label: 'enums', purpose: '使用固定選項' },
      { label: 'domains', purpose: '執行商業規則' },
    ],
    boundary: 'pages 從不直接呼叫 services；所有 API 操作一律經過 hooks。',
  } },
  { id: 'components', type: 'readable', position: { x: 660, y: 30 }, data: {
    label: 'components/', path: 'components/campaign/', type: 'Components', color: 'green',
    description: 'components 是餐廳的「廚師和擺盤」：照著食譜（pages）把食材（資料）做成使用者看得到的畫面，並處理點擊、輸入與送出等操作。',
    responsibilities: ['呈現表單、表格、卡片與按鈕', '處理點擊、輸入、送出與上傳', '執行表單驗證、欄位連動與即時計算', '依照權限顯示或隱藏功能', '依設定動態產生對應欄位', '將小元件組合成 pages 可使用的大元件'],
    usage: [
      { label: 'types', purpose: '定義元件接收的資料格式' },
      { label: 'contexts', purpose: '取得共用資料、權限與提示功能' },
      { label: 'other components', purpose: '由小元件組成完整畫面' },
      { label: 'enums', purpose: '使用狀態與欄位類型等固定選項' },
      { label: 'hooks', purpose: '取得元件需要的資料或存檔動作' },
      { label: 'domain result', purpose: '接收頁面組裝後提供的規則結果' },
      { label: 'utils', purpose: '使用日期格式等通用工具' },
      { label: 'antd / react-icons', purpose: '使用基本 UI 零件與圖示' },
    ],
    groupsLabel: 'COMPONENT TYPES',
    groups: [
      { title: '通用元件', description: '與業務無關，可跨頁使用', items: ['common', 'table', 'card', 'modals'] },
      { title: '網站外框', description: '每一頁都會使用', items: ['layout', 'auth'] },
      { title: '業務元件', description: '依照功能領域分類', items: ['campaign', 'cue', 'contract', 'dimension', 'salesMethod'] },
    ],
    boundary: '不直接呼叫 API，必須透過 hooks；不決定新增或編輯等頁面模式；複雜商業規則交給 domains。',
  } },
  { id: 'contexts', type: 'readable', position: { x: 0, y: 240 }, data: {
    label: 'contexts/', path: 'contexts/RootContext.tsx', type: 'Contexts', color: 'purple',
    description: 'contexts 是餐廳的「公告欄」：大家都需要知道的事集中放在這裡，誰需要就自己查看，不必再由頁面一層一層往下傳。',
    responsibilities: ['集中保存跨畫面共用的資料', '讓深層元件直接取用，減少 props 傳遞', '提供一致的 loading、訊息與錯誤提示', '依照全站或單一頁面劃定共用範圍'],
    usage: [
      { label: 'hooks', purpose: '取得員工、權限與目前案件等共用資料' },
      { label: 'types', purpose: '定義共用資料格式' },
      { label: 'enums', purpose: '提供固定選項與顯示規則' },
      { label: 'utils', purpose: '取得 token 與系統設定' },
      { label: 'React / antd', purpose: '建立 context、保存狀態與顯示提示' },
    ],
    groupsLabel: 'CONTEXT SCOPE',
    groups: [
      { title: '全站提示', description: '任何位置都能呼叫', items: ['Loading', 'Message', 'Error Modal'] },
      { title: '全站共用資料', description: '登入後載入一次', items: ['Employees', 'Permission'] },
      { title: '頁面級資料', description: '只包住需要的頁面', items: ['Campaign Info', 'Amount', 'Disabled Set', 'Financial Report', 'Receipt'] },
    ],
    boundary: '不直接呼叫 API，資料存取必須透過 hooks；也不負責畫面排版。RootContext 本身不存資料，只負責組合全站 Provider。',
  } },
  { id: 'hooks', type: 'readable', position: { x: 330, y: 240 }, data: {
    label: 'hooks/', path: 'hooks/campaign/', type: 'Hooks', color: 'red',
    description: 'hooks 是餐廳的「外場經理」：畫面只要提出查詢或操作需求，它就會聯絡 services，並負責處理等待、成功、失敗與完成後的動作。',
    responsibilities: ['Query：取得資料並回傳 loading 狀態', 'Query：管理快取與 queryKey 變更後的重新請求', 'Mutation：新增、更新與刪除資料', 'Mutation：開始與結束時控制全頁 loading', 'Mutation：成功後提示並視需要換頁', 'Mutation：解析後端錯誤並顯示錯誤彈窗'],
    usage: [
      { label: 'services', purpose: '實際與後端 API 溝通' },
      { label: 'React Query', purpose: '管理快取、重抓時機與請求狀態' },
      { label: 'contexts', purpose: '控制全頁 loading 與錯誤彈窗' },
      { label: 'antd message', purpose: '顯示成功或失敗提示' },
      { label: 'Next.js router', purpose: '操作完成後跳轉頁面' },
      { label: 'types', purpose: '定義參數與回傳格式' },
    ],
    usedBy: ['components', 'pages', '部分 contexts'],
    groupsLabel: 'HOOK TYPES',
    groups: [
      { title: 'Query', description: '讀取資料', items: ['useCampaignListQuery', 'useCampaignQuery', 'useDimensionListQuery', 'useContractsQuery', 'useReferenceData', 'useInternalData', 'usePermissionsQuery'] },
      { title: 'Mutation', description: '寫入資料', items: ['useCreateCampaignMutation', 'useUpdateCampaignMutation', 'useUpdateCampaignToReviewMutation', 'useAssignCuePmMutation', 'useUploadCampaignContractMutation', 'useLoginMutation'] },
      { title: '其他流程', description: 'Local workflow', items: ['useFilterManage', 'useLogout', 'handlers'] },
    ],
    boundary: '不定義 API 網址、不撰寫業務規則或資料轉換，也不負責畫面排版；這些責任分別屬於 services、domains 與 components。',
    code: `useQuery({\n  queryKey: ['campaign_list', filter, page, perPage],\n  queryFn: () => readList(filter, page, perPage),\n  staleTime: 500,\n})`,
  } },
  { id: 'domains', type: 'readable', position: { x: 0, y: 30 }, data: {
    label: 'domains/', path: 'domains/', type: 'Domains', color: 'teal',
    description: 'domains 是餐廳的「主廚秘方」：怎麼配料、怎麼算份量、什麼情況該怎麼處理都集中寫在這裡。不管換哪個廚師或使用哪種畫面框架，規則都一樣。',
    responsibilities: ['計算金額、數量與 PM 分配比例', '將畫面輸入轉成後端格式', '將後端資料整理成畫面需要的形式', '比對需要新增、修改或刪除的資料', '判斷單筆資料目前的編輯狀態'],
    usage: [
      { label: 'types', purpose: '定義規則的輸入與輸出格式' },
      { label: 'enums', purpose: '提供欄位類型、計算策略與編輯狀態' },
      { label: 'dayjs', purpose: '執行日期計算' },
    ],
    usedBy: ['pages（組裝後注入 hooks）'],
    groupsLabel: 'DOMAIN CAPABILITIES',
    groups: [
      { title: '計算規則', description: 'Calculation', items: ['TotalCalculate', 'pmEditor'] },
      { title: '送出資料', description: 'Builder', items: ['SearchPayload', 'cleanseFilterPayload', 'CampaignDimensionPayloadBuilder', 'Dimension Create / Update Builder', 'CreateAdjustmentPayloadBuilder'] },
      { title: '畫面資料', description: 'Transformer / Processor', items: ['SalesMethodTransformer', 'InCueTableProcessor', 'formatFlatCue', 'CampaignConverter', 'AdjustedTransformer', 'campaignPresenter', '維度選單與分組', '員工分組'] },
      { title: '編輯狀態', description: 'Presenter', items: ['InCueInfoPresenter', 'OutCueInfoPresenter'] },
      { title: '共用基礎', description: 'Base class', items: ['SingletonBase'] },
    ],
    principles: ['換一套畫面框架後，規則仍然相同，就放進 domains。', '有規則、會重複使用且值得測試，就放進 domains；單純取值或改名留在使用處。'],
    structure: ['campaign', 'cue', 'salesMethod', 'dimension', 'adjustment', 'pm', 'employee', 'SingletonBase.ts'],
    boundary: '純 TypeScript，不依賴 React 或 antd；不呼叫 API、不處理畫面與表單、不管理 loading、提示或換頁，也不收納日期顯示與儲存等通用工具。',
  } },
  { id: 'types', type: 'readable', position: { x: 330, y: 450 }, data: {
    label: 'types / enums/', path: 'types/ · enums/', type: 'Types', color: 'cyan',
    description: 'types 是資料的「規格表」，描述欄位與型別；enums 是「固定選項卡」，定義程式執行時真正使用的狀態、類型與模式。',
    responsibilities: ['types：規範送出、回傳與元件資料格式', 'types：在開發階段提早發現欄位與型別錯誤', 'types：讓資料結構本身成為文件', 'enums：集中管理固定值，避免 magic number', 'enums：與後端共用狀態代碼', 'enums：統一畫面顯示名稱'],
    usage: [
      { label: 'types → enums', purpose: '限制欄位只能使用特定固定值' },
      { label: 'types → other types', purpose: '由小型別組合成完整資料結構' },
      { label: 'enums', purpose: '最底層，不依賴其他專案層' },
    ],
    usedBy: ['pages', 'components', 'contexts', 'hooks', 'domains', 'services', 'utils'],
    groupsLabel: 'DEFINITION TYPES',
    groups: [
      { title: 'Types · 業務資料', description: 'Business models', items: ['Campaign', 'Cue', 'Contract', 'Dimension', 'Adjustment', 'Receipt'] },
      { title: 'Types · API 格式', description: 'Request / Response', items: ['Create payload', 'Campaign filter', 'Login response'] },
      { title: 'Types · 畫面格式', description: 'View models', items: ['Select option', 'Table column', 'Upload panel', 'Menu item'] },
      { title: 'Types · 系統設定', description: 'Application config', items: ['Route', 'Permission', 'Context shape'] },
      { title: 'Enums · 狀態', description: 'Status', items: ['Campaign', 'Contract', 'Review', 'PM confirmation'] },
      { title: 'Enums · 類型', description: 'Type', items: ['Sales field', 'Adjustment action', 'Customer identity'] },
      { title: 'Enums · 模式', description: 'Mode', items: ['Create / Edit', 'Menu position'] },
      { title: 'Enums · 固定值', description: 'Constants', items: ['Currency', 'Color', 'Report display', 'Role'] },
    ],
    principlesLabel: 'ENUM OR BACKEND?',
    principles: ['程式邏輯需要判斷，且改動時應同步修改程式：放在 enums。', '只用於顯示或選擇，且希望後端能獨立調整：透過 useReferenceData 取得。'],
    boundary: '只負責定義，不放業務邏輯、不呼叫 API、不處理畫面。enums 僅保留名稱對照或安全解析等簡單轉換。',
    code: `CampaignStatus              // 對應後端數值\nCampaignStatusDescriptions  // 狀態 → 中文名稱\nparseCampaignStatus()       // 安全解析後端數值`,
  } },
  { id: 'services', type: 'readable', position: { x: 660, y: 240 }, data: {
    label: 'services/', path: 'services/campaign/index.ts', type: 'Services', color: 'orange',
    description: 'services 是餐廳的「採購」：只負責照單去市場（後端）把食材買回來，或把東西送出去。它不管食材怎麼煮、怎麼擺盤，也不在乎誰點了這道菜。',
    responsibilities: ['定義 API 網址、HTTP 方法與參數', '整理篩選條件與分頁等送出參數', '取出 res.data，不處理畫面', '將多支 API 串成存檔並送審等完整動作'],
    usage: [
      { label: 'utils/axios', purpose: '發送請求，統一處理 token 與 401' },
      { label: 'types', purpose: '定義送出與回傳的資料格式' },
      { label: 'enums', purpose: '判斷流程與核准狀態' },
      { label: 'other services', purpose: '將多支 API 組合成一個動作' },
    ],
    boundary: 'services 是前端與後端之間唯一的窗口；不處理 loading、不顯示提示，也不使用 React，這些責任交給 hooks。',
  } },
  { id: 'axios', type: 'readable', position: { x: 660, y: 450 }, data: {
    label: 'utils/axios.ts', path: 'utils/axios.ts', type: 'Infrastructure', color: 'yellow',
    description: 'axios.ts 是餐廳的「外送員」：services 只要說去哪裡、拿什麼，它會自動帶上 token；遇到 401，就清除失效憑證並帶使用者回到重新登入的入口。',
    responsibilities: ['送出請求前自動加入 Bearer token', '上傳 FormData 時交由 axios 判斷格式', '成功回應直接交還 services', '遇到 401 時清除 token 並跳轉', '其他錯誤原樣往上交給 hooks 處理'],
    usage: [
      { label: 'axios', purpose: '建立並送出 HTTP 請求' },
      { label: 'Next.js router', purpose: '收到 401 時跳轉頁面' },
      { label: 'localStorage', purpose: '讀取或清除登入 token' },
      { label: 'environment', purpose: '取得 NEXT_PUBLIC_API_BASE_URL' },
    ],
    usedBy: ['services'],
    groupsLabel: 'HTTP PIPELINE',
    groups: [
      { title: '基本設定', description: 'Shared configuration', items: ['環境變數 API URL', '20 秒 timeout', 'JSON'] },
      { title: 'Request', description: '送出前', items: ['附加 token', '登入 API 例外', 'FormData content type'] },
      { title: 'Response', description: '收到後', items: ['成功直接回傳', '401 清除 token 並跳轉', '其他錯誤向上拋出'] },
    ],
    principlesLabel: 'BEHAVIOR NOTES',
    principles: ['只集中處理登入失效的 401；403、500 等錯誤交由各個 hooks 決定如何呈現。', '後端網址由環境變數控制，切換環境時不需要修改程式。'],
    boundary: '不定義 API 網址、不顯示錯誤或 loading，也不轉換業務資料；這些責任分別屬於 services、hooks／contexts 與 domains。',
  } },
];

const edges: Edge[] = [
  { id: 'pages-components', source: 'pages', target: 'components', sourceHandle: 'right', targetHandle: 'left', label: '組合畫面' },
  { id: 'pages-contexts', source: 'pages', target: 'contexts', sourceHandle: 'bottom-left', targetHandle: 'top', label: '共用資料' },
  { id: 'domains-pages', source: 'domains', target: 'pages', sourceHandle: 'right', targetHandle: 'left', label: '取得規則', data: { kind: 'rule' } },
  { id: 'pages-hooks', source: 'pages', target: 'hooks', sourceHandle: 'bottom', targetHandle: 'top', label: '注入' },
  { id: 'components-hooks', source: 'components', target: 'hooks', sourceHandle: 'bottom-left', targetHandle: 'top-right', label: '資料／操作' },
  { id: 'contexts-hooks', source: 'contexts', target: 'hooks', sourceHandle: 'right', targetHandle: 'left', label: '狀態／提示', animated: true },
  { id: 'hooks-services', source: 'hooks', target: 'services', sourceHandle: 'right', targetHandle: 'left', label: 'API' },
  { id: 'domains-types', source: 'domains', target: 'types', sourceHandle: 'source-left', targetHandle: 'left', label: '型別依賴', data: { kind: 'rule' }, pathOptions: { offset: 64, borderRadius: 18 } },
  { id: 'services-types', source: 'services', target: 'types', sourceHandle: 'bottom-left', targetHandle: 'top-right', label: '資料契約' },
  { id: 'services-axios', source: 'services', target: 'axios', sourceHandle: 'bottom', targetHandle: 'top', label: 'HTTP' },
];

function ReadableNode({ data, selected }: NodeProps) {
  const node = data as NodeData;
  const Icon = icons[node.type as keyof typeof icons] ?? Box;
  return <div className={`readable-node node-${node.color} ${selected ? 'is-selected' : ''}`}>
    <Handle id="top" type="target" position={Position.Top} />
    <Handle id="top-left" type="target" position={Position.Top} style={{ left: '28%' }} />
    <Handle id="top-right" type="target" position={Position.Top} style={{ left: '72%' }} />
    <Handle id="left" type="target" position={Position.Left} />
    <Handle id="source-left" type="source" position={Position.Left} style={{ top: '72%' }} />
    <Icon /><strong>{node.label}</strong>
    <Handle id="right" type="source" position={Position.Right} />
    <Handle id="bottom" type="source" position={Position.Bottom} />
    <Handle id="bottom-left" type="source" position={Position.Bottom} style={{ left: '28%' }} />
    <Handle id="bottom-right" type="source" position={Position.Bottom} style={{ left: '72%' }} />
  </div>;
}

const nodeTypes = { readable: ReadableNode };

export default function ReadableArchitectureExplorer() {
  const [selectedId, setSelectedId] = useState('pages');
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const SelectedIcon = icons[selected.data.type as keyof typeof icons] ?? Box;
  const related = new Set(edges.filter((edge) => edge.source === selectedId || edge.target === selectedId).flatMap((edge) => [edge.source, edge.target]));
  related.add(selectedId);
  const visibleNodes = useMemo(() => nodes.map((node) => ({ ...node, selected: node.id === selectedId, className: related.has(node.id) ? '' : 'is-muted' })), [selectedId]);
  const visibleEdges = useMemo(() => edges.map((edge) => {
    const active = edge.source === selectedId || edge.target === selectedId;
    const isRule = edge.data?.kind === 'rule';
    const activeColor = isRule ? '#16806f' : '#2669ae';
    return { ...edge, className: `${active ? 'is-related' : 'is-muted'} ${isRule ? 'is-rule' : 'is-flow'}`, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: active ? activeColor : '#9caabd' }, style: { stroke: active ? activeColor : '#9caabd', strokeWidth: active ? 2.4 : 1.5, strokeDasharray: isRule ? '7 6' : undefined }, labelStyle: { fill: active ? activeColor : '#8290a3', fontSize: 14, fontWeight: 700 }, labelBgStyle: { fill: '#fffdf7', fillOpacity: .95 } };
  }), [selectedId]);

  const focusNode = (nodeId: string) => {
    setSelectedId(nodeId);
    const focusIds = new Set(edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).flatMap((edge) => [edge.source, edge.target]));
    focusIds.add(nodeId);
    requestAnimationFrame(() => flowInstance?.fitView({
      nodes: nodes.filter((node) => focusIds.has(node.id)),
      padding: nodeId === 'domains' ? .65 : .4,
      duration: 450,
      minZoom: .65,
      maxZoom: 1.05,
    }));
  };

  return <section className="readable-explorer">
    <div className="readable-canvas">
      <header><div><span>CURRENT ARCHITECTURE</span><h2>委刊列表的實際分層與依賴</h2></div><p>點擊節點查看詳細資訊</p></header>
      <div className="readable-flow">
        <ReactFlow nodes={visibleNodes} edges={visibleEdges} nodeTypes={nodeTypes} onInit={setFlowInstance} onNodeClick={(_, node) => focusNode(node.id)} nodesDraggable={false} nodesConnectable={false} elementsSelectable fitView fitViewOptions={{ padding: .12 }} minZoom={.65} maxZoom={1.5} proOptions={{ hideAttribution: true }}>
          <Background color="#b9c9da" gap={22} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
    <aside className="readable-inspector">
      <header><span>NODE INSPECTOR</span><em>{selected.data.type}</em></header>
      <div className={`inspector-title node-${selected.data.color}`}><SelectedIcon /><div><h2>{selected.data.label}</h2><code>{selected.data.path}</code></div></div>
      <p>{selected.data.description}</p>
      <section><span>RESPONSIBILITIES</span><ul>{selected.data.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
      {selected.data.usage && <section><span>ACTUAL DEPENDENCIES</span><div className="inspector-usage">{selected.data.usage.map((item) => <div key={item.label}><code>{item.label}</code><small>{item.purpose}</small></div>)}</div></section>}
      {selected.data.usedBy && <section><span>USED BY</span><div className="inspector-tags">{selected.data.usedBy.map((item) => <code key={item}>{item}</code>)}</div></section>}
      {selected.data.groups && <section><span>{selected.data.groupsLabel ?? 'GROUPS'}</span><div className="inspector-groups">{selected.data.groups.map((group) => <div key={group.title}><header><strong>{group.title}</strong><small>{group.description}</small></header><p>{group.items.join(' · ')}</p></div>)}</div></section>}
      {selected.data.principles && <section><span>{selected.data.principlesLabel ?? 'PLACEMENT RULES'}</span><ol className="inspector-principles">{selected.data.principles.map((item) => <li key={item}>{item}</li>)}</ol></section>}
      {selected.data.structure && <section><span>DIRECTORY</span><div className="inspector-tree"><code>domains/</code>{selected.data.structure.map((item, index) => <code key={item}>{index === selected.data.structure!.length - 1 ? '└──' : '├──'} {item}</code>)}</div></section>}
      {selected.data.boundary && <section className="inspector-note inspector-note--good"><span>BOUNDARY</span><p>{selected.data.boundary}</p></section>}
      {selected.data.code && <section><span>CODE EXAMPLE</span><pre><code>{selected.data.code}</code></pre></section>}
    </aside>
  </section>;
}
