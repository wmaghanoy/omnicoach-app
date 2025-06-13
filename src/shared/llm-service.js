const axios = require('axios');
const { LLMUsageModel, SettingsModel } = require('./models');

class LLMService {
  constructor() {
    this.ollamaBaseUrl = 'http://localhost:11434';
    this.defaultOllamaModel = 'mistral';
  }

  async generateResponse(prompt, context = {}, options = {}) {
    const provider = options.provider || await this.getDefaultProvider();
    const personality = options.personality || 'Coach';
    
    const startTime = Date.now();
    
    try {
      let response;
      let usage = {
        provider,
        request_type: options.requestType || 'chat',
        response_time: 0,
        tokens_input: 0,
        tokens_output: 0,
        cost: 0
      };

      const systemPrompt = this.getPersonalityPrompt(personality);
      const enhancedPrompt = this.buildPrompt(systemPrompt, prompt, context);

      if (provider === 'ollama') {
        response = await this.queryOllama(enhancedPrompt, options.model || this.defaultOllamaModel);
        usage.model = options.model || this.defaultOllamaModel;
        usage.tokens_input = this.estimateTokens(enhancedPrompt);
        usage.tokens_output = this.estimateTokens(response);
        usage.cost = 0; // Ollama is free
      } else if (provider === 'openai') {
        response = await this.queryOpenAI(enhancedPrompt, options.model || 'gpt-4');
        usage.model = options.model || 'gpt-4';
        // OpenAI returns actual token counts
      } else if (provider === 'claude') {
        response = await this.queryClaude(enhancedPrompt, options.model || 'claude-3-sonnet');
        usage.model = options.model || 'claude-3-sonnet';
        // Claude returns actual token counts
      }

      usage.response_time = Date.now() - startTime;
      
      // Log usage
      await LLMUsageModel.log(usage);
      
      return {
        response,
        usage,
        provider,
        success: true
      };
    } catch (error) {
      console.error(`LLM request failed:`, error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        error: error.message,
        provider,
        success: false
      };
    }
  }

  async queryOllama(prompt, model = 'mistral') {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2000
        }
      }, {
        timeout: 30000
      });

      return response.data.response;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }
      throw error;
    }
  }

  async queryOpenAI(prompt, model = 'gpt-4') {
    const apiKey = await SettingsModel.get('openai_api_key');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add it in Settings.');
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const completion = response.data;
    
    // Update usage tracking with actual token counts
    const usage = {
      tokens_input: completion.usage.prompt_tokens,
      tokens_output: completion.usage.completion_tokens,
      cost: this.calculateOpenAICost(model, completion.usage.prompt_tokens, completion.usage.completion_tokens)
    };

    return completion.choices[0].message.content;
  }

  async queryClaude(prompt, model = 'claude-3-sonnet-20240229') {
    const apiKey = await SettingsModel.get('claude_api_key');
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model,
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    });

    const completion = response.data;
    
    // Update usage tracking with actual token counts
    const usage = {
      tokens_input: completion.usage.input_tokens,
      tokens_output: completion.usage.output_tokens,
      cost: this.calculateClaudeCost(model, completion.usage.input_tokens, completion.usage.output_tokens)
    };

    return completion.content[0].text;
  }

  getPersonalityPrompt(personality) {
    const personalities = {
      'Coach': `You are a supportive and motivating productivity coach. Be encouraging, direct, and focus on helping the user achieve their goals. Use motivational language and provide actionable advice. Keep responses concise and practical.`,
      
      'Jean-Luc Picard': `You are Captain Jean-Luc Picard from Star Trek: The Next Generation. Speak with wisdom, diplomacy, and occasionally reference your experiences as a starship captain. Use phrases like "Make it so" when appropriate. Be thoughtful and philosophical in your responses.`,
      
      'Therapist': `You are a calm, understanding, and empathetic therapist. Focus on emotional well-being, mindfulness, and mental health. Ask thoughtful questions and provide gentle guidance. Use therapeutic language and techniques.`
    };

    return personalities[personality] || personalities['Coach'];
  }

  buildPrompt(systemPrompt, userPrompt, context) {
    let prompt = `${systemPrompt}\n\n`;
    
    if (context.tasks && context.tasks.length > 0) {
      prompt += `Current tasks:\n`;
      context.tasks.forEach(task => {
        prompt += `- ${task.title} (${task.status}, priority: ${task.priority})\n`;
      });
      prompt += '\n';
    }

    if (context.goals && context.goals.length > 0) {
      prompt += `Current goals:\n`;
      context.goals.forEach(goal => {
        const progress = (goal.current_value / goal.target_value * 100).toFixed(1);
        prompt += `- ${goal.title}: ${progress}% complete\n`;
      });
      prompt += '\n';
    }

    if (context.habits && context.habits.length > 0) {
      prompt += `Today's habits:\n`;
      context.habits.forEach(habit => {
        const status = habit.todayCompleted ? '✓' : '○';
        prompt += `${status} ${habit.name} (${habit.streak} day streak)\n`;
      });
      prompt += '\n';
    }

    if (context.recentActivity) {
      prompt += `Recent activity:\n${context.recentActivity}\n\n`;
    }

    prompt += `User request: ${userPrompt}`;
    
    return prompt;
  }

  async getDefaultProvider() {
    const defaultProvider = await SettingsModel.get('default_llm');
    return defaultProvider || 'ollama';
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  calculateOpenAICost(model, inputTokens, outputTokens) {
    const pricing = {
      'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
      'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.001 / 1000, output: 0.002 / 1000 }
    };

    const rates = pricing[model] || pricing['gpt-4'];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }

  calculateClaudeCost(model, inputTokens, outputTokens) {
    const pricing = {
      'claude-3-opus-20240229': { input: 0.015 / 1000, output: 0.075 / 1000 },
      'claude-3-sonnet-20240229': { input: 0.003 / 1000, output: 0.015 / 1000 },
      'claude-3-haiku-20240307': { input: 0.00025 / 1000, output: 0.00125 / 1000 }
    };

    const rates = pricing[model] || pricing['claude-3-sonnet-20240229'];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }

  async checkBudget() {
    const monthlyBudget = parseFloat(await SettingsModel.get('monthly_budget')) || 100;
    const currentSpend = await LLMUsageModel.getTotalCostThisMonth();
    const budgetWarnings = await SettingsModel.get('budget_warnings') === 'true';
    
    const remainingBudget = monthlyBudget - currentSpend;
    const percentUsed = (currentSpend / monthlyBudget) * 100;
    
    return {
      monthlyBudget,
      currentSpend,
      remainingBudget,
      percentUsed,
      shouldWarn: budgetWarnings && percentUsed > 80,
      isOverBudget: currentSpend > monthlyBudget
    };
  }

  async getAvailableOllamaModels() {
    try {
      const response = await axios.get(`${this.ollamaBaseUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      return [];
    }
  }
}

module.exports = new LLMService();