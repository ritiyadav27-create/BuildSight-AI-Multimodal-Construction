import BuildingMassing from './BuildingMassing.jsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity, AlertCircle, AlertTriangle, ArrowRight, BadgeCheck, BarChart3, Bot, Building2,
  CalendarClock, Check, CheckCircle2, ChevronRight, CircleHelp, ClipboardCheck, CloudRain,
  Download, FileCheck2, FileText, HardHat, ImagePlus, Layers3, Menu, MessageCircle,
  Minus, PanelLeftClose, RefreshCw, Ruler, Send, ShieldAlert, ShieldCheck, Sparkles,
  TrendingUp, UploadCloud, Wallet, Wind, X
} from 'lucide-react'

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
// Each browser gets independent demo report history; not a user-login mechanism.
const workspaceKey = (() => {
  const existing = localStorage.getItem('buildsight-workspace-key')
  if (existing) return existing
  const key = crypto.randomUUID()
  localStorage.setItem('buildsight-workspace-key', key)
  return key
})()
const NAV = [
  { id: 'overview', label: 'Overview', icon: Layers3 },
  { id: 'safety', label: 'Safety & PPE Audit', icon: ShieldCheck },
  { id: 'cracks', label: 'Crack Diagnostics', icon: Ruler },
  { id: 'planning', label: 'Planning & Valuation', icon: BarChart3 },
  { id: 'weather', label: 'Weather Advisory', icon: CloudRain },
  { id: 'assistant', label: 'AI Site Assistant', icon: Bot },
  { id: 'history', label: 'Report History', icon: FileText },
]

async function request(url, options = {}) {
  let response
  try { response = await fetch(`${API}${url}`, { ...options, headers: { 'X-Workspace-Key': workspaceKey, ...options.headers } }) }
  catch { throw new Error('Cannot reach the API server. Start FastAPI or check the deployment URL.') }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = payload.detail
    throw new Error(typeof details === 'string' ? details : 'Request failed. Please check your inputs and try again.')
  }
  return payload
}
const postJSON = (url, body) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const inr = (value) => '₹' + Math.round(Number(value || 0)).toLocaleString('en-IN')
const downloadJSON = (data, name) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const timeLabel = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Recently' : d.toLocaleString()
}

function Tag({ children, kind = 'soft' }) { return <span className={`tag tag-${kind}`}>{children}</span> }
function Head({ eyebrow, title, description, icon: Icon }) {
  return <div className="page-head"><div className="eyebrow"><span className="small-square" /> {eyebrow}</div><div className="head-row"><div><h1>{title}</h1><p>{description}</p></div>{Icon && <span className="head-icon"><Icon size={29}/></span>}</div></div>
}
function Card({ title, sub, right, children, className = '' }) {
  return <section className={`panel ${className}`}><div className="panel-head"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{right}</div>{children}</section>
}
function Button({ children, onClick, busy, disabled, type = 'button', variant = 'primary', icon: Icon }) {
  return <button type={type} className={`btn btn-${variant}`} disabled={busy || disabled} onClick={onClick}>{busy ? <RefreshCw size={17} className="spin"/> : Icon && <Icon size={17}/>} {children}</button>
}
function Empty({ icon: Icon, title, detail }) { return <div className="empty-state"><span><Icon size={25}/></span><strong>{title}</strong><p>{detail}</p></div> }
function Notice({ children, tone = 'blue' }) { return <div className={`notice notice-${tone}`}><AlertCircle size={17} /><span>{children}</span></div> }
function ErrorBox({ error }) { return error ? <div role="alert" className="error-box"><AlertTriangle size={17}/>{error}</div> : null }
function ModeNotice({ mode }) { return mode === 'demo' ? <Notice tone="amber"><b>Demonstration output only.</b> No image analysis or AI reasoning was performed. Set the server-side GEMINI_API_KEY to enable actual AI inference.</Notice> : mode === 'ai' ? <Notice>AI-generated screening results require professional verification before real-world use.</Notice> : null }
function Field({ label, children, hint }) { return <label className="field"><span className="field-label">{label}</span>{children}{hint && <small>{hint}</small>}</label> }
function ReportDownload({ result, name }) { return result && <Button variant="outline" icon={Download} onClick={() => downloadJSON(result, name)}>Export JSON</Button> }
function ListReport({ items, type = 'simple' }) {
  return <div className="report-list">{(items || []).map((item, i) => <div className="report-row" key={i}>{type === 'hazard' ? <span className="round-icon warning"><AlertTriangle size={17}/></span> : <span className="round-icon"><Check size={16}/></span>}<div className="report-row-main">{type === 'hazard' ? <><div className="row-title"><b>{item.hazard}</b><Tag kind={item.severity === 'Critical' || item.severity === 'High' ? 'danger' : 'amber'}>{item.severity}</Tag></div><p>{item.recommendation}</p></> : <p>{item}</p>}</div></div>)}</div>
}
function FileUploader({ label, file, setFile }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const change = (value) => {
    if (!value) return
    if (!['image/png','image/jpeg'].includes(value.type)) { window.alert('Use a JPG or PNG image.'); return }
    if (value.size > 8 * 1024 * 1024) { window.alert('Maximum upload size is 8 MB.'); return }
    setFile(value)
  }
  const [preview, setPreview] = useState('')
  useEffect(() => { if (!file) { setPreview(''); return }; const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url) }, [file])
  return <div className={`uploader ${over ? 'drag-over' : ''}`} onDrop={e => {e.preventDefault();setOver(false);change(e.dataTransfer.files?.[0])}} onDragOver={e => {e.preventDefault();setOver(true)}} onDragLeave={() => setOver(false)}>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg" onChange={e => change(e.target.files?.[0])}/>
    {preview ? <div className="preview-wrap"><img src={preview} alt="Uploaded construction site preview"/><button className="close-file" onClick={() => {setFile(null); if(input.current) input.current.value=''}} aria-label="Remove selected image"><X size={17}/></button><div className="preview-caption"><FileCheck2 size={16}/><span>{file.name}</span><button onClick={() => input.current?.click()}>Change</button></div></div> : <button className="drop-area" onClick={() => input.current?.click()}><span className="upload-icon"><ImagePlus size={26}/></span><strong>{label}</strong><small>Drag & drop or click to browse</small><span className="file-meta">JPG or PNG · Up to 8 MB</span></button>}
  </div>
}
function StatCard({ icon: Icon, label, value, detail, tone = '' }) { return <div className={`stat-card ${tone}`}><span className="stat-icon"><Icon size={20}/></span><span className="stat-label">{label}</span><strong>{value}</strong><small>{detail}</small></div> }

function Overview({ onNavigate, online, aiEnabled, history }) {
  const tools = [
    { id:'safety', label:'Site Safety Audit', sub:'Assess visible PPE & worksite hazards', icon: ShieldCheck, tone:'blue' },
    { id:'cracks', label:'Structural Defects', sub:'Triage concrete and wall cracks', icon:Ruler, tone:'orange' },
    { id:'planning', label:'Project Planning', sub:'Estimate cost, materials & value', icon: BarChart3, tone:'purple' },
    { id:'weather', label:'Site Advisory', sub:'Check weather-related precautions', icon:CloudRain, tone:'teal' },
  ]
  return <>
    <div className="hero"><div className="hero-content"><Tag kind="hero"><Sparkles size={13}/> MULTIMODAL INTELLIGENCE PLATFORM</Tag><h1>Build smarter.<br/><span>Construct safer.</span></h1><p>An integrated AI-powered workspace for construction site inspection, structural insight, real estate planning and day-to-day decisions.</p><Button icon={ArrowRight} onClick={() => onNavigate('safety')}>Start a safety audit</Button></div><div className="hero-art" aria-hidden="true"><div className="grid-lines"/><Building2 size={168} strokeWidth={0.8}/><div className="blueprint-box a"><ShieldCheck size={17}/> Safety Intelligence</div><div className="blueprint-box b"><Activity size={17}/> Real-time Insights</div></div></div>
    <div className="section-heading"><div><h2>Workspace snapshot</h2><p>Your construction intelligence at a glance</p></div><Tag kind={online ? 'success' : 'danger'}>{online ? 'API Connected' : 'API Offline'}</Tag></div>
    <div className="stats-grid"><StatCard icon={Activity} label="System status" value={online ? 'Online' : 'Offline'} detail="Backend connectivity" tone="stat-blue"/><StatCard icon={Bot} label="AI inference" value={aiEnabled ? 'Enabled' : 'Demo mode'} detail={aiEnabled ? 'Gemini configured' : 'API key required'} tone="stat-purple"/><StatCard icon={FileText} label="Saved reports" value={history.length} detail="Recorded analyses" tone="stat-green"/><StatCard icon={Layers3} label="Modules available" value="05" detail="Connected workflows" tone="stat-orange"/></div>
    <div className="section-heading tools-title"><div><h2>Intelligence modules</h2><p>Choose a workflow to get started</p></div></div>
    <div className="tool-grid">{tools.map(t => <button className="tool-tile" key={t.id} onClick={() => onNavigate(t.id)}><span className={`tool-icon ${t.tone}`}><t.icon size={24}/></span><strong>{t.label}</strong><p>{t.sub}</p><span className="tool-arrow">Open module <ArrowRight size={15}/></span></button>)}</div>
    <div className="two-cols overview-lower"><Card title="How it works" sub="A simple end-to-end analysis workflow"><div className="steps">{[['01','Upload or enter project data'],['02','Analyze with AI or estimation engine'],['03','Review risks, assumptions and results'],['04','Download a structured JSON report']].map(([number,label])=><div className="step" key={number}><span>{number}</span><p>{label}</p></div>)}</div></Card><Card title="Decision-support notice" sub="Designed for responsible construction review"><div className="safe-illustration"><ShieldAlert size={42}/><h3>Expert judgment still matters</h3><p>AI image analysis is preliminary screening, not a certified structural assessment or regulatory compliance inspection. Safety, costs, weather, and repairs must be verified using qualified professionals and local information.</p></div></Card></div>
  </>
}

function ImageAudit({ kind, onSaved }) {
  const safety = kind === 'safety'; const [file,setFile] = useState(null); const [notes,setNotes] = useState(''); const [busy,setBusy]=useState(false),[error,setError]=useState(''),[report,setReport]=useState(null)
  const submit = async () => {if (!file) return; setBusy(true);setError('');setReport(null);try {const data = new FormData(); data.append('file',file); data.append('notes',notes.trim()); const result = await request(safety ? '/api/safety/analyze' : '/api/cracks/analyze',{method:'POST',body:data});setReport(result);onSaved()}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <>
    <Head eyebrow={safety ? 'SITE INTELLIGENCE / MODULE 01':'STRUCTURAL INTELLIGENCE / MODULE 02'} title={safety ? 'Safety & PPE Audit':'Crack Diagnostics'} description={safety ? 'Screen uploaded site photographs for visible protective equipment and potential hazards.' : 'Assess visible surface defects and obtain cautious, evidence-based triage recommendations.'} icon={safety ? ShieldCheck:Ruler}/>
    <div className="two-cols input-grid"><Card title={safety ? 'Upload site photograph':'Upload defect photograph'} sub="Use a clear, well-lit image with the subject visible." right={<Tag>IMAGE INPUT</Tag>}><FileUploader label={safety ? 'Choose a construction-site image':'Choose a concrete or wall image'} file={file} setFile={setFile}/><div className="image-notes"><label htmlFor={`notes-${kind}`} className="field-label">Optional observation notes</label><textarea id={`notes-${kind}`} rows={3} maxLength={1200} value={notes} onChange={e=>setNotes(e.target.value)} placeholder={safety?'E.g. three workers near scaffolding; check visible PPE':'E.g. crack in a ground-floor wall; scale reference unavailable'} /></div><div className="actions"><Button icon={Sparkles} busy={busy} disabled={!file} onClick={submit}>{busy?'Analyzing image...':safety?'Run safety analysis':'Analyze surface defect'}</Button></div><ErrorBox error={error}/><Notice tone="amber">{safety ? 'A photo cannot confirm hidden PPE, full-site compliance or operational safety.' : 'A single image cannot reliably measure crack width or determine structural integrity.'}</Notice></Card>
    <Card title="Analysis results" sub="Detailed, downloadable response" right={<ReportDownload result={report} name={safety?'site-safety-report.json':'crack-diagnostics-report.json'}/>}>{!report ? <Empty icon={safety?ClipboardCheck:Ruler} title="Awaiting analysis" detail="Upload a photograph and start analysis to see a structured report here."/> : <div className="results"><ModeNotice mode={report.mode}/>{safety ? <><div className="scoreline"><div className="big-score">{report.safety_score}<span>/100</span></div><div><span className="field-label">Visual screening indicator</span><h3>{report.overall_status}</h3><p>Heuristic output, not a compliance certification</p></div></div><h4>PPE visibility checklist</h4>{report.ppe_detection?.map((it,i)=><div key={i} className="ppe-item"><span>{it.item}</span><Tag kind={it.status==='Visible'?'success':it.status==='Not visible'?'danger':'soft'}>{it.status}</Tag>{it.note && <small>{it.note}</small>}</div>)}<h4>Potential hazards</h4>{report.hazards?.length ? <ListReport items={report.hazards} type="hazard"/>:<p className="muted">No visible hazards were described. This does not establish that the site is safe.</p>}</> : <><div className="result-grid"><div className="small-result"><small>Possible defect</small><strong>{report.defect_type}</strong></div><div className="small-result"><small>Screening severity</small><strong>{report.severity}</strong></div><div className="small-result"><small>Estimated width</small><strong>{report.estimated_width_mm == null ? 'Not measurable' : `${report.estimated_width_mm} mm`}</strong></div><div className="small-result"><small>Inspection urgency</small><strong>{report.urgency}</strong></div></div><h4>Possible causes</h4><ListReport items={report.suspected_causes}/><h4>Recommended next steps</h4><ListReport items={report.recommended_actions}/></>}<h4>Limitations</h4><ul className="limitations">{report.limitations?.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}</Card></div>
  </>
}

function Planning({ onSaved }) {
  const [form,setForm]=useState({building_type:'Residential',city_tier:'Tier 2',built_up_sqft:1800,completion_percent:35,construction_rate_per_sqft:2200,market_rate_per_sqft:4200,steel_kg_per_sqft:4,cement_bags_per_sqft:0.4})
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[report,setReport]=useState(null)
  const update=(key,val)=>setForm(v=>({...v,[key]:val}))
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError('');try{const result=await postJSON('/api/planning/estimate',form);setReport(result);onSaved()}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <><Head eyebrow="FINANCIAL INTELLIGENCE / MODULE 03" title="Planning & Valuation" description="Explore cost, expenditure, material quantities, project completion and approximate real-estate valuation." icon={BarChart3}/><div className="two-cols input-grid"><Card title="Project parameters" sub="All cost rates are editable assumptions — not live market prices."><form onSubmit={submit} className="planning-form"><div className="form-row"><Field label="Building type"><select value={form.building_type} onChange={e=>update('building_type',e.target.value)}>{['Residential','Commercial','Industrial'].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="City tier"><select value={form.city_tier} onChange={e=>update('city_tier',e.target.value)}>{['Tier 1','Tier 2','Tier 3'].map(x=><option key={x}>{x}</option>)}</select></Field></div><div className="form-row"><Field label="Built-up area (sq. ft)"><input required type="number" min="1" max="10000000" value={form.built_up_sqft} onChange={e=>update('built_up_sqft',Number(e.target.value))}/></Field><Field label="Construction rate (₹/sq. ft)"><input required type="number" min="1" value={form.construction_rate_per_sqft} onChange={e=>update('construction_rate_per_sqft',Number(e.target.value))}/></Field></div><div className="form-row"><Field label="Indicative market rate (₹/sq. ft)"><input required type="number" min="1" value={form.market_rate_per_sqft} onChange={e=>update('market_rate_per_sqft',Number(e.target.value))}/></Field><Field label="Steel (kg/sq. ft)"><input required type="number" min="0.01" step="0.1" value={form.steel_kg_per_sqft} onChange={e=>update('steel_kg_per_sqft',Number(e.target.value))}/></Field></div><Field label="Cement requirement (bags/sq. ft)"><input required type="number" min="0.01" step="0.1" value={form.cement_bags_per_sqft} onChange={e=>update('cement_bags_per_sqft',Number(e.target.value))}/></Field><Field label={`Completion progress — ${form.completion_percent}%`}><input type="range" min="0" max="100" value={form.completion_percent} onChange={e=>update('completion_percent',Number(e.target.value))}/></Field><Button type="submit" busy={busy} icon={BarChart3}>Calculate project estimates</Button><ErrorBox error={error}/></form></Card><Card title="Financial & material estimates" sub="Transparent calculations from your inputs" right={<ReportDownload result={report} name="project-estimate.json"/>}>{!report?<Empty icon={Wallet} title="Ready to calculate" detail="Set the project parameters and calculate to view a complete cost and material breakdown."/>:<div className="results"><div className="estimate-hero"><small>TOTAL ESTIMATED BUDGET</small><strong>{inr(report.total_budget_inr)}</strong><span>Area × assumed construction rate</span></div><div className="result-grid"><div className="small-result"><small>Estimated expenditure</small><strong>{inr(report.estimated_spent_inr)}</strong></div><div className="small-result"><small>Remaining budget</small><strong>{inr(report.remaining_budget_inr)}</strong></div><div className="small-result"><small>Indicative market value</small><strong>{inr(report.approximate_market_value_inr)}</strong></div><div className="small-result"><small>Completion</small><strong>{report.completion_percent}%</strong></div></div><div className="progress-line"><span style={{width:`${report.completion_percent}%`}}/></div><h4>Material planning</h4><div className="material-row"><span>Indicative steel</span><b>{report.indicative_steel_kg.toLocaleString('en-IN')} kg</b></div><div className="material-row"><span>Indicative cement</span><b>{report.indicative_cement_bags.toLocaleString('en-IN')} bags</b></div><h4>Conceptual building massing</h4><BuildingMassing buildingType={form.building_type} cityTier={form.city_tier}/><h4>Architectural concept prompt</h4><p className="prompt-preview">{report.rendering_prompt}</p><Button variant="outline" icon={FileText} onClick={()=>navigator.clipboard?.writeText(report.rendering_prompt)}>Copy rendering prompt</Button><h4>Assumptions & exclusions</h4><ul className="limitations">{report.assumptions.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}</Card></div></>
}
function Weather({ onSaved }) {
  const [condition,setCondition]=useState('Heavy Rain'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[report,setReport]=useState(null)
  const options=[{label:'Normal',icon:BadgeCheck,subtitle:'Routine conditions'},{label:'Heavy Rain',icon:CloudRain,subtitle:'Water / electrical hazards'},{label:'High Wind',icon:Wind,subtitle:'Lifting & working at height'},{label:'Extreme Heat',icon:AlertTriangle,subtitle:'Heat stress & curing'}]
  const submit=async()=>{setBusy(true);setError('');try{const r=await postJSON('/api/advisory/weather',{condition});setReport(r);onSaved()}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <><Head eyebrow="OPERATIONAL INTELLIGENCE / MODULE 04" title="Weather-Aware Advisory" description="Scenario-based daily site precautions for changing conditions. No live weather feed is implied." icon={CloudRain}/><div className="two-cols input-grid"><Card title="Select site conditions" sub="Choose the conditions currently affecting the project."><div className="condition-grid">{options.map(x=><button key={x.label} className={`condition-option ${condition===x.label?'chosen':''}`} onClick={()=>{setCondition(x.label);setReport(null)}}><x.icon size={23}/><strong>{x.label}</strong><small>{x.subtitle}</small></button>)}</div><div className="actions"><Button busy={busy} icon={ClipboardCheck} onClick={submit}>Generate safety advisory</Button></div><ErrorBox error={error}/></Card><Card title="Recommended protocols" sub="Operational checklist based on your selected scenario" right={<ReportDownload result={report} name="site-weather-advisory.json"/>}>{!report?<Empty icon={CalendarClock} title="Choose a weather scenario" detail="Select a condition to see recommended worksite precautions."/>:<div className="results"><Tag kind="amber">{report.condition}</Tag><h4>Daily site safety checklist</h4><ListReport items={report.alerts}/><Notice tone="amber">{report.source}. {report.disclaimer}</Notice></div>}</Card></div></>
}
function Assistant() {
  const [messages,setMessages] = useState([{role:'assistant',text:'Hello! I can help explain construction workflows, site safety considerations, material planning, and how to interpret reports. What would you like to know?',mode:'system'}])
  const [question,setQuestion]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const bottom=useRef(null)
  useEffect(()=>bottom.current?.scrollIntoView({behavior:'smooth',block:'end'}),[messages])
  const send=async(e)=>{e.preventDefault();const q=question.trim();if(!q||busy)return;const previous=messages.filter(x=>x.mode!=='system').map(x=>({role:x.role,text:x.text}));setMessages(m=>[...m,{role:'user',text:q}]);setQuestion('');setBusy(true);setError('');try{const r=await postJSON('/api/assistant/chat',{question:q,history:previous});setMessages(m=>[...m,{role:'assistant',text:r.answer,mode:r.mode}])}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <><Head eyebrow="KNOWLEDGE INTELLIGENCE / MODULE 05" title="AI Site Assistant" description="A contextual conversational assistant for construction planning and daily operations." icon={Bot}/><div className="chat-layout"><Card className="chat-panel" title="Construction assistant" sub="Interactive, multi-turn conversation" right={<Tag kind="success"><span className="online-dot"/> Assistant workspace</Tag>}><div className="chat-messages">{messages.map((m,i)=><div key={i} className={`chat-message ${m.role}`}><div className="chat-avatar">{m.role==='user'?'YOU':<Bot size={19}/>}</div><div className="bubble"><div className="bubble-label">{m.role==='user'?'You':'BuildSight Assistant'}{m.mode==='demo' && <Tag kind="amber">DEMO RESPONSE</Tag>}</div><p>{m.text}</p></div></div>)}{busy&&<div className="typing">AI is composing a response…</div>}<div ref={bottom}/></div><form className="chat-composer" onSubmit={send}><input aria-label="Message the site assistant" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={3000} placeholder="Ask about site safety, materials, planning..."/><button disabled={!question.trim()||busy} aria-label="Send message"><Send size={19}/></button></form><ErrorBox error={error}/></Card><div className="assistant-side"><Card title="Suggested questions" sub="Try a common construction query"><div className="suggested-list">{['What should a daily PPE inspection include?','How can I reduce material waste on site?','What precautions matter during heavy rain?','How should we document a wall crack?'].map(q=><button key={q} onClick={()=>setQuestion(q)}><CircleHelp size={17}/>{q}<ChevronRight size={16}/></button>)}</div></Card><Notice tone="amber">Educational information only. Do not use AI answers alone to approve structural work, certify compliance, or make life-safety decisions.</Notice></div></div></>
}
function History({ history, reload, busy }) {
  return <><Head eyebrow="PROJECT RECORDS / ACTIVITY" title="Report History" description="Reports from this browser workspace saved to a lightweight application database." icon={FileText}/><Card title="Recent analyses" sub="Last 30 records, most recent first" right={<Button variant="outline" busy={busy} icon={RefreshCw} onClick={reload}>Refresh</Button>}>{!history.length?<Empty icon={FileText} title="No reports yet" detail="Run a safety, crack, planning, or weather analysis and its report will appear here."/>:<div className="history-list">{history.map(it=><div className="history-item" key={it.id}><div className="history-symbol"><FileCheck2 size={19}/></div><div><strong>{it.label}</strong><p>{timeLabel(it.created_at)} · {it.kind.replace('_',' ')}</p></div><Button variant="outline" icon={Download} onClick={()=>downloadJSON(it.payload,`report-${it.id}.json`)}>JSON</Button></div>)}</div>}</Card><Notice tone="amber">Local SQLite storage is intended for demonstration. Free cloud containers may discard their local database during redeployment or restart.</Notice></>
}

export default function App(){
  const [active,setActive]=useState('overview'),[sidebarOpen,setSidebarOpen]=useState(false),[health,setHealth]=useState(null),[history,setHistory]=useState([]),[historyBusy,setHistoryBusy]=useState(false)
  const reload=useCallback(async()=>{setHistoryBusy(true);try { const [h,a] = await Promise.all([request('/api/health'),request('/api/history')]);setHealth(h);setHistory(a.items||[]) }catch{setHealth(null)}finally{setHistoryBusy(false)}},[])
  useEffect(()=>{reload()},[reload])
  const navigate=(id)=>{setActive(id);setSidebarOpen(false);window.scrollTo({top:0,behavior:'instant'})}
  const title = NAV.find(n=>n.id===active)?.label || 'Overview'
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen?'mobile-open':''}`}><div className="brand"><span className="brand-icon"><Building2 size={25}/></span><div><strong>BUILDSIGHT<span> AI</span></strong><small>CONSTRUCTION INTELLIGENCE</small></div><button className="mobile-close" onClick={()=>setSidebarOpen(false)} aria-label="Close navigation"><X size={20}/></button></div><div className="nav-caption">WORKSPACE</div><nav className="nav-menu">{NAV.map(n=><button key={n.id} className={`nav-link ${active===n.id?'active':''}`} onClick={()=>navigate(n.id)}><n.icon size={19}/><span>{n.label}</span>{active===n.id&&<span className="nav-arrow"><ChevronRight size={17}/></span>}</button>)}</nav><div className="sidebar-spacer"/><div className="side-status"><span className={`status-indicator ${health?'ready':''}`}/><div><b>{health?'System operational':'Backend unavailable'}</b><small>{health?.ai_enabled?'Gemini AI connected':'Transparent demo supported'}</small></div></div><div className="sidebar-foot">BUILD WITH CONFIDENCE <span>·</span> v1.0</div></aside>{sidebarOpen&&<button aria-label="Close menu backdrop" className="mobile-overlay" onClick={()=>setSidebarOpen(false)}/>}
    <main className="main"><header className="topbar"><div className="top-left"><button className="menu-btn" onClick={()=>setSidebarOpen(true)} aria-label="Open navigation"><Menu size={22}/></button><span>Workspace</span><ChevronRight size={15}/><strong>{title}</strong></div><div className="top-right"><span className="top-date">Construction decision-support suite</span><div className="user-badge"><HardHat size={19}/></div></div></header><div className="content">
      {active==='overview'&&<Overview onNavigate={navigate} online={!!health} aiEnabled={!!health?.ai_enabled} history={history}/>}
      {active==='safety'&&<ImageAudit kind="safety" onSaved={reload}/>}
      {active==='cracks'&&<ImageAudit kind="cracks" onSaved={reload}/>}
      {active==='planning'&&<Planning onSaved={reload}/>}
      {active==='weather'&&<Weather onSaved={reload}/>}
      {active==='assistant'&&<Assistant/>}
      {active==='history'&&<History history={history} reload={reload} busy={historyBusy}/>}
      <footer className="footer"><span>© 2026 BuildSight AI · Multimodal Construction Intelligence Platform</span><span>Decision support only · Human verification required</span></footer>
    </div></main>
  </div>
}
