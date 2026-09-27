import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { ROOM_CODE, scenes, prompts, growthOptions, weeks, regionalAgenda, regionalStats, asramaStats, rhythms } from './data'
import './styles.css'

const SUPABASE_URL = 'https://souakvmuoygvsugxmpwd.supabase.co'
const SUPABASE_KEY = 'sb_publishable_--u2P-Gm5qaogeuV1KD05g_X3q1-eMA'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const cx = (...xs) => xs.filter(Boolean).join(' ')

function Brand({compact=false}) {
  return <div className={cx('brand', compact && 'brand--compact')}>
    <img src="/etos-id-full.png?v=20260927-2" alt="ETOS ID" decoding="async" fetchPriority="high" />
    <span>Palu</span>
  </div>
}

function LineMark({progress=1}) {
  return <div className="line-mark"><span style={{transform:`scaleX(${progress})`}} /></div>
}

function Shell({children, stage=false}) {
  return <main className={cx('app-shell', stage && 'app-shell--stage')}>
    <div className="ambient ambient-a" />
    <div className="ambient ambient-b" />
    {children}
  </main>
}

async function getEvent() {
  const { data, error } = await supabase.from('etos_palu_events').select('*').eq('code', ROOM_CODE).single()
  if (error) throw error
  return data
}
async function getState(eventId) {
  const { data, error } = await supabase.from('etos_palu_live_state').select('*').eq('event_id', eventId).single()
  if (error) throw error
  return data
}
async function getParticipants() {
  const { data, error } = await supabase.rpc('etos_palu_public_participants', {p_event_code: ROOM_CODE})
  if (error) throw error
  return data || []
}
async function getSubmissions(promptKey=null) {
  const { data, error } = await supabase.rpc('etos_palu_public_submissions', {p_event_code: ROOM_CODE, p_prompt_key: promptKey})
  if (error) throw error
  return data || []
}

function useLiveEvent({withData=false}={}) {
  const [event, setEvent] = useState(null)
  const [state, setState] = useState(null)
  const [participants, setParticipants] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState('')

  const refreshData = async () => {
    if (!withData) return
    try {
      const [p,s] = await Promise.all([getParticipants(), getSubmissions()])
      setParticipants(p); setSubmissions(s)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    let active = true
    let channel
    let timer
    ;(async()=>{
      try {
        const ev = await getEvent(); if (!active) return
        setEvent(ev)
        const st = await getState(ev.id); if (!active) return
        setState(st)
        await refreshData()
        channel = supabase.channel(`etos-palu-state-${ev.id}`)
          .on('postgres_changes', {event:'UPDATE', schema:'public', table:'etos_palu_live_state', filter:`event_id=eq.${ev.id}`}, payload => {
            if (!active) return
            setState(payload.new)
            if (withData) refreshData()
          }).subscribe()
        timer = setInterval(async()=>{
          try {
            const [freshEvent, freshState] = await Promise.all([getEvent(), getState(ev.id)])
            if (active) { setEvent(freshEvent); setState(freshState) }
            if (withData) await refreshData()
          } catch (e) { console.error(e) }
        }, withData ? 2400 : 5000)
      } catch (e) { if (active) setError(e.message || 'Gagal terhubung') }
    })()
    return ()=>{ active=false; if(channel) supabase.removeChannel(channel); if(timer) clearInterval(timer) }
  }, [withData])
  return {event,state,participants,submissions,error,refreshData}
}

function Loader({label='Menyiapkan perjalanan…'}) {
  return <Shell><div className="premium-loader">
    <div className="loader-brand"><Brand/></div>
    <div className="loader-orbit"><i/><i/><i/></div>
    <div className="loader-copy"><strong>Mulai Langkahmu</strong><span>{label}</span></div>
    <div className="loader-track"><i/></div>
  </div></Shell>
}

function ErrorCard({message}) {
  return <Shell><div className="center-card"><Brand/><h2>Ada kendala koneksi</h2><p>{message}</p></div></Shell>
}

function useCountdown(timerEnd) {
  const [left,setLeft] = useState(0)
  useEffect(()=>{
    const tick=()=>setLeft(timerEnd ? Math.max(0, Math.ceil((new Date(timerEnd).getTime()-Date.now())/1000)) : 0)
    tick(); const t=setInterval(tick,500); return()=>clearInterval(t)
  },[timerEnd])
  return left
}

function StageApp() {
  const {event,state,participants,submissions,error} = useLiveEvent({withData:true})
  const [qr,setQr] = useState('')
  const [presenterPin,setPresenterPin] = useState(()=>sessionStorage.getItem('etos_palu_pin')||'')
  const [showPresenterLogin,setShowPresenterLogin] = useState(false)
  const [draftPin,setDraftPin] = useState('')
  const [presenterBusy,setPresenterBusy] = useState(false)
  const [presenterError,setPresenterError] = useState('')

  useEffect(()=>{
    let active=true
    import('qrcode').then(({default:QRCode})=>QRCode.toDataURL(
      `${location.origin}/join?room=${ROOM_CODE}`,
      {margin:1,width:680,errorCorrectionLevel:'M',color:{dark:'#111418',light:'#ffffff'}}
    )).then(url=>{if(active)setQr(url)}).catch(console.error)
    return()=>{active=false}
  },[])

  const left = useCountdown(state?.timer_end)
  const scene = state?.scene || 'welcome'
  const byPrompt = key => submissions.filter(s=>s.prompt_key===key)
  const currentIndex = Math.max(0, scenes.findIndex(s=>s.id===scene))
  const current = scenes[currentIndex] || scenes[0]
  const joinIndex = scenes.findIndex(s=>s.id==='reflection_join')
  const interactiveStarted = currentIndex >= joinIndex

  const stageControl = async(action,payload={}) => {
    if(!presenterPin){
      setShowPresenterLogin(true)
      return null
    }
    setPresenterBusy(true)
    setPresenterError('')
    try{
      const {data,error}=await supabase.rpc('etos_palu_control',{
        p_event_code:ROOM_CODE,
        p_pin:presenterPin,
        p_action:action,
        p_payload:payload
      })
      if(error) throw error
      return data
    }catch(e){
      setPresenterError(e.message || 'Kontrol presenter gagal.')
      if((e.message||'').toLowerCase().includes('pin')){
        sessionStorage.removeItem('etos_palu_pin')
        setPresenterPin('')
        setShowPresenterLogin(true)
      }
      return null
    }finally{
      setPresenterBusy(false)
    }
  }

  const selectScene = async(index) => {
    if(!state || !event) return
    const nextIndex=Math.max(0,Math.min(scenes.length-1,index))
    const next=scenes[nextIndex]
    if(!presenterPin){setShowPresenterLogin(true);return}
    if(state.interaction_open && state.interaction_key !== next.interaction){
      await stageControl('close_interaction')
    }
    await stageControl('set_scene',{scene:next.id})
    if(next.interaction){
      await stageControl('open_interaction',{interaction_key:next.interaction})
    }
  }

  useEffect(()=>{
    if(!presenterPin || !state) return
    const onKey=(e)=>{
      if(['INPUT','TEXTAREA','BUTTON'].includes(e.target?.tagName)) return
      if(e.key==='ArrowRight' || e.key===' ' || e.key==='PageDown'){
        e.preventDefault()
        selectScene(currentIndex+1)
      }
      if(e.key==='ArrowLeft' || e.key==='PageUp'){
        e.preventDefault()
        selectScene(currentIndex-1)
      }
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[presenterPin,currentIndex,state?.interaction_open,state?.interaction_key,state?.event_id])

  const unlockPresenter=async()=>{
    setPresenterError('')
    try{
      const {error}=await supabase.rpc('etos_palu_control',{
        p_event_code:ROOM_CODE,p_pin:draftPin,p_action:'set_scene',p_payload:{scene}
      })
      if(error) throw error
      sessionStorage.setItem('etos_palu_pin',draftPin)
      setPresenterPin(draftPin)
      setDraftPin('')
      setShowPresenterLogin(false)
    }catch(e){setPresenterError('PIN presenter tidak valid.')}
  }

  if (error) return <ErrorCard message={error}/>
  if (!event || !state) return <Loader label="Menghubungkan layar utama…"/>

  return <Shell stage>
    <header className="stage-header">
      <Brand compact/>
      <div className="stage-meta">
        <span>SEMESTER 2 · 2026</span>
        <i/>
        <span>{interactiveStarted ? `${participants.length} Etoser bergabung` : 'PEMBUKAAN PEMBINAAN'}</span>
        <button className="presenter-link" onClick={()=>setShowPresenterLogin(true)}>{presenterPin?'PRESENTER ON':'AKTIFKAN PRESENTER'}</button>
      </div>
    </header>

    <section className="stage-canvas" key={`${scene}-${state.revision}`}>
      {scene==='welcome' && <WelcomeScene/>}
      {scene==='journey_reveal' && <StatementScene eyebrow="ETOS ID PALU · SEMESTER 2 2026" lines={['Bukan sekadar rangkaian agenda.','Ini perjalanan untuk bertumbuh dan berdampak.']} accent="PERJALANAN KITA DIMULAI"/>}
      {scene==='two_spaces' && <TwoSpacesScene/>}
      {scene==='regional' && <RegionalScene/>}
      {scene==='dorm_intro' && <StatementScene eyebrow="KEHIDUPAN ASRAMA" lines={['Pertumbuhan tidak hanya terjadi ketika forum dimulai.','Ia dibentuk dari apa yang kita lakukan berulang kali.']} accent="10 PEKAN BERTUMBUH BERSAMA"/>}
      {scene==='ten_weeks' && <TenWeeksScene/>}
      {scene==='rhythms' && <RhythmScene/>}
      {scene==='values' && <ValuesScene/>}
      {scene==='idp' && <IdpScene/>}
      {scene==='reflection_join' && <ReflectionJoinScene qr={qr} participants={participants} submissions={byPrompt('growth_start')} open={state.interaction_open}/>}
      {scene==='this_is_us' && <ClusterScene submissions={byPrompt('growth_start')} title="Inilah kita hari ini." subtitle="Bukan untuk dinilai. Ini titik keberangkatan kita."/>}
      {scene==='growth_focus' && <QuestionScene prompt={prompts.growth_focus} submissions={byPrompt('growth_focus')} open={state.interaction_open} reveal={state.reveal}/>}
      {scene==='commitment' && <CommitmentScene submissions={byPrompt('commitment')} open={state.interaction_open} reveal={state.reveal} spotlightId={state.spotlight_submission_id}/>}
      {scene==='finale' && <FinaleScene participants={participants} commitments={byPrompt('commitment')}/>}
    </section>

    <footer className="stage-footer">
      <div>{String(currentIndex+1).padStart(2,'0')} / {scenes.length}</div>
      <LineMark progress={(currentIndex+1)/scenes.length}/>
      <div>{left>0 ? `${left}s` : current.label}</div>
    </footer>

    <div className={cx('presenter-controls',presenterPin&&'is-on')}>
      <button disabled={currentIndex===0||presenterBusy} onClick={()=>selectScene(currentIndex-1)} aria-label="Sebelumnya">←</button>
      <span><small>PRESENTER</small><b>{current.label}</b></span>
      <button disabled={currentIndex===scenes.length-1||presenterBusy} onClick={()=>selectScene(currentIndex+1)} aria-label="Berikutnya">→</button>
    </div>

    {presenterPin && <nav className="stage-jump-nav" aria-label="Pilih tahapan">
      {scenes.map((s,i)=><button key={s.id} className={cx(i===currentIndex&&'active')} onClick={()=>selectScene(i)} title={s.label}>
        <span>{String(i+1).padStart(2,'0')}</span><b>{s.label}</b>
      </button>)}
    </nav>}

    {left>0 && <div className="timer-pill">{left}</div>}

    {showPresenterLogin && <div className="presenter-modal" onClick={()=>setShowPresenterLogin(false)}>
      <div className="presenter-dialog" onClick={e=>e.stopPropagation()}>
        <Brand compact/>
        <span className="eyebrow">PRESENTER MODE</span>
        <h3>Semua tahapan bisa dikontrol dari layar.</h3>
        <p>Masukkan PIN sekali. Setelah itu klik tahapan mana pun, gunakan tombol ← →, atau tekan Space untuk lanjut.</p>
        <input autoFocus inputMode="numeric" type="password" value={draftPin} onChange={e=>setDraftPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&unlockPresenter()} placeholder="PIN moderator"/>
        {presenterError&&<div className="presenter-error">{presenterError}</div>}
        <div className="presenter-dialog-actions">
          <button className="ghost" onClick={()=>setShowPresenterLogin(false)}>Batal</button>
          <button onClick={unlockPresenter}>Aktifkan Presenter</button>
        </div>
      </div>
    </div>}
  </Shell>
}

function WelcomeScene() {
  return <div className="scene scene-opening">
    <div className="opening-copy">
      <span className="event-chip">ETOS ID PALU · 27 SEPTEMBER 2026</span>
      <span className="eyebrow">PEMBUKAAN PEMBINAAN</span>
      <h1>Mulai<br/><em>Langkahmu.</em></h1>
      <p>Awal Langkah, Tumbuh Berdampak.</p>
      <div className="opening-note"><i/><span>Semester 2 · September—Desember 2026</span></div>
    </div>
    <div className="journey-visual">
      <div className="journey-kicker">PERJALANAN SEMESTER 2</div>
      <div className="journey-line">
        <i className="journey-progress"/>
        <div className="journey-node active"><span>01</span><b>Mulai</b><small>September</small></div>
        <div className="journey-node"><span>02</span><b>Bertumbuh</b><small>Oktober</small></div>
        <div className="journey-node"><span>03</span><b>Menguat</b><small>November</small></div>
        <div className="journey-node"><span>04</span><b>Berdampak</b><small>Desember</small></div>
      </div>
      <div className="journey-quote">“Yang kita bangun bukan sekadar agenda, tetapi kebiasaan, karakter, dan arah hidup.”</div>
    </div>
  </div>
}

function ReflectionJoinScene({qr,participants,submissions,open}) {
  return <div className="scene reflection-join-scene">
    <div className="reflection-intro">
      <span className="eyebrow">SEKARANG GILIRANMU</span>
      <h2>Kita sudah melihat<br/>perjalanannya.</h2>
      <p>Sekarang masuk ke refleksi. Scan QR, tulis nama, dan pertanyaan pertama langsung muncul di HP-mu.</p>
      <div className="reflection-question">
        <small>PERTANYAAN 01</small>
        <strong>{prompts.growth_start.title}</strong>
      </div>
      <div className={cx('live-badge',open&&'is-live')}><i/>{open?'REFLEKSI DIBUKA':'MENYIAPKAN REFLEKSI'} · {submissions.length} JAWABAN</div>
    </div>
    <div className="reflection-join-card">
      <div className="reflection-qr">{qr ? <img src={qr} alt="QR untuk masuk refleksi"/> : <div className="qr-skeleton"/>}</div>
      <div className="reflection-join-meta">
        <span>SCAN UNTUK MASUK</span>
        <h3>{participants.length}</h3>
        <p>Etoser sudah bergabung</p>
        <div><b>ROOM {ROOM_CODE}</b><i/></div>
      </div>
      <div className="reflection-join-foot">Setelah bergabung, kamu langsung menjawab. Tidak perlu menunggu.</div>
    </div>
  </div>
}

function ChoiceBars({submissions}) {
  const counts = growthOptions.map(o=>({label:o,count:submissions.filter(s=>s.response_value===o).length}))
  const max = Math.max(1,...counts.map(c=>c.count))
  return <div className="choice-bars">{counts.map((c,i)=><div className="choice-row" key={c.label}><span className="choice-dot">0{i+1}</span><div><strong>{c.label}</strong><small>{c.count} orang</small></div><i style={{'--w':`${(c.count/max)*100}%`}}/></div>)}</div>
}

function QuestionScene({prompt,submissions,open,reveal}) {
  return <div className="scene question-scene">
    <div className="question-copy"><span className="eyebrow">REFLEKSI BERSAMA</span><h2>{prompt.title}</h2><p>{open ? 'Jawab melalui HP-mu. Setelah itu, kembali lihat layar.' : 'Pertanyaan sedang ditutup. Perhatikan pola yang terbentuk.'}</p><div className={cx('live-badge',open&&'is-live')}><i/>{open?'RESPON DIBUKA':'RESPON DITUTUP'} · {submissions.length} MASUK</div></div>
    <div className="question-results">{reveal ? <ChoiceBars submissions={submissions}/> : <Orbit submissions={submissions}/>}</div>
  </div>
}

function Orbit({submissions}) {
  return <div className="orbit"><div className="orbit-core"><strong>{submissions.length}</strong><span>respons</span></div>{submissions.slice(0,42).map((s,i)=><i key={s.id} style={{'--i':i,'--n':Math.max(1,submissions.length)}}/> )}</div>
}

function ClusterScene({submissions,title,subtitle}) {
  const counts = growthOptions.map((o,i)=>({label:o,count:submissions.filter(s=>s.response_value===o).length,i})).sort((a,b)=>b.count-a.count)
  return <div className="scene cluster-scene"><div className="cluster-head"><span className="eyebrow">TITIK KEBERANGKATAN</span><h2>{title}</h2><p>{subtitle}</p></div><div className="clusters">{counts.map((c,i)=><div className="cluster" key={c.label} style={{'--scale':.8+Math.min(c.count,10)*.055,'--delay':`${i*80}ms`}}><strong>{c.count}</strong><span>{c.label}</span></div>)}</div></div>
}

function StatementScene({eyebrow,lines,accent}) {
  return <div className="scene statement-scene"><span className="eyebrow">{eyebrow}</span><div className="statement-lines">{lines.map((l,i)=><h2 key={l} style={{'--delay':`${i*120}ms`}}>{l}</h2>)}</div><div className="statement-accent">{accent}</div></div>
}

function TwoSpacesScene(){return <div className="scene two-spaces"><div className="two-title"><span className="eyebrow">SATU PERJALANAN</span><h2>Dua ruang untuk bertumbuh.</h2></div><div className="split-path"><div className="space-card"><span>01</span><h3>Pembinaan Wilayah</h3><p>Ruang bertumbuh.</p><small>Pembinaan memberi arah.</small></div><div className="path-knot"><i/><b>ETOS<br/>ID PALU</b></div><div className="space-card"><span>02</span><h3>Kehidupan Asrama</h3><p>Ruang pembiasaan.</p><small>Asrama membuatnya menjadi kebiasaan.</small></div></div></div>}

function RegionalScene(){
  const months=['September','Oktober','November','Desember']
  const [month,setMonth]=useState('Oktober')
  const items=regionalAgenda.filter(x=>x.month===month)
  return <div className="scene regional-scene regional-detailed">
    <div className="regional-head">
      <span className="eyebrow">SILABUS PEMBINAAN WILAYAH · PALU</span>
      <h2>Jadwalnya harus<br/>terlihat jelas.</h2>
      <p>Tanggal, jam, bentuk kegiatan, dan siapa yang terlibat—langsung dari satu layar.</p>
      <div className="regional-stats">{regionalStats.map(s=><div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div>
      <div className="month-tabs">{months.map(m=><button key={m} className={cx(month===m&&'active')} onClick={()=>setMonth(m)}>{m}</button>)}</div>
    </div>
    <div className="agenda-board">
      <div className="agenda-board-head"><span>{month.toUpperCase()} 2026</span><b>{items.length} agenda ditampilkan</b></div>
      <div className="agenda-list">{items.map((item,i)=><article className="agenda-item" key={item.date+item.title}>
        <div className="agenda-no">{String(i+1).padStart(2,'0')}</div>
        <div className="agenda-main"><small>{item.type}</small><h3>{item.title}</h3><p>{item.speaker}</p></div>
        <div className="agenda-when"><strong>{item.date}</strong><span>{item.time}</span></div>
      </article>)}</div>
      <div className="agenda-note">Project/Tematik Nasional tidak dimasukkan ke tampilan utama ini agar fokus pada silabus pembinaan Palu.</div>
    </div>
  </div>
}

function TenWeeksScene(){
  const [selected,setSelected]=useState(0)
  const week=weeks[selected]
  return <div className="scene ten-weeks ten-weeks-detailed">
    <div className="weeks-head">
      <div><span className="eyebrow">SILABUS ASRAMA · 27 SEP—12 DES 2026</span><h2>10 pekan.<br/>50 sesi inti.</h2><p>Klik pekan untuk melihat tanggal, agenda, materi, dan PIC. Jam sesi inti tidak dibakukan pada silabus Palu dan mengikuti kesepakatan ritme asrama.</p></div>
      <div className="asrama-stat-strip">{asramaStats.map(s=><div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div>
    </div>
    <div className="week-grid">{weeks.map((w,i)=><button key={w.n} onClick={()=>setSelected(i)} className={cx(i===selected&&'active')}><span>PEKAN {w.n}</span><strong>{w.title}</strong><small>{w.range}</small></button>)}</div>
    <div className="week-detail week-detail-rich">
      <div className="week-detail-head"><div><span>PEKAN {week.n} · {week.range}</span><strong>{week.title}</strong><p>{week.desc}</p></div><b>5 SESI</b></div>
      <div className="session-list">{week.sessions.map((s,i)=><div className="session-row" key={s.date+s.agenda}>
        <span>{String(i+1).padStart(2,'0')}</span>
        <div><small>{s.date} · {s.agenda}</small><strong>{s.topic}</strong><p>{s.pic}</p></div>
      </div>)}</div>
      {selected===9 && <div className="closing-note"><b>12 Des 2026</b><span>Closing & Portfolio Review · Fasilitator + seluruh Awardee</span></div>}
    </div>
  </div>
}

function RhythmScene(){return <div className="scene rhythm-scene rhythm-detailed">
  <div className="rhythm-copy"><span className="eyebrow">RITME KEHIDUPAN ASRAMA</span><h2>Bukan cuma sesi.<br/>Ada ritme yang diulang.</h2><h3>Frekuensinya terlihat jelas.</h3><p>Aktivitas berikut berjalan di luar 50 sesi inti dan menjadi habit formation selama semester.</p></div>
  <div className="rhythm-grid">{rhythms.map((r,i)=><div className="rhythm-card" key={r.name}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{r.name}</strong><b>{r.frequency}</b><small>{r.pic}</small></div></div>)}</div>
</div>}

function ValuesScene(){return <div className="scene values-scene"><span className="eyebrow">NILAI YANG KITA BANGUN</span><div className="value-word"><span>01</span><h2>Integritas</h2><p>Siapa kita ketika tidak ada yang melihat.</p></div><div className="value-word"><span>02</span><h2>Profesional</h2><p>Bagaimana kita mengelola diri, ilmu, amanah, dan tanggung jawab.</p></div><div className="value-word"><span>03</span><h2>Transformatif</h2><p>Bagaimana pertumbuhan kita menghadirkan manfaat bagi orang lain.</p></div><div className="values-final">Bertumbuh bukan untuk diri sendiri. <strong>Bertumbuh untuk berdampak.</strong></div></div>}

function IdpScene(){return <div className="scene idp-scene"><div className="idp-map"><span className="idp-dot a">DIRI HARI INI</span><span className="idp-line"/><span className="idp-dot b">IDP</span><span className="idp-line"/><span className="idp-dot c">COACHING</span><span className="idp-line"/><span className="idp-dot d">DIRI YANG BERTUMBUH</span></div><div className="idp-copy"><span className="eyebrow">PERJALANAN PERSONAL</span><h2>Setiap Etoser punya<br/>peta pertumbuhannya sendiri.</h2><p>IDP bukan sekadar administrasi. Ia adalah peta personal di dalam perjalanan besar ETOS.</p></div></div>}

function CommitmentScene({submissions,open,reveal,spotlightId}) {
  const spotlight = submissions.find(s=>s.id===spotlightId)
  if (spotlight) return <div className="scene spotlight-scene"><span className="eyebrow">SATU LANGKAH YANG BERARTI</span><blockquote>“{spotlight.response_value}”</blockquote><p>{spotlight.display_name || 'Anonim'}</p></div>
  return <div className="scene commitment-scene"><div className="commit-copy"><span className="eyebrow">SATU PERTANYAAN TERAKHIR</span><h2>Apa satu langkah kecil<br/>yang akan kamu mulai?</h2><p>{open?'Tulis satu tindakan nyata melalui HP-mu.':'Respons ditutup. Sekarang lihat jalan yang kita bangun bersama.'}</p><div className={cx('live-badge',open&&'is-live')}><i/>{submissions.length} LANGKAH MASUK</div></div><div className="road-builder"><div className="road"><i style={{'--progress':`${Math.min(100,submissions.length*4)}%`}}/></div><div className="commit-cloud">{(reveal?submissions.slice(-8):submissions.slice(-4)).map((s,i)=><span key={s.id} style={{'--i':i}}>{reveal?s.response_value:'•'}</span>)}</div></div></div>
}

function FinaleScene({participants,commitments}){return <div className="scene finale-scene"><div className="final-path"><div className="final-logo"><Brand/></div>{participants.slice(0,40).map((p,i)=><i key={p.id} style={{'--i':i}}/> )}</div><div className="final-copy"><span className="eyebrow">ETOS ID PALU · 2026</span><h2><strong>{participants.length}</strong> Etoser.<br/><strong>{commitments.length}</strong> langkah pertama.<br/>Satu perjalanan bersama.</h2><p>Awal Langkah, <b>Tumbuh Berdampak.</b></p></div></div>}

function ParticipantApp(){
  const {event,state,error} = useLiveEvent()
  const [profile,setProfile] = useState(()=>{try{return JSON.parse(localStorage.getItem('etos_palu_profile'))||null}catch{return null}})
  const [name,setName]=useState('')
  const [cohort,setCohort]=useState('')
  const [sending,setSending]=useState(false)
  const [notice,setNotice]=useState('')
  const prompt = state?.interaction_key ? prompts[state.interaction_key] : null
  const [answer,setAnswer]=useState('')
  useEffect(()=>{setAnswer('');setNotice('')},[state?.interaction_key,state?.interaction_open])
  useEffect(()=>{
    if(!profile)return
    let active=true
    const touch=async()=>{
      const {data}=await supabase.rpc('etos_palu_touch',{p_participant_id:profile.participant_id,p_client_token:profile.client_token})
      if(active && data===false){
        localStorage.removeItem('etos_palu_profile')
        setProfile(null)
      }
    }
    touch()
    const t=setInterval(touch,15000)
    return()=>{active=false;clearInterval(t)}
  },[profile])
  const join=async e=>{
    e.preventDefault();setSending(true);setNotice('')
    try{
      const {data,error}=await supabase.rpc('etos_palu_join_event',{p_event_code:ROOM_CODE,p_display_name:name,p_cohort:cohort||null})
      if(error)throw error
      const row=data?.[0]
      const stored={...row,display_name:name}
      localStorage.setItem('etos_palu_profile',JSON.stringify(stored))
      setProfile(stored)
    }catch(e){setNotice(e.message)}finally{setSending(false)}
  }
  const submit=async value=>{
    if(!profile||!prompt)return
    const v=value??answer
    if(!v)return
    setSending(true);setNotice('')
    try{
      const {error}=await supabase.rpc('etos_palu_submit',{p_participant_id:profile.participant_id,p_client_token:profile.client_token,p_prompt_key:prompt.key,p_response_type:prompt.type,p_response_value:v,p_is_anonymous:prompt.anonymous})
      if(error)throw error
      setNotice('Terkirim');setAnswer('')
    }catch(e){setNotice(e.message)}finally{setSending(false)}
  }
  if(error)return <ErrorCard message={error}/>
  if(!event||!state)return <Loader label="Membuka ruang ETOS ID Palu…"/>
  if(!profile)return <Shell><div className="mobile-wrap"><Brand/><div className="join-hero"><span className="eyebrow">PEMBUKAAN PEMBINAAN · 2026</span><h1>Mulai<br/><em>Langkahmu.</em></h1><p>Masuk ke perjalanan ETOS ID Palu.</p></div><form className="join-form" onSubmit={join}><label>Nama / panggilan<input value={name} onChange={e=>setName(e.target.value)} maxLength={40} placeholder="Tulis namamu" required/></label><label>Angkatan <small>(opsional)</small><input value={cohort} onChange={e=>setCohort(e.target.value)} maxLength={30} placeholder="Contoh: ETOS 2026"/></label><button disabled={sending}>{sending?'Menghubungkan…':'Bergabung'}</button>{notice&&<p className="form-note">{notice}</p>}</form></div></Shell>
  if(event.status==='ended')return <Shell><div className="mobile-wrap mobile-center"><Brand/><span className="eyebrow">PERJALANAN HARI INI SELESAI</span><h2>Terima kasih sudah mengambil langkah pertama.</h2><p>Sampai jumpa di perjalanan pembinaan ETOS ID Palu berikutnya.</p></div></Shell>
  return <Shell><div className="mobile-wrap"><Brand/><div className="participant-status"><span>Halo,</span><h2>{profile.display_name || 'Etoser'}.</h2></div>{state.interaction_open&&prompt ? (notice==='Terkirim' ? <div className="done-card"><div className="done-mark">✓</div><span className="eyebrow">SUDAH MASUK</span><h3>Jawabanmu sudah tercatat.</h3><p>Sekarang kembali lihat layar depan. Pertanyaan berikutnya akan muncul otomatis di sini.</p></div> : <div className="prompt-card"><span className="eyebrow">LANGSUNG REFLEKSI</span><h3>{prompt.title}</h3>{prompt.type==='choice'?<div className="option-list">{prompt.options.map(o=><button key={o} onClick={()=>submit(o)} disabled={sending}>{o}</button>)}</div>:<><textarea value={answer} onChange={e=>setAnswer(e.target.value)} maxLength={prompt.maxLength||180} placeholder={prompt.placeholder}/><div className="text-meta"><span>{answer.length}/{prompt.maxLength||180}</span><button onClick={()=>submit()} disabled={sending||!answer.trim()}>Kirim langkahku</button></div></>}{notice&&notice!=='Terkirim'&&<div className="submit-note">{notice}</div>}</div>) : <div className="wait-card"><div className="pulse-ring"><i/></div><span className="eyebrow">REFLEKSI BELUM DIBUKA</span><h3>Fokus ke layar depan dulu.</h3><p>Saat fasilitator membuka refleksi, pertanyaan akan langsung muncul di sini.</p></div>}</div></Shell>
}

function ControlApp(){
  const {event,state,participants,submissions,error,refreshData}=useLiveEvent({withData:true})
  const [pin,setPin]=useState(()=>sessionStorage.getItem('etos_palu_pin')||'')
  const [draftPin,setDraftPin]=useState('')
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('')
  if(error)return <ErrorCard message={error}/>
  if(!event||!state)return <Loader label="Membuka control room…"/>
  const sceneIndex=Math.max(0,scenes.findIndex(s=>s.id===state.scene))
  const scene=scenes[sceneIndex]
  const act=async(action,payload={})=>{
    setBusy(true);setNotice('')
    try{
      const {data,error}=await supabase.rpc('etos_palu_control',{p_event_code:ROOM_CODE,p_pin:pin,p_action:action,p_payload:payload})
      if(error)throw error
      setNotice('Tersimpan')
      await refreshData()
      return data
    }catch(e){setNotice(e.message);throw e}finally{setBusy(false)}
  }
  if(!pin)return <Shell><div className="control-login"><Brand/><span className="eyebrow">CONTROL ROOM</span><h2>Masukkan PIN moderator</h2><input inputMode="numeric" type="password" value={draftPin} onChange={e=>setDraftPin(e.target.value)} placeholder="••••••"/><button onClick={()=>{sessionStorage.setItem('etos_palu_pin',draftPin);setPin(draftPin)}}>Masuk</button></div></Shell>
  const selectControlScene=async(next)=>{
    if(state.interaction_open && state.interaction_key !== next.interaction){
      await act('close_interaction')
    }
    await act('set_scene',{scene:next.id})
    if(next.interaction){
      await act('open_interaction',{interaction_key:next.interaction})
    }
  }
  const move=dir=>{const next=scenes[Math.max(0,Math.min(scenes.length-1,sceneIndex+dir))];return selectControlScene(next)}
  const promptKey=scene.interaction
  const promptSubs=submissions.filter(s=>s.prompt_key===promptKey)
  return <Shell><div className="control-wrap"><header className="control-head"><Brand compact/><div><span className={cx('status-dot',event.status)}/><b>{event.status.toUpperCase()}</b><span>{participants.length} peserta</span></div><button className="ghost" onClick={()=>{sessionStorage.removeItem('etos_palu_pin');setPin('')}}>Keluar</button></header><div className="control-grid"><aside className="scene-list"><span className="eyebrow">SCENE</span>{scenes.map((s,i)=><button className={cx(s.id===state.scene&&'active')} key={s.id} onClick={()=>selectControlScene(s)}><span>{String(i+1).padStart(2,'0')}</span>{s.label}</button>)}</aside><section className="control-main"><div className="control-title"><div><span className="eyebrow">SEKARANG DI LAYAR</span><h1>{scene.label}</h1></div><div className="nav-buttons"><button disabled={sceneIndex===0||busy} onClick={()=>move(-1)}>←</button><button disabled={sceneIndex===scenes.length-1||busy} onClick={()=>move(1)}>→</button></div></div><div className="control-actions"><button onClick={()=>act('set_status',{status:event.status==='live'?'draft':'live'})}>{event.status==='live'?'Kembalikan Draft':'Go Live'}</button>{promptKey&&<button className={state.interaction_open?'danger':''} onClick={()=>act(state.interaction_open?'close_interaction':'open_interaction',{interaction_key:promptKey})}>{state.interaction_open?'Tutup Respons':'Buka Respons'}</button>}{promptKey&&<button onClick={()=>act('set_reveal',{reveal:!state.reveal})}>{state.reveal?'Sembunyikan Hasil':'Reveal Hasil'}</button>}<button onClick={()=>act('set_timer',{seconds:30})}>Timer 30s</button><button onClick={()=>act('set_timer',{seconds:0})}>Clear Timer</button></div><div className="control-panels"><div className="panel"><span className="eyebrow">LIVE STATUS</span><dl><div><dt>Scene revision</dt><dd>{state.revision}</dd></div><div><dt>Respons dibuka</dt><dd>{state.interaction_open?'Ya':'Tidak'}</dd></div><div><dt>Reveal</dt><dd>{state.reveal?'Ya':'Tidak'}</dd></div><div><dt>Peserta</dt><dd>{participants.length}</dd></div><div><dt>Respons scene</dt><dd>{promptSubs.length}</dd></div></dl></div><div className="panel"><span className="eyebrow">RESPONS TERBARU</span><div className="response-list">{promptSubs.slice(-7).reverse().map(s=><button key={s.id} onClick={()=>act('spotlight',{submission_id:s.id})}><span>{s.display_name||'Anonim'}</span><p>{s.response_value}</p></button>)}{!promptSubs.length&&<p className="muted">Belum ada respons pada scene ini.</p>}</div>{state.spotlight_submission_id&&<button className="ghost full" onClick={()=>act('clear_spotlight')}>Tutup Spotlight</button>}</div></div>{notice&&<div className="control-notice">{notice}</div>}<div className="control-footer"><button className="ghost" onClick={()=>window.open('/stage','_blank')}>Buka Stage ↗</button><button className="ghost" onClick={()=>window.open('/join?room=PALU26','_blank')}>Buka Participant ↗</button><button className="danger-outline" onClick={()=>act('reset_live')}>Reset Scene</button><button className="danger-outline" onClick={()=>act('set_status',{status:'ended'})}>Akhiri Event</button></div></section></div></div></Shell>
}

function Landing(){return <Shell><div className="landing"><Brand/><span className="eyebrow">ETOS ID PALU · SEMESTER 2 2026</span><h1>Mulai<br/><em>Langkahmu.</em></h1><p>Awal Langkah, Tumbuh Berdampak.</p><div className="landing-actions"><a href="/join?room=PALU26">Bergabung sebagai peserta</a><a className="secondary" href="/stage">Buka layar utama</a></div><small>Untuk fasilitator, buka <b>/control</b>.</small></div></Shell>}

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state={error:null}
  }
  static getDerivedStateFromError(error){
    return {error}
  }
  componentDidCatch(error,info){
    console.error('ETOS UI error',error,info)
  }
  render(){
    if(this.state.error){
      return <ErrorCard message="Tampilan mengalami kendala. Muat ulang halaman; jika masih terjadi, buka Control Room dan kembalikan ke scene Welcome."/>
    }
    return this.props.children
  }
}

function App(){
  const path=location.pathname
  if(path.startsWith('/stage'))return <StageApp/>
  if(path.startsWith('/join'))return <ParticipantApp/>
  if(path.startsWith('/control'))return <ControlApp/>
  return <Landing/>
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>)
