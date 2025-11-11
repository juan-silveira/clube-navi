"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://clube-navi.localhost:8033";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalMembers: 0 });

  // Modal states
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]); // Membros selecionados durante criação
  const [searchUser, setSearchUser] = useState("");
  const [searchNewMember, setSearchNewMember] = useState(""); // Busca para novos membros
  const [deletingGroup, setDeletingGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      const response = await axios.get(`${API_URL}/api/club-admin/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Clube-Slug": clubSlug
        }
      });

      if (response.data.success) {
        const grps = response.data.data;
        setGroups(grps);
        setStats({
          total: grps.length,
          totalMembers: grps.reduce((sum, g) => sum + (g.memberCount || 0), 0)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error("Erro ao carregar grupos");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      const response = await axios.get(`${API_URL}/api/club-admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Clube-Slug": clubSlug
        }
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  // Criar novo grupo
  const handleCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", description: "", color: "#6366f1" });
    setSelectedMembers([]);
    setSearchNewMember("");
    setShowGroupModal(true);
  };

  // Editar grupo
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      color: group.color || "#6366f1"
    });
    setShowGroupModal(true);
  };

  // Salvar grupo (criar ou editar)
  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error("Nome do grupo é obrigatório");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      if (editingGroup) {
        // Editar grupo existente
        await axios.put(
          `${API_URL}/api/club-admin/groups/${editingGroup.id}`,
          groupForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Clube-Slug": clubSlug
            }
          }
        );
        toast.success("Grupo atualizado com sucesso");
      } else {
        // Criar novo grupo
        const response = await axios.post(
          `${API_URL}/api/club-admin/groups`,
          groupForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Clube-Slug": clubSlug
            }
          }
        );

        // Se há membros selecionados, adicionar ao grupo
        if (selectedMembers.length > 0 && response.data.data) {
          const groupId = response.data.data.id;

          // Adicionar cada membro ao grupo
          for (const userId of selectedMembers) {
            try {
              await axios.post(
                `${API_URL}/api/club-admin/groups/${groupId}/members`,
                { userId },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Clube-Slug": clubSlug
                  }
                }
              );
            } catch (memberError) {
              console.error('Erro ao adicionar membro:', memberError);
              // Continuar adicionando outros membros mesmo se um falhar
            }
          }
        }

        toast.success("Grupo criado com sucesso");
      }

      setShowGroupModal(false);
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast.error("Erro ao salvar grupo");
    }
  };

  // Deletar grupo
  const handleDeleteGroup = (group) => {
    setDeletingGroup(group);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      await axios.delete(
        `${API_URL}/api/club-admin/groups/${deletingGroup.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clube-Slug": clubSlug
          }
        }
      );

      toast.success("Grupo excluído com sucesso");
      setShowDeleteModal(false);
      setDeletingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      toast.error("Erro ao deletar grupo");
    }
  };

  // Gerenciar membros
  const handleManageMembers = (group) => {
    setSelectedGroup(group);
    setSearchUser("");
    setShowMembersModal(true);
  };

  // Adicionar usuário ao grupo
  const handleAddUserToGroup = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      await axios.post(
        `${API_URL}/api/club-admin/groups/${selectedGroup.id}/members`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clube-Slug": clubSlug
          }
        }
      );

      toast.success("Usuário adicionado ao grupo");
      fetchGroups();

      // Atualizar o grupo selecionado
      const updatedGroups = await axios.get(`${API_URL}/api/club-admin/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Clube-Slug": clubSlug
        }
      });

      if (updatedGroups.data.success) {
        const updated = updatedGroups.data.data.find(g => g.id === selectedGroup.id);
        setSelectedGroup(updated);
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      if (error.response?.data?.message?.includes("já está em outro grupo")) {
        toast.error("Este usuário já está em outro grupo. Remova-o primeiro.");
      } else {
        toast.error("Erro ao adicionar usuário ao grupo");
      }
    }
  };

  // Remover usuário do grupo
  const handleRemoveUserFromGroup = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      const clubSlug = window.location.hostname.split('.')[0];

      await axios.delete(
        `${API_URL}/api/club-admin/groups/${selectedGroup.id}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Clube-Slug": clubSlug
          }
        }
      );

      toast.success("Usuário removido do grupo");
      fetchGroups();

      // Atualizar o grupo selecionado
      const updatedGroups = await axios.get(`${API_URL}/api/club-admin/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Clube-Slug": clubSlug
        }
      });

      if (updatedGroups.data.success) {
        const updated = updatedGroups.data.data.find(g => g.id === selectedGroup.id);
        setSelectedGroup(updated);
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast.error("Erro ao remover usuário do grupo");
    }
  };

  // Verificar se usuário está em algum grupo
  const getUserGroup = (userId) => {
    for (const group of groups) {
      if (group.members?.some(m => m.id === userId)) {
        return group;
      }
    }
    return null;
  };

  // Toggle member selection during creation
  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Filtrar usuários disponíveis (não estão no grupo atual)
  const availableUsers = users.filter(user => {
    const inCurrentGroup = selectedGroup?.members?.some(m => m.id === user.id);
    const matchesSearch = searchUser === "" ||
      user.firstName?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUser.toLowerCase());

    return !inCurrentGroup && matchesSearch;
  });

  // Filtrar usuários para adicionar durante criação
  const availableNewMembers = users.filter(user => {
    const alreadySelected = selectedMembers.includes(user.id);
    const userGroup = getUserGroup(user.id);
    const matchesSearch = searchNewMember === "" ||
      user.firstName?.toLowerCase().includes(searchNewMember.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchNewMember.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchNewMember.toLowerCase());

    return !userGroup && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Grupos</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Organize usuários em grupos para facilitar permissionamentos e comunicações
          </p>
        </div>
        <Button
          onClick={handleCreateGroup}
          className="btn-primary flex items-center gap-2"
        >
          <Icon icon="heroicons:plus" className="w-5 h-5" />
          Novo Grupo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Grupos</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
              </div>
              <Icon icon="heroicons:user-group" className="w-10 h-10 text-primary-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Usuários em Grupos</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMembers}</h3>
              </div>
              <Icon icon="heroicons:users" className="w-10 h-10 text-success-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Usuários Sem Grupo</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {users.length - stats.totalMembers}
                </h3>
              </div>
              <Icon icon="heroicons:user-minus" className="w-10 h-10 text-warning-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Grupos */}
      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Icon icon="heroicons:user-group" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">Nenhum grupo cadastrado</p>
            <Button onClick={handleCreateGroup} className="btn-primary">
              Criar Primeiro Grupo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="p-6">
                {/* Header do Grupo */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="h-16 w-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: group.color || '#6366f1' }}
                    >
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Criado em {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          {group.memberCount || 0} {group.memberCount === 1 ? 'membro' : 'membros'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleManageMembers(group)}
                      className="btn-sm btn-outline-primary flex items-center gap-2"
                    >
                      <Icon icon="heroicons:user-plus" className="w-4 h-4" />
                      Gerenciar Membros
                    </Button>
                    <Button
                      onClick={() => handleEditGroup(group)}
                      className="btn-sm btn-outline-secondary"
                    >
                      <Icon icon="heroicons:pencil" className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteGroup(group)}
                      className="btn-sm btn-outline-danger"
                    >
                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Membros do Grupo */}
                {group.members && group.members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Membros ({group.members.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.members.slice(0, 6).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {group.members.length > 6 && (
                      <button
                        onClick={() => handleManageMembers(group)}
                        className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                      >
                        Ver todos os {group.members.length} membros
                      </button>
                    )}
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
        onClose={() => setShowGroupModal(false)}
        title={editingGroup ? "Editar Grupo" : "Novo Grupo"}
        className="max-w-4xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={() => setShowGroupModal(false)}
            />
            <Button
              text={editingGroup ? "Salvar Alterações" : "Criar Grupo"}
              className="btn-primary"
              onClick={handleSaveGroup}
            />
          </div>
        }
      >
        <div className="space-y-6">
          {/* Informações do Grupo */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Informações do Grupo</h4>
            <Textinput
              label="Nome do Grupo"
              placeholder="Ex: VIPs, Comerciantes Premium..."
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
            />
            <Textarea
              label="Descrição (opcional)"
              placeholder="Descreva o propósito deste grupo..."
              rows={3}
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
            />
            <div>
              <label className="form-label">Cor do Grupo</label>
              <div className="flex gap-3 mt-2">
                {['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'].map(color => (
                  <button
                    key={color}
                    onClick={() => setGroupForm({ ...groupForm, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      groupForm.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Seleção de Membros (apenas ao criar) */}
          {!editingGroup && (
            <>
              <hr className="dark:border-slate-700" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Adicionar Membros (opcional)
                </h4>

                {/* Membros Selecionados */}
                {selectedMembers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {selectedMembers.length} membro(s) selecionado(s)
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {users.filter(u => selectedMembers.includes(u.id)).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                                {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleMemberSelection(member.id)}
                            className="text-danger-600 hover:text-danger-700"
                          >
                            <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buscar e Adicionar Usuários */}
                <Textinput
                  placeholder="Buscar usuário por nome ou email..."
                  value={searchNewMember}
                  onChange={(e) => setSearchNewMember(e.target.value)}
                  icon="heroicons:magnifying-glass"
                />
                <div className="mt-3 grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {availableNewMembers.length > 0 ? (
                    availableNewMembers.map((user) => {
                      const isSelected = selectedMembers.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          onClick={() => toggleMemberSelection(user.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>
                          {isSelected ? (
                            <Icon icon="heroicons:check-circle" className="w-6 h-6 text-primary-600" />
                          ) : (
                            <Icon icon="heroicons:plus-circle" className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                      {searchNewMember ? "Nenhum usuário encontrado" : "Todos os usuários disponíveis já estão em grupos"}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Gerenciar Membros */}
      <Modal
        activeModal={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`Gerenciar Membros - ${selectedGroup?.name}`}
        className="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Membros Atuais */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Membros do Grupo ({selectedGroup?.members?.length || 0})
            </h4>
            {selectedGroup?.members?.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {selectedGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                          {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveUserFromGroup(member.id)}
                      className="btn-sm btn-outline-danger"
                    >
                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                Nenhum membro neste grupo ainda
              </p>
            )}
          </div>

          <hr className="dark:border-slate-700" />

          {/* Adicionar Usuários */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Adicionar Usuários
            </h4>
            <Textinput
              placeholder="Buscar usuário por nome ou email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              icon="heroicons:magnifying-glass"
            />
            <div className="mt-3 grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => {
                  const userGroup = getUserGroup(user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                          {userGroup && (
                            <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                              Já está no grupo: {userGroup.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddUserToGroup(user.id)}
                        className="btn-sm btn-primary"
                        disabled={!!userGroup}
                      >
                        <Icon icon="heroicons:plus" className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                  {searchUser ? "Nenhum usuário encontrado" : "Todos os usuários já estão neste grupo"}
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        activeModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              text="Cancelar"
              className="btn-outline-secondary"
              onClick={() => setShowDeleteModal(false)}
            />
            <Button
              text="Excluir"
              className="btn-danger"
              onClick={confirmDeleteGroup}
            />
          </div>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Tem certeza que deseja excluir o grupo <strong>{deletingGroup?.name}</strong>?
          {deletingGroup?.memberCount > 0 && (
            <span className="block mt-2 text-warning-600 dark:text-warning-400">
              Este grupo possui {deletingGroup.memberCount} membro(s). Eles serão removidos do grupo.
            </span>
          )}
        </p>
      </Modal>
    </div>
  );
};

export default GroupsPage;
