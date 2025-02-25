import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://aiproject-uwohx.eastus.inference.ml.azure.com/score";
const API_KEY = process.env.AZURE_AI_API_KEY;
const DEPLOYMENT_NAME = "aiproject-uwohx-3";

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    console.error("API key is missing");
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const { question, chat_history } = await req.json();
    console.log("Received question:", question);
    console.log("Received chat history:", chat_history);

    if (!question || !chat_history || !Array.isArray(chat_history)) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    const requestBody = {
      question,
      chat_history
    };

    console.log("Sending request to Azure AI:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "azureml-model-deployment": DEPLOYMENT_NAME
      },
      body: JSON.stringify(requestBody)
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Azure AI Full Response:", JSON.stringify(data, null, 2));

      if (data.error) {
        console.error("Azure AI Error:", data.error.message);
        return NextResponse.json({ error: data.error.message }, { status: 500 });
      }

      const aiResponse = data.answer || "No valid response from AI";
      return NextResponse.json({ response: aiResponse });
    } else {
      const errorText = await response.text();
      console.error("Azure API Error:", errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
