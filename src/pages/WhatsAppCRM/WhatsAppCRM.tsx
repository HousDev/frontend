// import { useState, useEffect, useRef, useCallback } from "react";

// const COLORS = {
//     blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
//     green: { bg: '#EAF3DE', border: '#639922', text: '#27500A' },
//     amber: { bg: '#FAEEDA', border: '#EF9F27', text: '#633806' },
//     coral: { bg: '#FAECE7', border: '#D85A30', text: '#712B13' },
//     purple: { bg: '#EEEDFE', border: '#7F77DD', text: '#3C3489' },
//     teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#085041' },
// };

// const INITIAL_CONVOS = [
//     { id: 1, name: 'Rahul Sharma', phone: '+91 98200 11234', tag: 'hot', stage: 'Qualified', assigned: 'Priya', unread: 2, lastMsg: 'Yes I am interested, please send pricing', time: '2m', sessionExpiry: false, color: 'blue', initials: 'RS', messages: [{ dir: 'in', text: 'Hi, saw your ad on Instagram. Is this still available?', time: '10:14 AM' }, { dir: 'bot', text: 'Hello Rahul! Thanks for reaching out. Are you looking for our Basic, Pro, or Enterprise plan?', time: '10:14 AM' }, { dir: 'in', text: 'Pro plan. What are the features?', time: '10:16 AM' }, { dir: 'bot', text: 'Pro plan includes: unlimited contacts, 3 agents, broadcast campaigns, and CRM integration. Would you like to talk to our sales team?', time: '10:16 AM' }, { dir: 'in', text: 'Yes I am interested, please send pricing', time: '10:18 AM' }], notes: ['Called on 12 Apr, very interested in Pro plan', 'Budget confirmed Rs 5000/mo', 'Decision by end of month'], pipeline: [{ stage: 'Enquiry', done: true, date: 'Apr 10' }, { stage: 'Qualified', done: true, date: 'Apr 12' }, { stage: 'Proposal', done: false, date: '-' }, { stage: 'Negotiation', done: false, date: '-' }, { stage: 'Closed', done: false, date: '-' }] },
//     { id: 2, name: 'Sneha Patel', phone: '+91 97350 22345', tag: 'new', stage: 'Enquiry', assigned: 'Bot', unread: 0, lastMsg: 'Can you tell me more about your service?', time: '14m', sessionExpiry: false, color: 'green', initials: 'SP', messages: [{ dir: 'in', text: 'Hello, I found you on Google.', time: '9:52 AM' }, { dir: 'bot', text: 'Hi Sneha! Welcome. Can you tell me what you are looking for today?', time: '9:52 AM' }, { dir: 'in', text: 'Can you tell me more about your service?', time: '10:04 AM' }], notes: ['Came from Google Ads'], pipeline: [{ stage: 'Enquiry', done: true, date: 'Apr 14' }, { stage: 'Qualified', done: false, date: '-' }, { stage: 'Proposal', done: false, date: '-' }, { stage: 'Negotiation', done: false, date: '-' }, { stage: 'Closed', done: false, date: '-' }] },
//     { id: 3, name: 'Amit Verma', phone: '+91 99870 33456', tag: 'conv', stage: 'Closed Won', assigned: 'Rohan', unread: 0, lastMsg: 'Payment done! When do we start?', time: '1h', sessionExpiry: true, color: 'purple', initials: 'AV', messages: [{ dir: 'out', text: "Hi Amit! Following up on our demo call. Ready to get started?", time: '8:30 AM' }, { dir: 'in', text: "Yes, let's do it! What's next?", time: '8:45 AM' }, { dir: 'out', text: 'Great! Please complete the payment here: pay.example.com/amit', time: '8:47 AM' }, { dir: 'in', text: 'Payment done! When do we start?', time: '9:10 AM' }], notes: ['Enterprise deal — Rs 15,000/mo', 'Onboarding scheduled April 18'], pipeline: [{ stage: 'Enquiry', done: true, date: 'Apr 5' }, { stage: 'Qualified', done: true, date: 'Apr 7' }, { stage: 'Proposal', done: true, date: 'Apr 9' }, { stage: 'Negotiation', done: true, date: 'Apr 12' }, { stage: 'Closed', done: true, date: 'Apr 14' }] },
//     { id: 4, name: 'Meera Joshi', phone: '+91 98760 44567', tag: 'new', stage: 'New', assigned: 'Unassigned', unread: 1, lastMsg: 'Ek baar call kar sakte ho?', time: '32m', sessionExpiry: false, color: 'coral', initials: 'MJ', messages: [{ dir: 'in', text: 'Namaste! Mujhe CRM ke baare mein jaanna hai.', time: '9:33 AM' }, { dir: 'bot', text: 'Namaste Meera! Hum aapki help kar sakte hain. Aap kaunsa plan dekhna chahte hain?', time: '9:33 AM' }, { dir: 'in', text: 'Ek baar call kar sakte ho?', time: '9:40 AM' }], notes: [], pipeline: [{ stage: 'Enquiry', done: true, date: 'Apr 14' }, { stage: 'Qualified', done: false, date: '-' }, { stage: 'Proposal', done: false, date: '-' }, { stage: 'Negotiation', done: false, date: '-' }, { stage: 'Closed', done: false, date: '-' }] },
//     { id: 5, name: 'Karan Mehta', phone: '+91 91230 55678', tag: 'hot', stage: 'Proposal', assigned: 'Priya', unread: 0, lastMsg: 'Send the proposal on email too please', time: '3h', sessionExpiry: false, color: 'teal', initials: 'KM', messages: [{ dir: 'out', text: 'Hi Karan, here is your customized proposal for 10 agents!', time: '7:00 AM' }, { dir: 'in', text: 'Looks good. Can you give a 10% discount?', time: '7:20 AM' }, { dir: 'out', text: 'Let me check with management and get back to you within the hour.', time: '7:22 AM' }, { dir: 'in', text: 'Send the proposal on email too please', time: '7:30 AM' }], notes: ['Negotiating 10% discount — approved up to 8%', 'Follow up by 5 PM today'], pipeline: [{ stage: 'Enquiry', done: true, date: 'Apr 10' }, { stage: 'Qualified', done: true, date: 'Apr 11' }, { stage: 'Proposal', done: true, date: 'Apr 14' }, { stage: 'Negotiation', done: false, date: '-' }, { stage: 'Closed', done: false, date: '-' }] },
// ];

// const TEMPLATES = [
//     { id: 't1', name: 'welcome_message', label: 'Welcome Message', status: 'approved', category: 'UTILITY', language: 'en', body: 'Hi {{1}}! Welcome to our platform. How can we help you today?', variables: ['Customer Name'], usageCount: 342, lastUsed: '2h ago' },
//     { id: 't2', name: 'follow_up', label: 'Follow Up', status: 'approved', category: 'MARKETING', language: 'en', body: 'Hi {{1}}, just following up on our last conversation. Are you ready to move forward?', variables: ['Customer Name'], usageCount: 215, lastUsed: '5h ago' },
//     { id: 't3', name: 'send_pricing', label: 'Send Pricing', status: 'approved', category: 'MARKETING', language: 'en', body: 'Hi {{1}}! Here are our latest pricing plans:\n• Basic: Rs 999/mo\n• Pro: Rs 2499/mo\n• Enterprise: Rs 9999/mo\n\nWhich plan interests you?', variables: ['Customer Name'], usageCount: 189, lastUsed: '1d ago' },
//     { id: 't4', name: 'schedule_demo', label: 'Schedule Demo', status: 'pending', category: 'UTILITY', language: 'en', body: 'Hi {{1}}, would you like to schedule a free 30-min demo? Pick a slot: calendly.com/demo', variables: ['Customer Name'], usageCount: 0, lastUsed: 'Never' },
//     { id: 't5', name: 'payment_link', label: 'Payment Link', status: 'approved', category: 'UTILITY', language: 'en', body: 'Hi {{1}}, your payment link is ready: pay.example.com/{{2}}. Valid for 24 hours.', variables: ['Customer Name', 'Payment ID'], usageCount: 98, lastUsed: '30m ago' },
//     { id: 't6', name: 'reengagement', label: 'Re-engagement', status: 'rejected', category: 'MARKETING', language: 'en', body: 'We miss you {{1}}! Come back and get 20% off your first month.', variables: ['Customer Name'], usageCount: 0, lastUsed: 'Never', rejectionReason: 'Promotional content requires explicit opt-in documentation' },
// ];

// const INITIAL_BROADCASTS = [
//     { id: 'b1', name: 'April Pricing Offer', template: 'send_pricing', segment: 'Hot Leads', sent: 142, delivered: 138, read: 89, replied: 23, status: 'completed', date: 'Apr 12', time: '10:00 AM' },
//     { id: 'b2', name: 'Follow-up Blast', template: 'follow_up', segment: 'Qualified', sent: 67, delivered: 65, read: 41, replied: 12, status: 'completed', date: 'Apr 13', time: '2:00 PM' },
//     { id: 'b3', name: 'Demo Invite Campaign', template: 'schedule_demo', segment: 'All Contacts', sent: 0, delivered: 0, read: 0, replied: 0, status: 'scheduled', date: 'Apr 16', time: '9:00 AM' },
// ];

// const INITIAL_RULES = [
//     { id: 'r1', icon: '⚡', title: 'New lead greeting', trigger: 'New contact first message', action: 'Send welcome_message template', on: true, color: 'amber', execCount: 1203 },
//     { id: 'r2', icon: '🕐', title: '24hr window alert', trigger: '1hr before session expiry', action: 'Notify assigned agent via email', on: true, color: 'blue', execCount: 89 },
//     { id: 'r3', icon: '🤖', title: 'Bot qualification flow', trigger: 'New contact any message', action: 'Run qualification bot script', on: true, color: 'green', execCount: 567 },
//     { id: 'r4', icon: '📋', title: 'Auto-assign by keyword', trigger: 'Message contains "pricing"', action: 'Assign to Sales Team', on: true, color: 'purple', execCount: 234 },
//     { id: 'r5', icon: '⏰', title: 'Follow-up reminder', trigger: '24hr of no agent reply', action: 'Send follow_up template', on: false, color: 'coral', execCount: 0 },
//     { id: 'r6', icon: '📊', title: 'Stage auto-update', trigger: 'Bot collects name + budget', action: 'Move to Qualified stage', on: true, color: 'teal', execCount: 312 },
// ];

// const PIPELINE_STAGES = ['New', 'Enquiry', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

// const QUICK_REPLIES = [
//     'Sure, let me check that for you!',
//     'Our team will call you shortly.',
//     'Here is the pricing: Basic Rs 999, Pro Rs 2499',
//     'Thanks for your interest! Can I know your budget?',
//     'Please share your email so I can send the details.',
// ];

// // ─── Tag badge component
// const Tag = ({ tag, stage }) => {
//     const map = { hot: { label: 'Hot', c: 'coral' }, conv: { label: 'Converted', c: 'purple' }, new: { label: 'New', c: 'blue' }, qual: { label: 'Qualified', c: 'green' } };
//     const info = map[tag] || map['new'];
//     const col = COLORS[info.c];
//     return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: col.bg, color: col.text, border: `1px solid ${col.border}22` }}>{stage || info.label}</span>;
// };

// // ─── Avatar
// const Avatar = ({ initials, color = 'blue', size = 38 }) => {
//     const col = COLORS[color] || COLORS.blue;
//     return <div style={{ width: size, height: size, borderRadius: '50%', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${col.border}44`, fontFamily: 'Georgia, serif' }}>{initials}</div>;
// };

// // ─── Status badge for templates
// const StatusBadge = ({ status }) => {
//     const map = { approved: { bg: '#EAF3DE', color: '#27500A', label: 'Approved' }, pending: { bg: '#FAEEDA', color: '#633806', label: 'Pending' }, rejected: { bg: '#FAECE7', color: '#712B13', label: 'Rejected' } };
//     const s = map[status] || map.pending;
//     return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
// };

// // ─── Toggle
// const Toggle = ({ on, onChange }) => (
//     <button onClick={onChange} style={{ width: 34, height: 20, borderRadius: 10, background: on ? '#1D9E75' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
//         <span style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: on ? 17 : 3, transition: 'left .2s' }} />
//     </button>
// );

// // ─── Main App
// export default function App() {
//     const [view, setView] = useState('inbox'); // inbox | pipeline | broadcast | templates | automation | analytics
//     const [convos, setConvos] = useState(INITIAL_CONVOS);
//     const [activeId, setActiveId] = useState(1);
//     const [filter, setFilter] = useState('all');
//     const [search, setSearch] = useState('');
//     const [rpTab, setRpTab] = useState('contact');
//     const [mode, setMode] = useState('text');
//     const [compose, setCompose] = useState('');
//     const [noteText, setNoteText] = useState('');
//     const [rules, setRules] = useState(INITIAL_RULES);
//     const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS);
//     const [templates, setTemplates] = useState(TEMPLATES);
//     const [aiLoading, setAiLoading] = useState(false);
//     const [showNewBroadcast, setShowNewBroadcast] = useState(false);
//     const [showNewRule, setShowNewRule] = useState(false);
//     const [showNewTemplate, setShowNewTemplate] = useState(false);
//     const [newTpl, setNewTpl] = useState({ label: '', body: '', category: 'UTILITY', language: 'en' });
//     const [newBroadcast, setNewBroadcast] = useState({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
//     const messagesEnd = useRef(null);

//     const activeConv = convos.find(c => c.id === activeId) || convos[0];

//     useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv?.messages, activeId]);

//     const updateConv = (id, fn) => setConvos(prev => prev.map(c => c.id === id ? fn(c) : c));

//     const selectConv = (id) => { setActiveId(id); updateConv(id, c => ({ ...c, unread: 0 })); };

//     const now = () => { const d = new Date(); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; };

//     const sendMessage = () => {
//         if (!compose.trim()) return;
//         const isNote = mode === 'note';
//         updateConv(activeConv.id, c => ({ ...c, messages: [...c.messages, { dir: isNote ? 'note' : 'out', text: compose, time: now() }], lastMsg: compose.substring(0, 45), time: 'now', stage: (!isNote && c.stage === 'New') ? 'Enquiry' : c.stage }));
//         setCompose('');
//     };

//     const aiReply = async () => {
//         setAiLoading(true);
//         const history = activeConv.messages.slice(-6).map(m => `${m.dir === 'in' ? 'Customer' : 'Agent'}: ${m.text}`).join('\n');
//         try {
//             const res = await fetch('https://api.anthropic.com/v1/messages', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     model: 'claude-sonnet-4-20250514',
//                     max_tokens: 200,
//                     system: `You are a helpful WhatsApp CRM sales agent for a SaaS platform. Customer: ${activeConv.name}. Stage: ${activeConv.stage}. Keep replies short (1-3 sentences), friendly, professional. Don't use markdown.`,
//                     messages: [{ role: 'user', content: `Based on this conversation, write a short agent reply:\n${history}\n\nWrite only the reply text, nothing else.` }]
//                 })
//             });
//             const data = await res.json();
//             const text = data.content?.[0]?.text || 'I will get back to you shortly!';
//             setCompose(text);
//         } catch { setCompose('Thank you for reaching out! Our team will connect with you shortly.'); }
//         setAiLoading(false);
//     };

//     const takeOver = () => updateConv(activeConv.id, c => ({ ...c, assigned: 'You', messages: [...c.messages, { dir: 'system', text: 'Agent took over from bot', time: now() }] }));
//     const resolveConv = () => updateConv(activeConv.id, c => ({ ...c, stage: 'Resolved', tag: 'conv', messages: [...c.messages, { dir: 'system', text: 'Conversation resolved', time: now() }] }));
//     const transferConv = () => { const a = ['Priya', 'Rohan', 'Sales Team'][Math.floor(Math.random() * 3)]; updateConv(activeConv.id, c => ({ ...c, assigned: a, messages: [...c.messages, { dir: 'system', text: `Transferred to ${a}`, time: now() }] })); };
//     const advanceStage = () => updateConv(activeConv.id, c => { const pipe = c.pipeline.map(s => ({ ...s })); const ni = pipe.findIndex(s => !s.done); if (ni !== -1) { pipe[ni].done = true; pipe[ni].date = 'Apr 15'; return { ...c, pipeline: pipe, stage: pipe[ni].stage, tag: pipe[ni].stage === 'Closed' ? 'conv' : (pipe[ni].stage === 'Qualified' || pipe[ni].stage === 'Proposal') ? 'qual' : c.tag }; } return c; });
//     const addNote = () => { if (!noteText.trim()) return; updateConv(activeConv.id, c => ({ ...c, notes: [noteText, ...c.notes] })); setNoteText(''); };
//     const assignAgent = () => { const a = ['Priya', 'Rohan', 'Sales Team'][Math.floor(Math.random() * 3)]; updateConv(activeConv.id, c => ({ ...c, assigned: a })); };
//     const submitTemplate = () => {
//         if (!newTpl.label || !newTpl.body) return;
//         setTemplates(prev => [...prev, { id: `t${Date.now()}`, name: newTpl.label.toLowerCase().replace(/\s+/g, '_'), label: newTpl.label, status: 'pending', category: newTpl.category, language: newTpl.language, body: newTpl.body, variables: [], usageCount: 0, lastUsed: 'Never' }]);
//         setNewTpl({ label: '', body: '', category: 'UTILITY', language: 'en' });
//         setShowNewTemplate(false);
//     };
//     const submitBroadcast = () => {
//         if (!newBroadcast.name || !newBroadcast.template) return;
//         setBroadcasts(prev => [...prev, { id: `b${Date.now()}`, ...newBroadcast, sent: 0, delivered: 0, read: 0, replied: 0, status: 'scheduled' }]);
//         setNewBroadcast({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
//         setShowNewBroadcast(false);
//     };

//     const filtered = convos.filter(c => {
//         if (filter === 'mine' && c.assigned !== 'Priya' && c.assigned !== 'Rohan') return false;
//         if (filter === 'bot' && c.assigned !== 'Bot') return false;
//         if (filter === 'unread' && !c.unread) return false;
//         if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
//         return true;
//     });

//     // ─── Sidebar icons
//     const sideIcons = [
//         { id: 'inbox', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, badge: convos.reduce((s, c) => s + c.unread, 0) },
//         { id: 'pipeline', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
//         { id: 'broadcast', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg> },
//         { id: 'templates', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>, badge: templates.filter(t => t.status === 'pending').length },
//         { id: 'automation', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 13 9 20 9" /><path d="M20 14.5v3.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" /><polyline points="10 16 12 18 16 14" /></svg> },
//         { id: 'analytics', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
//     ];

//     const S = { // shared styles shorthand
//         card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '14px 16px' },
//         btn: (primary) => ({ background: primary ? '#185FA5' : '#f5f5f5', color: primary ? '#fff' : '#333', border: primary ? 'none' : '0.5px solid #ddd', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }),
//         input: { width: '100%', border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa' },
//         label: { fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' },
//     };

//     // ═══════════════════════════════════════════
//     // VIEWS
//     // ═══════════════════════════════════════════

//     const renderPipelineView = () => {
//         const byStage = PIPELINE_STAGES.reduce((acc, s) => { acc[s] = convos.filter(c => c.stage === s || (s === 'Closed Won' && c.stage === 'Closed Won')); return acc; }, {});
//         const stageColors = { 'New': 'gray', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' };
//         return (
//             <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                     <div>
//                         <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Sales Pipeline</h2>
//                         <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{convos.length} contacts across {PIPELINE_STAGES.length} stages</p>
//                     </div>
//                     <div style={{ display: 'flex', gap: 8 }}>
//                         <div style={{ background: '#EAF3DE', color: '#27500A', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>Total Pipeline: Rs 2,40,000</div>
//                     </div>
//                 </div>
//                 <div style={{ display: 'flex', gap: 12, minWidth: 900 }}>
//                     {PIPELINE_STAGES.map(stage => {
//                         const contacts = byStage[stage] || [];
//                         const col = COLORS[stageColors[stage]] || COLORS.blue;
//                         return (
//                             <div key={stage} style={{ flex: 1, minWidth: 140 }}>
//                                 <div style={{ background: col.bg, borderRadius: '8px 8px 0 0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${col.border}33` }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: col.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</span>
//                                     <span style={{ fontSize: 11, background: '#fff', color: col.text, borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>{contacts.length}</span>
//                                 </div>
//                                 <div style={{ background: '#f8f8f8', borderRadius: '0 0 8px 8px', minHeight: 400, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '0.5px solid #e0e0e0', borderTop: 'none' }}>
//                                     {contacts.map(c => (
//                                         <div key={c.id} onClick={() => { setView('inbox'); selectConv(c.id); }} style={{ background: '#fff', borderRadius: 8, padding: 10, cursor: 'pointer', border: '0.5px solid #e8e8e8', transition: 'box-shadow .15s' }}
//                                             onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
//                                             onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
//                                                 <Avatar initials={c.initials} color={c.color} size={26} />
//                                                 <div>
//                                                     <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{c.name}</div>
//                                                     <div style={{ fontSize: 10, color: '#888' }}>{c.assigned}</div>
//                                                 </div>
//                                             </div>
//                                             <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMsg}</div>
//                                             <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{c.time}</div>
//                                         </div>
//                                     ))}
//                                     {contacts.length === 0 && <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', paddingTop: 20 }}>No contacts</div>}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     const renderBroadcastView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Broadcast Campaigns</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Send bulk WhatsApp messages to segments</p>
//                 </div>
//                 <button onClick={() => setShowNewBroadcast(true)} style={S.btn(true)}>+ New Campaign</button>
//             </div>

//             {/* Stats row */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
//                 {[{ label: 'Total Sent', value: '209', color: 'blue' }, { label: 'Delivered', value: '203', color: 'green' }, { label: 'Read', value: '130', color: 'amber' }, { label: 'Replied', value: '35', color: 'teal' }].map(s => (
//                     <div key={s.label} style={{ ...S.card, textAlign: 'center' }}>
//                         <div style={{ fontSize: 24, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                         <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Campaigns table */}
//             <div style={S.card}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//                     <thead>
//                         <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
//                             {['Campaign', 'Template', 'Segment', 'Sent', 'Delivered', 'Read', 'Replied', 'Status', 'Scheduled'].map(h => (
//                                 <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {broadcasts.map(b => (
//                             <tr key={b.id} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
//                                 <td style={{ padding: '10px 10px', fontWeight: 600, color: '#111' }}>{b.name}</td>
//                                 <td style={{ padding: '10px 10px', color: '#555', fontFamily: 'monospace', fontSize: 12 }}>{b.template}</td>
//                                 <td style={{ padding: '10px 10px' }}><span style={{ background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{b.segment}</span></td>
//                                 <td style={{ padding: '10px 10px', color: '#333' }}>{b.sent}</td>
//                                 <td style={{ padding: '10px 10px', color: '#27500A' }}>{b.delivered}</td>
//                                 <td style={{ padding: '10px 10px', color: '#633806' }}>{b.read}</td>
//                                 <td style={{ padding: '10px 10px', color: '#3c3489' }}>{b.replied}</td>
//                                 <td style={{ padding: '10px 10px' }}><StatusBadge status={b.status === 'completed' ? 'approved' : b.status === 'scheduled' ? 'pending' : 'pending'} /></td>
//                                 <td style={{ padding: '10px 10px', color: '#888', fontSize: 12 }}>{b.date} {b.time}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* New broadcast modal */}
//             {showNewBroadcast && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
//                         <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Create New Campaign</h3>
//                         <label style={S.label}>Campaign Name</label>
//                         <input style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.name} onChange={e => setNewBroadcast(p => ({ ...p, name: e.target.value }))} placeholder="e.g. April Promo Blast" />
//                         <label style={S.label}>Template</label>
//                         <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.template} onChange={e => setNewBroadcast(p => ({ ...p, template: e.target.value }))}>
//                             <option value="">Select approved template...</option>
//                             {templates.filter(t => t.status === 'approved').map(t => <option key={t.id} value={t.name}>{t.label}</option>)}
//                         </select>
//                         <label style={S.label}>Target Segment</label>
//                         <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.segment} onChange={e => setNewBroadcast(p => ({ ...p, segment: e.target.value }))}>
//                             {['All Contacts', 'Hot Leads', 'Qualified', 'New', 'Unassigned'].map(s => <option key={s}>{s}</option>)}
//                         </select>
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
//                             <div><label style={S.label}>Date</label><input type="date" style={S.input} value={newBroadcast.date} onChange={e => setNewBroadcast(p => ({ ...p, date: e.target.value }))} /></div>
//                             <div><label style={S.label}>Time</label><input type="time" style={S.input} value={newBroadcast.time} onChange={e => setNewBroadcast(p => ({ ...p, time: e.target.value }))} /></div>
//                         </div>
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={submitBroadcast} style={{ ...S.btn(true), flex: 1, textAlign: 'center' }}>Schedule Campaign</button>
//                             <button onClick={() => setShowNewBroadcast(false)} style={{ ...S.btn(false), flex: 1, textAlign: 'center' }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     const renderTemplatesView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Message Templates</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Meta-approved WhatsApp Business templates</p>
//                 </div>
//                 <button onClick={() => setShowNewTemplate(true)} style={S.btn(true)}>+ Submit Template</button>
//             </div>

//             {/* Stats */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
//                 {[{ label: 'Approved', value: templates.filter(t => t.status === 'approved').length, color: 'green' }, { label: 'Pending Review', value: templates.filter(t => t.status === 'pending').length, color: 'amber' }, { label: 'Rejected', value: templates.filter(t => t.status === 'rejected').length, color: 'coral' }].map(s => (
//                     <div key={s.label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
//                         <div style={{ fontSize: 28, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                         <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Templates list */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {templates.map(t => (
//                     <div key={t.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
//                         <div style={{ flex: 1 }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
//                                 <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{t.label}</span>
//                                 <StatusBadge status={t.status} />
//                                 <span style={{ fontSize: 10, background: '#f0f0f0', color: '#555', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>{t.category}</span>
//                                 <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{t.name}</span>
//                             </div>
//                             <div style={{ fontSize: 13, color: '#444', background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>{t.body}</div>
//                             {t.rejectionReason && <div style={{ fontSize: 12, color: '#712B13', background: '#FAECE7', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>Rejection reason: {t.rejectionReason}</div>}
//                             <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Used {t.usageCount} times</span>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Last used: {t.lastUsed}</span>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Lang: {t.language}</span>
//                             </div>
//                         </div>
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                             {t.status === 'approved' && <button style={S.btn(true)} onClick={() => { setView('inbox'); setMode('template'); }}>Use</button>}
//                             {t.status === 'rejected' && <button style={S.btn(false)} onClick={() => setTemplates(prev => prev.map(tt => tt.id === t.id ? { ...tt, status: 'pending', rejectionReason: undefined } : tt))}>Resubmit</button>}
//                             {t.status === 'pending' && <div style={{ fontSize: 11, color: '#BA7517', background: '#FAEEDA', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>Under review<br /><span style={{ color: '#aaa' }}>24-48 hrs</span></div>}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Submit template modal */}
//             {showNewTemplate && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
//                         <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Submit New Template to Meta</h3>
//                         <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Templates require Meta approval before use (24-48 hrs)</p>
//                         <label style={S.label}>Template Name</label>
//                         <input style={{ ...S.input, marginBottom: 14 }} value={newTpl.label} onChange={e => setNewTpl(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Welcome Message" />
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
//                             <div>
//                                 <label style={S.label}>Category</label>
//                                 <select style={S.input} value={newTpl.category} onChange={e => setNewTpl(p => ({ ...p, category: e.target.value }))}>
//                                     <option value="UTILITY">Utility</option>
//                                     <option value="MARKETING">Marketing</option>
//                                     <option value="AUTHENTICATION">Authentication</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label style={S.label}>Language</label>
//                                 <select style={S.input} value={newTpl.language} onChange={e => setNewTpl(p => ({ ...p, language: e.target.value }))}>
//                                     <option value="en">English</option>
//                                     <option value="hi">Hindi</option>
//                                     <option value="en_IN">English (India)</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <label style={S.label}>Message Body</label>
//                         <textarea style={{ ...S.input, resize: 'vertical', marginBottom: 6, minHeight: 100 }} value={newTpl.body} onChange={e => setNewTpl(p => ({ ...p, body: e.target.value }))} placeholder="Use {{1}} for customer name, {{2}} for second variable..." rows={4} />
//                         <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 18px' }}>Tip: Use {'{{1}}'}, {'{{2}}'} for dynamic variables. Avoid promotional language in Utility templates.</p>
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={submitTemplate} style={{ ...S.btn(true), flex: 1, textAlign: 'center' }}>Submit to Meta</button>
//                             <button onClick={() => setShowNewTemplate(false)} style={{ ...S.btn(false), flex: 1, textAlign: 'center' }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     const renderAutomationView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Automation Rules</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{rules.filter(r => r.on).length} active rules · {rules.reduce((s, r) => s + r.execCount, 0).toLocaleString()} total executions</p>
//                 </div>
//                 <button onClick={() => setShowNewRule(true)} style={S.btn(true)}>+ Add Rule</button>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                 {rules.map((r, i) => {
//                     const col = COLORS[r.color] || COLORS.blue;
//                     return (
//                         <div key={r.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, opacity: r.on ? 1 : 0.6 }}>
//                             <div style={{ width: 40, height: 40, borderRadius: 10, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
//                             <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{r.title}</div>
//                                 <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                                     <span style={{ background: '#f0f0f0', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>WHEN: {r.trigger}</span>
//                                     <span style={{ color: '#ccc' }}>→</span>
//                                     <span style={{ background: col.bg, color: col.text, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>DO: {r.action}</span>
//                                 </div>
//                             </div>
//                             <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                                 <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>{r.execCount.toLocaleString()} runs</div>
//                                 <Toggle on={r.on} onChange={() => setRules(prev => prev.map((rr, ii) => ii === i ? { ...rr, on: !rr.on } : rr))} />
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {showNewRule && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
//                         <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Add Automation Rule</h3>
//                         <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Rules run automatically based on triggers</p>
//                         <label style={S.label}>Trigger Event</label>
//                         <select style={{ ...S.input, marginBottom: 14 }}>
//                             <option>New contact first message</option>
//                             <option>Message contains keyword</option>
//                             <option>1hr before session expiry</option>
//                             <option>24hr of no agent reply</option>
//                             <option>Contact enters stage</option>
//                             <option>Contact assigned</option>
//                         </select>
//                         <label style={S.label}>Action</label>
//                         <select style={{ ...S.input, marginBottom: 14 }}>
//                             <option>Send approved template</option>
//                             <option>Assign to agent</option>
//                             <option>Move to stage</option>
//                             <option>Notify agent via email</option>
//                             <option>Add tag</option>
//                             <option>Run bot flow</option>
//                         </select>
//                         <label style={S.label}>Rule Name</label>
//                         <input style={{ ...S.input, marginBottom: 20 }} placeholder="e.g. Keyword routing" />
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={() => { setRules(prev => [...prev, { id: `r${Date.now()}`, icon: '⚙️', title: 'New Rule', trigger: 'Custom trigger', action: 'Custom action', on: true, color: 'blue', execCount: 0 }]); setShowNewRule(false); }} style={{ ...S.btn(true), flex: 1, textAlign: 'center' }}>Create Rule</button>
//                             <button onClick={() => setShowNewRule(false)} style={{ ...S.btn(false), flex: 1, textAlign: 'center' }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     const renderAnalyticsView = () => {
//         const bars = [{ l: 'Mon', v: 34 }, { l: 'Tue', v: 67 }, { l: 'Wed', v: 45 }, { l: 'Thu', v: 89 }, { l: 'Fri', v: 123 }, { l: 'Sat', v: 56 }, { l: 'Sun', v: 28 }];
//         const max = Math.max(...bars.map(b => b.v));
//         return (
//             <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//                 <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>Analytics</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
//                     {[{ label: 'New Contacts', value: '142', delta: '+12%', color: 'blue' }, { label: 'Conversations', value: '89', delta: '+5%', color: 'green' }, { label: 'Conversion Rate', value: '23%', delta: '+2%', color: 'teal' }, { label: 'Avg Response Time', value: '4.2m', delta: '-18%', color: 'amber' }].map(s => (
//                         <div key={s.label} style={S.card}>
//                             <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{s.label}</div>
//                             <div style={{ fontSize: 26, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                             <div style={{ fontSize: 11, color: '#27500A', marginTop: 4 }}>{s.delta} this week</div>
//                         </div>
//                     ))}
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
//                     <div style={S.card}>
//                         <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Messages This Week</div>
//                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
//                             {bars.map(b => (
//                                 <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
//                                     <div style={{ width: '100%', background: '#E6F1FB', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 120}px`, position: 'relative' }}>
//                                         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#185FA5', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 100}%` }} />
//                                     </div>
//                                     <div style={{ fontSize: 10, color: '#888' }}>{b.l}</div>
//                                     <div style={{ fontSize: 10, fontWeight: 600, color: '#185FA5' }}>{b.v}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div style={S.card}>
//                         <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Stage Distribution</div>
//                         {PIPELINE_STAGES.map(stage => {
//                             const count = convos.filter(c => c.stage === stage).length;
//                             const pct = Math.round((count / convos.length) * 100);
//                             const col = COLORS[{ 'New': 'blue', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' }[stage]] || COLORS.blue;
//                             return (
//                                 <div key={stage} style={{ marginBottom: 10 }}>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
//                                         <span style={{ color: '#555' }}>{stage}</span>
//                                         <span style={{ fontWeight: 600, color: col.text }}>{count}</span>
//                                     </div>
//                                     <div style={{ height: 6, background: '#f0f0f0', borderRadius: 4 }}>
//                                         <div style={{ width: `${pct}%`, height: '100%', background: col.border, borderRadius: 4, minWidth: count > 0 ? 4 : 0 }} />
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 <div style={{ ...S.card, marginTop: 16 }}>
//                     <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Agent Performance</div>
//                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//                         <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
//                             {['Agent', 'Assigned', 'Resolved', 'Avg Response', 'Satisfaction'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>)}
//                         </tr></thead>
//                         <tbody>
//                             {[{ name: 'Priya', assigned: 2, resolved: 8, response: '3.1m', sat: '4.8/5' }, { name: 'Rohan', assigned: 1, resolved: 5, response: '5.2m', sat: '4.5/5' }, { name: 'Bot', assigned: 1, resolved: 14, response: '0.1m', sat: '4.1/5' }].map(a => (
//                                 <tr key={a.name} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
//                                     <td style={{ padding: '10px 10px', fontWeight: 600 }}>{a.name}</td>
//                                     <td style={{ padding: '10px 10px', color: '#185FA5' }}>{a.assigned}</td>
//                                     <td style={{ padding: '10px 10px', color: '#27500A' }}>{a.resolved}</td>
//                                     <td style={{ padding: '10px 10px', color: '#555' }}>{a.response}</td>
//                                     <td style={{ padding: '10px 10px', color: '#633806', fontWeight: 600 }}>{a.sat}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         );
//     };

//     // ─── Right panel
//     const renderRightPanel = () => {
//         if (rpTab === 'contact') return (
//             <>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
//                     <Avatar initials={activeConv.initials} color={activeConv.color} size={44} />
//                     <div><div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv.name}</div><div style={{ fontSize: 12, color: '#888' }}>{activeConv.phone}</div></div>
//                 </div>
//                 {[{ label: 'Stage', val: <Tag tag={activeConv.tag} stage={activeConv.stage} /> }, { label: 'Assigned to', val: activeConv.assigned }, { label: 'Source', val: 'WhatsApp inbound' }, { label: 'Last contact', val: activeConv.time + ' ago' }].map(f => (
//                     <div key={f.label} style={{ marginBottom: 12 }}>
//                         <div style={S.label}>{f.label}</div>
//                         {typeof f.val === 'string' ? <div style={{ fontSize: 13, color: '#333' }}>{f.val}</div> : f.val}
//                     </div>
//                 ))}
//                 <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => { setRpTab('pipeline'); setTimeout(advanceStage, 200); }}>Move to next stage →</button>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={assignAgent}>Reassign agent →</button>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => setRpTab('pipeline')}>View pipeline →</button>
//                 </div>
//             </>
//         );
//         if (rpTab === 'pipeline') {
//             const done = activeConv.pipeline.filter(s => s.done).length;
//             return (
//                 <>
//                     <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{done} of {activeConv.pipeline.length} stages complete</div>
//                     <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
//                         {activeConv.pipeline.map((s, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: s.done ? '#185FA5' : '#e0e0e0' }} />)}
//                     </div>
//                     {activeConv.pipeline.map((s, i) => {
//                         const isCurrent = !s.done && (i === 0 || activeConv.pipeline[i - 1].done);
//                         return (
//                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #f5f5f5' }}>
//                                 <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.done ? '#1D9E75' : isCurrent ? '#185FA5' : '#ccc' }} />
//                                 <div style={{ flex: 1 }}>
//                                     <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{s.stage}</div>
//                                     <div style={{ fontSize: 11, color: '#aaa' }}>{s.date}</div>
//                                 </div>
//                                 {s.done ? <span style={{ fontSize: 10, background: '#EAF3DE', color: '#27500A', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Done</span> : isCurrent ? <span style={{ fontSize: 10, background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Current</span> : null}
//                             </div>
//                         );
//                     })}
//                     <button onClick={advanceStage} style={{ ...S.btn(true), width: '100%', textAlign: 'center', marginTop: 12 }}>Move to next stage</button>
//                 </>
//             );
//         }
//         if (rpTab === 'notes') return (
//             <>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
//                     {activeConv.notes.length ? activeConv.notes.map((n, i) => <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, fontSize: 12, color: '#444', lineHeight: 1.6, borderLeft: '3px solid #185FA5' }}>{n}</div>) : <div style={{ fontSize: 13, color: '#bbb' }}>No notes yet.</div>}
//                 </div>
//                 <textarea rows={3} style={{ ...S.input, resize: 'none', marginBottom: 8 }} placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
//                 <button onClick={addNote} style={{ ...S.btn(true), width: '100%', textAlign: 'center' }}>Save note</button>
//             </>
//         );
//         if (rpTab === 'auto') return (
//             <>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Active automations</div>
//                 {rules.map((r, i) => {
//                     const col = COLORS[r.color] || COLORS.blue;
//                     return (
//                         <div key={r.id} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
//                             <div style={{ width: 28, height: 28, borderRadius: 7, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{r.icon}</div>
//                             <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</div>
//                                 <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{r.trigger}</div>
//                             </div>
//                             <Toggle on={r.on} onChange={() => setRules(prev => prev.map((rr, ii) => ii === i ? { ...rr, on: !rr.on } : rr))} />
//                         </div>
//                     );
//                 })}
//             </>
//         );
//     };

//     // ─── Inbox (main 3-col layout)
//     const renderInbox = () => (
//         <>
//             {/* Left panel */}
//             <div style={{ width: 270, borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
//                 <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', gap: 8 }}>
//                     <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...S.input, flex: 1 }} />
//                     <button onClick={() => {
//                         const name = prompt('Contact name:'); if (!name) return;
//                         const phone = prompt('Phone:'); if (!phone) return;
//                         const initials = name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
//                         const colorKeys = Object.keys(COLORS);
//                         const newC = { id: Date.now(), name, phone, tag: 'new', stage: 'New', assigned: 'Unassigned', unread: 0, lastMsg: 'New contact', time: 'now', sessionExpiry: false, color: colorKeys[convos.length % colorKeys.length], initials, messages: [], notes: [], pipeline: [{ stage: 'Enquiry', done: false, date: '-' }, { stage: 'Qualified', done: false, date: '-' }, { stage: 'Proposal', done: false, date: '-' }, { stage: 'Negotiation', done: false, date: '-' }, { stage: 'Closed', done: false, date: '-' }] };
//                         setConvos(prev => [newC, ...prev]); setActiveId(newC.id);
//                     }} style={S.btn(true)}>+</button>
//                 </div>
//                 <div style={{ display: 'flex', padding: '6px 10px', gap: 4, borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
//                     {['all', 'mine', 'bot', 'unread'].map(f => (
//                         <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', background: filter === f ? '#E6F1FB' : 'transparent', color: filter === f ? '#0C447C' : '#888', fontWeight: filter === f ? 700 : 400, fontFamily: 'inherit' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
//                     ))}
//                 </div>
//                 <div style={{ overflowY: 'auto', flex: 1 }}>
//                     {filtered.map(c => (
//                         <div key={c.id} onClick={() => selectConv(c.id)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f0f0f0', display: 'flex', gap: 10, background: c.id === activeId ? '#EDF4FC' : 'transparent', transition: 'background .1s' }}>
//                             <Avatar initials={c.initials} color={c.color} size={38} />
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                     <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{c.name}</span>
//                                     <span style={{ fontSize: 10, color: '#aaa' }}>{c.time}</span>
//                                 </div>
//                                 <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{c.lastMsg}</div>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
//                                     <Tag tag={c.tag} stage={c.stage} />
//                                     {c.unread > 0 && <span style={{ background: '#E24B4A', color: '#fff', fontSize: 10, borderRadius: 8, padding: '1px 5px', fontWeight: 700 }}>{c.unread}</span>}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Chat area */}
//             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//                 {/* Header */}
//                 <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
//                     <Avatar initials={activeConv.initials} color={activeConv.color} size={36} />
//                     <div style={{ flex: 1 }}>
//                         <div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv.name}</div>
//                         <div style={{ fontSize: 12, color: '#888' }}>{activeConv.phone} · {activeConv.assigned === 'Bot' ? <span style={{ color: '#BA7517' }}>Bot handling</span> : `Agent: ${activeConv.assigned}`}</div>
//                     </div>
//                     <div style={{ display: 'flex', gap: 6 }}>
//                         {[{ label: 'Take over', fn: takeOver }, { label: 'Resolve', fn: resolveConv }, { label: 'Transfer', fn: transferConv }].map(btn => (
//                             <button key={btn.label} onClick={btn.fn} style={{ ...S.btn(false), fontSize: 12 }}>{btn.label}</button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Messages */}
//                 <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f7f9' }}>
//                     <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa' }}>Conversation started · {activeConv.time} ago</div>
//                     {activeConv.messages.map((msg, idx) => {
//                         if (msg.dir === 'system') return <div key={idx} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', background: '#e8e8e8', borderRadius: 8, padding: '4px 12px', alignSelf: 'center' }}>{msg.text}</div>;
//                         if (msg.dir === 'bot') return (
//                             <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
//                                 <span style={{ fontSize: 10, background: '#FAEEDA', color: '#633806', padding: '2px 8px', borderRadius: 8, fontWeight: 700, marginBottom: 3, display: 'inline-block' }}>Bot</span>
//                                 <div style={{ background: '#FAEEDA', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, color: '#412402' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{msg.time}</div>
//                             </div>
//                         );
//                         if (msg.dir === 'in') return (
//                             <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
//                                 <div style={{ background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, border: '0.5px solid #e0e0e0' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{msg.time}</div>
//                             </div>
//                         );
//                         if (msg.dir === 'note') return (
//                             <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
//                                 <div style={{ background: '#FFFBEA', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, fontStyle: 'italic', color: '#633806', border: '0.5px solid #FAC775' }}>[Note] {msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{msg.time}</div>
//                             </div>
//                         );
//                         return (
//                             <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
//                                 <div style={{ background: '#DCF8C6', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, color: '#1a3a1a' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{msg.time} · <span style={{ color: '#1D9E75' }}>Read</span></div>
//                             </div>
//                         );
//                     })}
//                     <div ref={messagesEnd} />
//                 </div>

//                 {/* Session expiry warning */}
//                 {activeConv.sessionExpiry && (
//                     <div style={{ background: '#FAEEDA', padding: '8px 14px', fontSize: 12, color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #FAC775', flexShrink: 0 }}>
//                         <span>24hr session expired — use an approved template to re-open</span>
//                         <button onClick={() => setMode('template')} style={{ fontSize: 11, background: '#EF9F27', color: '#412402', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Send template</button>
//                     </div>
//                 )}

//                 {/* Compose */}
//                 <div style={{ padding: '10px 14px', borderTop: '0.5px solid #e8e8e8', background: '#fff', flexShrink: 0 }}>
//                     <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
//                         {['text', 'template', 'quick', 'note'].map(m => (
//                             <button key={m} onClick={() => setMode(m)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', background: mode === m ? '#E6F1FB' : 'transparent', color: mode === m ? '#0C447C' : '#888', fontWeight: mode === m ? 700 : 400, fontFamily: 'inherit' }}>
//                                 {m === 'text' ? 'Text' : m === 'template' ? 'Template' : m === 'quick' ? 'Quick reply' : 'Note'}
//                             </button>
//                         ))}
//                         <button onClick={aiReply} disabled={aiLoading} style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 12px', borderRadius: 8, cursor: 'pointer', border: 'none', background: aiLoading ? '#f0f0f0' : '#E6F1FB', color: aiLoading ? '#aaa' : '#0C447C', fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
//                             {aiLoading ? '...' : '✦ AI Reply'}
//                         </button>
//                     </div>

//                     {mode === 'template' && (
//                         <div style={{ marginBottom: 8, maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
//                             {templates.filter(t => t.status === 'approved').map((t, i) => (
//                                 <div key={t.id} onClick={() => { const f = t.body.replace(/{{1}}/g, activeConv.name.split(' ')[0]).replace(/{{2}}/g, activeConv.name.split(' ')[0].toLowerCase()); setCompose(f); }} style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #ddd', cursor: 'pointer', background: '#fafafa' }}>
//                                     <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
//                                     <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.body.substring(0, 70)}...</div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {mode === 'quick' && (
//                         <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//                             {QUICK_REPLIES.map((q, i) => (
//                                 <button key={i} onClick={() => setCompose(q)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 10, border: '0.5px solid #ddd', cursor: 'pointer', background: '#f8f9fa', color: '#555', fontFamily: 'inherit' }}>{q.substring(0, 28)}{q.length > 28 ? '…' : ''}</button>
//                             ))}
//                         </div>
//                     )}

//                     <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
//                         <textarea rows={1} value={compose} onChange={e => setCompose(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={mode === 'note' ? 'Internal note — not sent to customer...' : 'Type a message...'} style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none', fontFamily: 'inherit', outline: 'none', background: mode === 'note' ? '#FFFBEA' : '#fafafa', minHeight: 38 }} />
//                         <button onClick={sendMessage} style={{ width: 38, height: 38, borderRadius: '50%', background: '#185FA5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                             <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Right panel */}
//             <div style={{ width: 290, borderLeft: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
//                 <div style={{ display: 'flex', borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
//                     {['contact', 'pipeline', 'notes', 'auto'].map(t => (
//                         <button key={t} onClick={() => setRpTab(t)} style={{ flex: 1, padding: '10px 0', fontSize: 12, textAlign: 'center', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit', color: rpTab === t ? '#185FA5' : '#888', fontWeight: rpTab === t ? 700 : 400, borderBottom: rpTab === t ? '2px solid #185FA5' : '2px solid transparent' }}>
//                             {t.charAt(0).toUpperCase() + t.slice(1)}
//                         </button>
//                     ))}
//                 </div>
//                 <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>{renderRightPanel()}</div>
//             </div>
//         </>
//     );

//     return (
//         <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', fontSize: 13, color: '#111' }}>
//             {/* Sidebar */}
//             <div style={{ width: 52, background: '#fff', borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0 }}>
//                 <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
//                     <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
//                 </div>
//                 {sideIcons.map(icon => (
//                     <div key={icon.id} onClick={() => setView(icon.id)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: view === icon.id ? '#E6F1FB' : 'transparent', color: view === icon.id ? '#185FA5' : '#888', transition: 'all .15s' }}
//                         onMouseOver={e => { if (view !== icon.id) e.currentTarget.style.background = '#f5f5f5'; }}
//                         onMouseOut={e => { if (view !== icon.id) e.currentTarget.style.background = 'transparent'; }}>
//                         <div style={{ width: 18, height: 18 }}>{icon.svg}</div>
//                         {icon.badge > 0 && <div style={{ position: 'absolute', top: -2, right: -2, background: '#E24B4A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px', lineHeight: 1.4 }}>{icon.badge}</div>}
//                     </div>
//                 ))}
//                 <div style={{ flex: 1 }} />
//                 <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>P</div>
//             </div>

//             {/* Main content */}
//             <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
//                 {view === 'inbox' && renderInbox()}
//                 {view === 'pipeline' && renderPipelineView()}
//                 {view === 'broadcast' && renderBroadcastView()}
//                 {view === 'templates' && renderTemplatesView()}
//                 {view === 'automation' && renderAutomationView()}
//                 {view === 'analytics' && renderAnalyticsView()}
//             </div>
//         </div>
//     );
// }
// import { useState, useEffect, useRef } from "react";
// import { whatsappAPI } from "../../lib/whatsappApi";

// const COLORS = {
//     blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
//     green: { bg: '#EAF3DE', border: '#639922', text: '#27500A' },
//     amber: { bg: '#FAEEDA', border: '#EF9F27', text: '#633806' },
//     coral: { bg: '#FAECE7', border: '#D85A30', text: '#712B13' },
//     purple: { bg: '#EEEDFE', border: '#7F77DD', text: '#3C3489' },
//     teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#085041' },
// };

// const PIPELINE_STAGES = ['New', 'Enquiry', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

// const QUICK_REPLIES = [
//     'Sure, let me check that for you!',
//     'Our team will call you shortly.',
//     'Here is the pricing: Basic Rs 999, Pro Rs 2499',
//     'Thanks for your interest! Can I know your budget?',
//     'Please share your email so I can send the details.',
// ];

// // ---------- Helper Components (unchanged) ----------
// const Tag = ({ tag, stage }) => {
//     const map = { hot: { label: 'Hot', c: 'coral' }, conv: { label: 'Converted', c: 'purple' }, new: { label: 'New', c: 'blue' }, qual: { label: 'Qualified', c: 'green' } };
//     const info = map[tag] || map['new'];
//     const col = COLORS[info.c];
//     return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: col.bg, color: col.text, border: `1px solid ${col.border}22` }}>{stage || info.label}</span>;
// };

// const Avatar = ({ initials, color = 'blue', size = 38 }) => {
//     const col = COLORS[color] || COLORS.blue;
//     return <div style={{ width: size, height: size, borderRadius: '50%', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${col.border}44`, fontFamily: 'Georgia, serif' }}>{initials}</div>;
// };

// const StatusBadge = ({ status }) => {
//     const map = { approved: { bg: '#EAF3DE', color: '#27500A', label: 'Approved' }, pending: { bg: '#FAEEDA', color: '#633806', label: 'Pending' }, rejected: { bg: '#FAECE7', color: '#712B13', label: 'Rejected' } };
//     const s = map[status] || map.pending;
//     return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
// };

// const Toggle = ({ on, onChange }) => (
//     <button onClick={onChange} style={{ width: 34, height: 20, borderRadius: 10, background: on ? '#1D9E75' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
//         <span style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: on ? 17 : 3, transition: 'left .2s' }} />
//     </button>
// );

// // ---------- Main App ----------
// export default function App() {
//     const [view, setView] = useState('inbox');
//     const [convos, setConvos] = useState([]);
//     const [activeId, setActiveId] = useState(null);
//     const [filter, setFilter] = useState('all');
//     const [search, setSearch] = useState('');
//     const [rpTab, setRpTab] = useState('contact');
//     const [mode, setMode] = useState('text');
//     const [compose, setCompose] = useState('');
//     const [noteText, setNoteText] = useState('');
//     const [rules, setRules] = useState([]);
//     const [broadcasts, setBroadcasts] = useState([]);
//     const [templates, setTemplates] = useState([]);
//     const [aiLoading, setAiLoading] = useState(false);
//     const [showNewBroadcast, setShowNewBroadcast] = useState(false);
//     const [showNewRule, setShowNewRule] = useState(false);
//     const [showNewTemplate, setShowNewTemplate] = useState(false);
//     const [newTpl, setNewTpl] = useState({ label: '', body: '', category: 'UTILITY', language: 'en' });
//     const [newBroadcast, setNewBroadcast] = useState({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
//     const [loading, setLoading] = useState(true);
//     const [analytics, setAnalytics] = useState(null);
//     const messagesEnd = useRef(null);

//     const activeConv = convos.find(c => c.id === activeId) || null;

//     // Load all data on mount
//     useEffect(() => {
//         loadAllData();
//     }, []);

//     useEffect(() => {
//         if (activeConv?.messages) {
//             messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [activeConv?.messages, activeId]);

//     useEffect(() => {
//         if (view === 'analytics') {
//             whatsappAPI.getAnalytics().then(setAnalytics).catch(console.error);
//         }
//     }, [view]);

//     const loadAllData = async () => {
//         setLoading(true);
//         try {
//             const [contacts, templatesData, broadcastsData, rulesData] = await Promise.all([
//                 whatsappAPI.getContacts(),
//                 whatsappAPI.getTemplates(),
//                 whatsappAPI.getBroadcasts(),
//                 whatsappAPI.getRules()
//             ]);
//             // Transform contacts to match UI expectations
//             const enrichedContacts = contacts.map(c => ({
//                 ...c,
//                 unread: 0, // backend can later provide unread count
//                 lastMsg: c.last_message || '',
//                 time: c.last_contact_time ? new Date(c.last_contact_time).toLocaleTimeString() : '',
//                 tag: c.tag,
//                 stage: c.stage,
//                 assigned: c.assigned_to,
//                 color: c.color || 'blue',
//                 initials: c.initials || c.name.slice(0, 2).toUpperCase(),
//                 messages: c.messages || [],
//                 notes: c.notes || [],
//                 pipeline: c.pipeline || PIPELINE_STAGES.map(s => ({ stage: s, done: false, date: '-' }))
//             }));
//             setConvos(enrichedContacts);
//             setTemplates(templatesData);
//             setBroadcasts(broadcastsData);
//             setRules(rulesData.map(r => ({ ...r, on: r.is_active, execCount: r.execution_count })));
//             if (enrichedContacts.length && !activeId) setActiveId(enrichedContacts[0].id);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const selectConv = async (id) => {
//         setActiveId(id);
//         try {
//             const contact = await whatsappAPI.getContactById(id);
//             setConvos(prev => prev.map(c => c.id === id ? { ...c, ...contact, messages: contact.messages || [], notes: contact.notes || [], pipeline: contact.pipeline || [] } : c));
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const sendMessage = async () => {
//         if (!compose.trim() || !activeConv) return;
//         const isNote = mode === 'note';
//         try {
//             if (!isNote) {
//                 await whatsappAPI.sendMessage({
//                     contact_id: activeConv.id,
//                     text: compose,
//                     is_note: false,
//                     template_id: mode === 'template' ? templates.find(t => t.name === compose.split(' ')[0])?.id : undefined
//                 });
//             } else {
//                 await whatsappAPI.addNote(activeConv.id, compose);
//             }
//             const updated = await whatsappAPI.getContactById(activeConv.id);
//             setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, ...updated, messages: updated.messages || [], notes: updated.notes || [], pipeline: updated.pipeline || [] } : c));
//             setCompose('');
//         } catch (err) {
//             alert(err.response?.data?.error || 'Failed to send');
//         }
//     };

//     const aiReply = async () => {
//         if (!activeConv) return;
//         setAiLoading(true);
//         const history = activeConv.messages.slice(-6).map(m => `${m.direction === 'in' ? 'Customer' : 'Agent'}: ${m.text}`).join('\n');
//         try {
//             const res = await fetch('https://api.anthropic.com/v1/messages', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     model: 'claude-sonnet-4-20250514',
//                     max_tokens: 200,
//                     system: `You are a helpful WhatsApp CRM sales agent for a SaaS platform. Customer: ${activeConv.name}. Stage: ${activeConv.stage}. Keep replies short (1-3 sentences), friendly, professional. Don't use markdown.`,
//                     messages: [{ role: 'user', content: `Based on this conversation, write a short agent reply:\n${history}\n\nWrite only the reply text, nothing else.` }]
//                 })
//             });
//             const data = await res.json();
//             const text = data.content?.[0]?.text || 'I will get back to you shortly!';
//             setCompose(text);
//         } catch { setCompose('Thank you for reaching out! Our team will connect with you shortly.'); }
//         setAiLoading(false);
//     };

//     const takeOver = async () => {
//         if (!activeConv) return;
//         await whatsappAPI.updateContact(activeConv.id, { assigned_to: 'You' });
//         loadAllData();
//     };
//     const resolveConv = async () => {
//         if (!activeConv) return;
//         await whatsappAPI.updateContact(activeConv.id, { stage: 'Closed Won', tag: 'conv' });
//         loadAllData();
//     };
//     const transferConv = async () => {
//         if (!activeConv) return;
//         const agents = ['Priya', 'Rohan', 'Sales Team'];
//         const randomAgent = agents[Math.floor(Math.random() * agents.length)];
//         await whatsappAPI.updateContact(activeConv.id, { assigned_to: randomAgent });
//         loadAllData();
//     };
//     const advanceStage = async () => {
//         if (!activeConv) return;
//         const nextStage = activeConv.pipeline?.find(s => !s.done);
//         if (nextStage) {
//             await whatsappAPI.updatePipeline(activeConv.id, nextStage.stage_name, true, new Date().toISOString().slice(0, 10));
//             const updated = await whatsappAPI.getContactById(activeConv.id);
//             setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, ...updated } : c));
//         }
//     };
//     const addNote = async () => {
//         if (!noteText.trim() || !activeConv) return;
//         await whatsappAPI.addNote(activeConv.id, noteText);
//         const updated = await whatsappAPI.getContactById(activeConv.id);
//         setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, notes: updated.notes } : c));
//         setNoteText('');
//     };
//     const assignAgent = async () => {
//         if (!activeConv) return;
//         const agents = ['Priya', 'Rohan', 'Sales Team'];
//         const randomAgent = agents[Math.floor(Math.random() * agents.length)];
//         await whatsappAPI.updateContact(activeConv.id, { assigned_to: randomAgent });
//         loadAllData();
//     };
//     const submitTemplate = async () => {
//         if (!newTpl.label || !newTpl.body) return;
//         try {
//             await whatsappAPI.createTemplate({
//                 name: newTpl.label.toLowerCase().replace(/\s+/g, '_'),
//                 label: newTpl.label,
//                 category: newTpl.category,
//                 language: newTpl.language,
//                 body: newTpl.body,
//                 variables: []
//             });
//             await loadAllData();
//             setShowNewTemplate(false);
//             setNewTpl({ label: '', body: '', category: 'UTILITY', language: 'en' });
//         } catch (err) {
//             alert(err.response?.data?.error);
//         }
//     };
//     const submitBroadcast = async () => {
//         if (!newBroadcast.name || !newBroadcast.template) return;
//         const template = templates.find(t => t.name === newBroadcast.template);
//         if (!template) return;
//         try {
//             await whatsappAPI.createBroadcast({
//                 name: newBroadcast.name,
//                 template_id: template.id,
//                 segment: newBroadcast.segment,
//                 scheduled_date: newBroadcast.date,
//                 scheduled_time: newBroadcast.time
//             });
//             await loadAllData();
//             setShowNewBroadcast(false);
//             setNewBroadcast({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
//         } catch (err) {
//             alert(err.response?.data?.error);
//         }
//     };
//     const toggleRule = async (id, currentState) => {
//         await whatsappAPI.updateRule(id, !currentState);
//         loadAllData();
//     };

//     const filtered = convos.filter(c => {
//         if (filter === 'mine' && c.assigned !== 'Priya' && c.assigned !== 'Rohan') return false;
//         if (filter === 'bot' && c.assigned !== 'Bot') return false;
//         if (filter === 'unread' && !c.unread) return false;
//         if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
//         return true;
//     });

//     // Shared styles
//     const S = {
//         card: { background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, padding: '14px 16px' },
//         btn: (primary) => ({ background: primary ? '#185FA5' : '#f5f5f5', color: primary ? '#fff' : '#333', border: primary ? 'none' : '0.5px solid #ddd', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }),
//         input: { width: '100%', border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa' },
//         label: { fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' },
//     };

//     // ---------- Render Pipeline View ----------
//     const renderPipelineView = () => {
//         const byStage = PIPELINE_STAGES.reduce((acc, s) => { acc[s] = convos.filter(c => c.stage === s); return acc; }, {});
//         const stageColors = { 'New': 'blue', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' };
//         return (
//             <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                     <div>
//                         <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Sales Pipeline</h2>
//                         <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{convos.length} contacts across {PIPELINE_STAGES.length} stages</p>
//                     </div>
//                 </div>
//                 <div style={{ display: 'flex', gap: 12, minWidth: 900 }}>
//                     {PIPELINE_STAGES.map(stage => {
//                         const contacts = byStage[stage] || [];
//                         const col = COLORS[stageColors[stage]] || COLORS.blue;
//                         return (
//                             <div key={stage} style={{ flex: 1, minWidth: 140 }}>
//                                 <div style={{ background: col.bg, borderRadius: '8px 8px 0 0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${col.border}33` }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: col.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</span>
//                                     <span style={{ fontSize: 11, background: '#fff', color: col.text, borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>{contacts.length}</span>
//                                 </div>
//                                 <div style={{ background: '#f8f8f8', borderRadius: '0 0 8px 8px', minHeight: 400, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '0.5px solid #e0e0e0', borderTop: 'none' }}>
//                                     {contacts.map(c => (
//                                         <div key={c.id} onClick={() => { setView('inbox'); selectConv(c.id); }} style={{ background: '#fff', borderRadius: 8, padding: 10, cursor: 'pointer', border: '0.5px solid #e8e8e8' }}>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
//                                                 <Avatar initials={c.initials} color={c.color} size={26} />
//                                                 <div>
//                                                     <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{c.name}</div>
//                                                     <div style={{ fontSize: 10, color: '#888' }}>{c.assigned}</div>
//                                                 </div>
//                                             </div>
//                                             <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMsg}</div>
//                                             <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{c.time}</div>
//                                         </div>
//                                     ))}
//                                     {contacts.length === 0 && <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', paddingTop: 20 }}>No contacts</div>}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     // ---------- Render Broadcast View ----------
//     const renderBroadcastView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Broadcast Campaigns</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Send bulk WhatsApp messages to segments</p>
//                 </div>
//                 <button onClick={() => setShowNewBroadcast(true)} style={S.btn(true)}>+ New Campaign</button>
//             </div>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
//                 {[
//                     { label: 'Total Sent', value: broadcasts.reduce((s, b) => s + b.sent_count, 0), color: 'blue' },
//                     { label: 'Delivered', value: broadcasts.reduce((s, b) => s + b.delivered_count, 0), color: 'green' },
//                     { label: 'Read', value: broadcasts.reduce((s, b) => s + b.read_count, 0), color: 'amber' },
//                     { label: 'Replied', value: broadcasts.reduce((s, b) => s + b.replied_count, 0), color: 'teal' }
//                 ].map(s => (
//                     <div key={s.label} style={{ ...S.card, textAlign: 'center' }}>
//                         <div style={{ fontSize: 24, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                         <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
//                     </div>
//                 ))}
//             </div>
//             <div style={S.card}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//                     <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
//                         {['Campaign', 'Template', 'Segment', 'Sent', 'Delivered', 'Read', 'Replied', 'Status', 'Scheduled'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>)}
//                     </tr></thead>
//                     <tbody>
//                         {broadcasts.map(b => (
//                             <tr key={b.id} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
//                                 <td style={{ padding: '10px 10px', fontWeight: 600 }}>{b.name}</td>
//                                 <td style={{ padding: '10px 10px', fontFamily: 'monospace', fontSize: 12 }}>{b.template_name}</td>
//                                 <td style={{ padding: '10px 10px' }}><span style={{ background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{b.segment}</span></td>
//                                 <td style={{ padding: '10px 10px' }}>{b.sent_count}</td>
//                                 <td style={{ padding: '10px 10px' }}>{b.delivered_count}</td>
//                                 <td style={{ padding: '10px 10px' }}>{b.read_count}</td>
//                                 <td style={{ padding: '10px 10px' }}>{b.replied_count}</td>
//                                 <td style={{ padding: '10px 10px' }}><StatusBadge status={b.status === 'completed' ? 'approved' : 'pending'} /></td>
//                                 <td style={{ padding: '10px 10px', color: '#888', fontSize: 12 }}>{b.scheduled_date} {b.scheduled_time}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {showNewBroadcast && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440 }}>
//                         <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Create New Campaign</h3>
//                         <label style={S.label}>Campaign Name</label>
//                         <input style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.name} onChange={e => setNewBroadcast(p => ({ ...p, name: e.target.value }))} />
//                         <label style={S.label}>Template</label>
//                         <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.template} onChange={e => setNewBroadcast(p => ({ ...p, template: e.target.value }))}>
//                             <option value="">Select approved template...</option>
//                             {templates.filter(t => t.status === 'approved').map(t => <option key={t.id} value={t.name}>{t.label}</option>)}
//                         </select>
//                         <label style={S.label}>Target Segment</label>
//                         <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.segment} onChange={e => setNewBroadcast(p => ({ ...p, segment: e.target.value }))}>
//                             {['All Contacts', 'Hot Leads', 'Qualified', 'New', 'Unassigned'].map(s => <option key={s}>{s}</option>)}
//                         </select>
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
//                             <div><label style={S.label}>Date</label><input type="date" style={S.input} value={newBroadcast.date} onChange={e => setNewBroadcast(p => ({ ...p, date: e.target.value }))} /></div>
//                             <div><label style={S.label}>Time</label><input type="time" style={S.input} value={newBroadcast.time} onChange={e => setNewBroadcast(p => ({ ...p, time: e.target.value }))} /></div>
//                         </div>
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={submitBroadcast} style={{ ...S.btn(true), flex: 1 }}>Schedule Campaign</button>
//                             <button onClick={() => setShowNewBroadcast(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     // ---------- Render Templates View ----------
//     const renderTemplatesView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Message Templates</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Meta-approved WhatsApp Business templates</p>
//                 </div>
//                 <button onClick={() => setShowNewTemplate(true)} style={S.btn(true)}>+ Submit Template</button>
//             </div>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
//                 {[
//                     { label: 'Approved', value: templates.filter(t => t.status === 'approved').length, color: 'green' },
//                     { label: 'Pending Review', value: templates.filter(t => t.status === 'pending').length, color: 'amber' },
//                     { label: 'Rejected', value: templates.filter(t => t.status === 'rejected').length, color: 'coral' }
//                 ].map(s => (
//                     <div key={s.label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
//                         <div style={{ fontSize: 28, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                         <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
//                     </div>
//                 ))}
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {templates.map(t => (
//                     <div key={t.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
//                         <div style={{ flex: 1 }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
//                                 <span style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</span>
//                                 <StatusBadge status={t.status} />
//                                 <span style={{ fontSize: 10, background: '#f0f0f0', borderRadius: 6, padding: '2px 7px' }}>{t.category}</span>
//                                 <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{t.name}</span>
//                             </div>
//                             <div style={{ fontSize: 13, color: '#444', background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap' }}>{t.body}</div>
//                             {t.rejection_reason && <div style={{ fontSize: 12, color: '#712B13', background: '#FAECE7', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>Rejection reason: {t.rejection_reason}</div>}
//                             <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Used {t.usage_count} times</span>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Last used: {t.last_used || 'Never'}</span>
//                                 <span style={{ fontSize: 11, color: '#aaa' }}>Lang: {t.language}</span>
//                             </div>
//                         </div>
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                             {t.status === 'approved' && <button style={S.btn(true)} onClick={() => { setView('inbox'); setMode('template'); setCompose(t.body); }}>Use</button>}
//                             {t.status === 'rejected' && <button style={S.btn(false)} onClick={() => { /* resubmit logic can call API again */ alert('Resubmit via API') }}>Resubmit</button>}
//                             {t.status === 'pending' && <div style={{ fontSize: 11, color: '#BA7517', background: '#FAEEDA', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>Under review<br /><span style={{ color: '#aaa' }}>24-48 hrs</span></div>}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             {showNewTemplate && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480 }}>
//                         <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Submit New Template to Meta</h3>
//                         <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Templates require Meta approval before use (24-48 hrs)</p>
//                         <label style={S.label}>Template Name</label>
//                         <input style={{ ...S.input, marginBottom: 14 }} value={newTpl.label} onChange={e => setNewTpl(p => ({ ...p, label: e.target.value }))} />
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
//                             <div><label style={S.label}>Category</label><select style={S.input} value={newTpl.category} onChange={e => setNewTpl(p => ({ ...p, category: e.target.value }))}>
//                                 <option value="UTILITY">Utility</option><option value="MARKETING">Marketing</option><option value="AUTHENTICATION">Authentication</option>
//                             </select></div>
//                             <div><label style={S.label}>Language</label><select style={S.input} value={newTpl.language} onChange={e => setNewTpl(p => ({ ...p, language: e.target.value }))}>
//                                 <option value="en">English</option><option value="hi">Hindi</option><option value="en_IN">English (India)</option>
//                             </select></div>
//                         </div>
//                         <label style={S.label}>Message Body</label>
//                         <textarea style={{ ...S.input, minHeight: 100 }} value={newTpl.body} onChange={e => setNewTpl(p => ({ ...p, body: e.target.value }))} rows={4} />
//                         <p style={{ fontSize: 11, color: '#aaa', margin: '6px 0 18px' }}>Use {'{{1}}'}, {'{{2}}'} for dynamic variables.</p>
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={submitTemplate} style={{ ...S.btn(true), flex: 1 }}>Submit to Meta</button>
//                             <button onClick={() => setShowNewTemplate(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     // ---------- Render Automation View ----------
//     const renderAutomationView = () => (
//         <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//                 <div>
//                     <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Automation Rules</h2>
//                     <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{rules.filter(r => r.on).length} active rules · {rules.reduce((s, r) => s + r.execCount, 0).toLocaleString()} total executions</p>
//                 </div>
//                 <button onClick={() => setShowNewRule(true)} style={S.btn(true)}>+ Add Rule</button>
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                 {rules.map((r, i) => {
//                     const col = COLORS[r.color] || COLORS.blue;
//                     return (
//                         <div key={r.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, opacity: r.on ? 1 : 0.6 }}>
//                             <div style={{ width: 40, height: 40, borderRadius: 10, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
//                             <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{r.title}</div>
//                                 <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                                     <span style={{ background: '#f0f0f0', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>WHEN: {r.trigger_event}</span>
//                                     <span style={{ color: '#ccc' }}>→</span>
//                                     <span style={{ background: col.bg, color: col.text, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>DO: {r.action_type}</span>
//                                 </div>
//                             </div>
//                             <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                                 <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>{r.execCount.toLocaleString()} runs</div>
//                                 <Toggle on={r.on} onChange={() => toggleRule(r.id, r.on)} />
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//             {showNewRule && (
//                 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//                     <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440 }}>
//                         <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Add Automation Rule</h3>
//                         <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Rules run automatically based on triggers</p>
//                         <label style={S.label}>Trigger Event</label>
//                         <select style={{ ...S.input, marginBottom: 14 }}><option>New contact first message</option><option>Message contains keyword</option></select>
//                         <label style={S.label}>Action</label>
//                         <select style={{ ...S.input, marginBottom: 14 }}><option>Send approved template</option><option>Assign to agent</option></select>
//                         <label style={S.label}>Rule Name</label>
//                         <input style={{ ...S.input, marginBottom: 20 }} placeholder="e.g. Keyword routing" />
//                         <div style={{ display: 'flex', gap: 10 }}>
//                             <button onClick={() => { setShowNewRule(false); loadAllData(); }} style={{ ...S.btn(true), flex: 1 }}>Create Rule</button>
//                             <button onClick={() => setShowNewRule(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

//     // ---------- Render Analytics View (with real data) ----------
//     const renderAnalyticsView = () => {
//         if (!analytics) return <div style={{ flex: 1, padding: 20 }}>Loading analytics...</div>;
//         const { totalContacts, newContacts, conversionRate, stageDistribution, weeklyMessages } = analytics;
//         const bars = weeklyMessages.map(w => ({ l: w.date.slice(5), v: w.count }));
//         const max = Math.max(...bars.map(b => b.v), 1);
//         return (
//             <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
//                 <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>Analytics</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
//                     {[
//                         { label: 'New Contacts', value: newContacts, delta: '+12%', color: 'blue' },
//                         { label: 'Conversations', value: totalContacts, delta: '+5%', color: 'green' },
//                         { label: 'Conversion Rate', value: `${conversionRate}%`, delta: '+2%', color: 'teal' },
//                         { label: 'Avg Response Time', value: '4.2m', delta: '-18%', color: 'amber' }
//                     ].map(s => (
//                         <div key={s.label} style={S.card}>
//                             <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{s.label}</div>
//                             <div style={{ fontSize: 26, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
//                             <div style={{ fontSize: 11, color: '#27500A', marginTop: 4 }}>{s.delta} this week</div>
//                         </div>
//                     ))}
//                 </div>
//                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
//                     <div style={S.card}>
//                         <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Messages This Week</div>
//                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
//                             {bars.map(b => (
//                                 <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
//                                     <div style={{ width: '100%', background: '#E6F1FB', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 120}px`, position: 'relative' }}>
//                                         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#185FA5', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 100}%` }} />
//                                     </div>
//                                     <div style={{ fontSize: 10, color: '#888' }}>{b.l}</div>
//                                     <div style={{ fontSize: 10, fontWeight: 600, color: '#185FA5' }}>{b.v}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div style={S.card}>
//                         <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Stage Distribution</div>
//                         {stageDistribution.map(s => {
//                             const col = COLORS[{ 'New': 'blue', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' }[s.stage]] || COLORS.blue;
//                             const pct = Math.round((s.count / totalContacts) * 100);
//                             return (
//                                 <div key={s.stage} style={{ marginBottom: 10 }}>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
//                                         <span style={{ color: '#555' }}>{s.stage}</span>
//                                         <span style={{ fontWeight: 600, color: col.text }}>{s.count}</span>
//                                     </div>
//                                     <div style={{ height: 6, background: '#f0f0f0', borderRadius: 4 }}>
//                                         <div style={{ width: `${pct}%`, height: '100%', background: col.border, borderRadius: 4 }} />
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//                 <div style={{ ...S.card, marginTop: 16 }}>
//                     <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Agent Performance</div>
//                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//                         <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
//                             {['Agent', 'Assigned', 'Resolved', 'Avg Response', 'Satisfaction'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>)}
//                         </tr></thead>
//                         <tbody>
//                             {analytics.agentPerformance.map(a => (
//                                 <tr key={a.agent} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
//                                     <td style={{ padding: '10px 10px', fontWeight: 600 }}>{a.agent}</td>
//                                     <td style={{ padding: '10px 10px', color: '#185FA5' }}>{a.assigned}</td>
//                                     <td style={{ padding: '10px 10px', color: '#27500A' }}>{a.resolved}</td>
//                                     <td style={{ padding: '10px 10px', color: '#555' }}>—</td>
//                                     <td style={{ padding: '10px 10px', color: '#633806', fontWeight: 600 }}>—</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         );
//     };

//     // ---------- Right Panel ----------
//     const renderRightPanel = () => {
//         if (!activeConv) return <div>Select a conversation</div>;
//         if (rpTab === 'contact') return (
//             <>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
//                     <Avatar initials={activeConv.initials} color={activeConv.color} size={44} />
//                     <div><div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv.name}</div><div style={{ fontSize: 12, color: '#888' }}>{activeConv.phone}</div></div>
//                 </div>
//                 {[
//                     { label: 'Stage', val: <Tag tag={activeConv.tag} stage={activeConv.stage} /> },
//                     { label: 'Assigned to', val: activeConv.assigned },
//                     { label: 'Source', val: 'WhatsApp inbound' },
//                     { label: 'Last contact', val: activeConv.time + ' ago' }
//                 ].map(f => (
//                     <div key={f.label} style={{ marginBottom: 12 }}>
//                         <div style={S.label}>{f.label}</div>
//                         {typeof f.val === 'string' ? <div style={{ fontSize: 13, color: '#333' }}>{f.val}</div> : f.val}
//                     </div>
//                 ))}
//                 <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => { setRpTab('pipeline'); setTimeout(advanceStage, 200); }}>Move to next stage →</button>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={assignAgent}>Reassign agent →</button>
//                     <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => setRpTab('pipeline')}>View pipeline →</button>
//                 </div>
//             </>
//         );
//         if (rpTab === 'pipeline') {
//             const done = activeConv.pipeline?.filter(s => s.done).length || 0;
//             return (
//                 <>
//                     <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{done} of {activeConv.pipeline?.length || 0} stages complete</div>
//                     <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
//                         {activeConv.pipeline?.map((s, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: s.done ? '#185FA5' : '#e0e0e0' }} />)}
//                     </div>
//                     {activeConv.pipeline?.map((s, i) => {
//                         const isCurrent = !s.done && (i === 0 || activeConv.pipeline[i - 1].done);
//                         return (
//                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #f5f5f5' }}>
//                                 <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.done ? '#1D9E75' : isCurrent ? '#185FA5' : '#ccc' }} />
//                                 <div style={{ flex: 1 }}>
//                                     <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{s.stage}</div>
//                                     <div style={{ fontSize: 11, color: '#aaa' }}>{s.completed_date || '-'}</div>
//                                 </div>
//                                 {s.done ? <span style={{ fontSize: 10, background: '#EAF3DE', color: '#27500A', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Done</span> : isCurrent ? <span style={{ fontSize: 10, background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Current</span> : null}
//                             </div>
//                         );
//                     })}
//                     <button onClick={advanceStage} style={{ ...S.btn(true), width: '100%', textAlign: 'center', marginTop: 12 }}>Move to next stage</button>
//                 </>
//             );
//         }
//         if (rpTab === 'notes') return (
//             <>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
//                     {activeConv.notes?.length ? activeConv.notes.map((n, i) => <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, fontSize: 12, color: '#444', lineHeight: 1.6, borderLeft: '3px solid #185FA5' }}>{n.note || n}</div>) : <div style={{ fontSize: 13, color: '#bbb' }}>No notes yet.</div>}
//                 </div>
//                 <textarea rows={3} style={{ ...S.input, resize: 'none', marginBottom: 8 }} placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
//                 <button onClick={addNote} style={{ ...S.btn(true), width: '100%', textAlign: 'center' }}>Save note</button>
//             </>
//         );
//         if (rpTab === 'auto') return (
//             <>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Active automations</div>
//                 {rules.map((r, i) => {
//                     const col = COLORS[r.color] || COLORS.blue;
//                     return (
//                         <div key={r.id} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
//                             <div style={{ width: 28, height: 28, borderRadius: 7, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.icon}</div>
//                             <div style={{ flex: 1 }}>
//                                 <div style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</div>
//                                 <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{r.trigger_event}</div>
//                             </div>
//                             <Toggle on={r.on} onChange={() => toggleRule(r.id, r.on)} />
//                         </div>
//                     );
//                 })}
//             </>
//         );
//     };

//     // ---------- Inbox View ----------
//     const renderInbox = () => (
//         <>
//             <div style={{ width: 270, borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
//                 <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', gap: 8 }}>
//                     <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...S.input, flex: 1 }} />
//                     <button onClick={async () => {
//                         const name = prompt('Contact name:'); if (!name) return;
//                         const phone = prompt('Phone:'); if (!phone) return;
//                         const initials = name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
//                         await whatsappAPI.createContact({ name, phone, tag: 'new', stage: 'New', assigned_to: 'Unassigned', color: 'blue', initials });
//                         loadAllData();
//                     }} style={S.btn(true)}>+</button>
//                 </div>
//                 <div style={{ display: 'flex', padding: '6px 10px', gap: 4, borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
//                     {['all', 'mine', 'bot', 'unread'].map(f => (
//                         <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', background: filter === f ? '#E6F1FB' : 'transparent', color: filter === f ? '#0C447C' : '#888', fontWeight: filter === f ? 700 : 400 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
//                     ))}
//                 </div>
//                 <div style={{ overflowY: 'auto', flex: 1 }}>
//                     {filtered.map(c => (
//                         <div key={c.id} onClick={() => selectConv(c.id)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f0f0f0', display: 'flex', gap: 10, background: c.id === activeId ? '#EDF4FC' : 'transparent' }}>
//                             <Avatar initials={c.initials} color={c.color} size={38} />
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                     <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
//                                     <span style={{ fontSize: 10, color: '#aaa' }}>{c.time}</span>
//                                 </div>
//                                 <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{c.lastMsg}</div>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
//                                     <Tag tag={c.tag} stage={c.stage} />
//                                     {c.unread > 0 && <span style={{ background: '#E24B4A', color: '#fff', fontSize: 10, borderRadius: 8, padding: '1px 5px', fontWeight: 700 }}>{c.unread}</span>}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
//                 <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
//                     {activeConv && <Avatar initials={activeConv.initials} color={activeConv.color} size={36} />}
//                     <div style={{ flex: 1 }}>
//                         <div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv?.name || 'Select a conversation'}</div>
//                         <div style={{ fontSize: 12, color: '#888' }}>{activeConv?.phone} · {activeConv?.assigned === 'Bot' ? <span style={{ color: '#BA7517' }}>Bot handling</span> : `Agent: ${activeConv?.assigned}`}</div>
//                     </div>
//                     {activeConv && <div style={{ display: 'flex', gap: 6 }}>
//                         <button onClick={takeOver} style={S.btn(false)}>Take over</button>
//                         <button onClick={resolveConv} style={S.btn(false)}>Resolve</button>
//                         <button onClick={transferConv} style={S.btn(false)}>Transfer</button>
//                     </div>}
//                 </div>
//                 <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f7f9' }}>
//                     {activeConv?.messages?.map((msg, idx) => {
//                         if (msg.direction === 'system') return <div key={idx} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', background: '#e8e8e8', borderRadius: 8, padding: '4px 12px', alignSelf: 'center' }}>{msg.text}</div>;
//                         if (msg.direction === 'bot') return (
//                             <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
//                                 <span style={{ fontSize: 10, background: '#FAEEDA', color: '#633806', padding: '2px 8px', borderRadius: 8, fontWeight: 700, display: 'inline-block', marginBottom: 3 }}>Bot</span>
//                                 <div style={{ background: '#FAEEDA', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, color: '#412402' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
//                             </div>
//                         );
//                         if (msg.direction === 'in') return (
//                             <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
//                                 <div style={{ background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, border: '0.5px solid #e0e0e0' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
//                             </div>
//                         );
//                         if (msg.direction === 'note') return (
//                             <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
//                                 <div style={{ background: '#FFFBEA', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, fontStyle: 'italic', color: '#633806', border: '0.5px solid #FAC775' }}>[Note] {msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
//                             </div>
//                         );
//                         return (
//                             <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
//                                 <div style={{ background: '#DCF8C6', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, color: '#1a3a1a' }}>{msg.text}</div>
//                                 <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{new Date(msg.time_sent).toLocaleTimeString()} · <span style={{ color: '#1D9E75' }}>Read</span></div>
//                             </div>
//                         );
//                     })}
//                     <div ref={messagesEnd} />
//                 </div>
//                 {activeConv?.sessionExpiry && (
//                     <div style={{ background: '#FAEEDA', padding: '8px 14px', fontSize: 12, color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #FAC775', flexShrink: 0 }}>
//                         <span>24hr session expired — use an approved template to re-open</span>
//                         <button onClick={() => setMode('template')} style={{ fontSize: 11, background: '#EF9F27', color: '#412402', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send template</button>
//                     </div>
//                 )}
//                 <div style={{ padding: '10px 14px', borderTop: '0.5px solid #e8e8e8', background: '#fff', flexShrink: 0 }}>
//                     <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
//                         {['text', 'template', 'quick', 'note'].map(m => (
//                             <button key={m} onClick={() => setMode(m)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, border: 'none', background: mode === m ? '#E6F1FB' : 'transparent', color: mode === m ? '#0C447C' : '#888', fontWeight: mode === m ? 700 : 400 }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
//                         ))}
//                         <button onClick={aiReply} disabled={aiLoading} style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 12px', borderRadius: 8, border: 'none', background: aiLoading ? '#f0f0f0' : '#E6F1FB', color: aiLoading ? '#aaa' : '#0C447C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
//                             {aiLoading ? '...' : '✦ AI Reply'}
//                         </button>
//                     </div>
//                     {mode === 'template' && (
//                         <div style={{ marginBottom: 8, maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
//                             {templates.filter(t => t.status === 'approved').map(t => (
//                                 <div key={t.id} onClick={() => { setCompose(t.body); }} style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #ddd', cursor: 'pointer', background: '#fafafa' }}>
//                                     <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
//                                     <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.body.substring(0, 70)}...</div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                     {mode === 'quick' && (
//                         <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//                             {QUICK_REPLIES.map((q, i) => (
//                                 <button key={i} onClick={() => setCompose(q)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 10, border: '0.5px solid #ddd', background: '#f8f9fa', color: '#555' }}>{q.substring(0, 28)}{q.length > 28 ? '…' : ''}</button>
//                             ))}
//                         </div>
//                     )}
//                     <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
//                         <textarea rows={1} value={compose} onChange={e => setCompose(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={mode === 'note' ? 'Internal note — not sent to customer...' : 'Type a message...'} style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none', fontFamily: 'inherit', outline: 'none', background: mode === 'note' ? '#FFFBEA' : '#fafafa', minHeight: 38 }} />
//                         <button onClick={sendMessage} style={{ width: 38, height: 38, borderRadius: '50%', background: '#185FA5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                             <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#fff" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             <div style={{ width: 290, borderLeft: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
//                 <div style={{ display: 'flex', borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
//                     {['contact', 'pipeline', 'notes', 'auto'].map(t => (
//                         <button key={t} onClick={() => setRpTab(t)} style={{ flex: 1, padding: '10px 0', fontSize: 12, textAlign: 'center', cursor: 'pointer', border: 'none', background: 'none', color: rpTab === t ? '#185FA5' : '#888', fontWeight: rpTab === t ? 700 : 400, borderBottom: rpTab === t ? '2px solid #185FA5' : '2px solid transparent' }}>
//                             {t.charAt(0).toUpperCase() + t.slice(1)}
//                         </button>
//                     ))}
//                 </div>
//                 <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>{renderRightPanel()}</div>
//             </div>
//         </>
//     );

//     if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading CRM...</div>;

//     // ---------- Main Layout ----------
//     const sideIcons = [
//         { id: 'inbox', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, badge: convos.reduce((s, c) => s + c.unread, 0) },
//         { id: 'pipeline', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
//         { id: 'broadcast', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg> },
//         { id: 'templates', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>, badge: templates.filter(t => t.status === 'pending').length },
//         { id: 'automation', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="13 2 13 9 20 9" /><path d="M20 14.5v3.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" /><polyline points="10 16 12 18 16 14" /></svg> },
//         { id: 'analytics', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
//     ];

//     return (
//         <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', fontSize: 13, color: '#111' }}>
//             <div style={{ width: 52, background: '#fff', borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0 }}>
//                 <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
//                     <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
//                 </div>
//                 {sideIcons.map(icon => (
//                     <div key={icon.id} onClick={() => setView(icon.id)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: view === icon.id ? '#E6F1FB' : 'transparent', color: view === icon.id ? '#185FA5' : '#888' }}>
//                         <div style={{ width: 18, height: 18 }}>{icon.svg}</div>
//                         {icon.badge > 0 && <div style={{ position: 'absolute', top: -2, right: -2, background: '#E24B4A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px' }}>{icon.badge}</div>}
//                     </div>
//                 ))}
//                 <div style={{ flex: 1 }} />
//                 <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>P</div>
//             </div>
//             <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
//                 {view === 'inbox' && renderInbox()}
//                 {view === 'pipeline' && renderPipelineView()}
//                 {view === 'broadcast' && renderBroadcastView()}
//                 {view === 'templates' && renderTemplatesView()}
//                 {view === 'automation' && renderAutomationView()}
//                 {view === 'analytics' && renderAnalyticsView()}
//             </div>
//         </div>
//     );
// }
import { useState, useEffect, useRef } from "react";
import { whatsappAPI } from "../../lib/whatsappApi";

const COLORS = {
    blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
    green: { bg: '#EAF3DE', border: '#639922', text: '#27500A' },
    amber: { bg: '#FAEEDA', border: '#EF9F27', text: '#633806' },
    coral: { bg: '#FAECE7', border: '#D85A30', text: '#712B13' },
    purple: { bg: '#EEEDFE', border: '#7F77DD', text: '#3C3489' },
    teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#085041' },
};

const PIPELINE_STAGES = ['New', 'Enquiry', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
const QUICK_REPLIES = [
    'Sure, let me check that for you!',
    'Our team will call you shortly.',
    'Here is the pricing: Basic Rs 999, Pro Rs 2499',
    'Thanks for your interest! Can I know your budget?',
    'Please share your email so I can send the details.',
];

// ---------- Helper Components ----------
const Tag = ({ tag, stage }) => {
    const map = { hot: { label: 'Hot', c: 'coral' }, conv: { label: 'Converted', c: 'purple' }, new: { label: 'New', c: 'blue' }, qual: { label: 'Qualified', c: 'green' } };
    const info = map[tag] || map['new'];
    const col = COLORS[info.c];
    return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: col.bg, color: col.text, border: `1px solid ${col.border}22` }}>{stage || info.label}</span>;
};

const Avatar = ({ initials, color = 'blue', size = 38 }) => {
    const col = COLORS[color] || COLORS.blue;
    return <div style={{ width: size, height: size, borderRadius: '50%', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${col.border}44`, fontFamily: 'Georgia, serif' }}>{initials}</div>;
};

const StatusBadge = ({ status }) => {
    const map = { approved: { bg: '#EAF3DE', color: '#27500A', label: 'Approved' }, pending: { bg: '#FAEEDA', color: '#633806', label: 'Pending' }, rejected: { bg: '#FAECE7', color: '#712B13', label: 'Rejected' } };
    const s = map[status] || map.pending;
    return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
};

const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 34, height: 20, borderRadius: 10, background: on ? '#1D9E75' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
        <span style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: on ? 17 : 3, transition: 'left .2s' }} />
    </button>
);

// ---------- Main App ----------
export default function App() {
    const [view, setView] = useState('inbox');
    const [convos, setConvos] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [rpTab, setRpTab] = useState('contact');
    const [mode, setMode] = useState('text');
    const [compose, setCompose] = useState('');
    const [noteText, setNoteText] = useState('');
    const [rules, setRules] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [showNewBroadcast, setShowNewBroadcast] = useState(false);
    const [showNewRule, setShowNewRule] = useState(false);
    const [showNewTemplate, setShowNewTemplate] = useState(false);
    const [newTpl, setNewTpl] = useState<any>({ label: '', body: '', category: 'UTILITY', language: 'en' });
    const [newBroadcast, setNewBroadcast] = useState({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const messagesEnd = useRef(null);

    const activeConv = convos.find(c => c.id === activeId) || null;

    // Load all data on mount
    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (activeConv?.messages) {
            messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeConv?.messages, activeId]);

    useEffect(() => {
        if (view === 'analytics') {
            whatsappAPI.getAnalytics().then(setAnalytics).catch(console.error);
        }
    }, [view]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [contacts, templatesData, broadcastsData, rulesData] = await Promise.all([
                whatsappAPI.getContacts(),
                whatsappAPI.getTemplates(),
                whatsappAPI.getBroadcasts(),
                whatsappAPI.getRules()
            ]);
            const enrichedContacts = contacts.map(c => ({
                ...c,
                unread: 0,
                lastMsg: c.last_message || '',
                time: c.last_contact_time ? new Date(c.last_contact_time).toLocaleTimeString() : '',
                tag: c.tag,
                stage: c.stage,
                assigned: c.assigned_to,
                color: c.color || 'blue',
                initials: c.initials || c.name.slice(0, 2).toUpperCase(),
                messages: c.messages || [],
                notes: c.notes || [],
                pipeline: c.pipeline || PIPELINE_STAGES.map(s => ({ stage: s, done: false, date: '-' }))
            }));
            setConvos(enrichedContacts);
            setTemplates(templatesData);
            setBroadcasts(broadcastsData);
            setRules(rulesData.map(r => ({ ...r, on: r.is_active, execCount: r.execution_count })));
            if (enrichedContacts.length && !activeId) setActiveId(enrichedContacts[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectConv = async (id) => {
        setActiveId(id);
        try {
            const contact = await whatsappAPI.getContactById(id);
            setConvos(prev => prev.map(c => c.id === id ? { ...c, ...contact, messages: contact.messages || [], notes: contact.notes || [], pipeline: contact.pipeline || [] } : c));
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        if (!compose.trim() || !activeConv) return;
        const isNote = mode === 'note';
        try {
            if (!isNote) {
                await whatsappAPI.sendMessage({
                    contact_id: activeConv.id,
                    text: compose,
                    is_note: false,
                    template_id: mode === 'template' ? templates.find(t => t.label === compose.split('\n')[0])?.id : undefined
                });
            } else {
                await whatsappAPI.addNote(activeConv.id, compose);
            }
            const updated = await whatsappAPI.getContactById(activeConv.id);
            setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, ...updated, messages: updated.messages || [], notes: updated.notes || [], pipeline: updated.pipeline || [] } : c));
            setCompose('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send');
        }
    };

    const aiReply = async () => {
        if (!activeConv) return;
        setAiLoading(true);
        const history = activeConv.messages.slice(-6).map(m => `${m.direction === 'in' ? 'Customer' : 'Agent'}: ${m.text}`).join('\n');
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 200,
                    system: `You are a helpful WhatsApp CRM sales agent for a SaaS platform. Customer: ${activeConv.name}. Stage: ${activeConv.stage}. Keep replies short (1-3 sentences), friendly, professional. Don't use markdown.`,
                    messages: [{ role: 'user', content: `Based on this conversation, write a short agent reply:\n${history}\n\nWrite only the reply text, nothing else.` }]
                })
            });
            const data = await res.json();
            const text = data.content?.[0]?.text || 'I will get back to you shortly!';
            setCompose(text);
        } catch { setCompose('Thank you for reaching out! Our team will connect with you shortly.'); }
        setAiLoading(false);
    };

    const takeOver = async () => {
        if (!activeConv) return;
        await whatsappAPI.updateContact(activeConv.id, { assigned_to: 'You' });
        loadAllData();
    };
    const resolveConv = async () => {
        if (!activeConv) return;
        await whatsappAPI.updateContact(activeConv.id, { stage: 'Closed Won', tag: 'conv' });
        loadAllData();
    };
    const transferConv = async () => {
        if (!activeConv) return;
        const agents = ['Priya', 'Rohan', 'Sales Team'];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        await whatsappAPI.updateContact(activeConv.id, { assigned_to: randomAgent });
        loadAllData();
    };
    const advanceStage = async () => {
        if (!activeConv) return;
        const nextStage = activeConv.pipeline?.find(s => !s.done);
        if (nextStage) {
            await whatsappAPI.updatePipeline(activeConv.id, nextStage.stage_name, true, new Date().toISOString().slice(0, 10));
            const updated = await whatsappAPI.getContactById(activeConv.id);
            setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, ...updated } : c));
        }
    };
    const addNote = async () => {
        if (!noteText.trim() || !activeConv) return;
        await whatsappAPI.addNote(activeConv.id, noteText);
        const updated = await whatsappAPI.getContactById(activeConv.id);
        setConvos(prev => prev.map(c => c.id === activeConv.id ? { ...c, notes: updated.notes } : c));
        setNoteText('');
    };
    const assignAgent = async () => {
        if (!activeConv) return;
        const agents = ['Priya', 'Rohan', 'Sales Team'];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        await whatsappAPI.updateContact(activeConv.id, { assigned_to: randomAgent });
        loadAllData();
    };
    const submitTemplate = async () => {
        if (!newTpl.label || !newTpl.body) return;
        try {
            await whatsappAPI.createTemplate({
                name: newTpl.label.toLowerCase().replace(/\s+/g, '_'),
                label: newTpl.label,
                category: newTpl.category,
                language: newTpl.language,
                body: newTpl.body,
                variables: []
            });
            await loadAllData();
            setShowNewTemplate(false);
            setNewTpl({ label: '', body: '', category: 'UTILITY', language: 'en' });
        } catch (err) {
            alert(err.response?.data?.error);
        }
    };
    const submitBroadcast = async () => {
        if (!newBroadcast.name || !newBroadcast.template) return;
        const template = templates.find(t => t.name === newBroadcast.template);
        if (!template) return;
        try {
            await whatsappAPI.createBroadcast({
                name: newBroadcast.name,
                template_id: template.id,
                segment: newBroadcast.segment,
                scheduled_date: newBroadcast.date,
                scheduled_time: newBroadcast.time
            });
            await loadAllData();
            setShowNewBroadcast(false);
            setNewBroadcast({ name: '', template: '', segment: 'All Contacts', date: '', time: '' });
        } catch (err) {
            alert(err.response?.data?.error);
        }
    };
    const toggleRule = async (id, currentState) => {
        await whatsappAPI.updateRule(id, !currentState);
        loadAllData();
    };

    const filtered = convos.filter(c => {
        if (filter === 'mine' && c.assigned !== 'Priya' && c.assigned !== 'Rohan') return false;
        if (filter === 'bot' && c.assigned !== 'Bot') return false;
        if (filter === 'unread' && !c.unread) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
        return true;
    });

    // Shared styles
    const S: {
        card: any;
        btn: (primary: boolean) => any;
        input: any;
        label: any;
    } = {
        card: {
            background: "#fff",
            border: "0.5px solid #e0e0e0",
            borderRadius: 12,
            padding: "14px 16px",
        },

        btn: (primary) => ({
            background: primary ? "#185FA5" : "#f5f5f5",
            color: primary ? "#fff" : "#333",
            border: primary ? "none" : "0.5px solid #ddd",
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 500,
        }),

        input: {
            width: "100%",
            border: "0.5px solid #ddd",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            background: "#fafafa",
        },

        label: {
            fontSize: 11,
            color: "#888",
            fontWeight: 600,
            textTransform: "uppercase", // ✅ now valid
            letterSpacing: "0.05em",
            marginBottom: 4,
            display: "block",
        },
    };

    // ---------- Render Pipeline View ----------
    const renderPipelineView = () => {
        const byStage = PIPELINE_STAGES.reduce((acc, s) => { acc[s] = convos.filter(c => c.stage === s); return acc; }, {});
        const stageColors = { 'New': 'blue', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' };
        return (
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Sales Pipeline</h2>
                        <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{convos.length} contacts across {PIPELINE_STAGES.length} stages</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, minWidth: 900 }}>
                    {PIPELINE_STAGES.map(stage => {
                        const contacts = byStage[stage] || [];
                        const col = COLORS[stageColors[stage]] || COLORS.blue;
                        return (
                            <div key={stage} style={{ flex: 1, minWidth: 140 }}>
                                <div style={{ background: col.bg, borderRadius: '8px 8px 0 0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${col.border}33` }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: col.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</span>
                                    <span style={{ fontSize: 11, background: '#fff', color: col.text, borderRadius: 8, padding: '1px 6px', fontWeight: 700 }}>{contacts.length}</span>
                                </div>
                                <div style={{ background: '#f8f8f8', borderRadius: '0 0 8px 8px', minHeight: 400, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '0.5px solid #e0e0e0', borderTop: 'none' }}>
                                    {contacts.map(c => (
                                        <div key={c.id} onClick={() => { setView('inbox'); selectConv(c.id); }} style={{ background: '#fff', borderRadius: 8, padding: 10, cursor: 'pointer', border: '0.5px solid #e8e8e8' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <Avatar initials={c.initials} color={c.color} size={26} />
                                                <div>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{c.name}</div>
                                                    <div style={{ fontSize: 10, color: '#888' }}>{c.assigned}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMsg}</div>
                                            <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>{c.time}</div>
                                        </div>
                                    ))}
                                    {contacts.length === 0 && <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', paddingTop: 20 }}>No contacts</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ---------- Render Broadcast View ----------
    const renderBroadcastView = () => (
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Broadcast Campaigns</h2>
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Send bulk WhatsApp messages to segments</p>
                </div>
                <button onClick={() => setShowNewBroadcast(true)} style={S.btn(true)}>+ New Campaign</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Total Sent', value: broadcasts.reduce((s, b) => s + b.sent_count, 0), color: 'blue' },
                    { label: 'Delivered', value: broadcasts.reduce((s, b) => s + b.delivered_count, 0), color: 'green' },
                    { label: 'Read', value: broadcasts.reduce((s, b) => s + b.read_count, 0), color: 'amber' },
                    { label: 'Replied', value: broadcasts.reduce((s, b) => s + b.replied_count, 0), color: 'teal' }
                ].map(s => (
                    <div key={s.label} style={{ ...S.card, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        {['Campaign', 'Template', 'Segment', 'Sent', 'Delivered', 'Read', 'Replied', 'Status', 'Scheduled'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {broadcasts.map(b => (
                            <tr key={b.id} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
                                <td style={{ padding: '10px 10px', fontWeight: 600 }}>{b.name}</td>
                                <td style={{ padding: '10px 10px', fontFamily: 'monospace', fontSize: 12 }}>{b.template_name}</td>
                                <td style={{ padding: '10px 10px' }}><span style={{ background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{b.segment}</span></td>
                                <td style={{ padding: '10px 10px' }}>{b.sent_count}</td>
                                <td style={{ padding: '10px 10px' }}>{b.delivered_count}</td>
                                <td style={{ padding: '10px 10px' }}>{b.read_count}</td>
                                <td style={{ padding: '10px 10px' }}>{b.replied_count}</td>
                                <td style={{ padding: '10px 10px' }}><StatusBadge status={b.status === 'completed' ? 'approved' : 'pending'} /></td>
                                <td style={{ padding: '10px 10px', color: '#888', fontSize: 12 }}>{b.scheduled_date} {b.scheduled_time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showNewBroadcast && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440 }}>
                        <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600 }}>Create New Campaign</h3>
                        <label style={S.label}>Campaign Name</label>
                        <input style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.name} onChange={e => setNewBroadcast(p => ({ ...p, name: e.target.value }))} />
                        <label style={S.label}>Template</label>
                        <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.template} onChange={e => setNewBroadcast(p => ({ ...p, template: e.target.value }))}>
                            <option value="">Select approved template...</option>
                            {templates.filter(t => t.status === 'approved').map(t => <option key={t.id} value={t.name}>{t.label}</option>)}
                        </select>
                        <label style={S.label}>Target Segment</label>
                        <select style={{ ...S.input, marginBottom: 14 }} value={newBroadcast.segment} onChange={e => setNewBroadcast(p => ({ ...p, segment: e.target.value }))}>
                            {['All Contacts', 'Hot Leads', 'Qualified', 'New', 'Unassigned'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div><label style={S.label}>Date</label><input type="date" style={S.input} value={newBroadcast.date} onChange={e => setNewBroadcast(p => ({ ...p, date: e.target.value }))} /></div>
                            <div><label style={S.label}>Time</label><input type="time" style={S.input} value={newBroadcast.time} onChange={e => setNewBroadcast(p => ({ ...p, time: e.target.value }))} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={submitBroadcast} style={{ ...S.btn(true), flex: 1 }}>Schedule Campaign</button>
                            <button onClick={() => setShowNewBroadcast(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ---------- Render Templates View ----------
    const renderTemplatesView = () => (
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Message Templates</h2>
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Meta-approved WhatsApp Business templates</p>
                </div>
                <button onClick={() => setShowNewTemplate(true)} style={S.btn(true)}>+ Submit Template</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Approved', value: templates.filter(t => t.status === 'approved').length, color: 'green' },
                    { label: 'Pending Review', value: templates.filter(t => t.status === 'pending').length, color: 'amber' },
                    { label: 'Rejected', value: templates.filter(t => t.status === 'rejected').length, color: 'coral' }
                ].map(s => (
                    <div key={s.label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {templates.map(t => (
                    <div key={t.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{t.label}</span>
                                <StatusBadge status={t.status} />
                                <span style={{ fontSize: 10, background: '#f0f0f0', borderRadius: 6, padding: '2px 7px' }}>{t.category}</span>
                                <span style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{t.name}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#444', background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap' }}>{t.body}</div>
                            {t.rejection_reason && <div style={{ fontSize: 12, color: '#712B13', background: '#FAECE7', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>Rejection reason: {t.rejection_reason}</div>}
                            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                <span style={{ fontSize: 11, color: '#aaa' }}>Used {t.usage_count} times</span>
                                <span style={{ fontSize: 11, color: '#aaa' }}>Last used: {t.last_used || 'Never'}</span>
                                <span style={{ fontSize: 11, color: '#aaa' }}>Lang: {t.language}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {t.status === 'approved' && <button style={S.btn(true)} onClick={() => { setView('inbox'); setMode('template'); setCompose(t.body); }}>Use</button>}
                            {t.status === 'rejected' && <button style={S.btn(false)} onClick={() => alert('Resubmit via API')}>Resubmit</button>}
                            {t.status === 'pending' && <div style={{ fontSize: 11, color: '#BA7517', background: '#FAEEDA', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>Under review<br /><span style={{ color: '#aaa' }}>24-48 hrs</span></div>}
                        </div>
                    </div>
                ))}
            </div>
            {showNewTemplate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Submit New Template to Meta</h3>
                        <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Templates require Meta approval before use (24-48 hrs)</p>
                        <label style={S.label}>Template Name</label>
                        <input style={{ ...S.input, marginBottom: 14 }} value={newTpl.label} onChange={e => setNewTpl(p => ({ ...p, label: e.target.value }))} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                            <div><label style={S.label}>Category</label><select style={S.input} value={newTpl.category} onChange={e => setNewTpl(p => ({ ...p, category: e.target.value }))}>
                                <option value="UTILITY">Utility</option><option value="MARKETING">Marketing</option><option value="AUTHENTICATION">Authentication</option>
                            </select></div>
                            <div><label style={S.label}>Language</label><select style={S.input} value={newTpl.language} onChange={e => setNewTpl(p => ({ ...p, language: e.target.value }))}>
                                <option value="en">English</option><option value="hi">Hindi</option><option value="en_IN">English (India)</option>
                            </select></div>
                        </div>
                        <label style={S.label}>Message Body</label>
                        <textarea style={{ ...S.input, minHeight: 100 }} value={newTpl.body} onChange={e => setNewTpl(p => ({ ...p, body: e.target.value }))} rows={4} />
                        <p style={{ fontSize: 11, color: '#aaa', margin: '6px 0 18px' }}>Use {'{{1}}'}, {'{{2}}'} for dynamic variables.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={submitTemplate} style={{ ...S.btn(true), flex: 1 }}>Submit to Meta</button>
                            <button onClick={() => setShowNewTemplate(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ---------- Render Automation View ----------
    const renderAutomationView = () => (
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Automation Rules</h2>
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{rules.filter(r => r.on).length} active rules · {rules.reduce((s, r) => s + r.execCount, 0).toLocaleString()} total executions</p>
                </div>
                <button onClick={() => setShowNewRule(true)} style={S.btn(true)}>+ Add Rule</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map((r, i) => {
                    const col = COLORS[r.color] || COLORS.blue;
                    return (
                        <div key={r.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, opacity: r.on ? 1 : 0.6 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{r.title}</div>
                                <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ background: '#f0f0f0', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>WHEN: {r.trigger_event}</span>
                                    <span style={{ color: '#ccc' }}>→</span>
                                    <span style={{ background: col.bg, color: col.text, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>DO: {r.action_type}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>{r.execCount.toLocaleString()} runs</div>
                                <Toggle on={r.on} onChange={() => toggleRule(r.id, r.on)} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {showNewRule && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Add Automation Rule</h3>
                        <p style={{ fontSize: 12, color: '#888', margin: '0 0 18px' }}>Rules run automatically based on triggers</p>
                        <label style={S.label}>Trigger Event</label>
                        <select style={{ ...S.input, marginBottom: 14 }}><option>New contact first message</option><option>Message contains keyword</option></select>
                        <label style={S.label}>Action</label>
                        <select style={{ ...S.input, marginBottom: 14 }}><option>Send approved template</option><option>Assign to agent</option></select>
                        <label style={S.label}>Rule Name</label>
                        <input style={{ ...S.input, marginBottom: 20 }} placeholder="e.g. Keyword routing" />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setShowNewRule(false); loadAllData(); }} style={{ ...S.btn(true), flex: 1 }}>Create Rule</button>
                            <button onClick={() => setShowNewRule(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // ---------- Render Analytics View ----------
    const renderAnalyticsView = () => {
        if (!analytics) return <div style={{ flex: 1, padding: 20 }}>Loading analytics...</div>;
        const { totalContacts, newContacts, conversionRate, stageDistribution, weeklyMessages } = analytics;
        const bars = weeklyMessages.map(w => ({ l: w.date.slice(5), v: w.count }));
        const max = Math.max(...bars.map(b => b.v), 1);
        return (
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>Analytics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'New Contacts', value: newContacts, delta: '+12%', color: 'blue' },
                        { label: 'Conversations', value: totalContacts, delta: '+5%', color: 'green' },
                        { label: 'Conversion Rate', value: `${conversionRate}%`, delta: '+2%', color: 'teal' },
                        { label: 'Avg Response Time', value: '4.2m', delta: '-18%', color: 'amber' }
                    ].map(s => (
                        <div key={s.label} style={S.card}>
                            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS[s.color].text }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: '#27500A', marginTop: 4 }}>{s.delta} this week</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                    <div style={S.card}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Messages This Week</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                            {bars.map(b => (
                                <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: '100%', background: '#E6F1FB', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 120}px`, position: 'relative' }}>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#185FA5', borderRadius: '4px 4px 0 0', height: `${(b.v / max) * 100}%` }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: '#888' }}>{b.l}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#185FA5' }}>{b.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={S.card}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Stage Distribution</div>
                        {stageDistribution.map(s => {
                            const col = COLORS[{ 'New': 'blue', 'Enquiry': 'blue', 'Qualified': 'green', 'Proposal': 'amber', 'Negotiation': 'coral', 'Closed Won': 'teal' }[s.stage]] || COLORS.blue;
                            const pct = Math.round((s.count / totalContacts) * 100);
                            return (
                                <div key={s.stage} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                                        <span style={{ color: '#555' }}>{s.stage}</span>
                                        <span style={{ fontWeight: 600, color: col.text }}>{s.count}</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f0f0f0', borderRadius: 4 }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: col.border, borderRadius: 4 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div style={{ ...S.card, marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Agent Performance</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                            {['Agent', 'Assigned', 'Resolved', 'Avg Response', 'Satisfaction'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, color: '#888', fontWeight: 600 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {analytics.agentPerformance.map(a => (
                                <tr key={a.agent} style={{ borderBottom: '0.5px solid #f5f5f5' }}>
                                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{a.agent}</td>
                                    <td style={{ padding: '10px 10px', color: '#185FA5' }}>{a.assigned}</td>
                                    <td style={{ padding: '10px 10px', color: '#27500A' }}>{a.resolved}</td>
                                    <td style={{ padding: '10px 10px', color: '#555' }}>—</td>
                                    <td style={{ padding: '10px 10px', color: '#633806', fontWeight: 600 }}>—</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ---------- Right Panel ----------
    const renderRightPanel = () => {
        if (!activeConv) return <div>Select a conversation</div>;
        if (rpTab === 'contact') return (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Avatar initials={activeConv.initials} color={activeConv.color} size={44} />
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv.name}</div><div style={{ fontSize: 12, color: '#888' }}>{activeConv.phone}</div></div>
                </div>
                {[
                    { label: 'Stage', val: <Tag tag={activeConv.tag} stage={activeConv.stage} /> },
                    { label: 'Assigned to', val: activeConv.assigned },
                    { label: 'Source', val: 'WhatsApp inbound' },
                    { label: 'Last contact', val: activeConv.time + ' ago' }
                ].map(f => (
                    <div key={f.label} style={{ marginBottom: 12 }}>
                        <div style={S.label}>{f.label}</div>
                        {typeof f.val === 'string' ? <div style={{ fontSize: 13, color: '#333' }}>{f.val}</div> : f.val}
                    </div>
                ))}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => { setRpTab('pipeline'); setTimeout(advanceStage, 200); }}>Move to next stage →</button>
                    <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={assignAgent}>Reassign agent →</button>
                    <button style={{ ...S.btn(false), textAlign: 'left' }} onClick={() => setRpTab('pipeline')}>View pipeline →</button>
                </div>
            </>
        );
        if (rpTab === 'pipeline') {
            const done = activeConv.pipeline?.filter(s => s.done).length || 0;
            return (
                <>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{done} of {activeConv.pipeline?.length || 0} stages complete</div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                        {activeConv.pipeline?.map((s, i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: s.done ? '#185FA5' : '#e0e0e0' }} />)}
                    </div>
                    {activeConv.pipeline?.map((s, i) => {
                        const isCurrent = !s.done && (i === 0 || activeConv.pipeline[i - 1].done);
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #f5f5f5' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.done ? '#1D9E75' : isCurrent ? '#185FA5' : '#ccc' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{s.stage}</div>
                                    <div style={{ fontSize: 11, color: '#aaa' }}>{s.completed_date || '-'}</div>
                                </div>
                                {s.done ? <span style={{ fontSize: 10, background: '#EAF3DE', color: '#27500A', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Done</span> : isCurrent ? <span style={{ fontSize: 10, background: '#E6F1FB', color: '#0C447C', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>Current</span> : null}
                            </div>
                        );
                    })}
                    <button onClick={advanceStage} style={{ ...S.btn(true), width: '100%', textAlign: 'center', marginTop: 12 }}>Move to next stage</button>
                </>
            );
        }
        if (rpTab === 'notes') return (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {activeConv.notes?.length ? activeConv.notes.map((n, i) => <div key={i} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, fontSize: 12, color: '#444', lineHeight: 1.6, borderLeft: '3px solid #185FA5' }}>{n.note || n}</div>) : <div style={{ fontSize: 13, color: '#bbb' }}>No notes yet.</div>}
                </div>
                <textarea rows={3} style={{ ...S.input, resize: 'none', marginBottom: 8 }} placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                <button onClick={addNote} style={{ ...S.btn(true), width: '100%', textAlign: 'center' }}>Save note</button>
            </>
        );
        if (rpTab === 'auto') return (
            <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Active automations</div>
                {rules.map((r, i) => {
                    const col = COLORS[r.color] || COLORS.blue;
                    return (
                        <div key={r.id} style={{ background: '#f8f9fa', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{r.trigger_event}</div>
                            </div>
                            <Toggle on={r.on} onChange={() => toggleRule(r.id, r.on)} />
                        </div>
                    );
                })}
            </>
        );
    };

    // ---------- Inbox View ----------
    const renderInbox = () => (
        <>
            <div style={{ width: 270, borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', gap: 8 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...S.input, flex: 1 }} />
                    <button onClick={async () => {
                        const name = prompt('Contact name:'); if (!name) return;
                        const phone = prompt('Phone:'); if (!phone) return;
                        const initials = name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                        await whatsappAPI.createContact({ name, phone, tag: 'new', stage: 'New', assigned_to: 'Unassigned', color: 'blue', initials });
                        loadAllData();
                    }} style={S.btn(true)}>+</button>
                </div>
                <div style={{ display: 'flex', padding: '6px 10px', gap: 4, borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
                    {['all', 'mine', 'bot', 'unread'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', background: filter === f ? '#E6F1FB' : 'transparent', color: filter === f ? '#0C447C' : '#888', fontWeight: filter === f ? 700 : 400 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                    ))}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filtered.map(c => (
                        <div key={c.id} onClick={() => selectConv(c.id)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f0f0f0', display: 'flex', gap: 10, background: c.id === activeId ? '#EDF4FC' : 'transparent' }}>
                            <Avatar initials={c.initials} color={c.color} size={38} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                                    <span style={{ fontSize: 10, color: '#aaa' }}>{c.time}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{c.lastMsg}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                                    <Tag tag={c.tag} stage={c.stage} />
                                    {c.unread > 0 && <span style={{ background: '#E24B4A', color: '#fff', fontSize: 10, borderRadius: 8, padding: '1px 5px', fontWeight: 700 }}>{c.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {activeConv && <Avatar initials={activeConv.initials} color={activeConv.color} size={36} />}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{activeConv?.name || 'Select a conversation'}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{activeConv?.phone} · {activeConv?.assigned === 'Bot' ? <span style={{ color: '#BA7517' }}>Bot handling</span> : `Agent: ${activeConv?.assigned}`}</div>
                    </div>
                    {activeConv && <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={takeOver} style={S.btn(false)}>Take over</button>
                        <button onClick={resolveConv} style={S.btn(false)}>Resolve</button>
                        <button onClick={transferConv} style={S.btn(false)}>Transfer</button>
                    </div>}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: '#f5f7f9' }}>
                    {activeConv?.messages?.map((msg, idx) => {
                        if (msg.direction === 'system') return <div key={idx} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', background: '#e8e8e8', borderRadius: 8, padding: '4px 12px', alignSelf: 'center' }}>{msg.text}</div>;
                        if (msg.direction === 'bot') return (
                            <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
                                <span style={{ fontSize: 10, background: '#FAEEDA', color: '#633806', padding: '2px 8px', borderRadius: 8, fontWeight: 700, display: 'inline-block', marginBottom: 3 }}>Bot</span>
                                <div style={{ background: '#FAEEDA', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, color: '#412402' }}>{msg.text}</div>
                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
                            </div>
                        );
                        if (msg.direction === 'in') return (
                            <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '72%' }}>
                                <div style={{ background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '8px 12px', fontSize: 13, border: '0.5px solid #e0e0e0' }}>{msg.text}</div>
                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
                            </div>
                        );
                        if (msg.direction === 'note') return (
                            <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
                                <div style={{ background: '#FFFBEA', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, fontStyle: 'italic', color: '#633806', border: '0.5px solid #FAC775' }}>[Note] {msg.text}</div>
                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{new Date(msg.time_sent).toLocaleTimeString()}</div>
                            </div>
                        );
                        return (
                            <div key={idx} style={{ alignSelf: 'flex-end', maxWidth: '72%' }}>
                                <div style={{ background: '#DCF8C6', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 13, color: '#1a3a1a' }}>{msg.text}</div>
                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: 'right' }}>{new Date(msg.time_sent).toLocaleTimeString()} · <span style={{ color: '#1D9E75' }}>Read</span></div>
                            </div>
                        );
                    })}
                    <div ref={messagesEnd} />
                </div>
                {activeConv?.sessionExpiry && (
                    <div style={{ background: '#FAEEDA', padding: '8px 14px', fontSize: 12, color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #FAC775', flexShrink: 0 }}>
                        <span>24hr session expired — use an approved template to re-open</span>
                        <button onClick={() => setMode('template')} style={{ fontSize: 11, background: '#EF9F27', color: '#412402', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Send template</button>
                    </div>
                )}
                <div style={{ padding: '10px 14px', borderTop: '0.5px solid #e8e8e8', background: '#fff', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                        {['text', 'template', 'quick', 'note'].map(m => (
                            <button key={m} onClick={() => setMode(m)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, border: 'none', background: mode === m ? '#E6F1FB' : 'transparent', color: mode === m ? '#0C447C' : '#888', fontWeight: mode === m ? 700 : 400 }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
                        ))}
                        <button onClick={aiReply} disabled={aiLoading} style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 12px', borderRadius: 8, border: 'none', background: aiLoading ? '#f0f0f0' : '#E6F1FB', color: aiLoading ? '#aaa' : '#0C447C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {aiLoading ? '...' : '✦ AI Reply'}
                        </button>
                    </div>
                    {mode === 'template' && (
                        <div style={{ marginBottom: 8, maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {templates.filter(t => t.status === 'approved').map(t => (
                                <div key={t.id} onClick={() => setCompose(t.body)} style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #ddd', cursor: 'pointer', background: '#fafafa' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
                                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.body.substring(0, 70)}...</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {mode === 'quick' && (
                        <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {QUICK_REPLIES.map((q, i) => (
                                <button key={i} onClick={() => setCompose(q)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 10, border: '0.5px solid #ddd', background: '#f8f9fa', color: '#555' }}>{q.substring(0, 28)}{q.length > 28 ? '…' : ''}</button>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                        <textarea rows={1} value={compose} onChange={e => setCompose(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={mode === 'note' ? 'Internal note — not sent to customer...' : 'Type a message...'} style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none', fontFamily: 'inherit', outline: 'none', background: mode === 'note' ? '#FFFBEA' : '#fafafa', minHeight: 38 }} />
                        <button onClick={sendMessage} style={{ width: 38, height: 38, borderRadius: '50%', background: '#185FA5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#fff" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div style={{ width: 290, borderLeft: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ display: 'flex', borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
                    {['contact', 'pipeline', 'notes', 'auto'].map(t => (
                        <button key={t} onClick={() => setRpTab(t)} style={{ flex: 1, padding: '10px 0', fontSize: 12, textAlign: 'center', cursor: 'pointer', border: 'none', background: 'none', color: rpTab === t ? '#185FA5' : '#888', fontWeight: rpTab === t ? 700 : 400, borderBottom: rpTab === t ? '2px solid #185FA5' : '2px solid transparent' }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>{renderRightPanel()}</div>
            </div>
        </>
    );

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading CRM...</div>;

    // ---------- Main Layout ----------
    const sideIcons = [
        { id: 'inbox', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, badge: convos.reduce((s, c) => s + c.unread, 0) },
        { id: 'pipeline', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
        { id: 'broadcast', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg> },
        { id: 'templates', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>, badge: templates.filter(t => t.status === 'pending').length },
        { id: 'automation', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="13 2 13 9 20 9" /><path d="M20 14.5v3.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" /><polyline points="10 16 12 18 16 14" /></svg> },
        { id: 'analytics', svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', fontSize: 13, color: '#111' }}>
            <div style={{ width: 52, background: '#fff', borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                {sideIcons.map(icon => (
                    <div key={icon.id} onClick={() => setView(icon.id)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: view === icon.id ? '#E6F1FB' : 'transparent', color: view === icon.id ? '#185FA5' : '#888' }}>
                        <div style={{ width: 18, height: 18 }}>{icon.svg}</div>
                        {icon.badge > 0 && <div style={{ position: 'absolute', top: -2, right: -2, background: '#E24B4A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px' }}>{icon.badge}</div>}
                    </div>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>P</div>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {view === 'inbox' && renderInbox()}
                {view === 'pipeline' && renderPipelineView()}
                {view === 'broadcast' && renderBroadcastView()}
                {view === 'templates' && renderTemplatesView()}
                {view === 'automation' && renderAutomationView()}
                {view === 'analytics' && renderAnalyticsView()}
            </div>
        </div>
    );
}