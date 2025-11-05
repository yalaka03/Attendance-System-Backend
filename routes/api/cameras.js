const express = require('express');
const router = express.Router();
const cameraController = require('../../controllers/cameraController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/add')
    .post(verifyRoles(ROLES_LIST.Editor), cameraController.addCamera);

router.route('/list')
    .get(verifyRoles(ROLES_LIST.Editor), cameraController.getCameras);

router.route('/delete')
    .post(verifyRoles(ROLES_LIST.Editor), cameraController.deleteCamera);

module.exports = router;
