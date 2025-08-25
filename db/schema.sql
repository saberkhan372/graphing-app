-- Database schema for Algebra 1 graphing app

-- User Management and Authentication
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    grade_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessibility_needs JSONB DEFAULT '{}'
);

-- Course and Content Management
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_title VARCHAR(255) NOT NULL,
    description TEXT,
    grade_level INTEGER,
    common_core_standards JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    lesson_title VARCHAR(255) NOT NULL,
    learning_objectives JSONB,
    common_core_alignment JSONB,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_duration_minutes INTEGER
);

-- Progress Tracking Core Schema
CREATE TABLE student_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    lesson_id INTEGER REFERENCES lessons(id),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','mastered')),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    mastery_score DECIMAL(3,2),
    time_spent_seconds INTEGER DEFAULT 0,
    attempts_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mathematical Interactions Tracking
CREATE TABLE math_interactions (
    id BIGSERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    lesson_id INTEGER REFERENCES lessons(id),
    interaction_type VARCHAR(50),
    equation_latex TEXT,
    graph_parameters JSONB,
    correct_answer BOOLEAN,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER
);

-- Adaptive Learning Data
CREATE TABLE learning_paths (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    current_lesson_id INTEGER REFERENCES lessons(id),
    recommended_next_lessons JSONB,
    learning_preferences JSONB,
    difficulty_adjustment DECIMAL(3,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment and Mastery Tracking
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id),
    assessment_type VARCHAR(50),
    questions JSONB,
    passing_score DECIMAL(3,2) DEFAULT 0.70
);

CREATE TABLE assessment_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    assessment_id INTEGER REFERENCES assessments(id),
    responses JSONB,
    score DECIMAL(5,2),
    time_taken_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Optimization Indexes
CREATE INDEX idx_student_progress_lookup ON student_progress(student_id, lesson_id);
CREATE INDEX idx_math_interactions_student_lesson ON math_interactions(student_id, lesson_id, timestamp);
CREATE INDEX idx_assessment_attempts_student ON assessment_attempts(student_id, completed_at);

