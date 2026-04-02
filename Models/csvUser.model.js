import mongoose from 'mongoose';

const csvUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    age: { type: Number },
    city: { type: String },
    jobId: { type: String } ,
        uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    } 

}, { timestamps: true });


csvUserSchema.index({ email: 1 });

const CsvUser = mongoose.model('CsvUser', csvUserSchema);
export default CsvUser;