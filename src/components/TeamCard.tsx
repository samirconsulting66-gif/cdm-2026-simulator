import type { Team } from '../types';
import { Flag } from './Flag';

interface TeamCardProps {
  team: Team;
  showHostTag?: boolean;
}

export function TeamCard({ team, showHostTag }: TeamCardProps) {
  return (
    <article
      className="team-card"
      aria-label={team.name}
    >
      <div
        className="team-card-top"
        style={{ background: team.color, color: team.textColor === 'black' ? '#1c1f26' : '#fff' }}
      >
        <Flag code={team.code} alt={team.name} />
        <div>
          {showHostTag && team.isHost && (
            <div className="team-card-tag">Pays hôte</div>
          )}
          <div className="team-card-name">{team.name}</div>
        </div>
      </div>
      <div className="team-card-bottom">
        <div className="team-stat">
          <span className="team-stat-label">Phase</span>
          <span className="team-stat-value">Groupe {team.group}</span>
        </div>
        <div className="team-stat">
          <span className="team-stat-label">Classement mondial</span>
          <span className="team-stat-value">{team.fifaRank}</span>
        </div>
        <div className="team-stat">
          <span className="team-stat-label">Participations</span>
          <span className="team-stat-value">{team.participations}</span>
        </div>
      </div>
    </article>
  );
}
