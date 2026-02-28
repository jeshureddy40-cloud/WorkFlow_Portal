import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

function formatDayLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLastDays(count) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let index = count - 1; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    days.push(day);
  }
  return days;
}

function getDateKey(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

function AnalyticsPage() {
  const { state } = useAppContext();

  const employees = useMemo(
    () => state.users.filter((user) => user.role === 'Employee'),
    [state.users]
  );

  const metrics = useMemo(() => {
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter((task) => task.status === 'Completed').length;
    const inProgressTasks = state.tasks.filter((task) => task.status === 'In Progress').length;
    const pendingTasks = state.tasks.filter((task) => task.status === 'Pending').length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate
    };
  }, [state.tasks]);

  const statusDistribution = useMemo(() => {
    const total = state.tasks.length || 1;
    const pending = state.tasks.filter((task) => task.status === 'Pending').length;
    const inProgress = state.tasks.filter((task) => task.status === 'In Progress').length;
    const completed = state.tasks.filter((task) => task.status === 'Completed').length;

    const pendingPercent = Math.round((pending / total) * 100);
    const progressPercent = Math.round((inProgress / total) * 100);

    return {
      pending,
      inProgress,
      completed,
      pendingPercent,
      progressPercent,
      gradient: `conic-gradient(#94a3b8 0 ${pendingPercent}%, #3b82f6 ${pendingPercent}% ${pendingPercent + progressPercent}%, #22c55e ${pendingPercent + progressPercent}% 100%)`
    };
  }, [state.tasks]);

  const completedByEmployee = useMemo(() => {
    return employees
      .map((employee) => ({
        id: employee.id,
        name: employee.name,
        completed: state.tasks.filter(
          (task) => task.assignedTo === employee.id && task.status === 'Completed'
        ).length
      }))
      .sort((a, b) => b.completed - a.completed);
  }, [employees, state.tasks]);

  const productivitySeries = useMemo(() => {
    const days = getLastDays(7);
    const dayMap = days.reduce((acc, day) => {
      acc[getDateKey(day)] = 0;
      return acc;
    }, {});

    state.tasks.forEach((task) => {
      const completionEvents = (task.history || []).filter(
        (entry) => entry.meta?.toStatus === 'Completed'
      );

      completionEvents.forEach((entry) => {
        const key = getDateKey(entry.createdAt);
        if (key in dayMap) {
          dayMap[key] += 1;
        }
      });

      if (task.status === 'Completed' && completionEvents.length === 0) {
        const fallbackKey = getDateKey(task.updatedAt);
        if (fallbackKey in dayMap) {
          dayMap[fallbackKey] += 1;
        }
      }
    });

    return days.map((day) => {
      const key = getDateKey(day);
      return {
        key,
        label: formatDayLabel(day),
        value: dayMap[key] || 0
      };
    });
  }, [state.tasks]);

  const lineChart = useMemo(() => {
    const max = Math.max(1, ...productivitySeries.map((item) => item.value));
    const width = 560;
    const height = 220;
    const padding = 28;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const points = productivitySeries
      .map((item, index) => {
        const x =
          padding + (index * usableWidth) / Math.max(1, productivitySeries.length - 1);
        const y = padding + usableHeight - (item.value / max) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');

    return {
      width,
      height,
      points,
      max,
      padding
    };
  }, [productivitySeries]);

  const leaderboard = useMemo(() => {
    const ranked = employees
      .map((employee) => {
        const total = state.tasks.filter((task) => task.assignedTo === employee.id).length;
        const completed = state.tasks.filter(
          (task) => task.assignedTo === employee.id && task.status === 'Completed'
        ).length;
        return {
          id: employee.id,
          name: employee.name,
          total,
          completed,
          score: completed * 100 + (total > 0 ? Math.round((completed / total) * 100) : 0)
        };
      })
      .sort((a, b) => b.score - a.score);

    return ranked;
  }, [employees, state.tasks]);

  const topPerformer = leaderboard[0];
  const maxCompleted = Math.max(1, ...completedByEmployee.map((item) => item.completed));

  return (
    <section className="page-shell">
      <header className="page-top">
        <h1>Analytics Dashboard</h1>
        <p className="muted">Real-time task and performance insights</p>
      </header>

      <section className="analytics-metrics">
        <article className="metric-card">
          <p>Total Tasks</p>
          <h3>{metrics.totalTasks}</h3>
        </article>
        <article className="metric-card">
          <p>Completed</p>
          <h3>{metrics.completedTasks}</h3>
        </article>
        <article className="metric-card">
          <p>Pending</p>
          <h3>{metrics.pendingTasks}</h3>
        </article>
        <article className="metric-card">
          <p>Completion Rate</p>
          <h3>{metrics.completionRate}%</h3>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="chart-card">
          <header>
            <h3>Status Distribution</h3>
            <p className="small muted">Pie chart</p>
          </header>
          <div className="pie-wrap">
            <div className="pie-chart" style={{ background: statusDistribution.gradient }} aria-label="Task status pie chart" />
            <ul className="chart-legend">
              <li>
                <span className="legend-dot pending" /> Pending: {statusDistribution.pending}
              </li>
              <li>
                <span className="legend-dot progress" /> In Progress: {statusDistribution.inProgress}
              </li>
              <li>
                <span className="legend-dot completed" /> Completed: {statusDistribution.completed}
              </li>
            </ul>
          </div>
        </article>

        <article className="chart-card">
          <header>
            <h3>Completed Tasks Per Employee</h3>
            <p className="small muted">Bar chart</p>
          </header>
          <div className="bar-chart" role="img" aria-label="Completed tasks per employee">
            {completedByEmployee.map((item) => (
              <div key={item.id} className="bar-item">
                <div
                  className="bar-fill"
                  style={{ height: `${(item.completed / maxCompleted) * 100}%` }}
                >
                  <span>{item.completed}</span>
                </div>
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="chart-card line-card">
          <header>
            <h3>Productivity Over Time</h3>
            <p className="small muted">Line chart (last 7 days completed tasks)</p>
          </header>
          <svg viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} className="line-chart" role="img" aria-label="Productivity line chart">
            <rect
              x={0}
              y={0}
              width={lineChart.width}
              height={lineChart.height}
              fill="transparent"
            />
            <polyline
              points={lineChart.points}
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {productivitySeries.map((item, index) => {
              const x =
                lineChart.padding +
                (index * (lineChart.width - lineChart.padding * 2)) /
                  Math.max(1, productivitySeries.length - 1);
              const y =
                lineChart.padding +
                (lineChart.height - lineChart.padding * 2) -
                (item.value / lineChart.max) * (lineChart.height - lineChart.padding * 2);

              return (
                <g key={item.key}>
                  <circle cx={x} cy={y} r="5" fill="#0f766e" />
                  <text x={x} y={lineChart.height - 6} textAnchor="middle" className="line-axis-label">
                    {item.label}
                  </text>
                  <text x={x} y={y - 10} textAnchor="middle" className="line-value-label">
                    {item.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </article>

        <article className="chart-card">
          <header>
            <h3>Leaderboard</h3>
            <p className="small muted">Ranked by completed work</p>
          </header>
          {topPerformer ? (
            <p className="top-performer">
              Top Performer: <strong>{topPerformer.name}</strong>
            </p>
          ) : null}
          <ol className="leaderboard-list">
            {leaderboard.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>
                  {item.completed} / {item.total} completed
                </span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <p className="muted small analytics-footnote">
        Tasks in progress: {metrics.inProgressTasks}
      </p>
    </section>
  );
}

export default AnalyticsPage;
