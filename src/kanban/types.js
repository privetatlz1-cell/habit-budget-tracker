// Типы и константы для Kanban игры

export const COLUMNS = [
  { id: 'backlog', name: 'Backlog (банк задач)', order: 0 },
  { id: 'ready', name: 'Готово к запуску', order: 1 },
  { id: 'design', name: 'Проектирование (рабочая документация)', order: 2 },
  { id: 'executive', name: 'Исполнительная документация', order: 3 },
  { id: 'materials', name: 'Входной контроль материалов', order: 4 },
  { id: 'survey', name: 'Геодезические проверки', order: 5 },
  { id: 'construction', name: 'Строительно-монтажные работы', order: 6 },
  { id: 'acceptance', name: 'Приёмка и сдача', order: 7 },
];

export const ROLES = {
  QUALITY_ENGINEER: {
    id: 'quality_engineer',
    name: 'Инженер по качеству',
    color: '#FF6B6B',
    icon: '🔍',
    responsibilities: ['materials', 'acceptance'],
  },
  EXECUTIVE_DOC: {
    id: 'executive_doc',
    name: 'Специалист по исполнительной документации',
    color: '#4ECDC4',
    icon: '📋',
    responsibilities: ['executive'],
  },
  SAFETY_ENGINEER: {
    id: 'safety_engineer',
    name: 'Инженер по охране труда',
    color: '#FFE66D',
    icon: '🦺',
    responsibilities: ['construction'],
  },
  FOREMAN: {
    id: 'foreman',
    name: 'Строители (бригадиры)',
    color: '#95E1D3',
    icon: '👷',
    responsibilities: ['construction'],
  },
  SURVEYOR: {
    id: 'surveyor',
    name: 'Геодезисты',
    color: '#A8E6CF',
    icon: '📐',
    responsibilities: ['survey'],
  },
};

export const TASK_TYPES = {
  UTILITIES: {
    id: 'utilities',
    name: 'Перекладка инженерных сетей',
    description: 'Газ, водопровод, теплосеть, кабельные линии, сети связи, ливневая канализация',
    icon: '🔧',
  },
  EARTHWORK: {
    id: 'earthwork',
    name: 'Устройство земляного полотна',
    description: 'Подготовка и уплотнение грунта',
    icon: '🏗️',
  },
  PAVEMENT: {
    id: 'pavement',
    name: 'Устройство дорожной одежды',
    description: 'Укладка асфальтобетона, разметка',
    icon: '🛣️',
  },
  BRIDGE: {
    id: 'bridge',
    name: 'Строительство мостовых сооружений',
    description: 'Возведение опор, пролётных строений',
    icon: '🌉',
  },
};

// Примеры задач для начального состояния
export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Перекладка газопровода на участке 0-2 км',
    type: 'utilities',
    volume: 500,
    cost: 150000000,
    requiredRoles: ['foreman'],
    dependencies: [],
    columnId: 'backlog',
    assignedRole: null,
    progress: 0,
    startDay: null,
    completedDay: null,
    createdAt: 0,
  },
  {
    id: 'task-2',
    title: 'Устройство ливневой канализации на участке 3-5 км',
    type: 'utilities',
    volume: 800,
    cost: 200000000,
    requiredRoles: ['foreman'],
    dependencies: [],
    columnId: 'backlog',
    assignedRole: null,
    progress: 0,
    startDay: null,
    completedDay: null,
    createdAt: 0,
  },
  {
    id: 'task-3',
    title: 'Устройство земляного полотна на участке 0-3 км',
    type: 'earthwork',
    volume: 1200,
    cost: 300000000,
    requiredRoles: ['foreman'],
    dependencies: ['task-1'],
    columnId: 'backlog',
    assignedRole: null,
    progress: 0,
    startDay: null,
    completedDay: null,
    createdAt: 0,
  },
  {
    id: 'task-4',
    title: 'Устройство дорожной одежды на участке 0-2 км',
    type: 'pavement',
    volume: 600,
    cost: 180000000,
    requiredRoles: ['foreman'],
    dependencies: ['task-3'],
    columnId: 'backlog',
    assignedRole: null,
    progress: 0,
    startDay: null,
    completedDay: null,
    createdAt: 0,
  },
  {
    id: 'task-5',
    title: 'Строительство моста через реку (пролёт 50м)',
    type: 'bridge',
    volume: 2000,
    cost: 500000000,
    requiredRoles: ['foreman', 'surveyor'],
    dependencies: [],
    columnId: 'backlog',
    assignedRole: null,
    progress: 0,
    startDay: null,
    completedDay: null,
    createdAt: 0,
  },
];

export const INITIAL_BUDGET = 5000000000; // 5 млрд рублей

