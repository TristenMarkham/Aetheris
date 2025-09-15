```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Select, MenuItem, TextField, Button, CircularProgress } from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';
import { useAutoSave } from './useAutoSave';

const INDUSTRY_TYPES = ['Automotive', 'Healthcare', 'Software', 'Manufacturing'];

const QualityAssuranceForm = () => {
  const { handleSubmit, control, watch, errors } = useForm();
  const [loading, setLoading] = useState(false);
  const industryType = watch('industryType');

  const onSubmit = data => {
    setLoading(true);
    // Submit the form
    console.log(data);
    setLoading(false);
  };

  const onCancel = () => {
    // Handle form cancellation
    console.log('Form cancelled');
  };

  useAutoSave(handleSubmit(onSubmit), watch());

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        as={TextField}
        name="recordName"
        control={control}
        defaultValue=""
        rules={{ required: 'Record name is required' }}
        error={Boolean(errors.recordName)}
        helperText={errors.recordName?.message}
      />

      <Controller
        as={Select}
        name="industryType"
        control={control}
        defaultValue=""
        rules={{ required: 'Industry type is required' }}
        error={Boolean(errors.industryType)}
        helperText={errors.industryType?.message}
      >
        {INDUSTRY_TYPES.map(type => (
          <MenuItem value={type} key={type}>
            {type}
          </MenuItem>
        ))}
      </Controller>

      {industryType === 'Software' && (
        <Controller
          as={TextField}
          name="softwareVersion"
          control={control}
          defaultValue=""
          rules={{ required: 'Software version is required' }}
          error={Boolean(errors.softwareVersion)}
          helperText={errors.softwareVersion?.message}
        />
      )}

      <Controller
        name="issueDate"
        control={control}
        defaultValue={null}
        rules={{ required: 'Issue date is required' }}
        render={({ onChange, value }) => (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              error={Boolean(errors.issueDate)}
              helperText={errors.issueDate?.message}
              format="MM/dd/yyyy"
              value={value}
              onChange={onChange}
            />
          </MuiPickersUtilsProvider>
        )}
      />

      <Controller
        name="file"
        control={control}
        defaultValue={[]}
        render={({ onChange }) => (
          <DropzoneArea
            onChange={files => onChange(files)}
            filesLimit={1}
            showPreviewsInDropzone={false}
            showAlerts={false}
          />
        )}
      />

      <Button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Submit'}
      </Button>

      <Button onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default QualityAssuranceForm;
```

This code assumes that you have a custom hook `useAutoSave` which takes care of the auto-save functionality. Here is a simple implementation of `useAutoSave`:

```jsx
import { useEffect, useRef } from 'react';

export const useAutoSave = (save, data) => {
  const prevData = useRef();

  useEffect(() => {
    if (prevData.current && JSON.stringify(prevData.current) !== JSON.stringify(data)) {
      save();
    }

    prevData.current = data;
  }, [data, save]);
};
```

This code also uses Material-UI for UI components and date-fns for date utilities. You can install these packages using npm:

```
npm install @material-ui/core @material-ui/pickers @date-io/date-fns react-hook-form material-ui-dropzone
```