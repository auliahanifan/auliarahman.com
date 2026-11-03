// Data program training, dipakai halaman utama dan PDF program.
// Kurikulum = IP milik Aulia (Pasal 9 ayat 2 PKS ABAD); contoh kasus klien tidak ditampilkan.
export const modules = [
  { tone: 'kobalt', title: 'Know the tool', desc: 'What AI tools are good and bad at, so expectations are right from the start.' },
  { tone: 'ungu', title: 'Past the prompt library', desc: 'A simple way of working that gets good results without collecting templates, and how to check the output for hallucinations, numbers, and sources.' },
  { tone: 'langit', title: 'Right tool, right job', desc: 'Chat, agents, or connected apps, with use cases mapped to each function, live demos, and hands-on practice.' },
  { tone: 'mint', title: 'From one-off to repeatable', desc: 'Plugins, skills, and connectors that turn a good prompt into a way of working.' },
  { tone: 'amber', title: 'Safe data habits', desc: 'What can go into AI: a green, yellow, red framework, Indonesia’s PDP Law, anonymization, and privacy settings.' },
];

// Format & deliverables dari proposal/PKS (Pasal 2 ayat 5–6).
export const format = ['On the tool your team uses: Claude, ChatGPT, or Gemini', 'Hands-on in your team’s own accounts', 'Examples tailored to your industry', '1:1 support during practice', 'Flexible length and group size', 'Onsite or online'];
export const takeaways = [
  { icon: 'slides', title: 'Slides', desc: 'The full deck as a PDF.' },
  { icon: 'library', title: 'Example prompts', desc: 'For reference. After the session, your team won’t depend on them.' },
  { icon: 'guide', title: 'Practice guide', desc: 'Exercises with safe sample data.' },
];

// Klien sengaja anonim.
export const delivered = [
  { who: 'A mining & resources company', how: 'Onsite' },
  { who: 'A public figure’s secretariat team', how: 'Online' },
  { who: '500+ webinar participants', how: 'Taalenta · Leviq' },
];

// Alur setelah perusahaan menghubungi (dikonfirmasi pemilik).
export const steps = [
  { title: 'A short call', desc: 'About your team, the work they do, and what you want to change.' },
  { title: 'A tailored proposal', desc: 'Curriculum, examples, and format fitted to your team.' },
  { title: 'The session', desc: 'At your venue or online. You provide the room and setup; I bring the program.' },
];
