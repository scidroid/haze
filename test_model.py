import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns
import time

plt.ion()

# Simulating dynamic data
def generate_dynamic_data(n_samples=1000):
    """
    Function to generate random data within a reasonable range of values.
    """
    data = pd.DataFrame({
        'precipitation': np.random.uniform(0, 300, n_samples),  # mm
        'relative_humidity': np.random.uniform(10, 100, n_samples),  # Percentage
        'drought_index': np.random.uniform(-5, 5, n_samples),  # Hypothetical index (-5 very dry, 5 very wet)
        'soil_coverage': np.random.uniform(0, 1, n_samples),  # Proportion (0 to 1)
        'climate_events': np.random.choice([0, 1], n_samples),  # 0: Normal, 1: Extreme event
        'outcome': np.random.choice([0, 1], n_samples)  # 0: Drought, 1: Flood
    })
    return data

def model_and_plot(data):
    """
    Train the model and generate plots from the provided data.
    """
    # Split the data into input variables (X) and target variable (y)
    X = data[['precipitation', 'relative_humidity', 'drought_index', 'soil_coverage', 'climate_events']]
    y = data['outcome']

    # Split the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    # Scale the data (normalization)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train a Logistic Regression model
    model = LogisticRegression()
    model.fit(X_train_scaled, y_train)

    # Make predictions on the test set
    y_pred = model.predict(X_test_scaled)

    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)

    # Predicted probabilities
    y_prob = model.predict_proba(X_test_scaled)[:, 1]  # Probability of flooding


    plt.clf()  # Clear the current figure

    # 1. Histogram of precipitation distribution
    plt.subplot(2, 2, 1)
    sns.histplot(data['precipitation'], bins=20, kde=True)
    plt.title('Precipitation Distribution')
    plt.xlabel('Precipitation (mm)')
    plt.ylabel('Volume (m3)')

    # 2. Scatter plot: Relationship between humidity and precipitation
    plt.subplot(2, 2, 2)
    sns.scatterplot(x=data['relative_humidity'], y=data['precipitation'], hue=data['outcome'], palette='coolwarm')
    plt.title('Humidity vs Precipitation')
    plt.xlabel('Relative Humidity (%)')
    plt.ylabel('Precipitation (mm)')
    plt.legend(title="Outcome (0: Drought, 1: Flood)")

    # 3. Visualizing the confusion matrix
    plt.subplot(2, 2, 3)
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title('Confusion Matrix')
    plt.xlabel('Prediction')
    plt.ylabel('Reality')

 
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    plt.subplot(2, 2, 4)
    plt.plot(fpr, tpr, color='darkorange', lw=2, label='ROC Curve (area = %0.2f)' % roc_auc)
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve')
    plt.legend(loc="lower right")

    plt.tight_layout()  
    plt.pause(1)  


while True:

    new_data = generate_dynamic_data(n_samples=1000)
    

    model_and_plot(new_data)
    

    time.sleep(0.1)
