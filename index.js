const { Client, Storage } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
    try {
        // دریافت نام فایل از بدنه درخواست
        const { fileName, bucketId } = req.body;
        
        if (!fileName || !bucketId) {
            return res.json({
                success: false,
                message: "پارامترهای fileName و bucketId الزامی هستند"
            }, 400);
        }

        // Initialize SDK
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1') // یا آدرس محل نصب Appwrite شما
            .setProject(process.env.APPWRITE_PROJECT_ID) // از متغیرهای محیطی
            .setKey(process.env.APPWRITE_API_KEY); // از متغیرهای محیطی

        const storage = new Storage(client);

        // جستجوی فایل در Bucket
        const fileList = await storage.listFiles(bucketId, {
            search: fileName
        });

        const fileExists = fileList.files.some(file => file.name === fileName);

        return res.json({
            success: fileExists,
            message: fileExists 
                ? "فایل یافت شد" 
                : "فایل وجود ندارد",
            fileName,
            bucketId
        });

    } catch (err) {
        error(err.message);
        return res.json({
            success: false,
            message: "خطا در پردازش درخواست",
            error: err.message
        }, 500);
    }
};