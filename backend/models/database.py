import sqlite3
import os
from datetime import datetime
import bcrypt

DATABASE_PATH = 'topper_ai_mentor.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with all required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            student_id TEXT UNIQUE,
            course TEXT,
            year INTEGER,
            specialization TEXT,
            learning_preferences TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    # Chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            domain TEXT DEFAULT 'general',
            confidence_score REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Doubts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doubts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            doubt_text TEXT NOT NULL,
            context TEXT,
            resolution TEXT,
            status TEXT DEFAULT 'pending',
            domain TEXT,
            priority TEXT DEFAULT 'medium',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Deadlines table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deadlines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            due_date TIMESTAMP NOT NULL,
            priority TEXT DEFAULT 'medium',
            category TEXT DEFAULT 'assignment',
            status TEXT DEFAULT 'pending',
            reminder_sent BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Learning progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            domain TEXT NOT NULL,
            progress_percentage REAL DEFAULT 0.0,
            time_spent INTEGER DEFAULT 0,
            last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            difficulty_level TEXT DEFAULT 'beginner',
            performance_score REAL DEFAULT 0.0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Recommendations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            domain TEXT NOT NULL,
            recommendation_type TEXT NOT NULL,
            content_url TEXT,
            description TEXT,
            confidence_score REAL,
            is_viewed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User interactions table (for ML model training)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            interaction_type TEXT NOT NULL,
            content_id TEXT,
            content_type TEXT,
            rating INTEGER,
            feedback TEXT,
            duration INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            project_type TEXT NOT NULL,
            domain TEXT NOT NULL,
            status TEXT DEFAULT 'planning',
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            github_url TEXT,
            drive_folder_id TEXT,
            mentor_assigned TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Voice queries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS voice_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            audio_file_path TEXT,
            transcribed_text TEXT,
            confidence_score REAL,
            processing_time REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

def create_user(email, password, first_name, last_name, student_id=None, course=None, year=None):
    """Create a new user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    try:
        cursor.execute('''
            INSERT INTO users (email, password_hash, first_name, last_name, student_id, course, year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (email, password_hash, first_name, last_name, student_id, course, year))
        
        user_id = cursor.lastrowid
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def verify_user(email, password):
    """Verify user credentials"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, password_hash FROM users WHERE email = ? AND is_active = TRUE', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
        return user['id']
    return None

def get_user_by_id(user_id):
    """Get user details by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, email, first_name, last_name, student_id, course, year, 
               specialization, learning_preferences, created_at
        FROM users WHERE id = ? AND is_active = TRUE
    ''', (user_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return dict(user)
    return None

def save_chat_history(user_id, message, response, domain='general', confidence_score=None):
    """Save chat interaction to history"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO chat_history (user_id, message, response, domain, confidence_score)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, message, response, domain, confidence_score))
    
    conn.commit()
    conn.close()

def get_user_chat_history(user_id, limit=50):
    """Get user's chat history"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT message, response, domain, confidence_score, created_at
        FROM chat_history 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ''', (user_id, limit))
    
    history = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in history]

def save_user_interaction(user_id, interaction_type, content_id=None, content_type=None, 
                         rating=None, feedback=None, duration=None):
    """Save user interaction for ML model training"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO user_interactions 
        (user_id, interaction_type, content_id, content_type, rating, feedback, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, interaction_type, content_id, content_type, rating, feedback, duration))
    
    conn.commit()
    conn.close()

def get_user_by_email(email):
    """Get user by email"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, email, password_hash, first_name, last_name, student_id, 
               course, year, specialization, created_at
        FROM users WHERE email = ? AND is_active = TRUE
    ''', (email,))
    
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # Convert to dict and create full_name
        user_dict = dict(user)
        user_dict['full_name'] = f"{user_dict['first_name']} {user_dict['last_name']}"
        user_dict['semester'] = user_dict['year']  # Map year to semester for compatibility
        user_dict['course'] = user_dict['course'] or ''
        return user_dict
    return None

def create_user(email, password_hash, full_name, student_id, course='', semester=1):
    """Create a new user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Split full name into first and last name
    name_parts = full_name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    cursor.execute('''
        INSERT INTO users (email, password_hash, first_name, last_name, student_id, course, year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (email, password_hash, first_name, last_name, student_id, course, semester))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return user_id

def update_user(user_id, update_data):
    """Update user information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build dynamic update query
    set_clauses = []
    values = []
    
    for field, value in update_data.items():
        if field == 'full_name':
            # Split full name into first and last name
            name_parts = value.split(' ', 1)
            set_clauses.extend(['first_name = ?', 'last_name = ?'])
            values.extend([name_parts[0], name_parts[1] if len(name_parts) > 1 else ''])
        elif field == 'semester':
            set_clauses.append('year = ?')
            values.append(value)
        else:
            set_clauses.append(f'{field} = ?')
            values.append(value)
    
    if not set_clauses:
        return False
    
    set_clauses.append('updated_at = CURRENT_TIMESTAMP')
    values.append(user_id)
    
    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
    
    cursor.execute(query, values)
    success = cursor.rowcount > 0
    
    conn.commit()
    conn.close()
    
    return success

def get_user_interactions(user_id, limit=50):
    """Get user interactions"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT interaction_type, content_type, rating, feedback, duration, created_at
        FROM user_interactions 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ''', (user_id, limit))
    
    interactions = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in interactions]

def get_user_deadlines(user_id, upcoming_only=False):
    """Get user deadlines"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT title, due_date as deadline, status, category, created_at
        FROM deadlines 
        WHERE user_id = ?
    '''
    
    if upcoming_only:
        query += ' AND due_date > datetime("now") AND status != "completed"'
    
    query += ' ORDER BY due_date ASC'
    
    cursor.execute(query, (user_id,))
    deadlines = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in deadlines]

def get_user_learning_progress(user_id):
    """Get user learning progress"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get basic progress stats
    cursor.execute('''
        SELECT 
            COUNT(*) as total_interactions,
            COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_interactions,
            AVG(rating) as average_rating
        FROM user_interactions 
        WHERE user_id = ? AND rating IS NOT NULL
    ''', (user_id,))
    
    stats = cursor.fetchone()
    
    # Get domain-wise progress
    cursor.execute('''
        SELECT domain, COUNT(*) as count, AVG(confidence_score) as avg_confidence
        FROM chat_history 
        WHERE user_id = ?
        GROUP BY domain
    ''', (user_id,))
    
    domain_progress = cursor.fetchall()
    conn.close()
    
    return {
        'overall_stats': dict(stats) if stats else {},
        'domain_progress': [dict(row) for row in domain_progress]
    }

def get_user_projects(user_id):
    """Get user projects"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, description, project_type as type, domain, status, 
               start_date, end_date, github_url, created_at
        FROM projects 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ''', (user_id,))
    
    projects = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in projects]

def create_project(user_id, title, description=None, deadline=None, project_type='assignment'):
    """Create a new project"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO projects (user_id, title, description, project_type, domain, end_date)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, title, description, project_type, 'general', deadline))
    
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return project_id

if __name__ == '__main__':
    init_db()
