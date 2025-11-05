const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/employeesController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/addemployee')
    .post(verifyRoles(ROLES_LIST.Editor) , employeesController.addEmployee)
router.route('/list')
    .post(verifyRoles(ROLES_LIST.Editor), employeesController.getlist)
router.route('/Numpages')
    .post(verifyRoles(ROLES_LIST.Editor), employeesController.getNumpages)
router.route('/listadmin')
    .post(verifyRoles(ROLES_LIST.Admin), employeesController.getlistadmin)
router.route('/Numpagesadmin')
    .post(verifyRoles(ROLES_LIST.Admin), employeesController.getNumpagesadmin)
router.route('/deleteemployee')
    .post(verifyRoles(ROLES_LIST.Editor), employeesController.deleteemployee)
router.route('/nextEmployeeId')
    .get(verifyRoles(ROLES_LIST.Editor), employeesController.nextEmployeeId)
router.route('/update')
    .post(verifyRoles(ROLES_LIST.Editor), employeesController.updateEmployee)
router.route('/attendance/list')
    .post(verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin), employeesController.listAttendance)
router.route('/attendance/Numpages')
    .post(verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin), employeesController.countAttendancePages)
router.route('/details')
    .get(verifyRoles(ROLES_LIST.Editor), employeesController.getEmployeeDetails)
router.route('/face')
    .get(verifyRoles(ROLES_LIST.Editor), employeesController.getEmployeeFace)
router.route('/me')
    .get(verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin), employeesController.getSelfEmployee)
    

module.exports = router;