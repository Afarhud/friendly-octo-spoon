const cv = require('opencv-wasm');
const { createCanvas, loadImage } = require('canvas');
const { Client, Storage } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

module.exports = async ({ req, res, log, error }) => {
    try {
        // دریافت پارامترها
        const { patternFileName, targetImageBase64, threshold } = req.body;
        
        // اعتبارسنجی پارامترها
        if (!patternFileName || !targetImageBase64 || threshold === undefined) {
            return res.json({
                success: false,
                message: "پارامترهای patternFileName, targetImageBase64 و threshold الزامی هستند"
            }, 400);
        }

        // مقداردهی اولیه OpenCV
        await cv.ready;
        log('OpenCV آماده است');

        // 1. دانلود تصویر الگو از استوریج
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);
        
        let patternBuffer;
        try {
            patternBuffer = await storage.getFileDownload(process.env.APPWRITE_BUCKET_ID, patternFileName);
            log(`تصویر الگو "${patternFileName}" با موفقیت دانلود شد`);
        } catch (e) {
            error(`خطا در دانلود تصویر الگو: ${e.message}`);
            return res.json({
                success: false,
                message: "تصویر الگو یافت نشد"
            }, 404);
        }

        // 2. تبدیل تصاویر به فرمت OpenCV
        const createMatFromImage = async (imageBuffer) => {
            const img = await loadImage(imageBuffer);
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const mat = new cv.Mat(imageData.height, imageData.width, cv.CV_8UC4);
            mat.data.set(imageData.data);
            
            return mat;
        };

        // ایجاد ماتریس برای تصاویر
        const patternMat = await createMatFromImage(patternBuffer);
        const targetBuffer = Buffer.from(targetImageBase64, 'base64');
        const targetMat = await createMatFromImage(targetBuffer);
        
        log(`ابعاد تصویر الگو: ${patternMat.cols}x${patternMat.rows}`);
        log(`ابعاد تصویر هدف: ${targetMat.cols}x${targetMat.rows}`);

        // 3. تشخیص الگو
        const result = new cv.Mat();
        cv.matchTemplate(
            targetMat,
            patternMat,
            result,
            cv.TM_CCOEFF_NORMED
        );

        // 4. یافتن بهترین تطابق
        const minMax = cv.minMaxLoc(result);
        const maxVal = minMax.maxVal;
        const maxLoc = minMax.maxLoc;
        
        log(`بهترین تطابق: ${maxVal} (آستانه: ${threshold})`);

        // 5. تمیز کردن حافظه
        patternMat.delete();
        targetMat.delete();
        result.delete();

        // 6. بررسی نتیجه
        if (maxVal >= threshold) {
            return res.json({
                success: true,
                found: true,
                location: {
                    x: maxLoc.x,
                    y: maxLoc.y
                },
                confidence: maxVal,
                message: "الگو با موفقیت تشخیص داده شد"
            });
        } else {
            return res.json({
                success: true,
                found: false,
                confidence: maxVal,
                message: "الگو یافت نشد"
            });
        }

    } catch (err) {
        error(`خطا: ${err.message}\n${err.stack}`);
        return res.json({
            success: false,
            error: err.message,
            stack: process.env.DEBUG === 'true' ? err.stack : undefined
        }, 500);
    }
};