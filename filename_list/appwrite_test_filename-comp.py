import os
import requests
from dotenv import load_dotenv
import json

# بارگذاری تنظیمات از فایل .env
load_dotenv()

# تنظیمات اتصال
ENDPOINT = os.getenv('APPWRITE_ENDPOINT')
PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID')
API_KEY = os.getenv('APPWRITE_API_KEY')
BUCKET_ID = os.getenv('APPWRITE_BUCKET_ID')

# هدرهای درخواست
headers = {
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY
}

print("\n" + "="*50)
print("تست دسترسی به استوریج Appwrite".center(50))
print("="*50)

try:
    # ساخت URL صحیح برای درخواست
    url = f"{ENDPOINT}/storage/buckets/{BUCKET_ID}/files"
    print(f"URL درخواست: {url}")
    
    # دریافت لیست فایل‌ها
    response = requests.get(url, headers=headers)
    print(response.json())
    # بررسی وضعیت پاسخ
    if response.status_code == 200:
        try:
            data = response.json()
            files = data.get('files', [])
            
            if files:
                print(f"\n✅ دسترسی موفق! تعداد فایل‌ها: {len(files)}")
                print("\nلیست فایل‌ها:")
                for i, file in enumerate(files, 1):
                    print(f"{i}. {file['name']}")
            else:
                print("\n⚠️ سطل استوریج خالی است")
        
        except json.JSONDecodeError:
            print("\n❌ خطا در پردازش پاسخ JSON")
            print(f"پاسخ خام: {response.text}")
    
    elif response.status_code == 400:
        print("\n❌ خطای درخواست بد (400)")
        print("علل احتمالی:")
        print("- شناسه سطل (Bucket ID) نامعتبر است")
        print("- کلید API فاقد مجوزهای لازم است")
        print(f"پاسخ سرور: {response.text}")
    
    elif response.status_code == 401:
        print("\n❌ خطای دسترسی (401): کلید API نامعتبر است")
    
    elif response.status_code == 404:
        print("\n❌ خطا (404): سطل استوریج یافت نشد")
        print("لطفاً شناسه سطل (Bucket ID) را بررسی کنید")
    
    else:
        print(f"\n❌ خطای ناشناخته (کد وضعیت: {response.status_code})")
        print(f"پاسخ سرور: {response.text}")

except requests.exceptions.ConnectionError:
    print("\n❌ خطای اتصال: امکان ارتباط با سرور وجود ندارد")
except Exception as e:
    print(f"\n❌ خطای غیرمنتظره: {str(e)}")

print("\n" + "="*50)