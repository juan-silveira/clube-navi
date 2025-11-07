/**
 * Seed de Roles e Permissões Padrão
 *
 * Este script cria as roles e permissões padrão do sistema.
 * Roles:
 * - Super Admin: Acesso total (prioridade 100)
 * - Admin: Acesso administrativo completo (prioridade 80)
 * - Operador: Acesso limitado a operações (prioridade 50)
 * - Cliente Adimplente: Cliente com pagamento em dia (prioridade 30)
 * - Cliente Inadimplente: Cliente com pagamento atrasado (prioridade 10)
 */

const { PrismaClient } = require('../src/generated/prisma-club');

// Módulos e suas permissões
const MODULES = {
  users: {
    name: 'Usuários',
    actions: ['create', 'read', 'update', 'delete']
  },
  products: {
    name: 'Produtos',
    actions: ['create', 'read', 'update', 'delete']
  },
  purchases: {
    name: 'Compras',
    actions: ['create', 'read', 'update', 'delete']
  },
  cashback: {
    name: 'Cashback',
    actions: ['read', 'update', 'execute']
  },
  notifications: {
    name: 'Notificações',
    actions: ['create', 'read', 'update', 'delete', 'execute']
  },
  push: {
    name: 'Push Notifications',
    actions: ['create', 'read', 'execute']
  },
  whatsapp: {
    name: 'WhatsApp',
    actions: ['create', 'read', 'execute']
  },
  groups: {
    name: 'Grupos',
    actions: ['create', 'read', 'update', 'delete']
  },
  roles: {
    name: 'Roles',
    actions: ['create', 'read', 'update', 'delete']
  },
  permissions: {
    name: 'Permissões',
    actions: ['read', 'update']
  },
  documents: {
    name: 'Documentos KYC',
    actions: ['read', 'update', 'execute']
  },
  withdrawals: {
    name: 'Saques',
    actions: ['create', 'read', 'update', 'execute']
  },
  deposits: {
    name: 'Depósitos',
    actions: ['create', 'read', 'update']
  },
  dashboard: {
    name: 'Dashboard',
    actions: ['read']
  },
  reports: {
    name: 'Relatórios',
    actions: ['read', 'execute']
  },
  settings: {
    name: 'Configurações',
    actions: ['read', 'update']
  }
};

// Definição das roles e suas permissões
const ROLES = {
  super_admin: {
    displayName: 'Super Admin',
    description: 'Acesso total ao sistema, incluindo configurações críticas',
    priority: 100,
    isSystem: true,
    permissions: [
      // Acesso total a tudo
      'users.*', 'products.*', 'purchases.*', 'cashback.*',
      'notifications.*', 'push.*', 'whatsapp.*', 'groups.*',
      'roles.*', 'permissions.*', 'documents.*', 'withdrawals.*',
      'deposits.*', 'dashboard.*', 'reports.*', 'settings.*'
    ]
  },
  admin: {
    displayName: 'Admin',
    description: 'Acesso administrativo completo, exceto configurações críticas',
    priority: 80,
    isSystem: true,
    permissions: [
      // Quase tudo, exceto modificar roles e permissões
      'users.*', 'products.*', 'purchases.*', 'cashback.*',
      'notifications.*', 'push.*', 'whatsapp.*', 'groups.*',
      'roles.read', 'permissions.read',
      'documents.*', 'withdrawals.*', 'deposits.*',
      'dashboard.*', 'reports.*', 'settings.read', 'settings.update'
    ]
  },
  operator: {
    displayName: 'Operador',
    description: 'Acesso limitado a operações do dia a dia',
    priority: 50,
    isSystem: true,
    permissions: [
      'users.read', 'users.update',
      'products.read',
      'purchases.read', 'purchases.update',
      'cashback.read',
      'notifications.create', 'notifications.read', 'notifications.execute',
      'documents.read', 'documents.update', 'documents.execute',
      'withdrawals.read', 'withdrawals.execute',
      'deposits.read',
      'dashboard.read'
    ]
  },
  client_active: {
    displayName: 'Cliente Adimplente',
    description: 'Cliente com pagamentos em dia, acesso completo aos recursos',
    priority: 30,
    isSystem: true,
    permissions: [
      'users.read', 'users.update', // Pode editar próprio perfil
      'products.create', 'products.read', 'products.update', 'products.delete',
      'purchases.read',
      'cashback.read',
      'withdrawals.create', 'withdrawals.read',
      'deposits.create', 'deposits.read',
      'dashboard.read',
      'notifications.read'
    ]
  },
  client_inactive: {
    displayName: 'Cliente Inadimplente',
    description: 'Cliente com pagamentos atrasados, acesso limitado',
    priority: 10,
    isSystem: true,
    permissions: [
      'users.read', // Somente leitura
      'products.read', // Não pode criar/editar
      'purchases.read',
      'cashback.read', // Pode ver mas não sacar
      'deposits.read',
      'dashboard.read',
      'notifications.read'
    ]
  }
};

async function seedPermissions(clubDatabaseUrl) {
  console.log('\n🌱 Seeding Roles & Permissions...');
  console.log('='.repeat(50));

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: clubDatabaseUrl
      }
    }
  });

  try {
    // 1. Criar todas as permissões
    console.log('\n📋 Criando permissões...');
    const permissions = {};

    for (const [moduleKey, moduleData] of Object.entries(MODULES)) {
      for (const action of moduleData.actions) {
        const resource = `${moduleKey}.${action}`;

        const permission = await prisma.permission.upsert({
          where: {
            module_action: {
              module: moduleKey,
              action: action
            }
          },
          update: {},
          create: {
            module: moduleKey,
            action: action,
            resource: resource,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${moduleData.name}`
          }
        });

        permissions[resource] = permission;
        console.log(`  ✓ ${resource}`);
      }
    }

    console.log(`\n✅ ${Object.keys(permissions).length} permissões criadas`);

    // 2. Criar roles e atribuir permissões
    console.log('\n👥 Criando roles...');

    for (const [roleName, roleData] of Object.entries(ROLES)) {
      // Criar ou atualizar role
      const role = await prisma.role.upsert({
        where: { name: roleName },
        update: {
          displayName: roleData.displayName,
          description: roleData.description,
          priority: roleData.priority
        },
        create: {
          name: roleName,
          displayName: roleData.displayName,
          description: roleData.description,
          isSystem: roleData.isSystem,
          priority: roleData.priority
        }
      });

      console.log(`\n  📌 ${role.displayName} (prioridade: ${role.priority})`);

      // Deletar permissões antigas da role
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id }
      });

      // Atribuir permissões
      let permissionsAdded = 0;
      for (const permPattern of roleData.permissions) {
        if (permPattern.endsWith('.*')) {
          // Permissão wildcard: adicionar todas as permissões do módulo
          const module = permPattern.replace('.*', '');
          for (const [resource, permission] of Object.entries(permissions)) {
            if (resource.startsWith(module + '.')) {
              await prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId: permission.id
                }
              });
              permissionsAdded++;
            }
          }
        } else {
          // Permissão específica
          const permission = permissions[permPattern];
          if (permission) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id
              }
            });
            permissionsAdded++;
          }
        }
      }

      console.log(`    ✓ ${permissionsAdded} permissões atribuídas`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed de Roles & Permissões concluído!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erro ao criar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const clubDatabaseUrl = process.env.CLUB_DATABASE_URL;

  if (!clubDatabaseUrl) {
    console.error('❌ CLUB_DATABASE_URL não definido');
    process.exit(1);
  }

  seedPermissions(clubDatabaseUrl)
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedPermissions };
