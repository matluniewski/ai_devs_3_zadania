import { OpenAIService } from "../../openai/OpenAIService";

interface Response {
    apikey: string;
    description: string;
    copyright: string;
    'test-data': TestItem[];
}

interface TestItem {
      question: string;
      answer: number;
      test?: any;
  }

  const openai = new OpenAIService();
  
  async function downloadAndParseJson(): Promise<Response> {
    const url = `https://centrala.ag3nts.org/data/${process.env.AI_DEVS_API_KEY}/json.txt`;
    const response = await fetch(url);
    return response.json();
  }
  
  async function processLargeJson(data: TestItem[]): Promise<TestItem[]> {
    return Promise.all(data.map(async item => {
       const fixedItem = fixCalculations(item);
       return processTestQuestions(fixedItem);
    }))
  }
  
  function fixCalculations(item: TestItem): TestItem {
    // Extract numbers and operator from the question
    const [num1, operator, num2] = item.question.split(' ');
    
    // Calculate correct answer
    let correctAnswer: number;
    switch (operator) {
      case '+':
        correctAnswer = Number(num1) + Number(num2);
        break;
      case '-':
        correctAnswer = Number(num1) - Number(num2);
        break;
      case '*':
        correctAnswer = Number(num1) * Number(num2);
        break;
      case '/':
        correctAnswer = Number(num1) / Number(num2);
        break;
      default:
        return item; // Return original if operator not recognized
    }
    
    // If current answer is incorrect, update it
    if (item.answer !== correctAnswer) {
      return {
        ...item,
        answer: correctAnswer
      };
    }
    
    return item;
  }
  
  async function processTestQuestions(item: TestItem): Promise<TestItem> {
    
    
    return item.test ? await getLlmAnswer(item) : item
    
    
  }
  
   async function getLlmAnswer(item: TestItem): Promise<TestItem> {
    const response = await openai.completion([{role: "system", content: "You are a helpful assistant. Answer question and use as little words as possible."}, {role: "user", content: item.test.q}]);
    item.test.a = response.choices[0].message.content;
    return item;
  }
  
  // Main execution
  async function main() {
    try {
      const data = await downloadAndParseJson();
      
      const processedData = await processLargeJson(data["test-data"]);
      
console.log(processedData.filter(item => item.test));

const answer = {
        "apikey": process.env.AI_DEVS_API_KEY,
        "task": "JSON",
        "answer": {
            "apikey": process.env.AI_DEVS_API_KEY,
            "description": data.description,
            "copyright": data.copyright,
            "test-data": processedData
        }
      }

      // Send result to centrala
      const response = await fetch('https://centrala.ag3nts.org/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answer)
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error processing JSON:', error);
    }
  }
  main()