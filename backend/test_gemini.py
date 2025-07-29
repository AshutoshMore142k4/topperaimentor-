#!/usr/bin/env python3
"""
Test script for Topper AI Mentor Gemini API integration
Run this script to test if the Gemini API is working correctly.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from services.ai_chatbot import AIchatbot

def test_gemini_api():
    """Test the Gemini API integration"""
    
    # Load environment variables
    load_dotenv()
    
    print("🧪 Testing Topper AI Mentor - Gemini API Integration")
    print("=" * 60)
    
    # Initialize chatbot
    chatbot = AIchatbot()
    
    # Check if API key is loaded
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if gemini_api_key:
        print(f"✅ Gemini API Key found: {gemini_api_key[:10]}...")
    else:
        print("❌ Gemini API Key not found in environment variables")
        return False
    
    # Check if model is initialized
    if chatbot.model:
        print("✅ Gemini model initialized successfully")
    else:
        print("❌ Failed to initialize Gemini model")
        return False
    
    # Test different domain questions
    test_questions = [
        {
            'question': 'What is machine learning and how does it work?',
            'domain': 'data_science',
            'expected_keywords': ['machine learning', 'algorithm', 'data', 'model']
        },
        {
            'question': 'How do I create a React component?',
            'domain': 'app_development',
            'expected_keywords': ['react', 'component', 'jsx', 'javascript']
        },
        {
            'question': 'What is encryption and why is it important?',
            'domain': 'cyber_security',
            'expected_keywords': ['encryption', 'security', 'data', 'protect']
        },
        {
            'question': 'Explain the concept of variables in programming',
            'domain': 'general',
            'expected_keywords': ['variable', 'programming', 'data', 'store']
        }
    ]
    
    print("\n🔍 Testing chatbot responses...")
    print("-" * 40)
    
    test_user_id = 1
    all_tests_passed = True
    
    for i, test in enumerate(test_questions, 1):
        print(f"\nTest {i}: {test['domain'].replace('_', ' ').title()}")
        print(f"Question: {test['question']}")
        
        try:
            # Process the message
            response = chatbot.process_message(
                message=test['question'],
                user_id=test_user_id,
                domain=test['domain']
            )
            
            # Check if response is valid
            if response and 'text' in response:
                print(f"✅ Response received ({len(response['text'])} characters)")
                print(f"🎯 Domain detected: {response.get('domain', 'unknown')}")
                print(f"📊 Confidence: {response.get('confidence', 0):.2f}")
                
                # Check for expected keywords (basic validation)
                response_text = response['text'].lower()
                keywords_found = sum(1 for keyword in test['expected_keywords'] 
                                   if keyword.lower() in response_text)
                
                if keywords_found > 0:
                    print(f"🔍 Keywords found: {keywords_found}/{len(test['expected_keywords'])}")
                else:
                    print("⚠️ No expected keywords found in response")
                
                # Print a snippet of the response
                snippet = response['text'][:150] + "..." if len(response['text']) > 150 else response['text']
                print(f"💬 Response snippet: {snippet}")
                
            else:
                print("❌ No valid response received")
                all_tests_passed = False
                
        except Exception as e:
            print(f"❌ Error processing question: {str(e)}")
            all_tests_passed = False
    
    print("\n" + "=" * 60)
    if all_tests_passed:
        print("🎉 All tests passed! Gemini API integration is working correctly.")
    else:
        print("⚠️ Some tests failed. Please check the configuration and API key.")
    
    return all_tests_passed

def test_domain_detection():
    """Test the domain detection functionality"""
    print("\n🔍 Testing domain detection...")
    print("-" * 30)
    
    chatbot = AIchatbot()
    
    test_messages = [
        ("How do I use pandas dataframes?", "data_science"),
        ("Create a React navbar component", "app_development"),
        ("What is SQL injection?", "cyber_security"),
        ("Tell me about the weather", "general")
    ]
    
    for message, expected_domain in test_messages:
        detected_domain = chatbot.detect_domain(message)
        status = "✅" if detected_domain == expected_domain else "⚠️"
        print(f"{status} '{message}' -> {detected_domain} (expected: {expected_domain})")

def main():
    """Main function to run all tests"""
    try:
        # Test basic API functionality
        api_test_passed = test_gemini_api()
        
        # Test domain detection
        test_domain_detection()
        
        print("\n" + "=" * 60)
        print("🏁 Test Summary:")
        print(f"   Gemini API Integration: {'✅ PASSED' if api_test_passed else '❌ FAILED'}")
        print(f"   Domain Detection: ✅ TESTED")
        
        if api_test_passed:
            print("\n🚀 Topper AI Mentor is ready to help students!")
            print("💡 You can now start the Flask server with: python app.py")
        else:
            print("\n🔧 Please fix the issues above before running the application.")
            
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {str(e)}")
        print("🔧 Please check your environment setup and try again.")

if __name__ == "__main__":
    main()
