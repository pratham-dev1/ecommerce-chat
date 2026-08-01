import {
  Alert,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CheckCheck,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  createDirectConversation,
  getConversationMessages,
  sendMessage,
} from "@/features/chat/api/chatApi";
import { useAuthUser } from "@/features/auth";
import type { Conversation } from "@/features/chat/types/chat";

type ChatTarget = {
  name: string;
  userId: number;
};

export function ChatPage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: currentUser } = useAuthUser();
  const chatTarget = getChatTargetFromLocationState(location.state);
  const receiverId = chatTarget?.userId ?? null;
  const chatTitle = chatTarget?.name ?? "Select a chat";
  const chatAvatar = chatTarget ? getInitials(chatTarget.name) : "CH";
  const [directConversation, setDirectConversation] = useState<Conversation | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isDirectConversationError, setIsDirectConversationError] = useState(false);
  const [isDirectConversationLoading, setIsDirectConversationLoading] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const startedConversationForUserId = useRef<number | null>(null);
  const messagesQueryKey = ["chat", "messages", conversationId] as const;
  const {
    data: messages = [],
    isError: isMessagesError,
    isLoading: isMessagesLoading,
  } = useQuery({
    enabled: conversationId !== null,
    queryFn: () => getConversationMessages(Number(conversationId)),
    queryKey: messagesQueryKey,
  });
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async () => {
      setMessageBody("");
      await queryClient.invalidateQueries({ queryKey: messagesQueryKey });
    },
  });
  const conversationCount = chatTarget ? "1 conversation" : "0 conversations";
  const conversationStatus = isDirectConversationLoading
    ? "Starting conversation"
    : messages.at(-1)?.body ?? "No messages yet.";
  const chatSubtitle = chatTarget
    ? isDirectConversationLoading
      ? "Starting conversation"
      : ""
    : "Choose a user to start a conversation";

  useEffect(() => {
    if (!receiverId || startedConversationForUserId.current === receiverId) {
      return;
    }

    let isActive = true;

    startedConversationForUserId.current = receiverId;
    setDirectConversation(null);
    setConversationId(null);
    setIsDirectConversationError(false);
    setIsDirectConversationLoading(true);

    createDirectConversation(receiverId)
      .then((conversation) => {
        if (!isActive) {
          return;
        }

        const nextConversationId = Number(conversation.id);

        if (!Number.isInteger(nextConversationId)) {
          throw new Error("Conversation response did not include a valid id");
        }

        setDirectConversation(conversation);
        setConversationId(nextConversationId);
      })
      .catch(() => {
        if (isActive) {
          setIsDirectConversationError(true);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsDirectConversationLoading(false);
        }
      });

    return () => {
      isActive = false;
      if (startedConversationForUserId.current === receiverId) {
        startedConversationForUserId.current = null;
      }
    };
  }, [receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const handleSendMessage = async () => {
    const trimmedBody = messageBody.trim();

    if (!conversationId || !trimmedBody || sendMessageMutation.isPending) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      body: trimmedBody,
      conversationId,
    });
  };

  return (
    <Paper
      sx={{
        borderColor: "divider",
        display: "grid",
        gridTemplateColumns: { md: "330px minmax(0, 1fr)", xs: "1fr" },
        height: { md: "calc(100vh - 144px)", xs: "auto" },
        minHeight: { md: 620, xs: "auto" },
        overflow: "hidden",
      }}
      variant="outlined"
    >
      <Stack
        sx={{
          borderRight: { md: 1, xs: 0 },
          borderBottom: { md: 0, xs: 1 },
          borderColor: "divider",
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            bgcolor: "background.paper",
            px: 2,
            py: 1.75,
          }}
        >
          <Badge
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            color="success"
            overlap="circular"
            variant="dot"
          >
            <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>EC</Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800 }} variant="body1">
              Chats
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {conversationCount}
            </Typography>
          </Box>
          <Tooltip title="More">
            <IconButton aria-label="More chat options" size="small">
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            placeholder="Search chats"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Divider />

        <List disablePadding sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {chatTarget ? (
            <ListItemButton
              selected
              sx={{
                alignItems: "flex-start",
                borderBottom: 1,
                borderColor: "divider",
                gap: 1.5,
                px: 2,
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
                "&.Mui-selected:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  fontSize: "0.86rem",
                  fontWeight: 800,
                }}
              >
                {chatAvatar}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 750 }} variant="body2">
                  {chatTarget.name}
                </Typography>
                <Typography color="text.secondary" noWrap variant="body2">
                  {conversationStatus}
                </Typography>
              </Box>
            </ListItemButton>
          ) : (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography color="text.secondary" variant="body2">
                No conversations yet.
              </Typography>
            </Box>
          )}
        </List>
      </Stack>

      <Stack sx={{ minHeight: { md: 0, xs: 620 }, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            py: 1.5,
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>{chatAvatar}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800 }} variant="body1">
              {chatTitle}
            </Typography>
            {chatSubtitle ? (
              <Typography color="text.secondary" variant="body2">
                {chatSubtitle}
              </Typography>
            ) : null}
          </Box>
          <Tooltip title="Voice call">
            <IconButton aria-label="Voice call" size="small">
              <Phone size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Video call">
            <IconButton aria-label="Video call" size="small">
              <Video size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton aria-label="More conversation options" size="small">
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        {receiverId && (isDirectConversationLoading || isDirectConversationError) ? (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 2,
              py: 1,
            }}
          >
            {isDirectConversationLoading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CircularProgress size={16} />
                <Typography color="text.secondary" variant="body2">
                  Starting conversation
                </Typography>
              </Stack>
            ) : null}

            {isDirectConversationError ? (
              <Alert severity="error" variant="outlined">
                Conversation could not be started.
              </Alert>
            ) : null}
          </Box>
        ) : null}

        <Stack
          spacing={1.25}
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.03)
                : alpha(theme.palette.primary.main, 0.035),
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: { sm: 3, xs: 1.5 },
            py: 2.5,
          }}
        >
          {!chatTarget ? (
            <Box sx={{ display: "grid", flex: 1, placeItems: "center" }}>
              <Typography color="text.secondary" variant="body2">
                Select a user to start a conversation.
              </Typography>
            </Box>
          ) : null}

          {chatTarget && isMessagesLoading ? (
            <Stack spacing={1} sx={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
              <CircularProgress size={20} />
              <Typography color="text.secondary" variant="body2">
                Loading messages
              </Typography>
            </Stack>
          ) : null}

          {chatTarget && isMessagesError ? (
            <Alert severity="error" variant="outlined">
              Messages could not be loaded.
            </Alert>
          ) : null}

          {sendMessageMutation.isError ? (
            <Alert severity="error" variant="outlined">
              Message could not be sent.
            </Alert>
          ) : null}

          {chatTarget && !isMessagesLoading && !isMessagesError && messages.length === 0 ? (
            <Box sx={{ display: "grid", flex: 1, placeItems: "center" }}>
              <Typography color="text.secondary" variant="body2">
                No messages yet.
              </Typography>
            </Box>
          ) : null}

          {messages.map((message) => {
            const isOutgoing = currentUser?.id === message.senderId;

            return (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent: isOutgoing ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    bgcolor: isOutgoing ? "primary.main" : "background.paper",
                    border: isOutgoing ? 0 : 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    borderTopLeftRadius: isOutgoing ? 16 : 4,
                    borderTopRightRadius: isOutgoing ? 4 : 16,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "none"
                        : "0 8px 20px rgba(23, 32, 38, 0.06)",
                    color: isOutgoing ? "primary.contrastText" : "text.primary",
                    maxWidth: { sm: "68%", xs: "86%" },
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography variant="body2">{message.body}</Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: "center",
                      color: isOutgoing ? "primary.contrastText" : "text.secondary",
                      justifyContent: "flex-end",
                      mt: 0.5,
                      opacity: isOutgoing ? 0.82 : 1,
                    }}
                  >
                    <Typography variant="caption">
                      {formatMessageTime(message.createdAt)}
                    </Typography>
                    {isOutgoing ? <CheckCheck size={14} /> : null}
                  </Stack>
                </Box>
              </Box>
            );
          })}
          <Box ref={messagesEndRef} />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            borderTop: 1,
            borderColor: "divider",
            px: 2,
            py: 1.5,
          }}
        >
          <Tooltip title="Emoji">
            <IconButton aria-label="Emoji" size="small">
              <Smile size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Attach file">
            <IconButton aria-label="Attach file" size="small">
              <Paperclip size={20} />
            </IconButton>
          </Tooltip>
          <TextField
            disabled={!conversationId || sendMessageMutation.isPending}
            onChange={(event) => setMessageBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder="Type a message"
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
            value={messageBody}
          />
          <Tooltip title="Send">
            <span>
              <IconButton
                aria-label="Send message"
                disabled={
                  !conversationId ||
                  !messageBody.trim() ||
                  sendMessageMutation.isPending
                }
                onClick={() => {
                  void handleSendMessage();
                }}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&.Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "action.disabled",
                  },
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                {sendMessageMutation.isPending ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

function getChatTargetFromLocationState(state: unknown): ChatTarget | null {
  if (
    typeof state === "object" &&
    state !== null &&
    "userId" in state &&
    "name" in state &&
    typeof state.userId === "number" &&
    typeof state.name === "string"
  ) {
    return {
      name: state.name,
      userId: state.userId,
    };
  }

  return null;
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
