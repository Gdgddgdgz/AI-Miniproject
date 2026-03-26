import os
import time
import requests
import pandas as pd
import numpy as np

BASE_URL = "http://localhost:8000"

def run_tests():
    print("🚀 Starting End-to-End API Verification...")
    
    # 1. Create a dummy CSV dataset
    print("--> Creating dummy dataset...")
    df = pd.DataFrame({
        "feature1": np.random.rand(100),
        "feature2": np.random.randint(0, 50, 100),
        "target": np.random.choice([0, 1], 100)
    })
    df.to_csv("dummy_dataset.csv", index=False)
    
    session = requests.Session()
    
    # 2. Signup
    print("--> Testing /auth/signup...")
    username = f"testuser_{int(time.time())}"
    password = "password123"
    res = session.post(f"{BASE_URL}/auth/signup", json={"username": username, "password": password})
    assert res.status_code == 200, f"Signup failed: {res.text}"
    print(f"    Signup successful for {username}")
    
    # 3. Login
    print("--> Testing /auth/login...")
    res = session.post(f"{BASE_URL}/auth/login", data={"username": username, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    print("    Login successful, received JWT token.")
    
    # 4. Upload Dataset
    print("--> Testing /upload...")
    with open("dummy_dataset.csv", "rb") as f:
        res = session.post(f"{BASE_URL}/upload", files={"file": ("dummy_dataset.csv", f, "text/csv")})
    assert res.status_code == 200, f"Upload failed: {res.text}"
    upload_data = res.json()
    assert upload_data["shape"] == [100, 3], "Upload data shape mismatch"
    print("    Upload successful.")
    
    # 5. Analyze Dataset
    print("--> Testing /analyze...")
    res = session.get(f"{BASE_URL}/analyze")
    assert res.status_code == 200, f"Analyze failed: {res.text}"
    print("    Analyze successful.")
    
    # 6. Preprocess Dataset
    print("--> Testing /preprocess...")
    res = session.post(f"{BASE_URL}/preprocess", json={"target_column": "target"})
    assert res.status_code == 200, f"Preprocess failed: {res.text}"
    problem_type = res.json()["problem_type"]
    assert problem_type == "classification", "Problem type detection failed"
    print("    Preprocess successful.")
    
    # 7. Train Model
    print("--> Testing /train...")
    train_payload = {
        "target": "target",
        "model": "Random Forest",
        "test_size": 0.2,
        "problem_type": problem_type
    }
    res = session.post(f"{BASE_URL}/train", json=train_payload)
    if res.status_code != 200:
        print(f"    Train failed: {res.text}")
        return False
    print("    Train successful.")
    
    # 8. Compare Models
    print("--> Testing /compare...")
    res = session.post(f"{BASE_URL}/compare", json=train_payload)
    if res.status_code != 200:
        print(f"    Compare failed: {res.text}")
        return False
    print("    Compare successful.")
    
    # 9. Dashboard
    print("--> Testing /dashboard/models...")
    res = session.get(f"{BASE_URL}/dashboard/models")
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    history = res.json().get("history", [])
    assert len(history) > 0, "Dashboard history is empty despite successful training"
    print(f"    Dashboard successful, found {len(history)} models in history.")
    
    # 10. Download
    print("--> Testing /download-model...")
    res = session.get(f"{BASE_URL}/download-model")
    assert res.status_code == 200, f"Download failed: {res.text}"
    assert len(res.content) > 0, "Downloaded model file is empty"
    print("    Download successful.")
    
    print("\n✅ All APIs and functionalities are working perfectly!")
    return True

if __name__ == "__main__":
    try:
        success = run_tests()
    finally:
        if os.path.exists("dummy_dataset.csv"):
            os.remove("dummy_dataset.csv")
    if not success:
        exit(1)
