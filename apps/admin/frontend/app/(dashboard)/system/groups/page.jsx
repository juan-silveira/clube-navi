"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import MultiSelect from '@/components/ui/MultiSelect';
import Modal from '@/components/ui/Modal';
import { useAlertContext } from '@/contexts/AlertContext';
import api from '@/services/api';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Loader
} from 'lucide-react';

const GroupsPage = () => {
  const { showSuccess, showError } = useAlertContext();

  // Estados
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modal de criar/editar grupo
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    userIds: []
  });

  // Modal de adicionar usuários
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [usersToAdd, setUsersToAdd] = useState([]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/groups');
      if (response.data.success) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      showError('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/api/users?limit=1000');
      if (response.data.success) {
        const usersList = response.data.data?.users || [];
        // Ordenar alfabeticamente por nome
        const sortedUsers = usersList.sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro ao carregar usuários');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      description: '',
      color: '#3B82F6',
      userIds: []
    });
    setShowGroupModal(true);
  };

  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      color: group.color || '#3B82F6',
      userIds: group.users?.map(gu => gu.userId) || []
    });
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({
      name: '',
      description: '',
      color: '#3B82F6',
      userIds: []
    });
  };

  const handleSaveGroup = async () => {
    // Validações
    if (!groupForm.name.trim()) {
      showError('Nome do grupo é obrigatório');
      return;
    }

    try {
      if (editingGroup) {
        // Atualizar grupo
        const response = await api.put(`/api/groups/${editingGroup.id}`, {
          name: groupForm.name.trim(),
          description: groupForm.description.trim(),
          color: groupForm.color
        });

        if (response.data.success) {
          // Se mudou os usuários, atualizar
          const currentUserIds = editingGroup.users?.map(gu => gu.userId) || [];
          const usersToAddIds = groupForm.userIds.filter(id => !currentUserIds.includes(id));
          const usersToRemoveIds = currentUserIds.filter(id => !groupForm.userIds.includes(id));

          if (usersToAddIds.length > 0) {
            await api.post(`/api/groups/${editingGroup.id}/users`, {
              userIds: usersToAddIds
            });
          }

          if (usersToRemoveIds.length > 0) {
            await api.delete(`/api/groups/${editingGroup.id}/users`, {
              data: { userIds: usersToRemoveIds }
            });
          }

          showSuccess('Grupo atualizado com sucesso');
          fetchGroups();
          handleCloseGroupModal();
        }
      } else {
        // Criar novo grupo
        const response = await api.post('/api/groups', {
          name: groupForm.name.trim(),
          description: groupForm.description.trim(),
          color: groupForm.color,
          userIds: groupForm.userIds
        });

        if (response.data.success) {
          showSuccess('Grupo criado com sucesso');
          fetchGroups();
          handleCloseGroupModal();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      showError(error.response?.data?.error || 'Erro ao salvar grupo');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/groups/${groupId}`);
      if (response.data.success) {
        showSuccess('Grupo excluído com sucesso');
        fetchGroups();
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      showError(error.response?.data?.error || 'Erro ao excluir grupo');
    }
  };

  const handleOpenAddUsersModal = (group) => {
    setSelectedGroup(group);
    setUsersToAdd([]);
    setShowAddUsersModal(true);
  };

  const handleCloseAddUsersModal = () => {
    setShowAddUsersModal(false);
    setSelectedGroup(null);
    setUsersToAdd([]);
  };

  const handleAddUsersToGroup = async () => {
    if (usersToAdd.length === 0) {
      showError('Selecione pelo menos um usuário');
      return;
    }

    try {
      const response = await api.post(`/api/groups/${selectedGroup.id}/users`, {
        userIds: usersToAdd
      });

      if (response.data.success) {
        showSuccess(`${usersToAdd.length} usuário(s) adicionado(s) ao grupo`);
        fetchGroups();
        handleCloseAddUsersModal();
      }
    } catch (error) {
      console.error('Erro ao adicionar usuários:', error);
      showError(error.response?.data?.error || 'Erro ao adicionar usuários');
    }
  };

  const handleRemoveUserFromGroup = async (groupId, userId) => {
    try {
      const response = await api.delete(`/api/groups/${groupId}/users`, {
        data: { userIds: [userId] }
      });

      if (response.data.success) {
        showSuccess('Usuário removido do grupo');
        fetchGroups();
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      showError(error.response?.data?.error || 'Erro ao remover usuário');
    }
  };

  // Função para formatar usuários para o MultiSelect
  const getUsersOptions = () => {
    return users.map(user => ({
      value: user.id,
      label: `${user.name} - ${user.email}`
    }));
  };

  // Função para obter usuários disponíveis para adicionar (não estão no grupo)
  const getAvailableUsersForGroup = (group) => {
    const groupUserIds = group.users?.map(gu => gu.userId) || [];
    return users
      .filter(user => !groupUserIds.includes(user.id))
      .map(user => ({
        value: user.id,
        label: `${user.name} - ${user.email}`
      }));
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
            Gerenciamento de Grupos
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize usuários em grupos para facilitar operações em massa
          </p>
        </div>
        <Button
          icon="heroicons-outline:plus"
          text="Novo Grupo"
          className="btn-primary"
          onClick={handleOpenCreateModal}
        />
      </div>

      {/* Lista de Grupos */}
      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h5 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Nenhum grupo cadastrado
            </h5>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Comece criando seu primeiro grupo de usuários
            </p>
            <Button
              icon="heroicons-outline:plus"
              text="Criar Primeiro Grupo"
              className="btn-primary"
              onClick={handleOpenCreateModal}
            />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {groups.map(group => (
            <Card key={group.id}>
              <div className="space-y-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      <Users
                        className="w-6 h-6"
                        style={{ color: group.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {group.name}
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {group._count?.users || 0} usuário(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(group)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Descrição */}
                {group.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {group.description}
                  </p>
                )}

                {/* Ações */}
                <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    text="Adicionar Usuários"
                    className="btn-outline-primary flex-1"
                    icon={<UserPlus className="w-4 h-4" />}
                    onClick={() => handleOpenAddUsersModal(group)}
                  />
                </div>

                {/* Lista de Usuários no Grupo */}
                {group.users && group.users.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <h6 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                      Membros
                    </h6>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {group.users.map(gu => (
                        <div
                          key={gu.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate">
                            {gu.user.name}
                          </span>
                          <button
                            onClick={() => handleRemoveUserFromGroup(group.id, gu.userId)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Remover do grupo"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar Grupo */}
      <Modal
        activeModal={showGroupModal}
        onClose={handleCloseGroupModal}
        title={editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={handleCloseGroupModal}
            />
            <Button
              text={editingGroup ? 'Atualizar' : 'Criar'}
              className="btn-primary"
              onClick={handleSaveGroup}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <Textinput
            label="Nome do Grupo"
            placeholder="Ex: VIPs, Inadimplentes, etc."
            value={groupForm.name}
            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
          />

          <Textarea
            label="Descrição (opcional)"
            placeholder="Descreva o propósito deste grupo"
            value={groupForm.description}
            onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
            rows={3}
          />

          <div>
            <label className="form-label">Cor do Grupo</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={groupForm.color}
                onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                className="h-10 w-20 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {groupForm.color}
              </span>
            </div>
          </div>

          <div>
            <label className="form-label mb-2 block">Usuários do Grupo</label>
            {loadingUsers ? (
              <div className="text-center py-4">
                <Loader className="w-6 h-6 animate-spin text-slate-500 mx-auto" />
              </div>
            ) : (
              <MultiSelect
                options={getUsersOptions()}
                value={groupForm.userIds}
                onChange={(selected) => setGroupForm({ ...groupForm, userIds: selected })}
                placeholder="Selecione os usuários..."
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Adicionar Usuários */}
      <Modal
        activeModal={showAddUsersModal}
        onClose={handleCloseAddUsersModal}
        title={`Adicionar Usuários - ${selectedGroup?.name}`}
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={handleCloseAddUsersModal}
            />
            <Button
              text="Adicionar"
              className="btn-primary"
              onClick={handleAddUsersToGroup}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Selecione os usuários que deseja adicionar a este grupo
          </p>

          {loadingUsers ? (
            <div className="text-center py-4">
              <Loader className="w-6 h-6 animate-spin text-slate-500 mx-auto" />
            </div>
          ) : (
            <MultiSelect
              options={selectedGroup ? getAvailableUsersForGroup(selectedGroup) : []}
              value={usersToAdd}
              onChange={setUsersToAdd}
              placeholder="Selecione os usuários..."
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GroupsPage;
