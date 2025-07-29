

import re
import math
from collections import defaultdict, Counter
from typing import List, Dict, Tuple, Set
import string


class TextPreprocessor:
    
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        }
    
    def clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = ' '.join(text.split())
        return text
    
    def tokenize(self, text: str) -> List[str]:
        cleaned_text = self.clean_text(text)
        return cleaned_text.split()
    
    def remove_stop_words(self, tokens: List[str]) -> List[str]:
        return [token for token in tokens if token not in self.stop_words]
    
    def get_n_grams(self, tokens: List[str], n: int = 2) -> List[Tuple[str, ...]]:
        if len(tokens) < n:
            return []
        
        n_grams = []
        for i in range(len(tokens) - n + 1):
            n_gram = tuple(tokens[i:i + n])
            n_grams.append(n_gram)
        
        return n_grams


class NaiveBayesClassifier:
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.class_probabilities = {}
        self.word_probabilities = defaultdict(lambda: defaultdict(float))
        self.vocabulary = set()
        self.classes = set()
    
    def train(self, documents: List[Tuple[str, str]]):
        class_counts = Counter()
        word_counts = defaultdict(lambda: defaultdict(int))
        
        for text, label in documents:
            self.classes.add(label)
            class_counts[label] += 1
            
            tokens = self.preprocessor.remove_stop_words(
                self.preprocessor.tokenize(text)
            )
            
            for token in tokens:
                self.vocabulary.add(token)
                word_counts[label][token] += 1
        
        total_docs = len(documents)
        for class_name in self.classes:
            self.class_probabilities[class_name] = class_counts[class_name] / total_docs
        
        vocab_size = len(self.vocabulary)
        for class_name in self.classes:
            total_words = sum(word_counts[class_name].values())
            
            for word in self.vocabulary:
                word_count = word_counts[class_name][word]
                self.word_probabilities[class_name][word] = (
                    (word_count + 1) / (total_words + vocab_size)
                )
    
    def predict(self, text: str) -> str:
        tokens = self.preprocessor.remove_stop_words(
            self.preprocessor.tokenize(text)
        )
        
        class_scores = {}
        
        for class_name in self.classes:
            score = math.log(self.class_probabilities[class_name])
            
            for token in tokens:
                if token in self.vocabulary:
                    score += math.log(self.word_probabilities[class_name][token])
                else:
                    score += math.log(1 / (len(self.vocabulary) + 1))
            
            class_scores[class_name] = score
        
        return max(class_scores, key=class_scores.get)


class TFIDFVectorizer:
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.vocabulary = {}
        self.idf_values = {}
        self.documents = []
    
    def fit(self, documents: List[str]):
        """Fit the vectorizer on a corpus of documents"""
        self.documents = documents
        processed_docs = []
        all_words = set()
        
        # Preprocess documents and build vocabulary
        for doc in documents:
            tokens = self.preprocessor.remove_stop_words(
                self.preprocessor.tokenize(doc)
            )
            processed_docs.append(tokens)
            all_words.update(tokens)
        
        # Create vocabulary mapping
        self.vocabulary = {word: idx for idx, word in enumerate(sorted(all_words))}
        
        # Calculate IDF values
        num_docs = len(documents)
        for word in self.vocabulary:
            # Count documents containing the word
            doc_freq = sum(1 for doc_tokens in processed_docs if word in doc_tokens)
            
            # Calculate IDF with smoothing
            self.idf_values[word] = math.log(num_docs / (1 + doc_freq))
    
    def transform(self, documents: List[str]) -> List[List[float]]:
        """Transform documents to TF-IDF vectors"""
        tfidf_matrix = []
        
        for doc in documents:
            tokens = self.preprocessor.remove_stop_words(
                self.preprocessor.tokenize(doc)
            )
            
            # Calculate term frequencies
            tf_counts = Counter(tokens)
            doc_length = len(tokens)
            
            # Create TF-IDF vector
            vector = [0.0] * len(self.vocabulary)
            
            for word, count in tf_counts.items():
                if word in self.vocabulary:
                    tf = count / doc_length if doc_length > 0 else 0
                    idf = self.idf_values[word]
                    tfidf = tf * idf
                    
                    word_idx = self.vocabulary[word]
                    vector[word_idx] = tfidf
            
            tfidf_matrix.append(vector)
        
        return tfidf_matrix
    
    def fit_transform(self, documents: List[str]) -> List[List[float]]:
        """Fit and transform in one step"""
        self.fit(documents)
        return self.transform(documents)


class SentimentAnalyzer:
    """Simple rule-based sentiment analysis"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
        
        # Simple sentiment lexicons
        self.positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'awesome', 'brilliant', 'outstanding', 'superb', 'perfect', 'love',
            'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'delighted'
        }
        
        self.negative_words = {
            'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
            'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'annoyed',
            'upset', 'worried', 'concerned', 'poor', 'worst', 'fail', 'wrong'
        }
        
        # Intensifiers and negations
        self.intensifiers = {'very', 'extremely', 'really', 'quite', 'totally'}
        self.negations = {'not', 'no', 'never', 'nothing', 'nowhere', 'neither'}
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of text"""
        tokens = self.preprocessor.tokenize(text)
        
        positive_score = 0
        negative_score = 0
        intensifier_boost = 1.0
        negation_active = False
        
        for i, token in enumerate(tokens):
            # Check for intensifiers
            if token in self.intensifiers:
                intensifier_boost = 1.5
                continue
            
            # Check for negations
            if token in self.negations:
                negation_active = True
                continue
            
            # Score positive/negative words
            base_score = intensifier_boost
            
            if token in self.positive_words:
                if negation_active:
                    negative_score += base_score
                else:
                    positive_score += base_score
            elif token in self.negative_words:
                if negation_active:
                    positive_score += base_score
                else:
                    negative_score += base_score
            
            # Reset modifiers after processing a sentiment word
            if token in self.positive_words or token in self.negative_words:
                intensifier_boost = 1.0
                negation_active = False
        
        # Calculate final sentiment
        total_score = positive_score + negative_score
        
        if total_score == 0:
            return {'sentiment': 'neutral', 'confidence': 0.0}
        
        positive_ratio = positive_score / total_score
        negative_ratio = negative_score / total_score
        
        if positive_ratio > negative_ratio:
            sentiment = 'positive'
            confidence = positive_ratio
        else:
            sentiment = 'negative'
            confidence = negative_ratio
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'positive_score': positive_score,
            'negative_score': negative_score
        }


class TextSimilarity:
    """Calculate similarity between texts using various methods"""
    
    def __init__(self):
        self.preprocessor = TextPreprocessor()
    
    def jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calculate Jaccard similarity between two texts"""
        tokens1 = set(self.preprocessor.remove_stop_words(
            self.preprocessor.tokenize(text1)
        ))
        tokens2 = set(self.preprocessor.remove_stop_words(
            self.preprocessor.tokenize(text2)
        ))
        
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def cosine_similarity(self, vector1: List[float], vector2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if len(vector1) != len(vector2):
            raise ValueError("Vectors must have same length")
        
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        magnitude1 = math.sqrt(sum(a * a for a in vector1))
        magnitude2 = math.sqrt(sum(b * b for b in vector2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)


# Example usage and demonstration
def demonstrate_nlp_algorithms():
    """Demonstrate the NLP algorithms with sample data"""
    
    print("🔤 NLP Algorithms Demonstration")
    print("=" * 50)
    
    # Sample data
    sample_texts = [
        "I love this product! It's absolutely amazing and works perfectly.",
        "This is terrible. I hate it and want my money back.",
        "The service was okay, nothing special but not bad either.",
        "Machine learning is a fascinating field of artificial intelligence.",
        "Natural language processing helps computers understand human language."
    ]
    
    labels = ["positive", "negative", "neutral", "technical", "technical"]
    
    # 1. Text Preprocessing
    print("\n1. Text Preprocessing:")
    preprocessor = TextPreprocessor()
    for text in sample_texts[:2]:
        tokens = preprocessor.tokenize(text)
        clean_tokens = preprocessor.remove_stop_words(tokens)
        print(f"Original: {text}")
        print(f"Tokens: {tokens}")
        print(f"Without stop words: {clean_tokens}")
        print()
    
    # 2. Naive Bayes Classification
    print("\n2. Naive Bayes Classification:")
    classifier = NaiveBayesClassifier()
    training_data = list(zip(sample_texts, labels))
    classifier.train(training_data)
    
    test_text = "This product is really good and I'm happy with it"
    prediction = classifier.predict(test_text)
    print(f"Text: {test_text}")
    print(f"Predicted class: {prediction}")
    
    # 3. TF-IDF Vectorization
    print("\n3. TF-IDF Vectorization:")
    vectorizer = TFIDFVectorizer()
    tfidf_matrix = vectorizer.fit_transform(sample_texts)
    print(f"Vocabulary size: {len(vectorizer.vocabulary)}")
    print(f"TF-IDF matrix shape: {len(tfidf_matrix)} x {len(tfidf_matrix[0])}")
    
    # 4. Sentiment Analysis
    print("\n4. Sentiment Analysis:")
    analyzer = SentimentAnalyzer()
    for text in sample_texts[:3]:
        sentiment = analyzer.analyze_sentiment(text)
        print(f"Text: {text}")
        print(f"Sentiment: {sentiment}")
        print()
    
    # 5. Text Similarity
    print("\n5. Text Similarity:")
    similarity = TextSimilarity()
    text1 = sample_texts[3]
    text2 = sample_texts[4]
    jaccard_sim = similarity.jaccard_similarity(text1, text2)
    
    # Cosine similarity using TF-IDF vectors
    vectors = vectorizer.transform([text1, text2])
    cosine_sim = similarity.cosine_similarity(vectors[0], vectors[1])
    
    print(f"Text 1: {text1}")
    print(f"Text 2: {text2}")
    print(f"Jaccard Similarity: {jaccard_sim:.3f}")
    print(f"Cosine Similarity: {cosine_sim:.3f}")


if __name__ == "__main__":
    demonstrate_nlp_algorithms()
