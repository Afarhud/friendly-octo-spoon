module.exports = async ({ req, res }) => {
    try {
        // برای درخواست‌های GET
        if (req.method === 'GET') {
            return res.send({
                message: "این یک پاسخ تستی از Appwrite است!",
                receivedData: req.query || {}
            }, 200);
        }

        // برای درخواست‌های POST
        if (req.method === 'POST') {
            return res.send({
                message: "داده‌های POST دریافت شد!",
                receivedData: req.body || {}
            }, 200);
        }

        // برای سایر متدها
        return res.send({
            message: "سلام از تابع Appwrite!",
            method: req.method,
            query: req.query || {},
            body: req.body || {}
        }, 200);

    } catch (error) {
        console.error('Error:', error);
        return res.send({
            error: "خطای داخلی سرور",
            details: error.message
        }, 500);
    }
};