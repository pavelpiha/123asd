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

