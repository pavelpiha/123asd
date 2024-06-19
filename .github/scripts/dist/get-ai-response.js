import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
export async function createAPIMessage(messages) {
    return await client.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages,
    });
}
