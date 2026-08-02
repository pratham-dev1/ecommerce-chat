import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
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
  Plus,
  Search,
  Send,
  Smile,
  UsersRound,
  Video,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UIEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createDirectConversation,
  createGroupConversation,
  getConversations,
  getConversationMessages,
} from "@/features/chat/api/chatApi";
import { useAuthUser } from "@/features/auth";
import type {
  ChatConversation,
  ChatMessage,
} from "@/features/chat/types/chat";
import { useInfiniteUsers, type User } from "@/features/users";
import {
  joinConversationRoom,
  sendSocketMessage,
  socket,
} from "@/services/socket/socketClient";

type DirectChatTarget = {
  name: string;
  type: "direct";
  userId: number;
};

type GroupChatTarget = {
  conversationId: number;
  conversationType: "direct" | "group";
  name: string;
  type: "conversation";
};

type ChatTarget = DirectChatTarget | GroupChatTarget;

const chatConversationsQueryKey = ["chat", "conversations"] as const;

export function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useAuthUser();
  const chatTarget = getChatTargetFromLocationState(location.state);
  const receiverId = chatTarget?.type === "direct" ? chatTarget.userId : null;
  const groupConversationId =
    chatTarget?.type === "conversation" ? chatTarget.conversationId : null;
  const chatTitle = chatTarget?.name ?? "Select a chat";
  const chatAvatar = chatTarget ? getInitials(chatTarget.name) : "CH";
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isDirectConversationError, setIsDirectConversationError] = useState(false);
  const [isDirectConversationLoading, setIsDirectConversationLoading] = useState(false);
  const [isConversationJoinError, setIsConversationJoinError] = useState(false);
  const [isConversationJoined, setIsConversationJoined] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMemberSearch, setGroupMemberSearch] = useState("");
  const [debouncedGroupMemberSearch, setDebouncedGroupMemberSearch] = useState("");
  const [isGroupMemberSearchPending, setIsGroupMemberSearchPending] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<number[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const startedConversationForUserId = useRef<number | null>(null);
  const joinedConversationId = useRef<number | null>(null);
  const groupUsersQueryParams = useMemo(
    () => ({
      pageSize: 25,
      ...(debouncedGroupMemberSearch
        ? { search: debouncedGroupMemberSearch }
        : {}),
    }),
    [debouncedGroupMemberSearch],
  );
  const groupUsersQuery = useInfiniteUsers(groupUsersQueryParams);
  const groupMemberOptions = useMemo(
    () =>
      groupUsersQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [groupUsersQuery.data?.pages],
  );
  const trimmedGroupMemberSearch = groupMemberSearch.trim();
  const isGroupMemberSearchDebouncing =
    isGroupDialogOpen && trimmedGroupMemberSearch !== debouncedGroupMemberSearch;
  const isSearchingGroupMembers =
    Boolean(trimmedGroupMemberSearch) &&
    (isGroupMemberSearchPending ||
      isGroupMemberSearchDebouncing ||
      groupUsersQuery.isFetching) &&
    !groupUsersQuery.isFetchingNextPage;
  const messagesQueryKey = ["chat", "messages", conversationId] as const;
  const {
    data: conversations = [],
    isError: isConversationsError,
    isLoading: isConversationsLoading,
  } = useQuery({
    queryFn: getConversations,
    queryKey: chatConversationsQueryKey,
  });
  const filteredConversations = useMemo(
    () => filterConversations(conversations, conversationSearch),
    [conversationSearch, conversations],
  );
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
    mutationFn: sendSocketMessage,
    onSuccess: () => {
      setMessageBody("");
    },
  });
  const createGroupConversationMutation = useMutation({
    mutationFn: createGroupConversation,
    onSuccess: (conversation) => {
      closeGroupDialog();
      void queryClient.invalidateQueries({
        queryKey: chatConversationsQueryKey,
      });
      navigate("/chat", {
        state: {
          conversationId: conversation.id,
          conversationType: conversation.type,
          name: conversation.title ?? "Group",
          type: "conversation",
        },
      });
    },
  });
  const conversationCount =
    conversations.length === 1
      ? "1 conversation"
      : `${conversations.length} conversations`;
  const chatSubtitle = chatTarget
    ? isDirectConversationLoading
      ? "Starting conversation"
      : ""
    : "Choose a user to start a conversation";

  useEffect(() => {
    if (!isGroupDialogOpen) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedGroupMemberSearch(groupMemberSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [groupMemberSearch, isGroupDialogOpen]);

  useEffect(() => {
    if (
      !isGroupMemberSearchPending ||
      trimmedGroupMemberSearch !== debouncedGroupMemberSearch ||
      groupUsersQuery.isFetching
    ) {
      return;
    }

    setIsGroupMemberSearchPending(false);
  }, [
    debouncedGroupMemberSearch,
    groupUsersQuery.isFetching,
    isGroupMemberSearchPending,
    trimmedGroupMemberSearch,
  ]);

  useEffect(() => {
    if (!receiverId || startedConversationForUserId.current === receiverId) {
      return;
    }

    let isActive = true;

    startedConversationForUserId.current = receiverId;
    setConversationId(null);
    setIsDirectConversationError(false);
    setIsDirectConversationLoading(true);
    setIsConversationJoined(false);
    setIsConversationJoinError(false);
    joinedConversationId.current = null;

    createDirectConversation(receiverId)
      .then((conversation) => {
        if (!isActive) {
          return;
        }

        const nextConversationId = Number(conversation.id);

        if (!Number.isInteger(nextConversationId)) {
          throw new Error("Conversation response did not include a valid id");
        }

        setConversationId(nextConversationId);
        void queryClient.invalidateQueries({
          queryKey: chatConversationsQueryKey,
        });
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
  }, [queryClient, receiverId]);

  useEffect(() => {
    if (!groupConversationId) {
      return;
    }

    setConversationId(groupConversationId);
    setIsDirectConversationError(false);
    setIsDirectConversationLoading(false);
    setIsConversationJoined(false);
    setIsConversationJoinError(false);
    joinedConversationId.current = null;
  }, [groupConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  useEffect(() => {
    if (!conversationId || joinedConversationId.current === conversationId) {
      return;
    }

    let isActive = true;

    joinedConversationId.current = conversationId;
    setIsConversationJoined(false);
    setIsConversationJoinError(false);

    joinConversationRoom(conversationId)
      .then((response) => {
        if (!isActive) {
          return;
        }

        if (!response.ok) {
          joinedConversationId.current = null;
          setIsConversationJoined(false);
          setIsConversationJoinError(true);
          return;
        }

        setIsConversationJoined(true);
      })
      .catch(() => {
        if (isActive) {
          joinedConversationId.current = null;
          setIsConversationJoined(false);
          setIsConversationJoinError(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [conversationId]);

  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      queryClient.setQueryData<ChatConversation[]>(
        chatConversationsQueryKey,
        (currentConversations = []) =>
          sortConversationsByLatestMessage(
            currentConversations.map((conversation) =>
              conversation.id === message.conversationId
                ? {
                    ...conversation,
                    lastMessage: message,
                    updatedAt: message.updatedAt,
                  }
                : conversation,
            ),
          ),
      );

      if (message.conversationId !== conversationId) {
        return;
      }

      queryClient.setQueryData<ChatMessage[]>(
        ["chat", "messages", message.conversationId],
        (currentMessages = []) => {
          const isExistingMessage = currentMessages.some(
            (currentMessage) => currentMessage.id === message.id,
          );

          return isExistingMessage
            ? currentMessages
            : [...currentMessages, message];
        },
      );
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, queryClient]);

  const handleSendMessage = async () => {
    const trimmedBody = messageBody.trim();

    if (
      !conversationId ||
      !isConversationJoined ||
      !trimmedBody ||
      sendMessageMutation.isPending
    ) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      body: trimmedBody,
      conversationId,
    });
  };

  const openGroupDialog = () => {
    setIsGroupDialogOpen(true);
  };

  const closeGroupDialog = () => {
    if (createGroupConversationMutation.isPending) {
      return;
    }

    setIsGroupDialogOpen(false);
    setGroupTitle("");
    setGroupMemberSearch("");
    setDebouncedGroupMemberSearch("");
    setIsGroupMemberSearchPending(false);
    setSelectedGroupMemberIds([]);
  };

  const handleGroupMemberSearchChange = (value: string) => {
    setGroupMemberSearch(value);
    setIsGroupMemberSearchPending(Boolean(value.trim()));
  };

  const toggleGroupMember = (userId: number) => {
    setSelectedGroupMemberIds((currentMemberIds) =>
      currentMemberIds.includes(userId)
        ? currentMemberIds.filter((memberId) => memberId !== userId)
        : [...currentMemberIds, userId],
    );
  };

  const handleCreateGroup = async () => {
    const trimmedTitle = groupTitle.trim();

    if (
      !trimmedTitle ||
      selectedGroupMemberIds.length === 0 ||
      createGroupConversationMutation.isPending
    ) {
      return;
    }

    await createGroupConversationMutation.mutateAsync({
      memberIds: selectedGroupMemberIds,
      title: trimmedTitle,
    });
  };

  const handleGroupMembersScroll = (event: UIEvent<HTMLDivElement>) => {
    const listElement = event.currentTarget;
    const distanceFromBottom =
      listElement.scrollHeight - listElement.scrollTop - listElement.clientHeight;

    if (
      distanceFromBottom > 80 ||
      !groupUsersQuery.hasNextPage ||
      groupUsersQuery.isFetchingNextPage
    ) {
      return;
    }

    void groupUsersQuery.fetchNextPage();
  };

  const handleOpenConversation = (conversation: ChatConversation) => {
    navigate("/chat", {
      state: {
        conversationId: conversation.id,
        conversationType: conversation.type,
        name: conversation.displayName,
        type: "conversation",
      },
    });
  };

  return (
    <>
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
          <Tooltip title="Create group">
            <IconButton
              aria-label="Create group"
              onClick={openGroupDialog}
              size="small"
            >
              <UsersRound size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton aria-label="More chat options" size="small">
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            onChange={(event) => setConversationSearch(event.target.value)}
            placeholder="Search chats"
            size="small"
            slotProps={{
              input: {
                endAdornment: isSearchingGroupMembers ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : null,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              },
            }}
            value={conversationSearch}
          />
        </Box>

        <Divider />

        <List disablePadding sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {isConversationsLoading ? (
            <Stack spacing={1} sx={{ alignItems: "center", px: 2, py: 3 }}>
              <CircularProgress size={20} />
              <Typography color="text.secondary" variant="body2">
                Loading conversations
              </Typography>
            </Stack>
          ) : null}

          {isConversationsError ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Alert severity="error" variant="outlined">
                Conversations could not be loaded.
              </Alert>
            </Box>
          ) : null}

          {!isConversationsLoading &&
          !isConversationsError &&
          filteredConversations.length === 0 ? (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography color="text.secondary" variant="body2">
                No conversations yet.
              </Typography>
            </Box>
          ) : null}

          {!isConversationsLoading && !isConversationsError
            ? filteredConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={conversation.id === conversationId}
                  onClick={() => handleOpenConversation(conversation)}
                />
              ))
            : null}
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

        {chatTarget && isConversationJoinError ? (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 2,
              py: 1,
            }}
          >
            <Alert severity="warning" variant="outlined">
              Realtime chat connection is not ready.
            </Alert>
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
            disabled={
              !conversationId ||
              !isConversationJoined ||
              sendMessageMutation.isPending
            }
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
                  !isConversationJoined ||
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
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={closeGroupDialog}
      open={isGroupDialogOpen}
    >
      <DialogTitle>Create group</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {createGroupConversationMutation.isError ? (
            <Alert severity="error" variant="outlined">
              Group could not be created.
            </Alert>
          ) : null}

          <TextField
            autoFocus
            disabled={createGroupConversationMutation.isPending}
            label="Group name"
            onChange={(event) => setGroupTitle(event.target.value)}
            size="small"
            value={groupTitle}
          />

          <TextField
            disabled={createGroupConversationMutation.isPending}
            placeholder="Search members"
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
            value={groupMemberSearch}
            onChange={(event) => handleGroupMemberSearchChange(event.target.value)}
          />

          {isSearchingGroupMembers ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", color: "text.secondary" }}
            >
              <CircularProgress size={14} />
              <Typography variant="body2">Searching users</Typography>
            </Stack>
          ) : null}

          <Paper
            onScroll={handleGroupMembersScroll}
            sx={{ maxHeight: 320, overflowY: "auto" }}
            variant="outlined"
          >
            {isSearchingGroupMembers ? <LinearProgress /> : null}

            {groupUsersQuery.isLoading && groupMemberOptions.length === 0 ? (
              <Stack
                spacing={1}
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 180,
                }}
              >
                <CircularProgress size={20} />
                <Typography color="text.secondary" variant="body2">
                  Loading users
                </Typography>
              </Stack>
            ) : null}

            {isSearchingGroupMembers && groupMemberOptions.length === 0 ? (
              <Stack
                spacing={1}
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 180,
                }}
              >
                <CircularProgress size={20} />
                <Typography color="text.secondary" variant="body2">
                  Searching users
                </Typography>
              </Stack>
            ) : null}

            {groupUsersQuery.isError ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" variant="outlined">
                  Users could not be loaded.
                </Alert>
              </Box>
            ) : null}

            {!groupUsersQuery.isLoading &&
            !groupUsersQuery.isFetching &&
            !isSearchingGroupMembers &&
            !groupUsersQuery.isError &&
            groupMemberOptions.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="body2">
                  No users found.
                </Typography>
              </Box>
            ) : null}

            {!groupUsersQuery.isError && groupMemberOptions.length > 0 ? (
              <List disablePadding>
                {groupMemberOptions.map((user) => (
                  <GroupMemberOption
                    key={user.id}
                    disabled={
                      createGroupConversationMutation.isPending ||
                      user.id === currentUser?.id
                    }
                    isCurrentUser={user.id === currentUser?.id}
                    isSelected={selectedGroupMemberIds.includes(user.id)}
                    onToggle={() => toggleGroupMember(user.id)}
                    user={user}
                  />
                ))}
                {groupUsersQuery.isFetching &&
                !groupUsersQuery.isFetchingNextPage ? (
                  <Stack
                    spacing={1}
                    sx={{ alignItems: "center", px: 2, py: 1.5 }}
                  >
                    <CircularProgress size={18} />
                    <Typography color="text.secondary" variant="body2">
                      Searching users
                    </Typography>
                  </Stack>
                ) : null}
                {groupUsersQuery.isFetchingNextPage ? (
                  <Stack
                    spacing={1}
                    sx={{ alignItems: "center", px: 2, py: 1.5 }}
                  >
                    <CircularProgress size={18} />
                    <Typography color="text.secondary" variant="body2">
                      Loading more users
                    </Typography>
                  </Stack>
                ) : null}
              </List>
            ) : null}
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          disabled={createGroupConversationMutation.isPending}
          onClick={closeGroupDialog}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          disabled={
            !groupTitle.trim() ||
            selectedGroupMemberIds.length === 0 ||
            createGroupConversationMutation.isPending
          }
          onClick={() => {
            void handleCreateGroup();
          }}
          startIcon={
            createGroupConversationMutation.isPending ? (
              <CircularProgress color="inherit" size={16} />
            ) : (
              <Plus size={16} />
            )
          }
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

function GroupMemberOption({
  disabled,
  isCurrentUser,
  isSelected,
  onToggle,
  user,
}: {
  disabled: boolean;
  isCurrentUser: boolean;
  isSelected: boolean;
  onToggle: () => void;
  user: User;
}) {
  return (
    <ListItemButton
      disabled={disabled}
      onClick={onToggle}
      sx={{
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
        gap: 1.5,
        px: 2,
        py: 1.25,
        "&:last-of-type": {
          borderBottom: 0,
        },
      }}
    >
      <Checkbox checked={isSelected} disableRipple sx={{ p: 0 }} />
      <Avatar
        sx={{
          bgcolor: "primary.main",
          fontSize: "0.82rem",
          fontWeight: 800,
        }}
      >
        {getInitials(user.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 750 }} variant="body2">
          {user.name}
        </Typography>
        <Typography color="text.secondary" noWrap variant="body2">
          {isCurrentUser ? "Added automatically" : user.email}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const summary =
    conversation.lastMessage?.body ??
    (conversation.type === "group"
      ? `${conversation.members.length} members`
      : "No messages yet.");

  return (
    <ListItemButton
      onClick={onClick}
      selected={isSelected}
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
        {conversation.type === "group" ? (
          <UsersRound size={16} />
        ) : (
          getInitials(conversation.displayName)
        )}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "baseline", minWidth: 0 }}
        >
          <Typography noWrap sx={{ flex: 1, fontWeight: 750 }} variant="body2">
            {conversation.displayName}
          </Typography>
          {conversation.lastMessage ? (
            <Typography color="text.secondary" variant="caption">
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </Typography>
          ) : null}
        </Stack>
        <Typography color="text.secondary" noWrap variant="body2">
          {summary}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

function getChatTargetFromLocationState(state: unknown): ChatTarget | null {
  if (
    typeof state === "object" &&
    state !== null &&
    "type" in state &&
    state.type === "conversation" &&
    "conversationId" in state &&
    "conversationType" in state &&
    "name" in state &&
    typeof state.conversationId === "number" &&
    (state.conversationType === "direct" || state.conversationType === "group") &&
    typeof state.name === "string"
  ) {
    return {
      conversationId: state.conversationId,
      conversationType: state.conversationType,
      name: state.name,
      type: "conversation",
    };
  }

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
      type: "direct",
      userId: state.userId,
    };
  }

  return null;
}

function filterConversations(
  conversations: ChatConversation[],
  searchValue: string,
) {
  const normalizedSearchValue = searchValue.trim().toLowerCase();

  if (!normalizedSearchValue) {
    return conversations;
  }

  return conversations.filter((conversation) => {
    const lastMessageBody = conversation.lastMessage?.body ?? "";

    return (
      conversation.displayName.toLowerCase().includes(normalizedSearchValue) ||
      lastMessageBody.toLowerCase().includes(normalizedSearchValue)
    );
  });
}

function sortConversationsByLatestMessage(conversations: ChatConversation[]) {
  return [...conversations].sort((firstConversation, secondConversation) => {
    const firstTime = new Date(
      firstConversation.lastMessage?.createdAt ?? firstConversation.updatedAt,
    ).getTime();
    const secondTime = new Date(
      secondConversation.lastMessage?.createdAt ?? secondConversation.updatedAt,
    ).getTime();

    return secondTime - firstTime;
  });
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
