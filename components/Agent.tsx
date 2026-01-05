// "use client";

// import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { vapi } from "@/lib/vapi.sdk";
// import { interviewer } from "@/constants";
// import { createFeedback } from "@/lib/actions/general.action";

// enum CallStatus {
//   INACTIVE = "INACTIVE",
//   CONNECTING = "CONNECTING",
//   ACTIVE = "ACTIVE",
//   FINISHED = "FINISHED",
// }

// interface SavedMessage {
//   role: "user" | "system" | "assistant";
//   content: string;
// }

// const Agent = ({
//   userName,
//   userId,
//   type,
//   interviewId,
//   questions,
// }: AgentProps) => {
//   //  const callStatus = CallStatus.FINISHED;
//   // const isSpeaking = true;
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const router = useRouter();
//   const [messages, setMessages] = useState<SavedMessage[]>([]);
//   const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

//   useEffect(() => {
//     const onCallStart = () => {
//       setCallStatus(CallStatus.ACTIVE);
//     };

//     const onCallEnd = () => {
//       setCallStatus(CallStatus.FINISHED);
//     };

//     const onMessage = (message: Message) => {
//       if (message.type === "transcript" && message.transcriptType === "final") {
//         const newMessage = { role: message.role, content: message.transcript };
//         setMessages((prev) => [...prev, newMessage]);
//       }
//     };

//     const onSpeechStart = () => {
//       console.log("speech start");
//       setIsSpeaking(true);
//     };

//     const onSpeechEnd = () => {
//       console.log("speech end");
//       setIsSpeaking(false);
//     };

//     const onError = (error: Error) => {
//       console.log("Error:", error);
//     };

//     vapi.on("call-start", onCallStart);
//     vapi.on("call-end", onCallEnd);
//     vapi.on("message", onMessage);
//     vapi.on("speech-start", onSpeechStart);
//     vapi.on("speech-end", onSpeechEnd);
//     vapi.on("error", onError);

//     return () => {
//       vapi.off("call-start", onCallStart);
//       vapi.off("call-end", onCallEnd);
//       vapi.off("message", onMessage);
//       vapi.off("speech-start", onSpeechStart);
//       vapi.off("speech-end", onSpeechEnd);
//       vapi.off("error", onError);
//     };
//   }, []);

//   useEffect(() => {
//     const handleGenerateFeedback = async (messages: SavedMessage[]) => {
//       console.log("handleGenerateFeedback");

//       const { success, feedbackId: id } = await createFeedback({
//         interviewId: interviewId!,
//         userId: userId!,
//         transcript: messages,
//       });

//       if (success && id) {
//         router.push(`/interview/${interviewId}/feedback`);
//       } else {
//         console.log("Error saving feedback");
//         router.push("/");
//       }
//     };
//     if (callStatus === CallStatus.FINISHED) {
//       if (type === "generate") {
//         router.push("/");
//       } else {
//         handleGenerateFeedback(messages);
//       }
//     }
//   }, [messages, callStatus, type, userId]);

//   const handleCall = async () => {
//     setCallStatus(CallStatus.CONNECTING);
//     if (type === "generate") {
//       await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
//         variableValues: {
//           username: userName,
//           userid: userId,
//         },
//       });
//     } else {
//       let formattedQuestions = "";
//       if (questions) {
//         formattedQuestions = questions
//           .map((question) => `- ${question}`)
//           .join("\n");
//       }
//       await vapi.start(interviewer, {
//         variableValues: {
//           questions: formattedQuestions,
//         },
//       });
//     }
//   };

//   const handleDisconnect = () => {
//     setCallStatus(CallStatus.FINISHED);
//     vapi.stop();
//   };
//   const latestMesssage = messages[messages.length - 1];
//   const isCallInactiveOrFinished =
//     callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

//   // const lastMessage = messages[messages.length - 1];
//   return (
//     <>
//       <div className="call-view">
//         <div className="card-interviewer">
//           <div className="avatar">
//             <Image
//               src="/ai-avatar.png"
//               alt="vapi"
//               width={65}
//               height={54}
//               className="object-cover"
//             />
//             {isSpeaking && <span className="animate-speak" />}
//           </div>
//           <h3>AI Interviewer</h3>
//         </div>
//         <div className="card-border">
//           <div className="card-content">
//             <Image
//               src="/user-avatar.png"
//               alt="user avatar"
//               width={540}
//               height={540}
//               className="rounded-full object-cover size-[120px]"
//             />
//             <h3>{userName}</h3>
//           </div>
//         </div>
//       </div>
//       {messages.length > 0 && (
//         <div className="transcript-border">
//           <div className="transcript">
//             <p
//               key={latestMesssage.content}
//               className={cn(
//                 "transcription-opacity duration-500 opacity-0",
//                 "animate-fadeIn opacity-100"
//               )}
//             >
//               {latestMesssage.content}
//             </p>
//           </div>
//         </div>
//       )}
//       <div className="w-full flex justify-center">
//         {callStatus !== "ACTIVE" ? (
//           <button className="relative btn-call" onClick={() => handleCall()}>
//             <span
//               className={cn(
//                 "absolute animate-ping rounded-full opacity-75",
//                 callStatus !== "CONNECTING" && "hidden"
//               )}
//             />
//             <span>{isCallInactiveOrFinished ? "call" : "...."}</span>
//           </button>
//         ) : (
//           <button className="btn-disconnect" onClick={() => handleDisconnect()}>
//             End
//           </button>
//         )}
//       </div>
//     </>
//   );
// };

// export default Agent;

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

interface AgentProps {
  userName: string;
  userId: string;
  type: "generate" | "interview";
  interviewId?: string;
  questions?: string[];
  interviewerId?: string;
}

interface SavedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
  interviewerId,
}: AgentProps) => {
  const router = useRouter();

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // VAPI event listeners
  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { content: message.transcript, role: message.role },
        ]);
      }
    };

    const handleError = (error: any) => {
      console.error("VAPI Error:", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  // Feedback generation after call ends
  useEffect(() => {
    if (!callEnded || type === "generate") return;

    const handleGenerateFeedback = async () => {
      if (!interviewId || !userId) return;

      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId,
          userId,
          transcript: messages,
        });

        if (success && id) router.push(`/interview/${interviewId}/feedback`);
        else {
          console.error("Error saving feedback");
          router.push("/");
        }
      } catch (error) {
        console.error("Feedback error:", error);
        router.push("/");
      }
    };

    handleGenerateFeedback();
  }, [callEnded, messages, type, interviewId, userId]);

  // Start or stop call
  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
      return;
    }

    try {
      setConnecting(true);
      setMessages([]);
      setCallEnded(false);

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
      } else {
        const formattedQuestions =
          questions?.map((q) => `- ${q}`).join("\n") || "";
        await vapi.start(interviewerId || "", {
          variableValues: { questions: formattedQuestions },
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col overflow-hidden pb-20">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI CARD */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center relative">
          {/* Speaking Indicator */}
          <div
            className={`absolute inset-0 ${
              isSpeaking ? "opacity-30" : "opacity-0"
            } transition-opacity duration-300`}
          >
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`mx-1 w-1 bg-blue-500 rounded-full ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
            <Image
              src="/ai-avatar.png"
              alt="AI"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl font-bold">AI Interviewer</h2>
          <p className="text-sm text-gray-500 mt-1">Conducts the interview</p>

          {/* Status */}
          <div
            className={cn(
              "mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border",
              isSpeaking && "border-blue-500"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isSpeaking ? "bg-blue-500 animate-pulse" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-gray-500">
              {isSpeaking
                ? "Speaking..."
                : callActive
                ? "Listening..."
                : callEnded
                ? "Call ended"
                : "Waiting..."}
            </span>
          </div>
        </div>

        {/* USER CARD */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center relative">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden">
            <Image
              src="/user-avatar.png"
              alt={userName}
              width={128}
              height={128}
              className="object-cover rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold">{userName}</h2>
          <p className="text-sm text-gray-500 mt-1">You</p>

          <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-500">Ready</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 mb-8 h-64 overflow-y-auto scroll-smooth"
        >
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="animate-fadeIn">
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  {msg.role === "assistant" ? "AI Interviewer" : "You"}:
                </div>
                <p className="text-gray-900">{msg.content}</p>
              </div>
            ))}

            {callEnded && (
              <div className="animate-fadeIn">
                <div className="font-semibold text-xs text-blue-500 mb-1">
                  System:
                </div>
                <p className="text-gray-900">
                  Call ended. Thank you for using AI Interviewer!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call button */}
      <div className="w-full flex justify-center">
        <button
          className={cn(
            "w-44 text-xl rounded-3xl text-white relative py-2",
            callActive
              ? "bg-red-600 hover:bg-red-700"
              : callEnded
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          )}
          onClick={toggleCall}
          disabled={connecting || callEnded}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/50 opacity-75"></span>
          )}
          <span>
            {callActive
              ? "End Call"
              : connecting
              ? "Connecting..."
              : callEnded
              ? "Call Ended"
              : "Start Call"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Agent;
