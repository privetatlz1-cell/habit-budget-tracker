import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_TASKS, INITIAL_BUDGET, COLUMNS, ROLES } from './types';

// Функция для генерации случайного числа от 1 до 6 (бросок кубика)
const rollDice = () => Math.floor(Math.random() * 6) + 1;

// Проверка зависимостей задачи
const canStartTask = (task, allTasks) => {
  if (!task.dependencies || task.dependencies.length === 0) return true;
  return task.dependencies.every(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.columnId === 'acceptance';
  });
};

// Получение эффективности специалиста для задачи
const getEfficiency = (task, diceRoll) => {
  if (!task.assignedRole) return 0;
  
  const role = Object.values(ROLES).find(r => r.id === task.assignedRole);
  if (!role) return diceRoll;
  
  // Проверяем, находится ли задача в зоне ответственности специалиста
  const column = COLUMNS.find(c => c.id === task.columnId);
  const isInResponsibility = role.responsibilities.includes(task.columnId);
  
  return isInResponsibility ? diceRoll * 2 : diceRoll;
};

const useKanbanStore = create(
  persist(
    (set, get) => ({
      // Состояние игры
      tasks: INITIAL_TASKS,
      budget: INITIAL_BUDGET,
      spentBudget: 0,
      currentDay: 0,
      gameOver: false,
      gameWon: false,
      
      // История для графиков
      history: [
        {
          day: 0,
          budget: INITIAL_BUDGET,
          spent: 0,
          columnDistribution: COLUMNS.reduce((acc, col) => {
            acc[col.id] = INITIAL_TASKS.filter(t => t.columnId === col.id).length;
            return acc;
          }, {}),
        },
      ],
      
      // Действия
      moveTask: (taskId, newColumnId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Проверка зависимостей при перемещении в "Готово к запуску"
        if (newColumnId === 'ready' && !canStartTask(task, tasks)) {
          alert('Нельзя начать задачу: не выполнены зависимости');
          return;
        }
        
        // Если задача перемещается в рабочую колонку, начинаем отслеживание
        const workingColumns = ['design', 'executive', 'materials', 'survey', 'construction'];
        const isMovingToWorking = workingColumns.includes(newColumnId);
        const wasInWorking = workingColumns.includes(task.columnId);
        
        const updatedTask = {
          ...task,
          columnId: newColumnId,
          startDay: isMovingToWorking && !wasInWorking ? get().currentDay : task.startDay,
        };
        
        set({
          tasks: tasks.map(t => (t.id === taskId ? updatedTask : t)),
        });
      },
      
      assignRole: (taskId, roleId) => {
        const { tasks } = get();
        set({
          tasks: tasks.map(t =>
            t.id === taskId ? { ...t, assignedRole: roleId } : t
          ),
        });
      },
      
      nextDay: () => {
        const { tasks, budget, spentBudget, currentDay, history } = get();
        
        if (get().gameOver || get().gameWon) return;
        
        const diceRoll = rollDice();
        const newDay = currentDay + 1;
        // Рабочие колонки - те, где задачи выполняются и требуют назначения специалиста
        const workingColumns = ['design', 'executive', 'materials', 'survey', 'construction'];
        
        let newSpentBudget = spentBudget;
        const updatedTasks = tasks.map(task => {
          // Обрабатываем только задачи в рабочих колонках с назначенным специалистом
          if (!workingColumns.includes(task.columnId)) {
            return task;
          }
          
          // Задачи без назначенного специалиста не выполняются
          if (!task.assignedRole) {
            return task;
          }
          
          // Если задача только что перемещена в рабочую колонку, начинаем отслеживание
          if (task.startDay === null) {
            return {
              ...task,
              startDay: newDay,
            };
          }
          
          const efficiency = getEfficiency(task, diceRoll);
          const newProgress = Math.min(100, task.progress + efficiency);
          
          // Если задача завершена, перемещаем в следующую колонку
          let newColumnId = task.columnId;
          let completedDay = task.completedDay;
          
          if (newProgress >= 100) {
            const currentColumnIndex = COLUMNS.findIndex(c => c.id === task.columnId);
            if (currentColumnIndex < COLUMNS.length - 1) {
              newColumnId = COLUMNS[currentColumnIndex + 1].id;
              
              // Если достигли приёмки, задача завершена
              if (newColumnId === 'acceptance') {
                completedDay = newDay;
                newSpentBudget += task.cost;
                // В приёмке прогресс остается 100%
                return {
                  ...task,
                  progress: 100,
                  columnId: newColumnId,
                  completedDay,
                };
              } else {
                // В следующей колонке сбрасываем прогресс
                return {
                  ...task,
                  progress: 0,
                  columnId: newColumnId,
                  completedDay,
                };
              }
            }
          }
          
          return {
            ...task,
            progress: newProgress,
            columnId: newColumnId,
            completedDay,
          };
        });
        
        // Проверка условий победы/проигрыша
        const allCompleted = updatedTasks.every(t => t.columnId === 'acceptance');
        const budgetExceeded = newSpentBudget > budget;
        
        // Обновление истории
        const columnDistribution = COLUMNS.reduce((acc, col) => {
          acc[col.id] = updatedTasks.filter(t => t.columnId === col.id).length;
          return acc;
        }, {});
        
        const newHistory = [
          ...history,
          {
            day: newDay,
            budget: budget - newSpentBudget,
            spent: newSpentBudget,
            columnDistribution,
            diceRoll,
          },
        ];
        
        set({
          tasks: updatedTasks,
          spentBudget: newSpentBudget,
          currentDay: newDay,
          history: newHistory,
          gameOver: budgetExceeded,
          gameWon: allCompleted && !budgetExceeded,
        });
      },
      
      addTask: (taskData) => {
        const { tasks } = get();
        const newTask = {
          id: `task-${Date.now()}`,
          ...taskData,
          columnId: 'backlog',
          assignedRole: null,
          progress: 0,
          startDay: null,
          completedDay: null,
          createdAt: get().currentDay,
        };
        
        set({
          tasks: [...tasks, newTask],
        });
      },
      
      resetGame: () => {
        set({
          tasks: INITIAL_TASKS,
          budget: INITIAL_BUDGET,
          spentBudget: 0,
          currentDay: 0,
          gameOver: false,
          gameWon: false,
          history: [
            {
              day: 0,
              budget: INITIAL_BUDGET,
              spent: 0,
              columnDistribution: COLUMNS.reduce((acc, col) => {
                acc[col.id] = INITIAL_TASKS.filter(t => t.columnId === col.id).length;
                return acc;
              }, {}),
            },
          ],
        });
      },
    }),
    {
      name: 'kanban-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useKanbanStore;

