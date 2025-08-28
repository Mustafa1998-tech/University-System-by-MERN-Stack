import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  FormHelperText,
  RadioGroup,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Autocomplete,
  Switch,
  Slider,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  DatePicker,
  TimePicker,
  DateTimePicker
} from '@mui/x-date-pickers';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useI18n } from '../../hooks/useI18n';

const FormField = ({ field, value, error, onChange, disabled }) => {
  const { t, isRTL, getTextAlign } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = useCallback((newValue) => {
    onChange(field.name, newValue);
  }, [field.name, onChange]);

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return (
          <TextField
            fullWidth
            type={field.type}
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={disabled}
            placeholder={field.placeholder}
            multiline={field.multiline}
            rows={field.rows || 4}
            inputProps={{
              minLength: field.minLength,
              maxLength: field.maxLength,
              pattern: field.pattern
            }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: field.align || (isRTL ? 'right' : 'left')
              }
            }}
          />
        );

      case 'password':
        return (
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={disabled}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge=\"end\"
                  size=\"small\"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type=\"number\"
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={disabled}
            inputProps={{
              min: field.min,
              max: field.max,
              step: field.step
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              label={field.label}
              disabled={disabled}
              multiple={field.multiple}
              renderValue={field.multiple ? (selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val) => {
                    const option = field.options.find(opt => opt.value === val);
                    return <Chip key={val} label={option?.label || val} size=\"small\" />;
                  })}
                </Box>
              ) : undefined}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {field.multiple && (
                    <Checkbox checked={Array.isArray(value) && value.includes(option.value)} />
                  )}
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helperText) && (
              <FormHelperText>{error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            fullWidth
            options={field.options || []}
            getOptionLabel={(option) => option.label || option}
            value={field.multiple ? value || [] : value || null}
            onChange={(e, newValue) => handleChange(newValue)}
            multiple={field.multiple}
            freeSolo={field.freeSolo}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={field.label}
                error={!!error}
                helperText={error || field.helperText}
                required={field.required}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant=\"outlined\"
                  label={option.label || option}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
          />
        );

      case 'radio':
        return (
          <FormControl component=\"fieldset\" error={!!error}>
            <FormLabel component=\"legend\" required={field.required}>
              {field.label}
            </FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              row={field.row}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={disabled} />}
                  label={option.label}
                  sx={{ textAlign: getTextAlign() }}
                />
              ))}
            </RadioGroup>
            {(error || field.helperText) && (
              <FormHelperText>{error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'checkbox':
        if (field.multiple) {
          return (
            <FormControl component=\"fieldset\" error={!!error}>
              <FormLabel component=\"legend\" required={field.required}>
                {field.label}
              </FormLabel>
              <FormGroup row={field.row}>
                {field.options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={Array.isArray(value) && value.includes(option.value)}
                        onChange={(e) => {
                          const currentValue = Array.isArray(value) ? value : [];
                          if (e.target.checked) {
                            handleChange([...currentValue, option.value]);
                          } else {
                            handleChange(currentValue.filter(v => v !== option.value));
                          }
                        }}
                        disabled={disabled}
                      />
                    }
                    label={option.label}
                    sx={{ textAlign: getTextAlign() }}
                  />
                ))}
              </FormGroup>
              {(error || field.helperText) && (
                <FormHelperText>{error || field.helperText}</FormHelperText>
              )}
            </FormControl>
          );
        } else {
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!value}
                  onChange={(e) => handleChange(e.target.checked)}
                  disabled={disabled}
                />
              }
              label={field.label}
              sx={{ textAlign: getTextAlign() }}
            />
          );
        }

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={field.label}
            sx={{ textAlign: getTextAlign() }}
          />
        );

      case 'slider':
        return (
          <Box>
            <Typography gutterBottom>{field.label}</Typography>
            <Slider
              value={value || field.min || 0}
              onChange={(e, newValue) => handleChange(newValue)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              marks={field.marks}
              valueLabelDisplay=\"auto\"
              disabled={disabled}
            />
            {(error || field.helperText) && (
              <FormHelperText error={!!error}>
                {error || field.helperText}
              </FormHelperText>
            )}
          </Box>
        );

      case 'date':
        return (
          <DatePicker
            label={field.label}
            value={value || null}
            onChange={handleChange}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!error}
                helperText={error || field.helperText}
                required={field.required}
              />
            )}
          />
        );

      case 'time':
        return (
          <TimePicker
            label={field.label}
            value={value || null}
            onChange={handleChange}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!error}
                helperText={error || field.helperText}
                required={field.required}
              />
            )}
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            label={field.label}
            value={value || null}
            onChange={handleChange}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!error}
                helperText={error || field.helperText}
                required={field.required}
              />
            )}
          />
        );

      case 'file':
        return (
          <Box>
            <input
              accept={field.accept}
              style={{ display: 'none' }}
              id={`file-input-${field.name}`}
              type=\"file\"
              multiple={field.multiple}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                handleChange(field.multiple ? files : files[0]);
              }}
              disabled={disabled}
            />
            <label htmlFor={`file-input-${field.name}`}>
              <Button
                variant=\"outlined\"
                component=\"span\"
                startIcon={<UploadIcon />}
                fullWidth
                disabled={disabled}
              >
                {field.label}
              </Button>
            </label>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <LinearProgress variant=\"determinate\" value={uploadProgress} sx={{ mt: 1 }} />
            )}
            
            {value && (
              <Box sx={{ mt: 1 }}>
                {Array.isArray(value) ? (
                  value.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => {
                        const newFiles = value.filter((_, i) => i !== index);
                        handleChange(newFiles);
                      }}
                      size=\"small\"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))
                ) : (
                  <Chip
                    label={value.name}
                    onDelete={() => handleChange(null)}
                    size=\"small\"
                  />
                )}
              </Box>
            )}
            
            {(error || field.helperText) && (
              <FormHelperText error={!!error}>
                {error || field.helperText}
              </FormHelperText>
            )}
          </Box>
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant=\"subtitle1\">{field.label}</Typography>
              <Button
                size=\"small\"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newValue = [...arrayValue, field.defaultItem || ''];
                  handleChange(newValue);
                }}
                disabled={disabled}
              >
                {t('common.add')}
              </Button>
            </Box>
            
            {arrayValue.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  value={item}
                  onChange={(e) => {
                    const newValue = [...arrayValue];
                    newValue[index] = e.target.value;
                    handleChange(newValue);
                  }}
                  placeholder={field.placeholder}
                  disabled={disabled}
                />
                <IconButton
                  onClick={() => {
                    const newValue = arrayValue.filter((_, i) => i !== index);
                    handleChange(newValue);
                  }}
                  disabled={disabled}
                  color=\"error\"
                  size=\"small\"
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            
            {(error || field.helperText) && (
              <FormHelperText error={!!error}>
                {error || field.helperText}
              </FormHelperText>
            )}
          </Box>
        );

      case 'divider':
        return (
          <Divider sx={{ my: 2 }}>
            {field.label && (
              <Typography variant=\"caption\" color=\"text.secondary\">
                {field.label}
              </Typography>
            )}
          </Divider>
        );

      case 'info':
        return (
          <Alert severity={field.severity || 'info'} icon={<InfoIcon />}>
            {field.content}
          </Alert>
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            error={!!error}
            helperText={error || field.helperText}
            required={field.required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: field.type === 'divider' ? 0 : 2 }}>
      {renderField()}
    </Box>
  );
};

const DynamicForm = forwardRef(({
  title,
  subtitle,
  fields = [],
  initialValues = {},
  onSubmit,
  onCancel,
  onReset,
  submitText,
  cancelText,
  resetText,
  loading = false,
  disabled = false,
  showReset = true,
  showCancel = true,
  validation = {},
  layout = 'card', // 'card', 'paper', 'none'
  columns = 1,
  spacing = 2,
  submitButtonProps = {},
  cancelButtonProps = {},
  resetButtonProps = {}
}, ref) => {
  const { t } = useI18n();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation function
  const validateField = useCallback((name, value) => {
    const field = fields.find(f => f.name === name);
    const validators = validation[name] || [];
    
    for (const validator of validators) {
      const error = validator(value, values, field);
      if (error) return error;
    }
    
    // Built-in validation
    if (field?.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return t('forms.required');
    }
    
    if (field?.type === 'email' && value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
      return t('forms.emailInvalid');
    }
    
    if (field?.minLength && value && value.length < field.minLength) {
      return t('forms.tooShort');
    }
    
    if (field?.maxLength && value && value.length > field.maxLength) {
      return t('forms.tooLong');
    }
    
    return null;
  }, [fields, validation, values, t]);

  // Handle field changes
  const handleFieldChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    fields.forEach(field => {
      if (field.name) {
        const error = validateField(field.name, values[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit && onSubmit(values);
    }
  }, [values, validateForm, onSubmit]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    onReset && onReset();
  }, [initialValues, onReset]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getValues: () => values,
    setValues,
    getErrors: () => errors,
    setErrors,
    validate: validateForm,
    reset: handleReset,
    submit: handleSubmit
  }), [values, errors, validateForm, handleReset, handleSubmit]);

  const formContent = (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={spacing}>
        {fields.map((field, index) => {
          if (field.type === 'divider' || field.type === 'info') {
            return (
              <Grid item xs={12} key={index}>
                <FormField
                  field={field}
                  value={values[field.name]}
                  error={touched[field.name] && errors[field.name]}
                  onChange={handleFieldChange}
                  disabled={disabled || loading}
                />
              </Grid>
            );
          }
          
          const gridSize = field.gridSize || (12 / columns);
          
          return (
            <Grid item xs={12} sm={gridSize} key={field.name || index}>
              <FormField
                field={field}
                value={values[field.name]}
                error={touched[field.name] && errors[field.name]}
                onChange={handleFieldChange}
                disabled={disabled || loading}
              />
            </Grid>
          );
        })}
        
        {/* Form Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            {showReset && (
              <Button
                type=\"button\"
                onClick={handleReset}
                disabled={disabled || loading}
                {...resetButtonProps}
              >
                {resetText || t('common.reset')}
              </Button>
            )}
            
            {showCancel && onCancel && (
              <Button
                type=\"button\"
                onClick={onCancel}
                disabled={disabled || loading}
                {...cancelButtonProps}
              >
                {cancelText || t('common.cancel')}
              </Button>
            )}
            
            <Button
              type=\"submit\"
              variant=\"contained\"
              disabled={disabled || loading}
              startIcon={loading && <CircularProgress size={20} />}
              {...submitButtonProps}
            >
              {submitText || t('common.submit')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );

  if (layout === 'card') {
    return (
      <Card>
        {(title || subtitle) && (
          <CardHeader
            title={title}
            subheader={subtitle}
          />
        )}
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }
  
  if (layout === 'paper') {
    return (
      <Paper sx={{ p: 3 }}>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant=\"h5\" component=\"h2\" gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant=\"body2\" color=\"text.secondary\">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {formContent}
      </Paper>
    );
  }
  
  return formContent;
});

export default DynamicForm;
export { FormField };