import { base44 } from '@/api/base44Client';

export const automatedProjectOnboarding = async (project, client) => {
    try {
        // Define task templates by project type
        const taskTemplates = {
            logo_design: [
                { title: 'Initial Client Consultation', description: 'Discuss vision, preferences, and brand identity', estimated_hours: 2, priority: 'high', order_index: 0 },
                { title: 'Research & Inspiration Gathering', description: 'Collect design inspiration and competitor analysis', estimated_hours: 4, priority: 'medium', order_index: 1 },
                { title: 'Concept Sketches', description: 'Create initial logo concepts and sketches', estimated_hours: 8, priority: 'high', order_index: 2 },
                { title: 'Digital Design - Round 1', description: 'Develop 3 logo variations in digital format', estimated_hours: 10, priority: 'high', order_index: 3 },
                { title: 'Client Review & Feedback', description: 'Present concepts and gather client feedback', estimated_hours: 2, priority: 'high', order_index: 4 },
                { title: 'Revisions & Refinement', description: 'Refine selected concept based on feedback', estimated_hours: 6, priority: 'medium', order_index: 5 },
                { title: 'Final Deliverables', description: 'Prepare final logo files in multiple formats', estimated_hours: 3, priority: 'high', order_index: 6 }
            ],
            website_design: [
                { title: 'Discovery & Requirements', description: 'Define project scope, goals, and target audience', estimated_hours: 4, priority: 'high', order_index: 0 },
                { title: 'Sitemap & Information Architecture', description: 'Plan site structure and user flow', estimated_hours: 4, priority: 'high', order_index: 1 },
                { title: 'Wireframing', description: 'Create wireframes for key pages', estimated_hours: 8, priority: 'medium', order_index: 2 },
                { title: 'Design Mockups - Homepage', description: 'Design homepage mockup with branding', estimated_hours: 10, priority: 'high', order_index: 3 },
                { title: 'Design Mockups - Internal Pages', description: 'Design mockups for remaining pages', estimated_hours: 12, priority: 'high', order_index: 4 },
                { title: 'Client Review & Revisions', description: 'Present designs and incorporate feedback', estimated_hours: 6, priority: 'high', order_index: 5 },
                { title: 'Development Setup', description: 'Set up development environment and framework', estimated_hours: 4, priority: 'medium', order_index: 6 },
                { title: 'Front-end Development', description: 'Build responsive website pages', estimated_hours: 20, priority: 'high', order_index: 7 },
                { title: 'Testing & QA', description: 'Test across devices and browsers', estimated_hours: 6, priority: 'high', order_index: 8 },
                { title: 'Launch & Deployment', description: 'Deploy website to production', estimated_hours: 4, priority: 'high', order_index: 9 }
            ],
            branding: [
                { title: 'Brand Discovery Workshop', description: 'Understand brand values, mission, and target audience', estimated_hours: 3, priority: 'high', order_index: 0 },
                { title: 'Competitive Analysis', description: 'Research competitors and market positioning', estimated_hours: 4, priority: 'medium', order_index: 1 },
                { title: 'Brand Strategy Document', description: 'Define brand positioning and messaging', estimated_hours: 6, priority: 'high', order_index: 2 },
                { title: 'Logo Design', description: 'Create brand logo and variations', estimated_hours: 12, priority: 'high', order_index: 3 },
                { title: 'Color Palette & Typography', description: 'Develop brand color system and fonts', estimated_hours: 4, priority: 'medium', order_index: 4 },
                { title: 'Brand Guidelines', description: 'Create comprehensive brand style guide', estimated_hours: 8, priority: 'high', order_index: 5 },
                { title: 'Marketing Collateral', description: 'Design business cards, letterhead, etc.', estimated_hours: 10, priority: 'medium', order_index: 6 },
                { title: 'Final Brand Package', description: 'Compile and deliver all brand assets', estimated_hours: 4, priority: 'high', order_index: 7 }
            ],
            mockup: [
                { title: 'Project Brief & Requirements', description: 'Gather client requirements and preferences', estimated_hours: 2, priority: 'high', order_index: 0 },
                { title: 'Research & Inspiration', description: 'Collect design references and examples', estimated_hours: 2, priority: 'medium', order_index: 1 },
                { title: 'Generate Initial Mockups', description: 'Create first set of mockup variations', estimated_hours: 6, priority: 'high', order_index: 2 },
                { title: 'Client Review', description: 'Present mockups and gather feedback', estimated_hours: 1, priority: 'high', order_index: 3 },
                { title: 'Refinement & Revisions', description: 'Refine mockups based on feedback', estimated_hours: 4, priority: 'medium', order_index: 4 },
                { title: 'Final Mockup Delivery', description: 'Export and deliver final mockups', estimated_hours: 2, priority: 'high', order_index: 5 }
            ],
            full_package: [
                { title: 'Discovery & Strategy Session', description: 'Comprehensive brand and web strategy workshop', estimated_hours: 4, priority: 'high', order_index: 0 },
                { title: 'Brand Identity Development', description: 'Create logo, colors, and brand elements', estimated_hours: 16, priority: 'high', order_index: 1 },
                { title: 'Website Design', description: 'Design website mockups and pages', estimated_hours: 20, priority: 'high', order_index: 2 },
                { title: 'Client Presentations', description: 'Present brand and web designs for approval', estimated_hours: 4, priority: 'high', order_index: 3 },
                { title: 'Website Development', description: 'Build and develop the website', estimated_hours: 24, priority: 'high', order_index: 4 },
                { title: 'Brand Guidelines Creation', description: 'Document brand standards and usage', estimated_hours: 6, priority: 'medium', order_index: 5 },
                { title: 'Testing & Refinement', description: 'Test website and refine based on feedback', estimated_hours: 8, priority: 'high', order_index: 6 },
                { title: 'Launch & Delivery', description: 'Launch website and deliver brand assets', estimated_hours: 4, priority: 'high', order_index: 7 }
            ]
        };

        // Get tasks for project type
        const tasksToCreate = taskTemplates[project.project_type] || [
            { title: 'Project Kickoff Meeting', description: 'Initial meeting with client', estimated_hours: 2, priority: 'high', order_index: 0 },
            { title: 'Requirements Gathering', description: 'Document project requirements', estimated_hours: 4, priority: 'high', order_index: 1 },
            { title: 'Project Execution', description: 'Complete project deliverables', estimated_hours: 20, priority: 'high', order_index: 2 },
            { title: 'Client Review & Approval', description: 'Present work and get approval', estimated_hours: 2, priority: 'high', order_index: 3 },
            { title: 'Final Delivery', description: 'Deliver final project files', estimated_hours: 2, priority: 'high', order_index: 4 }
        ];

        // Calculate milestone dates
        const startDate = project.start_date ? new Date(project.start_date) : new Date();
        const dueDate = project.due_date ? new Date(project.due_date) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const projectDuration = (dueDate - startDate) / (1000 * 60 * 60 * 24);
        
        // Create tasks with calculated due dates
        const createdTasks = [];
        for (let i = 0; i < tasksToCreate.length; i++) {
            const taskTemplate = tasksToCreate[i];
            const taskProgress = (i + 1) / tasksToCreate.length;
            const taskDueDate = new Date(startDate.getTime() + (projectDuration * taskProgress * 24 * 60 * 60 * 1000));
            
            const task = await base44.entities.Task.create({
                title: taskTemplate.title,
                description: taskTemplate.description,
                project_id: project.id,
                status: i === 0 ? 'todo' : 'todo',
                priority: taskTemplate.priority,
                estimated_hours: taskTemplate.estimated_hours,
                due_date: taskDueDate.toISOString().split('T')[0],
                order_index: taskTemplate.order_index
            });
            createdTasks.push(task);
        }

        // Send welcome email to client
        const projectTypeNames = {
            logo_design: 'Logo Design',
            website_design: 'Website Design',
            branding: 'Branding Package',
            mockup: 'Mockup Creation',
            full_package: 'Full Package (Logo + Website)'
        };

        await base44.integrations.Core.SendEmail({
            to: client.email,
            subject: `Welcome! Your ${projectTypeNames[project.project_type] || 'Project'} is Ready to Begin`,
            body: `Dear ${client.name},

We're excited to start working on your ${projectTypeNames[project.project_type] || 'project'}: "${project.title}"!

Project Overview:
• Start Date: ${startDate.toLocaleDateString()}
• Target Completion: ${dueDate.toLocaleDateString()}
• Estimated Budget: $${project.budget?.toLocaleString() || 'TBD'}

We've set up ${createdTasks.length} tasks to ensure a smooth and organized workflow. You'll receive updates as we progress through each milestone.

Next Steps:
1. We'll schedule an initial consultation to discuss your vision
2. Review and approve the project timeline
3. Begin the creative process!

If you have any questions or need to share additional information, please don't hesitate to reach out.

Looking forward to creating something amazing together!

Best regards,
Your Project Team`
        });

        return {
            tasks: createdTasks,
            message: 'Project onboarding completed successfully'
        };
    } catch (error) {
        console.error('Project onboarding error:', error);
        throw error;
    }
};