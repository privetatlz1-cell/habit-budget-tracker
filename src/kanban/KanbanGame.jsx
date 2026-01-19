import React, { useState } from 'react';
import useKanbanStore from './store';
import KanbanBoard from './components/KanbanBoard';
import BudgetDisplay from './components/BudgetDisplay';
import GameControls from './components/GameControls';
import AddTaskModal from './components/AddTaskModal';
import MetricsCharts from './components/MetricsCharts';
import RolesInfo from './components/RolesInfo';
import GameInstructions from './components/GameInstructions';

const KanbanGame = () => {
  const {
    tasks,
    budget,
    spentBudget,
    currentDay,
    gameOver,
    gameWon,
    history,
    moveTask,
    assignRole,
    nextDay,
    addTask,
    resetGame,
  } = useKanbanStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const lastDiceRoll = history.length > 0 ? history[history.length - 1].diceRoll : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏗️ Управление инфраструктурным проектом
          </h1>
          <p className="text-gray-600">
            Интерактивная обучающая игра в стиле Kanban для дорожного и мостового строительства
          </p>
        </header>

        <GameInstructions />

        <GameControls
          onNextDay={nextDay}
          currentDay={currentDay}
          gameOver={gameOver}
          gameWon={gameWon}
          lastDiceRoll={lastDiceRoll}
          onReset={resetGame}
        />

        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
          >
            + Добавить задачу
          </button>
        </div>

        <RolesInfo />

        <BudgetDisplay
          budget={budget}
          spent={spentBudget}
          currentDay={currentDay}
        />

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Kanban Доска</h2>
          <KanbanBoard
            tasks={tasks}
            onMoveTask={moveTask}
            onAssignRole={assignRole}
          />
        </div>

        <MetricsCharts history={history} tasks={tasks} />

        <AddTaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
};

export default KanbanGame;

