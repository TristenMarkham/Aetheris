```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Spin, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const TrainingForm = ({ onSubmit, onCancel, loading, training = {} }) => {
  const { control, handleSubmit, errors, watch } = useForm({
    defaultValues: {
      title: training.title || '',
      industry: training.industry || '',
      date: training.date ? moment(training.date) : null,
      file: training.file || null,
    },
  });

  const industry = watch('industry');

  const [fileList, setFileList] = useState([]);

  const props = {
    name: 'file',
    multiple: false,
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    onRemove: () => setFileList([]),
  };

  const onFormSubmit = data => {
    onSubmit({ ...data, file: fileList[0] });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        as={<input />}
        name="title"
        control={control}
        rules={{ required: 'Title is required' }}
        placeholder="Title"
      />
      {errors.title && <p>{errors.title.message}</p>}

      <Controller
        as={
          <Select placeholder="Select industry" style={{ width: '100%' }}>
            <Option value="tech">Tech</Option>
            <Option value="finance">Finance</Option>
            <Option value="health">Health</Option>
          </Select>
        }
        name="industry"
        control={control}
        rules={{ required: 'Industry is required' }}
      />
      {errors.industry && <p>{errors.industry.message}</p>}

      {industry === 'tech' && (
        <Controller
          as={<input />}
          name="techField"
          control={control}
          rules={{ required: 'Tech field is required' }}
          placeholder="Tech Field"
        />
      )}
      {errors.techField && <p>{errors.techField.message}</p>}

      <Controller
        as={<DatePicker style={{ width: '100%' }} />}
        name="date"
        control={control}
        rules={{ required: 'Date is required' }}
      />
      {errors.date && <p>{errors.date.message}</p>}

      <Upload {...props} fileList={fileList}>
        <button>
          <UploadOutlined /> Click to Upload
        </button>
      </Upload>

      <button type="submit" disabled={loading}>
        {loading ? <Spin /> : 'Submit'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};

export default TrainingForm;
```
This is a basic example and might need to be adjusted based on your specific requirements and data structure. It uses Ant Design for UI components and React Hook Form for form handling. The form includes a title input, industry select with conditional tech field, date picker, and file upload. It also handles form submission and cancellation, displays loading state, and shows validation error messages.