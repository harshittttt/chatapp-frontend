import { Box, Typography, IconButton, Menu, MenuItem, Chip } from "@mui/material";
import React, { memo, useState } from "react";
import { lightBlue } from "../../constants/color";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import MessageReactions from "../dialogs/MessageReactions";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const MessageComponent = ({ message, user, onEdit, onDelete, onReact, chatMemberCount }) => {
  const {
    sender,
    content,
    attachments = [],
    createdAt,
    updatedAt,
    reactions = [],
    deliveredTo = [],
    seenBy = [],
  } = message;

  const sameSender = sender?._id === user?._id;

  const timeAgo = moment(createdAt).fromNow();
  const edited = updatedAt && updatedAt !== createdAt;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showReactions, setShowReactions] = useState(false);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // WhatsApp-like ticks:
  // - Sent: single tick
  // - Delivered: double grey ticks (delivered to at least 1 other member)
  // - Seen: double blue ticks (seen by everyone else)
  const deliveredCount = Array.isArray(deliveredTo) ? deliveredTo.length : 0;
  const seenCount = Array.isArray(seenBy) ? seenBy.length : 0;
  const otherMembersCount =
    typeof chatMemberCount === "number" && chatMemberCount > 0
      ? Math.max(chatMemberCount - 1, 1)
      : null;

  const isFullySeen =
    otherMembersCount !== null ? seenCount >= otherMembersCount : seenCount > 0;

  const ReceiptIcon = () => {
    if (!sameSender) return null;

    if (isFullySeen) {
      return <DoneAllIcon fontSize="inherit" sx={{ color: "#2196f3" }} />;
    }

    if (deliveredCount > 0) {
      return <DoneAllIcon fontSize="inherit" sx={{ color: "text.secondary" }} />;
    }

    return <DoneIcon fontSize="inherit" sx={{ color: "text.secondary" }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      whileInView={{ opacity: 1, x: 0 }}
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        backgroundColor: "white",
        color: "black",
        borderRadius: "5px",
        padding: "0.5rem",
        width: "fit-content",
        position: "relative",
        maxWidth: "75%",
        wordBreak: "break-word",
      }}
    >
      {/* small top spacing for visual balance */}
      <Box sx={{ height: 2 }} />

      {/* Reactions picker (popover-ish) */}
      {showReactions && (
        <Box
          sx={{
            position: "absolute",
            top: -44,
            right: sameSender ? 0 : "auto",
            left: sameSender ? "auto" : 0,
            zIndex: 3,
          }}
        >
          <MessageReactions
            onSelect={(emoji) => {
              setShowReactions(false);
              onReact?.(message, emoji);
            }}
          />
        </Box>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        {sameSender && onEdit && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEdit(message);
            }}
          >
            Edit
          </MenuItem>
        )}
        {sameSender && onDelete && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete(message);
            }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>

      {!sameSender && (
        <Typography color={lightBlue} fontWeight={"600"} variant="caption">
          {sender.name}
        </Typography>
      )}

      {content && <Typography>{content}</Typography>}

      {/* Reaction summary chips */}
      {reactions?.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {reactions.map((r) => (
            <Chip
              key={r.emoji}
              size="small"
              label={`${r.emoji} ${r.count}`}
              sx={{ bgcolor: "rgba(0,0,0,0.04)" }}
            />
          ))}
        </Box>
      )}

      {attachments.length > 0 &&
        attachments.map((attachment, index) => {
          const url = attachment.url;
          const file = fileFormat(url);

          return (
            <Box key={index}>
              <a
                href={url}
                target="_blank"
                download
                style={{
                  color: "black",
                }}
              >
                {RenderAttachment(file, url)}
              </a>
            </Box>
          );
        })}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mt: 0.25,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" color={"text.secondary"}>
            {timeAgo}
            {edited ? " • edited" : ""}
          </Typography>

          {sameSender && (
            <Box sx={{ display: "flex", alignItems: "center", fontSize: 16, lineHeight: 1 }}>
              <ReceiptIcon />
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          {/* Only allow reacting to received messages */}
          {!sameSender && onReact && (
            <IconButton
              size="small"
              onClick={() => setShowReactions((v) => !v)}
              sx={{ p: 0.25, color: "text.secondary" }}
            >
              <AddReactionIcon fontSize="small" />
            </IconButton>
          )}

          {sameSender && (onEdit || onDelete) && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                p: 0.25,
                ml: 0.25,
                color: "text.secondary",
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* click-away to close reaction picker */}
      {showReactions && (
        <Box
          onClick={() => setShowReactions(false)}
          sx={{ position: "fixed", inset: 0, zIndex: 2 }}
        />
      )}
    </motion.div>
  );
};

export default memo(MessageComponent);
