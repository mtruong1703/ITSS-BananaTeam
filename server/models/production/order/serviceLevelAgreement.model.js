const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ServiceLevelAgreementSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    goods: [{
        type: Schema.Types.ObjectId,
        ref: 'Good',
        required: true
    }],
    title: {
        type: String,
        required: true
    },
    descriptions: [{
        type: String
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    lastVersion: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true,
})

ServiceLevelAgreementSchema.plugin(mongoosePaginate);

module.exports = (db) =>{
    if (!db.models.ServiceLevelAgreement)
        return db.model('ServiceLevelAgreement',ServiceLevelAgreementSchema)
    return db.models.ServiceLevelAgreement
}