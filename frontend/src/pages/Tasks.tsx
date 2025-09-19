import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Task, ApiResponse } from '../types';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get<ApiResponse<{tasks: Task[]}>>('/tasks');
      if (response.data.success && response.data.data) {
        setTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error('Tasks fetch error:', error);
      alert('Görevler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Görev başlığı gereklidir');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        const response = await api.put<ApiResponse<Task>>(`/tasks/${editingTask._id}`, formData);
        if (response.data.success) {
          await fetchTasks();
          alert('Görev güncellendi');
        }
      } else {
        // Create new task
        const response = await api.post<ApiResponse<Task>>('/tasks', formData);
        if (response.data.success) {
          await fetchTasks();
          alert('Yeni görev eklendi');
        }
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      setShowForm(false);
      setEditingTask(null);
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Görev kaydedilirken hata oluştu';
      alert(message);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        await fetchTasks();
        alert('Görev silindi');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Görev silinirken hata oluştu';
      alert(message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (response.data.success) {
        await fetchTasks();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Durum güncellenirken hata oluştu';
      alert(message);
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Görevlerim</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
            setFormData({
              title: '',
              description: '',
              priority: 'medium',
              dueDate: ''
            });
          }}
          className="btn-primary"
        >
          ➕ Yeni Görev Ekle
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görev Başlığı *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Görev başlığını girin"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Görev açıklaması (opsiyonel)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öncelik
                </label>
                <select
                  className="input-field"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Tarih
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingTask ? 'Güncelle' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-md">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">Henüz hiç göreviniz yok</p>
            <p className="text-gray-400 text-sm mt-2">Yukarıdaki butonu kullanarak ilk görevinizi ekleyin</p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div key={task._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'todo' && '📋 Bekliyor'}
                        {task.status === 'in-progress' && '⏳ Devam Ediyor'}
                        {task.status === 'completed' && '✅ Tamamlandı'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'low' && '🟢 Düşük'}
                        {task.priority === 'medium' && '🟡 Orta'}
                        {task.priority === 'high' && '🟠 Yüksek'}
                        {task.priority === 'urgent' && '🔴 Acil'}
                      </span>
                      
                      {task.dueDate && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          📅 {formatDate(task.dueDate.toString())}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400">
                      Oluşturuldu: {formatDate(task.createdAt.toString())}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {/* Status Change Buttons */}
                    {task.status !== 'completed' && (
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value as Task['status'])}
                      >
                        <option value="todo">Bekliyor</option>
                        <option value="in-progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                      </select>
                    )}
                    
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                    >
                      ✏️ Düzenle
                    </button>
                    
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;