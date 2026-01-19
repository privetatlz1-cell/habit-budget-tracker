import React, { useState } from 'react';
import { TASK_TYPES, ROLES } from '../types';

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'utilities',
    volume: 100,
    cost: 10000000,
    requiredRoles: [],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.requiredRoles.length === 0) {
      alert('Заполните все обязательные поля');
      return;
    }
    onAddTask(formData);
    setFormData({
      title: '',
      type: 'utilities',
      volume: 100,
      cost: 10000000,
      requiredRoles: [],
    });
    onClose();
  };

  const toggleRole = (roleId) => {
    setFormData({
      ...formData,
      requiredRoles: formData.requiredRoles.includes(roleId)
        ? formData.requiredRoles.filter(id => id !== roleId)
        : [...formData.requiredRoles, roleId],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Добавить задачу</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название задачи *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип работы *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {Object.values(TASK_TYPES).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Объём работ
              </label>
              <input
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость (₽)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Необходимые специалисты *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ROLES).map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                    formData.requiredRoles.includes(role.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.requiredRoles.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="mr-2"
                  />
                  <span>{role.icon}</span>
                  <span className="ml-2 text-sm">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Добавить задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;

