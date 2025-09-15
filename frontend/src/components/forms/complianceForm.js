```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Spin, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const ComplianceForm = ({ onSubmit, onCancel, loading, initialValues }) => {
  const { control, handleSubmit, errors, watch } = useForm({
    defaultValues: initialValues,
  });

  const [fileList, setFileList] = useState([]);
  const industryType = watch('industryType');

  const handleUpload = ({ fileList }) => setFileList(fileList);

  const uploadProps = {
    beforeUpload: file => {
      if (file.type !== 'application/pdf') {
        message.error(`${file.name} is not a pdf file`);
      }
      return file.type === 'application/pdf' ? true : Upload.LIST_IGNORE;
    },
    onChange: handleUpload,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Industry Type</label>
        <Controller
          as={
            <Select placeholder="Select industry" showSearch>
              <Option value="finance">Finance</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="technology">Technology</Option>
            </Select>
          }
          control={control}
          name="industryType"
          rules={{ required: 'Industry type is required' }}
        />
        {errors.industryType && <p>{errors.industryType.message}</p>}
      </div>

      {industryType === 'finance' && (
        <div>
          <label>Finance Regulation</label>
          <Controller
            as={<input />}
            control={control}
            name="financeRegulation"
            rules={{ required: 'This field is required for finance industry' }}
          />
          {errors.financeRegulation && <p>{errors.financeRegulation.message}</p>}
        </div>
      )}

      <div>
        <label>Compliance Date</label>
        <Controller
          as={<DatePicker />}
          control={control}
          name="complianceDate"
          rules={{ required: 'Compliance date is required' }}
        />
        {errors.complianceDate && <p>{errors.complianceDate.message}</p>}
      </div>

      <div>
        <label>Compliance Document</label>
        <Upload {...uploadProps} fileList={fileList}>
          <button>
            <UploadOutlined /> Upload Document
          </button>
        </Upload>
      </div>

      <div>
        <button type="submit" disabled={loading}>
          {loading ? <Spin /> : 'Submit'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ComplianceForm;
```
This form component uses the `react-hook-form` library for form handling and validation, and the `antd` library for UI components. The `industryType` field is a dropdown with search, and the `complianceDate` field is a date picker. The `financeRegulation` field is conditionally displayed based on the selected industry type. The form also includes a file upload component for uploading compliance documents, with validation to only accept PDF files. The form has a loading state for the submit button, and includes submit and cancel handling.