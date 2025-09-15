```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Spin, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const DocumentManagementForm = () => {
  const [loading, setLoading] = useState(false);
  const [industryType, setIndustryType] = useState('');
  const { handleSubmit, control, errors, watch } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    // Submit data to the server
    console.log(data);
    setLoading(false);
  };

  const handleIndustryChange = (value) => {
    setIndustryType(value);
  };

  const fileProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        as={<DatePicker />}
        control={control}
        name="date"
        rules={{ required: 'Date is required' }}
      />
      {errors.date && <p>{errors.date.message}</p>}

      <Controller
        as={
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select a industry"
            optionFilterProp="children"
            onChange={handleIndustryChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="tech">Tech</Option>
            <Option value="finance">Finance</Option>
            <Option value="health">Health</Option>
          </Select>
        }
        control={control}
        name="industry"
        rules={{ required: 'Industry is required' }}
      />
      {errors.industry && <p>{errors.industry.message}</p>}

      {industryType === 'tech' && (
        <Controller
          as={<input />}
          control={control}
          name="techField"
          rules={{ required: 'This field is required' }}
        />
      )}
      {errors.techField && <p>{errors.techField.message}</p>}

      <Controller
        name="document"
        control={control}
        defaultValue={[]}
        render={({ onChange }) => (
          <Upload {...fileProps} onChange={({ fileList }) => onChange(fileList)}>
            <button>
              <UploadOutlined /> Click to Upload
            </button>
          </Upload>
        )}
      />

      <button type="submit" disabled={loading}>
        {loading ? <Spin /> : 'Submit'}
      </button>
    </form>
  );
};

export default DocumentManagementForm;
```

This is a simple example of a document management form using React Hook Form and Ant Design. It includes a date picker, a dropdown selection with search, a conditional field display based on the industry type, and a file upload feature. It also includes form validation with proper error messages, submit and cancel handling, and loading states. 

Please note that this is a basic example and may need to be adjusted based on your specific needs and project setup. For example, you may want to handle the form submission differently, add more fields, or customize the styles.