const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Company = require('../model/company');

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    console.log(foundUser)
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        // Resolve companyId (reg_no) if this user is a designated person (Editor)
        let companyId = null;
        try {
            const company = await Company.findOne({ dp_email: foundUser.username }, { reg_no: 1 }).lean();
            if (company) companyId = company.reg_no;
        } catch (e) {
            // ignore company resolution errors; companyId remains null
        }
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles,
                    "companyId": companyId
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1800s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            sameSite: isProd ? 'None' : 'Lax', 
            secure: isProd ? true : false, 
            maxAge: 24 * 60 * 60 * 1000 
        });
        res.json({ accessToken, roles });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };