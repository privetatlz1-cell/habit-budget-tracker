import React from 'react';
import { useDrag } from 'react-dnd';
import { ROLES, TASK_TYPES, COLUMNS } from '../types';

const TaskCard = ({ task, onAssignRole }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const taskType = Object.values(TASK_TYPES).find(t => t.id === task.type);
  const assignedRole = task.assignedRole
    ? Object.values(ROLES).find(r => r.id === task.assignedRole)
    : null;
  
  // Проверяем, работает ли специалист в своей зоне ответственности
  const isInResponsibility = assignedRole && assignedRole.responsibilities.includes(task.columnId);

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg shadow-md p-4 mb-3 cursor-move border-l-4 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{
        borderLeftColor: taskType?.icon ? '#FF8C42' : '#4A90E2',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-800 mb-1">{task.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span>{taskType?.icon}</span>
            <span>Объём: {task.volume}</span>
            <span className="text-orange-600 font-medium">
              {task.cost.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {task.progress > 0 && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{Math.round(task.progress)}%</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <select
          value={task.assignedRole || ''}
          onChange={(e) => onAssignRole(task.id, e.target.value || null)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Назначить специалиста</option>
          {task.requiredRoles?.map((roleId) => {
            const role = Object.values(ROLES).find(r => r.id === roleId);
            return role ? (
              <option key={role.id} value={role.id}>
                {role.icon} {role.name}
              </option>
            ) : null;
          })}
        </select>

        {assignedRole && (
          <div className="flex items-center gap-1">
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: `${assignedRole.color}20`,
                color: assignedRole.color,
              }}
            >
              {assignedRole.icon} {assignedRole.name}
            </span>
            {isInResponsibility && (
              <span className="text-xs text-green-600 font-bold" title="Эффективность x2">
                ⚡
              </span>
            )}
          </div>
        )}
      </div>

      {task.dependencies && task.dependencies.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Зависит от: {task.dependencies.length} задач
        </div>
      )}
    </div>
  );
};

export default TaskCard;

