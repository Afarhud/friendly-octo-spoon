const { Client, Storage } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
    try {
        const { fileName, bucketId } = req.body;
        
        if (!fileName || !bucketId) {
            return res.json({ success: false, message: "پارامترهای نامعتبر" }, 400);
        }

        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);

        // دیباگ: لیست همه فایل‌ها
        const allFiles = await storage.listFiles(bucketId);
        log(`تمام فایل‌های موجود: ${JSON.stringify(allFiles.files.map(f => f.name))}`);

        // جستجوی دقیق
        const exactFile = allFiles.files.find(file => 
            file.name.toLowerCase() === fileName.toLowerCase()
        );

        if (exactFile) {
            log(`فایل یافت شد: ${exactFile.name} (ID: ${exactFile.$id})`);
            return res.json({
                success: true,
                exists: true,
                fileId: exactFile.$id,
                fileName: exactFile.name,
                size: exactFile.size
            });
        }

        return res.json({
            success: true,
            exists: false,
            message: "فایل با این نام یافت نشد",
            searchedFileName: fileName,
            availableFiles: allFiles.files.map(f => f.name)
        });

    } catch (err) {
        error(`خطا: ${err.message}`);
        return res.json({
            success: false,
            error: err.message,
            stack: err.stack
        }, 500);
    }
};