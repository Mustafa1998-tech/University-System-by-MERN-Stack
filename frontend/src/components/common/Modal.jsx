import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Slide,
  Fade,
  Grow,
  Zoom,
  Backdrop,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';

// Transition components
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction=\"up\" ref={ref} {...props} />;
});

const FadeTransition = React.forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const GrowTransition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

const ZoomTransition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const transitions = {
  slide: SlideTransition,
  fade: FadeTransition,
  grow: GrowTransition,
  zoom: ZoomTransition
};

const Modal = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  actions,
  size = 'md', // xs, sm, md, lg, xl, fullscreen
  maxWidth,
  fullScreen = false,
  fullWidth = true,
  showCloseButton = true,
  showFullscreenToggle = false,
  closeOnBackdropClick = true,
  closeOnEscapeKey = true,
  transition = 'slide',
  loading = false,
  error = null,
  warning = null,
  info = null,
  success = null,
  dividers = false,
  scroll = 'paper', // paper, body
  disablePortal = false,
  keepMounted = false,
  className,
  titleProps = {},
  contentProps = {},
  actionsProps = {},
  dialogProps = {},
  onEnter,
  onExit,
  onExited,
  ariaLabelledBy,
  ariaDescribedBy
}) => {
  const { t, isRTL } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isFullscreen, setIsFullscreen] = useState(fullScreen);

  // Size mapping
  const sizeMap = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    fullscreen: false
  };

  const actualMaxWidth = size === 'fullscreen' ? false : (maxWidth || sizeMap[size]);
  const actualFullScreen = isFullscreen || size === 'fullscreen' || isMobile;

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle close
  const handleClose = useCallback((event, reason) => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && !closeOnEscapeKey) {
      return;
    }
    onClose && onClose(event, reason);
  }, [onClose, closeOnBackdropClick, closeOnEscapeKey]);

  // Handle keyboard events
  useEffect(() => {
    if (!open || !closeOnEscapeKey) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose(event, 'escapeKeyDown');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscapeKey, handleClose]);

  // Get transition component
  const TransitionComponent = transitions[transition] || SlideTransition;

  // Alert components for messages
  const renderAlert = (type, message) => {
    if (!message) return null;

    const icons = {
      error: <ErrorIcon />,
      warning: <WarningIcon />,
      info: <InfoIcon />,
      success: <SuccessIcon />
    };

    return (
      <Alert
        severity={type}
        icon={icons[type]}
        sx={{ mb: 2 }}
        onClose={() => {
          // Handle alert close if needed
        }}
      >
        {message}
      </Alert>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionComponent}
      maxWidth={actualMaxWidth}
      fullWidth={fullWidth}
      fullScreen={actualFullScreen}
      scroll={scroll}
      disablePortal={disablePortal}
      keepMounted={keepMounted}
      className={className}
      TransitionProps={{
        onEnter,
        onExit,
        onExited
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: actualFullScreen ? 0 : 2,
          maxHeight: actualFullScreen ? '100vh' : '90vh',
          direction: isRTL ? 'rtl' : 'ltr',
          ...(dialogProps.PaperProps?.sx || {})
        },
        ...dialogProps.PaperProps
      }}
      aria-labelledby={ariaLabelledBy || 'modal-title'}
      aria-describedby={ariaDescribedBy || 'modal-description'}
      {...dialogProps}
    >
      {/* Title */}
      {(title || showCloseButton || showFullscreenToggle) && (
        <DialogTitle
          id=\"modal-title\"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: subtitle ? 1 : 2,
            pr: showCloseButton || showFullscreenToggle ? 1 : 3,
            direction: isRTL ? 'rtl' : 'ltr'
          }}
          {...titleProps}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                variant=\"h6\"
                component=\"h2\"
                sx={{
                  fontWeight: 600,
                  textAlign: isRTL ? 'right' : 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant=\"body2\"
                color=\"text.secondary\"
                sx={{
                  mt: 0.5,
                  textAlign: isRTL ? 'right' : 'left'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {showFullscreenToggle && !isMobile && (
              <IconButton
                onClick={handleFullscreenToggle}
                size=\"small\"
                edge=\"end\"
                aria-label={isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            )}

            {showCloseButton && (
              <IconButton
                onClick={handleClose}
                size=\"small\"
                edge=\"end\"
                aria-label={t('common.close')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      {/* Content */}
      <DialogContent
        dividers={dividers}
        sx={{
          position: 'relative',
          direction: isRTL ? 'rtl' : 'ltr',
          ...(contentProps.sx || {})
        }}
        {...contentProps}
      >
        {/* Loading overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Alert messages */}
        {renderAlert('error', error)}
        {renderAlert('warning', warning)}
        {renderAlert('info', info)}
        {renderAlert('success', success)}

        {/* Main content */}
        {children}
      </DialogContent>

      {/* Actions */}
      {actions && (
        <>
          {dividers && <Divider />}
          <DialogActions
            sx={{
              p: 2,
              direction: isRTL ? 'rtl' : 'ltr',
              ...(actionsProps.sx || {})
            }}
            {...actionsProps}
          >
            {Array.isArray(actions) ? (
              actions.map((action, index) => (
                <React.Fragment key={index}>
                  {action}
                </React.Fragment>
              ))
            ) : (
              actions
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'primary',
  cancelColor = 'inherit',
  severity = 'warning',
  ...modalProps
}) => {
  const { t } = useI18n();

  const handleConfirm = () => {
    onConfirm && onConfirm();
    onClose && onClose();
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  const icons = {
    error: <ErrorIcon color=\"error\" sx={{ fontSize: 48 }} />,
    warning: <WarningIcon color=\"warning\" sx={{ fontSize: 48 }} />,
    info: <InfoIcon color=\"info\" sx={{ fontSize: 48 }} />,
    success: <SuccessIcon color=\"success\" sx={{ fontSize: 48 }} />
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t('common.confirm')}
      size=\"sm\"
      {...modalProps}
      actions={[
        <Button
          key=\"cancel\"
          onClick={handleCancel}
          color={cancelColor}
        >
          {cancelText || t('common.cancel')}
        </Button>,
        <Button
          key=\"confirm\"
          onClick={handleConfirm}
          variant=\"contained\"
          color={confirmColor}
        >
          {confirmText || t('common.confirm')}
        </Button>
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: 2
        }}
      >
        {icons[severity]}
        <Typography variant=\"body1\" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

// Alert Dialog Component
const AlertDialog = ({
  open,
  onClose,
  title,
  message,
  buttonText,
  severity = 'info',
  ...modalProps
}) => {
  const { t } = useI18n();

  const icons = {
    error: <ErrorIcon color=\"error\" sx={{ fontSize: 48 }} />,
    warning: <WarningIcon color=\"warning\" sx={{ fontSize: 48 }} />,
    info: <InfoIcon color=\"info\" sx={{ fontSize: 48 }} />,
    success: <SuccessIcon color=\"success\" sx={{ fontSize: 48 }} />
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size=\"sm\"
      {...modalProps}
      actions={[
        <Button
          key=\"ok\"
          onClick={onClose}
          variant=\"contained\"
          color=\"primary\"
        >
          {buttonText || t('common.ok')}
        </Button>
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: 2
        }}
      >
        {icons[severity]}
        <Typography variant=\"body1\" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
};

export default Modal;
export { ConfirmDialog, AlertDialog };