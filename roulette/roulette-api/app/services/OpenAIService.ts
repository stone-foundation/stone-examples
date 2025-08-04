import OpenAI from 'openai'
import { EventEmitter, Service } from '@stone-js/core'

/**
 * OpenAI Service Options
 */
export interface OpenAIServiceOptions {
  openaiClient: OpenAI
  eventEmitter: EventEmitter
}

/**
 * OpenAI Service
 */
@Service({ alias: 'openAIService' })
export class OpenAIService {
  private readonly openaiClient: OpenAI
  private readonly eventEmitter: EventEmitter

  constructor ({ openaiClient, eventEmitter }: OpenAIServiceOptions) {
    this.openaiClient = openaiClient
    this.eventEmitter = eventEmitter
  }

  // async generateResponse (prompt: string): Promise<string> {
  //   this.eventEmitter.emit('request.start', { prompt })
  //   const response = await this.openaiClient.chat.completions.create({
  //     model: 'gpt-4',
  //     messages: [{ role: 'user', content: prompt }]
  //   })
  //   this.eventEmitter.emit('request.end', { prompt, response })
  //   return response.choices[0].message.content
  // }
}
