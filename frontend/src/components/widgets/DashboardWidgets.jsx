import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  LinearProgress,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';

// Stat Widget Component
const StatWidget = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  loading = false,
  onClick,
  actions,
  variant = 'default', // default, minimal, highlighted
  size = 'medium' // small, medium, large
}) => {
  const { formatNumber, isRTL } = useI18n();
  const theme = useTheme();

  const getColorValue = (colorKey) => {
    if (theme.palette[colorKey]) {
      return theme.palette[colorKey].main;
    }
    return colorKey;
  };

  const colorValue = getColorValue(color);

  const renderTrend = () => {
    if (!trend || !trendValue) return null;

    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const trendColor = isPositive ? 'success.main' : 'error.main';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
        <Typography
          variant=\"caption\"
          sx={{ color: trendColor, fontWeight: 600 }}
        >
          {trendValue}%
        </Typography>
      </Box>
    );
  };

  const cardProps = {
    sx: {
      cursor: onClick ? 'pointer' : 'default',
      height: '100%',
      transition: 'all 0.2s ease-in-out',
      ...(onClick && {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }),
      ...(variant === 'highlighted' && {
        background: `linear-gradient(135deg, ${colorValue} 0%, ${alpha(colorValue, 0.8)} 100%)`,
        color: 'white'
      })
    },
    onClick
  };

  const iconSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const titleVariant = size === 'small' ? 'body2' : size === 'large' ? 'h5' : 'h6';
  const valueVariant = size === 'small' ? 'h6' : size === 'large' ? 'h3' : 'h4';

  if (variant === 'minimal') {
    return (
      <Card {...cardProps} elevation={1}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && (
              <Avatar
                sx={{
                  bgcolor: alpha(colorValue, 0.1),
                  color: colorValue,
                  width: iconSize,
                  height: iconSize
                }}
              >
                {icon}
              </Avatar>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant={titleVariant}
                color=\"text.secondary\"
                sx={{ fontWeight: 500 }}
              >
                {title}
              </Typography>
              {loading ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
              ) : (
                <Typography variant={valueVariant} sx={{ fontWeight: 'bold' }}>
                  {typeof value === 'number' ? formatNumber(value) : value}
                </Typography>
              )}
            </Box>
            {renderTrend()}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...cardProps}>
      <CardHeader
        avatar={
          icon && (
            <Avatar
              sx={{
                bgcolor: variant === 'highlighted' ? 'rgba(255,255,255,0.2)' : alpha(colorValue, 0.1),
                color: variant === 'highlighted' ? 'white' : colorValue,
                width: iconSize,
                height: iconSize
              }}
            >
              {icon}
            </Avatar>
          )
        }
        action={
          actions && (
            <IconButton
              size=\"small\"
              sx={{
                color: variant === 'highlighted' ? 'rgba(255,255,255,0.8)' : 'text.secondary'
              }}
            >
              <MoreIcon />
            </IconButton>
          )
        }
        title={
          <Typography
            variant={titleVariant}
            sx={{
              color: variant === 'highlighted' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ pt: 0 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Box>
            <Typography
              variant={valueVariant}
              sx={{
                fontWeight: 'bold',
                color: variant === 'highlighted' ? 'white' : 'text.primary',
                mb: 1
              }}
            >
              {typeof value === 'number' ? formatNumber(value) : value}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {subtitle && (
                <Typography
                  variant=\"caption\"
                  sx={{
                    color: variant === 'highlighted' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              {renderTrend()}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Widget Component
const ChartWidget = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  onRefresh,
  onFullscreen,
  actions,
  height = 300
}) => {
  const { t } = useI18n();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        subheader={subtitle}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onRefresh && (
              <IconButton size=\"small\" onClick={onRefresh} title={t('common.refresh')}>
                <RefreshIcon />
              </IconButton>
            )}
            {onFullscreen && (
              <IconButton size=\"small\" onClick={onFullscreen} title={t('common.fullscreen')}>
                <FullscreenIcon />
              </IconButton>
            )}
            {actions}
          </Box>
        }
      />
      
      <CardContent sx={{ height: height, position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'error.main'
            }}
          >
            <Typography variant=\"body2\">{error}</Typography>
            {onRefresh && (
              <Button size=\"small\" onClick={onRefresh} sx={{ mt: 1 }}>
                {t('common.retry')}
              </Button>
            )}
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

// List Widget Component
const ListWidget = ({
  title,
  subtitle,
  items = [],
  loading = false,
  error = null,
  onItemClick,
  onViewAll,
  viewAllText,
  renderItem,
  maxItems = 5,
  showDividers = true
}) => {
  const { t, formatDate } = useI18n();

  const displayItems = items.slice(0, maxItems);

  const defaultRenderItem = (item, index) => (
    <ListItem
      key={item.id || index}
      button={!!onItemClick}
      onClick={() => onItemClick && onItemClick(item)}
      divider={showDividers && index < displayItems.length - 1}
    >
      {item.avatar && (
        <ListItemAvatar>
          <Avatar src={item.avatar} alt={item.name}>
            {item.name?.[0]}
          </Avatar>
        </ListItemAvatar>
      )}
      
      <ListItemText
        primary={item.title || item.name}
        secondary={
          <Box>
            {item.description && (
              <Typography variant=\"body2\" color=\"text.secondary\">
                {item.description}
              </Typography>
            )}
            {item.date && (
              <Typography variant=\"caption\" color=\"text.secondary\">
                {formatDate(item.date)}
              </Typography>
            )}
          </Box>
        }
      />
      
      {item.status && (
        <ListItemSecondaryAction>
          <Chip
            label={item.status}
            size=\"small\"
            color={item.statusColor || 'default'}
            variant={item.statusVariant || 'filled'}
          />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            <Typography variant=\"body2\">{error}</Typography>
          </Box>
        ) : displayItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant=\"body2\" color=\"text.secondary\">
              {t('common.noData')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {displayItems.map((item, index) =>
              renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
            )}
          </List>
        )}
      </CardContent>
      
      {onViewAll && items.length > maxItems && (
        <>
          <Divider />
          <CardActions>
            <Button
              size=\"small\"
              onClick={onViewAll}
              endIcon={<ArrowForwardIcon />}
              fullWidth
            >
              {viewAllText || t('common.viewAll')}
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

// Progress Widget Component
const ProgressWidget = ({
  title,
  subtitle,
  value,
  maxValue = 100,
  unit = '%',
  color = 'primary',
  variant = 'linear', // linear, circular
  size = 'medium',
  showValue = true,
  loading = false
}) => {
  const { formatNumber } = useI18n();
  const theme = useTheme();

  const percentage = (value / maxValue) * 100;
  
  const circularSize = size === 'small' ? 80 : size === 'large' ? 120 : 100;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subtitle} />
      
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : variant === 'circular' ? (
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
            <CircularProgress
              variant=\"determinate\"
              value={percentage}
              size={circularSize}
              thickness={4}
              color={color}
            />
            {showValue && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant=\"h6\" component=\"div\" color=\"text.secondary\">
                  {`${Math.round(percentage)}${unit}`}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              {showValue && (
                <Typography variant=\"body2\" color=\"text.secondary\">
                  {formatNumber(value)} / {formatNumber(maxValue)} {unit}
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant=\"determinate\"
              value={percentage}
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
        
        {showValue && variant === 'linear' && (
          <Typography variant=\"h5\" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {Math.round(percentage)}{unit}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Actions Widget
const QuickActionsWidget = ({
  title,
  actions = [],
  layout = 'grid', // grid, list
  columns = 2
}) => {
  return (
    <Card>
      <CardHeader title={title} />
      
      <CardContent>
        {layout === 'grid' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 2
            }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outlined'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'text'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export {
  StatWidget,
  ChartWidget,
  ListWidget,
  ProgressWidget,
  QuickActionsWidget
};