


import fs from 'fs';
import csv from 'csv-parser';
import csvQueue from '../Config/redis.js';
import CsvUser from '../Models/csvUser.model.js';
import { userRowSchema } from '../Utils/csvValidator.js';
import { ZodError } from 'zod';
import JobRecord from '../Models/jobRecord.model.js';

csvQueue.process(2, async (job) => {
    const { filePath, userId } = job.data;

    const jobId = job.id.toString(); 

    let totalRows = 0;
    let successCount = 0;
    let failedRows = [];
    const buffer = [];

    
    if (!fs.existsSync(filePath)) {
        throw new Error("File not found at path: " + filePath);
    }

    const stats = fs.statSync(filePath);
    const totalSize = stats.size;
    let processedSize = 0;

    try {
        
        await JobRecord.findOneAndUpdate(
            { jobId },
            { status: 'processing' }
        );

        const stream = fs.createReadStream(filePath);

        const parser = stream.pipe(csv({
            mapHeaders: ({ header }) => header.toLowerCase().trim()
        }));

        for await (const row of parser) {
            totalRows++;

            processedSize += Buffer.byteLength(JSON.stringify(row));

            try {
                
                const validatedData = userRowSchema.parse(row);

                buffer.push({
                    updateOne: {
                        filter: { email: validatedData.email },
                        update: {
                            ...validatedData,
                            jobId,
                            uploadedBy: userId
                        },
                        upsert: true
                    }
                });

                successCount++;

        
                if (buffer.length >= 100) {
                    await CsvUser.bulkWrite(buffer);
                    buffer.length = 0;
                }

            } catch (err) {
                let cleanReason = "";

                if (err instanceof ZodError) {
                    cleanReason = err.issues
                        .map(e => `${e.path.join('.')}: ${e.message}`)
                        .join(" | ");
                } else {
                    cleanReason = err.message || "Unknown error";
                }

                failedRows.push({
                    row: totalRows,
                    reason: cleanReason
                });
            }

         
            if (totalRows % 100 === 0) {
                const progress = Math.round((processedSize / totalSize) * 100);
                await job.progress(Math.min(progress, 99));

                
                await JobRecord.findOneAndUpdate(
                    { jobId },
                    { progress: Math.min(progress, 99) }
                );
            }
        }

      
        if (buffer.length > 0) {
            await CsvUser.bulkWrite(buffer);
        }

        
        await JobRecord.findOneAndUpdate(
            { jobId },
            {
                status: 'completed',
                totalRows,
                successCount,
                failedCount: failedRows.length,
                errors: failedRows.slice(0, 100),
                progress: 100
            }
        );

        return {
            totalRows,
            success: successCount,
            failed: failedRows.length,
            errors: failedRows.slice(0, 100)
        };

    } catch (error) {

        
        await JobRecord.findOneAndUpdate(
            { jobId },
            {
                status: 'failed',
                errors: [{ reason: error.message }]
            }
        );

        console.error("Worker Error:", error.message);
        throw error;

    } finally {
      
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
});