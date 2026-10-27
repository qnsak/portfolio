import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Braces,
  Database,
  FileCode2,
  Layers3,
  Network,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import ReadableArchitectureExplorer from './ReadableArchitectureExplorer';

const architectureNodes = [
  { id: 'pages', label: 'pages/', path: 'pages/campaign-list/index.tsx', type: 'Pages', color: 'blue', description: '組裝 hooks 與 components，決定頁面行為與導頁。', bullets: ['管理搜尋與分頁狀態', '組合員工、客戶與委刊資料', '將操作交給 hooks'], icon: FileCode2 },
  { id: 'components', label: 'components/', path: 'components/campaign/list/SearchTable.tsx', type: 'Components', color: 'green', description: '負責搜尋表單、列表呈現與使用者操作。', bullets: ['顯示表格', '接收搜尋條件', '觸發查詢與編輯操作'], icon: Box },
  { id: 'contexts', label: 'contexts/', path: 'contexts/RootContext.tsx', type: 'Contexts', color: 'purple', description: '提供跨元件共用的員工、權限、Loading 與錯誤狀態。', bullets: ['Employees', 'Permission', 'Loading / Error Modal'], icon: Layers3 },
  { id: 'hooks', label: 'hooks/', path: 'hooks/campaign/useCampaignListQuery.ts', type: 'Hooks', color: 'red', description: '使用 React Query 封裝 API，管理快取、載入與錯誤狀態。', bullets: ['設定 queryKey', '控制 staleTime', '管理 loading / error'], icon: Workflow, code: `useQuery({\n  queryKey: ['campaign_list', filter, page, perPage],\n  queryFn: () => readList(filter, page, perPage),\n  staleTime: 500,\n})` },
  { id: 'domains', label: 'domains/', path: 'domains/campaign/SearchPayload.ts', type: 'Domains', color: 'teal', description: '處理搜尋條件、資料轉換與較複雜的商業規則。', bullets: ['CampaignFilter 轉換', '日期區間', '金額計算'], icon: Braces },
  { id: 'types', label: 'types / enums/', path: 'types/campaign/', type: 'Types', color: 'cyan', description: '定義各層共用的資料契約、Payload 與狀態列舉。', bullets: ['Campaign', 'CampaignFilter', 'Workflow status'], icon: Database },
  { id: 'services', label: 'services/', path: 'services/campaign/index.ts', type: 'Services', color: 'orange', description: '集中 API 呼叫與跨 API 操作，不處理 React 狀態。', bullets: ['readList / create / update', 'updateAndReview', 'HTTP boundary'], icon: Database },
  { id: 'axios', label: 'utils/axios.ts', path: 'utils/axios.ts', type: 'Infrastructure', color: 'yellow', description: '統一處理 Token、FormData 與 401 回應。', bullets: ['Request interceptor', 'Response interceptor', 'Unauthorized redirect'], icon: Network },
];

const stepLabels = ['案件系統', '規模化問題', '架構解法', '架構探索'];

const diagramPositions: Record<string, { left: string; top: string }> = {
  pages: { left: '25%', top: '14%' },
  components: { left: '75%', top: '14%' },
  contexts: { left: '25%', top: '41%' },
  hooks: { left: '75%', top: '41%' },
  domains: { left: '14%', top: '70%' },
  types: { left: '40%', top: '70%' },
  services: { left: '75%', top: '68%' },
  axios: { left: '75%', top: '90%' },
};

const diagramEdges = [
  { source: 'pages', target: 'components', path: 'M365 85 H635', label: 'props', x: 500, y: 68, kind: 'request' },
  { source: 'pages', target: 'contexts', path: 'M250 120 V210', label: 'shared data', x: 310, y: 168, kind: 'shared' },
  { source: 'components', target: 'hooks', path: 'M750 120 V210', label: 'invoke', x: 790, y: 168, kind: 'request' },
  { source: 'contexts', target: 'hooks', path: 'M365 250 H635', label: 'use', x: 500, y: 233, kind: 'shared' },
  { source: 'hooks', target: 'services', path: 'M750 285 V380', label: 'API', x: 780, y: 338, kind: 'request' },
  { source: 'services', target: 'axios', path: 'M750 465 V535', label: 'HTTP', x: 784, y: 505, kind: 'request' },
];

export default function CaseStudyDeck({ homeHref = '/' }: { homeHref?: string }) {
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState('hooks');
  const selected = architectureNodes.find((node) => node.id === selectedId) ?? architectureNodes[0];
  const relatedIds = new Set(diagramEdges.filter((edge) => edge.source === selectedId || edge.target === selectedId).flatMap((edge) => [edge.source, edge.target]));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setStep((value) => Math.min(value + 1, 3));
      if (event.key === 'ArrowLeft') setStep((value) => Math.max(value - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="engineering-deck">
      <header className="deck-header">
        <a href={homeHref} className="deck-brand"><span className="deck-back"><ArrowLeft size={14} />首頁</span><Network size={24} /><div><strong>CAMPAIGN SYSTEM</strong><span>Architecture Case Study</span></div></a>
        <nav className="deck-step-nav" aria-label="案例步驟">
          {stepLabels.map((label, index) => <button className={step === index ? 'is-active' : step > index ? 'is-done' : ''} onClick={() => setStep(index)} key={label}><span>{index + 1}</span>{label}</button>)}
        </nav>
        <span className="deck-counter">{String(step + 1).padStart(2, '0')} / 04</span>
      </header>

      <div className="deck-stage">
        {step === 0 && <section className="deck-slide deck-slide--system">
          <div className="slide-copy"><p className="slide-kicker">01 / SYSTEM CONTEXT</p><h1><em>案件管理系統</em><br />前端開發與架構設計</h1><p>系統功能涵蓋案件建立、編輯、送審、權限管理、Cue 設定、合約與財務流程；並透過清楚的分層與責任邊界，降低系統持續擴充時的開發與維護成本。</p></div>
          <div className="system-modules"><article><FileCode2 /><strong>建立案件</strong><span>Campaign</span></article><article><Workflow /><strong>編輯送審</strong><span>Review Flow</span></article><article><ShieldCheck /><strong>權限管理</strong><span>Permission</span></article><article><Layers3 /><strong>Cue 設定</strong><span>Execution</span></article><article><FileCode2 /><strong>合約流程</strong><span>Contract</span></article><article><Database /><strong>財務處理</strong><span>Finance</span></article></div>
        </section>}

        {step === 1 && <section className="deck-slide deck-slide--framework">
          <div className="framework-heading"><p className="slide-kicker">02 / SCALING CHALLENGE</p><h1>框架解決了頁面路由，<br />卻沒有替專案定義責任邊界。</h1><p>Next.js Pages Router 提供頁面入口與檔案式路由；但 API、狀態、資料轉換與商業規則的放置方式，仍需要由專案自行設計。</p></div>
          <div className="framework-comparison">
            <section><header><span>FRAMEWORK PROVIDES</span><strong>Next.js Pages Router</strong></header><ul><li>檔案式路由</li><li>頁面入口</li><li>Build 與 Rendering</li></ul></section>
            <i><ArrowRight /><span>沒有定義應用層責任</span></i>
            <section className="framework-questions"><header><span>PROJECT MUST DECIDE</span><strong>應用程式如何組織？</strong></header><ul><li>API 應該放哪裡？</li><li>狀態應該如何共享？</li><li>資料在哪裡轉換？</li><li>商業規則由誰負責？</li><li>錯誤如何統一處理？</li></ul></section>
          </div>
          <div className="framework-result"><header><span>RESULT</span><strong>功能持續增加後，責任逐漸集中在 Page</strong></header><div>{['難追蹤資料流', '修改影響不明', '規則難以測試', '相似程式重複', '新人與 AI 難定位'].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div><p>問題不在於 Next.js，而是只靠框架提供的頁面結構，已不足以管理日益複雜的業務邏輯與資料流。</p></div>
        </section>}

        {step === 2 && <section className="deck-slide deck-slide--tree">
          <header className="tree-title"><div><p className="slide-kicker">03 / ARCHITECTURE CHANGE</p><h1>將集中在頁面的責任，<br />重新放回清楚的位置。</h1></div><div className="tree-legend"><span><i className="tree-existing" />既有結構</span><span><i className="tree-added" />新增／強化</span><span><i className="tree-moved" />從頁面抽離</span><span><i className="tree-shared" />跨層共用</span></div></header>
          <div className="architecture-tree-layout">
            <section className="tree-before"><header><span>BEFORE</span><strong>責任集中在 Page</strong></header><div className="tree-code"><p><b>▾</b> src/</p><p className="depth-1"><b>▾</b> pages/</p><p className="depth-2"><b>▾</b> campaign-list/</p><p className="depth-3"><b>□</b> index.tsx</p></div><div className="tree-overload"><div><span>ONE FILE, MANY REASONS TO CHANGE</span><strong>同一個頁面同時處理</strong></div><ul><li>畫面與操作</li><li>API 呼叫</li><li>Loading／錯誤</li><li>資料轉換</li><li>商業規則</li><li>頁面導向</li></ul></div></section>
            <div className="tree-transition"><ArrowRight /><span>依改變原因拆分</span></div>
            <section className="tree-after"><header><span>AFTER</span><strong>責任依層次組織</strong></header><div className="tree-code tree-code--after">
              <p><b>▾</b> src/</p>
              <p className="depth-1 tree-existing"><b>■</b> pages/ <small>頁面組裝</small></p>
              <p className="depth-1 tree-existing"><b>■</b> components/ <small>畫面與操作</small></p>
              <p className="depth-1 tree-added"><b>●</b> hooks/ <small>資料生命週期</small></p>
              <p className="depth-2 tree-file">useCampaignListQuery.ts</p>
              <p className="depth-1 tree-added"><b>●</b> services/ <small>API 邊界</small></p>
              <p className="depth-2 tree-file">campaign/index.ts</p>
              <p className="depth-1 tree-moved"><b>▲</b> domains/ <small>規則與轉換</small></p>
              <p className="depth-2 tree-file">SearchPayload.ts</p>
              <p className="depth-1 tree-shared"><b>◆</b> contexts/ <small>共用狀態</small></p>
              <p className="depth-1 tree-shared"><b>◆</b> types / enums/ <small>資料契約</small></p>
              <p className="depth-1 tree-added"><b>●</b> utils/axios.ts <small>HTTP Client</small></p>
            </div></section>
            <aside className="tree-notes"><header><span>WHY</span><strong>不只是增加資料夾</strong></header><article><b>01</b><p>不同類型的改變，會落在不同的責任邊界。</p></article><article><b>02</b><p>頁面只負責組裝，不再承擔所有細節。</p></article><article><b>03</b><p>規則、API 與狀態可以分別測試與重用。</p></article></aside>
          </div>
        </section>}

        {false && <section className="deck-slide deck-slide--solution-map">
          <header className="solution-map-title"><div><p className="slide-kicker">04 / THE SOLUTION</p><h1>這些層次如何一起工作？</h1></div><div className="map-legend"><span><i className="request-line" />呼叫／依賴</span><span><i className="response-line" />資料回傳</span></div></header>
          <div className="solution-map-layout">
          <div className="solution-map">
            <div className="map-user"><span>USER ACTION</span><strong>搜尋、建立、編輯、送審</strong></div>
            <i className="map-arrow map-arrow--down">↓</i>
            <div className="map-row map-row--presentation">
              <article className="map-node map-node--page"><b>6</b><FileCode2 /><div><strong>Pages</strong><span>組裝頁面、決定行為</span></div></article>
              <i className="map-link">→ props</i>
              <article className="map-node map-node--component"><b>5</b><mark>A</mark><Box /><div><strong>Components</strong><span>畫面與使用者操作</span></div></article>
              <i className="map-link">↔ state</i>
              <article className="map-node map-node--context"><b>4</b><Layers3 /><div><strong>Contexts</strong><span>跨元件共用狀態</span></div></article>
            </div>
            <i className="map-arrow map-arrow--down">↓ invoke</i>
            <div className="map-row map-row--logic">
              <article className="map-node map-node--domain"><mark>C</mark><Braces /><div><strong>Domains</strong><span>商業規則與資料轉換</span></div></article>
              <i className="map-link">↔ transform</i>
              <article className="map-node map-node--hook"><b>3</b><mark>B</mark><Workflow /><div><strong>Hooks</strong><span>React Query 與生命週期</span></div></article>
              <i className="map-link">uses ↔</i>
              <article className="map-node map-node--types"><mark>E</mark><Database /><div><strong>Types / Enums</strong><span>跨層共用資料契約</span></div></article>
            </div>
            <i className="map-arrow map-arrow--down">↓ request</i>
            <div className="map-row map-row--infrastructure">
              <article className="map-node map-node--service"><b>2</b><mark>D</mark><Database /><div><strong>Services</strong><span>API 呼叫與流程組合</span></div></article>
              <i className="map-link">→</i>
              <article className="map-node map-node--axios"><b>1</b><Network /><div><strong>Utils / Axios</strong><span>Token、HTTP 與 401</span></div></article>
              <i className="map-link">→</i>
              <article className="map-node map-node--api"><Network /><div><strong>Backend API</strong><span>Campaign / Auth / Internal</span></div></article>
            </div>
            <div className="map-response"><span>Response / Query Cache / Re-render</span><i>⇠ · · · · · · · · · · · · · · · · · · · · ·</i></div>
          </div>
          <aside className="map-annotations">
            <header><span>READING GUIDE</span><strong>怎麼閱讀這張圖？</strong></header>
            <article><b>A</b><div><strong>畫面與狀態分開</strong><p>Pages 負責組裝，Components 處理操作；只有多個元件都需要的資料才進 Context。</p></div></article>
            <article><b>B</b><div><strong>Hooks 管理資料生命週期</strong><p>API 快取、Loading、Error 與成功後行為集中在 React Query hooks。</p></div></article>
            <article><b>C</b><div><strong>規則不和 UI 混在一起</strong><p>搜尋條件、計算與資料轉換放進 Domain，方便單獨測試與重用。</p></div></article>
            <article><b>D</b><div><strong>建立清楚的 API 邊界</strong><p>Services 描述要呼叫什麼；Axios 統一處理 HTTP、Token 與 401。</p></div></article>
            <article><b>E</b><div><strong>所有層共享同一份契約</strong><p>Types 與 Enums 定義資料形狀，避免各層對同一欄位產生不同理解。</p></div></article>
          </aside>
          </div>
          <footer className="solution-outcomes"><span>開發更快</span><span>修改範圍清楚</span><span>規則容易測試</span><span>團隊與 AI 容易理解</span></footer>
        </section>}

        {step === 3 && <div className="deck-slide"><ReadableArchitectureExplorer /></div>}
      </div>

      <footer className="deck-footer">
        <button onClick={() => setStep((value) => Math.max(value - 1, 0))} disabled={step === 0}><ArrowLeft size={16} />上一步</button>
        <div className="deck-progress">{stepLabels.map((label, index) => <button aria-label={`前往${label}`} className={step === index ? 'is-active' : step > index ? 'is-done' : ''} onClick={() => setStep(index)} key={label} />)}</div>
        <button className="next" onClick={() => setStep((value) => Math.min(value + 1, 3))} disabled={step === 3}>下一步<ArrowRight size={16} /></button>
      </footer>
    </div>
  );
}
