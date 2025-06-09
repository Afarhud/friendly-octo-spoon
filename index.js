const { Client, Storage } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
    try {
        // دریافت پارامترها
        const { fileName, bucketId } = JSON.parse(req.body || '{}');
        
        // اعتبارسنجی پارامترها
        if (!fileName || !bucketId) {
            error('پارامترهای نامعتبر');
            return res.json({
                success: false,
                message: "پارامترهای fileName و bucketId الزامی هستند"
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
        log(`تعداد فایل‌های موجود: ${fileList.files.length}`);

        // جستجوی فایل
        const foundFile = fileList.files.find(file => 
            file.name.toLowerCase() === fileName.toLowerCase()
        );

        return res.json({
            success: true,
            exists: !!foundFile,
            fileName,
            fileId: foundFile?.$id || null,
            bucketId
        });

    } catch (err) {
        error(err.stack);
        return res.json({
            success: false,
            error: err.message,
            stack: err.stack
        }, 500);
    }
};