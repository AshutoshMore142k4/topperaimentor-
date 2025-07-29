# AI/ML Algorithms Demo Collection


## 📁 Files

### `nlp_algorithms.py`
Contains implementations of fundamental NLP algorithms:

#### Classes & Features:
- **TextPreprocessor**: Text cleaning, tokenization, stop word removal, n-gram generation
- **NaiveBayesClassifier**: Simple text classification using Naive Bayes with Laplace smoothing
- **TFIDFVectorizer**: Term Frequency-Inverse Document Frequency vectorization
- **SentimentAnalyzer**: Rule-based sentiment analysis with intensifiers and negations
- **TextSimilarity**: Jaccard and Cosine similarity calculations

#### Example Usage:
```python
# Run the demonstration
python nlp_algorithms.py
```

### `ml_algorithms.py`
Contains implementations of fundamental ML algorithms:

#### Classes & Features:
- **LinearRegression**: Simple linear regression with gradient descent
- **KNearestNeighbors**: K-NN classifier with Euclidean distance
- **DecisionTreeClassifier**: ID3-based decision tree with Gini impurity
- **KMeansClustering**: Unsupervised clustering algorithm
- **NeuralNetwork**: Multi-layer perceptron with backpropagation

#### Example Usage:
```python
# Run the demonstration
python ml_algorithms.py
```

## 🎯 Purpose

These implementations are designed to:
- **Educate**: Help understand how core AI/ML algorithms work internally
- **Demonstrate**: Show step-by-step algorithm implementations
- **Experiment**: Provide a playground for testing concepts
- **Learn**: Offer hands-on experience with algorithm development

## 🔧 Key Features

### NLP Algorithms
- ✅ Text preprocessing and tokenization
- ✅ Naive Bayes classification with smoothing
- ✅ TF-IDF vectorization from scratch
- ✅ Rule-based sentiment analysis
- ✅ Text similarity measurements
- ✅ N-gram generation

### ML Algorithms
- ✅ Linear regression with gradient descent
- ✅ K-Nearest Neighbors classification
- ✅ Decision tree with ID3 algorithm
- ✅ K-Means clustering
- ✅ Neural network with backpropagation
- ✅ Multiple activation functions

## 📊 Sample Outputs

### NLP Demo Output:
```
🔤 NLP Algorithms Demonstration
==================================================

1. Text Preprocessing:
Original: I love this product! It's absolutely amazing and works perfectly.
Tokens: ['i', 'love', 'this', 'product', 'its', 'absolutely', 'amazing', 'and', 'works', 'perfectly']
Without stop words: ['love', 'product', 'absolutely', 'amazing', 'works', 'perfectly']

2. Naive Bayes Classification:
Text: This product is really good and I'm happy with it
Predicted class: positive

3. TF-IDF Vectorization:
Vocabulary size: 25
TF-IDF matrix shape: 5 x 25

4. Sentiment Analysis:
Text: I love this product! It's absolutely amazing and works perfectly.
Sentiment: {'sentiment': 'positive', 'confidence': 1.0, 'positive_score': 3.5, 'negative_score': 0}
```

### ML Demo Output:
```
🤖 Machine Learning Algorithms Demonstration
============================================================

1. Linear Regression:
Learned weights: [1.987]
Learned bias: 1.123
Predictions for [11], [12]: [23.0, 25.0]

2. K-Nearest Neighbors Classification:
Test predictions: ['A', 'B']

3. Decision Tree Classification:
Decision Tree predictions: ['A', 'B']

4. K-Means Clustering:
Cluster assignments: [0, 0, 0, 1, 1, 1]
Centroids: [[1.33, 1.33], [6.33, 6.33]]
```

## 🚀 Running the Demos

### Prerequisites
- Python 3.7+
- No external dependencies required (pure Python implementations)

### Execute Demonstrations
```bash
# Navigate to algorithms directory
cd backend/algorithms

# Run NLP algorithms demo
python nlp_algorithms.py

# Run ML algorithms demo
python ml_algorithms.py
```

## 📚 Educational Value

### Concepts Covered:
- **Supervised Learning**: Classification and Regression
- **Unsupervised Learning**: Clustering
- **Neural Networks**: Forward/Backward propagation
- **Text Processing**: Tokenization, Vectorization
- **Distance Metrics**: Euclidean, Cosine, Jaccard
- **Optimization**: Gradient Descent
- **Information Theory**: Entropy, Gini Impurity

### Learning Outcomes:
- Understand algorithm internals without library abstractions
- See step-by-step implementations
- Grasp mathematical foundations
- Learn optimization techniques
- Practice with real examples

## 🔗 Connection to Main App

While these algorithms are **standalone** and not integrated with the main Topper AI Mentor application, they demonstrate the types of AI/ML concepts that power modern educational platforms:

- **Text Classification** → Course content categorization
- **Sentiment Analysis** → Student feedback analysis  
- **Clustering** → Grouping similar learning patterns
- **Regression** → Performance prediction
- **Neural Networks** → Complex pattern recognition

## 📝 Notes

- All implementations prioritize **clarity over efficiency**
- Suitable for **educational purposes** and **proof of concepts**
- Production systems should use optimized libraries (scikit-learn, tensorflow, etc.)
- Code includes detailed comments and documentation
- Demonstrates core concepts without external dependencies

## 🎓 Next Steps

After exploring these implementations:
1. Compare with library implementations (scikit-learn, NLTK, spaCy)
2. Experiment with different datasets
3. Modify algorithms to understand their behavior
4. Explore more advanced variations
5. Study optimization techniques and performance improvements

Happy Learning! 🧠✨
