import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

class AppwriteClient:
    def __init__(self):
        self.endpoint = os.getenv('APPWRITE_ENDPOINT')
        self.project_id = os.getenv('APPWRITE_PROJECT_ID')
        self.api_key = os.getenv('APPWRITE_API_KEY')
        self.bucket_id = os.getenv('APPWRITE_BUCKET_ID')
        self.function_id = os.getenv('APPWRITE_FUNCTION_ID')
        
        self.headers = {
            "X-Appwrite-Project": self.project_id,
            "X-Appwrite-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
    def check_file_exists(self, file_name):
        url = f"{self.endpoint}/functions/{self.function_id}/executions"
        payload = {
            "fileName": file_name,
            "bucketId": self.bucket_id
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"خطا در ارتباط با سرور: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"پاسخ خطا: {e.response.text}")
            return None

if __name__ == "__main__":
    client = AppwriteClient()
    file_to_check = "ghafar.txt"
    
    print(f"در حال بررسی فایل: {file_to_check}")
    result = client.check_file_exists(file_to_check)
    
    if result:
        print("\nنتایج جستجو:")
        print(f"• فایل بررسی شده: {file_to_check}")
        print(f"• وضعیت: {'موجود ✅' if result.get('exists') else 'یافت نشد ❌'}")
        print(f"• فایل‌های موجود در bucket: {result.get('availableFiles', [])}")
        print(f"• پاسخ کامل:\n{json.dumps(result, indent=4, ensure_ascii=False)}")
    else:
        print("خطا در انجام عملیات")