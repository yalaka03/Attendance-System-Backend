const mongoose = require('mongoose');
DB_NAME="test"
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://Surya:4QGoV5r3zNjmOTIY@cluster0.ja4xh7r.mongodb.net/' + DB_NAME, {
            useNewUrlParser: true
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB