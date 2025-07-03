import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

type FieldType = 'text' | 'select' | 'checkbox' | 'textarea';

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
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    try {
      const storedQuestions = localStorage.getItem('registrationQuestions');
      const questionData = storedQuestions ? JSON.parse(storedQuestions) : [];
      setQuestions(questionData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registration questions",
        variant: "destructive"
      });
    }
  };

  const saveQuestions = (updatedQuestions: RegistrationQuestion[]) => {
    localStorage.setItem('registrationQuestions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    if (!questionForm.question_key || !questionForm.question_text) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields.",
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
      
      setQuestionForm({
        question_key: '',
        question_text: '',
        field_type: 'text',
        options: [],
        required: true,
        conditional_parent: 'none',
        conditional_value: '',
      });

      toast({
        title: "Question Added",
        description: "Registration question has been added successfully.",
      });
    } catch (error) {
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

      toast({
        title: "Question Updated",
        description: "Registration question has been updated successfully.",
      });
    } catch (error) {
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
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Registration Questions Manager
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Question Key (e.g., full_name, emirate)"
                  value={questionForm.question_key}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_key: e.target.value })}
                />
                <Input
                  placeholder="Question Text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                />
                <Select
                  value={questionForm.field_type}
                  onValueChange={(value: FieldType) => setQuestionForm({ ...questionForm, field_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>

                {questionForm.field_type === 'select' && (
                  <Textarea
                    placeholder="Options (one per line)"
                    value={questionForm.options.join('\n')}
                    onChange={(e) => setQuestionForm({ 
                      ...questionForm, 
                      options: e.target.value.split('\n').filter(Boolean) 
                    })}
                  />
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Conditional Logic (Optional)</h4>
                  <Select
                    value={questionForm.conditional_parent}
                    onValueChange={(value) => setQuestionForm({ ...questionForm, conditional_parent: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Show only if this field..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No condition</SelectItem>
                      {questions.filter(q => q.field_type === 'select').map(q => (
                        <SelectItem key={q.id} value={q.question_key}>
                          {q.question_text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {questionForm.conditional_parent && (
                    <Input
                      placeholder="...equals this value"
                      value={questionForm.conditional_value}
                      onChange={(e) => setQuestionForm({ ...questionForm, conditional_value: e.target.value })}
                    />
                  )}
                </div>

                <Button onClick={handleAddQuestion} disabled={loading} className="w-full">
                  Add Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {question.order_index}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{question.question_key}</TableCell>
                <TableCell className="max-w-xs truncate">{question.question_text}</TableCell>
                <TableCell>
                  <Badge variant="outline">{question.field_type}</Badge>
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
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        {editingQuestion && (
                          <div className="space-y-4">
                            <Input
                              value={editingQuestion.question_text}
                              onChange={(e) => setEditingQuestion({ 
                                ...editingQuestion, 
                                question_text: e.target.value 
                              })}
                            />
                            <Select
                              value={editingQuestion.field_type}
                              onValueChange={(value: FieldType) => setEditingQuestion({ 
                                ...editingQuestion, 
                                field_type: value 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {editingQuestion.field_type === 'select' && (
                              <Textarea
                                placeholder="Options (one per line)"
                                value={editingQuestion.options?.join('\n') || ''}
                                onChange={(e) => setEditingQuestion({ 
                                  ...editingQuestion, 
                                  options: e.target.value.split('\n').filter(Boolean) 
                                })}
                              />
                            )}
                            
                            <Button onClick={handleUpdateQuestion} className="w-full">
                              Update Question
                            </Button>
                          </div>
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
        
        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No registration questions configured. Add your first question to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationQuestionsManager;