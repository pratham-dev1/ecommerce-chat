import {
  Avatar,
  Badge,
  Box,
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

const conversations = [
  {
    avatar: "AM",
    lastMessage: "The blue hoodie is back in stock.",
    name: "Aarav Mehta",
    time: "10:42",
    unread: 2,
  },
  {
    avatar: "SR",
    lastMessage: "Order #EC-2147 has been delivered.",
    name: "Sneha Rao",
    time: "09:18",
    unread: 0,
  },
  {
    avatar: "VK",
    lastMessage: "Can you share the invoice?",
    name: "Vikram Kapoor",
    time: "Yesterday",
    unread: 1,
  },
  {
    avatar: "NP",
    lastMessage: "Thanks, I will check it now.",
    name: "Nisha Patel",
    time: "Tue",
    unread: 0,
  },
  {
    avatar: "RS",
    lastMessage: "Is cash on delivery available?",
    name: "Rahul Shah",
    time: "Mon",
    unread: 0,
  },
];

const messages = [
  {
    body: "Hi, I wanted to check whether the blue hoodie is available in medium.",
    direction: "in",
    time: "10:32",
  },
  {
    body: "Yes, medium is available now. I can reserve it with your current cart.",
    direction: "out",
    time: "10:34",
  },
  {
    body: "Perfect. Can it arrive by Friday?",
    direction: "in",
    time: "10:36",
  },
  {
    body: "For your pincode, standard delivery shows Friday. Express delivery can arrive one day earlier.",
    direction: "out",
    time: "10:39",
  },
  {
    body: "Great, I will place the order with express delivery.",
    direction: "in",
    time: "10:42",
  },
];

export function ChatPage() {
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
              5 conversations
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
          {conversations.map((conversation, index) => {
            const isSelected = index === 0;

            return (
              <ListItemButton
                key={conversation.name}
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
                    bgcolor: isSelected ? "primary.main" : "secondary.main",
                    fontSize: "0.86rem",
                    fontWeight: 800,
                  }}
                >
                  {conversation.avatar}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography noWrap sx={{ flex: 1, fontWeight: 750 }} variant="body2">
                      {conversation.name}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {conversation.time}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" noWrap variant="body2">
                    {conversation.lastMessage}
                  </Typography>
                </Box>
                {conversation.unread > 0 ? (
                  <Box
                    sx={{
                      alignItems: "center",
                      bgcolor: "primary.main",
                      borderRadius: "999px",
                      color: "primary.contrastText",
                      display: "flex",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      height: 22,
                      justifyContent: "center",
                      minWidth: 22,
                      px: 0.75,
                    }}
                  >
                    {conversation.unread}
                  </Box>
                ) : null}
              </ListItemButton>
            );
          })}
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
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>AM</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800 }} variant="body1">
              Aarav Mehta
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Online
            </Typography>
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
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Typography
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 999,
                color: "text.secondary",
                px: 1.5,
                py: 0.5,
              }}
              variant="caption"
            >
              Today
            </Typography>
          </Box>

          {messages.map((message) => {
            const isOutgoing = message.direction === "out";

            return (
              <Box
                key={`${message.time}-${message.body}`}
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
                    <Typography variant="caption">{message.time}</Typography>
                    {isOutgoing ? <CheckCheck size={14} /> : null}
                  </Stack>
                </Box>
              </Box>
            );
          })}
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
          <TextField placeholder="Type a message" size="small" sx={{ flex: 1, minWidth: 0 }} />
          <Tooltip title="Send">
            <IconButton
              aria-label="Send message"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <Send size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
