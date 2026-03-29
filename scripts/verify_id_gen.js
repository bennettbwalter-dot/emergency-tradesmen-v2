import crypto from 'crypto';

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const checks = [
    { city: 'Enterprise', name: 'Kevin GoodYear Towing', trade: 'breakdown' },
    { city: 'Evergreen', name: 'Shannon Bryant Wrecker', trade: 'breakdown' },
    { city: 'Castleberry', name: 'Shannon Bryant Wrecker', trade: 'breakdown' },
    { city: 'Repton', name: 'Shannon Bryant Wrecker', trade: 'breakdown' }
];

checks.forEach(c => {
    const id = generateUUID(`us-${c.city}-${c.trade}-${c.name}`);
    console.log(`${c.city} | ${c.name} | ID: ${id}`);
});
