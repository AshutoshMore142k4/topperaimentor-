"""
Sample Machine Learning Algorithms for Educational Purposes
===========================================================

This file contains various Machine Learning algorithms
implemented from scratch for learning and demonstration purposes.
These are not connected to the main application.
"""

import math
import random
from typing import List, Tuple, Dict, Any, Optional
from collections import defaultdict, Counter
import numpy as np


class LinearRegression:
    """Simple Linear Regression implementation"""
    
    def __init__(self, learning_rate: float = 0.01, max_iterations: int = 1000):
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.weights = None
        self.bias = None
        self.cost_history = []
    
    def fit(self, X: List[List[float]], y: List[float]):
        """Train the linear regression model"""
        n_samples, n_features = len(X), len(X[0])
        
        # Initialize weights and bias
        self.weights = [0.0] * n_features
        self.bias = 0.0
        
        # Gradient descent
        for iteration in range(self.max_iterations):
            # Forward pass - calculate predictions
            predictions = self._predict_batch(X)
            
            # Calculate cost (Mean Squared Error)
            cost = self._calculate_cost(predictions, y)
            self.cost_history.append(cost)
            
            # Backward pass - calculate gradients
            dw, db = self._calculate_gradients(X, y, predictions)
            
            # Update parameters
            for i in range(n_features):
                self.weights[i] -= self.learning_rate * dw[i]
            self.bias -= self.learning_rate * db
            
            # Early stopping if cost doesn't improve
            if iteration > 10 and abs(self.cost_history[-1] - self.cost_history[-10]) < 1e-6:
                break
    
    def predict(self, X: List[List[float]]) -> List[float]:
        """Make predictions on new data"""
        return self._predict_batch(X)
    
    def _predict_batch(self, X: List[List[float]]) -> List[float]:
        """Internal method to predict for a batch of samples"""
        predictions = []
        for sample in X:
            prediction = self.bias + sum(w * x for w, x in zip(self.weights, sample))
            predictions.append(prediction)
        return predictions
    
    def _calculate_cost(self, predictions: List[float], y_true: List[float]) -> float:
        """Calculate Mean Squared Error"""
        n = len(y_true)
        cost = sum((pred - true) ** 2 for pred, true in zip(predictions, y_true))
        return cost / (2 * n)
    
    def _calculate_gradients(self, X: List[List[float]], y_true: List[float], 
                           predictions: List[float]) -> Tuple[List[float], float]:
        """Calculate gradients for weights and bias"""
        n_samples = len(X)
        n_features = len(X[0])
        
        # Calculate gradients
        dw = [0.0] * n_features
        db = 0.0
        
        for i in range(n_samples):
            error = predictions[i] - y_true[i]
            db += error
            for j in range(n_features):
                dw[j] += error * X[i][j]
        
        # Average the gradients
        dw = [grad / n_samples for grad in dw]
        db = db / n_samples
        
        return dw, db


class KNearestNeighbors:
    """K-Nearest Neighbors classifier"""
    
    def __init__(self, k: int = 3):
        self.k = k
        self.X_train = None
        self.y_train = None
    
    def fit(self, X: List[List[float]], y: List[Any]):
        """Store training data"""
        self.X_train = X
        self.y_train = y
    
    def predict(self, X: List[List[float]]) -> List[Any]:
        """Predict labels for test data"""
        predictions = []
        for sample in X:
            prediction = self._predict_single(sample)
            predictions.append(prediction)
        return predictions
    
    def _predict_single(self, sample: List[float]) -> Any:
        """Predict label for a single sample"""
        # Calculate distances to all training samples
        distances = []
        for i, train_sample in enumerate(self.X_train):
            distance = self._euclidean_distance(sample, train_sample)
            distances.append((distance, self.y_train[i]))
        
        # Sort by distance and get k nearest neighbors
        distances.sort(key=lambda x: x[0])
        k_nearest = distances[:self.k]
        
        # Vote for the most common class
        votes = [neighbor[1] for neighbor in k_nearest]
        return max(set(votes), key=votes.count)
    
    def _euclidean_distance(self, point1: List[float], point2: List[float]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(point1, point2)))


class DecisionTreeClassifier:
    """Simple Decision Tree classifier using ID3 algorithm"""
    
    class Node:
        def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
            self.feature = feature
            self.threshold = threshold
            self.left = left
            self.right = right
            self.value = value
    
    def __init__(self, max_depth: int = 10, min_samples_split: int = 2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None
    
    def fit(self, X: List[List[float]], y: List[Any]):
        """Build the decision tree"""
        self.root = self._build_tree(X, y, depth=0)
    
    def predict(self, X: List[List[float]]) -> List[Any]:
        """Make predictions"""
        return [self._predict_single(sample, self.root) for sample in X]
    
    def _build_tree(self, X: List[List[float]], y: List[Any], depth: int) -> Node:
        """Recursively build the decision tree"""
        n_samples = len(X)
        n_features = len(X[0]) if X else 0
        
        # Stopping criteria
        if (depth >= self.max_depth or 
            n_samples < self.min_samples_split or 
            len(set(y)) == 1):
            # Create leaf node with most common class
            most_common = max(set(y), key=y.count)
            return self.Node(value=most_common)
        
        # Find best split
        best_feature, best_threshold = self._best_split(X, y, n_features)
        
        if best_feature is None:
            most_common = max(set(y), key=y.count)
            return self.Node(value=most_common)
        
        # Split the data
        left_indices, right_indices = self._split_data(X, best_feature, best_threshold)
        
        left_X = [X[i] for i in left_indices]
        left_y = [y[i] for i in left_indices]
        right_X = [X[i] for i in right_indices]
        right_y = [y[i] for i in right_indices]
        
        # Recursively build left and right subtrees
        left_child = self._build_tree(left_X, left_y, depth + 1)
        right_child = self._build_tree(right_X, right_y, depth + 1)
        
        return self.Node(feature=best_feature, threshold=best_threshold,
                        left=left_child, right=right_child)
    
    def _best_split(self, X: List[List[float]], y: List[Any], n_features: int) -> Tuple[Optional[int], Optional[float]]:
        """Find the best feature and threshold to split on"""
        best_gini = float('inf')
        best_feature = None
        best_threshold = None
        
        for feature in range(n_features):
            # Get unique values for this feature
            feature_values = [sample[feature] for sample in X]
            unique_values = sorted(set(feature_values))
            
            # Try different thresholds
            for i in range(len(unique_values) - 1):
                threshold = (unique_values[i] + unique_values[i + 1]) / 2
                gini = self._gini_impurity_split(X, y, feature, threshold)
                
                if gini < best_gini:
                    best_gini = gini
                    best_feature = feature
                    best_threshold = threshold
        
        return best_feature, best_threshold
    
    def _gini_impurity_split(self, X: List[List[float]], y: List[Any], 
                           feature: int, threshold: float) -> float:
        """Calculate Gini impurity for a split"""
        left_indices, right_indices = self._split_data(X, feature, threshold)
        
        if not left_indices or not right_indices:
            return float('inf')
        
        n_total = len(y)
        n_left = len(left_indices)
        n_right = len(right_indices)
        
        left_y = [y[i] for i in left_indices]
        right_y = [y[i] for i in right_indices]
        
        gini_left = self._gini_impurity(left_y)
        gini_right = self._gini_impurity(right_y)
        
        # Weighted average of child impurities
        weighted_gini = (n_left / n_total) * gini_left + (n_right / n_total) * gini_right
        
        return weighted_gini
    
    def _gini_impurity(self, y: List[Any]) -> float:
        """Calculate Gini impurity"""
        if not y:
            return 0
        
        class_counts = Counter(y)
        n_samples = len(y)
        
        gini = 1.0
        for count in class_counts.values():
            probability = count / n_samples
            gini -= probability ** 2
        
        return gini
    
    def _split_data(self, X: List[List[float]], feature: int, threshold: float) -> Tuple[List[int], List[int]]:
        """Split data based on feature and threshold"""
        left_indices = []
        right_indices = []
        
        for i, sample in enumerate(X):
            if sample[feature] <= threshold:
                left_indices.append(i)
            else:
                right_indices.append(i)
        
        return left_indices, right_indices
    
    def _predict_single(self, sample: List[float], node: Node) -> Any:
        """Predict a single sample by traversing the tree"""
        if node.value is not None:
            return node.value
        
        if sample[node.feature] <= node.threshold:
            return self._predict_single(sample, node.left)
        else:
            return self._predict_single(sample, node.right)


class KMeansClustering:
    """K-Means clustering algorithm"""
    
    def __init__(self, k: int = 3, max_iterations: int = 100, random_seed: int = 42):
        self.k = k
        self.max_iterations = max_iterations
        self.random_seed = random_seed
        self.centroids = None
        self.labels = None
    
    def fit(self, X: List[List[float]]) -> List[int]:
        """Perform K-Means clustering"""
        random.seed(self.random_seed)
        
        n_samples, n_features = len(X), len(X[0])
        
        # Initialize centroids randomly
        self.centroids = []
        for _ in range(self.k):
            centroid = [random.uniform(min(X[i][j] for i in range(n_samples)),
                                     max(X[i][j] for i in range(n_samples)))
                       for j in range(n_features)]
            self.centroids.append(centroid)
        
        for iteration in range(self.max_iterations):
            # Assign points to nearest centroids
            new_labels = []
            for sample in X:
                distances = [self._euclidean_distance(sample, centroid) 
                           for centroid in self.centroids]
                closest_centroid = distances.index(min(distances))
                new_labels.append(closest_centroid)
            
            # Check for convergence
            if iteration > 0 and new_labels == self.labels:
                break
            
            self.labels = new_labels
            
            # Update centroids
            new_centroids = []
            for k in range(self.k):
                cluster_points = [X[i] for i in range(n_samples) if self.labels[i] == k]
                if cluster_points:
                    # Calculate mean of cluster points
                    centroid = [sum(point[j] for point in cluster_points) / len(cluster_points)
                              for j in range(n_features)]
                    new_centroids.append(centroid)
                else:
                    # Keep old centroid if no points assigned
                    new_centroids.append(self.centroids[k])
            
            self.centroids = new_centroids
        
        return self.labels
    
    def predict(self, X: List[List[float]]) -> List[int]:
        """Assign new points to existing clusters"""
        if self.centroids is None:
            raise ValueError("Model must be fitted before making predictions")
        
        labels = []
        for sample in X:
            distances = [self._euclidean_distance(sample, centroid) 
                        for centroid in self.centroids]
            closest_centroid = distances.index(min(distances))
            labels.append(closest_centroid)
        
        return labels
    
    def _euclidean_distance(self, point1: List[float], point2: List[float]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(point1, point2)))


class NeuralNetwork:
    """Simple multi-layer perceptron neural network"""
    
    def __init__(self, layers: List[int], learning_rate: float = 0.1, max_epochs: int = 1000):
        self.layers = layers
        self.learning_rate = learning_rate
        self.max_epochs = max_epochs
        self.weights = []
        self.biases = []
        self._initialize_parameters()
    
    def _initialize_parameters(self):
        """Initialize weights and biases randomly"""
        random.seed(42)
        
        for i in range(len(self.layers) - 1):
            # Xavier initialization
            fan_in = self.layers[i]
            fan_out = self.layers[i + 1]
            limit = math.sqrt(6.0 / (fan_in + fan_out))
            
            weight_matrix = []
            for _ in range(self.layers[i + 1]):
                weights = [random.uniform(-limit, limit) for _ in range(self.layers[i])]
                weight_matrix.append(weights)
            
            self.weights.append(weight_matrix)
            self.biases.append([0.0] * self.layers[i + 1])
    
    def _sigmoid(self, x: float) -> float:
        """Sigmoid activation function"""
        return 1.0 / (1.0 + math.exp(-max(-500, min(500, x))))  # Clip to prevent overflow
    
    def _sigmoid_derivative(self, x: float) -> float:
        """Derivative of sigmoid function"""
        s = self._sigmoid(x)
        return s * (1 - s)
    
    def _forward_pass(self, X: List[float]) -> Tuple[List[List[float]], List[List[float]]]:
        """Forward propagation through the network"""
        activations = [X]
        z_values = []
        
        current_input = X
        
        for layer_idx in range(len(self.weights)):
            z = []
            for neuron_idx in range(len(self.weights[layer_idx])):
                # Calculate weighted sum
                weighted_sum = sum(w * inp for w, inp in zip(self.weights[layer_idx][neuron_idx], current_input))
                weighted_sum += self.biases[layer_idx][neuron_idx]
                z.append(weighted_sum)
            
            z_values.append(z)
            
            # Apply activation function
            activation = [self._sigmoid(val) for val in z]
            activations.append(activation)
            current_input = activation
        
        return activations, z_values
    
    def fit(self, X: List[List[float]], y: List[List[float]]):
        """Train the neural network using backpropagation"""
        for epoch in range(self.max_epochs):
            total_loss = 0
            
            for sample_idx in range(len(X)):
                # Forward pass
                activations, z_values = self._forward_pass(X[sample_idx])
                
                # Calculate loss (mean squared error)
                output = activations[-1]
                target = y[sample_idx]
                loss = sum((o - t) ** 2 for o, t in zip(output, target)) / 2
                total_loss += loss
                
                # Backward pass
                self._backward_pass(activations, z_values, target)
            
            # Print progress
            if epoch % 100 == 0:
                avg_loss = total_loss / len(X)
                print(f"Epoch {epoch}, Average Loss: {avg_loss:.4f}")
    
    def _backward_pass(self, activations: List[List[float]], z_values: List[List[float]], target: List[float]):
        """Backward propagation to update weights and biases"""
        # Calculate output layer error
        output = activations[-1]
        output_error = [(o - t) * self._sigmoid_derivative(z) 
                       for o, t, z in zip(output, target, z_values[-1])]
        
        errors = [output_error]
        
        # Backpropagate errors
        for layer_idx in range(len(self.weights) - 2, -1, -1):
            layer_error = []
            for neuron_idx in range(len(activations[layer_idx + 1])):
                error = 0
                for next_neuron_idx in range(len(errors[0])):
                    error += errors[0][next_neuron_idx] * self.weights[layer_idx + 1][next_neuron_idx][neuron_idx]
                error *= self._sigmoid_derivative(z_values[layer_idx][neuron_idx])
                layer_error.append(error)
            errors.insert(0, layer_error)
        
        # Update weights and biases
        for layer_idx in range(len(self.weights)):
            for neuron_idx in range(len(self.weights[layer_idx])):
                for weight_idx in range(len(self.weights[layer_idx][neuron_idx])):
                    gradient = errors[layer_idx][neuron_idx] * activations[layer_idx][weight_idx]
                    self.weights[layer_idx][neuron_idx][weight_idx] -= self.learning_rate * gradient
                
                # Update bias
                self.biases[layer_idx][neuron_idx] -= self.learning_rate * errors[layer_idx][neuron_idx]
    
    def predict(self, X: List[List[float]]) -> List[List[float]]:
        """Make predictions on new data"""
        predictions = []
        for sample in X:
            activations, _ = self._forward_pass(sample)
            predictions.append(activations[-1])
        return predictions


# Example usage and demonstration
def demonstrate_ml_algorithms():
    """Demonstrate the ML algorithms with sample data"""
    
    print("🤖 Machine Learning Algorithms Demonstration")
    print("=" * 60)
    
    # Generate sample data
    random.seed(42)
    
    # Linear regression data
    print("\n1. Linear Regression:")
    X_reg = [[i] for i in range(1, 11)]  # Features: 1, 2, 3, ..., 10
    y_reg = [2 * x[0] + 1 + random.uniform(-0.5, 0.5) for x in X_reg]  # y = 2x + 1 + noise
    
    lr = LinearRegression(learning_rate=0.01, max_iterations=1000)
    lr.fit(X_reg, y_reg)
    predictions = lr.predict([[11], [12]])
    
    print(f"Learned weights: {lr.weights}")
    print(f"Learned bias: {lr.bias:.3f}")
    print(f"Predictions for [11], [12]: {[round(p, 2) for p in predictions]}")
    
    # Classification data
    print("\n2. K-Nearest Neighbors Classification:")
    X_class = [[1, 2], [2, 3], [3, 3], [6, 7], [7, 8], [8, 9]]
    y_class = ['A', 'A', 'A', 'B', 'B', 'B']
    
    knn = KNearestNeighbors(k=3)
    knn.fit(X_class, y_class)
    test_predictions = knn.predict([[2, 2], [7, 7]])
    print(f"Test predictions: {test_predictions}")
    
    # Decision Tree
    print("\n3. Decision Tree Classification:")
    dt = DecisionTreeClassifier(max_depth=3)
    dt.fit(X_class, y_class)
    dt_predictions = dt.predict([[2, 2], [7, 7]])
    print(f"Decision Tree predictions: {dt_predictions}")
    
    # K-Means Clustering
    print("\n4. K-Means Clustering:")
    X_cluster = [[1, 1], [1, 2], [2, 1], [6, 6], [6, 7], [7, 6]]
    kmeans = KMeansClustering(k=2)
    cluster_labels = kmeans.fit(X_cluster)
    print(f"Cluster assignments: {cluster_labels}")
    print(f"Centroids: {[[round(c, 2) for c in centroid] for centroid in kmeans.centroids]}")
    
    # Neural Network (XOR problem)
    print("\n5. Neural Network (XOR Problem):")
    X_xor = [[0, 0], [0, 1], [1, 0], [1, 1]]
    y_xor = [[0], [1], [1], [0]]
    
    nn = NeuralNetwork(layers=[2, 4, 1], learning_rate=0.5, max_epochs=1000)
    print("Training neural network...")
    nn.fit(X_xor, y_xor)
    
    nn_predictions = nn.predict(X_xor)
    print("Neural Network Results:")
    for i, (inp, target, pred) in enumerate(zip(X_xor, y_xor, nn_predictions)):
        print(f"Input: {inp}, Target: {target[0]}, Prediction: {pred[0]:.3f}")


if __name__ == "__main__":
    demonstrate_ml_algorithms()
