import { Injectable } from '@nestjs/common';

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

@Injectable()
export class OpenAiService {
  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async jsonChat({
    systemPrompt,
    userPrompt,
    temperature = 0.2,
  }: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
  }) {
    if (!this.isConfigured()) {
      return null;
    }

    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature,
      }),
    });

    const result: any = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'OpenAI request failed.');
    }

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI response did not include content.');
    }

    return JSON.parse(content);
  }
}
