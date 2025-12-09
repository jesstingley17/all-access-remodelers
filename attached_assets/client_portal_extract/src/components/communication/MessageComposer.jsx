
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Clock, 
  Paperclip, 
  Wand2,
  Eye,
  Calendar
} from "lucide-react";
import { Message, EmailTemplate } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function MessageComposer({ clients, projects, channels, onMessageSent }) {
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    channel_id: '',
    subject: '',
    content: '',
    priority: 'normal',
    scheduled_send_time: ''
  });
  const [templates, setTemplates] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await EmailTemplate.list();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template) => {
    const selectedClient = clients.find(c => c.id === formData.client_id);
    const selectedProject = projects.find(p => p.id === formData.project_id);
    
    let populatedSubject = template.subject;
    let populatedContent = template.content;
    
    // Replace placeholders
    if (selectedClient) {
      populatedSubject = populatedSubject.replace(/{{client_name}}/g, selectedClient.company_name);
      populatedContent = populatedContent.replace(/{{client_name}}/g, selectedClient.company_name);
      populatedContent = populatedContent.replace(/{{contact_name}}/g, selectedClient.primary_contact_name);
    }
    
    if (selectedProject) {
      populatedSubject = populatedSubject.replace(/{{project_title}}/g, selectedProject.title);
      populatedContent = populatedContent.replace(/{{project_title}}/g, selectedProject.title);
    }
    
    populatedContent = populatedContent.replace(/{{today_date}}/g, new Date().toLocaleDateString());
    
    setFormData(prev => ({
      ...prev,
      subject: populatedSubject,
      content: populatedContent
    }));
    setShowTemplateSelector(false);
  };

  const generateAIContent = async () => {
    if (!formData.client_id || !formData.subject) {
      alert('Please select a client and enter a subject first.');
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      const selectedProject = projects.find(p => p.id === formData.project_id);
      
      const prompt = `You are a professional communication expert. Write a high-quality business email for a freelancer based on current professional communication standards and best practices.

Client Details:
- Company: ${selectedClient.company_name}
- Contact: ${selectedClient.primary_contact_name}
- Industry: ${selectedClient.industry || 'Not specified'}
${selectedProject ? `- Project: ${selectedProject.title}` : ''}

Email Subject: ${formData.subject}

Research current professional email writing trends and create an email that is:
- Professionally written and appropriately toned
- Clear, concise, and action-oriented
- Personalized to the client relationship
- Following modern business communication standards

Generate only the email body content, no subject line needed.`;

      const response = await InvokeLLM({ 
        prompt,
        add_context_from_internet: true
      });
      setFormData(prev => ({ ...prev, content: response }));
    } catch (error) {
      console.error("Error generating AI content:", error);
      alert("Failed to generate AI content. Please try again.");
    }
    setIsGeneratingAI(false);
  };

  const handleSend = async () => {
    if (!formData.client_id || !formData.content) {
      alert('Please select a client and enter message content.');
      return;
    }
    
    setIsSending(true);
    try {
      const messageData = {
        ...formData,
        message_type: 'outgoing',
        sender_email: 'your@email.com', // This would come from user settings
        sender_name: 'Your Name', // This would come from user settings
        recipient_email: clients.find(c => c.id === formData.client_id)?.primary_contact_email,
        recipient_name: clients.find(c => c.id === formData.client_id)?.primary_contact_name,
        sent_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
        status: formData.scheduled_send_time ? 'scheduled' : 'read'
      };
      
      const newMessage = await Message.create(messageData);
      onMessageSent(newMessage);
      
      // Reset form
      setFormData({
        client_id: '',
        project_id: '',
        channel_id: '',
        subject: '',
        content: '',
        priority: 'normal',
        scheduled_send_time: ''
      });
      
      alert('Message sent successfully!');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
    setIsSending(false);
  };

  const availableProjects = projects.filter(p => p.client_id === formData.client_id);
  const emailChannels = channels.filter(c => c.channel_type === 'email' && c.is_active);

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Send className="w-5 h-5" />
          Compose Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Recipients & Channel */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Client *
              </label>
              <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Project (Optional)
              </label>
              <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)} disabled={!formData.client_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No specific project</SelectItem>
                  {availableProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Channel
              </label>
              <Select value={formData.channel_id} onValueChange={(value) => handleInputChange('channel_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {emailChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject & Priority */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Priority
              </label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template & AI Tools */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateAIContent}
              disabled={isGeneratingAI || !formData.client_id || !formData.subject}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGeneratingAI ? 'Generating...' : 'AI Generate'}
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <Input
                type="datetime-local"
                value={formData.scheduled_send_time}
                onChange={(e) => handleInputChange('scheduled_send_time', e.target.value)}
                className="w-48 h-8 text-sm"
                placeholder="Schedule send"
              />
            </div>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="grid md:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="md:col-span-2 mb-2">
                <h4 className="font-medium text-slate-800 mb-2">Email Templates</h4>
              </div>
              {templates.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="justify-start h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500">{template.category}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Message Content *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Type your message here..."
              rows={12}
              className="resize-none"
            />
            <div className="text-xs text-slate-500 mt-1">
              {formData.content.length} characters
            </div>
          </div>

          {/* Send Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              {formData.scheduled_send_time && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" disabled={isSending}>
                Save Draft
              </Button>
              <Button 
                onClick={handleSend}
                disabled={isSending || !formData.client_id || !formData.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : formData.scheduled_send_time ? 'Schedule Send' : 'Send Now'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
