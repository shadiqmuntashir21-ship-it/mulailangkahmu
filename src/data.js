export const ROOM_CODE = 'PALU26'

export const growthOptions = [
  'Spiritualitas & Ibadah',
  'Disiplin & Integritas',
  'Cara Berpikir & Belajar',
  'Komunikasi & Relasi',
  'Kepemimpinan',
  'Kontribusi'
]

const KAJIAN = 'Fasilitator / pemateri kompeten'
const SHARING = 'Awardee (rotasi) + fasilitator'
const VOCAB = 'Awardee / buddy pair'
const QURAN = 'Pembina Qur\'an / fasilitator · Metode WAFA'

export const regionalAgenda = [
  {month:'September',date:'27 Sep 2026',time:'13.00 WITA',title:'Pembukaan Pembinaan Semester 2 ETOS ID Palu',speaker:'Fasilitator ETOS ID Palu',type:'Kickoff'},
  {month:'Oktober',date:'8 Okt 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'Oktober',date:'11 Okt 2026',time:'07.00–09.00',title:'Car Free Day · Morning Walk & Bonding',speaker:'Fasilitator + Awardee',type:'Bonding'},
  {month:'Oktober',date:'14 Okt 2026',time:'20.00–21.00',title:'Sharing Knowledge',speaker:'Awardee bergiliran + fasilitator',type:'Literasi'},
  {month:'Oktober',date:'18 Okt 2026',time:'16.00–18.00',title:'Finding Your Purpose · Menemukan Makna Hidup dalam Islam',speaker:'Pemateri + fasilitator',type:'Kajian'},
  {month:'Oktober',date:'19–31 Okt 2026',time:'45–60 menit / awardee',title:'Coaching & IDP Checkpoint',speaker:'Fasilitator + Awardee',type:'Personal'},
  {month:'Oktober',date:'22 Okt 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'Oktober',date:'25 Okt 2026',time:'16.00–18.00',title:'Level Up Mindset · Upgrade Cara Berpikir, Upgrade Masa Depan',speaker:'Pemateri + fasilitator + kolaborator',type:'Kolektif'},
  {month:'November',date:'12 Nov 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'November',date:'15 Nov 2026',time:'16.00–18.00',title:'Fiqih Pergaulan Muslim · Menjaga Batas, Membangun Martabat',speaker:'Pemateri + fasilitator',type:'Kajian'},
  {month:'November',date:'18 Nov 2026',time:'20.00–21.00',title:'Bedah Film · The Pursuit of Happyness',speaker:'Fasilitator + Awardee',type:'Literasi'},
  {month:'November',date:'22 Nov 2026',time:'16.00–18.00',title:'Systems Thinking · Melihat Masalah Secara Utuh',speaker:'Pemateri + fasilitator + kolaborator',type:'Kolektif'},
  {month:'November',date:'23–30 Nov 2026',time:'45–60 menit / awardee',title:'Coaching & IDP Checkpoint',speaker:'Fasilitator + Awardee',type:'Personal'},
  {month:'November',date:'26 Nov 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'Desember',date:'2 Des 2026',time:'20.00–21.00',title:'Bedah Tokoh · B.J. Habibie — Ilmu, Integritas & Kontribusi',speaker:'Fasilitator + Awardee',type:'Literasi'},
  {month:'Desember',date:'1–12 Des 2026',time:'45–60 menit / awardee',title:'Coaching & IDP · Final Review',speaker:'Fasilitator + Awardee',type:'Personal'},
  {month:'Desember',date:'10 Des 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'Desember',date:'13 Des 2026',time:'16.00–18.00',title:'Kajian Keislaman · Tema menyesuaikan kebutuhan pembinaan',speaker:'Pemateri + fasilitator',type:'Kajian'},
  {month:'Desember',date:'17 Des 2026',time:'18.40–20.40',title:'Tahsin Al-Qur’an · Angkatan 2023',speaker:'Ustadz Moh. Ilham, S.Pd',type:'Qur’an'},
  {month:'Desember',date:'20 Des 2026',time:'2–3 jam',title:'Penutupan Pembinaan & Etoser Awards',speaker:'Fasilitator + Awardee',type:'Closing'}
]

export const regionalStats = [
  {value:'6×',label:'Tahsin terjadwal'},
  {value:'3×',label:'Kajian keislaman'},
  {value:'2×',label:'Pembinaan kolektif'},
  {value:'3',label:'Window coaching / IDP'}
]

export const weeks = [
  {n:'01',title:'Fondasi',range:'28 Sep–02 Okt',desc:'Fondasi sebelum akselerasi',sessions:[
    {date:'Senin · 28 Sep',agenda:'Kajian Islam',topic:'FIQH — Thaharah: hukum air, najis & cara menyucikannya',pic:KAJIAN},
    {date:'Selasa · 29 Sep',agenda:'Sharing Knowledge',topic:'Sistem Belajar & Kebiasaan: Learning Science + Atomic Habits',pic:SHARING},
    {date:'Rabu · 30 Sep',agenda:'Bedah Biografi',topic:'Soekarno: visi, keberanian berbicara & konsekuensi kepemimpinan',pic:SHARING},
    {date:'Kamis · 01 Okt',agenda:'Kajian Islam',topic:'FIQH — Wudhu & Tayamum: rukun, pembatal, syarat & praktik',pic:KAJIAN},
    {date:'Jum’at · 02 Okt',agenda:'Tahsin WAFA / Tahfizh',topic:'Baseline Qur’an: pemetaan Tahsin WAFA / Tahfizh',pic:QURAN}
  ]},
  {n:'02',title:'Mandiri',range:'05–09 Okt',desc:'Ibadah dasar & kemandirian',sessions:[
    {date:'Senin · 05 Okt',agenda:'Kajian Islam',topic:'FIQH — Mandi wajib: sebab, rukun & tata cara',pic:KAJIAN},
    {date:'Selasa · 06 Okt',agenda:'Sharing Knowledge',topic:'DIY Basic First Aid: respons awal sebelum bantuan profesional',pic:SHARING},
    {date:'Rabu · 07 Okt',agenda:'Drilling Vocab',topic:'Dorm & Daily Routines',pic:VOCAB},
    {date:'Kamis · 08 Okt',agenda:'Kajian Islam',topic:'FIQH — Sholat: rukun, tata cara & adab dalam khilafiyah',pic:KAJIAN},
    {date:'Jum’at · 09 Okt',agenda:'Tahsin WAFA / Tahfizh',topic:'Makharij & sifat huruf / setor target awal',pic:QURAN}
  ]},
  {n:'03',title:'Integritas',range:'12–16 Okt',desc:'Disiplin ibadah & integritas',sessions:[
    {date:'Senin · 12 Okt',agenda:'Kajian Islam',topic:'FIQH — Rawatib, Dhuha & Tahajud',pic:KAJIAN},
    {date:'Selasa · 13 Okt',agenda:'Sharing Knowledge',topic:'The Psychology of Money: uang, keputusan & gaya hidup mahasiswa',pic:SHARING},
    {date:'Rabu · 14 Okt',agenda:'Bedah Biografi',topic:'Mohammad Hatta: integritas, kesederhanaan & disiplin intelektual',pic:SHARING},
    {date:'Kamis · 15 Okt',agenda:'Kajian Islam',topic:'FIQH — Sujud Syahwi & Sujud Syukur',pic:KAJIAN},
    {date:'Jum’at · 16 Okt',agenda:'Tahsin WAFA / Tahfizh',topic:'Nun mati, mim mati & mad dasar / setoran kumulatif',pic:QURAN}
  ]},
  {n:'04',title:'Siap',range:'26–30 Okt',desc:'Kemandirian & keselamatan',sessions:[
    {date:'Senin · 26 Okt',agenda:'Kajian Islam',topic:'FIQH — Pemulasaran Jenazah 1: Sholat Jenazah / Ghaib',pic:KAJIAN},
    {date:'Selasa · 27 Okt',agenda:'Sharing Knowledge',topic:'DIY Home Safety: listrik, gas, alat & perawatan ruang',pic:SHARING},
    {date:'Rabu · 28 Okt',agenda:'Drilling Vocab',topic:'Safety & First Aid',pic:VOCAB},
    {date:'Kamis · 29 Okt',agenda:'Kajian Islam',topic:'FIQH — Pemulasaran Jenazah 2: Memandikan & mengkafani',pic:KAJIAN},
    {date:'Jum’at · 30 Okt',agenda:'Tahsin WAFA / Tahfizh',topic:'Midline Qur’an: cek progres',pic:QURAN}
  ]},
  {n:'05',title:'Terjaga',range:'02–06 Nov',desc:'Komunikasi, batasan & tauhid',sessions:[
    {date:'Senin · 02 Nov',agenda:'Kajian Islam',topic:'FIQH — Batasan aurat & mahram',pic:KAJIAN},
    {date:'Selasa · 03 Nov',agenda:'Sharing Knowledge',topic:'Komunikasi & Konflik: menyampaikan kebutuhan tanpa merusak relasi',pic:SHARING},
    {date:'Rabu · 04 Nov',agenda:'Bedah Biografi',topic:'Soe Hok Gie: keberanian berpikir kritis & konsistensi',pic:SHARING},
    {date:'Kamis · 05 Nov',agenda:'Kajian Islam',topic:'TAUHID — Sifat Allah & makna Laa ilaha Illallah',pic:KAJIAN},
    {date:'Jum’at · 06 Nov',agenda:'Tahsin WAFA / Tahfizh',topic:'Waqaf–ibtida’ dasar / Murajaah terstruktur',pic:QURAN}
  ]},
  {n:'06',title:'Tangguh',range:'09–13 Nov',desc:'Ketangguhan, literasi digital & sirah',sessions:[
    {date:'Senin · 09 Nov',agenda:'Kajian Islam',topic:'TAUHID — Qadha & Qadar: ikhtiar, tawakkul & penerimaan',pic:KAJIAN},
    {date:'Selasa · 10 Nov',agenda:'Sharing Knowledge',topic:'AI untuk Belajar: cek fakta, bias & integritas akademik',pic:SHARING},
    {date:'Rabu · 11 Nov',agenda:'Drilling Vocab',topic:'Teamwork & Conflict',pic:VOCAB},
    {date:'Kamis · 12 Nov',agenda:'Kajian Islam',topic:'SIRAH — Silsilah Nabi Muhammad ﷺ: Part 1 & 2',pic:KAJIAN},
    {date:'Jum’at · 13 Nov',agenda:'Tahsin WAFA / Tahfizh',topic:'Kelancaran & tempo / setoran kumulatif',pic:QURAN}
  ]},
  {n:'07',title:'Berdaya Juang',range:'16–20 Nov',desc:'Sirah & daya juang',sessions:[
    {date:'Senin · 16 Nov',agenda:'Kajian Islam',topic:'SIRAH — Hijrah ke Madinah: strategi, ukhuwah & ketangguhan',pic:KAJIAN},
    {date:'Selasa · 17 Nov',agenda:'Sharing Knowledge',topic:'Bedah Film 3 Idiots: belajar, tekanan & makna sukses',pic:SHARING},
    {date:'Rabu · 18 Nov',agenda:'Bedah Biografi',topic:'Nick Vujicic: makna, adaptasi & daya juang',pic:SHARING},
    {date:'Kamis · 19 Nov',agenda:'Kajian Islam',topic:'SIRAH — Hudaibiyah & Fathul Makkah: strategi jangka panjang',pic:KAJIAN},
    {date:'Jum’at · 20 Nov',agenda:'Tahsin WAFA / Tahfizh',topic:'Integrasi tajwid dalam tilawah / Murajaah antarbagian',pic:QURAN}
  ]},
  {n:'08',title:'Memimpin',range:'23–27 Nov',desc:'Kepemimpinan melayani',sessions:[
    {date:'Senin · 23 Nov',agenda:'Kajian Islam',topic:'SIRAH — Khulafaur Rasyidin: gaya kepemimpinan & amanah',pic:KAJIAN},
    {date:'Selasa · 24 Nov',agenda:'Sharing Knowledge',topic:'Skill Share: passion, kemampuan & peer teaching',pic:SHARING},
    {date:'Rabu · 25 Nov',agenda:'Drilling Vocab',topic:'Learning, Campus & Technology',pic:VOCAB},
    {date:'Kamis · 26 Nov',agenda:'Kajian Islam',topic:'SIRAH — Piagam Madinah: aturan & tanggung jawab komunitas',pic:KAJIAN},
    {date:'Jum’at · 27 Nov',agenda:'Tahsin WAFA / Tahfizh',topic:'Clinic error personal / setoran kumulatif',pic:QURAN}
  ]},
  {n:'09',title:'Berakar',range:'30 Nov–04 Des',desc:'Adab, tujuan & identitas Palu',sessions:[
    {date:'Senin · 30 Nov',agenda:'Kajian Islam',topic:'AKHLAK — Sunnah keseharian & adab menuntut ilmu',pic:KAJIAN},
    {date:'Selasa · 01 Des',agenda:'Sharing Knowledge',topic:'Start With Why: tujuan, nilai & kepemimpinan melayani',pic:SHARING},
    {date:'Rabu · 02 Des',agenda:'Bedah Biografi',topic:'Guru Tua: pendidikan & kontribusi di Sulawesi Tengah',pic:SHARING},
    {date:'Kamis · 03 Des',agenda:'Kajian Islam',topic:'AKHLAK — Afatul Lisan: bahaya lisan & etika komunikasi',pic:KAJIAN},
    {date:'Jum’at · 04 Des',agenda:'Tahsin WAFA / Tahfizh',topic:'Simulasi bacaan utuh / Tasmi’ bertahap',pic:QURAN}
  ]},
  {n:'10',title:'Berdampak',range:'07–11 Des',desc:'Kontribusi & kepekaan sosial',sessions:[
    {date:'Senin · 07 Des',agenda:'Kajian Islam',topic:'AKHLAK — Ghazwul Fikr: literasi gagasan & ketahanan berpikir',pic:KAJIAN},
    {date:'Selasa · 08 Des',agenda:'Sharing Knowledge',topic:'Community Problem Mapping: membaca kebutuhan sebelum bergerak',pic:SHARING},
    {date:'Rabu · 09 Des',agenda:'Drilling Vocab',topic:'Community & Service',pic:VOCAB},
    {date:'Kamis · 10 Des',agenda:'Kajian Islam',topic:'AKHLAK — Dosa-dosa yang dianggap biasa',pic:KAJIAN},
    {date:'Jum’at · 11 Des',agenda:'Tahsin WAFA / Tahfizh',topic:'Endline Qur’an & rencana semester berikutnya',pic:QURAN}
  ]}
]

export const asramaStats = [
  {value:'10',label:'pekan aktif'},
  {value:'50',label:'sesi inti'},
  {value:'20',label:'kajian Islam'},
  {value:'10',label:'sharing knowledge'},
  {value:'10',label:'Tahsin / Tahfizh'}
]

export const rhythms = [
  {name:'Piket Harian 5R',frequency:'Setiap hari',pic:'Koordinator 5R'},
  {name:'Dzikir Al-Ma’tsurat',frequency:'Ba’da Subuh',pic:'Awardee bergilir'},
  {name:'Conversation Day',frequency:'1× / pekan',pic:'PIC English'},
  {name:'Tahajud Bersama',frequency:'1× / pekan',pic:'Fasilitator'},
  {name:'Shaum Sunnah & Bukber',frequency:'Target 2× / bulan · min. 1×',pic:'PIC ibadah'},
  {name:'Khidmat Masyarakat',frequency:'Min. 1× / bulan',pic:'PIC Khidmat'},
  {name:'ETOS Sport',frequency:'Min. 1× / bulan',pic:'PIC Sport'},
  {name:'Workshop 5R',frequency:'1× · Kickoff 27 Sep',pic:'Fasilitator'},
  {name:'Cross Audit 5R',frequency:'2× / semester',pic:'Koordinator 5R'},
  {name:'Audit 5R Pusat',frequency:'1× / semester',pic:'Manajemen pusat'},
  {name:'Fiqh Wanita · Akhwat',frequency:'3× / semester · di luar 50 sesi inti',pic:'Pemateri akhwat kompeten'}
]

export const scenes = [
  { id: 'welcome', label: 'Mulai Langkahmu' },
  { id: 'journey_reveal', label: 'Perjalanan Semester' },
  { id: 'two_spaces', label: 'Dua Ruang Bertumbuh' },
  { id: 'regional', label: 'Silabus Wilayah' },
  { id: 'dorm_intro', label: 'Masuk Asrama' },
  { id: 'ten_weeks', label: '10 Pekan Asrama' },
  { id: 'rhythms', label: 'Ritme Kehidupan' },
  { id: 'values', label: '3 Nilai Besar' },
  { id: 'idp', label: 'IDP & Coaching' },
  { id: 'reflection_join', label: 'Join & Refleksi', interaction: 'growth_start' },
  { id: 'this_is_us', label: 'This Is Us' },
  { id: 'growth_focus', label: 'Area Pertumbuhan', interaction: 'growth_focus' },
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
