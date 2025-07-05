
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, Settings } from 'lucide-react';
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
    dependent_options: {} as { [key: string]: string[] },
  });
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    try {
      const storedQuestions = localStorage.getItem('registrationQuestions');
      if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        setQuestions(questionData.sort((a: RegistrationQuestion, b: RegistrationQuestion) => a.order_index - b.order_index));
      } else {
        // Initialize with default questions
        const defaultQuestions: RegistrationQuestion[] = [
          {
            id: '1',
            question_key: 'full_name',
            question_text: 'Full Name',
            field_type: 'text',
            required: true,
            order_index: 1,
            placeholder: 'Enter your full name'
          },
          {
            id: '2', 
            question_key: 'email',
            question_text: 'Email Address',
            field_type: 'email',
            required: true,
            order_index: 2,
            placeholder: 'Enter your email address'
          },
          {
            id: '3',
            question_key: 'mobile_no',
            question_text: 'Mobile Number',
            field_type: 'phone',
            required: true,
            order_index: 3,
            placeholder: 'Enter your mobile number'
          },
          {
            id: '4',
            question_key: 'emirate',
            question_text: 'Emirate',
            field_type: 'select',
            options: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
            required: true,
            order_index: 4
          },
          {
            id: '5',
            question_key: 'mandalam',
            question_text: 'Mandalam',
            field_type: 'select',
            options: ['BALUSHERI', 'KUNNAMANGALAM', 'KODUVALLI', 'NADAPURAM', 'KOYLANDI', 'VADAKARA', 'BEPUR', 'KUTTIYADI'],
            required: true,
            order_index: 5
          }
        ];
        localStorage.setItem('registrationQuestions', JSON.stringify(defaultQuestions));
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load registration questions",
        variant: "destructive"
      });
    }
  };

  const saveQuestions = (updatedQuestions: RegistrationQuestion[]) => {
    try {
      // Re-index questions to ensure proper ordering
      const reindexedQuestions = updatedQuestions
        .sort((a, b) => a.order_index - b.order_index)
        .map((q, index) => ({ ...q, order_index: index + 1 }));
      
      localStorage.setItem('registrationQuestions', JSON.stringify(reindexedQuestions));
      setQuestions(reindexedQuestions);
      console.log('Questions saved successfully:', reindexedQuestions);
    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: "Error",
        description: "Failed to save questions",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
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
      dependent_options: {},
    });
  };

  const validateForm = () => {
    if (!questionForm.question_key.trim() || !questionForm.question_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question key and text are required.",
        variant: "destructive"
      });
      return false;
    }

    // Validate question key format (lowercase with underscores)
    if (!/^[a-z_]+$/.test(questionForm.question_key)) {
      toast({
        title: "Invalid Question Key",
        description: "Question key should only contain lowercase letters and underscores.",
        variant: "destructive"
      });
      return false;
    }

    // Validate select and dependent_select have options
    if (['select', 'dependent_select'].includes(questionForm.field_type) && questionForm.options.length === 0) {
      toast({
        title: "Missing Options",
        description: "Select and dependent select fields must have at least one option.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleAddQuestion = () => {
    if (!validateForm()) return;

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
        question_key: questionForm.question_key,
        question_text: questionForm.question_text,
        field_type: questionForm.field_type,
        options: ['select', 'dependent_select'].includes(questionForm.field_type) ? questionForm.options : undefined,
        required: questionForm.required,
        order_index: questions.length + 1,
        conditional_parent: questionForm.conditional_parent === 'none' ? undefined : questionForm.conditional_parent,
        conditional_value: questionForm.conditional_value || undefined,
        placeholder: questionForm.placeholder || undefined,
        help_text: questionForm.help_text || undefined,
        dependent_options: questionForm.field_type === 'dependent_select' ? questionForm.dependent_options : undefined,
      };

      const updatedQuestions = [...questions, newQuestion];
      saveQuestions(updatedQuestions);
      
      resetForm();
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

  const handleEditQuestion = (question: RegistrationQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_key: question.question_key,
      question_text: question.question_text,
      field_type: question.field_type,
      options: question.options || [],
      required: question.required,
      conditional_parent: question.conditional_parent || 'none',
      conditional_value: question.conditional_value || '',
      placeholder: question.placeholder || '',
      help_text: question.help_text || '',
      dependent_options: question.dependent_options || {},
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;
    if (!validateForm()) return;

    // Check for duplicate question key (excluding current question)
    if (questions.some(q => q.question_key === questionForm.question_key && q.id !== editingQuestion.id)) {
      toast({
        title: "Duplicate Key", 
        description: "A question with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updatedQuestion: RegistrationQuestion = {
        ...editingQuestion,
        question_key: questionForm.question_key,
        question_text: questionForm.question_text,
        field_type: questionForm.field_type,
        options: ['select', 'dependent_select'].includes(questionForm.field_type) ? questionForm.options : undefined,
        required: questionForm.required,
        conditional_parent: questionForm.conditional_parent === 'none' ? undefined : questionForm.conditional_parent,
        conditional_value: questionForm.conditional_value || undefined,
        placeholder: questionForm.placeholder || undefined,
        help_text: questionForm.help_text || undefined,
        dependent_options: questionForm.field_type === 'dependent_select' ? questionForm.dependent_options : undefined,
      };

      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? updatedQuestion : q
      );
      
      saveQuestions(updatedQuestions);
      setEditingQuestion(null);
      setIsEditDialogOpen(false);
      resetForm();

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

  const handleDeleteQuestion = (id: string, questionKey: string) => {
    // Prevent deletion of core required questions
    const coreQuestions = ['full_name', 'email', 'mobile_no', 'emirate', 'mandalam'];
    if (coreQuestions.includes(questionKey)) {
      toast({
        title: "Cannot Delete",
        description: "This is a core required field and cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

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

    // Update order_index for both questions
    updatedQuestions[currentIndex].order_index = currentIndex + 1;
    updatedQuestions[newIndex].order_index = newIndex + 1;

    saveQuestions(updatedQuestions);

    toast({
      title: "Question Moved",
      description: `Question moved ${direction}.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Registration Questions Manager
            </div>
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                  >
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
                    <TableHead>Conditional</TableHead>
                    <TableHead className="w-48">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <span className="font-medium">{question.order_index}</span>
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
                          {question.help_text && (
                            <p className="text-sm text-blue-500">
                              Help: {question.help_text}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.field_type.replace('_', ' ')}
                        </Badge>
                        {question.options && (
                          <p className="text-xs text-gray-500 mt-1">
                            {question.options.length} options
                          </p>
                        )}
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
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            title="Edit question"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteQuestion(question.id, question.question_key)}
                            title="Delete question"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Registration Question</DialogTitle>
          </DialogHeader>
          <QuestionFormFields
            questionForm={questionForm}
            setQuestionForm={setQuestionForm}
            questions={questions}
          />
          <div className="flex justify-end space-x-2 pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingQuestion(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} disabled={loading}>
              {loading ? 'Updating...' : 'Update Question'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationQuestionsManager;
