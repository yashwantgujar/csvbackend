
import csvQueue from '../Config/redis.js';
import JobRecord from '../Models/jobRecord.model.js';
export const uploadCSV = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Please upload a CSV file" });

        // Bull queue me job add karo
        const job = await csvQueue.add({
            filePath: req.file.path,
            originalName: req.file.originalname,
             userId: req.user.userId
        });

        
        await JobRecord.create({
            userId: req.user.userId,
            jobId: job.id,
            fileName: req.file.originalname,
            status: 'waiting'
        });

        res.status(202).json({
            success: true,
            jobId: job.id,
            message: "File uploaded successfully. Processing started in background."
        });
    } catch (error) {
        next(error);
    }
};

export const getJobStatus = async (req, res, next) => {
    try {
        const job = await csvQueue.getJob(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

          if (job.data.userId !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized access to job status" });
        }

        const state = await job.getState(); 
        const result = job.returnvalue; 

        res.status(200).json({
            jobId: job.id,
            status: state,
            progress: job._progress,
            summary: result || "Processing in progress..."
        });
    } catch (error) {
        next(error);
    }
};


export const cancelJob = async (req, res, next) => {
    try {
        const job = await csvQueue.getJob(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

         if (job.data.userId !== req.user.userId) {
            return res.status(403).json({ 
                message: "Unauthorized: You don't have permission to see this job status" 
            });
        }
        await job.remove(); 
        res.status(200).json({ success: true, message: "Job cancelled successfully" });
    } catch (error) {
        next(error);
    }
};



export const getMyJobs = async (req, res, next) => {
    try {
        const jobs = await JobRecord.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs });
    } catch (error) { next(error); }
};



export const downloadTemplate = (req, res) => {
    
    const csvContent = "name,email,phone,age,city\nJohn Doe,john@example.com,9876543210,28,New York";

    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user_template.csv');

    // Content bhejo
    res.status(200).send(csvContent);
};