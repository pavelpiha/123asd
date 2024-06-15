const USER = process.env.USER;
const TOKEN = process.env.GIT_PAT;
const API_KEY = process.env.API_KEY || "";
const API_ENDPOINT = process.env.API_ENDPOINT;

// import dotenv from "dotenv";
import {
  OpenAIClient,
  AzureKeyCredential,
  ChatRequestMessage,
} from "@azure/openai";
import axios from "axios";

// dotenv.config({
//   path: [".env.local", ".env"],
// });

// README:
// Please connect to EPAM VPN (it is required for DIAL API_KEY keys work)
// Please set the API_KEY in the ".env" file

// API DOCUMENTATION:
// Request DIAL API_KEY: https://chat.lab.epam.com/#requestApiKey
// DIAL models usage: https://kb.epam.com/display/EPMGPT/Various+models+usage
// Azure OpenAI NPM package: https://www.npmjs.com/package/@azure/openai
// Azure OpenAI REST API: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference

(async () => {
  //await getAvailableDeploymentsOfModels();
  //await getChatCompletions35Axios();
  //await getChatCompletions35OpenAI();
  await getChatCompletionsGPT4oAxios();
  //await getChatWithImageOpenAI();
  //await downloadDale3Image_DIAL_SPECIFIC();
  // FAILS 502 !
  //await getDale3Image();
})();

async function getAvailableDeploymentsOfModels() {
  const response = await axios.get(
    `${API_ENDPOINT}/openai/deployments`,
    {
      headers: { "Api-Key": API_KEY },
    }
  );
  console.log(response.data.data.map((deployment: any) => deployment.id));
}

async function getChatCompletions35Axios() {
  const DEPLOYMENT_ID = "gpt-35-turbo-0125";

  try {
    const response = await axios.post(
      `${API_ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}/chat/completions`,
      {
        messages: [
          {
            role: "user",
            content: "Generate some random joke about JavaScript :)",
          },
        ],
        max_tokens: 500,
        temperature: 0.9,
      },
      { headers: { "Api-Key": API_KEY } }
    );

    console.log(
      "getChatCompletions35Axios: ",
      response.data.choices[0].message.content
    );
  } catch (error) {
    console.error(error);
  }
}

async function getChatCompletions35OpenAI() {
  const DEPLOYMENT_ID = "gpt-35-turbo-0125";

  const client = new OpenAIClient(
    API_ENDPOINT || "",
    new AzureKeyCredential(API_KEY)
  );

  // Call Azure OpenAI to get response
  const response = await client.getChatCompletions(
    DEPLOYMENT_ID,
    [
      {
        role: "user",
        content: "Generate some random joke about JavaScript :)",
      },
    ],
    {
      maxTokens: 500,
      temperature: 0.9,
    }
  );

  console.log(
    "getChatCompletions35OpenAI: ",
    response?.choices?.[0]?.message?.content
  );
}

async function getChatCompletionsGPT4oAxios() {
  const DEPLOYMENT_ID = "gpt-4o-2024-05-13";

  const response = await axios.post(
    `${API_ENDPOINT}/openai/deployments/${DEPLOYMENT_ID}/chat/completions`,
    {
      messages: [
        {
          role: "user",
          content: "Generate some random joke about JavaScript :)",
        },
      ],
      max_tokens: 500,
      temperature: 0.9,
    },
    { headers: { "Api-Key": API_KEY } }
  );

  console.log(
    "getChatCompletionsGPT4oAxios: ",
    response.data.choices[0].message.content
  );
}

async function getChatWithImageOpenAI() {
  const url =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Leonardo_da_Vinci_043-mod.jpg/220px-Leonardo_da_Vinci_043-mod.jpg";
  const deploymentName = "gpt-4-vision-preview";

  const client = new OpenAIClient(
    API_ENDPOINT || "",
    new AzureKeyCredential(API_KEY)
  );
  try {
    const response = await client.getChatCompletions(deploymentName, [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe the emotions of a women?",
          },
          {
            type: "image_url",
            imageUrl: {
              url,
              detail: "auto",
            },
          },
        ],
      },
    ]);

    console.log(
      `getChatWithImageOpenAI: ${response.choices[0].message?.content}`
    );
  } catch (error) {
    console.error(error);
  }
}

async function downloadDale3Image_DIAL_SPECIFIC() {
  const outputImage = "output.jpg";

  try {
    const response = await axios.post(
      `${API_ENDPOINT}/openai/deployments/dall-e-3/chat/completions`,
      {
        messages: [
          {
            role: "user",
            content:
              "url, image of crismas tree in the snow with red JavaScript logo balls in it",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": API_KEY,
        },
      }
    );
    const relativeImageUrl =
      response.data.choices[0].message.custom_content.attachments[1].url;

    // Download the image from the URL
    const imageResponse = await axios.get(
      `${API_ENDPOINT}/v1/${relativeImageUrl}`,
      {
        responseType: "stream",
        headers: {
          "Api-Key": API_KEY,
        },
      }
    );
    imageResponse.data.pipe(require("fs").createWriteStream(outputImage));

    console.log(relativeImageUrl);
  } catch (error) {
    console.error(error);
  }
}

// FAILS DIAL is not compatible with [502] !!!
async function getDale3Image() {
  try {
    const client = new OpenAIClient(
      API_ENDPOINT || "",
      new AzureKeyCredential(API_KEY)
    );
    const response = await client.getImages("dall-e-3", "image of a cat", {
      n: 1,
      size: "1024x1024",
    });

    // Extract the response text
    const responseUrl = response.data[0].url;

    // Send the response back to the client
    console.log("--------- getDale3Image:");
    console.log(responseUrl);
  } catch (error) {
    // error is always undefined here. since DIAL response is not compatible with OpenAI package expected error format
    console.error(error);
  }

  // Other option fails as well
  /*
  const response = await axios.post(
    `${API_ENDPOINT}/openai/deployments/dall-e-3/images/generations`,
    {
      prompt: 'Image of a cat',
      n: 1,
      size: '1024x1024',
    },
    { headers: { 'Api-Key': API_KEY } },
  );
  console.log('--------- getDale3Image:');
  console.log(response);
  */
}
