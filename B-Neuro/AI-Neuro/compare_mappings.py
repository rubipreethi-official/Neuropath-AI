import os
import json
import warnings
from typing import Dict, List, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB

warnings.filterwarnings('ignore')


def load_dataset() -> pd.DataFrame:
    """Load dataset from neuro-dataset.csv"""
    df = pd.read_csv('neuro-dataset.csv')
    # Rename columns to match expected format
    df = df.rename(columns={
        'Course/Degree': 'Course_Degree',
        'Training/Programme': 'Training_Programme'
    })
    return df


def get_classifiers() -> Dict[str, object]:
    return {
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'KNN': KNeighborsClassifier(),
        'ANN': MLPClassifier(random_state=42, max_iter=1000, hidden_layer_sizes=(64,)),
        'Bayesian Network': GaussianNB(),
    }


def evaluate_mapping(
    X_series: pd.Series,
    y_series: pd.Series,
    random_state: int = 42,
) -> Tuple[Dict[str, Dict[str, float]], LabelEncoder, LabelEncoder]:
    # Encode categorical single-feature X and y
    le_x = LabelEncoder()
    le_y = LabelEncoder()
    X_encoded = le_x.fit_transform(X_series.fillna('Unknown'))
    y_encoded = le_y.fit_transform(y_series.fillna('Unknown'))

    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded.reshape(-1, 1), y_encoded, test_size=0.2, random_state=random_state
    )

    results: Dict[str, Dict[str, float]] = {}
    for name, clf in get_classifiers().items():
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        results[name] = {
            'Accuracy': float(accuracy_score(y_test, y_pred)),
            'F1': float(f1_score(y_test, y_pred, average='weighted', zero_division=0)),
        }
    return results, le_x, le_y


def plot_bars(
    mapping_name: str,
    results: Dict[str, Dict[str, float]],
    out_dir: str,
) -> str:
    os.makedirs(out_dir, exist_ok=True)
    models = list(results.keys())
    metrics = list(next(iter(results.values())).keys())  # ['Accuracy', 'F1']
    values = np.array([[results[m][metric] for m in models] for metric in metrics])

    x = np.arange(len(models))
    width = 0.35

    plt.style.use('dark_background')
    plt.figure(figsize=(12, 7))
    plt.bar(x - width / 2, values[0], width, label='Accuracy', color='#8A2BE2')
    plt.bar(x + width / 2, values[1], width, label='F1', color='#BA55D3')
    plt.xticks(x, models, rotation=20, ha='right')
    plt.ylim(0, 1.0)
    plt.title(f'{mapping_name.replace("_", " ")} - Model Comparison')
    plt.ylabel('Score')
    plt.grid(axis='y', alpha=0.25)
    plt.legend()
    out_path = os.path.join(out_dir, f'{mapping_name}_bar_chart.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()
    return out_path


def main() -> None:
    out_dir = os.path.join('outputs', 'comparison')

    df = load_dataset()

    # Define requested mappings
    mappings: List[Tuple[str, pd.Series, pd.Series]] = [
        ('Passion_to_Skill', df['Passion'], df['Skill']),
        ('Skill_to_Passion', df['Skill'], df['Passion']),
        ('Course_to_Institution', df['Course_Degree'], df['Institution']),
        ('Institution_to_Training', df['Institution'], df['Training_Programme']),
    ]

    all_results: Dict[str, Dict[str, Dict[str, float]]] = {}
    best_models: Dict[str, Dict[str, float]] = {}
    best_model_names: Dict[str, str] = {}

    for mapping_name, X_col, y_col in mappings:
        results, le_x, le_y = evaluate_mapping(X_col, y_col)
        all_results[mapping_name] = results

        # choose best model by F1, then Accuracy as tie-breaker
        best_name = max(results.keys(), key=lambda n: (results[n]['F1'], results[n]['Accuracy']))
        best_model_names[mapping_name] = best_name
        best_models[mapping_name] = results[best_name]

        chart_path = plot_bars(mapping_name, results, out_dir)
        print(f'{mapping_name}: chart saved -> {chart_path}')
        print(f'Best model: {best_name} (F1={results[best_name]["F1"]:.3f}, Acc={results[best_name]["Accuracy"]:.3f})')

    # Save summaries
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'all_results.json'), 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2)
    with open(os.path.join(out_dir, 'best_models.json'), 'w', encoding='utf-8') as f:
        json.dump({'best_model_by_mapping': best_model_names, 'scores': best_models}, f, indent=2)

    print('\nBest models by mapping:')
    for k, v in best_model_names.items():
        print(f'- {k}: {v}')


if __name__ == '__main__':
    main()
