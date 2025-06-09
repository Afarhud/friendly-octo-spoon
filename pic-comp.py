import os
import base64
import requests
from dotenv import load_dotenv
import json
from PIL import Image, ImageDraw
import io

# بارگذاری تنظیمات از فایل .env
load_dotenv()

class PatternDetectionClient:
    def __init__(self):
        # تنظیمات اتصال
        self.endpoint = os.getenv('APPWRITE_ENDPOINT')
        self.project_id = os.getenv('APPWRITE_PROJECT_ID')
        self.api_key = os.getenv('APPWRITE_API_KEY')
        self.function_id = os.getenv('PATTERN_DETECTION_FUNCTION_ID')
        self.bucket_id = os.getenv('APPWRITE_BUCKET_ID')
        
        self.headers = {
            "X-Appwrite-Project": self.project_id,
            "X-Appwrite-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def detect_pattern(self, pattern_file_name, target_image_path, threshold=0.8):
        """
        تشخیص الگو در تصویر
        :param pattern_file_name: نام فایل الگو در استوریج
        :param target_image_path: مسیر تصویر هدف در سیستم محلی
        :param threshold: آستانه تطابق (0.0 تا 1.0)
        :return: نتیجه تشخیص
        """
        # تبدیل تصویر هدف به base64
        with open(target_image_path, "rb") as image_file:
            target_base64 = base64.b64encode(image_file.read()).decode('utf-8')
        
        # آماده سازی داده‌ها
        payload = {
            "patternFileName": pattern_file_name,
            "targetImageBase64": target_base64,
            "threshold": threshold
        }
        
        # ارسال درخواست
        url = f"{self.endpoint}/functions/{self.function_id}/executions"
        response = requests.post(url, json=payload, headers=self.headers)
        
        return response.json()
    
    def visualize_result(self, result, target_image_path, output_path):
        """
        نمایش نتیجه تشخیص روی تصویر
        """
        # بارگذاری تصویر
        img = Image.open(target_image_path)
        draw = ImageDraw.Draw(img)
        
        if result.get('found'):
            x = result['location']['x']
            y = result['location']['y']
            
            # کشیدن مستطیل دور ناحیه تشخیص داده شده
            draw.rectangle([x, y, x + 100, y + 100], outline="red", width=3)
            
            # اضافه کردن متن
            draw.text((x, y - 20), 
                      f"تشخیص: {result['confidence']:.2f}", 
                      fill="red")
        
        # ذخیره تصویر
        img.save(output_path)
        print(f"تصویر نتیجه در '{output_path}' ذخیره شد")

if __name__ == "__main__":
    client = PatternDetectionClient()
    
    # تنظیمات تست
    PATTERN_FILE = "pattern.png"  # نام فایل الگو در استوریج
    TARGET_IMAGE = "target_image.jpg"  # مسیر تصویر هدف
    THRESHOLD = 0.7  # آستانه تطابق
    
    print(f"در حال تشخیص الگو '{PATTERN_FILE}' در تصویر '{TARGET_IMAGE}'...")
    result = client.detect_pattern(PATTERN_FILE, TARGET_IMAGE, THRESHOLD)
    
    print("\nنتایج تشخیص:")
    print(json.dumps(result, indent=4, ensure_ascii=False))
    
    if result.get('success'):
        #1 نمایش نتیجه روی تصویر
        client.visualize_result(result, TARGET_IMAGE, "result.jpg")