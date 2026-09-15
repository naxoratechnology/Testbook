const Settings = require('./settings.model');
async function get() { return Settings.findOneAndUpdate({ key: 'platform' }, { $setOnInsert: { key: 'platform' } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean(); }
async function update(data) { return Settings.findOneAndUpdate({ key: 'platform' }, { $set: data }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean(); }
module.exports = { get, update };
