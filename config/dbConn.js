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


// db.getCollectionNames().forEach(function(collName) {
//     print(`Copying ${collName}...`);
//     const source = db.getCollection(collName);
//     const docs = source.find().toArray();

//     if (docs.length > 0) {
//         const target = db.getSiblingDB("Facial_Recognition").getCollection(collName);
//         target.insertMany(docs);
//         print(`→ Inserted ${docs.length} documents into ${collName}`);
//     } else {
//         print(`→ Skipping ${collName} (no documents)`);
//     }
// });

// mongodump --db test --out ./backups/myBackup/

