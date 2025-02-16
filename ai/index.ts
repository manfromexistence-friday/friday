import { HfInference } from '@huggingface/inference';
import readlineSync from 'readline-sync';
import { config } from 'dotenv';

// Load environment variables
config();

interface ModelConfig {
    modelId: string;
    maxLength: number;
    temperature: number;
    topP: number;
    repetitionPenalty: number;
}

interface ChatConfig {
    welcomeMessage: string;
    exitCommand: string;
    exitMessage: string;
    requestTimeout: number;
}

interface AIResponse {
    generated_text: string;
}

class AIChat {
    private inference: HfInference;
    private conversationHistory: string;
    private modelConfig: ModelConfig;
    private chatConfig: ChatConfig;

    constructor() {
        const token = process.env.HUGGING_FACE_TOKEN;
        if (!token) {
            throw new Error('ERROR: HUGGING_FACE_TOKEN is not set in your .env file');
        }

        this.inference = new HfInference(token);
        this.conversationHistory = '';
        
        // Updated model configuration for Mistral
        this.modelConfig = {
            modelId: 'mistralai/Mixtral-8x7B-Instruct-v0.1',  // Latest free Mistral model
            maxLength: 2048,                                   // Increased for better responses
            temperature: 0.7,                                  // Balanced creativity
            topP: 0.95,                                       // Higher value for more natural responses
            repetitionPenalty: 1.1                            // Reduced to avoid over-penalization
        };

        this.chatConfig = {
            welcomeMessage: 'Welcome to the AI Chat! (Type "exit" to end the conversation)',
            exitCommand: 'exit',
            exitMessage: 'Goodbye! Thanks for chatting!',
            requestTimeout: 30000 // Increased to 30 seconds for better reliability
        };
    }

    private async generateResponse(conversation: string): Promise<string> {
        try {
            console.log('\nProcessing your request...');
            
            // Format the prompt for Mistral
            const formattedPrompt = `<s>[INST] ${conversation} [/INST]`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.chatConfig.requestTimeout);

            try {
                const response = await this.inference.textGeneration({
                    model: this.modelConfig.modelId,
                    inputs: formattedPrompt,
                    parameters: {
                        max_length: this.modelConfig.maxLength,
                        temperature: this.modelConfig.temperature,
                        top_p: this.modelConfig.topP,
                        repetition_penalty: this.modelConfig.repetitionPenalty,
                        do_sample: true,
                        num_return_sequences: 1
                    }
                });

                clearTimeout(timeoutId);

                if (!response || !response.generated_text) {
                    throw new Error('Invalid response from API');
                }

                // Clean up Mistral's response format
                let cleanResponse = response.generated_text
                    .replace(formattedPrompt, '')
                    .replace(/<s>|\[\/INST\]|\[INST\]|<\/s>/g, '')
                    .trim();

                return cleanResponse;

            } finally {
                clearTimeout(timeoutId);
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                return 'Error: Request timed out. Please try again.';
            }
            console.error('Error generating response:', error);
            return 'Error: ' + error.message;
        }
    }

    private extractNewResponse(fullResponse: string): string {
        try {
            return fullResponse.split('Assistant:').pop()?.trim() || '';
        } catch (error) {
            console.error('Error extracting response:', error);
            return 'Error processing the response.';
        }
    }

    public async start(): Promise<void> {
        try {
            console.log(this.chatConfig.welcomeMessage);
            console.log('---------------------------------------------------');
            console.log('Using model:', this.modelConfig.modelId);
            
            // Initial connection test
            const testInput = "Hi";
            console.log('\nTesting API connection...');
            const testResponse = await this.generateResponse(testInput);
            
            if (testResponse.includes('Error:')) {
                throw new Error('Failed to connect to Hugging Face API');
            }

            console.log('API Connection successful! You can now start chatting.\n');

            while (true) {
                const userInput = readlineSync.question('\nYou: ').trim();

                if (!userInput) {
                    console.log('Please enter some text.');
                    continue;
                }

                if (userInput.toLowerCase() === this.chatConfig.exitCommand) {
                    console.log(`\n${this.chatConfig.exitMessage}`);
                    break;
                }

                // Keep last few exchanges for context
                const contextWindow = 3;
                const conversations = this.conversationHistory.split('\n')
                    .slice(-contextWindow * 4) // 4 lines per exchange (Human + Assistant + 2 newlines)
                    .join('\n');

                this.conversationHistory = conversations + 
                    `\nHuman: ${userInput}\nAssistant:`;
                
                const response = await this.generateResponse(this.conversationHistory);
                
                if (response.includes('Error:')) {
                    console.error(response);
                    continue;
                }

                console.log('AI:', response);
                this.conversationHistory += ` ${response}\n`;
            }
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    }
}

// Start the chat application
const chat = new AIChat();
chat.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});