module.exports = async (req, res) => {
    // اگر درخواست GET باشد
    if (req.method === 'GET') {
        return res.json({
            message: "این یک پاسخ تستی از Appwrite است!",
            receivedData: req.query
        });
    }

    // اگر درخواست POST باشد
    if (req.method === 'POST') {
        return res.json({
            message: "داده‌های POST دریافت شد!",
            receivedData: req.payload
        });
    }

    // برای سایر انواع درخواست
    return res.json({
        message: "سلام از تابع Appwrite!",
        method: req.method,
        query: req.query,
        payload: req.payload
    });
};