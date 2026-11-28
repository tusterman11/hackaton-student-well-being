import { useMemo } from 'react';
import { Moon, Sprout, Droplets, Heart } from 'lucide-react';

function localDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function Metric({ icon: Icon, label, value }) {
  return <article className="card weekly-metric"><span className="icon-tile"><Icon size={19} /></span><strong>{value}</strong><span>{label}</span></article>;
}

export function GardenView({ history, wellnessData }) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
      const key = dateKey(date);
      const checkins = history.checkins.filter((item) => localDateKey(item.created_at) === key);
      const pauses = history.pauses.filter((item) => localDateKey(item.created_at) === key).length;
      const water = wellnessData.hydration.filter((item) => item.date === key).reduce((total, item) => total + Number(item.amount), 0);
      return {
        key,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        mood: checkins.length ? checkins.reduce((total, item) => total + item.mood, 0) / checkins.length : null,
        energy: checkins.length ? checkins.reduce((total, item) => total + item.energy, 0) / checkins.length : null,
        pauses,
        water
      };
    });
  }, [history, wellnessData]);

  const checkins = history.checkins.filter((item) => days.some((day) => localDateKey(item.created_at) === day.key));
  const totalPauses = days.reduce((total, day) => total + day.pauses, 0);
  const totalWater = days.reduce((total, day) => total + day.water, 0);
  const todayKey = dateKey(new Date());
  const sleepCount = wellnessData.sleep.filter((item) => item.date === todayKey).length;
  const averageEnergy = checkins.length
    ? (checkins.reduce((total, item) => total + item.energy, 0) / checkins.length).toFixed(1)
    : '—';

  return (
    <main className="page-content">
      <header className="page-intro"><span className="eyebrow">Seus dados reais</span><h1>Sua semana</h1><p>Um retrato gentil dos últimos sete dias, apenas com registros feitos por você.</p></header>
      <section className="card">
        <h2>Humor e energia</h2>
        {checkins.length ? (
          <div className="weekly-chart" role="img" aria-label="Médias diárias de humor e energia registradas nos últimos sete dias">
            {days.map((day) => (
              <div className="weekly-chart-day" key={day.key}>
                <div className="weekly-bars">
                  <span className="weekly-bar mood-bar" title={day.mood === null ? 'Sem check-in' : `Humor ${day.mood.toFixed(1)} de 5`} style={{ height: `${day.mood === null ? 0 : day.mood * 18}px` }} />
                  <span className="weekly-bar energy-bar" title={day.energy === null ? 'Sem check-in' : `Energia ${day.energy.toFixed(1)} de 5`} style={{ height: `${day.energy === null ? 0 : day.energy * 18}px` }} />
                </div>
                <span>{day.label}</span>
                <small>{day.mood === null ? '—' : `${day.mood.toFixed(1)} · ${day.energy.toFixed(1)}`}</small>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Ainda não há check-ins nesta semana; o gráfico aparecerá quando você registrar algum.</div>}
        <div className="chart-legend"><span><i className="legend-mood" /> Humor</span><span><i className="legend-energy" /> Energia</span><small>Médias de registros reais, escala de 1 a 5.</small></div>
      </section>
      <div className="weekly-metrics">
        <Metric icon={Heart} label="Média de energia" value={averageEnergy === '—' ? '—' : `${averageEnergy}/5`} />
        <Metric icon={Sprout} label="Pausas na semana" value={totalPauses} />
        <Metric icon={Droplets} label="Água registrada" value={`${totalWater} ml`} />
        <Metric icon={Moon} label="Registros de sono hoje" value={sleepCount} />
      </div>
      <p className="disclaimer-text">Os registros são apenas informativos. Não há diagnóstico ou comparação com outras pessoas.</p>
    </main>
  );
}
