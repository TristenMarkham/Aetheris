```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Upload, Button, Spin, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const ReportForm = ({ onSubmit, onCancel, loading, report }) => {
  const { handleSubmit, control, errors, watch } = useForm({
    defaultValues: report,
  });

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const industryType = watch('industryType');

  const uploadProps = {
    onRemove: file => {
      setFileList([]);
    },
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files[]', file);
    });

    setUploading(true);

    // You can use any AJAX library you like
    const response = await axios.post('upload-endpoint', formData);

    if (response.status === 200) {
      setUploading(false);
      message.success('upload successfully.');
    } else {
      setUploading(false);
      message.error('upload failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        as={<input />}
        name="reportName"
        control={control}
        rules={{ required: 'Report name is required' }}
      />
      {errors.reportName && <p>{errors.reportName.message}</p>}

      <Controller
        as={
          <Select showSearch>
            <Option value="industry1">Industry 1</Option>
            <Option value="industry2">Industry 2</Option>
          </Select>
        }
        name="industryType"
        control={control}
        rules={{ required: 'Industry type is required' }}
      />
      {errors.industryType && <p>{errors.industryType.message}</p>}

      {industryType === 'industry2' && (
        <Controller
          as={<input />}
          name="industry2Field"
          control={control}
          rules={{ required: 'This field is required for Industry 2' }}
        />
      )}
      {errors.industry2Field && <p>{errors.industry2Field.message}</p>}

      <Controller
        as={<DatePicker />}
        name="reportDate"
        control={control}
        rules={{ required: 'Report date is required' }}
      />
      {errors.reportDate && <p>{errors.reportDate.message}</p>}

      <Upload {...uploadProps}>
        <Button>
          <UploadOutlined /> Select File
        </Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>

      <Button type="primary" htmlType="submit" loading={loading}>
        Submit
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
    </form>
  );
};

export default ReportForm;
```

This is a basic example and might need adjustments based on your specific requirements.