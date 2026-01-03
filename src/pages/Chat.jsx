import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AppLayout from "../components/layout/AppLayout";
import { IconButton, Skeleton, Stack, Tooltip, Box } from "@mui/material";
import { grayColor, orange } from "../constants/color";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  AutoFixHigh as ImproveIcon,
  Summarize as SummarizeIcon,
} from "@mui/icons-material";
import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import AIChatAssistant from "../components/dialogs/AIChatAssistant";
import MessageImprover from "../components/dialogs/MessageImprover";
import ChatSummarizer from "../components/dialogs/ChatSummarizer";
import SmartReplies from "../components/dialogs/SmartReplies";
import EditMessageDialog from "../components/dialogs/EditMessageDialog";
import ConfirmDeleteDialog from "../components/dialogs/ConfirmDeleteDialog";
import { getSocket } from "../socket";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  MESSAGE_DELETED,
  MESSAGE_UPDATED,
  MESSAGE_REACTION_UPDATED,
  MESSAGE_DELIVERED,
  MESSAGE_SEEN,
} from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/layout/Loaders";
import { useNavigate } from "react-router-dom";
import { useAI } from "../hooks/useAI";
import { useMessageActions } from "../hooks/useMessageActions";
import { useReactions } from "../hooks/useReactions";
import { useReceipts } from "../hooks/useReceipts";

const Chat = ({ chatId, user }) => {
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);

  // AI Features State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMessageImprover, setShowMessageImprover] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const { getSmartReplies, loading: aiLoading } = useAI();

  const { updateMessage: updateMessageApi, deleteMessage: deleteMessageApi } =
    useMessageActions();

  const { upsertReaction, removeReaction } = useReactions();

  const [messageToEdit, setMessageToEdit] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showEditMessage, setShowEditMessage] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  // Track the last message we generated smart replies for (prevents repeated API calls)
  const lastSmartReplyForMessageIdRef = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;
  const chatMemberCount = Array.isArray(members) ? members.length : undefined;

  // Combine messages early so hooks below can safely reference it
  const allMessages = [...oldMessages, ...messages];

  const { markDelivered, markSeen } = useReceipts();

  // When chat opens / messages update, mark latest incoming messages delivered/seen
  useEffect(() => {
    const run = async () => {
      if (!chatId || !user?._id) return;
      const last = allMessages?.[allMessages.length - 1];
      if (!last?._id) return;

      // Only for messages sent by others
      if (last?.sender?._id && last.sender._id !== user._id) {
        await markDelivered(last._id);
        await markSeen(last._id);
      }
    };

    run();
  }, [chatId, user?._id, allMessages?.length]);

  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [2000]);
  };

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };
  const submitHandler = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
    setSmartReplies([]); // Clear smart replies after sending
  };

  // Load smart replies when messages change
  useEffect(() => {
    const loadSmartReplies = async () => {
      if (!chatId) return;

      const lastMsg = allMessages?.[allMessages.length - 1];
      if (!lastMsg?._id) return;

      // Only generate replies when the latest message is from the OTHER user (receiver)
      if (lastMsg?.sender?._id === user?._id) {
        setSmartReplies([]);
        lastSmartReplyForMessageIdRef.current = lastMsg._id;
        return;
      }

      // Do not regenerate for the same last message
      if (lastSmartReplyForMessageIdRef.current === lastMsg._id) return;
      lastSmartReplyForMessageIdRef.current = lastMsg._id;

      const replies = await getSmartReplies(chatId);
      setSmartReplies(replies);
    };

    // small debounce
    const timer = setTimeout(loadSmartReplies, 800);
    return () => clearTimeout(timer);
    // IMPORTANT: depend on allMessages length and last message id
  }, [chatId, user?._id, allMessages?.length, allMessages?.[allMessages.length - 1]?._id]);

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When Smart Replies appear/disappear, keep the view pinned to the bottom
  // so the last message isn't hidden and user doesn't need to manually scroll.
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [smartReplies.length]);

  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const messageUpdatedListener = useCallback(
    (data) => {
      if (data?.chatId !== chatId) return;
      const updated = data?.message;
      if (!updated?._id) return;

      // update in real-time list
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m))
      );

      // update in oldMessages cache too
      setOldMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m))
      );
    },
    [chatId, setOldMessages]
  );

  const messageDeletedListener = useCallback(
    (data) => {
      if (data?.chatId !== chatId) return;
      const messageId = data?.messageId;
      if (!messageId) return;

      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setOldMessages((prev) => prev.filter((m) => m._id !== messageId));
    },
    [chatId, setOldMessages]
  );

  const messageReactionUpdatedListener = useCallback(
    (data) => {
      if (data?.chatId !== chatId) return;
      const messageId = data?.messageId;
      if (!messageId) return;

      // Server now sends full summary -> update instantly
      if (Array.isArray(data?.reactions)) {
        const apply = (arr) =>
          arr.map((m) =>
            m._id !== messageId ? m : { ...m, reactions: data.reactions }
          );

        setMessages((prev) => apply(prev));
        setOldMessages((prev) => apply(prev));
        return;
      }

      // Fallback: refetch if payload doesn't include summary
      oldMessagesChunk?.refetch?.();
    },
    [chatId, oldMessagesChunk, setOldMessages]
  );

  const messageDeliveredListener = useCallback(
    (data) => {
      if (data?.chatId !== chatId) return;
      const { messageId, userId } = data;
      if (!messageId || !userId) return;

      const apply = (arr) =>
        arr.map((m) =>
          m._id !== messageId
            ? m
            : { ...m, deliveredTo: Array.from(new Set([...(m.deliveredTo || []), userId])) }
        );

      setMessages((prev) => apply(prev));
      setOldMessages((prev) => apply(prev));
    },
    [chatId, setOldMessages]
  );

  const messageSeenListener = useCallback(
    (data) => {
      if (data?.chatId !== chatId) return;
      const { messageId, userId } = data;
      if (!messageId || !userId) return;

      const apply = (arr) =>
        arr.map((m) =>
          m._id !== messageId
            ? m
            : {
                ...m,
                deliveredTo: Array.from(new Set([...(m.deliveredTo || []), userId])),
                seenBy: Array.from(new Set([...(m.seenBy || []), userId])),
              }
        );

      setMessages((prev) => apply(prev));
      setOldMessages((prev) => apply(prev));
    },
    [chatId, setOldMessages]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [MESSAGE_UPDATED]: messageUpdatedListener,
    [MESSAGE_DELETED]: messageDeletedListener,
    [MESSAGE_REACTION_UPDATED]: messageReactionUpdatedListener,
    [MESSAGE_DELIVERED]: messageDeliveredListener,
    [MESSAGE_SEEN]: messageSeenListener,
  };

  useSocketEvents(socket, eventHandler);

  useErrors(errors);

  const onEditMessage = (msg) => {
    setMessageToEdit(msg);
    setShowEditMessage(true);
  };

  const onDeleteMessage = (msg) => {
    setMessageToDelete(msg);
    setShowDeleteMessage(true);
  };

  const onReactMessage = async (msg, emoji) => {
    if (!msg?._id) return;

    // UI restriction also exists in MessageComponent, but keep a guard here too
    if (msg?.sender?._id === user?._id) return;

    const res = await upsertReaction({ messageId: msg._id, emoji });

    if (res?.reactions && Array.isArray(res.reactions)) {
      const apply = (arr) =>
        arr.map((m) => (m._id !== msg._id ? m : { ...m, reactions: res.reactions }));
      setMessages((prev) => apply(prev));
      setOldMessages((prev) => apply(prev));
    }
  };

  const handleSaveEditedMessage = async (newContent) => {
    if (!messageToEdit?._id) return;
    const res = await updateMessageApi(messageToEdit._id, newContent);
    if (res?.success) {
      setShowEditMessage(false);
      setMessageToEdit(null);
    }
  };

  const handleConfirmDeleteMessage = async () => {
    if (!messageToDelete?._id) return;
    const res = await deleteMessageApi(messageToDelete._id);
    if (res?.success) {
      setShowDeleteMessage(false);
      setMessageToDelete(null);
    }
  };

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          // When Smart Replies are shown (overlay), reserve space so the last message isn't hidden.
          pb: smartReplies.length > 0 ? 10 : 0,
        }}
      >
        {allMessages.map((i) => (
          <MessageComponent
            key={i._id}
            message={i}
            user={user}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onReact={onReactMessage}
            chatMemberCount={chatMemberCount}
          />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      <EditMessageDialog
        open={showEditMessage}
        onClose={() => {
          setShowEditMessage(false);
          setMessageToEdit(null);
        }}
        initialValue={messageToEdit?.content || ""}
        onSave={handleSaveEditedMessage}
      />

      <ConfirmDeleteDialog
        open={showDeleteMessage}
        handleClose={() => {
          setShowDeleteMessage(false);
          setMessageToDelete(null);
        }}
        deleteHandler={handleConfirmDeleteMessage}
        text="Are you sure you want to delete this message?"
      />

      <form
        style={{
          height: "10%",
          position: "relative", // constrain absolute Smart Replies to the chat section
        }}
        onSubmit={submitHandler}
      >
        {/* Smart Replies */}
        {smartReplies.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "100%", // place directly above the form (input bar)
              px: 2,
              pb: 1,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <Box sx={{ pointerEvents: "auto" }}>
              <SmartReplies
                suggestions={smartReplies}
                loading={aiLoading}
                onClose={() => setSmartReplies([])}
                onSelectReply={(reply) => {
                  setMessage(reply);
                  setSmartReplies([]);
                }}
              />
            </Box>
          </Box>
        )}

        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          {/* AI Assistant Button */}
          <Tooltip title="AI Assistant">
            <IconButton
              sx={{
                position: "absolute",
                left: "1.5rem",
                color: "#667eea",
              }}
              onClick={() => setShowAIAssistant(true)}
            >
              <AIIcon />
            </IconButton>
          </Tooltip>

          {/* Attach File Button */}
          <Tooltip title="Attach File">
            <IconButton
              sx={{
                position: "absolute",
                left: "4rem",
                rotate: "30deg",
              }}
              onClick={handleFileOpen}
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>

          {/* Summarize Chat Button */}
          <Tooltip title="Summarize Chat">
            <IconButton
              sx={{
                position: "absolute",
                left: "6.5rem",
                color: "#f59e0b",
              }}
              onClick={() => setShowSummarizer(true)}
            >
              <SummarizeIcon />
            </IconButton>
          </Tooltip>

          <InputBox
            placeholder="Type Message Here..."
            value={message}
            onChange={messageOnChange}
            style={{ marginLeft: "8rem" }}
          />

          {/* Improve Message Button */}
          {message.trim() && (
            <Tooltip title="Improve Message">
              <IconButton
                sx={{
                  color: "#10b981",
                  marginLeft: "0.5rem",
                }}
                onClick={() => setShowMessageImprover(true)}
              >
                <ImproveIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Send Button */}
          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: orange,
              color: "white",
              marginLeft: "0.5rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>

      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />

      {/* AI Dialogs */}
      <AIChatAssistant
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        chatId={chatId}
      />

      <MessageImprover
        open={showMessageImprover}
        onClose={() => setShowMessageImprover(false)}
        originalMessage={message}
        onUseImproved={(improved) => setMessage(improved)}
      />

      <ChatSummarizer
        open={showSummarizer}
        onClose={() => setShowSummarizer(false)}
        chatId={chatId}
      />
    </Fragment>
  );
};

export default AppLayout()(Chat);
