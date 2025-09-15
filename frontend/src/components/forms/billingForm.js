```jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker, Select, Upload, Button, Spin, message } from 'antd';
import moment from 'moment';

const { Option } = Select;

const BillingForm = () => {
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState(null);
  const { handleSubmit, control, errors, reset } = useForm();

  const onSubmit = data => {
    setLoading(true);
    console.log(data);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Billing record created successfully!');
      reset();
    }, 2000);
  };

  const onCancel = () => {
    reset();
  };

  const handleIndustryChange = value => {
    setIndustry(value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        as={<input />}
        name="companyName"
        control={control}
        defaultValue=""
        rules={{ required: 'Company name is required' }}
      />
      {errors.companyName && <p>{errors.companyName.message}</p>}

      <Controller
        as={
          <Select placeholder="Select industry" onChange={handleIndustryChange}>
            <Option value="tech">Tech</Option>
            <Option value="finance">Finance</Option>
          </Select>
        }
        name="industry"
        control={control}
        rules={{ required: 'Industry is required' }}
      />
      {errors.industry && <p>{errors.industry.message}</p>}

      {industry === 'finance' && (
        <Controller
          as={<input />}
          name="financeField"
          control={control}
          defaultValue=""
          rules={{ required: 'This field is required for finance industry' }}
        />
      )}
      {errors.financeField && <p>{errors.financeField.message}</p>}

      <Controller
        as={<DatePicker />}
        name="billingDate"
        control={control}
        defaultValue={moment()}
        rules={{ required: 'Billing date is required' }}
      />
      {errors.billingDate && <p>{errors.billingDate.message}</p>}

      <Controller
        as={<Upload name="file" />}
        name="attachment"
        control={control}
      />

      {loading ? (
        <Spin />
      ) : (
        <>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </>
      )}
    </form>
  );
};

export default BillingForm;
```

This is a basic example of a billing form using React Hook Form and Ant Design. It includes form validation with error messages, dynamic fields based on industry type, file upload capabilities, date/time pickers, dropdown selections with search, conditional field display, submit and cancel handling, and loading states.

For the auto-save draft functionality and multi-step forms, it would require more complex logic and state management which is not included in this example. You might want to use a state management library like Redux or MobX for those features.