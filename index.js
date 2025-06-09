// نسخه ساده‌تر بدون وابستگی به SDK (استفاده از API مستقیم)
const axios = require('axios');

module.exports = async ({ req, res, log }) => {
    try {
        const { fileName, bucketId } = req.body;
        
        if (!fileName || !bucketId) {
            return res.json({ success: false, message: "پارامترهای نامعتبر" }, 400);
        }

        // تنظیمات Appwrite
        const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
        const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
        const API_KEY = process.env.APPWRITE_API_KEY;

        // دریافت لیست فایل‌ها از API
        const response = await axios.get(
            `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files`,
            {
                headers: {
                    'X-Appwrite-Project': PROJECT_ID,
                    'X-Appwrite-Key': API_KEY
                }
            }
        );

        const files = response.data.files;
        const fileExists = files.some(file => file.name === fileName);

        return res.json({
            success: true,
            exists: fileExists,
            fileName,
            bucketId
        });

    } catch (err) {
        log(`Error: ${err.message}`);
        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};