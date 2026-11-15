import { Activity, BellRing, ClipboardCheck, HandCoins, Map, MessageSquareText, UsersRound } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const features = [
  [BellRing, 'Accessible alerts', 'Present location-aware updates in clear language and support more accessible ways to read or hear information.'],
  [ClipboardCheck, 'Community reports', 'Capture local observations with a place, time and status so reports can be reviewed and followed up.'],
  [Map, 'Local response map', 'Bring area context, reports and response locations together in a map-first view.'],
  [HandCoins, 'Needs and relief', 'Organize requests and partner commitments so support can be tracked from pledge through delivery.'],
  [Activity, 'Live activity', 'Show server-published updates with a timestamp and source status instead of cycling through made-up activity.'],
  [UsersRound, 'Role-based workspace', 'Provide dedicated views for residents, volunteers, NGOs and authorized administrators.'],
  [MessageSquareText, 'Community updates', 'Give people a place to share useful updates and questions with appropriate moderation.'],
];

export default function Features({ s, set }) {
  return (
    <PublicLayout s={s} set={set}>
      <main className="public-page">
        <section className="page-hero wrap">
          <span className="eyebrow">Platform features</span>
          <h1>Connected tools for local flood readiness.</h1>
          <p>ResQ Hub brings reporting, verification and relief coordination into one accessible workspace.</p>
        </section>
        <section className="wrap public-content">
          <div className="feature-grid">
            {features.map(([Icon, title, copy], i) => (
              <article className="feature-card" key={title}>
                <div className="feature-card-top"><span>0{i + 1}</span><Icon size={22} /></div>
                <h2>{title}</h2><p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="scope-note"><b>Important</b><p>This project is not connected to official flood-warning systems. Always follow directions from local authorities and emergency services.</p></div>
        </section>
      </main>
    </PublicLayout>
  );
}
