const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai"); 
const dotenv = require('dotenv');

const app = express();

dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/symptoms/askai", async (req, res) => {
  const { symptoms, ageRange, gender, fullName } = req.body;

   console.log("Received data:", { symptoms, ageRange, gender, fullName });

  // Construct the prompts for OpenAI
  const prompt1 = `I would appreciate your help in providing some suggestions or insights. My symptoms include:\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`;

  const prompt2 = `What could be the possible causes of these symptoms?\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`;

  const prompt3 = `What to do next if I notice these symptoms?\n symptoms: ${symptoms}\n age range: ${ageRange}\n gender: ${gender}. Make sure to summarize the response to 70 words`;

  try {
    const symptomsCheck = await ChatGPTFunction(prompt1);
    const causes = await ChatGPTFunction(prompt2);
    const treatment = await ChatGPTFunction(prompt3);

    const responseData = {
      symptomsCheck,
      causes,
      treatment,
    };

    res.status(200).json({
      message: "Request successful!",
      data: responseData,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const ChatGPTFunction = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 80,
    });

  
    return response.choices[0].message.content;
  } catch (error) {
    console.error("ChatGPTFunction Error:", error);
    throw error; 
  }
};