import { useMemo } from 'react';

function ProgressBar({ progress }) {
  const clampedProgress = useMemo(() => Math.max(0, Math.min(100, Math.round(progress))), [progress]);

  const progressTone = useMemo(() => {
    if (clampedProgress <= 30) {
      return 'low';
    }
    if (clampedProgress <= 70) {
      return 'medium';
    }
    return 'high';
  }, [clampedProgress]);

  return (
    <section className="global-progress" aria-label="Global task completion progress">
      <div className="progress-header">
        <h2>Overall Completion</h2>
        <span>{clampedProgress}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
        aria-label={`Global completion ${clampedProgress}%`}
      >
        <div className={`progress-fill ${progressTone}`} style={{ width: `${clampedProgress}%` }} />
      </div>
    </section>
  );
}

export default ProgressBar;
