const express = require('express');
const router = express.Router();
const ticketsController = require('../../controllers/ticketsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/add')
    .post(verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor), ticketsController.createTicket)

router.route('/my')
    .get(verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor), ticketsController.listMyTickets)

router.route('/list')
    .get(verifyRoles(ROLES_LIST.Editor), ticketsController.listTickets)

router.route('/act')
    .post(verifyRoles(ROLES_LIST.Editor), ticketsController.actOnTicket)

module.exports = router;


