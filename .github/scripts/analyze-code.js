const USER = process.env.USER;
const TOKEN = process.env.GIT_PAT;

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const createAPIMessage = async (messages) => {
  return client.messages.stream({
    max_tokens: 1024,
    temperature: 0.0,
    model: "claude-3-opus-20240229",
    messages,
  });
};

const processRequest = async (message) => {
  const messages = [
    { role: "user", content: message },
    { role: "assistant", content: "AI_ASSISTANT: " },
  ];
  const response = await createAPIMessage(messages);
  console.log("------11111111111--------");
  console.log(response);
  console.log("------22222222222--------");
};

processRequest('what is a capital of Ukraine?');
