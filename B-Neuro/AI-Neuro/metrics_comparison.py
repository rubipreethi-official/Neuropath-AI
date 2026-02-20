import os
import warnings
import webbrowser
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
import base64

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
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=50),
        'KNN': KNeighborsClassifier(n_neighbors=3),
        'ANN': MLPClassifier(random_state=42, max_iter=1000, hidden_layer_sizes=(64,)),
        'Naive Bayes': GaussianNB(),
        'Bayesian Network': CategoricalNB(),
    }


def evaluate_multilabel_mapping(
    X: pd.Series,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Dict[str, Dict[str, float]]:
    """
    For many-to-many relationships like Course-to-Skill or Skill-to-Course
    where one input can map to multiple outputs.
    """
    # Group by X to get all unique y values for each x
    grouped = pd.DataFrame({'X': X, 'Y': y}).groupby('X')['Y'].apply(list).reset_index()
    
    # Remove duplicates from each list
    grouped['Y'] = grouped['Y'].apply(lambda lst: list(set(lst)))
    
    # Encode X
    le_x = LabelEncoder()
    X_enc = le_x.fit_transform(grouped['X']).reshape(-1, 1)
    
    # Use MultiLabelBinarizer for Y
    mlb = MultiLabelBinarizer()
    y_enc = mlb.fit_transform(grouped['Y'])
    
    # Check if we have enough samples
    if len(X_enc) < 10:
        print(f"  ⚠ Warning: Only {len(X_enc)} unique samples - results may be unreliable")
        return {name: {'Accuracy': 0.0, 'Precision': 0.0, 'Recall': 0.0, 'F1': 0.0} 
                for name in get_classifiers().keys()}
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_enc, y_enc, test_size=test_size, random_state=random_state
    )
    
    metrics: Dict[str, Dict[str, float]] = {}
    
    for name, clf in get_classifiers().items():
        try:
            # Wrap classifier for multi-label prediction
            if name in ['Naive Bayes', 'Bayesian Network']:
                # These need MultiOutputClassifier wrapper
                multi_clf = MultiOutputClassifier(clf)
            else:
                multi_clf = MultiOutputClassifier(clf)
            
            multi_clf.fit(X_train, y_train)
            y_pred = multi_clf.predict(X_test)
            
            # Calculate metrics with 'samples' average for multi-label
            metrics[name] = {
                'Accuracy': float(accuracy_score(y_test, y_pred)),
                'Precision': float(precision_score(y_test, y_pred, average='samples', zero_division=0)),
                'Recall': float(recall_score(y_test, y_pred, average='samples', zero_division=0)),
                'F1': float(f1_score(y_test, y_pred, average='samples', zero_division=0)),
            }
        except Exception as e:
            print(f"  ⚠ {name} failed: {e}")
            metrics[name] = {
                'Accuracy': 0.0,
                'Precision': 0.0,
                'Recall': 0.0,
                'F1': 0.0,
            }
    
    return metrics


def evaluate_single_label_mapping(
    X: pd.Series,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Dict[str, Dict[str, float]]:
    """
    For one-to-one relationships like Course-to-Institution
    """
    # Encode single categorical feature and labels
    le_x = LabelEncoder()
    le_y = LabelEncoder()
    X_enc = le_x.fit_transform(X.fillna('Unknown')).reshape(-1, 1)
    y_enc = le_y.fit_transform(y.fillna('Unknown'))

    # Check if we have enough samples
    if len(X_enc) < 10:
        print(f"  ⚠ Warning: Only {len(X_enc)} samples - results may be unreliable")
        return {name: {'Accuracy': 0.0, 'Precision': 0.0, 'Recall': 0.0, 'F1': 0.0} 
                for name in get_classifiers().keys()}

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_enc, y_enc, test_size=test_size, random_state=random_state
    )

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
            metrics[name] = {
                'Accuracy': 0.0,
                'Precision': 0.0,
                'Recall': 0.0,
                'F1': 0.0,
            }
    return metrics


def plot_metrics_bar(
    mapping_name: str,
    metrics_by_model: Dict[str, Dict[str, float]],
    out_dir: str,
) -> Tuple[str, str]:
    """Returns (image_path, description)"""
    os.makedirs(out_dir, exist_ok=True)
    models: List[str] = list(metrics_by_model.keys())
    metric_names: List[str] = ['Accuracy', 'Precision', 'Recall', 'F1']

    # Matrix shape: metrics x models
    values = np.array([[metrics_by_model[m][metric] for m in models] for metric in metric_names])

    plt.style.use('default')
    fig, ax = plt.subplots(figsize=(14, 8))
    fig.patch.set_facecolor('white')
    ax.set_facecolor('white')
    
    x = np.arange(len(models))
    width = 0.18
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']

    for i, metric in enumerate(metric_names):
        ax.bar(x + (i - 1.5) * width, values[i], width, label=metric, color=colors[i], edgecolor='black', linewidth=0.5)

    ax.set_title(f'{mapping_name.replace("_", " ")} - Model Metrics Comparison', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(models, rotation=20, ha='right', fontsize=11)
    ax.set_ylabel('Score', fontsize=12, fontweight='bold')
    ax.set_ylim(0, 1.0)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.legend(ncol=4, loc='upper center', bbox_to_anchor=(0.5, 1.15), fontsize=10, framealpha=0.9)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    best_model = max(models, key=lambda m: (metrics_by_model[m]['F1'], metrics_by_model[m]['Accuracy']))
    desc = (
        f"Best Model: {best_model} | "
        f"F1 Score: {metrics_by_model[best_model]['F1']:.3f}, "
        f"Accuracy: {metrics_by_model[best_model]['Accuracy']:.3f}, "
        f"Recall: {metrics_by_model[best_model]['Recall']:.3f}. "
        f"This chart compares Accuracy, Precision, Recall, and F1 scores across all six algorithms."
    )

    out_path = os.path.join(out_dir, f'{mapping_name}_metrics_bar.png')
    fig.tight_layout()
    fig.savefig(out_path, dpi=200, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    return out_path, desc


def image_to_base64(image_path: str) -> str:
    with open(image_path, 'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')


def create_html_report(
    all_results: Dict[str, Dict[str, Dict[str, float]]],
    descriptions: Dict[str, str],
    image_paths: Dict[str, str],
    out_dir: str,
) -> str:
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Model Metrics Comparison Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 {
            text-align: center;
            color: #764ba2;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 14px;
        }
        .mapping-section {
            margin-bottom: 50px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 5px solid #764ba2;
        }
        .mapping-title {
            font-size: 24px;
            font-weight: bold;
            color: #764ba2;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .chart-container {
            text-align: center;
            margin: 20px 0;
        }
        .chart-container img {
            max-width: 100%;
            height: auto;
            border: 2px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .description {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            font-size: 14px;
            line-height: 1.6;
            color: #495057;
            border-left: 4px solid #28a745;
        }
        .metrics-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
        }
        .metrics-table th {
            background: #764ba2;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .metrics-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .metrics-table tr:hover {
            background: #f1f3f5;
        }
        .best-model {
            background: #d4edda !important;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Model Metrics Comparison Report</h1>
        <p class="subtitle">Comprehensive analysis of Decision Tree, Random Forest, ANN, KNN, Naive Bayes, and Bayesian Network algorithms</p>
"""
    
    for mapping_name in all_results.keys():
        display_name = mapping_name.replace('_', ' ').title()
        html_content += f"""
        <div class="mapping-section">
            <div class="mapping-title">📈 {display_name}</div>
            <div class="chart-container">
                <img src="data:image/png;base64,{image_to_base64(image_paths[mapping_name])}" alt="{display_name} Chart">
            </div>
            <div class="description">
                <strong>📝 Analysis:</strong> {descriptions[mapping_name]}
            </div>
            <table class="metrics-table">
                <thead>
                    <tr>
                        <th>Algorithm</th>
                        <th>Accuracy</th>
                        <th>Precision</th>
                        <th>Recall</th>
                        <th>F1 Score</th>
                    </tr>
                </thead>
                <tbody>
"""
        metrics = all_results[mapping_name]
        best_model = max(metrics.keys(), key=lambda m: (metrics[m]['F1'], metrics[m]['Accuracy']))
        
        for model_name in sorted(metrics.keys()):
            m = metrics[model_name]
            row_class = ' class="best-model"' if model_name == best_model else ''
            html_content += f"""
                    <tr{row_class}>
                        <td>{model_name}</td>
                        <td>{m['Accuracy']:.4f}</td>
                        <td>{m['Precision']:.4f}</td>
                        <td>{m['Recall']:.4f}</td>
                        <td>{m['F1']:.4f}</td>
                    </tr>
"""
        html_content += """
                </tbody>
            </table>
        </div>
"""
    
    html_content += """
    </div>
</body>
</html>
"""
    
    html_path = os.path.join(out_dir, 'metrics_report.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    return html_path


def print_terminal_metrics(all_results: Dict[str, Dict[str, Dict[str, float]]]) -> None:
    print("\n" + "="*80)
    print("METRICS SUMMARY - Accuracy, Recall, and F1 Score for All Mappings")
    print("="*80)
    
    for mapping_name, metrics in all_results.items():
        display_name = mapping_name.replace('_', ' ').title()
        print(f"\n{'='*80}")
        print(f"📊 {display_name}")
        print('='*80)
        print(f"{'Algorithm':<20} {'Accuracy':<12} {'Recall':<12} {'F1 Score':<12}")
        print("-" * 80)
        
        sorted_models = sorted(metrics.items(), key=lambda x: x[1]['F1'], reverse=True)
        for model_name, m in sorted_models:
            print(f"{model_name:<20} {m['Accuracy']:<12.4f} {m['Recall']:<12.4f} {m['F1']:<12.4f}")
        
        best_model = max(metrics.keys(), key=lambda m: (metrics[m]['F1'], metrics[m]['Accuracy']))
        print(f"\n🏆 Best Model: {best_model}")
        print(f"   Accuracy: {metrics[best_model]['Accuracy']:.4f}")
        print(f"   Recall: {metrics[best_model]['Recall']:.4f}")
        print(f"   F1 Score: {metrics[best_model]['F1']:.4f}")
    
    print("\n" + "="*80)


def main() -> None:
    df = load_dataset()

    # Define mappings with their types
    mappings: List[Tuple[str, pd.Series, pd.Series, str]] = [
        ('Course_to_Skill', df['Course_Degree'], df['Skill'], 'multilabel'),
        ('Skill_to_Course', df['Skill'], df['Course_Degree'], 'multilabel'),
        ('Course_to_Institution', df['Course_Degree'], df['Institution'], 'single'),
        ('Institution_to_Scholarship', df['Institution'], df['Training_Programme'], 'single'),
    ]

    out_dir = os.path.join('outputs', 'metrics_comparison')
    os.makedirs(out_dir, exist_ok=True)

    all_results: Dict[str, Dict[str, Dict[str, float]]] = {}
    descriptions: Dict[str, str] = {}
    image_paths: Dict[str, str] = {}
    
    print("Evaluating models for all mappings...")
    for name, X, y, mapping_type in mappings:
        print(f"Processing {name} ({mapping_type})...")
        
        if mapping_type == 'multilabel':
            metrics = evaluate_multilabel_mapping(X, y)
        else:
            metrics = evaluate_single_label_mapping(X, y)
            
        all_results[name] = metrics
        img_path, desc = plot_metrics_bar(name, metrics, out_dir)
        descriptions[name] = desc
        image_paths[name] = img_path
        print(f"  ✓ Chart saved: {img_path}")

    print_terminal_metrics(all_results)

    print("\nGenerating HTML report...")
    html_path = create_html_report(all_results, descriptions, image_paths, out_dir)
    print(f"  ✓ HTML report saved: {html_path}")
    
    try:
        webbrowser.open(f'file://{Path(html_path).absolute()}')
        print(f"  ✓ Opened in browser")
    except Exception as e:
        print(f"  ⚠ Could not open browser: {e}")

    rows = []
    for mapping_name, by_model in all_results.items():
        for model_name, scores in by_model.items():
            rows.append({
                'Mapping': mapping_name,
                'Model': model_name,
                **scores,
            })
    results_df = pd.DataFrame(rows)
    csv_path = os.path.join(out_dir, 'metrics_results.csv')
    results_df.to_csv(csv_path, index=False)
    print(f"\n✓ CSV results saved: {csv_path}")
    print("\n" + "="*80)
    print("All outputs complete!")
    print("="*80)


if __name__ == '__main__':
    main()
