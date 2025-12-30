import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import React, { memo, useState } from "react";
import { lightBlue } from "../../constants/color";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const MessageComponent = ({ message, user, onEdit, onDelete }) => {
  const { sender, content, attachments = [], createdAt, updatedAt } = message;

  const sameSender = sender?._id === user?._id;

  const timeAgo = moment(createdAt).fromNow();
  const edited = updatedAt && updatedAt !== createdAt;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
        <Typography variant="caption" color={"text.secondary"}>
          {timeAgo}
          {edited ? " • edited" : ""}
        </Typography>

        {sameSender && (onEdit || onDelete) && (
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              p: 0.25,
              ml: 1,
              color: "text.secondary",
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </motion.div>
  );
};

export default memo(MessageComponent);
