from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import os

class VoiceService:
    """Voice-to-text and text-to-voice service"""
    
    def __init__(self):
        self.supported_formats = ['wav', 'mp3', 'flac']
        
    def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """Transcribe audio file to text"""
        
        # Placeholder implementation - would integrate with Google Speech-to-Text API
        # or other speech recognition services
        
        if not os.path.exists(audio_file_path):
            return {
                'success': False,
                'error': 'Audio file not found',
                'transcription': '',
                'confidence': 0.0
            }
        
        # Mock transcription for demonstration
        return {
            'success': True,
            'transcription': 'This is a mock transcription of the audio file.',
            'confidence': 0.85,
            'audio_file': audio_file_path,
            'processing_time': 1.2,
            'language': 'en-US',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def process_voice_query(self, audio_file_path: str, user_id: int) -> Dict[str, Any]:
        """Process voice query end-to-end"""
        
        # Step 1: Transcribe audio
        transcription_result = self.transcribe_audio(audio_file_path)
        
        if not transcription_result['success']:
            return transcription_result
        
        transcribed_text = transcription_result['transcription']
        
        # Step 2: Process with AI chatbot
        from services.ai_chatbot import AIchatbot
        
        chatbot = AIchatbot()
        chat_response = chatbot.process_message(transcribed_text, user_id)
        
        # Step 3: Save voice query to database
        from models.database import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO voice_queries 
            (user_id, audio_file_path, transcribed_text, confidence_score, processing_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, audio_file_path, transcribed_text, 
              transcription_result['confidence'], transcription_result['processing_time']))
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'transcription': transcription_result,
            'chat_response': chat_response,
            'processed_at': datetime.now(timezone.utc).isoformat()
        }
    
    def get_voice_history(self, user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's voice query history"""
        
        from models.database import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT transcribed_text, confidence_score, processing_time, created_at
            FROM voice_queries 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ''', (user_id, limit))
        
        history = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in history]
    
    def validate_audio_file(self, file_path: str) -> Dict[str, Any]:
        """Validate audio file format and size"""
        
        if not os.path.exists(file_path):
            return {'valid': False, 'error': 'File does not exist'}
        
        file_extension = file_path.split('.')[-1].lower()
        if file_extension not in self.supported_formats:
            return {
                'valid': False, 
                'error': f'Unsupported format. Supported formats: {", ".join(self.supported_formats)}'
            }
        
        file_size = os.path.getsize(file_path)
        max_size = 10 * 1024 * 1024  # 10MB
        
        if file_size > max_size:
            return {'valid': False, 'error': 'File size too large (max 10MB)'}
        
        return {'valid': True, 'size': file_size, 'format': file_extension}
