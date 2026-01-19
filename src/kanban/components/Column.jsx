import React from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';

const Column = ({ column, tasks, onMoveTask, onAssignRole }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => {
      onMoveTask(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const columnTasks = tasks.filter((task) => task.columnId === column.id);

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] bg-gray-100 rounded-lg p-4 ${
        isOver ? 'bg-gray-200 border-2 border-blue-500' : ''
      }`}
    >
      <div className="mb-4">
        <h2 className="font-bold text-gray-800 text-sm mb-1">{column.name}</h2>
        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
          {columnTasks.length} задач
        </span>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onAssignRole={onAssignRole}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;

