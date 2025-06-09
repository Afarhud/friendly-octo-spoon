const sdk = require('node-appwrite');

module.exports = async ({ req, res }) => {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const storage = new sdk.Storage(client);

    try {
        const bucketId = process.env.APPWRITE_BUCKET_ID;
        const files = await storage.listFiles(bucketId);

        return res.send({
            message: "فایل‌های موجود در باکت:",
            fileNames: files.files.map(file => file.name)
        }, 200);
    } catch (error) {
        return res.send({
            error: "خطا هنگام دریافت فایل‌ها",
            details: error.message
        }, 500);
    }
};
