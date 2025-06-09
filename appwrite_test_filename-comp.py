import os
import requests
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
load_dotenv()

ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
API_KEY = os.getenv("APPWRITE_API_KEY")
FUNCTION_ID = os.getenv("APPWRITE_FUNCTION_ID")

# آدرس اجرای تابع
url = f"{ENDPOINT}/functions/{FUNCTION_ID}/executions"

headers = {
    "X-Appwrite-Project": PROJECT_ID,
    "X-Appwrite-Key": API_KEY,
    "Content-Type": "application/json"
}

# ارسال درخواست GET
response = requests.post(url, headers=headers)

print("وضعیت:", response.status_code)
print("پاسخ:", response.json())
