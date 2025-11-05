const express = require('express');
const router = express.Router();
const companyController = require("../../controllers/companyController")
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');


router.route('/addcompany')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.addcompany)
router.route('/deletecompany')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.deletecompany)
router.route('/updatecompany')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.updatecompany)
router.route('/list')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.getlist)
router.route('/Numpages')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.getNumpages)
router.route('/details')
    .post(verifyRoles(ROLES_LIST.Admin), companyController.companydetails)



module.exports = router;