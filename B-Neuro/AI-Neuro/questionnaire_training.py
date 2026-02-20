import json
import os
import warnings
from typing import Dict, Optional

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings('ignore')

CLASSIFIERS = {
    'Decision Tree': DecisionTreeClassifier(random_state=42),
    'Random Forest': RandomForestClassifier(random_state=42),
    'KNN': KNeighborsClassifier(),
    'ANN': MLPClassifier(random_state=42, max_iter=1000, hidden_layer_sizes=(64,)),
    'Bayesian Network': GaussianNB(),
}


def load_dataset() -> pd.DataFrame:
    """Load dataset from neuro-dataset.csv"""
    df = pd.read_csv('neuro-dataset.csv')
    # Rename columns to match expected format
    df = df.rename(columns={
        'Course/Degree': 'Course_Degree',
        'Training/Programme': 'Training_Programme'
    })
    return df[['Passion', 'Skill', 'Course_Degree', 'Institution', 'Training_Programme']]


def pick_best_models_from_comparison(comparison_json_path: str) -> Dict[str, str]:
    with open(comparison_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['best_model_by_mapping']


def fit_and_serialize(
    df: pd.DataFrame,
    best_model_by_mapping: Dict[str, str],
    out_dir: str,
) -> None:
    os.makedirs(out_dir, exist_ok=True)

    mappings = {
        'Passion_to_Skill': ('Passion', 'Skill'),
        'Skill_to_Passion': ('Skill', 'Passion'),
        'Course_to_Institution': ('Course_Degree', 'Institution'),
        'Institution_to_Training': ('Institution', 'Training_Programme'),
    }

    for mapping_name, (x_col, y_col) in mappings.items():
        model_name = best_model_by_mapping[mapping_name]
        model = CLASSIFIERS[model_name]

        le_x = LabelEncoder()
        le_y = LabelEncoder()

        X_enc = le_x.fit_transform(df[x_col].fillna('Unknown')).reshape(-1, 1)
        y_enc = le_y.fit_transform(df[y_col].fillna('Unknown'))

        # Do not stratify to avoid rare-class split errors
        X_train, X_test, y_train, y_test = train_test_split(
            X_enc, y_enc, test_size=0.2, random_state=42
        )
        model.fit(X_train, y_train)

        joblib.dump(model, os.path.join(out_dir, f'{mapping_name}_model.joblib'))
        joblib.dump(le_x, os.path.join(out_dir, f'{mapping_name}_le_x.joblib'))
        joblib.dump(le_y, os.path.join(out_dir, f'{mapping_name}_le_y.joblib'))


def analyze_user_responses(
    models_dir: str,
    passion: Optional[str] = None,
    skill: Optional[str] = None,
    course_degree: Optional[str] = None,
    institution: Optional[str] = None,
) -> Dict[str, Optional[str]]:
    results: Dict[str, Optional[str]] = {
        'passion': passion,
        'skill': skill,
        'course_degree': course_degree,
        'institution': institution,
        'training_programme': None,
    }

    # Helper to load artifacts
    def load(mapping_name: str):
        model = joblib.load(os.path.join(models_dir, f'{mapping_name}_model.joblib'))
        le_x = joblib.load(os.path.join(models_dir, f'{mapping_name}_le_x.joblib'))
        le_y = joblib.load(os.path.join(models_dir, f'{mapping_name}_le_y.joblib'))
        return model, le_x, le_y

    # Infer missing fields in a practical order
    if results['passion'] is None and results['skill']:
        model, le_x, le_y = load('Skill_to_Passion')
        x = le_x.transform([results['skill']]).reshape(-1, 1)
        results['passion'] = le_y.inverse_transform(model.predict(x))[0]

    if results['skill'] is None and results['passion']:
        model, le_x, le_y = load('Passion_to_Skill')
        x = le_x.transform([results['passion']]).reshape(-1, 1)
        results['skill'] = le_y.inverse_transform(model.predict(x))[0]

    if results['institution'] is None and results['course_degree']:
        model, le_x, le_y = load('Course_to_Institution')
        x = le_x.transform([results['course_degree']]).reshape(-1, 1)
        results['institution'] = le_y.inverse_transform(model.predict(x))[0]

    if results['institution'] and 'Institution_to_Training':
        model, le_x, le_y = load('Institution_to_Training')
        x = le_x.transform([results['institution']]).reshape(-1, 1)
        results['training_programme'] = le_y.inverse_transform(model.predict(x))[0]

    return results


def main() -> None:
    comparison_json = os.path.join('outputs', 'comparison', 'best_models.json')
    models_out_dir = os.path.join('outputs', 'models')

    if not os.path.exists(comparison_json):
        raise FileNotFoundError(
            'best_models.json not found. Run compare_mappings.py first to select best models.'
        )

    best_models = pick_best_models_from_comparison(comparison_json)
    df = load_dataset()
    fit_and_serialize(df, best_models, models_out_dir)

    # Demo: simple flow using some known inputs
    sample = analyze_user_responses(
        models_out_dir,
        passion='Artificial Intelligence',
        skill=None,
        course_degree='B.Tech CSE',
        institution=None,
    )
    print('Sample analysis:')
    print(sample)


if __name__ == '__main__':
    main()
