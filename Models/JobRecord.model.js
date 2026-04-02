import mongoose from 'mongoose';

const jobRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: String, required: true }, // Bull Job ID
    fileName: { type: String, required: true },
    status: { type: String, enum: ['waiting', 'active', 'completed', 'failed'], default: 'waiting' },
    totalRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    errors: { type: Array, default: [] }
}, { timestamps: true });

const JobRecord = mongoose.model('JobRecord', jobRecordSchema);
export default JobRecord;