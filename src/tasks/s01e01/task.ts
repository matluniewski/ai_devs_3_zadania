import { OpenAIService } from "../openai/OpenAIService"

async function getQuestion() {
    const response = await fetch('https://xyz.ag3nts.org/')
    const html = await response.text()
    
    const questionMatch = html.match(/Question:\s*(?:<[^>]*>)*\s*(.*?)\s*</)
    if (questionMatch) {
      return questionMatch[1].trim()
    }
    return ''
    
  }



export async function main() {
    const service = new OpenAIService()

    const question = await getQuestion()

    const completion = await service.completion([ { role: 'user', content: question }])
    
    const answer = 'choices' in completion ? completion.choices[0].message.content : ''
    
    console.log('Answer:', answer)
    
    const formData = new FormData();
    formData.append('username', 'tester');
    formData.append('password', '574e112a');
    formData.append('answer', answer ?? '');

    const response = await fetch('https://xyz.ag3nts.org/', {
        method: 'POST',
        body: formData
    });
    
    
    // Sprawdź pełną odpowiedź
    const responseData = await response.text()
    console.log(responseData)
}

main()
