import React, { useState } from 'react';
import { ROLES, COLUMNS } from '../types';

const RolesInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">
          ℹ️ Информация о специалистах и их зонах ответственности
        </h2>
        <span className="text-gray-600">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(ROLES).map((role) => {
            const responsibilityColumns = COLUMNS.filter((col) =>
              role.responsibilities.includes(col.id)
            );

            return (
              <div
                key={role.id}
                className="border border-gray-200 rounded-lg p-4"
                style={{ borderLeftColor: role.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{role.icon}</span>
                  <h3 className="font-semibold text-gray-800">{role.name}</h3>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Зоны ответственности:</p>
                  <div className="flex flex-wrap gap-1">
                    {responsibilityColumns.map((col) => (
                      <span
                        key={col.id}
                        className="text-xs px-2 py-1 bg-gray-100 rounded"
                        style={{ color: role.color }}
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚡ Эффективность x2 в зоне ответственности
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RolesInfo;

