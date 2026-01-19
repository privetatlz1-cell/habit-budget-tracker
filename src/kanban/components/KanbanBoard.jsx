import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from './Column';
import { COLUMNS } from '../types';

const KanbanBoard = ({ tasks, onMoveTask, onAssignRole }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasks}
            onMoveTask={onMoveTask}
            onAssignRole={onAssignRole}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;

