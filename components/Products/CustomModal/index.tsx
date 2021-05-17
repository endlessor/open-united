import React from 'react';
import { Modal, Button, Select } from 'antd';

type Props = {
    modal?: boolean;
    closeModal: any;
    submit: Function;
    title: string;
    message?: string;
    submitText?: string;
};

const CustomModal: React.SFC<Props> = ({
  modal,
  closeModal,
  submit,
  title,
  message  = "Are you sure?",
  submitText = "Submit",
}) => {  
  const handleCancel = () => {
    closeModal(!modal);
  };

  const handleOk = () => {
    submit();
  }

  return (
    <>
      <Modal
        title={title}
        visible={modal}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {submitText}
          </Button>,
        ]}
        maskClosable={false}
      >
        <h3>{message}</h3>
      </Modal>
    </>
  );
}

export default CustomModal;