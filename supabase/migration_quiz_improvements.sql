-- Quiz improvements: intentos, preguntas random, nota 0-7

-- Límite de intentos por quiz (default 2)
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_attempts   INT NOT NULL DEFAULT 2;

-- Cuántas preguntas aleatorias se entregan por intento (NULL = todas)
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS questions_per_attempt INT;

-- Campo passed faltaba en quiz_attempts
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS passed BOOLEAN;

-- Backfill passed basado en score vs pass_score
UPDATE quiz_attempts qa
SET passed = (qa.score >= (SELECT pass_score FROM quizzes WHERE id = qa.quiz_id))
WHERE passed IS NULL;

-- Explicaciones en quiz_questions (además de en question_bank_keys)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
