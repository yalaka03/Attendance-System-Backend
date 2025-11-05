const Employee = require('../model/Employee');
const ROLES_LIST = require("../config/roles_list")
const Company = require('../model/company')
const User = require('../model/User');
const bcrypt = require('bcrypt');


const addEmployee = async (req, res) => {
    if (!req?.user)
    {
        return res.status(405).json({"Unauthorised" : "Only Admins of company can view"})
    }
    const tokenCompanyId = req.companyId;
    if (!tokenCompanyId) {
        return res.status(403).json({ "Message": "No company access assigned" })
    }
    const newEmployee = new Employee(
        {
            e_fname: req.body.e_fname,
            e_lname: req.body.e_lname,
            e_gender: req.body.e_gender,
            e_company_name: req.body.e_company_name,
            e_id: req.body.e_id,
            e_building: req.body.e_building,
            e_contact: req.body.e_contact,
            e_designation: req.body.e_designation,
            e_dob: req.body.e_dob,
            e_face: req.body.e_face,
            e_username: req.body.e_username,
            e_company_reg : tokenCompanyId,
            isActive: req.body.isActive
        }
    )
    try {
        // create linked user
        const username = req.body.e_username;
        const password = req.body.password;
        if (!username || !password) {
            return res.status(400).json({ Message: 'Username and password required' })
        }
        const duplicateUser = await User.findOne({ username }).exec();
        if (duplicateUser) return res.status(409).json({ Message: 'Username already exists' });
        const hashedPwd = await bcrypt.hash(password, 10);
        const createdUser = await User.create({
            username,
            password: hashedPwd,
            roles: { User: ROLES_LIST.User }
        });
        newEmployee.user_ref = createdUser._id;
        try {
            const employee = await newEmployee.save()
            console.log(employee);
            return res.status(200).json({"Message" : "Added Employee Successfully"})
        } catch (employeeErr) {
            // If employee creation fails, delete the user we just created
            await User.deleteOne({ _id: createdUser._id });
            if (employeeErr?.code === 11000) {
                return res.status(409).json({ Message: 'Employee ID already exists for this company' });
            }
            throw employeeErr;
        }
    }
    catch(err){
        console.log(err)
        if (err?.code === 11000) {
            return res.status(409).json({ Message: 'Employee ID already exists for this company' });
        }
        return res.status(400).json({ Message: err?.message || 'Failed to add employee' })
    }
}
const getlist = async (req,res) =>
{
    if (!req?.user)
    {
        return res.status(405).json({"Unauthorised" : "Only Admins of company can view"})
    }
    let filter= req.body.filter;
    let active = req.body.active;
    const page= req.body.page;
    const num_records_page = req.body.num_records_page;
    if ( filter == null)
    {
        filter= "";
    }
    if ( active == null)
    {
        active = -1;
    }
    var myarr = filter.split(" ")
    let query={}
    if (myarr.length === 1)
    {
    re = new RegExp(`^${filter}`,'i')
    query = {$or:[{"e_fname" : re },{"e_lname" : re}]}
    }
    else{
    re1 = new RegExp(`^${myarr[0]}`,'i')
    re2 = new RegExp(`^${myarr[1]}`,'i')
    query = {$or:[{"e_fname" : re1 },{"e_lname" : re1},{"e_fname" : re2 },{"e_lname" : re2}]}
    }
    if ( active != -1)
    {
        query["isActive"] = active
    }
    if (!req.companyId) {
        return res.status(403).json({"Message": "No company access assigned"})
    }
    query["e_company_reg"]= req.companyId
    console.log(query)
    Employee.find(query,{"e_id" : 1 ,"e_fname" :1 , "e_lname" :1 , "e_building" : 1, "isActive" : 1 , "e_company_name" : 1,"e_contact" :1 }).sort([["isActive",-1],["e_id",1]]).skip((page-1)*num_records_page).limit(num_records_page)
    .then((employees) => {
       return res.json(employees)
    })
    .catch((err) => {
        return res.status(400).send(err);
    })
} 
const getlistadmin = async (req,res) =>
{
    if (!req?.user)
    {
        return res.status(405).json({"Unauthorised" : "Only Admins of company can view"})
    }
    let filter= req.body.filter;
    let active = req.body.active;
    const page= req.body.page;
    const num_records_page = req.body.num_records_page;
    if ( filter == null)
    {
        filter= "";
    }
    if ( active == null)
    {
        active = -1;
    }
    var myarr = filter.split(" ")
    let query={}
    if (myarr.length === 1)
    {
    re = new RegExp(`^${filter}`,'i')
    query = {$or:[{"e_fname" : re },{"e_lname" : re}]}
    }
    else{
    re1 = new RegExp(`^${myarr[0]}`,'i')
    re2 = new RegExp(`^${myarr[1]}`,'i')
    query = {$or:[{"e_fname" : re1 },{"e_lname" : re1},{"e_fname" : re2 },{"e_lname" : re2}]}
    }
    if ( active != -1)
    {
        query["isActive"] = active
    }
    query["e_company_reg"]= req.body.reg_no
    console.log(query)
    Employee.find(query,{"e_id" : 1 ,"e_fname" :1 , "e_lname" :1 , "e_building" : 1, "isActive" : 1 , "e_company_name" : 1,"e_contact" :1 }).sort([["isActive",-1],["e_id",1]]).skip((page-1)*num_records_page).limit(num_records_page)
    .then((employees) => {
       return res.json(employees)
    })
    .catch((err) => {
        return res.status(400).send(err);
    })
} 
const getNumpages = async (req,res) =>
{
    if (!req?.user)
    {
        return res.status(405).json({"Unauthorised" : "Only Admins of company can view"})
    }
    let filter= req.body.filter;
    let active = req.body.active;
    if ( filter == null)
    {
        filter= "";
    }
    if ( active == null)
    {
        active = -1;
    }
    var myarr = filter.split(" ")
    let query={}
    if (myarr.length === 1)
    {
    re = new RegExp(`^${filter}`,'i')
    query = {$or:[{"e_fname" : re },{"e_lname" : re}]}
    }
    else{
    re1 = new RegExp(`^${myarr[0]}`,'i')
    re2 = new RegExp(`^${myarr[1]}`,'i')
    query = {$or:[{"e_fname" : re1 },{"e_lname" : re1},{"e_fname" : re2 },{"e_lname" : re2}]}
    }
    if ( active != -1)
    {
        query["isActive"] = active
    }
    if (!req.companyId) {
        return res.status(403).json({"Message": "No company access assigned"})
    }
    query["e_company_reg"]= req.companyId
    const num_records_page = req.body.num_records_page;
    const total_records = await Employee.countDocuments(query)
    console.log(Math.ceil(total_records/num_records_page))
    if( num_records_page === 0)
    {
        return res.json({"num_page" : 1})
    }
    else{
        return res.json({"num_page" : Math.ceil(total_records/num_records_page)})
    }
}
const getNumpagesadmin = async (req,res) =>
{
    if (!req?.user)
    {
        return res.status(405).json({"Unauthorised" : "Only Admins of company can view"})
    }
    let filter= req.body.filter;
    let active = req.body.active;
    if ( filter == null)
    {
        filter= "";
    }
    if ( active == null)
    {
        active = -1;
    }
    var myarr = filter.split(" ")
    let query={}
    if (myarr.length === 1)
    {
    re = new RegExp(`^${filter}`,'i')
    query = {$or:[{"e_fname" : re },{"e_lname" : re}]}
    }
    else{
    re1 = new RegExp(`^${myarr[0]}`,'i')
    re2 = new RegExp(`^${myarr[1]}`,'i')
    query = {$or:[{"e_fname" : re1 },{"e_lname" : re1},{"e_fname" : re2 },{"e_lname" : re2}]}
    }
    if ( active != -1)
    {
        query["isActive"] = active
    }
    
    query["e_company_reg"]= req.body.reg_no
    const num_records_page = req.body.num_records_page;
    const total_records = await Employee.countDocuments(query)
    console.log(Math.ceil(total_records/num_records_page))
    if( num_records_page === 0)
    {
        return res.json({"num_page" : 1})
    }
    else{
        return res.json({"num_page" : Math.ceil(total_records/num_records_page)})
    }
}

const deleteemployee = async (req, res) => {
    e_id = req.body.e_id
    try {
        const emp = await Employee.findOne({ "e_id": e_id }).lean();
        await Employee.deleteOne({ "e_id": e_id })
        if (emp?.user_ref) {
            await User.deleteOne({ _id: emp.user_ref })
        }
        return res.status(200).json({ "message": "delete successful" })
        // delete data also .........
    }
    catch (err) {
        return res.status(400).send(err)
    }
}
const updateEmployee = async (req, res) => {
    const e_id = req.body.e_id;
    if (!e_id) return res.status(400).json({ message: 'e_id is required' });
    const update = { ...req.body };
    delete update.e_id;
    // Do not allow changing login credentials via update
    delete update.e_username;
    delete update.password;
    try {
        const updated = await Employee.findOneAndUpdate({ e_id, e_company_reg: req.companyId }, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Employee not found' });
        return res.status(200).json({ message: 'Updated successfully', data: updated });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: 'Employee ID already exists for this company' });
        }
        return res.status(400).json({ message: 'Update failed' });
    }
}
const listAttendance = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { e_id, page = 1, num_records_page = 10 } = req.body;
    if (!e_id) return res.status(400).json({ message: 'e_id required' });
    try {
        const emp = await Employee.findOne({ e_id, e_company_reg: req.companyId }, { attendance: 1, e_fname: 1, e_lname: 1, _id: 0 }).lean();
        console.log("emp",emp)
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        const start = (page - 1) * num_records_page;
        const paginated = (emp.attendance || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(start, start + num_records_page);
        return res.status(200).json({ 
            attendance: paginated,
            employeeName: `${emp.e_fname || ''} ${emp.e_lname || ''}`.trim() || 'Unknown'
        });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to list attendance' });
    }
}
const countAttendancePages = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { e_id, num_records_page = 10 } = req.body;
    if (!e_id) return res.status(400).json({ message: 'e_id required' });
    try {
        const emp = await Employee.findOne({ e_id, e_company_reg: req.companyId }, { attendance: 1, _id: 0 }).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        const total = (emp.attendance || []).length;
        const pages = num_records_page === 0 ? 1 : Math.ceil(total / num_records_page);
        return res.status(200).json({ num_page: pages });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to count attendance pages' });
    }
}

const getEmployeeDetails = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { e_id } = req.query;
    if (!e_id) return res.status(400).json({ message: 'e_id required' });
    try {
        const emp = await Employee.findOne(
            { e_id: parseInt(e_id, 10), e_company_reg: req.companyId },
            { _id: 0, e_face: 0 }
        ).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        return res.status(200).json(emp);
    } catch (err) {
        return res.status(400).json({ message: 'Failed to get employee details' });
    }
}

const getEmployeeFace = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { e_id, thumbnail } = req.query;
    if (!e_id) return res.status(400).json({ message: 'e_id required' });
    try {
        const emp = await Employee.findOne(
            { e_id: parseInt(e_id, 10), e_company_reg: req.companyId },
            { _id: 0, e_face: 1 }
        ).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        const face = emp.e_face || '';
        // For now, return same image for both. Can be enhanced with actual image processing later
        // Thumbnail mode: return a marker that frontend can use to create a smaller version
        if (thumbnail === 'true' && face) {
            // Return a smaller version indication - frontend will handle actual resizing
            return res.status(200).json({ e_face: face, isThumbnail: true });
        }
        return res.status(200).json({ e_face: face, isThumbnail: false });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to get employee face' });
    }
}

const getSelfEmployee = async (req, res) => {
    if (!req?.user) return res.status(401).json({ message: 'Unauthorized' });
    const username = req.user;
    try {
        const emp = await Employee.findOne({ e_username: username }, { e_id: 1, e_fname: 1, e_lname: 1, _id: 0 }).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        return res.status(200).json({ e_id: emp.e_id, employeeName: `${emp.e_fname || ''} ${emp.e_lname || ''}`.trim() });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to resolve current employee' });
    }
}
const nextEmployeeId = async (req, res) => {
    if (!req?.companyId) {
        return res.status(403).json({ Message: 'No company access assigned' });
    }
    const companyReg = req.companyId;
    try {
        const maxDoc = await Employee.find({ e_company_reg: companyReg }).sort({ e_id: -1 }).limit(1).lean();
        const nextId = (maxDoc && maxDoc.length > 0) ? (maxDoc[0].e_id + 1) : 1;
        return res.status(200).json({ nextId });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to compute next id' });
    }
}
module.exports ={
    addEmployee,
    getNumpages,
    getlist,
    deleteemployee,
    getNumpagesadmin,
    getlistadmin,
    nextEmployeeId,
    updateEmployee,
    listAttendance,
    countAttendancePages,
    getSelfEmployee,
    getEmployeeDetails,
    getEmployeeFace
} 