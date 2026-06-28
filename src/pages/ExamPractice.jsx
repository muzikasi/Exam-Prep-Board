import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ExamPractice.css'
import { questionBank } from '../data/examQuestions'

const subjects = [
  { icon: '📐', name: 'Mathematics' },
  { icon: '⚛️', name: 'Physics' },
  { icon: '📚', name: 'English' },
  { icon: '🌍', name: 'History' },
  { icon: '🧪', name: 'Chemistry' },
  { icon: '📊', name: 'Economics' },
  { icon: '🧬', name: 'Biology' },
  { icon: '⚖️', name: 'Civics' },
  { icon: '🧠', name: 'Aptitude' },
]

const gradeOptions = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'University']

// Pulls the pre-written, unique 10-question set for a given subject + grade.
// Every (subject, grade) pair has its own hand-authored questions in examQuestions.js —
// nothing here generates, rotates, or relabels questions to fill gaps.
function buildSubjectQuestions(subject, grade) {
  const subjectBank = questionBank[subject] || questionBank.Mathematics
  const pool = subjectBank[grade] || subjectBank['Grade 9']

  return pool.map((item, index) => ({
    id: index + 1,
    question: item.question,
    options: item.options,
    correct: item.correct,
    explanation: item.explanation,
  }))
}

function ExamPractice() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('subject-select')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [currentQuestions, setCurrentQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showExplanation, setShowExplanation] = useState(false)

  const currentQuestion = currentQuestions[currentQuestionIndex]
  const totalQuestions = currentQuestions.length
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0

  const resultSummary =
    score <= 2
      ? { emoji: '😞', title: 'Needs more practice', text: 'A little more revision will make this feel much easier next time.', rank: 'Starter' }
      : score <= 5
        ? { emoji: '😐', title: 'Good effort', text: 'You are building momentum—keep going and your confidence will grow.', rank: 'Improving' }
        : score <= 7
          ? { emoji: '🙂', title: 'Nice work', text: 'You have a solid grasp and are on the right track.', rank: 'Solid' }
          : score <= 9
            ? { emoji: '😄', title: 'Great job', text: 'You answered most of them correctly—excellent focus.', rank: 'Excellent' }
            : { emoji: '🤩', title: 'Amazing!', text: 'You nailed it—this is a brilliant result.', rank: 'Master' }

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject)
    setSelectedGrade(null)
    setStage('grade-select')
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setShowExplanation(false)
    setCurrentQuestions([])
  }

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade)
  }

  const handleStartQuiz = () => {
    if (!selectedSubject || !selectedGrade) return
    setCurrentQuestions(buildSubjectQuestions(selectedSubject, selectedGrade))
    setStage('quiz')
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setShowExplanation(false)
  }

  const handleAnswerSelect = (optionIndex) => {
    if (!currentQuestion) return

    const isCorrect = optionIndex === currentQuestion.correct
    const nextAnswer = {
      questionId: currentQuestion.id,
      selected: optionIndex,
      correct: currentQuestion.correct,
    }

    const existingAnswerIndex = answers.findIndex((answer) => answer.questionId === currentQuestion.id)
    const nextAnswers = [...answers]

    if (existingAnswerIndex >= 0) {
      const wasCorrect = nextAnswers[existingAnswerIndex].selected === nextAnswers[existingAnswerIndex].correct
      if (wasCorrect && !isCorrect) {
        setScore((prev) => Math.max(0, prev - 1))
      } else if (!wasCorrect && isCorrect) {
        setScore((prev) => prev + 1)
      }
      nextAnswers[existingAnswerIndex] = nextAnswer
    } else {
      nextAnswers.push(nextAnswer)
      if (isCorrect) {
        setScore((prev) => prev + 1)
      }
    }

    setAnswers(nextAnswers)
    setShowExplanation(true)
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setShowExplanation(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setShowExplanation(false)
    } else {
      setStage('results')
    }
  }

  const handleRetry = () => {
    setStage('subject-select')
    setSelectedSubject(null)
    setSelectedGrade(null)
    setCurrentQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers([])
    setShowExplanation(false)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="exam-practice-page">
      <div className="exam-practice-header">
        <div>
          <p className="eyebrow">Practice mode</p>
          <h1>Exam Practice</h1>
          <p className="page-subtitle">Choose a subject, pick a grade, and test yourself with 10 unique questions.</p>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>← Home</button>
      </div>

      {stage === 'subject-select' && (
        <div className="subject-selection">
          <h2>Select a subject</h2>
          <div className="subject-grid">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                className={`subject-card ${selectedSubject === subject.name ? 'selected' : ''}`}
                onClick={() => handleSubjectSelect(subject.name)}
              >
                <span className="subject-icon">{subject.icon}</span>
                <span>{subject.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'grade-select' && selectedSubject && (
        <div className="subject-selection">
          <h2>Choose a grade for {selectedSubject}</h2>
          <div className="grade-grid">
            {gradeOptions.map((grade) => (
              <button
                key={grade}
                className={`grade-card ${selectedGrade === grade ? 'selected-grade' : ''}`}
                onClick={() => handleGradeSelect(grade)}
              >
                <span>{grade}</span>
                <small>{selectedGrade === grade ? 'Selected' : 'Tap to select'}</small>
              </button>
            ))}
          </div>
          <div className="quiz-actions">
            <button className="back-btn" onClick={() => setStage('subject-select')}>← Change subject</button>
            <button className="next-btn" onClick={handleStartQuiz} disabled={!selectedGrade}>
              Start quiz
            </button>
          </div>
        </div>
      )}

      {stage === 'quiz' && currentQuestion && (
        <div className="quiz-card">
          <div className="quiz-meta">
            <span>{selectedSubject}</span>
            <span>{selectedGrade}</span>
            <span>{currentQuestionIndex + 1}/{currentQuestions.length}</span>
          </div>

          <h2>{currentQuestion.question}</h2>
          <div className="options-grid">
            {currentQuestion.options.map((option, index) => {
              const currentAnswer = answers.find((answer) => answer.questionId === currentQuestion.id)
              const isSelected = currentAnswer?.selected === index
              const optionLabel = String.fromCharCode(65 + index)

              return (
                <button
                  key={`${currentQuestion.id}-${option}`}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="option-letter">{optionLabel}</span>
                  <span className="option-text">{option}</span>
                </button>
              )
            })}
          </div>

          {showExplanation && (
            (() => {
              const currentAnswer = answers.find((answer) => answer.questionId === currentQuestion.id)
              if (!currentAnswer) return null
              return (
                <div className="explanation-box">
                  <strong>{currentAnswer.selected === currentQuestion.correct ? 'Correct! ' : 'Not quite. '}</strong>
                  {currentQuestion.explanation}
                </div>
              )
            })()
          )}

          <div className="quiz-actions">
            <button className="back-btn" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </button>
            <button className="next-btn" onClick={handleNextQuestion}>
              {currentQuestionIndex === currentQuestions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {stage === 'results' && (
        <div className="results-card">
          <div className="result-summary">
            <div className="result-badge">{resultSummary.emoji}</div>
            <div>
              <h2>Quiz finished</h2>
              <p className="result-score">You scored {score} out of {totalQuestions} ({percentage}%).</p>
              <p className="result-rank">{resultSummary.rank}</p>
              <p className="result-feedback">{resultSummary.title}: {resultSummary.text}</p>
            </div>
          </div>

          <div className="review-list">
            {currentQuestions.map((question, index) => {
              const answer = answers.find((item) => item.questionId === question.id)
              const selectedOption = answer ? question.options[answer.selected] : 'Not answered'
              const isCorrect = answer?.selected === question.correct

              return (
                <div key={question.id} className="review-item">
                  <div className="review-header">
                    <span className="review-number">{index + 1}. {question.question}</span>
                    <span className={`review-result ${isCorrect ? 'review-correct' : 'review-incorrect'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="review-answer">
                    <strong>Your answer:</strong> {selectedOption}
                  </p>
                  {!isCorrect && (
                    <p className="review-explanation">
                      <strong>Correct answer:</strong> {question.options[question.correct]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="quiz-actions">
            <button className="back-btn" onClick={handleRetry}>Try again</button>
            <button className="next-btn" onClick={handleBackToHome}>Back to home</button>
            {score <= 2 && (
              <button
                className="btn-primary"
                onClick={() => navigate('/books', { state: { preselectGrade: selectedGrade } })}
                style={{ marginLeft: 12 }}
              >
                Recommended books for {selectedGrade || 'your grade'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamPractice
