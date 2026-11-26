import { Activity, Droplets, Moon, Pause, Sprout } from 'lucide-react';
import {
  getLastSevenDateKeys,
  getRecordDateKey,
  parseRecordDate
} from '../utils/wellnessData';

function getDayLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

function Chart({ days }) {
  const points = days.map((day, index) => {
    if (!day.checkin) return { index, mood: null, energy: null };
    return {
      index,
      mood: day.checkin.mood,
      energy: day.checkin.energy
    };
  });
  const x = (index) => 38 + (index * 624) / 6;
  const y = (value) => 142 - (value - 1) * 28;
  const segments = (field) => points.slice(1).flatMap((point, index) => {
    const previous = points[index];
    if (point[field] === null || previous[field] === null) return [];
    return [{
      x1: x(previous.index),
      y1: y(previous[field]),
      x2: x(point.index),
      y2: y(point[field])
    }];
  });

  return (
    <div className="chart-wrap" role="img" aria-label="Gráfico de humor e energia dos check-ins registrados nos últimos sete dias">
      <svg className="week-chart" viewBox="0 0 700 190" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((level) => (
          <g key={level}>
            <line x1="30" x2="670" y1={y(level)} y2={y(level)} className="chart-gridline" />
            <text x="8" y={y(level) + 4} className="chart-axis-label">{level}</text>
          </g>
        ))}
        {segments('mood').map((line, index) => (
          <line key={`mood-${index}`} {...line} className="chart-line chart-mood-line" />
        ))}
        {segments('energy').map((line, index) => (
          <line key={`energy-${index}`} {...line} className="chart-line chart-energy-line" />
        ))}
        {points.map((point) => point.mood === null ? null : (
          <g key={point.index}>
            <circle cx={x(point.index)} cy={y(point.mood)} r="5" className="chart-mood-point" />
            <circle cx={x(point.index)} cy={y(point.energy)} r="4" className="chart-energy-point" />
          </g>
        ))}
        {days.map((day, index) => (
          <text key={day.dateKey} x={x(index)} y="176" textAnchor="middle" className="chart-day-label">
            {getDayLabel(day.dateKey)}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <span><i className="legend-dot legend-mood" /> Humor</span>
        <span><i className="legend-dot legend-energy" /> Energia</span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <article className="metric-card">
      <span className="metric-icon"><Icon size={18} /></span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

export function GardenView({
  checkins,
  pauses,
  localData,
  historyStatus,
  historyError,
  onRetryHistory
}) {
  const keys = getLastSevenDateKeys();
  const days = keys.map((dateKey) => {
    const dayEntries = checkins
      .filter((entry) => getRecordDateKey(entry.created_at || entry.createdAt) === dateKey)
      .sort((a, b) => (parseRecordDate(a.created_at || a.createdAt)?.getTime() || 0)
        - (parseRecordDate(b.created_at || b.createdAt)?.getTime() || 0));
    return { dateKey, checkin: dayEntries[dayEntries.length - 1] || null };
  });
  const daysSet = new Set(keys);
  const weekCheckins = checkins.filter((entry) => daysSet.has(getRecordDateKey(entry.created_at || entry.createdAt)));
  const weekPauses = pauses.filter((entry) => (
    entry.type !== 'water' && daysSet.has(getRecordDateKey(entry.created_at || entry.createdAt))
  ));
  const weekWater = localData.hydration.filter((entry) => daysSet.has(getRecordDateKey(entry.createdAt)));
  const weekSleep = localData.sleep.filter((entry) => daysSet.has(getRecordDateKey(entry.createdAt)));
  const completedHabits = localData.habits.reduce((total, habit) => (
    total + (habit.completedDates || []).filter((dateKey) => daysSet.has(dateKey)).length
  ), 0);
  const averageEnergy = weekCheckins.length
    ? (weekCheckins.reduce((sum, entry) => sum + entry.energy, 0) / weekCheckins.length).toFixed(1)
    : null;
  const totalWaterMl = weekWater.reduce((sum, entry) => sum + entry.amountMl, 0);

  return (
    <div className="view-stack">
      <header className="view-header">
        <p className="eyebrow">Seus registros, sem comparação</p>
        <h1>Sua semana</h1>
        <p>Um retrato dos últimos sete dias com dados que você registrou.</p>
      </header>

      {historyStatus === 'error' && (
        <div className="notice notice-error" role="alert">
          <span>{historyError} O histórico do servidor não está disponível.</span>
          <button type="button" className="text-button" onClick={onRetryHistory}>Tentar novamente</button>
        </div>
      )}

      <section className="card">
        <div className="section-heading">
          <div><p className="eyebrow">Check-ins reais</p><h2>Humor e energia</h2></div>
        </div>
        {historyStatus === 'loading' ? (
          <p className="empty-state">Carregando os registros…</p>
        ) : historyStatus === 'error' ? (
          <p className="empty-state">Gráfico indisponível enquanto não for possível acessar o servidor.</p>
        ) : weekCheckins.length === 0 ? (
          <p className="empty-state">Ainda não há check-ins registrados nesta semana.</p>
        ) : <Chart days={days} />}
      </section>

      <section className="metrics-grid" aria-label="Resumo da semana">
        <Metric icon={Activity} label="Média de energia" value={averageEnergy ? `${averageEnergy}/5` : '—'} hint={averageEnergy ? 'dos check-ins registrados' : 'sem check-ins registrados'} />
        <Metric icon={Pause} label="Pausas concluídas" value={historyStatus === 'ready' ? weekPauses.length : '—'} hint="sem incluir registros de água" />
        <Metric icon={Droplets} label="Água registrada" value={weekWater.length ? `${totalWaterMl} ml` : '—'} hint={weekWater.length ? `${weekWater.length} registros` : 'sem registros locais'} />
        <Metric icon={Sprout} label="Hábitos concluídos" value={completedHabits || '—'} hint={completedHabits ? 'conclusões na semana' : 'sem conclusões registradas'} />
        <Metric icon={Moon} label="Registros de sono" value={weekSleep.length || '—'} hint={weekSleep.length ? 'registros esta semana' : 'sem registros'} />
      </section>

      {historyStatus === 'ready' && weekCheckins.length === 0 && weekPauses.length === 0
        && !weekWater.length && !completedHabits && !weekSleep.length && (
        <p className="empty-state">Quando você registrar atividades, seu resumo semanal aparecerá aqui.</p>
      )}
    </div>
  );
}
