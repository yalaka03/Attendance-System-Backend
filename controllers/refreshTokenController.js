const User = require('../model/User');
const jwt = require('jsonwebtoken');
const Company = require('../model/company');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            let companyId = null;
            try {
                const company = await Company.findOne({ dp_email: foundUser.username }, { reg_no: 1 }).lean();
                if (company) companyId = company.reg_no;
            } catch (e) {}
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles,
                        "companyId": companyId
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '400s' }
            );
            res.json({ roles , accessToken })
        }
    );
}

module.exports = { handleRefreshToken }