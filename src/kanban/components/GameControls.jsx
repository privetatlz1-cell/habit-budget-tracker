import React, { useState } from 'react';

const GameControls = ({ onNextDay, currentDay, gameOver, gameWon, lastDiceRoll, onReset }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Управление игрой</h2>
          {lastDiceRoll && (
            <p className="text-sm text-gray-600">
              Последний бросок кубика: <span className="font-bold text-blue-600">{lastDiceRoll}</span>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {!gameOver && !gameWon && (
            <button
              onClick={onNextDay}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
            >
              Следующий день
            </button>
          )}

          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onReset();
                  setShowConfirm(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Подтвердить
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Новая игра
            </button>
          )}
        </div>
      </div>

      {gameOver && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Игра окончена!</strong> Бюджет превышен.
        </div>
      )}

      {gameWon && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Поздравляем!</strong> Все задачи выполнены в рамках бюджета!
        </div>
      )}
    </div>
  );
};

export default GameControls;

