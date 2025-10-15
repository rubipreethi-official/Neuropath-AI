import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# Load the dataset
df = pd.read_excel('Copy of neuropath_dataset.xlsx', sheet_name='neuropath_100_dataset')

# Clean column names
df.columns = ['S_No', 'Passion', 'Skill', 'Course_Degree', 'Institution', 'Training_Programme']

# Define the mappings
mappings = [
    ('Passion_to_Skill', df['Passion'], df['Skill']),
    ('Skill_to_Course', df['Skill'], df['Course_Degree']),
    ('Course_to_Institution', df['Course_Degree'], df['Institution']),
    ('Institution_to_Training', df['Institution'], df['Training_Programme'])
]

# Classifiers
classifiers = {
    'Decision Tree': DecisionTreeClassifier(random_state=42),
    'Random Forest': RandomForestClassifier(random_state=42),
    'SVM': SVC(random_state=42),
    'ANN': MLPClassifier(random_state=42, max_iter=1000),
    'KNN': KNeighborsClassifier(),
    'Bayesian Network': GaussianNB()
}

# Function to evaluate a mapping
def evaluate_mapping(X_col, y_col, mapping_name):
    # Encode labels
    le_x = LabelEncoder()
    le_y = LabelEncoder()
    X_encoded = le_x.fit_transform(X_col.fillna('Unknown'))
    y_encoded = le_y.fit_transform(y_col.fillna('Unknown'))
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y_encoded, test_size=0.2, random_state=42)
    
    results = {}
    for name, clf in classifiers.items():
        clf.fit(X_train.reshape(-1, 1), y_train)  # Reshape for single feature
        y_pred = clf.predict(X_test.reshape(-1, 1))
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        results[name] = {'Accuracy': acc, 'Precision': prec, 'Recall': rec, 'F1': f1}
    
    return results, le_x, le_y

# Collect results for all mappings
all_results = {}
for mapping_name, X_col, y_col in mappings:
    results, _, _ = evaluate_mapping(X_col, y_col, mapping_name)
    all_results[mapping_name] = results

# Prepare data for visualization
metrics = ['Accuracy', 'Precision', 'Recall', 'F1']
models = list(classifiers.keys())
mapping_names = list(all_results.keys())

# Create a purple theme
plt.style.use('dark_background')
colors = ['#8A2BE2', '#9932CC', '#BA55D3', '#DDA0DD', '#EE82EE', '#DDA0DD']  # Purple shades

# 1. Bar chart: Metrics per model per mapping
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.patch.set_facecolor('#4B0082')  # Indigo purple background
axes = axes.ravel()

for i, metric in enumerate(metrics):
    ax = axes[i]
    x_pos = np.arange(len(mapping_names))  # Positions for each mapping
    width = 0.8 / len(models)  # Width adjusted for number of models
    for j, model in enumerate(models):
        heights = [all_results[m][model][metric] for m in mapping_names]
        bar = ax.bar(x_pos + j * width, heights, width, label=model, color=colors[j % len(colors)])
    
    ax.set_xlabel('Mappings')
    ax.set_ylabel(metric)
    ax.set_title(f'{metric} by Model and Mapping')
    ax.set_xticks(x_pos + width * (len(models) - 1) / 2)
    ax.set_xticklabels([name.replace('_', ' ') for name in mapping_names])
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 2. Line chart: Metrics over models for each mapping
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.patch.set_facecolor('#4B0082')
axes = axes.ravel()

for i, mapping in enumerate(mapping_names):
    ax = axes[i]
    for j, metric in enumerate(metrics):
        x = range(len(models))
        y = [all_results[mapping][model][metric] for model in models]
        ax.plot(x, y, marker='o', label=metric, color=colors[j])
    ax.set_xlabel('Models')
    ax.set_ylabel('Scores')
    ax.set_title(f'{mapping.replace("_", " ")} Metrics Over Models')
    ax.set_xticks(x)
    ax.set_xticklabels(models, rotation=45, ha='right')
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. Line plot: Average metrics across mappings for each model
fig, ax = plt.subplots(figsize=(12, 8))
fig.patch.set_facecolor('#4B0082')

avg_results = {}
for model in models:
    avg_results[model] = {metric: np.mean([all_results[m][model][metric] for m in mapping_names]) for metric in metrics}

for metric in metrics:
    x = range(len(models))
    y = [avg_results[model][metric] for model in models]
    ax.plot(x, y, marker='o', label=metric, linewidth=2, color=colors[metrics.index(metric)])

ax.set_xlabel('Models')
ax.set_ylabel('Average Scores')
ax.set_title('Average Metrics Across All Mappings')
ax.set_xticks(x)
ax.set_xticklabels(models, rotation=45, ha='right')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 4. Heatmap graph (as a "graph" representation for confusion, but averaged; here using correlation-like for metrics)
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.patch.set_facecolor('#4B0082')
axes = axes.ravel()

for i, mapping in enumerate(mapping_names):
    data_matrix = np.zeros((len(models), len(metrics)))
    for j, model in enumerate(models):
        for k, metric in enumerate(metrics):
            data_matrix[j, k] = all_results[mapping][model][metric]
    
    sns.heatmap(data_matrix, annot=True, fmt='.3f', cmap='Purples', ax=axes[i],
                xticklabels=metrics, yticklabels=models, cbar_kws={'label': 'Score'})
    axes[i].set_title(f'{mapping.replace("_", " ")} Metrics Heatmap')

plt.tight_layout()
plt.show()

# Print results table
print("Evaluation Results:")
for mapping in mapping_names:
    print(f"\n{mapping}:")
    results_df = pd.DataFrame(all_results[mapping]).T
    print(results_df.round(3))