import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { Question } from "@/context/LocationContext";

interface CheckpointQuizProps {
  checkpointName: string;
  questions: Question[];
  onComplete: () => void;
  onSkip: () => void;
}

export const CheckpointQuiz: React.FC<CheckpointQuizProps> = ({
  checkpointName,
  questions,
  onComplete,
  onSkip,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Challenge: {checkpointName}</CardTitle>
        <CardDescription>
          Answer questions to unlock this checkpoint ({currentQuestionIndex + 1} of {questions.length})
        </CardDescription>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-secondary rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.text}</h3>

          {/* Options */}
          <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={(v) => setSelectedAnswer(parseInt(v))}>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={answered} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Feedback */}
        {answered && (
          <Alert className={isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Correct!</AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Incorrect. The correct answer is: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                  </AlertDescription>
                </>
              )}
            </div>
          </Alert>
        )}

        {/* Buttons */}
        <div className="flex gap-2 justify-between">
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>

          {!answered ? (
            <Button onClick={handleAnswer} disabled={selectedAnswer === null}>
              Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {isLastQuestion ? `Finish (${score}/${questions.length} correct)` : "Next Question"}
            </Button>
          )}
        </div>

        {/* Score display */}
        {answered && (
          <div className="text-center text-sm text-muted-foreground">
            Score: {score}/{questions.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
