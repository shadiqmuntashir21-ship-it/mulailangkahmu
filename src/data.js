export const ROOM_CODE = 'PALU26'

export const growthOptions = [
  'Spiritualitas & Ibadah',
  'Disiplin & Integritas',
  'Cara Berpikir & Belajar',
  'Komunikasi & Relasi',
  'Kepemimpinan',
  'Kontribusi'
]

export const weeks = [
  { n: '01', title: 'Fondasi', desc: 'Fondasi sebelum akselerasi' },
  { n: '02', title: 'Mandiri', desc: 'Ibadah dasar & kemandirian' },
  { n: '03', title: 'Integritas', desc: 'Disiplin ibadah & integritas' },
  { n: '04', title: 'Siap', desc: 'Kemandirian & keselamatan' },
  { n: '05', title: 'Terjaga', desc: 'Komunikasi, batasan & tauhid' },
  { n: '06', title: 'Tangguh', desc: 'Ketangguhan, literasi digital & sirah' },
  { n: '07', title: 'Berdaya Juang', desc: 'Sirah & daya juang' },
  { n: '08', title: 'Memimpin', desc: 'Kepemimpinan melayani' },
  { n: '09', title: 'Berakar', desc: 'Adab, tujuan & identitas Palu' },
  { n: '10', title: 'Berdampak', desc: 'Kontribusi & kepekaan sosial' }
]

export const regionalMilestones = [
  ['START', 'Pembukaan Pembinaan'],
  ['PURPOSE', 'Finding Your Purpose'],
  ['MINDSET', 'Level Up Mindset'],
  ['PERSONAL GROWTH', 'Coaching & IDP'],
  ['CHARACTER', 'Fiqih Pergaulan Muslim'],
  ['RESILIENCE', 'The Pursuit of Happyness'],
  ['THINKING', 'Systems Thinking'],
  ['ROLE MODEL', 'B.J. Habibie — Ilmu, Integritas & Kontribusi'],
  ['IMPACT', 'Project Challenge'],
  ['FINISH', 'Showcase · Reflection · Etoser Awards']
]

export const rhythms = [
  '5R', 'Al-Ma’tsurat', 'Conversation Day', 'Tahajud Bersama',
  'Shaum Sunnah', 'Khidmat Masyarakat', 'ETOS Sport', 'Fiqh Wanita'
]

export const scenes = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'reflection', label: 'Refleksi Mikro', interaction: 'growth_start' },
  { id: 'this_is_us', label: 'This Is Us' },
  { id: 'journey_reveal', label: 'Reveal Journey' },
  { id: 'two_spaces', label: 'Dua Ruang Bertumbuh' },
  { id: 'regional', label: 'Pembinaan Wilayah' },
  { id: 'dorm_intro', label: 'Masuk Asrama' },
  { id: 'ten_weeks', label: '10 Pekan Asrama' },
  { id: 'rhythms', label: 'Ritme Kehidupan' },
  { id: 'values', label: '3 Nilai Besar' },
  { id: 'growth_focus', label: 'Area Pertumbuhan', interaction: 'growth_focus' },
  { id: 'idp', label: 'IDP & Coaching' },
  { id: 'commitment', label: 'Langkah Pertama', interaction: 'commitment' },
  { id: 'finale', label: 'Final Reveal' }
]

export const prompts = {
  growth_start: {
    key: 'growth_start',
    type: 'choice',
    title: 'Semester ini, bagian mana dari dirimu yang paling ingin kamu tumbuhkan?',
    options: growthOptions,
    anonymous: true
  },
  growth_focus: {
    key: 'growth_focus',
    type: 'choice',
    title: 'Setelah melihat perjalanan ini, bagian mana yang paling kamu butuhkan?',
    options: growthOptions,
    anonymous: true
  },
  commitment: {
    key: 'commitment',
    type: 'text',
    title: 'Apa satu langkah kecil yang akan kamu mulai setelah hari ini?',
    placeholder: 'Contoh: mulai salat tepat waktu, tilawah selepas Subuh…',
    anonymous: true,
    maxLength: 80
  }
}
