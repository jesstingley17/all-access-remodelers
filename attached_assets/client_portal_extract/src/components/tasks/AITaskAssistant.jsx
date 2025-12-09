import { base44 } from '@/api/base44Client';

export const generateSubtasks = async (task, projectContext = '') => {
    try {
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert project manager. Break down this task into actionable subtasks.

Task: ${task.title}
Description: ${task.description || 'No description provided'}
Priority: ${task.priority || 'medium'}
${projectContext ? `Project Context: ${projectContext}` : ''}

Create 3-7 specific, actionable subtasks that would help complete this task. Each subtask should be concrete and measurable.`,
            response_json_schema: {
                type: "object",
                properties: {
                    subtasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                estimated_hours: { type: "number" },
                                order_index: { type: "number" }
                            }
                        }
                    },
                    suggested_dependencies: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return response.subtasks || [];
    } catch (error) {
        console.error('Error generating subtasks:', error);
        return [];
    }
};

export const predictCompletionTime = async (task, teamMemberExperience = 'intermediate', recentTaskHistory = []) => {
    try {
        const historyContext = recentTaskHistory.length > 0 
            ? `Recent similar tasks took: ${recentTaskHistory.map(t => `${t.actual_hours || t.estimated_hours}h`).join(', ')}`
            : '';

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert in software project estimation. Predict realistic completion time for this task.

Task: ${task.title}
Description: ${task.description || 'No description provided'}
Priority: ${task.priority || 'medium'}
Initial Estimate: ${task.estimated_hours || 'Not provided'}h
Team Member Experience: ${teamMemberExperience}
${historyContext}

Consider:
- Task complexity and scope
- Potential blockers and dependencies
- Buffer time for testing and revisions
- Historical data trends
- Team member experience level

Provide a realistic time estimate with confidence level.`,
            response_json_schema: {
                type: "object",
                properties: {
                    predicted_hours: { type: "number" },
                    confidence_level: { type: "string", enum: ["low", "medium", "high"] },
                    reasoning: { type: "string" },
                    risk_factors: {
                        type: "array",
                        items: { type: "string" }
                    },
                    buffer_recommendation: { type: "number" }
                }
            }
        });

        return response;
    } catch (error) {
        console.error('Error predicting completion time:', error);
        return null;
    }
};

export const suggestAssignments = async (task, availableTeamMembers = [], projectContext = '') => {
    try {
        if (availableTeamMembers.length === 0) {
            return {
                suggestions: [],
                reasoning: 'No team members available for assignment'
            };
        }

        const teamMembersInfo = availableTeamMembers.map(member => ({
            id: member.id,
            name: member.full_name || member.email,
            current_workload: member.current_tasks_count || 0,
            skills: member.skills || [],
            availability: member.availability || 'available'
        }));

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert resource manager. Suggest the best team member to assign this task to.

Task: ${task.title}
Description: ${task.description || 'No description provided'}
Priority: ${task.priority || 'medium'}
Estimated Hours: ${task.estimated_hours || 'TBD'}h
${projectContext ? `Project Context: ${projectContext}` : ''}

Available Team Members:
${JSON.stringify(teamMembersInfo, null, 2)}

Consider:
- Task requirements and complexity
- Team member skills and experience
- Current workload balance
- Availability and capacity
- Priority alignment

Recommend the top 2-3 best matches with reasoning.`,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                member_id: { type: "string" },
                                member_name: { type: "string" },
                                match_score: { type: "number" },
                                reasoning: { type: "string" },
                                estimated_capacity: { type: "string" }
                            }
                        }
                    },
                    overall_recommendation: { type: "string" }
                }
            }
        });

        return response;
    } catch (error) {
        console.error('Error suggesting assignments:', error);
        return null;
    }
};

export const analyzeTaskComplexity = async (task) => {
    try {
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze the complexity of this task and provide insights.

Task: ${task.title}
Description: ${task.description || 'No description provided'}

Rate the complexity on multiple dimensions and provide actionable insights.`,
            response_json_schema: {
                type: "object",
                properties: {
                    overall_complexity: { type: "string", enum: ["low", "medium", "high", "very_high"] },
                    technical_complexity: { type: "number", minimum: 1, maximum: 5 },
                    scope_clarity: { type: "number", minimum: 1, maximum: 5 },
                    dependencies_complexity: { type: "number", minimum: 1, maximum: 5 },
                    key_challenges: {
                        type: "array",
                        items: { type: "string" }
                    },
                    recommended_approach: { type: "string" },
                    should_break_down: { type: "boolean" }
                }
            }
        });

        return response;
    } catch (error) {
        console.error('Error analyzing task complexity:', error);
        return null;
    }
};