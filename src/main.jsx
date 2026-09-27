import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import { ROOM_CODE, scenes, prompts, growthOptions, weeks, regionalMilestones, rhythms } from './data'
import './styles.css'

const SUPABASE_URL = 'https://souakvmuoygvsugxmpwd.supabase.co'
const SUPABASE_KEY = 'sb_publishable_--u2P-Gm5qaogeuV1KD05g_X3q1-eMA'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const cx = (...xs) => xs.filter(Boolean).join(' ')

function Brand({compact=false}) {
  return <div className={cx('brand', compact && 'brand--compact')}>
    <img src="/etos-id.png" alt="ETOS ID" />
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
            const fresh = await getState(ev.id); if (active) setState(fresh)
            if (withData) await refreshData()
          } catch (e) { console.error(e) }
        }, 3500)
      } catch (e) { if (active) setError(e.message || 'Gagal terhubung') }
    })()
    return ()=>{ active=false; if(channel) supabase.removeChannel(channel); if(timer) clearInterval(timer) }
  }, [withData])
  return {event,state,participants,submissions,error,refreshData}
}

function Loader({label='Menyiapkan perjalanan…'}) {
  return <Shell><div className="center-card"><Brand/><div className="spinner"/><p>{label}</p></div></Shell>
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
  useEffect(()=>{ QRCode.toDataURL(`${location.origin}/join?room=${ROOM_CODE}`, {margin:1,width:360,color:{dark:'#0b5138',light:'#ffffff'}}).then(setQr) },[])
  if (error) return <ErrorCard message={error}/>
  if (!event || !state) return <Loader label="Menghubungkan layar utama…"/>
  const scene = state.scene || 'welcome'
  const byPrompt = key => submissions.filter(s=>s.prompt_key===key)
  const current = scenes.find(s=>s.id===scene) || scenes[0]
  const left = useCountdown(state.timer_end)
  return <Shell stage>
    <header className="stage-header"><Brand compact/><div className="stage-meta"><span>SEMESTER 2 · 2026</span><i/><span>{participants.length} Etoser bergabung</span></div></header>
    <section className="stage-canvas" key={`${scene}-${state.revision}`}>
      {scene==='welcome' && <WelcomeScene participants={participants} qr={qr}/>}
      {scene==='reflection' && <QuestionScene prompt={prompts.growth_start} submissions={byPrompt('growth_start')} open={state.interaction_open} reveal={state.reveal}/>}
      {scene==='this_is_us' && <ClusterScene submissions={byPrompt('growth_start')} title="Inilah kita hari ini." subtitle="Bukan untuk dinilai. Ini titik keberangkatan kita."/>}
      {scene==='journey_reveal' && <StatementScene eyebrow="ETOS ID PALU · SEMESTER 2 2026" lines={['Kita mungkin memulai dari titik yang berbeda.','Tetapi kita akan menjalani satu perjalanan bersama.']} accent="MULAI LANGKAHMU"/>}
      {scene==='two_spaces' && <TwoSpacesScene/>}
      {scene==='regional' && <RegionalScene/>}
      {scene==='dorm_intro' && <StatementScene eyebrow="KEHIDUPAN ASRAMA" lines={['Pertumbuhan tidak hanya terjadi ketika forum dimulai.','Ia dibentuk dari apa yang kita lakukan berulang kali.']} accent="10 PEKAN BERTUMBUH BERSAMA"/>}
      {scene==='ten_weeks' && <TenWeeksScene/>}
      {scene==='rhythms' && <RhythmScene/>}
      {scene==='values' && <ValuesScene/>}
      {scene==='growth_focus' && <QuestionScene prompt={prompts.growth_focus} submissions={byPrompt('growth_focus')} open={state.interaction_open} reveal={state.reveal}/>}
      {scene==='idp' && <IdpScene/>}
      {scene==='commitment' && <CommitmentScene submissions={byPrompt('commitment')} open={state.interaction_open} reveal={state.reveal} spotlightId={state.spotlight_submission_id}/>}
      {scene==='finale' && <FinaleScene participants={participants} commitments={byPrompt('commitment')}/>}
    </section>
    <footer className="stage-footer"><div>{String(scenes.findIndex(s=>s.id===current.id)+1).padStart(2,'0')} / {scenes.length}</div><LineMark progress={(scenes.findIndex(s=>s.id===current.id)+1)/scenes.length}/><div>{left>0 ? `${left}s` : current.label}</div></footer>
    {left>0 && <div className="timer-pill">{left}</div>}
  </Shell>
}

function WelcomeScene({participants,qr}) {
  return <div className="scene scene-welcome">
    <div className="hero-copy"><span className="eyebrow">PEMBUKAAN PEMBINAAN · ETOS ID PALU</span><h1>Mulai<br/><em>Langkahmu.</em></h1><p>Awal Langkah, Tumbuh Berdampak.</p></div>
    <div className="welcome-side"><div className="qr-card">{qr && <img src={qr} alt="QR Join"/>}<b>Scan untuk bergabung</b><span>{location.origin.replace(/^https?:\/\//,'')}</span></div><div className="join-count"><strong>{participants.length}</strong><span>Etoser<br/>telah bergabung</span></div></div>
    <div className="participant-river">{participants.slice(0,48).map((p,i)=><span key={p.id} style={{'--i':i}} title={p.display_name}/>)}</div>
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

function RegionalScene(){return <div className="scene regional-scene"><div className="regional-head"><span className="eyebrow">PEMBINAAN WILAYAH · SEP—DES 2026</span><h2>Peta perjalanan besar kita.</h2></div><div className="timeline">{regionalMilestones.map(([tag,title],i)=><div className="milestone" key={tag}><span>{String(i+1).padStart(2,'0')}</span><i/><div><small>{tag}</small><strong>{title}</strong></div></div>)}</div></div>}

function TenWeeksScene(){
  const [selected,setSelected]=useState(4)
  return <div className="scene ten-weeks"><div className="weeks-head"><div><span className="eyebrow">SILABUS ASRAMA · 10 PEKAN</span><h2>Karakter dibangun<br/>sedikit demi sedikit.</h2></div><div className="weeks-summary"><strong>10</strong><span>pekan<br/>aktif</span><i/><strong>50</strong><span>sesi<br/>inti</span></div></div><div className="week-grid">{weeks.map((w,i)=><button key={w.n} onClick={()=>setSelected(i)} className={cx(i===selected&&'active')}><span>{w.n}</span><strong>{w.title}</strong><small>{w.desc}</small></button>)}</div><div className="week-detail"><span>PEKAN {weeks[selected].n}</span><strong>{weeks[selected].title}</strong><p>{weeks[selected].desc}</p><div><b>Kajian Islam</b><b>Sharing Knowledge</b><b>Bedah Biografi / Vocab</b><b>Tahsin / Tahfizh</b></div></div></div>
}

function RhythmScene(){return <div className="scene rhythm-scene"><div className="rhythm-copy"><span className="eyebrow">BUKAN HANYA “SESI”</span><h2>Pembinaan bukan hanya<br/>apa yang kita pelajari.</h2><h3>Tapi apa yang kita biasakan.</h3></div><div className="rhythm-orbit"><div className="rhythm-center">RITME<br/>ASRAMA</div>{rhythms.map((r,i)=><span key={r} style={{'--i':i}}>{r}</span>)}</div></div>}

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
  useEffect(()=>{if(!profile)return; const t=setInterval(()=>supabase.rpc('etos_palu_touch',{p_participant_id:profile.participant_id,p_client_token:profile.client_token}),15000); return()=>clearInterval(t)},[profile])
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
  return <Shell><div className="mobile-wrap"><Brand/><div className="participant-status"><span>Halo,</span><h2>{profile.display_name || 'Etoser'}.</h2></div>{state.interaction_open&&prompt ? <div className="prompt-card"><span className="eyebrow">SEKARANG GILIRANMU</span><h3>{prompt.title}</h3>{prompt.type==='choice'?<div className="option-list">{prompt.options.map(o=><button key={o} onClick={()=>submit(o)} disabled={sending}>{o}</button>)}</div>:<><textarea value={answer} onChange={e=>setAnswer(e.target.value)} maxLength={prompt.maxLength||180} placeholder={prompt.placeholder}/><div className="text-meta"><span>{answer.length}/{prompt.maxLength||180}</span><button onClick={()=>submit()} disabled={sending||!answer.trim()}>Kirim langkahku</button></div></>}{notice&&<div className={cx('submit-note',notice==='Terkirim'&&'ok')}>{notice==='Terkirim'?'✓ Jawabanmu sudah masuk.':notice}</div>}</div>:<div className="wait-card"><div className="pulse-ring"><i/></div><span className="eyebrow">KAMU SUDAH BERGABUNG</span><h3>Simpan HP-mu.<br/>Perhatikan layar di depan.</h3><p>Interaksi berikutnya akan muncul otomatis di sini.</p></div>}</div></Shell>
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
  const move=dir=>{const next=scenes[Math.max(0,Math.min(scenes.length-1,sceneIndex+dir))];return act('set_scene',{scene:next.id})}
  const promptKey=scene.interaction
  const promptSubs=submissions.filter(s=>s.prompt_key===promptKey)
  return <Shell><div className="control-wrap"><header className="control-head"><Brand compact/><div><span className={cx('status-dot',event.status)}/><b>{event.status.toUpperCase()}</b><span>{participants.length} peserta</span></div><button className="ghost" onClick={()=>{sessionStorage.removeItem('etos_palu_pin');setPin('')}}>Keluar</button></header><div className="control-grid"><aside className="scene-list"><span className="eyebrow">SCENE</span>{scenes.map((s,i)=><button className={cx(s.id===state.scene&&'active')} key={s.id} onClick={()=>act('set_scene',{scene:s.id})}><span>{String(i+1).padStart(2,'0')}</span>{s.label}</button>)}</aside><section className="control-main"><div className="control-title"><div><span className="eyebrow">SEKARANG DI LAYAR</span><h1>{scene.label}</h1></div><div className="nav-buttons"><button disabled={sceneIndex===0||busy} onClick={()=>move(-1)}>←</button><button disabled={sceneIndex===scenes.length-1||busy} onClick={()=>move(1)}>→</button></div></div><div className="control-actions"><button onClick={()=>act('set_status',{status:event.status==='live'?'draft':'live'})}>{event.status==='live'?'Kembalikan Draft':'Go Live'}</button>{promptKey&&<button className={state.interaction_open?'danger':''} onClick={()=>act(state.interaction_open?'close_interaction':'open_interaction',{interaction_key:promptKey})}>{state.interaction_open?'Tutup Respons':'Buka Respons'}</button>}{promptKey&&<button onClick={()=>act('set_reveal',{reveal:!state.reveal})}>{state.reveal?'Sembunyikan Hasil':'Reveal Hasil'}</button>}<button onClick={()=>act('set_timer',{seconds:30})}>Timer 30s</button><button onClick={()=>act('set_timer',{seconds:0})}>Clear Timer</button></div><div className="control-panels"><div className="panel"><span className="eyebrow">LIVE STATUS</span><dl><div><dt>Scene revision</dt><dd>{state.revision}</dd></div><div><dt>Respons dibuka</dt><dd>{state.interaction_open?'Ya':'Tidak'}</dd></div><div><dt>Reveal</dt><dd>{state.reveal?'Ya':'Tidak'}</dd></div><div><dt>Peserta</dt><dd>{participants.length}</dd></div><div><dt>Respons scene</dt><dd>{promptSubs.length}</dd></div></dl></div><div className="panel"><span className="eyebrow">RESPONS TERBARU</span><div className="response-list">{promptSubs.slice(-7).reverse().map(s=><button key={s.id} onClick={()=>act('spotlight',{submission_id:s.id})}><span>{s.display_name||'Anonim'}</span><p>{s.response_value}</p></button>)}{!promptSubs.length&&<p className="muted">Belum ada respons pada scene ini.</p>}</div>{state.spotlight_submission_id&&<button className="ghost full" onClick={()=>act('clear_spotlight')}>Tutup Spotlight</button>}</div></div>{notice&&<div className="control-notice">{notice}</div>}<div className="control-footer"><button className="ghost" onClick={()=>window.open('/stage','_blank')}>Buka Stage ↗</button><button className="ghost" onClick={()=>window.open('/join?room=PALU26','_blank')}>Buka Participant ↗</button><button className="danger-outline" onClick={()=>act('reset_live')}>Reset Scene</button><button className="danger-outline" onClick={()=>act('set_status',{status:'ended'})}>Akhiri Event</button></div></section></div></div></Shell>
}

function Landing(){return <Shell><div className="landing"><Brand/><span className="eyebrow">ETOS ID PALU · SEMESTER 2 2026</span><h1>Mulai<br/><em>Langkahmu.</em></h1><p>Awal Langkah, Tumbuh Berdampak.</p><div className="landing-actions"><a href="/join?room=PALU26">Bergabung sebagai peserta</a><a className="secondary" href="/stage">Buka layar utama</a></div><small>Untuk fasilitator, buka <b>/control</b>.</small></div></Shell>}

function App(){
  const path=location.pathname
  if(path.startsWith('/stage'))return <StageApp/>
  if(path.startsWith('/join'))return <ParticipantApp/>
  if(path.startsWith('/control'))return <ControlApp/>
  return <Landing/>
}

createRoot(document.getElementById('root')).render(<App/>)
