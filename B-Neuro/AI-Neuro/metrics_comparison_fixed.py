"""
metrics_comparison_fixed.py - copy placed inside B-Neuro/AI-Neuro for easier execution

This is an exact copy of the fixed evaluator saved at repository root. Run it from
`B-Neuro/AI-Neuro` with your virtual environment's Python to avoid the "file not found" error.
"""

# Copy of the working script

import os
import warnings
import webbrowser
import base64
import argparse
from typing import Dict, List, Tuple
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB, CategoricalNB
from sklearn.multioutput import MultiOutputClassifier

warnings.filterwarnings('ignore')


def get_classifiers() -> Dict[str, object]:
    return {
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=50),
        'KNN': KNeighborsClassifier(n_neighbors=3),
        'ANN': MLPClassifier(random_state=42, max_iter=1000, hidden_layer_sizes=(64,)),
        'Naive Bayes': GaussianNB(),
        'Bayesian Network': CategoricalNB(),
    }


def load_dataset(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    if 'Course/Degree' in df.columns:
        df = df.rename(columns={'Course/Degree': 'Course_Degree'})
    if 'Training/Programme' in df.columns:
        df = df.rename(columns={'Training/Programme': 'Training_Programme'})
    return df


def evaluate_single_label_mapping(X: pd.Series, y: pd.Series) -> Dict[str, Dict[str, float]]:
    le_x = LabelEncoder()
    le_y = LabelEncoder()
    X_enc = le_x.fit_transform(X.fillna('Unknown')).reshape(-1, 1)
    y_enc = le_y.fit_transform(y.fillna('Unknown'))

    if len(X_enc) < 5:
        print(f"  ⚠ Warning: Only {len(X_enc)} samples - results may be unreliable")

    X_train, X_test, y_train, y_test = train_test_split(X_enc, y_enc, test_size=0.2, random_state=42)

    metrics: Dict[str, Dict[str, float]] = {}
    for name, clf in get_classifiers().items():
        try:
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            metrics[name] = {
                'Accuracy': float(accuracy_score(y_test, y_pred)),
                'Precision': float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
                'Recall': float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
                'F1': float(f1_score(y_test, y_pred, average='weighted', zero_division=0)),
            }
        except Exception as e:
            print(f"  ⚠ {name} failed: {e}")
            metrics[name] = {'Accuracy': 0.0, 'Precision': 0.0, 'Recall': 0.0, 'F1': 0.0}
    return metrics


def evaluate_multilabel_mapping(X: pd.Series, y: pd.Series) -> Dict[str, Dict[str, float]]:
    grouped = pd.DataFrame({'X': X, 'Y': y}).groupby('X')['Y'].apply(list).reset_index()
    grouped['Y'] = grouped['Y'].apply(lambda lst: list(set(lst)))

    le_x = LabelEncoder()
    X_enc = le_x.fit_transform(grouped['X']).reshape(-1, 1)

    mlb = MultiLabelBinarizer()
    y_enc = mlb.fit_transform(grouped['Y'])

    if len(X_enc) < 5:
        print(f"  ⚠ Warning: Only {len(X_enc)} unique samples - results may be unreliable")

    X_train, X_test, y_train, y_test = train_test_split(X_enc, y_enc, test_size=0.2, random_state=42)

    metrics: Dict[str, Dict[str, float]] = {}
    for name, clf in get_classifiers().items():
        try:
            multi_clf = MultiOutputClassifier(clf)
            multi_clf.fit(X_train, y_train)
            y_pred = multi_clf.predict(X_test)
            metrics[name] = {
                'Accuracy': float(accuracy_score(y_test, y_pred)),
                'Precision': float(precision_score(y_test, y_pred, average='samples', zero_division=0)),
                'Recall': float(recall_score(y_test, y_pred, average='samples', zero_division=0)),
                'F1': float(f1_score(y_test, y_pred, average='samples', zero_division=0)),
            }
        except Exception as e:
            print(f"  ⚠ {name} failed: {e}")
            metrics[name] = {'Accuracy': 0.0, 'Precision': 0.0, 'Recall': 0.0, 'F1': 0.0}
    return metrics


def plot_metrics_bar(mapping_name: str, metrics_by_model: Dict[str, Dict[str, float]], out_dir: str) -> str:
    os.makedirs(out_dir, exist_ok=True)
    models: List[str] = list(metrics_by_model.keys())
    metric_names: List[str] = ['Accuracy', 'Precision', 'Recall', 'F1']
    values = np.array([[metrics_by_model[m][metric] for m in models] for metric in metric_names])

    plt.style.use('seaborn-muted')
    fig, ax = plt.subplots(figsize=(12, 7))
    fig.patch.set_facecolor('white')

    x = np.arange(len(models))
    width = 0.18
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']

    for i, metric in enumerate(metric_names):
        ax.bar(x + (i - 1.5) * width, values[i], width, label=metric, color=colors[i], edgecolor='black', linewidth=0.4)

    ax.set_title(f'{mapping_name.replace("_", " ")} - Model Metrics Comparison', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(models, rotation=25, ha='right')
    ax.set_ylabel('Score')
    ax.set_ylim(0, 1.0)
    ax.grid(axis='y', alpha=0.25)
    ax.legend()

    out_path = os.path.join(out_dir, f'{mapping_name}_metrics.png')
    fig.tight_layout()
    fig.savefig(out_path, dpi=200)
    plt.close(fig)
    return out_path


def image_to_base64(image_path: str) -> str:
    with open(image_path, 'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')


def create_html_report(all_results: Dict[str, Dict[str, Dict[str, float]]], image_paths: Dict[str, str], out_dir: str) -> str:
    html = ["""
<!doctype html>
<html>
<head>
  <meta charset='utf-8'/>
  <title>Metrics Comparison Report</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;margin:20px;} .mapping{margin-bottom:40px;} table{border-collapse:collapse;width:100%;} th,td{padding:8px;border:1px solid #ddd;text-align:left;} th{background:#333;color:#fff;}</style>
</head>
<body>
  <h1>Model Metrics Comparison Report</h1>
"""]

    for mapping, metrics in all_results.items():
        img_tag = ''
        if mapping in image_paths:
            img_base64 = image_to_base64(image_paths[mapping])
            img_tag = f"<img src='data:image/png;base64,{img_base64}' style='max-width:900px;width:100%;height:auto;border:1px solid #ccc;margin-bottom:12px;'/>"

        html.append(f"<div class='mapping'><h2>{mapping.replace('_',' ')}</h2>{img_tag}")
        html.append("<table><thead><tr><th>Algorithm</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead><tbody>")
        for alg, scores in sorted(metrics.items(), key=lambda kv: kv[0]):
            html.append(f"<tr><td>{alg}</td><td>{scores['Accuracy']:.4f}</td><td>{scores['Precision']:.4f}</td><td>{scores['Recall']:.4f}</td><td>{scores['F1']:.4f}</td></tr>")
        html.append("</tbody></table></div>")

    html.append("</body></html>")

    out_path = os.path.join(out_dir, 'metrics_report.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(html))
    return out_path


def print_terminal_rankings(all_results: Dict[str, Dict[str, Dict[str, float]]]) -> None:
    sep = '-' * 80
    for mapping, metrics in all_results.items():
        print(f"\n{sep}\nMapping: {mapping.replace('_',' ')}\n{sep}")

        ranked_overall = sorted(metrics.items(), key=lambda kv: (kv[1]['F1'], kv[1]['Accuracy']), reverse=True)
        print('\nOverall ranking (by F1, then Accuracy):')
        for i, (alg, s) in enumerate(ranked_overall, 1):
            print(f"  {i}. {alg:20s}  F1: {s['F1']:.4f}  Acc: {s['Accuracy']:.4f}  Prec: {s['Precision']:.4f}  Rec: {s['Recall']:.4f}")

        for metric in ['Accuracy', 'Precision', 'Recall', 'F1']:
            ranked = sorted(metrics.items(), key=lambda kv: kv[1][metric], reverse=True)
            print(f"\nTop algorithms by {metric}:")
            for i, (alg, s) in enumerate(ranked, 1):
                print(f"  {i}. {alg:20s}  {metric}: {s[metric]:.4f}")


def save_results_csv(all_results: Dict[str, Dict[str, Dict[str, float]]], out_dir: str) -> str:
    rows = []
    for mapping, metrics in all_results.items():
        for alg, s in metrics.items():
            rows.append({'Mapping': mapping, 'Algorithm': alg, **s})
    df = pd.DataFrame(rows)
    csv_path = os.path.join(out_dir, 'metrics_results.csv')
    df.to_csv(csv_path, index=False)
    return csv_path


def main():
    parser = argparse.ArgumentParser(description='Evaluate and compare models on the neuro dataset')
    parser.add_argument('--data', '-d', default='neuro-dataset.csv', help='Path to neuro-dataset.csv (default: ./neuro-dataset.csv in current dir)')
    parser.add_argument('--out', '-o', default=os.path.join('..', '..', 'outputs', 'metrics_comparison'), help='Output directory')
    parser.add_argument('--open', action='store_true', help='Open the HTML report in a browser when finished')
    args = parser.parse_args()

    data_path = args.data
    out_dir = args.out

    # If data_path is relative and not found, try looking in the current directory
    if not os.path.exists(data_path):
        alt_path = os.path.join(os.getcwd(), data_path)
        if os.path.exists(alt_path):
            data_path = alt_path
        else:
            raise FileNotFoundError(f"Dataset not found at {data_path} or {alt_path}")

    df = load_dataset(data_path)

    mappings: List[Tuple[str, pd.Series, pd.Series, str]] = [
        ('Course_to_Skill', df['Course_Degree'], df['Skill'], 'multilabel'),
        ('Skill_to_Course', df['Skill'], df['Course_Degree'], 'multilabel'),
        ('Course_to_Institution', df['Course_Degree'], df['Institution'], 'single'),
        ('Institution_to_Training', df['Institution'], df['Training_Programme'], 'single'),
    ]

    os.makedirs(out_dir, exist_ok=True)

    all_results: Dict[str, Dict[str, Dict[str, float]]] = {}
    image_paths: Dict[str, str] = {}

    print('Starting evaluation for mappings...')
    for name, X, y, mapping_type in mappings:
        print(f"\nProcessing {name} ({mapping_type})...")
        try:
            if mapping_type == 'multilabel':
                metrics = evaluate_multilabel_mapping(X, y)
            else:
                metrics = evaluate_single_label_mapping(X, y)
        except Exception as e:
            print(f"  ⚠ Failed to evaluate {name}: {e}")
            metrics = {k: {'Accuracy': 0.0, 'Precision': 0.0, 'Recall': 0.0, 'F1': 0.0} for k in get_classifiers().keys()}

        all_results[name] = metrics

        try:
            img_path = plot_metrics_bar(name, metrics, out_dir)
            image_paths[name] = img_path
            print(f"  ✓ Chart saved: {img_path}")
        except Exception as e:
            print(f"  ⚠ Failed to plot for {name}: {e}")

        ranked = sorted(metrics.items(), key=lambda kv: (kv[1]['F1'], kv[1]['Accuracy']), reverse=True)
        print('  Quick ranking (by F1):')
        for i, (alg, s) in enumerate(ranked, 1):
            print(f"    {i}. {alg:20s}  F1={s['F1']:.4f}  Acc={s['Accuracy']:.4f}")

    csv_path = save_results_csv(all_results, out_dir)
    print(f"\nCSV saved to: {csv_path}")

    print_terminal_rankings(all_results)

    try:
        html_path = create_html_report(all_results, image_paths, out_dir)
        print(f"HTML report saved to: {html_path}")
        if args.open:
            webbrowser.open(f'file://{Path(html_path).absolute()}')
    except Exception as e:
        print(f"⚠ Failed to create HTML report: {e}")

    print('\nAll done.')


if __name__ == '__main__':
    main()
