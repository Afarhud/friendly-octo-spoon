const { Client, Storage } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
    try {
        const { fileName, bucketId } = req.body;
        
        if (!fileName || !bucketId) {
            return res.json({ success: false, message: "پارامترهای نامعتبر" }, 400);
        }

        // Initialize SDK
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);

        // دریافت لیست فایل‌ها
        const fileList = await storage.listFiles(bucketId);
        log(`تمام فایل‌های موجود: ${JSON.stringify(fileList.files.map(f => f.name))}`);

        // جستجوی دقیق
        const fileExists = fileList.files.some(file => 
            file.name.toLowerCase() === fileName.toLowerCase()
        );

        return res.json({
            success: true,
            exists: fileExists,
            fileName,
            bucketId,
            availableFiles: fileList.files.map(f => f.name)
        });

    } catch (err) {
        error(`خطا: ${err.message}`);
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};