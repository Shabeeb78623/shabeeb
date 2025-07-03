
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical, Eye } from 'lucide-react';
import QuestionFormFields from './QuestionFormFields';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone';

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
}

const RegistrationQuestionsManager: React.FC = () => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<RegistrationQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question_key: '',
    question_text: '',
    field_type: 'text' as FieldType,
    options: [] as string[],
    required: true,
    conditional_parent: 'none',
    conditional_value: '',
    placeholder: '',
    help_text: '',
  });
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    try {
      const storedQuestions = localStorage.getItem('registrationQuestions');
      const questionData = storedQuestions ? JSON.parse(storedQuestions) : [];
      setQuestions(questionData.sort((a: RegistrationQuestion, b: RegistrationQuestion) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registration questions",
        variant: "destructive"
      });
    }
  };

  const saveQuestions = (updatedQuestions: RegistrationQuestion[]) => {
    try {
      localStorage.setItem('registrationQuestions', JSON.stringify(updatedQuestions));
      setQuestions(updatedQuestions.sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: "Error",
        description: "Failed to save questions",
        variant: "destructive"
      });
    }
  };

  const handleAddQuestion = () => {
    if (!questionForm.question_key.trim() || !questionForm.question_text.trim()) {
      toast({
        title: "Invalid Input",
        description: "Question key and text are required.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate question key
    if (questions.some(q => q.question_key === questionForm.question_key)) {
      toast({
        title: "Duplicate Key",
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newQuestion: RegistrationQuestion = {
        id: Date.now().toString(),
        ...questionForm,
        order_index: questions.length + 1,
        options: questionForm.field_type === 'select' ? questionForm.options : undefined,
        conditional_parent: questionForm.conditional_parent === 'none' ? undefined : questionForm.conditional_parent,
        conditional_value: questionForm.conditional_value || undefined,
      };

      const updatedQuestions = [...questions, newQuestion];
      saveQuestions(updatedQuestions);
      
      // Reset form
      setQuestionForm({
        question_key: '',
        question_text: '',
        field_type: 'text',
        options: [],
        required: true,
        conditional_parent: 'none',
        conditional_value: '',
        placeholder: '',
        help_text: '',
      });

      setIsAddDialogOpen(false);

      toast({
        title: "Question Added",
        description: "Registration question has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      );
      saveQuestions(updatedQuestions);
      setEditingQuestion(null);
      setIsEditDialogOpen(false);

      toast({
        title: "Question Updated",
        description: "Registration question has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setLoading(true);
    try {
      const updatedQuestions = questions.filter(q => q.id !== id);
      saveQuestions(updatedQuestions);

      toast({
        title: "Question Deleted",
        description: "Registration question has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];

    // Update order indices
    updatedQuestions.forEach((question, index) => {
      question.order_index = index + 1;
    });

    saveQuestions(updatedQuestions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Registration Questions Manager</span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                <div className="flex justify-end space-x-2 pt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Question'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions configured</h3>
              <p className="text-gray-500 mb-6">
                Add your first registration question to customize the user registration form.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{question.order_index}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {question.question_key}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium">{question.question_text}</p>
                          {question.placeholder && (
                            <p className="text-sm text-gray-500">
                              Placeholder: {question.placeholder}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.field_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={question.required ? "default" : "secondary"}>
                          {question.required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {question.conditional_parent && (
                          <Badge variant="outline" className="text-xs">
                            If {question.conditional_parent} = {question.conditional_value}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveQuestion(question.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                          >
                            ↓
                          </Button>
                          <Dialog open={isEditDialogOpen && editingQuestion?.id === question.id} 
                                 onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingQuestion(question)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Question</DialogTitle>
                              </DialogHeader>
                              {editingQuestion && (
                                <>
                                  <QuestionFormFields
                                    questionForm={{
                                      question_key: editingQuestion.question_key,
                                      question_text: editingQuestion.question_text,
                                      field_type: editingQuestion.field_type,
                                      options: editingQuestion.options || [],
                                      required: editingQuestion.required,
                                      conditional_parent: editingQuestion.conditional_parent || 'none',
                                      conditional_value: editingQuestion.conditional_value || '',
                                      placeholder: editingQuestion.placeholder || '',
                                      help_text: editingQuestion.help_text || '',
                                    }}
                                    setQuestionForm={(form) => setEditingQuestion({
                                      ...editingQuestion,
                                      ...form,
                                      conditional_parent: form.conditional_parent === 'none' ? undefined : form.conditional_parent,
                                    })}
                                    questions={questions}
                                  />
                                  <div className="flex justify-end space-x-2 pt-6">
                                    <Button variant="outline" onClick={() => {
                                      setIsEditDialogOpen(false);
                                      setEditingQuestion(null);
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateQuestion} disabled={loading}>
                                      {loading ? 'Updating...' : 'Update Question'}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationQuestionsManager;
