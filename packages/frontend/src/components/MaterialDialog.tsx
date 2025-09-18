import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface MaterialDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const MaterialDialog: React.FC<MaterialDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: '92vh',
          overflow: 'hidden',
          margin: '8vh auto'
        }
      }}
    >
      {title && (
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '1.25rem',
                lineHeight: 1.6
              }}
            >
              <span className="title-font">{title}</span>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
      )}
      <DialogContent sx={{ pt: title ? 0 : 2, overflow: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default MaterialDialog;
