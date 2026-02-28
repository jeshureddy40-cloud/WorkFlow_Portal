export const mockUsers = [
  {
    id: 'mgr-1',
    name: 'Jeswanth',
    role: 'Manager',
    username: 'jeswanth',
    password: '123456',
    githubUsername: '',
    avatarDataUrl: ''
  },
  {
    id: 'emp-1',
    name: 'Hari',
    role: 'Employee',
    username: 'hari',
    password: '12345',
    githubUsername: '',
    avatarDataUrl: ''
  },
  {
    id: 'emp-2',
    name: 'Sarath',
    role: 'Employee',
    username: 'sarath',
    password: '1234',
    githubUsername: '',
    avatarDataUrl: ''
  }
];

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Design task board layout',
    description: 'Create a Kanban layout with Pending, In Progress, and Completed columns.',
    priority: 'High',
    deadline: '2026-03-05',
    assignedTo: 'emp-1',
    status: 'Pending',
    labels: ['UI', 'Kanban'],
    comments: [],
    history: [
      {
        id: 'hist-1',
        type: 'assigned',
        message: 'Assigned to Hari.',
        actorId: 'mgr-1',
        createdAt: '2026-02-20T09:30:00.000Z',
        meta: {
          assignedTo: 'emp-1'
        }
      },
      {
        id: 'hist-2',
        type: 'created',
        message: 'Task created.',
        actorId: 'mgr-1',
        createdAt: '2026-02-20T09:30:00.000Z',
        meta: {}
      }
    ],
    reopenCount: 0,
    createdAt: '2026-02-20T09:30:00.000Z',
    updatedAt: '2026-02-20T09:30:00.000Z'
  },
  {
    id: 'task-2',
    title: 'Implement status transitions',
    description: 'Allow employee status flow Pending -> In Progress -> Completed.',
    priority: 'Medium',
    deadline: '2026-03-07',
    assignedTo: 'emp-2',
    status: 'In Progress',
    labels: ['Logic'],
    comments: [],
    history: [
      {
        id: 'hist-3',
        type: 'status-change',
        message: 'Status changed from Pending to In Progress.',
        actorId: 'emp-2',
        createdAt: '2026-02-22T15:00:00.000Z',
        meta: {
          fromStatus: 'Pending',
          toStatus: 'In Progress'
        }
      },
      {
        id: 'hist-4',
        type: 'assigned',
        message: 'Assigned to Sarath.',
        actorId: 'mgr-1',
        createdAt: '2026-02-21T10:10:00.000Z',
        meta: {
          assignedTo: 'emp-2'
        }
      },
      {
        id: 'hist-5',
        type: 'created',
        message: 'Task created.',
        actorId: 'mgr-1',
        createdAt: '2026-02-21T10:10:00.000Z',
        meta: {}
      }
    ],
    reopenCount: 0,
    createdAt: '2026-02-21T10:10:00.000Z',
    updatedAt: '2026-02-22T15:00:00.000Z'
  },
  {
    id: 'task-3',
    title: 'Set up profile GitHub linking',
    description: 'Add GitHub username storage and avatar rendering on profile page.',
    priority: 'Low',
    deadline: '2026-03-10',
    assignedTo: 'emp-2',
    status: 'Completed',
    labels: ['Profile'],
    comments: [
      {
        id: 'comment-1',
        text: 'Completed and verified avatar rendering.',
        authorId: 'emp-2',
        createdAt: '2026-02-25T08:15:00.000Z'
      }
    ],
    history: [
      {
        id: 'hist-6',
        type: 'comment',
        message: 'Comment added.',
        actorId: 'emp-2',
        createdAt: '2026-02-25T08:15:00.000Z',
        meta: {}
      },
      {
        id: 'hist-7',
        type: 'status-change',
        message: 'Status changed from In Progress to Completed.',
        actorId: 'emp-2',
        createdAt: '2026-02-24T10:00:00.000Z',
        meta: {
          fromStatus: 'In Progress',
          toStatus: 'Completed'
        }
      },
      {
        id: 'hist-8',
        type: 'assigned',
        message: 'Assigned to Sarath.',
        actorId: 'mgr-1',
        createdAt: '2026-02-21T11:45:00.000Z',
        meta: {
          assignedTo: 'emp-2'
        }
      },
      {
        id: 'hist-9',
        type: 'created',
        message: 'Task created.',
        actorId: 'mgr-1',
        createdAt: '2026-02-21T11:45:00.000Z',
        meta: {}
      }
    ],
    reopenCount: 0,
    createdAt: '2026-02-21T11:45:00.000Z',
    updatedAt: '2026-02-25T08:15:00.000Z'
  }
];
