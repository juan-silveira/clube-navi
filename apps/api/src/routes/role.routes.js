/**
 * Rotas de Roles e Permissões
 */

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { checkPermission } = require('../middlewares/checkPermission');

// Rotas de Roles
router.get('/roles', checkPermission('roles.read'), roleController.listRoles);
router.get('/roles/:roleId', checkPermission('roles.read'), roleController.getRoleDetails);
router.post('/roles', checkPermission('roles.create'), roleController.createRole);
router.put('/roles/:roleId', checkPermission('roles.update'), roleController.updateRole);
router.delete('/roles/:roleId', checkPermission('roles.delete'), roleController.deleteRole);

// Rotas de Permissões
router.get('/permissions', checkPermission('permissions.read'), roleController.listPermissions);

// Rotas de Atribuição de Roles
router.post('/user-roles', checkPermission('roles.update'), roleController.assignRoleToUser);
router.delete('/user-roles', checkPermission('roles.update'), roleController.removeRoleFromUser);
router.get('/users/:userId/roles', checkPermission('users.read'), roleController.getUserRoles);

module.exports = router;
