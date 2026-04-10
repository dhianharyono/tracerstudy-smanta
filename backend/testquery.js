const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://smata_ts:JoXV8vS9sXtwHJy1@tracerstudy.b8xquhw.mongodb.net/?appName=TracerStudy').then(async () => {
    const query = { role: 'alumni' };
    const andConditions = [];
    const jobExistsQuery = {
        $or: [
            { 'job.institution': { $exists: true, $ne: '' } },
            { 'job.position': { $exists: true, $ne: '' } },
            { 'job.jobTitle': { $exists: true, $ne: '' } }
        ]
    };
    query['profile.isWorking'] = true;
    query['profile.isStudying'] = { $ne: true };
    andConditions.push(jobExistsQuery);
    if (andConditions.length > 0) {
        query.$and = andConditions;
    }
    const count = await mongoose.connection.db.collection('users').countDocuments(query);
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Count ONLY WORKING:', count);

    const matchBoth = { role: 'alumni', 'profile.isWorking': true, 'profile.isStudying': true, $and: [jobExistsQuery]};
    const countBoth = await mongoose.connection.db.collection('users').countDocuments(matchBoth);
    console.log('Count BOTH:', countBoth);
    
    // Test what actual data exists for working
    const rawWorking = await mongoose.connection.db.collection('users').countDocuments({role: 'alumni', 'profile.isWorking': true});
    console.log('Raw working without job query:', rawWorking);
    
    process.exit(0);
});
