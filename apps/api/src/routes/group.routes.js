/**
 * Rotas de Grupos
 */

const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { checkPermission } = require('../middlewares/checkPermission');

// Rotas de Grupos
router.get('/', checkPermission('groups.read'), groupController.listGroups);
router.get('/:groupId', checkPermission('groups.read'), groupController.getGroupDetails);
router.post('/', checkPermission('groups.create'), groupController.createGroup);
router.put('/:groupId', checkPermission('groups.update'), groupController.updateGroup);
router.delete('/:groupId', checkPermission('groups.delete'), groupController.deleteGroup);

// Rotas de Usuários em Grupos
router.post('/:groupId/users', checkPermission('groups.update'), groupController.addUsersToGroup);
router.delete('/:groupId/users', checkPermission('groups.update'), groupController.removeUsersFromGroup);
router.get('/users/:userId', checkPermission('groups.read'), groupController.getUserGroups);

module.exports = router;
