// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//     const { type, role, level, techstack, amount, userid } = await request.json();

//     try {
//         const { text: questions } = await generateText({
//             model: google("gemini-2.0-flash-001"),
//             prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]

//         Thank you! <3
//     `,
//         });

//         const interview = {
//             role: role,
//             type: type,
//             level: level,
//             techstack: techstack.split(","),
//             questions: JSON.parse(questions),
//             userId: userid,
//             finalized: true,
//             coverImage: getRandomInterviewCover(),
//             createdAt: new Date().toISOString(),
//         };

//         await db.collection("interviews").add(interview);

//         return Response.json({ success: true }, { status: 200 });
//     } catch (error) {
//         console.error("Error:", error);
//         return Response.json({ success: false, error: error }, { status: 500 });
//     }
// }

// export async function GET() {
//     return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }
// // test branch tracy

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } =
      await request.json();

    // Validate required fields
    if (!role || !level || !techstack || !amount || !userid || !type) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call AI to generate questions
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions as a JSON array like this:
["Question 1", "Question 2", "Question 3"]
Do not include extra text or special characters that could break a voice assistant.
Thank you! <3`,
    });

    // Safely parse AI output
    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) parsedQuestions = [questions];
    } catch (err) {
      console.error("Failed to parse questions:", err, questions);
      parsedQuestions = [questions];
    }

    // Save interview to Firebase
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json(
      { success: true, questions: parsedQuestions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/vapi/generate:", error);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
