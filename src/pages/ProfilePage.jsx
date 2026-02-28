import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

function getDateKey(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

function getRecentDays(count) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    days.push(day);
  }

  return days;
}

function ProfilePage() {
  const { state, updateUserProfile } = useAppContext();
  const currentUser = state.users.find((user) => user.id === state.session.userId);

  const [githubUsername, setGithubUsername] = useState(currentUser?.githubUsername || '');
  const [avatarDataUrl, setAvatarDataUrl] = useState(currentUser?.avatarDataUrl || '');

  const saveProfile = (event) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    updateUserProfile({
      userId: currentUser.id,
      githubUsername: githubUsername || currentUser.githubUsername || '',
      avatarDataUrl: avatarDataUrl || currentUser.avatarDataUrl || ''
    });
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const effectiveGithubUsername = githubUsername || currentUser?.githubUsername || '';
  const profileLink = effectiveGithubUsername ? `https://github.com/${effectiveGithubUsername}` : '';
  const githubAvatar = effectiveGithubUsername ? `https://github.com/${effectiveGithubUsername}.png` : '';
  const profileAvatar = avatarDataUrl || currentUser?.avatarDataUrl || githubAvatar;
  const currentUserId = currentUser?.id || '';

  const myTasks = state.tasks.filter((task) => task.assignedTo === currentUserId);

  const total = myTasks.length;
  const completed = myTasks.filter((task) => task.status === 'Completed').length;
  const inProgress = myTasks.filter((task) => task.status === 'In Progress').length;
  const pending = myTasks.filter((task) => task.status === 'Pending').length;

  const contributionStats = {
    total,
    completed,
    inProgress,
    pending,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100)
  };

  const dayMap = {};

  state.tasks.forEach((task) => {
    (task.comments || []).forEach((comment) => {
      if (comment.authorId === currentUserId) {
        const key = getDateKey(comment.createdAt);
        dayMap[key] = (dayMap[key] || 0) + 1;
      }
    });

    (task.history || []).forEach((entry) => {
      if (entry.actorId === currentUserId) {
        const key = getDateKey(entry.createdAt);
        dayMap[key] = (dayMap[key] || 0) + 1;
      }
    });
  });

  const days = getRecentDays(28);
  const activityHeatmap = days.map((day) => {
    const key = getDateKey(day);
    const value = dayMap[key] || 0;

    let tone = 'tone-0';
    if (value >= 4) {
      tone = 'tone-4';
    } else if (value === 3) {
      tone = 'tone-3';
    } else if (value === 2) {
      tone = 'tone-2';
    } else if (value === 1) {
      tone = 'tone-1';
    }

    return {
      key,
      value,
      tone,
      label: day.toLocaleDateString()
    };
  });

  if (!currentUser) {
    return (
      <section className="page-shell">
        <h1>Profile</h1>
        <p className="muted">No active user selected.</p>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <header className="page-top">
        <h1>Profile</h1>
        <p className="muted">
          {currentUser.name} ({currentUser.role})
        </p>
      </header>

      <div className="profile-layout">
        <form className="profile-card" onSubmit={saveProfile}>
          <h3>Account</h3>

          <div className="profile-avatar-wrap">
            {profileAvatar ? (
              <img src={profileAvatar} alt={`${currentUser.name} avatar`} className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder" aria-hidden="true">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>

          <label htmlFor="avatarUpload">Profile Image</label>
          <input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarUpload} />

          <label htmlFor="githubUsername">GitHub Username</label>
          <input
            id="githubUsername"
            type="text"
            value={githubUsername}
            onChange={(event) => setGithubUsername(event.target.value)}
            placeholder="Enter GitHub username"
          />

          <button type="submit" className="primary-btn">
            Save Profile
          </button>

          {effectiveGithubUsername ? (
            <a href={profileLink} target="_blank" rel="noreferrer" className="profile-github-link">
              {profileLink}
            </a>
          ) : (
            <p className="small muted">Add GitHub username to show profile link.</p>
          )}
        </form>

        <section className="profile-stats-card">
          <h3>Contribution Stats</h3>
          <div className="stats-grid">
            <div>
              <p>Total Assigned</p>
              <strong>{contributionStats.total}</strong>
            </div>
            <div>
              <p>Completed</p>
              <strong>{contributionStats.completed}</strong>
            </div>
            <div>
              <p>In Progress</p>
              <strong>{contributionStats.inProgress}</strong>
            </div>
            <div>
              <p>Pending</p>
              <strong>{contributionStats.pending}</strong>
            </div>
          </div>
          <p className="profile-completion">Completion: {contributionStats.completionRate}%</p>

          <h4>Activity Heatmap (28 days)</h4>
          <div className="activity-heatmap" aria-label="Contribution activity heatmap">
            {activityHeatmap.map((day) => (
              <span
                key={day.key}
                className={`heat-cell ${day.tone}`}
                title={`${day.label}: ${day.value} activities`}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default ProfilePage;
