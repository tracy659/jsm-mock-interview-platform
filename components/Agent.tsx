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

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // auto-scroll for messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // setup VAPI event listeners
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
      if (type === "interview") handleGenerateFeedback(messages);
    };

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: message.transcript },
        ]);
      }
    };

    const handleError = (error: any) => {
      console.log("VAPI Error", error);
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
  }, [messages, type, interviewId, userId]);

  // handle feedback saving
  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    if (!interviewId || !userId) return;

    const { success, feedbackId: id } = await createFeedback({
      interviewId,
      userId,
      transcript: messages,
    });

    if (success && id) router.push(`/interview/${interviewId}/feedback`);
    else router.push("/");
  };

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        if (type === "generate") {
          await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, {
            variableValues: { username: userName, userid: userId },
          });
        } else {
          const formattedQuestions =
            questions?.map((q) => `- ${q}`).join("\n") || "";
          await vapi.start("interviewer", {
            variableValues: { questions: formattedQuestions },
          });
        }
      } catch (error) {
        console.log("Failed to start call", error);
        setConnecting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 flex flex-col overflow-hidden pb-10">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI Card */}
        <div className="relative bg-card/90 border border-border rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative mb-4 w-24 h-24">
            <Image
              src="/ai-avatar.png"
              alt="AI"
              width={96}
              height={96}
              className="rounded-full"
            />
            {isSpeaking && (
              <span className="absolute inset-0 animate-ping bg-primary rounded-full opacity-30"></span>
            )}
          </div>
          <h3 className="text-lg font-bold">AI Interviewer</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isSpeaking
              ? "Speaking..."
              : callActive
              ? "Listening..."
              : callEnded
              ? "Call ended"
              : "Waiting..."}
          </p>
        </div>

        {/* User Card */}
        <div className="relative bg-card/90 border border-border rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative mb-4 w-24 h-24">
            <Image
              src="/user-avatar.png"
              alt="User"
              width={96}
              height={96}
              className="rounded-full"
            />
          </div>
          <h3 className="text-lg font-bold">{userName}</h3>
          <p className="text-sm text-muted-foreground mt-1">Ready</p>
        </div>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold text-xs text-muted-foreground">
                {msg.role === "assistant" ? "AI" : "You"}:
              </div>
              <p className="text-foreground">{msg.content}</p>
            </div>
          ))}

          {callEnded && (
            <div className="mt-2 font-semibold text-xs text-primary">
              System: Call ended. Thank you!
            </div>
          )}
        </div>
      )}

      {/* Call Button */}
      <div className="w-full flex justify-center">
        <button
          onClick={toggleCall}
          disabled={connecting || callEnded}
          className={`px-8 py-3 rounded-3xl text-white ${
            callActive
              ? "bg-destructive hover:bg-destructive/90"
              : connecting
              ? "bg-primary/70"
              : callEnded
              ? "bg-red-500 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          } relative`}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
          )}
          {callActive
            ? "End Call"
            : connecting
            ? "Connecting..."
            : callEnded
            ? "Call Ended"
            : "Start Call"}
        </button>
      </div>
    </div>
  );
};

export default Agent;
