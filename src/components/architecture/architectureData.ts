import type { Edge, Node } from '@xyflow/react';

export type ArchitectureNodeData = {
  label: string;
  kind: 'page' | 'component' | 'context' | 'hook' | 'domain' | 'service' | 'infra';
  path: string;
  description: string;
  responsibilities: string[];
  highlights: string[];
  status?: 'current' | 'issue' | 'proposed';
  observation?: string;
  direction?: string;
  code?: string;
};

export type ArchitectureView = {
  id: string;
  label: string;
  subtitle: string;
  nodes: Node<ArchitectureNodeData>[];
  edges: Edge[];
};

type NodeOptions = Omit<ArchitectureNodeData, 'label' | 'kind' | 'path' | 'description' | 'responsibilities' | 'highlights'>;

const node = (
  id: string, label: string, kind: ArchitectureNodeData['kind'], path: string,
  x: number, y: number, description: string, responsibilities: string[], highlights: string[],
  options: NodeOptions = {},
): Node<ArchitectureNodeData> => ({
  id, position: { x, y }, type: 'architecture',
  data: { label, kind, path, description, responsibilities, highlights, status: 'current', ...options },
});

const edge = (source: string, target: string, label?: string, animated = false): Edge => ({
  id: `${source}-${target}-${label ?? ''}`, source, target, label, type: 'smoothstep', animated,
});

const systemNodes = [
  node('user', '內部使用者', 'page', 'AE / PM / Finance', 20, 180, '廣告業務、專案管理與財務人員透過同一套系統完成委刊作業。', ['建立與維護委刊', '送審與狀態追蹤', 'Cue、合約與財務流程'], ['Business users']),
  node('app', 'Campaign Frontend', 'component', 'Next.js 15 · Pages Router', 300, 180, '企業委刊管理前台，串連案件、權限、客戶資料與後續執行流程。', ['38 Pages', '135 Components', '50 Hooks'], ['React 19', 'Ant Design']),
  node('campaign-api', 'Campaign API', 'service', '/campaign/*', 610, 40, '委刊建立、查詢、更新與審核的主要後端邊界。', ['Campaign CRUD', 'Review workflow', 'Status transition'], ['REST API']),
  node('auth-api', 'Auth & Permission', 'service', '/js_auth/*', 610, 180, '提供登入、Token 與功能權限資訊。', ['Authentication', 'Permission query'], ['JWT']),
  node('internal-api', 'Internal Data', 'service', 'CRM / Reference Data', 610, 320, '提供員工、客戶、產品線與列舉等跨系統資料。', ['Employees', 'Customers', 'Reference options'], ['Cross-system data']),
  node('query-cache', 'React Query Cache', 'infra', 'QueryClient', 900, 180, '協調查詢快取、重新請求與 mutation 狀態。', ['Query cache', 'Mutation lifecycle', 'DevTools'], ['TanStack Query']),
];

const layerNodes = [
  node('pages', 'Pages', 'page', 'src/pages/', 40, 40, '頁面入口，組裝資料來源、操作方法與畫面元件。', ['決定頁面模式', '組合 hooks 與 components', '處理路由'], ['38 files']),
  node('components', 'Components', 'component', 'src/components/', 350, 40, '負責畫面、表單與使用者操作。', ['顯示資料', '表單互動', '共用編輯介面'], ['135 files']),
  node('contexts', 'Contexts', 'context', 'src/contexts/', 660, 40, '管理全站或功能範圍的共用狀態。', ['Loading / Error', 'Employees / Permission', 'Campaign detail'], ['12 files']),
  node('hooks', 'Hooks', 'hook', 'src/hooks/', 40, 270, '以 React Query 封裝資料存取與操作生命週期。', ['Query 與 Mutation', '快取與重新請求', '成功與錯誤處理'], ['50 files']),
  node('domains', 'Domains', 'domain', 'src/domains/', 350, 270, '承接搜尋轉換、金額計算與 presentation 邏輯。', ['CampaignFilter', 'TotalCalculate', 'Presenter'], ['15 files'], { observation: '部分 Domain 仍直接依賴 React、Ant Design 或 Component，因此尚未完全與 UI 分離。' }),
  node('services', 'Services', 'service', 'src/services/', 660, 270, '定義 HTTP 請求與少數跨 API 流程。', ['Request boundary', 'Response mapping', 'API composition'], ['27 files']),
  node('types', 'Types / Enums', 'domain', 'src/types/ · src/enums/', 40, 500, '跨層共用的資料契約與狀態定義。', ['API payload', 'UI model', 'Workflow status'], ['57 files']),
  node('axios', 'HTTP Client', 'infra', 'src/utils/axios.ts', 660, 500, '統一 API URL、Token、FormData 與 401 行為。', ['Request interceptor', 'Response interceptor', 'Auth redirect'], ['Axios']),
];

const listNodes = [
  node('search-table', 'SearchTable', 'component', 'components/campaign/list/SearchTable.tsx', 20, 170, '接收搜尋條件並顯示委刊列表。', ['搜尋表單', '結果表格', '使用者操作'], ['UI boundary']),
  node('list-page', 'Campaign List Page', 'page', 'pages/campaign-list/index.tsx', 280, 170, '協調表單、查詢與顯示資料，也是目前責任最集中的節點。', ['管理 filter 與 pagination', '取得員工／客戶／狀態', '組合列表顯示資料'], ['Page composition'], { observation: '頁面同時執行 ID 對照、日期格式化、欄位設定與查詢協調，已超出單純組裝責任。', direction: '抽出 useCampaignListView 或 presenter，讓 Page 只負責協調。' }),
  node('payload', 'SearchPayload', 'domain', 'domains/campaign/SearchPayload.ts', 550, 40, '將表單欄位轉換成後端接受的 CampaignFilter。', ['日期區間', '多選 ID', 'Relation filter'], ['Stateful singleton'], { observation: '以 singleton 保存可變狀態，並且未使用專案既有的 SingletonBase。', direction: '改成無狀態純函式，或每次建立獨立 instance。' }),
  node('query', 'useCampaignListQuery', 'hook', 'hooks/campaign/useCampaignListQuery.ts', 550, 270, '使用 React Query 管理列表請求與快取。', ['Query key', 'staleTime', 'Refetch options'], ['TanStack Query'], { observation: 'sort_by 與 sort_order 有傳入 queryFn，卻未進入 queryKey。', direction: '將所有會改變結果的參數納入 query key。', code: `useQuery({
  queryKey: ['campaign_list', filter, page, perPage],
  queryFn: () => readList(filter, page, perPage),
})` }),
  node('service', 'Campaign Service', 'service', 'services/campaign/index.ts', 820, 270, '整理查詢參數並呼叫委刊 API。', ['readList', 'createCampaign', 'updateAndReviewCampaign'], ['HTTP boundary']),
  node('http', 'Axios Client', 'infra', 'utils/axios.ts', 820, 500, '套用 Token、Content-Type 與 401 處理。', ['Bearer token', 'FormData', 'Unauthorized redirect'], ['Shared client']),
  node('view', 'List View Model', 'domain', 'Proposed: useCampaignListView', 280, 460, '集中將員工、客戶、狀態與日期轉換成表格需要的資料。', ['ID → label', 'Date formatting', 'Table row mapping'], ['Proposed'], { status: 'proposed', direction: '讓資料合併可獨立測試，也讓頁面恢復為 orchestration layer。' }),
];

const editorNodes = [
  node('create-page', 'Create Page', 'page', 'campaign-create/index.tsx', 30, 80, '選擇 Create 模式與 create mutation。', ['Create mode', 'useCreateCampaignMutation'], ['Thin page']),
  node('edit-page', 'Edit Page', 'page', 'campaign-edit/[id]/index.tsx', 30, 330, '選擇 Update 模式、更新與送審 mutation。', ['Update mode', 'Disabled fields', 'Review mutation'], ['28 lines']),
  node('editor', 'CampaignEditorPage', 'component', 'components/campaign/editor/Main.tsx', 360, 200, '新增與編輯共用的核心編輯畫面。', ['表單與 UI', '依模式切換行為', '呼叫傳入的 mutation'], ['Reusable component'], { code: `<CampaignEditorPage
  editStatus={CampaignEditStatus.Update}
  mutation={{ mutate: updateCampaign }}
  reviewMutation={{ mutate: updateCampaignToReview }}
  disabledSet={['agent', 'client', 'ae']}
/>` }),
  node('create-hook', 'Create Mutation', 'hook', 'hooks/campaign/useCreateCampaignMutation.ts', 700, 80, '封裝新增流程、loading、訊息、錯誤與導頁。', ['POST campaign', 'Success message', 'Redirect to list'], ['Mutation lifecycle']),
  node('update-hook', 'Update Mutation', 'hook', 'hooks/campaign/useUpdateCampaignMutation.ts', 700, 270, '封裝更新委刊操作。', ['PATCH campaign', 'Loading state', 'Error modal'], ['Mutation lifecycle']),
  node('review-hook', 'Review Mutation', 'hook', 'hooks/campaign/useUpdateCampaignToReviewMutation.ts', 700, 460, '在更新後將案件送進審核流程。', ['Update then review', 'Error handling'], ['Composed action']),
];

const gapNodes = [
  node('query-a', 'QueryClient A', 'infra', 'pages/_app.tsx', 30, 40, '最外層建立的 QueryClient，React Query DevTools 讀取此實例。', ['Outer Provider', 'DevTools'], ['Issue 01'], { status: 'issue', observation: '應用程式查詢不在這個 cache。', direction: '移除重複 Provider，保留單一 QueryClient。' }),
  node('query-b', 'QueryClient B', 'infra', 'contexts/RootContext.tsx', 340, 40, 'RootProviders 內建立的第二個 QueryClient，實際頁面查詢使用此實例。', ['Inner Provider', 'Application cache'], ['Issue 01'], { status: 'issue', observation: 'DevTools 與實際 query cache 分離。', direction: '將設定合併回應用根節點。' }),
  node('reverse', 'Context → Component', 'context', 'CampaignInfoContext.tsx', 650, 40, 'Context 從 SearchTable 匯入 convertEnumToOptions。', ['Reversed dependency'], ['Issue 02'], { status: 'issue', observation: '狀態層反向依賴 UI 層。', direction: '將轉換函式移到 utils 或 mapper。' }),
  node('heavy-page', 'Heavy Campaign Page', 'page', 'campaign-list/index.tsx', 30, 300, 'Page 同時負責 query orchestration 與 view-model transformation。', ['Data joins', 'Date formatting', 'Column definitions'], ['Issue 03'], { status: 'issue', observation: '改動顯示格式時必須進入頁面核心流程。', direction: '抽出 view hook / presenter。' }),
  node('singleton', 'Mutable SearchPayload', 'domain', 'domains/campaign/SearchPayload.ts', 340, 300, 'Singleton 內保存 payload 與 filterPayload。', ['Shared mutable state'], ['Issue 04'], { status: 'issue', observation: '不同使用情境可能共用並覆寫狀態。', direction: '以純函式轉換輸入與輸出。' }),
  node('errors', 'Repeated Error Flow', 'hook', '23 mutation hooks', 650, 300, '多個 mutation 重複 Axios error 判斷與 showError。', ['axios.isAxiosError', 'showError'], ['Issue 05'], { status: 'issue', observation: '錯誤規則散落並逐漸不一致。', direction: '擴充既有 handler，統一解析與呈現。' }),
];

const targetNodes = [
  node('target-page', 'Page', 'page', 'Route orchestration', 20, 190, '只保留頁面模式、路由與高階組裝。', ['Mode', 'Route params', 'Composition'], ['Target']),
  node('view-hook', 'View Hook', 'hook', 'useCampaignListView', 270, 190, '協調 queries 並輸出畫面直接使用的 view model。', ['Query composition', 'View model', 'UI state'], ['Proposed'], { status: 'proposed' }),
  node('pure-domain', 'Pure Domain', 'domain', 'campaign/filter · presenter', 520, 60, '不依賴 React 或 Ant Design 的純規則。', ['Filter mapping', 'Calculation', 'Presentation mapping'], ['Testable'], { status: 'proposed' }),
  node('query-hook', 'Query / Mutation', 'hook', 'src/hooks/', 520, 320, '統一快取 key、操作生命週期與錯誤處理。', ['Query key factory', 'Shared error handler', 'Invalidation'], ['Consistent']),
  node('target-service', 'Service', 'service', 'src/services/', 780, 190, '維持清楚的 HTTP 與跨 API 邊界。', ['Request', 'Response', 'API composition'], ['Infrastructure boundary']),
  node('target-http', 'HTTP Client', 'infra', 'src/utils/axios.ts', 1020, 190, '集中 transport concern，不滲入 UI 與 domain。', ['Auth', 'Headers', 'Global response'], ['Single client']),
];

export const architectureViews: ArchitectureView[] = [
  { id: 'system', label: '系統範圍', subtitle: '使用者、前端與外部服務', nodes: systemNodes, edges: [edge('user', 'app', 'operate'), edge('app', 'campaign-api'), edge('app', 'auth-api'), edge('app', 'internal-api'), edge('campaign-api', 'query-cache'), edge('auth-api', 'query-cache'), edge('internal-api', 'query-cache')] },
  { id: 'layers', label: '分層模型', subtitle: '實際目錄與主要責任', nodes: layerNodes, edges: [edge('pages', 'components'), edge('pages', 'hooks'), edge('components', 'contexts'), edge('hooks', 'domains'), edge('hooks', 'services'), edge('services', 'axios')] },
  { id: 'list-flow', label: '委刊列表', subtitle: '搜尋條件到表格資料的完整流程', nodes: listNodes, edges: [edge('search-table', 'list-page'), edge('list-page', 'payload', 'form values'), edge('list-page', 'query'), edge('query', 'service'), edge('service', 'http'), edge('list-page', 'view', 'proposed'), edge('view', 'search-table')] },
  { id: 'editor', label: '新增／編輯', subtitle: '共用編輯器與行為注入', nodes: editorNodes, edges: [edge('create-page', 'editor'), edge('edit-page', 'editor'), edge('editor', 'create-hook'), edge('editor', 'update-hook'), edge('editor', 'review-hook')] },
  { id: 'gaps', label: '架構落差', subtitle: '理想分層與真實依賴的差距', nodes: gapNodes, edges: [edge('query-a', 'query-b', 'duplicate'), edge('query-b', 'reverse', 'dependency'), edge('heavy-page', 'singleton'), edge('singleton', 'errors')] },
  { id: 'target', label: '改善方向', subtitle: '不重寫，漸進收斂責任', nodes: targetNodes, edges: [edge('target-page', 'view-hook'), edge('view-hook', 'pure-domain'), edge('view-hook', 'query-hook'), edge('query-hook', 'target-service'), edge('target-service', 'target-http')] },
];

export const explorerSteps = [
  { id: 'layers', label: '架構總覽', view: 'layers', focus: 'pages' },
  { id: 'list', label: '委刊列表', view: 'list-flow', focus: 'list-page' },
  { id: 'gaps', label: '設計問題', view: 'gaps', focus: 'query-a' },
  { id: 'target', label: '新增功能', view: 'target', focus: 'view-hook' },
];
