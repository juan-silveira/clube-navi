"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Lock,
  Check,
  X,
  Loader,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const PermissionsPage = () => {
  const { showSuccess, showError } = useAlertContext();

  // Estados
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  // Modal de criar/editar role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    priority: 40,
    permissionIds: []
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/roles/roles');
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar roles:', error);
      showError('Erro ao carregar roles');
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/roles/permissions');
      if (response.data.success) {
        setPermissions(response.data.data.grouped || {});

        // Expandir todos os módulos por padrão
        const modules = Object.keys(response.data.data.grouped || {});
        const expanded = {};
        modules.forEach(module => {
          expanded[module] = true;
        });
        setExpandedModules(expanded);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      showError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      priority: 40,
      permissionIds: []
    });
    setShowRoleModal(true);
  };

  const handleOpenEditModal = async (role) => {
    // Buscar detalhes completos da role incluindo permissões
    try {
      const response = await api.get(`/api/roles/roles/${role.id}`);
      if (response.data.success) {
        const fullRole = response.data.data;
        setEditingRole(fullRole);
        setRoleForm({
          name: fullRole.name,
          displayName: fullRole.displayName,
          description: fullRole.description || '',
          priority: fullRole.priority,
          permissionIds: fullRole.permissions?.map(rp => rp.permission.id) || []
        });
        setShowRoleModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da role:', error);
      showError('Erro ao carregar detalhes da role');
    }
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      priority: 40,
      permissionIds: []
    });
  };

  const handleSaveRole = async () => {
    // Validações
    if (!roleForm.displayName.trim()) {
      showError('Nome de exibição é obrigatório');
      return;
    }

    if (!editingRole && !roleForm.name.trim()) {
      showError('Nome interno é obrigatório');
      return;
    }

    try {
      if (editingRole) {
        // Atualizar role
        const response = await api.put(`/api/roles/roles/${editingRole.id}`, {
          displayName: roleForm.displayName.trim(),
          description: roleForm.description.trim(),
          priority: parseInt(roleForm.priority),
          permissionIds: roleForm.permissionIds
        });

        if (response.data.success) {
          showSuccess('Role atualizada com sucesso');
          fetchRoles();
          handleCloseRoleModal();
        }
      } else {
        // Criar nova role
        const response = await api.post('/api/roles/roles', {
          name: roleForm.name.trim().toLowerCase().replace(/\s+/g, '_'),
          displayName: roleForm.displayName.trim(),
          description: roleForm.description.trim(),
          priority: parseInt(roleForm.priority),
          permissionIds: roleForm.permissionIds
        });

        if (response.data.success) {
          showSuccess('Role criada com sucesso');
          fetchRoles();
          handleCloseRoleModal();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar role:', error);
      showError(error.response?.data?.error || 'Erro ao salvar role');
    }
  };

  const handleDeleteRole = async (roleId, isSystem) => {
    if (isSystem) {
      showError('Roles do sistema não podem ser deletadas');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta role?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/roles/roles/${roleId}`);
      if (response.data.success) {
        showSuccess('Role excluída com sucesso');
        fetchRoles();
      }
    } catch (error) {
      console.error('Erro ao excluir role:', error);
      showError(error.response?.data?.error || 'Erro ao excluir role');
    }
  };

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  const togglePermission = (permissionId) => {
    setRoleForm(prev => {
      const isSelected = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: isSelected
          ? prev.permissionIds.filter(id => id !== permissionId)
          : [...prev.permissionIds, permissionId]
      };
    });
  };

  const selectAllModulePermissions = (modulePermissions) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => roleForm.permissionIds.includes(id));

    if (allSelected) {
      // Desselecionar todas as permissões do módulo
      setRoleForm(prev => ({
        ...prev,
        permissionIds: prev.permissionIds.filter(id => !modulePermissionIds.includes(id))
      }));
    } else {
      // Selecionar todas as permissões do módulo
      setRoleForm(prev => ({
        ...prev,
        permissionIds: [...new Set([...prev.permissionIds, ...modulePermissionIds])]
      }));
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Criar',
      read: 'Ler',
      update: 'Atualizar',
      delete: 'Deletar',
      execute: 'Executar'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-700',
      read: 'bg-blue-100 text-blue-700',
      update: 'bg-yellow-100 text-yellow-700',
      delete: 'bg-red-100 text-red-700',
      execute: 'bg-purple-100 text-purple-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    if (priority >= 100) return 'bg-red-100 text-red-700';
    if (priority >= 80) return 'bg-orange-100 text-orange-700';
    if (priority >= 50) return 'bg-yellow-100 text-yellow-700';
    if (priority >= 30) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            Roles e Permissões
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie roles e suas permissões no sistema
          </p>
        </div>
        <Button
          icon="heroicons-outline:plus"
          text="Nova Role"
          className="btn-primary"
          onClick={handleOpenCreateModal}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lista de Roles */}
        <div className="lg:col-span-1">
          <Card title="Roles do Sistema">
            <div className="space-y-3">
              {roles.map(role => (
                <div
                  key={role.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold text-slate-900 dark:text-white">
                          {role.displayName}
                        </h5>
                        {role.isSystem && (
                          <Lock className="w-4 h-4 text-slate-400" title="Role do sistema" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {role.description}
                      </p>
                    </div>
                    {!role.isSystem && (
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => handleOpenEditModal(role)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id, role.isSystem)}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${getPriorityColor(role.priority)}`}>
                      Prioridade: {role.priority}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {role._count?.permissions || 0} permissões
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Matriz de Permissões */}
        <div className="lg:col-span-2">
          <Card title="Matriz de Permissões">
            <div className="space-y-4">
              {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
                <div
                  key={moduleName}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(moduleName)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {expandedModules[moduleName] ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {moduleName}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {modulePermissions.length} permissões
                    </span>
                  </button>

                  {expandedModules[moduleName] && (
                    <div className="p-4 space-y-2">
                      {modulePermissions.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(permission.action)}`}>
                              {getActionLabel(permission.action)}
                            </span>
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {permission.description}
                            </span>
                          </div>
                          <code className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {permission.resource}
                          </code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Criar/Editar Role */}
      <Modal
        activeModal={showRoleModal}
        onClose={handleCloseRoleModal}
        title={editingRole ? 'Editar Role' : 'Nova Role'}
        className="max-w-4xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={handleCloseRoleModal}
            />
            <Button
              text={editingRole ? 'Atualizar' : 'Criar'}
              className="btn-primary"
              onClick={handleSaveRole}
            />
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingRole && (
              <Textinput
                label="Nome Interno"
                placeholder="ex: custom_admin"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                description="Usado internamente no sistema (sem espaços)"
              />
            )}

            <Textinput
              label="Nome de Exibição"
              placeholder="ex: Administrador Customizado"
              value={roleForm.displayName}
              onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
            />

            <Textinput
              label="Prioridade"
              type="number"
              min="1"
              max="99"
              value={roleForm.priority}
              onChange={(e) => setRoleForm({ ...roleForm, priority: e.target.value })}
              description="Entre Operador (50) e Cliente Adimplente (30)"
            />
          </div>

          <Textarea
            label="Descrição"
            placeholder="Descreva as responsabilidades desta role"
            value={roleForm.description}
            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            rows={2}
          />

          <div>
            <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Permissões ({roleForm.permissionIds.length} selecionadas)
            </h6>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(permissions).map(([moduleName, modulePermissions]) => {
                const modulePermissionIds = modulePermissions.map(p => p.id);
                const allSelected = modulePermissionIds.every(id => roleForm.permissionIds.includes(id));
                const someSelected = modulePermissionIds.some(id => roleForm.permissionIds.includes(id));

                return (
                  <div
                    key={moduleName}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {moduleName}
                      </span>
                      <button
                        onClick={() => selectAllModulePermissions(modulePermissions)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          allSelected
                            ? 'bg-primary-500 text-white'
                            : someSelected
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      {modulePermissions.map(permission => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={roleForm.permissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="form-checkbox h-4 w-4 text-primary-600"
                          />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(permission.action)}`}>
                            {getActionLabel(permission.action)}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                            {permission.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
