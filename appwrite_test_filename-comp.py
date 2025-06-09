import os
import requests
from dotenv import load_dotenv
import json

# Load environment variables
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
    
    def check_file(self, file_name):
        """Check if file exists in bucket"""
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
            print(f"Request failed: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"Error response: {e.response.text}")
            return None

def main():
    client = AppwriteClient()
    
    while True:
        print("\n" + "="*40)
        file_name = input("Enter file name to check (or 'q' to quit): ").strip()
        
        if file_name.lower() == 'q':
            break
            
        if not file_name:
            print("Please enter a valid file name")
            continue
            
        result = client.check_file(file_name)
        
        if result:
            print("\nResults:")
            print(f"File: {file_name}")
            print(f"Status: {'Found ✅' if result.get('exists') else 'Not Found ❌'}")
            print(f"Bucket ID: {result.get('bucketId')}")
            
            if not result.get('exists'):
                print("\nAvailable files:")
                for i, f in enumerate(result.get('availableFiles', [])[:10]):
                    print(f"{i+1}. {f}")
                if len(result.get('availableFiles', [])) > 10:
                    print(f"... and {len(result.get('availableFiles', [])) - 10} more")
        else:
            print("Operation failed")

if __name__ == "__main__":
    main()