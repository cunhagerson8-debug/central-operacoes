import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@centraloperacoes.local';
  const password = 'Admin@Central123!';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.internalUser.upsert({
    where: { email },
    update: {
      name: '[DEV] Super Admin',
      passwordHash,
      status: 'ACTIVE',
    },
    create: {
      name: '[DEV] Super Admin',
      email,
      passwordHash,
      status: 'ACTIVE',
    },
  });

  const roles = {
    SUPER_ADMIN: await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: { description: 'Acesso total à Central de Operações' },
      create: {
        name: 'SUPER_ADMIN',
        description: 'Acesso total à Central de Operações',
      },
    }),
    GESTOR: await prisma.role.upsert({
      where: { name: 'GESTOR' },
      update: { description: 'Gestão administrativa e operacional' },
      create: {
        name: 'GESTOR',
        description: 'Gestão administrativa e operacional',
      },
    }),
    OPERADOR: await prisma.role.upsert({
      where: { name: 'OPERADOR' },
      update: { description: 'Operação diária da Central' },
      create: {
        name: 'OPERADOR',
        description: 'Operação diária da Central',
      },
    }),
    SUPORTE: await prisma.role.upsert({
      where: { name: 'SUPORTE' },
      update: { description: 'Atendimento e suporte operacional' },
      create: {
        name: 'SUPORTE',
        description: 'Atendimento e suporte operacional',
      },
    }),
  };

  const permissionCodes = [
    'dashboard.view',
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
    'role.view',
    'role.create',
    'role.update',
    'role.delete',
    'company.view',
    'company.create',
    'company.update',
    'company.delete',
    'holder.view',
    'holder.create',
    'holder.update',
    'driver.view',
    'driver.create',
    'driver.update',
    'device.view',
    'device.create',
    'device.update',
    'device.delete',
    'sms.view',
    'sms.receive',
    'sms.update',
    'marketplace.view',
    'marketplace.create',
    'marketplace.update',
    'alert.view',
    'alert.acknowledge',
    'alert.resolve',
    'audit.view',
    'report.view',
    'system-settings.view',
    'system-settings.update',
  ];

  const legacyPermissionCodes: Record<string, string[]> = {
    'dashboard.view': ['DASHBOARD_VIEW'],
    'user.view': ['USERS_VIEW'],
    'user.create': ['USERS_CREATE'],
    'user.update': ['USERS_UPDATE'],
    'user.delete': ['USERS_DELETE'],
    'role.view': ['ROLES_VIEW'],
    'role.create': ['ROLES_CREATE'],
    'role.update': ['ROLES_UPDATE'],
    'role.delete': ['ROLES_DELETE'],
    'company.view': ['COMPANIES_VIEW'],
    'company.create': ['COMPANIES_CREATE'],
    'company.update': ['COMPANIES_UPDATE'],
    'company.delete': ['COMPANIES_DELETE'],
    'holder.view': ['HOLDERS_VIEW'],
    'holder.create': ['HOLDERS_CREATE'],
    'holder.update': ['HOLDERS_UPDATE'],
    'driver.view': [],
    'driver.create': [],
    'driver.update': [],
    'device.view': ['DEVICES_VIEW'],
    'device.create': ['DEVICES_CREATE'],
    'device.update': ['DEVICES_UPDATE'],
    'device.delete': ['DEVICES_DELETE'],
    'sms.view': [],
    'sms.receive': [],
    'sms.update': [],
    'marketplace.view': [],
    'marketplace.create': [],
    'marketplace.update': [],
    'alert.view': ['ALERTS_VIEW'],
    'alert.acknowledge': ['ALERTS_ACKNOWLEDGE'],
    'alert.resolve': ['ALERTS_RESOLVE'],
    'audit.view': ['AUDIT_VIEW'],
    'report.view': ['REPORTS_VIEW'],
    'system-settings.view': ['SYSTEM_SETTINGS_VIEW'],
    'system-settings.update': ['SYSTEM_SETTINGS_UPDATE'],
  };

  const permissions: Record<string, { id: string; code: string }> = {};

  const marketplaces = [
    { name: 'TikTok Shop', code: 'TIKTOK_SHOP' },
    { name: 'Shopee', code: 'SHOPEE' },
    { name: 'Mercado Livre', code: 'MERCADO_LIVRE' },
    { name: 'Amazon', code: 'AMAZON' },
    { name: 'Magalu', code: 'MAGALU' },
  ];

  for (const marketplace of marketplaces) {
    await prisma.marketplace.upsert({
      where: { code: marketplace.code },
      update: { name: marketplace.name, active: true },
      create: marketplace,
    });
  }

  for (const code of permissionCodes) {
    let permission = await prisma.permission.findUnique({ where: { code } });

    for (const legacyCode of legacyPermissionCodes[code] ?? []) {
      const legacyPermission = await prisma.permission.findUnique({
        where: { code: legacyCode },
      });

      if (!legacyPermission) {
        continue;
      }

      if (!permission) {
        permission = await prisma.permission.update({
          where: { id: legacyPermission.id },
          data: { code },
        });
      } else if (permission.id !== legacyPermission.id) {
        const legacyRolePermissions = await prisma.rolePermission.findMany({
          where: { permissionId: legacyPermission.id },
          select: { roleId: true },
        });

        await prisma.rolePermission.createMany({
          data: legacyRolePermissions.map(({ roleId }) => ({
            roleId,
            permissionId: permission!.id,
          })),
          skipDuplicates: true,
        });
        await prisma.permission.delete({ where: { id: legacyPermission.id } });
      }
    }

    permission ??= await prisma.permission.create({
      data: { code, description: `Permissão: ${code}` },
    });
    permissions[code] = { id: permission.id, code: permission.code };
  }

  const rolePermissionMap = [
    { role: roles.SUPER_ADMIN, permissions: permissionCodes },
    {
      role: roles.GESTOR,
      permissions: [
        'dashboard.view', 'user.view', 'user.create', 'user.update',
        'role.view', 'company.view', 'company.create', 'company.update',
        'holder.view', 'holder.create', 'holder.update',
'driver.view',
'device.view', 'device.update',
'sms.view',
'alert.view', 'alert.acknowledge', 'alert.resolve',
        'audit.view', 'report.view',
      ],
    },
    {
      role: roles.OPERADOR,
      permissions: [
        'dashboard.view', 'company.view', 'holder.view', 'device.view',
        'device.update', 'alert.view', 'alert.acknowledge', 'alert.resolve',
        'report.view',
      ],
    },
    {
      role: roles.SUPORTE,
      permissions: [
        'dashboard.view', 'user.view', 'company.view', 'holder.view',
        'device.view', 'alert.view', 'alert.acknowledge', 'report.view',
      ],
    },
  ];

  for (const item of rolePermissionMap) {
    for (const code of item.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: item.role.id,
            permissionId: permissions[code].id,
          },
        },
        update: {},
        create: { roleId: item.role.id, permissionId: permissions[code].id },
      });
    }
  }

  const allPermissions = await prisma.permission.findMany({
    select: { id: true },
  });

  await prisma.rolePermission.createMany({
    data: allPermissions.map(({ id: permissionId }) => ({
      roleId: roles.SUPER_ADMIN.id,
      permissionId,
    })),
    skipDuplicates: true,
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: roles.SUPER_ADMIN.id },
    },
    update: {},
    create: { userId: user.id, roleId: roles.SUPER_ADMIN.id },
  });

  console.log('Seed concluído: usuário, roles e permissões configurados.');
}

main()
  .catch((error) => {
    console.error('Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
