import { TextBlock } from "@anthropic-ai/sdk/resources";
import Anthropic from "@anthropic-ai/sdk";
import { Message, MessageParam } from "@anthropic-ai/sdk/resources";
const client = new Anthropic();

export async function createAPIMessage(
  messages: MessageParam[]
): Promise<Message> {
  return await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages,
  });
}

async function getAIResponse(prompt: string): Promise<Array<{
  lineNumber: string;
  reviewComment: string;
}> | null> {
  try {
    const result = await createAPIMessage([{ role: "user", content: prompt }]);
    if (result.content.length) {
      return JSON.parse((result.content[0] as TextBlock).text).reviews;
    } else {
      console.error("Error: In result content ", result.content);
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
