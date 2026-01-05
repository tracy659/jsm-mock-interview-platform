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
//       await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, {
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

//   //const lastMessage = messages[messages.length - 1];
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

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

interface AgentProps {
  userName: string;
  userId: string;
  type: string;
  interviewId?: string;
  role?: string;
  level?: string;
  techstack?: string;
  amount?: number;
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
  role,
  level,
  techstack,
  amount,
}: AgentProps) => {
  const router = useRouter();

  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // auto-scroll transcript
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // setup VAPI event listeners
  useEffect(() => {
    const onCallStart = () => {
      setCallActive(true);
      setConnecting(false);
      setCallEnded(false);
    };
    const onCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onMessage = (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: msg.role, content: msg.transcript },
        ]);
      }
    };
    const onError = (error: any) => {
      console.error("VAPI Error:", error);
      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", onCallStart)
      .on("call-end", onCallEnd)
      .on("speech-start", onSpeechStart)
      .on("speech-end", onSpeechEnd)
      .on("message", onMessage)
      .on("error", onError);

    return () => {
      vapi
        .off("call-start", onCallStart)
        .off("call-end", onCallEnd)
        .off("speech-start", onSpeechStart)
        .off("speech-end", onSpeechEnd)
        .off("message", onMessage)
        .off("error", onError);
    };
  }, []);

  // handle feedback after call ends
  useEffect(() => {
    const handleFeedback = async () => {
      if (!interviewId) return;
      const { success, feedbackId: id } = await createFeedback({
        interviewId,
        userId,
        transcript: messages,
      });
      if (success && id) router.push(`/interview/${interviewId}/feedback`);
      else router.push("/");
    };
    if (callEnded && type !== "generate") handleFeedback();
  }, [callEnded, messages, interviewId, type, userId, router]);

  // start VAPI call with fetched questions
  const handleStartCall = async () => {
    if (!role || !level || !techstack || !amount || !userId) {
      alert("Missing required interview info!");
      return;
    }

    setConnecting(true);
    setMessages([]);
    setCallEnded(false);

    try {
      // fetch questions from backend
      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          role,
          level,
          techstack,
          amount,
          userid: userId,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.questions?.length) {
        throw new Error("Failed to fetch questions");
      }

      const formattedQuestions = data.questions
        .map((q: string) => `- ${q}`)
        .join("\n");

      // start VAPI call
      await vapi.start("interviewer", {
        variableValues: {
          questions: formattedQuestions,
          username: userName,
          userid: userId,
        },
      });
    } catch (err: any) {
      console.error("Failed to start call:", err);
      alert(err.message || "Error starting call");
      setConnecting(false);
    }
  };

  const handleEndCall = () => {
    setCallEnded(true);
    setCallActive(false);
    vapi.stop();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      {/* Avatars */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Image
              src="/ai-avatar.png"
              alt="AI"
              width={80}
              height={80}
              className="rounded-full"
            />
            {isSpeaking && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full animate-pulse" />
            )}
          </div>
          <h3>AI Interviewer</h3>
          <p className="text-sm text-muted-foreground">
            {isSpeaking
              ? "Speaking..."
              : callActive
              ? "Listening..."
              : callEnded
              ? "Call ended"
              : "Waiting..."}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Image
            src="/user-avatar.png"
            alt="User"
            width={80}
            height={80}
            className="rounded-full"
          />
          <h3>{userName}</h3>
          <p className="text-sm text-muted-foreground">Ready</p>
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="bg-card/90 border border-border rounded-lg p-4 h-64 overflow-y-auto scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <span className="font-semibold text-xs text-muted-foreground">
                {msg.role === "assistant" ? "AI" : "You"}:
              </span>
              <p>{msg.content}</p>
            </div>
          ))}
          {callEnded && (
            <div className="mb-2">
              <span className="font-semibold text-xs text-primary">
                System:
              </span>
              <p>Call ended. Thank you!</p>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!callActive ? (
          <button
            className="relative bg-primary text-white px-6 py-2 rounded-2xl hover:bg-primary/90 disabled:opacity-50"
            onClick={handleStartCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/50 opacity-50" />
            )}
            {connecting
              ? "Connecting..."
              : callEnded
              ? "Call Ended"
              : "Start Call"}
          </button>
        ) : (
          <button
            className="bg-destructive text-white px-6 py-2 rounded-2xl hover:bg-destructive/90"
            onClick={handleEndCall}
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
