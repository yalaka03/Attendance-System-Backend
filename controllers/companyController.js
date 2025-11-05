const Company = require('../model/company');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const ROLES_LIST = require("../config/roles_list")
const Employee = require('../model/Employee')

const addcompany = async (req, res) => {
    // compute next employee id within this company for designated person
    const regNo = req.body.reg_no;
    const maxDoc = await Employee.find({ e_company_reg: regNo }).sort({ e_id: -1 }).limit(1).lean();
    const computedDpId = (maxDoc && maxDoc.length > 0) ? (maxDoc[0].e_id + 1) : 1;
    const newCompany = new Company({
        reg_no: regNo,
        comp_name: req.body.comp_name,
        isActive: req.body.isActive,
        logo: req.body.logo,
        dp_email: req.body.dp_email,
        dp_Id: computedDpId,
        dp_firstName: req.body.dp_firstName,
        dp_lastName: req.body.dp_lastName,
        dp_phoneNum: req.body.dp_phoneNum,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        zipcode: req.body.zipcode,
        address: req.body.address,
        billing_address: req.body.billing_address,
        billing_country: req.body.billing_country,
        billing_state: req.body.billing_state,
        billing_city: req.body.billing_city,
        billing_zipcode: req.body.billing_zipcode
    });
    const user = req.body.dp_email
    const pwd = req.body.password
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 
    // check duplicate company reg_no
    const duplicateReg = await Company.findOne({ reg_no: req.body.reg_no }).exec();
    if (duplicateReg) return res.status(409).json({ message: 'Registration number already exists' });

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //create and store the new user
        const result = await User.create({
            "username": user,
            "password": hashedPwd,
            "roles": { "Editor": ROLES_LIST.Editor, "User": ROLES_LIST.User }
        });

        console.log(result);
        // Create employee record for designated person
        const dpEmployee = new Employee({
            e_id: computedDpId,
            e_fname: req.body.dp_firstName,
            e_lname: req.body.dp_lastName,
            e_company_reg: regNo,
            e_company_name: req.body.comp_name,
            e_contact: req.body.dp_phoneNum,
            e_username: req.body.dp_email,
            user_ref: result._id,
            e_building: req.body.address || "N/A",
            e_designation: "Designated Person",
            e_dob: new Date(),
            e_face: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            isActive: req.body.isActive,
            e_gender: "O"
        });
        await dpEmployee.save();
    } catch (err) {
        await User.deleteOne({ "username": user });
        return res.status(500).json({ 'message': err.message });
    }
    try {
        const company = await newCompany.save();
        console.log(company)
    }
    catch (err) {
        console.log(err)
        await Employee.deleteOne({ e_id: newCompany.dp_Id, e_company_reg: newCompany.reg_no });
        await User.deleteOne({ "username": user })
        return res.status(409).send(err);
    }
    return res.status(200).json({ 'message': "succesfully Added" });
}

const getlist = (req, res) => {
    let filter = req.body.filter;
    let active = req.body.active;
    const page = req.body.page;
    const num_records_page = req.body.num_records_page;
    if (filter == null) {
        filter = "";
    }
    if (active == null) {
        active = -1;
    }
    re = new RegExp(`^${filter}`, 'i')
    let query = { "comp_name": re }
    if (active != -1) {
        query["isActive"] = active
    }
    Company.find(query, { "comp_name": 1, "dp_firstName": 1, "dp_lastName": 1, "dp_phoneNum": 1, "isActive": 1, "reg_no": 1, "logo": 1 }).skip((page - 1) * num_records_page).limit(num_records_page)
        .then((companies) => {
            return res.json(companies)
        })
        .catch((err) => {
            return res.status(400).send(err);
        })
}

const getNumpages = async (req, res) => {
    let filter = req.body.filter;
    let active = req.body.active;
    if (filter == null) {
        filter = "";
    }
    if (active == null) {
        active = -1;
    }
    re = new RegExp(`^${filter}`, 'i')
    let query = { "comp_name": re }
    if (active != -1) {
        query["isActive"] = active
    }
    const num_records_page = req.body.num_records_page;
    const total_records = await Company.countDocuments(query)
    console.log(Math.ceil(total_records / num_records_page))
    if (num_records_page === 0) {
        return res.json({ "num_page": 1 })
    }
    else {
        return res.json({ "num_page": Math.ceil(total_records / num_records_page) })
    }
}
const updatecompany = async (req, res) => {
    const reg_no = req.body.reg_no;
    if (!reg_no) return res.status(400).json({ message: 'reg_no is required' });
    const update = { ...req.body };
    delete update.reg_no;
    // Do not allow updating designated person except name
    delete update.dp_email;
    delete update.dp_phoneNum;
    delete update.dp_Id;
    delete update.password;
    try {
        const updated = await Company.findOneAndUpdate({ reg_no }, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Company not found' });
        return res.status(200).json({ message: 'Updated successfully', data: updated });
    } catch (err) {
        return res.status(400).json({ message: 'Update failed', error: err?.message });
    }
}
const deletecompany = async (req, res) => {
    reg_no = req.body.reg_no
    try {
        const response = await Company.findOneAndDelete({ "reg_no": reg_no },{projection : {"dp_email" : 1, "dp_Id": 1}})
        console.log(response)
        // Delete all employees including designated person's employee record
        await Employee.deleteMany({"e_company_reg" : reg_no})
        await User.deleteOne({ "username": response.dp_email })
        return res.status(200).json({ "message": "delete successful" })
    }
    catch (err) {
        return res.status(400).send(err)
    }
}

const companydetails = async (req,res) =>
{
    const reg_no=req.body.reg_no
    const employeecount = await Employee.countDocuments({"e_company_reg" : reg_no })
    try{
    const response = await Company.findOne({"reg_no" : req.body.reg_no})
    console.log(response)
    return res.status(200).json({"data" : response , "employeeCount" : employeecount});
    }
    catch (err){
        return res.status(400).json({"message" : " Error in getting details"});
    }

}
module.exports = {
    addcompany,
    getNumpages,
    getlist,
    deletecompany,
    companydetails,
    updatecompany
}