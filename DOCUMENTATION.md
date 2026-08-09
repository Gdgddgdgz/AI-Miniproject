# Technical Documentation & System Deep Dive: AutoML Studio (`AIMiniProject`)

> **Comprehensive Technical Specification, Machine Learning Architecture, & Security Manual**

---

## 📖 Table of Contents
1. [Architectural Overview & Principles](#1-architectural-overview--principles)
2. [Zero Data Leakage Engineering](#2-zero-data-leakage-engineering)
3. [Machine Learning Pipeline & Model Registry](#3-machine-learning-pipeline--model-registry)
4. [Database & Persistence Architecture](#4-database--persistence-architecture)
5. [Inference Engine & Live Playground API](#5-inference-engine--live-playground-api)
6. [Model Serialization & Export Specifications](#6-model-serialization--export-specifications)
7. [Security & Hardening Audit](#7-security--hardening-audit)
8. [End-to-End Workflow Walkthrough](#8-end-to-end-workflow-walkthrough)

---

## 1. Architectural Overview & Principles

AutoML Studio follows a **decoupled client-server architecture**:

* **Backend Services**: Built on **FastAPI (ASGI)** using asynchronous request handlers, custom Pydantic v2 validation models, and SQLAlchemy 2.0 ORM database persistence.
* **Frontend Client**: Built on **React 19** with **Vite**, utilizing Axios interceptors for automatic JWT Bearer token attachment and centralized state management via React Context (`AppContext` & `AuthContext`).
* **Machine Learning Engine**: Designed around modular Scikit-Learn `Pipeline` and `ColumnTransformer` constructs, combined with **XGBoost** and **LightGBM** gradient boosted decision trees.

---

## 2. Zero Data Leakage Engineering

In machine learning, **Data Leakage** occurs when information from outside the training dataset (such as test set statistics) is inadvertently used to fit preprocessors or train models.

### Problem in Naive Implementations:
In basic implementations, functions like `StandardScaler.fit_transform(X)` or `SimpleImputer.fit_transform(X)` are called on the **entire dataset** prior to splitting into train and test sets. This leaks the mean, standard deviation, and categorical values of test samples into training, causing artificially inflated metrics.

### AutoML Studio Solution:
1. Raw features ($X$) and target ($y$) are separated without modifying feature values.
2. Dataset is split into $X_{\text{train}}, X_{\text{test}}, y_{\text{train}}, y_{\text{test}}$ using `split_data()`.
3. An **unfitted** `ColumnTransformer` is created for numerical (imputation + scaling) and categorical (imputation + one-hot encoding) columns.
4. A full `sklearn.pipeline.Pipeline` is assembled:
   $$\text{Pipeline} = \text{ColumnTransformer} \longrightarrow \text{Estimator}$$
5. The pipeline is fitted **strictly on $X_{\text{train}}$** during `pipeline.fit(X_train, y_train)`.
6. Evaluation metrics are computed strictly on predictions from $X_{\text{test}}$.

---

## 3. Machine Learning Pipeline & Model Registry

AutoML Studio supports both **classification** and **regression** task auto-detection.

### Classification Task Registry:
* **Logistic Regression**: Linear boundary classifier (`C`, `max_iter` tuning).
* **Decision Tree Classifier**: Non-linear tree partitioning (`max_depth`, `min_samples_split`).
* **Random Forest Classifier**: Ensemble of randomized decision trees (`n_estimators`, `max_depth`).
* **KNN Classifier**: Instance-based k-nearest neighbors (`n_neighbors`).
* **XGBoost Classifier** (`XGBClassifier`): Gradient boosted decision trees optimized for speed and accuracy.
* **LightGBM Classifier** (`LGBMClassifier`): Leaf-wise tree growth gradient boosting.

### Regression Task Registry:
* **Linear Regression**: Ordinary least squares linear regression.
* **Decision Tree Regressor**: Non-linear regression tree.
* **Random Forest Regressor**: Ensemble regression trees.
* **KNN Regressor**: Instance-based regression.
* **XGBoost Regressor** (`XGBRegressor`): Gradient boosted regression trees.
* **LightGBM Regressor** (`LGBMRegressor`): Leaf-wise tree growth regression.

---

## 4. Database & Persistence Architecture

Data persistence is managed by **SQLAlchemy 2.0** connecting to an **SQLite** database (`backend/data/automl_studio.db`).

### Database Schema (ERD):

```
+-----------------------------------+       +-----------------------------------+
|               users               |       |           model_history           |
+-----------------------------------+       +-----------------------------------+
| id (PK)         : String (UUID)   |       | id (PK)         : String (UUID)   |
| username        : String (Unique) |       | username        : String (FK)     |
| hashed_password : String          |       | model_name      : String          |
| created_at      : DateTime        |       | target_column   : String          |
+-----------------------------------+       | problem_type    : String          |
                                            | primary_score   : Float           |
                                            | metrics         : JSON            |
                                            | parameters      : JSON            |
                                            | timestamp       : DateTime        |
                                            +-----------------------------------+
```

---

## 5. Inference Engine & Live Playground API

The backend exposes a dedicated live prediction endpoint (`POST /predict`):

```json
// POST /predict Request Payload
{
  "features": {
    "age": 32,
    "income": 75000,
    "education": "Bachelors"
  }
}
```

### Processing Logic:
1. Retrieves the active trained `Pipeline` object from the user's isolated session.
2. Transforms raw input JSON into a single-row Pandas DataFrame.
3. Passes the raw DataFrame directly to `pipeline.predict(input_df)`. The embedded `ColumnTransformer` automatically imputes, encodes, and scales input feature values.
4. If a target `LabelEncoder` exists, automatically decodes numeric outputs back to human-readable strings.
5. Computes class probabilities (`predict_proba`) if supported by the underlying estimator.

---

## 6. Model Serialization & Export Specifications

Rather than exporting raw estimator objects via dangerous `pickle` files, AutoML Studio packages full pipelines using **Joblib**:

```python
export_package = {
    "pipeline": fitted_pipeline,       # Complete Pipeline (ColumnTransformer + Model)
    "model_name": model_name,         # Display name of the algorithm
    "target_column": target_col,      # Target feature name
    "problem_type": problem_type,     # Classification / Regression
    "raw_feature_columns": raw_cols,   # Input feature schema list
    "label_encoder": label_encoder,   # Target LabelEncoder for classification
}
joblib.dump(export_package, buffer)
```

### Downstream Consumption Example:
```python
import joblib
import pandas as pd

# Load exported pipeline package
package = joblib.load("random_forest_pipeline.joblib")
pipeline = package["pipeline"]

# Run inference on new unseen data
df_new = pd.DataFrame([{"age": 28, "salary": 62000}])
prediction = pipeline.predict(df_new)
print("Prediction:", prediction)
```

---

## 7. Security & Hardening Audit

1. **File Upload Size Ceiling**: Enforces a 50MB maximum size limit per upload to prevent memory exhaustion DoS attacks.
2. **Multi-Encoding Parser**: Tries `utf-8` and falls back to `latin1` to handle messy real-world CSV files without crashing.
3. **Argon2id / Bcrypt Password Hashing**: Passwords hashed securely using `passlib` with salt prior to DB persistence.
4. **JWT Expiration & Verification**: Access tokens signed using `HS256` with configurable expiration.

---

## 8. End-to-End Workflow Walkthrough

1. **User Auth**: Sign up/login to obtain JWT token.
2. **Upload**: Post CSV dataset to `/upload`.
3. **Analyze**: View statistical summaries (null counts, dtypes, missing values) at `/analyze`.
4. **Configure & Train**: Submit configuration to `/train` or `/compare`.
5. **Evaluate**: Inspect accuracy, F1, precision, recall, confusion matrix, or R² / RMSE on the UI.
6. **Playground Inference**: Test live custom inputs on the Interactive Live Inference Playground.
7. **Export**: Download full `.joblib` model package for production deployment.
