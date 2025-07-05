
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import QuestionFormFields from './QuestionFormFields';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone' | 'dependent_select';

interface RegistrationQuestion {
  id: string;
  question_key: string;
  question_text: string;
  field_type: FieldType;
  options?: string[];
  required: boolean;
  order_index: number;
  conditional_parent?: string;
  conditional_value?: string;
  placeholder?: string;
  help_text?: string;
  dependent_options?: { [key: string]: string[] };
}

const RegistrationQuestionsManager: React.FC = () => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<RegistrationQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question_key: '',
    question_text: '',
    field_type: 'text' as FieldType,
    options: [] as string[],
    required: false,
    conditional_parent: '',
    conditional_value: '',
    placeholder: '',
    help_text: '',
    dependent_options: {} as { [key: string]: string[] }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    const savedQuestions = localStorage.getItem('registrationQuestions');
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        setQuestions(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing questions:', error);
        setQuestions([]);
      }
    }
  };

  const saveQuestions = (updatedQuestions: RegistrationQuestion[]) => {
    localStorage.setItem('registrationQuestions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const resetForm = () => {
    setQuestionForm({
      question_key: '',
      question_text: '',
      field_type: 'text',
      options: [],
      required: false,
      conditional_parent: '',
      conditional_value: '',
      placeholder: '',
      help_text: '',
      dependent_options: {}
    });
  };

  const handleAddQuestion = () => {
    if (!questionForm.question_key.trim() || !questionForm.question_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question key and text are required.",
        variant: "destructive"
      });
      return;
    }

    if (questions.some(q => q.question_key === questionForm.question_key.trim())) {
      toast({
        title: "Duplicate Key",
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: RegistrationQuestion = {
      id: Date.now().toString(),
      question_key: questionForm.question_key.trim(),
      question_text: questionForm.question_text.trim(),
      field_type: questionForm.field_type,
      options: questionForm.options.filter(Boolean),
      required: questionForm.required,
      order_index: questions.length,
      conditional_parent: questionForm.conditional_parent === 'none' ? '' : questionForm.conditional_parent,
      conditional_value: questionForm.conditional_value.trim(),
      placeholder: questionForm.placeholder.trim(),
      help_text: questionForm.help_text.trim(),
      dependent_options: questionForm.dependent_options
    };

    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
    
    toast({
      title: "Success",
      description: "Question added successfully!",
    });

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditQuestion = () => {
    if (!editingQuestion) return;

    if (!questionForm.question_key.trim() || !questionForm.question_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question key and text are required.",
        variant: "destructive"
      });
      return;
    }

    if (questions.some(q => q.id !== editingQuestion.id && q.question_key === questionForm.question_key.trim())) {
      toast({
        title: "Duplicate Key",
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    const updatedQuestion: RegistrationQuestion = {
      ...editingQuestion,
      question_key: questionForm.question_key.trim(),
      question_text: questionForm.question_text.trim(),
      field_type: questionForm.field_type,
      options: questionForm.options.filter(Boolean),
      required: questionForm.required,
      conditional_parent: questionForm.conditional_parent === 'none' ? '' : questionForm.conditional_parent,
      conditional_value: questionForm.conditional_value.trim(),
      placeholder: questionForm.placeholder.trim(),
      help_text: questionForm.help_text.trim(),
      dependent_options: questionForm.dependent_options
    };

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? updatedQuestion : q
    );
    saveQuestions(updatedQuestions);

    toast({
      title: "Success",
      description: "Question updated successfully!",
    });

    setEditingQuestion(null);
    resetForm();
  };

  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    saveQuestions(updatedQuestions);
    
    toast({
      title: "Success",
      description: "Question deleted successfully!",
    });
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];

    // Update order_index for all questions
    updatedQuestions.forEach((q, index) => {
      q.order_index = index;
    });

    saveQuestions(updatedQuestions);
  };

  const openEditDialog = (question: RegistrationQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_key: question.question_key,
      question_text: question.question_text,
      field_type: question.field_type,
      options: question.options || [],
      required: question.required,
      conditional_parent: question.conditional_parent || '',
      conditional_value: question.conditional_value || '',
      placeholder: question.placeholder || '',
      help_text: question.help_text || '',
      dependent_options: question.dependent_options || {}
    });
  };

  const sortedQuestions = [...questions].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Registration Questions Manager
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Manage the questions that appear in the user registration form
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Registration Question</DialogTitle>
                </DialogHeader>
                <QuestionFormFields
                  questionForm={questionForm}
                  setQuestionForm={setQuestionForm}
                  questions={questions}
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion} className="w-full sm:w-auto">
                    Add Question
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedQuestions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Questions Yet</h3>
              <p className="text-gray-500 mb-4">
                Start by adding your first registration question
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedQuestions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-lg">{question.question_text}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {question.field_type}
                          </Badge>
                          {question.required && (
                            <Badge className="bg-red-500 text-xs">Required</Badge>
                          )}
                          {question.conditional_parent && (
                            <Badge className="bg-blue-500 text-xs">Conditional</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Key:</span> {question.question_key}
                        </div>
                        <div>
                          <span className="font-medium">Order:</span> {index + 1}
                        </div>
                        {question.placeholder && (
                          <div className="sm:col-span-2">
                            <span className="font-medium">Placeholder:</span> {question.placeholder}
                          </div>
                        )}
                        {question.help_text && (
                          <div className="sm:col-span-2">
                            <span className="font-medium">Help Text:</span> {question.help_text}
                          </div>
                        )}
                        {question.conditional_parent && (
                          <div className="sm:col-span-2">
                            <span className="font-medium">Condition:</span> Show when "{question.conditional_parent}" equals "{question.conditional_value}"
                          </div>
                        )}
                        {(question.field_type === 'select' || question.field_type === 'dependent_select') && question.options && question.options.length > 0 && (
                          <div className="sm:col-span-2">
                            <span className="font-medium">Options:</span> {question.options.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveQuestion(question.id, 'up')}
                          disabled={index === 0}
                          className="flex-1 sm:flex-none"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveQuestion(question.id, 'down')}
                          disabled={index === sortedQuestions.length - 1}
                          className="flex-1 sm:flex-none"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditDialog(question)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Registration Question</DialogTitle>
                            </DialogHeader>
                            <QuestionFormFields
                              questionForm={questionForm}
                              setQuestionForm={setQuestionForm}
                              questions={questions}
                            />
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setEditingQuestion(null);
                                  resetForm();
                                }}
                                className="w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleEditQuestion} className="w-full sm:w-auto">
                                Update Question
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{question.question_text}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationQuestionsManager;
