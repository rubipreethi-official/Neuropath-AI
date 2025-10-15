# neuropath_model_test_with_graphs.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

# 1️⃣ Load dataset
df = pd.read_excel("Copy of neuropath_dataset.xlsx")
print("✅ Dataset loaded successfully!")
print(df.head())

# 2️⃣ Handle missing values
df = df.dropna()

# 3️⃣ Encode categorical columns
label_encoders = {}
for column in df.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    df[column] = le.fit_transform(df[column])
    label_encoders[column] = le


target_column = "Course/Degree"  
if target_column not in df.columns:
   
    print("Available columns:", df.columns)
    exit()

X = df.drop(columns=[target_column])
y = df[target_column]

# 5️⃣ Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6️⃣ Feature scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# 7️⃣ Define models
models = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(random_state=42),
    "SVM": SVC(kernel='rbf', random_state=42),
    "KNN": KNeighborsClassifier(),
    "ANN": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)
}

# 8️⃣ Store results
results = []
conf_matrices = {}

for name, model in models.items():
    print(f"\n🔹 Training {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    results.append({
        'Model': name,
        'Accuracy': acc,
        'Precision': prec,
        'Recall': rec,
        'F1 Score': f1
    })

    conf_matrices[name] = confusion_matrix(y_test, y_pred)

# 9️⃣ Convert results to DataFrame
results_df = pd.DataFrame(results)
print("\n📊 Model Performance Summary:")
print(results_df)

# 🔟 Plot performance comparison chart
plt.figure(figsize=(10,6))
sns.barplot(x='Model', y='Accuracy', data=results_df, color='skyblue', label='Accuracy')
sns.barplot(x='Model', y='Precision', data=results_df, color='lightgreen', label='Precision')
sns.barplot(x='Model', y='Recall', data=results_df, color='orange', label='Recall')
sns.barplot(x='Model', y='F1 Score', data=results_df, color='salmon', label='F1 Score')
plt.title("Model Performance Comparison")
plt.ylabel("Score")
plt.legend()
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()

# 🔹 Confusion matrices
for name, matrix in conf_matrices.items():
    plt.figure(figsize=(5,4))
    sns.heatmap(matrix, annot=True, fmt='d', cmap='Blues')
    plt.title(f"{name} - Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.show()
