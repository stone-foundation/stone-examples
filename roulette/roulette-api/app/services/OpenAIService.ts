import OpenAI, { toFile } from 'openai'
import { MediaService } from './MediaService'
import { ChatMessage } from '../models/Chatbot'
import { ChatEvent } from '../events/ChatEvent'
import { SecurityService } from './SecurityService'
import { AIAnalyzerResponse, AIExecutorResponse } from '../models/App'
import { ResponseInput, ResponseInputItem } from 'openai/resources/responses/responses.mjs'
import { EventEmitter, IBlueprint, IContainer, isEmpty, isNotEmpty, RuntimeError, Service } from '@stone-js/core'
import { AI_TOOLS_CONTRACTS, AI_TOOLS_MINI, ANALYSER_SYSTEM_PROMPT, EXECUTOR_SYSTEM_PROMPT } from '../ai/toolServiceContracts'

/**
 * OpenAI Service Options
 */
export interface OpenAIServiceOptions {
  openaiClient: OpenAI
  blueprint: IBlueprint
  container: IContainer
  mediaService: MediaService
  eventEmitter: EventEmitter
  securityService: SecurityService
}

/**
 * OpenAI Service
 */
@Service({ alias: 'openAIService' })
export class OpenAIService {
  private readonly openaiClient: OpenAI
  private readonly blueprint: IBlueprint
  private readonly container: IContainer
  private readonly mediaService: MediaService
  private readonly eventEmitter: EventEmitter
  private readonly securityService: SecurityService

  constructor ({ openaiClient, eventEmitter, container, mediaService, securityService, blueprint }: OpenAIServiceOptions) {
    this.container = container
    this.blueprint = blueprint
    this.openaiClient = openaiClient
    this.eventEmitter = eventEmitter
    this.mediaService = mediaService
    this.securityService = securityService
  }

  /**
   * Answer to user request using OpenAI
   *
   * @param userInput - The input from the user
   * @param memories - Optional array of memories to include in the analysis
   */
  async answerToUserRequest(userInput: string, memories: string[] = []): Promise<ChatMessage> {
    if (this.blueprint.is('openai.enabled', false)) {
      throw new RuntimeError('OpenAI is not enabled in the configuration')
    }

    const res = await this.analyzeUserRequest(userInput, memories)
    
    if (res.phase !== 'execution') {
      return this.dispatchChatMessageEvent({
        uuid: res.id,
        modelRef: res.id,
        role: 'assistant',
        createdAt: Date.now(),
        content: res.summary ?? '',
        memory: `Phase ${res.phase}: ${res.memory}.`,
      })
    } else  {
      memories.push(res.memory)
      const res2 = await this.executeWithTools(res.prompt, res.tools, memories)
      return this.dispatchChatMessageEvent({
        uuid: res2.id,
        modelRef: res2.id,
        role: 'assistant',
        createdAt: Date.now(),
        content: res2.message,
        memory: `Phase ${res.phase}: ${res2.memory}.`,
      })
    }
  }

  /**
   * Analyze user request using OpenAI
   *
   * @param userInput - The input from the user
   * @param memories - Optional array of memories to include in the analysis
   * @returns Tools to be used based on the analysis
   */
  async analyzeUserRequest(userInput: string, memories: string[] = []): Promise<AIAnalyzerResponse> {
    const response = await this.openaiClient.responses.create({
      tools: [ { type: "web_search_preview" } ],
      model: this.blueprint.get<string>('openai.analyserModel', 'gpt-4o'),
      input: [
        { role: "system", content: ANALYSER_SYSTEM_PROMPT },
        { role: "system", content: `Mémoire cumulative:\n${memories.map(v => `- ${v}`).join('\n')}` },
        { role: "system", content: `Tools disponibles: ${AI_TOOLS_MINI.map(t => `${t.name}: ${t.description}`).join(" | ")}` },
        { role: "user", content: userInput }
      ]
    })

    const res = isEmpty(response.output_text) ? {} : JSON.parse(response.output_text)
    
    res.id = response.id
    
    return res
  }

  /**
   * Execute the user request with the available tools
   *
   * @param userInput - The input from the user
   * @param tools - The tools to be used for execution
   * @param memories - Optional array of memories to include in the execution context
   */
  async executeWithTools(userInput: string, tools: string[], memories: string[] = [], input: ResponseInput = [], depth: number = 0): Promise<AIExecutorResponse> {
    const actorUuid = this.securityService.getAuthUser()?.uuid
    const selectedTools = tools.map(name => AI_TOOLS_CONTRACTS.find(t => t.name === name)).filter(t => t !== undefined) as Array<any>
    input = input.length > 0 ? input : input.concat([
      { role: "system", content: EXECUTOR_SYSTEM_PROMPT },
      { role: "system", content: `Mémoire cumulative:\n${memories.map(v => `- ${v}`).join('\n')}` },
      { role: "system", content: `L'uuid de l'acteur qui a le droit en ecriture sur les fonctions: ${actorUuid} utile pour les appels de fonctions` },
      { role: "user", content: userInput }
    ])

    let response = await this.openaiClient.responses.create({
      input,
      tools: [...selectedTools, { type: "web_search_preview" }],
      model: this.blueprint.get<string>('openai.executorModel', 'gpt-4o-mini')
    })

    if (response.output.length > 0) {
      const input2: ResponseInput = []

      for (const toolCall of response.output) {
        if (toolCall.type === 'function_call') {
          const outputItem: ResponseInputItem = {
            output: '',
            call_id: toolCall.call_id,
            type: "function_call_output"
          }
          try {
            const args = Object.values(JSON.parse(toolCall.arguments))
            const result = await this.executeFunction<any>(toolCall.name, args)
            if (isNotEmpty<any>(result)) {
              outputItem.output = typeof result === 'object' ? JSON.stringify(result) : `${result}`
            }
          } catch (error: any) {
            outputItem.output = `Error executing function ${toolCall.name}: ${error.message}`
            userInput = 'Erreur lors de l\'exécution de la fonction, arreter et rédiger un message d\'erreur'
          }
          input2.push(toolCall)
          input2.push(outputItem)
        }
      }

      if (input2.length > 0 && depth < 3) {
        return await this.executeWithTools(userInput, tools, memories, [...input, ...input2], depth + 1)
      }
    }

    const res = isEmpty(response.output_text) ? {} : JSON.parse(response.output_text)

    res.id = response.id
    
    return res
  }

  /**
   * Transcribe remote audio using OpenAI
   *
   * @param url - The URL of the audio file
   * @returns Transcription of the audio
   */
  async transcribeRemoteAudio(url: string): Promise<string> {
    const stream = await this.mediaService.downloadFromS3AsStream(url)
    const file = await toFile(stream, 'audio.webm', { type: 'audio/webm' })
    const transcription = await this.openaiClient.audio.transcriptions.create({
      file,
      response_format: 'text',
      model: this.blueprint.get<string>('openai.transcriptionModel', 'gpt-4o-mini-transcribe')
    })

    return transcription
  }

  /**
   * Execute a function based on the function name and arguments
   *
   * @param functionName - The name of the function to execute
   * @param args - The arguments to pass to the function
   * @returns The result of the function execution
   */
  async executeFunction<T>(functionName: string, args: Array<any>): Promise<T> {
    const [serviceName, methodName] = functionName.split('_')
    const service = this.container.resolve<any>(serviceName)
    return service[methodName](...args)
  }

  /**
   * Dispatch a chat message event
   *
   * @param message - The chat message to dispatch
   * @return The dispatched chat message
   */
  dispatchChatMessageEvent(message: ChatMessage): ChatMessage {
    this.eventEmitter.emit(new ChatEvent(ChatEvent.MESSAGE_PUBLISH, message))
    return message
  }
}
