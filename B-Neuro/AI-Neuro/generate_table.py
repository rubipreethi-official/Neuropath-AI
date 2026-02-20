import pandas as pd  

def load_dataset() -> pd.DataFrame:
    """Load dataset from neuro-dataset.csv"""
    df = pd.read_csv('neuro-dataset.csv')
    # Rename columns to match expected format
    df = df.rename(columns={
        'Course/Degree': 'Course_Degree',
        'Training/Programme': 'Training_Programme'
    })
    return df


# Read the dataset
df = load_dataset()

# List of models (all 7 used in evaluation)
models = ['Decision Tree', 'Random Forest', 'KNN', 'SVM', 'ANN', 'Naive Bayes', 'Bayesian Network']

print("\n" + "="*80)
print("DATASET SUMMARY - Columns and Data Statistics")
print("="*80)
print("\nColumn Names:")
print(df.columns.tolist())

print("\nDataset Shape:", df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\n" + "="*80)
print("COLUMN STATISTICS")
print("="*80)

for col in df.columns:
    if col != 'S No':
        unique_count = df[col].nunique()
        print(f"\n{col}:")
        print(f"  - Total entries: {len(df)}")
        print(f"  - Unique values: {unique_count}")
        print(f"  - Missing values: {df[col].isna().sum()}")
        print(f"  - Sample values: {df[col].unique()[:5]}")

print("\n" + "="*80)
