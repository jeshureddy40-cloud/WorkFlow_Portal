import { useCallback, useMemo, useState } from 'react';

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const VIEW_OPTIONS = ['kanban', 'list', 'calendar'];
const VIEW_LABELS = {
  kanban: 'Board',
  list: 'List',
  calendar: 'Calendar'
};
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const priorityClass = {
  High: 'priority high',
  Medium: 'priority medium',
  Low: 'priority low'
};

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleString();
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

function addRecurrence(date, recurrence) {
  const next = new Date(date);
  if (recurrence === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (recurrence === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (recurrence === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

function expandRecurringEvents(events, rangeStart, rangeEnd) {
  const expanded = [];
  events.forEach((event) => {
    const baseDate = new Date(event.date);
    if (Number.isNaN(baseDate.getTime())) {
      return;
    }

    const recurrence = event.recurrence || 'none';
    if (recurrence === 'none') {
      expanded.push({
        ...event,
        sourceEventId: event.id
      });
      return;
    }

    const until = event.recurrenceUntil ? new Date(event.recurrenceUntil) : null;
    const endLimit = until && !Number.isNaN(until.getTime()) ? until : rangeEnd;
    let cursor = new Date(baseDate);
    let guard = 0;
    while (cursor <= rangeEnd && cursor <= endLimit && guard < 500) {
      if (cursor >= rangeStart) {
        expanded.push({
          ...event,
          id: `${event.id}-${toDateKey(cursor)}`,
          date: toDateKey(cursor),
          sourceEventId: event.id,
          occurrence: true
        });
      }
      cursor = addRecurrence(cursor, recurrence);
      guard += 1;
    }
  });
  return expanded;
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

function getDeadlineMeta(deadline, status) {
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return {
      label: 'No deadline',
      tone: 'normal'
    };
  }

  if (status === 'Completed') {
    return {
      label: `Completed | ${parsed.toLocaleDateString()}`,
      tone: 'normal'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} day(s) overdue`,
      tone: 'overdue'
    };
  }

  if (diffDays <= 2) {
    return {
      label: diffDays === 0 ? 'Due today' : `${diffDays} day(s) left`,
      tone: 'upcoming'
    };
  }

  return {
    label: `${diffDays} day(s) left`,
    tone: 'normal'
  };
}

function TaskCard({
  task,
  assigneeName,
  canAdvance,
  canReopen,
  canManageChecklist,
  onSetTaskStatus,
  onReopenTask,
  canComment,
  onAddComment,
  onToggleSubtask,
  onAddSubtask,
  isManagerView,
  onEditTask,
  onDeleteTask,
  usersById,
  onDragStart,
  canDrag,
  onQuickStatusChange,
  completionBlocker
}) {
  const [comment, setComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  const deadlineMeta = useMemo(() => getDeadlineMeta(task.deadline, task.status), [task.deadline, task.status]);

  const submitComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      return;
    }
    onAddComment({ taskId: task.id, text: comment });
    setComment('');
  };

  const moveToInProgress = () => {
    onSetTaskStatus(task.id, 'In Progress', 'button');
  };

  const moveToCompleted = () => {
    onSetTaskStatus(task.id, 'Completed', 'button');
  };

  const submitSubtask = (event) => {
    event.preventDefault();
    if (!newSubtask.trim() || !onAddSubtask) {
      return;
    }
    const result = onAddSubtask({
      taskId: task.id,
      text: newSubtask
    });
    if (result?.ok !== false) {
      setNewSubtask('');
    }
  };

  const handleCardKeyDown = (event) => {
    if (!onQuickStatusChange) {
      return;
    }
    if (event.key === '1') {
      onQuickStatusChange(task.id, 'Pending', 'keyboard');
    } else if (event.key === '2') {
      onQuickStatusChange(task.id, 'In Progress', 'keyboard');
    } else if (event.key === '3') {
      onQuickStatusChange(task.id, 'Completed', 'keyboard');
    }
  };

  return (
    <article
      className={`kanban-card deadline-${deadlineMeta.tone}`}
      draggable={canDrag}
      onDragStart={canDrag ? (event) => onDragStart(event, task.id) : undefined}
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      aria-label={`${task.title}. Press 1 for Pending, 2 for In Progress, 3 for Completed.`}
    >
      <div className="kanban-head">
        <h4>{task.title}</h4>
        <span className={priorityClass[task.priority] || 'priority medium'}>{task.priority}</span>
      </div>
      <p className="muted">{task.description}</p>
      <p className={`small deadline-chip ${deadlineMeta.tone}`}>Deadline: {task.deadline} | {deadlineMeta.label}</p>
      <p className="small">Assignee: {assigneeName}</p>
      <p className="small">Updated: {formatDateTime(task.updatedAt)}</p>

      {Array.isArray(task.labels) && task.labels.length > 0 ? (
        <div className="labels-row" aria-label="Task labels">
          {task.labels.map((label) => (
            <span key={`${task.id}-${label}`} className="task-label-pill">
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {canAdvance && task.status === 'Pending' ? (
        <button type="button" className="secondary-btn" onClick={moveToInProgress}>
          Start Task
        </button>
      ) : null}
      {canAdvance && task.status === 'In Progress' ? (
        <button
          type="button"
          className="secondary-btn"
          onClick={moveToCompleted}
          disabled={Boolean(completionBlocker)}
          title={completionBlocker || ''}
        >
          Mark Completed
        </button>
      ) : null}
      {canReopen ? (
        <button type="button" className="secondary-btn" onClick={() => onReopenTask(task.id)}>
          Continue Work
        </button>
      ) : null}
      {completionBlocker ? <p className="small inline-error">{completionBlocker}</p> : null}

      {isManagerView ? (
        <div className="manager-task-actions">
          <button type="button" className="secondary-btn" onClick={() => onEditTask(task)}>
            Edit
          </button>
          <button type="button" className="danger-btn" onClick={() => onDeleteTask(task.id)}>
            Delete
          </button>
        </div>
      ) : null}

      <div className="subtask-block">
        <h5>Checklist</h5>
        {(!task.subtasks || task.subtasks.length === 0) ? (
          <p className="small muted">No checklist items.</p>
        ) : (
          <ul className="subtask-list">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id}>
                <input
                  id={`subtask-${task.id}-${subtask.id}`}
                  type="checkbox"
                  checked={Boolean(subtask.completed)}
                  onChange={() =>
                    onToggleSubtask?.({
                      taskId: task.id,
                      subtaskId: subtask.id
                    })
                  }
                  disabled={!canManageChecklist}
                />
                <label
                  htmlFor={`subtask-${task.id}-${subtask.id}`}
                  className={subtask.completed ? 'done' : ''}
                >
                  {subtask.text}
                </label>
              </li>
            ))}
          </ul>
        )}
        {canManageChecklist ? (
          <form className="subtask-form" onSubmit={submitSubtask}>
            <input
              type="text"
              value={newSubtask}
              onChange={(event) => setNewSubtask(event.target.value)}
              placeholder="Add checklist item..."
            />
            <button type="submit" className="secondary-btn">
              Add
            </button>
          </form>
        ) : null}
      </div>

      <div className="comments-block">
        <h5>Updates</h5>
        {task.comments.length === 0 ? <p className="small muted">No updates yet.</p> : null}
        {task.comments.slice(0, 4).map((item) => (
          <div key={item.id} className="comment-item">
            <p>{item.text}</p>
            <p className="small muted">
              {usersById[item.authorId]?.name || 'User'} | {formatDateTime(item.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {canComment ? (
        <form onSubmit={submitComment} className="comment-form">
          <label htmlFor={`comment-${task.id}`}>Add Update</label>
          <input
            id={`comment-${task.id}`}
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add progress update..."
          />
          <button type="submit" className="primary-btn">
            Post
          </button>
        </form>
      ) : null}

      <div className="timeline-block">
        <h5>Activity Timeline</h5>
        <ul className="timeline-list">
          {(task.history || []).slice(0, 6).map((entry) => (
            <li key={entry.id}>
              <p>{entry.message}</p>
              <span>
                {usersById[entry.actorId]?.name || 'System'} | {formatDateTime(entry.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="small muted keyboard-hint">Shortcuts: 1 Pending, 2 In Progress, 3 Completed</p>
    </article>
  );
}

function TaskBoard({
  tasks,
  calendarEvents = [],
  usersById,
  employees = [],
  currentUserId,
  employeeView,
  onSetTaskStatus,
  onAddCalendarEvent,
  onDeleteCalendarEvent,
  onReopenTask,
  onAddComment,
  onToggleSubtask,
  onAddSubtask,
  onEditTask,
  onDeleteTask,
  getTaskCompletionBlocker
}) {
  const [viewMode, setViewMode] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [boardMessage, setBoardMessage] = useState('');
  const [eventForm, setEventForm] = useState(() => ({
    title: '',
    date: toDateKey(new Date()),
    description: '',
    recurrence: 'none',
    recurrenceUntil: ''
  }));
  const [eventError, setEventError] = useState('');

  const resolvedEmployeeFilter = employeeView ? currentUserId : employeeFilter;

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      if (resolvedEmployeeFilter !== 'All' && task.assignedTo !== resolvedEmployeeFilter) {
        return false;
      }

      if (statusFilter !== 'All' && task.status !== statusFilter) {
        return false;
      }

      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      if (query) {
        const searchable = `${task.title} ${task.description} ${(task.labels || []).join(' ')}`.toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [priorityFilter, resolvedEmployeeFilter, searchTerm, statusFilter, tasks]);

  const grouped = useMemo(() => {
    return STATUSES.reduce((acc, status) => {
      acc[status] = filteredTasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [filteredTasks]);

  const filteredCalendarEvents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return calendarEvents.filter((event) => {
      if (!event.date) {
        return false;
      }
      if (!query) {
        return true;
      }
      const text = `${event.title || ''} ${event.description || ''}`.toLowerCase();
      return text.includes(query);
    });
  }, [calendarEvents, searchTerm]);

  const calendarRange = useMemo(() => {
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const offset = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - offset);
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridStart.getDate() + 41);
    return {
      gridStart,
      gridEnd
    };
  }, [calendarCursor]);

  const expandedCalendarEvents = useMemo(() => {
    return expandRecurringEvents(filteredCalendarEvents, calendarRange.gridStart, calendarRange.gridEnd);
  }, [calendarRange.gridEnd, calendarRange.gridStart, filteredCalendarEvents]);

  const deadlineTasksByDate = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!task.deadline) {
        return acc;
      }
      const key = task.deadline;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});
  }, [filteredTasks]);

  const customEventsByDate = useMemo(() => {
    return expandedCalendarEvents.reduce((acc, event) => {
      const key = event.date;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {});
  }, [expandedCalendarEvents]);

  const noDeadlineTasks = useMemo(
    () => filteredTasks.filter((task) => !task.deadline),
    [filteredTasks]
  );

  const calendarCells = useMemo(() => {
    const month = calendarCursor.getMonth();
    const gridStart = calendarRange.gridStart;
    const todayKey = toDateKey(new Date());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = toDateKey(date);
      const taskCount = (deadlineTasksByDate[key] || []).length;
      const eventCount = (customEventsByDate[key] || []).filter((event) => {
        if (!event.autoGenerated || !event.sourceTaskId) {
          return true;
        }
        return !(deadlineTasksByDate[key] || []).some((task) => task.id === event.sourceTaskId);
      }).length;
      return {
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === month,
        isToday: key === todayKey,
        taskCount,
        eventCount
      };
    });
  }, [calendarCursor, calendarRange.gridStart, customEventsByDate, deadlineTasksByDate]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }
    return deadlineTasksByDate[selectedDateKey] || [];
  }, [deadlineTasksByDate, selectedDateKey]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }
    return customEventsByDate[selectedDateKey] || [];
  }, [customEventsByDate, selectedDateKey]);

  const handleDragStart = useCallback((event, taskId) => {
    setDraggedTaskId(taskId);
    event.dataTransfer.setData('text/task-id', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropToStatus = useCallback(
    (event, status) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('text/task-id') || draggedTaskId;
      if (!taskId || !onSetTaskStatus) {
        setDraggedTaskId(null);
        return;
      }
      const moved = onSetTaskStatus(taskId, status, 'drag-drop');
      setBoardMessage(moved?.ok ? moved.message : moved?.message || 'Move not allowed for this task.');
      setDraggedTaskId(null);
    },
    [draggedTaskId, onSetTaskStatus]
  );

  const handleQuickStatusChange = useCallback(
    (taskId, status, source = 'keyboard') => {
      if (!onSetTaskStatus) {
        return;
      }
      const result = onSetTaskStatus(taskId, status, source);
      setBoardMessage(result?.message || (result?.ok ? `Moved to ${status}` : 'Unable to update status.'));
    },
    [onSetTaskStatus]
  );

  const goToPreviousMonth = () => {
    setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleEventInputChange = (event) => {
    const { name, value } = event.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setEventError('');
  };

  const handleScheduleEvent = (event) => {
    event.preventDefault();
    if (!onAddCalendarEvent) {
      return;
    }
    if (!eventForm.title.trim() || !eventForm.date) {
      setEventError('Event title and date are required.');
      return;
    }
    if (
      eventForm.recurrence !== 'none' &&
      eventForm.recurrenceUntil &&
      eventForm.recurrenceUntil < eventForm.date
    ) {
      setEventError('Recurrence end date must be after start date.');
      return;
    }

    try {
      onAddCalendarEvent({
        title: eventForm.title,
        date: eventForm.date,
        description: eventForm.description,
        recurrence: eventForm.recurrence,
        recurrenceUntil: eventForm.recurrenceUntil
      });
      setSelectedDateKey(eventForm.date);
      setEventForm((prev) => ({
        ...prev,
        title: '',
        description: ''
      }));
    } catch (error) {
      setEventError(error.message || 'Unable to schedule event.');
    }
  };

  const renderCard = (task) => {
    const assigneeName = usersById[task.assignedTo]?.name || 'Unknown';
    const canManageTask = employeeView ? task.assignedTo === currentUserId : true;
    const canAdvance = canManageTask;
    const canReopen = canManageTask && task.status === 'Completed';
    const canComment = canManageTask;
    const canDrag = canManageTask;
    const completionBlocker = getTaskCompletionBlocker ? getTaskCompletionBlocker(task.id) : '';

    return (
      <TaskCard
        key={task.id}
        task={task}
        assigneeName={assigneeName}
        canAdvance={canAdvance}
        canReopen={canReopen}
        canManageChecklist={canManageTask}
        onSetTaskStatus={onSetTaskStatus}
        onReopenTask={onReopenTask}
        canComment={canComment}
        onAddComment={onAddComment}
        onToggleSubtask={onToggleSubtask}
        onAddSubtask={onAddSubtask}
        isManagerView={!employeeView}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        usersById={usersById}
        canDrag={canDrag}
        onDragStart={handleDragStart}
        onQuickStatusChange={handleQuickStatusChange}
        completionBlocker={completionBlocker}
      />
    );
  };

  return (
    <section aria-label="Task board">
      {boardMessage ? (
        <p className="small muted board-live-message" aria-live="polite">
          {boardMessage}
        </p>
      ) : null}
      <div className="board-controls">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search task..."
          aria-label="Search tasks"
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {!employeeView ? (
          <select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)}>
            <option value="All">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        ) : null}

        <div className="view-switcher">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={viewMode === option ? 'secondary-btn active-view' : 'secondary-btn'}
              onClick={() => setViewMode(option)}
            >
              {VIEW_LABELS[option] || option}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(event) => handleDropToStatus(event, status)}
            >
              <header className="kanban-column-head">
                <h3>{status}</h3>
                <span>{grouped[status].length}</span>
              </header>
              <div className="kanban-column-content">
                {grouped[status].length === 0 ? <p className="small muted">No tasks</p> : null}
                {grouped[status].map((task) => renderCard(task))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {viewMode === 'list' ? (
        <div className="list-view-wrap">
          <table className="task-list-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Assignee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="small muted">
                    No tasks found.
                  </td>
                </tr>
              ) : null}
              {filteredTasks.map((task) => {
                const canReopen = employeeView && task.assignedTo === currentUserId && task.status === 'Completed';
                const assigneeName = usersById[task.assignedTo]?.name || 'Unknown';
                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.priority}</td>
                    <td>{task.deadline}</td>
                    <td>{assigneeName}</td>
                    <td>
                      {canReopen ? (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => onReopenTask(task.id)}
                        >
                          Continue Work
                        </button>
                      ) : (
                        <span className="small muted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {viewMode === 'calendar' ? (
        <div className="calendar-view-wrap">
          <section className="calendar-event-form-card">
            <h4>Schedule Event</h4>
            <form className="calendar-event-form" onSubmit={handleScheduleEvent}>
              <input
                name="title"
                type="text"
                value={eventForm.title}
                onChange={handleEventInputChange}
                placeholder="Event title"
                required
              />
              <input
                name="date"
                type="date"
                value={eventForm.date}
                onChange={handleEventInputChange}
                required
              />
              <input
                name="description"
                type="text"
                value={eventForm.description}
                onChange={handleEventInputChange}
                placeholder="Description (optional)"
              />
              <select
                name="recurrence"
                value={eventForm.recurrence}
                onChange={handleEventInputChange}
                aria-label="Recurrence"
              >
                <option value="none">No Repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {eventForm.recurrence !== 'none' ? (
                <input
                  name="recurrenceUntil"
                  type="date"
                  value={eventForm.recurrenceUntil}
                  onChange={handleEventInputChange}
                  aria-label="Recurrence end date"
                />
              ) : null}
              <button type="submit" className="primary-btn">
                Add Event
              </button>
            </form>
            {eventError ? <p className="inline-error">{eventError}</p> : null}
          </section>

          <section className="calendar-month-card">
            <header className="calendar-month-head">
              <button type="button" className="secondary-btn" onClick={goToPreviousMonth}>
                Previous
              </button>
              <h4>{getMonthLabel(calendarCursor)}</h4>
              <button type="button" className="secondary-btn" onClick={goToNextMonth}>
                Next
              </button>
            </header>

            <div className="calendar-grid-head" aria-hidden="true">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="calendar-grid" role="grid" aria-label="Task deadlines calendar">
              {calendarCells.map((cell) => {
                const cellClassName = [
                  'calendar-cell',
                  cell.inMonth ? '' : 'other-month',
                  cell.isToday ? 'today' : '',
                  cell.taskCount + cell.eventCount > 0 ? 'has-deadline' : '',
                  selectedDateKey === cell.key ? 'selected' : ''
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={cell.key}
                    type="button"
                    role="gridcell"
                    className={cellClassName}
                    onClick={() => {
                      setSelectedDateKey(cell.key);
                      setEventForm((prev) => ({
                        ...prev,
                        date: cell.key
                      }));
                    }}
                    title={
                      cell.taskCount + cell.eventCount > 0
                        ? `${cell.taskCount} task deadline(s), ${cell.eventCount} event(s)`
                        : 'No schedules'
                    }
                  >
                    <span className="calendar-day-number">{cell.day}</span>
                    {cell.taskCount + cell.eventCount > 0 ? (
                      <span className="calendar-day-count">{cell.taskCount + cell.eventCount}</span>
                    ) : null}
                    {cell.eventCount > 0 ? <span className="calendar-day-dot" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="calendar-day-block">
            <h4>Schedules on {selectedDateKey || '--'}</h4>
            {selectedDateTasks.length === 0 && selectedDateEvents.length === 0 ? (
              <p className="small muted">No schedules on this date.</p>
            ) : null}
            <div className="calendar-task-grid">
              {selectedDateTasks.map((task) => (
                <article key={task.id} className="calendar-task-card">
                  <p className="calendar-tag">Task Deadline</p>
                  <p className="calendar-task-title">{task.title}</p>
                  <p className="small muted">{task.status}</p>
                  <p className="small muted">{usersById[task.assignedTo]?.name || 'Unknown'}</p>
                </article>
              ))}
              {selectedDateEvents.map((event) => (
                <article key={event.id} className="calendar-task-card calendar-event-card">
                  <p className="calendar-tag event">Event</p>
                  <p className="calendar-task-title">{event.title}</p>
                  {event.description ? <p className="small muted">{event.description}</p> : null}
                  <p className="small muted">
                    By {usersById[event.createdBy]?.name || 'User'} | {formatDateTime(event.createdAt)}
                  </p>
                  {event.autoGenerated ? (
                    <p className="small muted">Auto-generated from task assignment.</p>
                  ) : null}
                  {onDeleteCalendarEvent && !event.autoGenerated ? (
                    <button
                      type="button"
                      className="danger-btn calendar-delete-btn"
                      onClick={() => onDeleteCalendarEvent(event.id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {noDeadlineTasks.length > 0 ? (
            <section className="calendar-day-block">
              <h4>Tasks Without Deadline</h4>
              <div className="calendar-task-grid">
                {noDeadlineTasks.map((task) => (
                  <article key={task.id} className="calendar-task-card">
                    <p className="calendar-task-title">{task.title}</p>
                    <p className="small muted">{task.status}</p>
                    <p className="small muted">{usersById[task.assignedTo]?.name || 'Unknown'}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default TaskBoard;
