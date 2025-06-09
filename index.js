const sdk = require('node-appwrite');

module.exports = async ({ req, res }) => {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const storage = new sdk.Storage(client);

    try {
        if (req.method === 'GET') {
            // لیست فایل‌ها از storage
            const bucketId = process.env.APPWRITE_BUCKET_ID;
            const files = await storage.listFiles(bucketId);

            return res.send({
                message: "فایل‌های موجود در باکت:",
                fileNames: files.files.map(file => file.name)
            }, 200);
        }

        return res.send({
            message: "فقط درخواست GET پشتیبانی می‌شود."
        }, 405);

    } catch (error) {
        console.error('Error:', error);
        return res.send({
            error: "خطای داخلی سرور",
            details: error.message
        }, 500);
    }
};
