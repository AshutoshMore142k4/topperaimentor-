from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

class DeadlineTracker:
    """Smart deadline tracking and reminder system"""
    
    def __init__(self):
        self.reminders_sent = {}
        
    def add_deadline(self, user_id: int, title: str, due_date: str, 
                    priority: str = 'medium', category: str = 'assignment') -> int:
        """Add a new deadline for tracking"""
        
        from models.database import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO deadlines (user_id, title, due_date, priority, category)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, title, due_date, priority, category))
        
        deadline_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return deadline_id
    
    def get_upcoming_deadlines(self, user_id: int, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """Get upcoming deadlines for a user"""
        
        from models.database import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate the date range
        end_date = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.execute('''
            SELECT id, title, due_date, priority, category, status
            FROM deadlines 
            WHERE user_id = ? AND due_date <= ? AND status != 'completed'
            ORDER BY due_date ASC
        ''', (user_id, end_date))
        
        deadlines = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in deadlines]
    
    def mark_completed(self, deadline_id: int, user_id: int) -> bool:
        """Mark a deadline as completed"""
        
        from models.database import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE deadlines 
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        ''', (deadline_id, user_id))
        
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return success
    
    def get_deadline_reminders(self, user_id: int) -> List[Dict[str, Any]]:
        """Get deadlines that need reminders"""
        
        upcoming_deadlines = self.get_upcoming_deadlines(user_id, days_ahead=3)
        
        reminders = []
        for deadline in upcoming_deadlines:
            due_date = datetime.strptime(deadline['due_date'], '%Y-%m-%d %H:%M:%S')
            days_remaining = (due_date - datetime.now()).days
            
            if days_remaining <= 1 and deadline['priority'] == 'high':
                urgency = 'urgent'
            elif days_remaining <= 2:
                urgency = 'important'
            else:
                urgency = 'normal'
            
            reminders.append({
                'deadline_id': deadline['id'],
                'title': deadline['title'],
                'due_date': deadline['due_date'],
                'days_remaining': days_remaining,
                'urgency': urgency,
                'category': deadline['category']
            })
        
        return reminders
