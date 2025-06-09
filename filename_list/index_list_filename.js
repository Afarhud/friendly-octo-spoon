const { Client, Storage } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
    try {
        // دریافت و پارس کردن بدنه درخواست
        let payload;
        try {
            payload = JSON.parse(req.body || '{}');
        } catch (e) {
            return res.json({ success: false, message: "Invalid JSON body" }, 400);
        }

        const { fileName, bucketId } = payload;
        
        // اعتبارسنجی پارامترها
        if (!fileName || !bucketId) {
            return res.json({ 
                success: false,
                message: "Both fileName and bucketId are required" 
            }, 400);
        }

        // Initialize SDK
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);

        // دریافت لیست فایل‌ها
        const fileList = await storage.listFiles(bucketId);
        log(`Files in bucket: ${JSON.stringify(fileList.files.map(f => f.name))}`);

        // جستجوی فایل (حساس به حروف بزرگ/کوچک)
        const fileExists = fileList.files.some(file => 
            file.name === fileName
        );

        return res.json({
            success: true,
            exists: fileExists,
            fileName,
            bucketId,
            availableFiles: fileList.files.map(f => f.name)
        });

    } catch (err) {
        error(err.stack);
        return res.json({
            success: false,
            error: err.message,
            stack: process.env.DEBUG === 'true' ? err.stack : undefined
        }, 500);
    }
};