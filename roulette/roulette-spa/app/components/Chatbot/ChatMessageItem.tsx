import clsx from "clsx"
import React from "react"
import { dateTimeFromNow } from "../../utils"
import { AudioMessage } from "./AudioMessage"
import { ChatMessage } from "../../models/Chatbot"

type ChatMessageItemProps = {
  message: ChatMessage
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === "user"

  return (
    <div
      className={clsx(
        "mb-3 flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[75%] rounded-lg px-3 py-2 text-sm shadow flex flex-col gap-1",
          isUser ? "bg-blue-500 text-white" : "bg-white border"
        )}
      >
        {message.audioUrl ? (
          <AudioMessage audioUrl={message.audioUrl} isUser={isUser} />
        ) : (
          <p>{message.content}</p>
        )}
        <span className="block mt-1 text-xs opacity-70 text-right">
          {dateTimeFromNow(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
