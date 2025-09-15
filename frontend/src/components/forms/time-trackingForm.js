```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Spin, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const TimeTrackingForm = ({ onSubmit, onCancel, isLoading, industryType, initialValues }) => {
  const { control, handleSubmit, errors, watch } = useForm({ defaultValues: initialValues });
  const [fileList, setFileList] = useState([]);
  const industry = watch('industry');

  const handleUpload = ({ fileList }) => setFileList([...fileList]);

  const uploadProps = {
    onRemove: file => {
      setFileList(fileList.filter(({ uid }) => uid !== file.uid));
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Controller
            as={<input />}
            name="projectName"
            control={control}
            rules={{ required: 'Project name is required' }}
            placeholder="Project name"
          />
          {errors.projectName && <p>{errors.projectName.message}</p>}

          <Controller
            as={
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            }
            name="date"
            control={control}
            rules={{ required: 'Date is required' }}
          />
          {errors.date && <p>{errors.date.message}</p>}

          <Controller
            as={
              <Select showSearch>
                {industryType.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            }
            name="industry"
            control={control}
            rules={{ required: 'Industry is required' }}
          />
          {errors.industry && <p>{errors.industry.message}</p>}

          {industry === 'IT' && (
            <Controller
              as={<input />}
              name="programmingLanguage"
              control={control}
              rules={{ required: 'Programming language is required for IT industry' }}
              placeholder="Programming Language"
            />
          )}
          {errors.programmingLanguage && <p>{errors.programmingLanguage.message}</p>}

          <Upload {...uploadProps}>
            <button>
              <UploadOutlined /> Upload file
            </button>
          </Upload>

          <button type="submit">Submit</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </>
      )}
    </form>
  );
};

export default TimeTrackingForm;
```
This form component uses the `react-hook-form` library for form handling and validation, and the `antd` library for UI components. It includes a file upload component, date/time picker, dropdown selection with search, and conditional field display based on the selected industry type. It also handles loading states, form submission, and cancellation.