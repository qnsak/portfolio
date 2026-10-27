import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Braces,
  ChevronRight,
  Code2,
  Database,
  FileCode2,
  Layers3,
  Network,
  PanelRightClose,
  Workflow,
} from 'lucide-react';
import { architectureViews, explorerSteps, type ArchitectureNodeData } from './architectureData';

const icons = { page: FileCode2, component: Box, context: Layers3, hook: Workflow, domain: Braces, service: Database, infra: Network };

function ArchitectureNode({ data, selected }: NodeProps) {
  const nodeData = data as ArchitectureNodeData;
  const Icon = icons[nodeData.kind];
  return (
    <div className={`explorer-node explorer-node--${nodeData.kind} explorer-node--${nodeData.status ?? 'current'} ${selected ? 'is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <Icon size={17} aria-hidden="true" />
      <div><strong>{nodeData.label}</strong><small>{nodeData.path}</small></div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { architecture: ArchitectureNode };

function CanvasNavigator({ viewId, focusId }: { viewId: string; focusId?: string }) {
  const { fitView, setCenter, getNode } = useReactFlow();
  const navigate = useCallback(() => {
    const timeoutId = window.setTimeout(() => {
      if (focusId) {
        const target = getNode(focusId);
        if (target) setCenter(target.position.x + 100, target.position.y + 45, { zoom: 1.05, duration: 450 });
      } else fitView({ padding: .18, duration: 450 });
    }, 30);
    return () => window.clearTimeout(timeoutId);
  }, [fitView, focusId, getNode, setCenter, viewId]);
  useEffect(navigate, [navigate]);
  return null;
}

export default function ArchitectureExplorer() {
  const [viewId, setViewId] = useState('layers');
  const [selectedId, setSelectedId] = useState('pages');
  const [stepId, setStepId] = useState('layers');
  const [detailTab, setDetailTab] = useState<'role' | 'files' | 'code' | 'design'>('role');
  const [detailsOpen, setDetailsOpen] = useState(true);
  const view = architectureViews.find((item) => item.id === viewId) ?? architectureViews[0];
  const selected = view.nodes.find((item) => item.id === selectedId) ?? view.nodes[0];
  const activeStep = explorerSteps.find((item) => item.id === stepId);
  const relatedIds = view.edges
    .filter((item) => item.source === selected.id || item.target === selected.id)
    .map((item) => item.source === selected.id ? item.target : item.source);
  const relatedNodes = view.nodes.filter((item) => relatedIds.includes(item.id));

  const nodes = useMemo(() => view.nodes.map((item) => ({ ...item, selected: item.id === selected.id })), [selected.id, view]);
  const edges = useMemo(() => view.edges.map((item) => ({ ...item, style: { stroke: '#64748b', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }, labelStyle: { fill: '#94a3b8', fontSize: 10 } })), [view]);

  const changeView = (nextView: string, focus?: string) => {
    const next = architectureViews.find((item) => item.id === nextView) ?? architectureViews[0];
    setViewId(next.id);
    setSelectedId(focus && next.nodes.some((item) => item.id === focus) ? focus : next.nodes[0].id);
  };

  const changeStep = (id: string) => {
    const step = explorerSteps.find((item) => item.id === id);
    if (!step) return;
    setStepId(id);
    changeView(step.view, step.focus);
  };

  return (
    <div className={`architecture-explorer ${detailsOpen ? '' : 'details-collapsed'}`}>
      <header className="explorer-toolbar">
        <div className="explorer-brand"><Network size={22} /><div><strong>Campaign Management System</strong><span>Next.js 架構說明 · 互動式文件</span></div></div>
        <nav className="explorer-steps" aria-label="委刊列表資料流程">
          {explorerSteps.map((step, index) => (
            <span className="step-wrap" key={step.id}>
              <button className={stepId === step.id ? 'is-active' : ''} onClick={() => changeStep(step.id)}><small>{index + 1}</small>{step.label}</button>
              {index < explorerSteps.length - 1 && <ChevronRight size={15} />}
            </span>
          ))}
        </nav>
        <button className="detail-toggle" onClick={() => setDetailsOpen((open) => !open)} aria-label="切換節點詳情"><PanelRightClose size={18} /></button>
      </header>

      <div className="explorer-body">
        <aside className="explorer-sidebar">
          <p>視圖選擇</p>
          <nav>
            {architectureViews.map((item) => {
              const Icon = item.id === 'system' ? Network : ['list-flow', 'editor', 'target'].includes(item.id) ? Workflow : Layers3;
              return <button className={viewId === item.id ? 'is-active' : ''} onClick={() => { changeView(item.id); setStepId(explorerSteps.find((step) => step.view === item.id)?.id ?? ''); }} key={item.id}><Icon size={16} /><span>{item.label}</span></button>;
            })}
          </nav>
          <div className="sidebar-note"><Code2 size={19} /><p>點擊節點查看檔案、責任與架構觀察。</p></div>
        </aside>

        <section className="explorer-canvas" aria-label="互動式架構圖">
          <header><div><span>ACTIVE VIEW</span><h3>{view.label}</h3><p>{view.subtitle}</p></div><strong>{view.nodes.length} NODES</strong></header>
          <div className="flow-canvas">
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => { setSelectedId(node.id); setDetailsOpen(true); }} minZoom={.45} maxZoom={1.7} fitView fitViewOptions={{ padding: .18 }} proOptions={{ hideAttribution: true }}>
              <CanvasNavigator viewId={viewId} focusId={activeStep?.view === viewId ? activeStep.focus : undefined} />
              <Background color="#334155" gap={22} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </section>

        <aside className="explorer-detail">
          <header><span>節點詳細說明</span><em className={`kind kind--${selected.data.status ?? selected.data.kind}`}>{selected.data.status === 'issue' ? 'ISSUE' : selected.data.status === 'proposed' ? 'PROPOSED' : selected.data.kind}</em></header>
          <div className="detail-identity"><div className={`detail-icon detail-icon--${selected.data.kind}`}><Code2 size={20} /></div><div><h3>{selected.data.label}</h3><code>{selected.data.path}</code></div></div>
          <nav className="detail-tabs" aria-label="節點說明分類">
            <button className={detailTab === 'role' ? 'is-active' : ''} onClick={() => setDetailTab('role')}>職責說明</button>
            <button className={detailTab === 'files' ? 'is-active' : ''} onClick={() => setDetailTab('files')}>相關節點</button>
            <button className={detailTab === 'code' ? 'is-active' : ''} onClick={() => setDetailTab('code')}>程式範例</button>
            <button className={detailTab === 'design' ? 'is-active' : ''} onClick={() => setDetailTab('design')}>設計考量</button>
          </nav>
          {detailTab === 'role' && <div className="detail-tab-panel"><p>{selected.data.description}</p><section><span>主要責任</span><ul>{selected.data.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section><section><span>技術重點</span><div className="detail-tags">{selected.data.highlights.map((item) => <b key={item}>{item}</b>)}</div></section></div>}
          {detailTab === 'files' && <div className="detail-tab-panel"><section><span>目前檔案</span><code>{selected.data.path}</code></section><section><span>直接關聯</span><div className="related-list">{relatedNodes.length ? relatedNodes.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)}>{item.data.label}<small>{item.data.path}</small></button>) : <p>目前視圖沒有直接連線的節點。</p>}</div></section></div>}
          {detailTab === 'code' && <div className="detail-tab-panel"><section><span>程式碼範例</span>{selected.data.code ? <pre><code>{selected.data.code}</code></pre> : <p>此節點以責任說明為主，尚未加入可公開的程式碼。</p>}</section></div>}
          {detailTab === 'design' && <div className="detail-tab-panel">{selected.data.observation ? <section className="detail-observation"><span>架構觀察</span><p>{selected.data.observation}</p></section> : <section><span>設計原則</span><p>讓這個節點維持單一責任，並透過明確輸入與輸出與其他層協作。</p></section>}{selected.data.direction && <section className="detail-direction"><span>改善方向</span><p>{selected.data.direction}</p></section>}</div>}
        </aside>
      </div>
    </div>
  );
}
