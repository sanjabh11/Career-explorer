import React, { useState, useEffect } from 'react';
import { DataCard } from '../shared/DataCard';
import { Badge } from '../shared/Badge';
import { CircularProgress } from '../shared/CircularProgress';

interface Assessment {
  id: number;
  name: string;
  description: string;
  assessment_type: string;
  difficulty_level: number;
  duration: number;
  passing_score: number;
  questions: {
    id: number;
    question: string;
    type: string;
    options?: string[];
    correct_answer?: string;
    points: number;
  }[];
  rubric: {
    criteria: string;
    weight: number;
    description: string;
  }[];
  prerequisites: {
    skill: string;
    level: number;
  }[];
  certification: {
    name: string;
    issuer: string;
    validity: string;
    benefits: string[];
  };
  validity_period: number;
}

interface SkillAssessmentProps {
  skillId: number;
  userId: string;
  onAssessmentComplete?: (result: any) => void;
}

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  skillId,
  userId,
  onAssessmentComplete
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v2/skill-progression/assessments/${skillId}`);
        if (!response.ok) throw new Error('Failed to fetch assessments');
        const data = await response.json();
        setAssessments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [skillId]);

  const startAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers({});
    setAssessmentStatus('in_progress');
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (!selectedAssessment) return;
    
    if (currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = async () => {
    if (!selectedAssessment) return;

    try {
      const result = calculateResult();
      
      // Submit assessment results
      const response = await fetch('/api/v2/skill-progression/assessment-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skill_id: skillId,
          assessment_id: selectedAssessment.id,
          answers,
          score: result.score,
          passed: result.passed,
          completed_at: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to submit assessment results');

      setAssessmentStatus('completed');
      if (onAssessmentComplete) {
        onAssessmentComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    }
  };

  const calculateResult = () => {
    if (!selectedAssessment) return { score: 0, passed: false };

    let totalPoints = 0;
    let earnedPoints = 0;

    selectedAssessment.questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correct_answer) {
        earnedPoints += question.points;
      }
    });

    const score = (earnedPoints / totalPoints) * 100;
    return {
      score,
      passed: score >= selectedAssessment.passing_score
    };
  };

  if (loading) return <div className="animate-pulse">Loading assessments...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {assessmentStatus === 'pending' && (
        <DataCard title="Available Assessments">
          <div className="space-y-4">
            {assessments.map(assessment => (
              <div
                key={assessment.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{assessment.name}</h4>
                    <p className="text-sm text-gray-600">{assessment.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge
                      text={`${assessment.duration} min`}
                      variant="secondary"
                    />
                    <Badge
                      text={`Level ${assessment.difficulty_level}`}
                      variant={
                        assessment.difficulty_level > 7
                          ? 'danger'
                          : assessment.difficulty_level > 4
                          ? 'warning'
                          : 'success'
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge text={assessment.assessment_type} variant="primary" />
                  <Badge
                    text={`${assessment.questions.length} questions`}
                    variant="primary"
                  />
                  <Badge
                    text={`Pass: ${assessment.passing_score}%`}
                    variant="secondary"
                  />
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => startAssessment(assessment)}
                >
                  Start Assessment
                </button>
              </div>
            ))}
          </div>
        </DataCard>
      )}

      {assessmentStatus === 'in_progress' && selectedAssessment && (
        <div className="space-y-6">
          <DataCard title="Assessment Progress">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  Question {currentQuestion + 1} of {selectedAssessment.questions.length}
                </span>
                <Badge
                  text={`${Math.round((currentQuestion + 1) / selectedAssessment.questions.length * 100)}%`}
                  variant="primary"
                />
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / selectedAssessment.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </DataCard>

          <DataCard title={`Question ${currentQuestion + 1}`}>
            <div className="space-y-4">
              <p className="text-lg">
                {selectedAssessment.questions[currentQuestion].question}
              </p>
              {selectedAssessment.questions[currentQuestion].type === 'multiple_choice' && (
                <div className="space-y-2">
                  {selectedAssessment.questions[currentQuestion].options?.map(
                    (option, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option}
                          checked={answers[selectedAssessment.questions[currentQuestion].id] === option}
                          onChange={() =>
                            handleAnswer(selectedAssessment.questions[currentQuestion].id, option)
                          }
                          className="form-radio"
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={nextQuestion}
                  disabled={!answers[selectedAssessment.questions[currentQuestion].id]}
                >
                  {currentQuestion === selectedAssessment.questions.length - 1
                    ? 'Complete'
                    : 'Next'}
                </button>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {assessmentStatus === 'completed' && (
        <DataCard title="Assessment Complete">
          <div className="space-y-6 text-center">
            <div className="w-32 h-32 mx-auto">
              <CircularProgress
                value={calculateResult().score}
                maxValue={100}
                label="Score"
                color={calculateResult().passed ? 'green' : 'red'}
              />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">
                {calculateResult().passed ? 'Congratulations!' : 'Keep Learning'}
              </h3>
              <p className="text-gray-600">
                {calculateResult().passed
                  ? 'You have successfully passed the assessment.'
                  : 'Continue practicing to improve your skills.'}
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => setAssessmentStatus('pending')}
            >
              Back to Assessments
            </button>
          </div>
        </DataCard>
      )}
    </div>
  );
};
