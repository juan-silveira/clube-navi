"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import { groupsService } from "@/services/api";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalMembers: 0 });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getAll();

      if (response.success && response.data) {
        const grps = response.data;
        setGroups(grps);

        setStats({
          total: grps.length,
          totalMembers: grps.reduce((sum, g) => sum + g.memberCount, 0)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon icon="eos-icons:loading" className="w-12 h-12 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Grupos</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {stats.total} grupos com {stats.totalMembers} membros
          </p>
        </div>
        <button
          onClick={fetchGroups}
          className="btn btn-primary flex items-center gap-2"
        >
          <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Total de Membros</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMembers}</h3>
              </div>
              <Icon icon="heroicons:users" className="w-10 h-10 text-success-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Grupos */}
      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Icon icon="heroicons:user-group" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Nenhum grupo cadastrado</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="p-6">
                {/* Header do Grupo */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-16 w-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: group.color || '#6366f1' }}
                    >
                      {group.name.charAt(0)}
                    </div>
                    <div>
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
                          {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membros do Grupo */}
                {group.members && group.members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Membros ({group.members.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                          <span className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                            member.userType === 'consumer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : member.userType === 'merchant'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {member.userType === 'consumer' ? 'Cliente' :
                             member.userType === 'merchant' ? 'Comerciante' :
                             member.userType}
                          </span>
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
    </div>
  );
};

export default GroupsPage;
