import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const getQuote = async (req, res) => {
  try {
    // Request a welcoming quote from ChatGPT
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Give me a warm, complimentary welcome quote for a user. Prepare them to enjoy their novels and reading experience.",
        },
      ],
      model: "deepseek-chat",
    });

    // Send the quote as a response
    const quote = completion.choices[0].message.content;
    return res.status(200).json({ quote });
  } catch (error) {
    console.error(error?.message);
    return res.status(500).json({
      message: "Error fetching the welcome quote from OpenAI",
      error: error.message,
    });
  }
};

// export const getQuote = async (req, res) => {
//   try {
//     // Request a welcoming quote from ChatGPT
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "user",
//           content:
//             "Give me a warm, complimentary welcome quote for a user. Prepare them to enjoy their novels and reading experience.",
//         },
//       ],
//     });

//     // Send the quote as a response
//     const quote = completion.choices[0].message.content;
//     return res.status(200).json({ quote });
//   } catch (error) {
//     console.error(error?.message);
//     return res.status(500).json({
//       message: "Error fetching the welcome quote from OpenAI",
//       error: error.message,
//     });
//   }
// };
