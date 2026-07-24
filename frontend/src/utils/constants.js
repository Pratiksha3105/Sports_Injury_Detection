export const APP_NAME = 'PulseGuard AI'

export const ROLES = {
  ATHLETE: 'athlete',
  COACH: 'coach',
  ADMIN: 'admin',
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const RISK_BADGE_STYLES = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  high: 'bg-alert-500/15 text-alert-400 border-alert-500/30',
}

// Dummy prediction history — replaced by real API data once
// Milestone 3/4 (MediaPipe + LSTM inference) ships.
export const DUMMY_PREDICTIONS = [
  { id: 1, video: 'sprint_drill_042.mp4', sport: 'Sprinting', date: '2026-07-01', risk: 'low', score: 18, bodyPart: '—' },
  { id: 2, video: 'squat_session_11.mp4', sport: 'Weightlifting', date: '2026-07-03', risk: 'high', score: 82, bodyPart: 'Left Knee' },
  { id: 3, video: 'landing_drill_07.mp4', sport: 'Basketball', date: '2026-07-04', risk: 'moderate', score: 54, bodyPart: 'Right Ankle' },
  { id: 4, video: 'freekick_practice.mp4', sport: 'Football', date: '2026-07-05', risk: 'low', score: 21, bodyPart: '—' },
  { id: 5, video: 'sprint_drill_045.mp4', sport: 'Sprinting', date: '2026-07-06', risk: 'moderate', score: 47, bodyPart: 'Hamstring' },
  { id: 6, video: 'jump_shot_analysis.mp4', sport: 'Basketball', date: '2026-07-07', risk: 'high', score: 76, bodyPart: 'Left Shoulder' },
  { id: 7, video: 'endurance_run_9k.mp4', sport: 'Running', date: '2026-07-08', risk: 'low', score: 12, bodyPart: '—' },
]

export const DUMMY_TESTIMONIALS = [
  {
    name: 'Ananya Rao',
    role: 'Track & Field Athlete',
    quote: 'Seeing my running form broken down frame by frame helped my coach and me catch a form issue weeks before it became a real injury.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Coach Vikram Singh',
    role: 'Basketball Coach, State University',
    quote: 'I use this with my whole roster after every training block. The risk trends over time are more useful than any single video.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Meera Nair',
    role: 'Physiotherapist',
    quote: 'It gives athletes a concrete, visual reason to change a movement pattern instead of just being told to "be careful."',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
]

export const DUMMY_FAQS = [
  {
    q: 'Does this replace a physiotherapist or sports doctor?',
    a: 'No. PulseGuard AI is a screening and awareness tool that highlights movement patterns worth a closer look. It is not a diagnostic or medical device, and it does not replace professional medical advice.',
  },
  {
    q: 'What video formats are supported?',
    a: 'Milestone 1 defines the upload interface for MP4, MOV and AVI files. Actual video processing is implemented starting Milestone 2.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Videos and predictions are tied to your account and are only visible to you and, if you choose to share them, your coach.',
  },
  {
    q: 'What sports are supported?',
    a: 'The architecture is sport-agnostic. Milestone 1 ships with sample categories like running, basketball, football and weightlifting; more are added as the model is trained on more movement data.',
  },
]
