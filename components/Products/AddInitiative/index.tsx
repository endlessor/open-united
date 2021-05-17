import React, {useState} from 'react';
import {Modal, Row, Input, message, Button, Select, Col} from 'antd';
import {useMutation} from '@apollo/react-hooks';
import {CREATE_INITIATIVE, UPDATE_INITIATIVE} from '../../../graphql/mutations';
import {INITIATIVE_TYPES} from '../../../graphql/types';
import {getProp} from '../../../utilities/filters';
import {RICH_TEXT_EDITOR_WIDTH} from '../../../utilities/constants';
import RichTextEditor from "../../RichTextEditor";


const {Option} = Select;


type Props = {
  modal?: boolean;
  productSlug: string;
  closeModal: any;
  modalType: boolean;
  handleDelete?: Function;
  submit: Function;
  initiative?: any;
};

const AddInitiative: React.FunctionComponent<Props> = (
  {
    modal,
    productSlug,
    closeModal,
    modalType,
    initiative,
    handleDelete,
    submit
  }
) => {
  const [name, setName] = useState(
    modalType ? getProp(initiative, 'name', '') : ''
  );
  const [description, setDescription] = useState(
    modalType ? getProp(initiative, 'description', '') : "");
  const [status, setStatus] = useState(
    modalType ? getProp(initiative, 'status', 1) : 1
  )
  const [createInitiative] = useMutation(CREATE_INITIATIVE);
  const [updateInitiative] = useMutation(UPDATE_INITIATIVE);

  const handleCancel = () => {
    closeModal(!modal);
  };

  const handleOk = () => {
    modalType ? onUpdate() : onCreate();

    closeModal();
  }

  const onUpdate = async () => {
    const input = {
      name,
      description: description.toString('html'),
      status,
      productSlug
    };

    try {
      const res = await updateInitiative({
        variables: {
          input,
          id: initiative ? initiative.id : 0
        }
      });

      if (res.data && res.data.updateInitiative) {
        message.success('Initiative is updated successfully!');
        submit();
      }
    } catch (e) {
      message.success('Initiative modification is failed!');
    }
  }

  const onCreate = async () => {
    const input = {
      name,
      description,
      productSlug,
      status,
    };

    try {
      const res = await createInitiative({
        variables: {input}
      });

      if (res.data && res.data.createInitiative) {
        message.success('Initiative is created successfully!');
        submit();
      }
    } catch (e) {
      message.success('Initiative creation is failed!');
    }
  }

  let footerButtons = modalType ? [
    <Button type="danger" style={{float: "left"}} onClick={handleDelete}>
      Delete this initiative
    </Button>
  ] : [];

  footerButtons = footerButtons.concat([
    <Button key="back" onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key="submit" type="primary" onClick={handleOk}>
      {modalType ? "Edit" : "Add"}
    </Button>
  ]);

  return (
    <>
      <Modal
        title={modalType ? "Edit initiative" : "Add initiative"}
        visible={modal}
        onCancel={handleCancel}
        footer={footerButtons}
        width={RICH_TEXT_EDITOR_WIDTH}
        maskClosable={false}
      >
        {
          modalType ? (
            <>
              <Row className={'mb-15'}>
                <label>Name*:</label>
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Row>
              <Row style={{width: '100%', marginBottom: 20}}>
                <Col span={24}>
                  <label>Description:</label>
                  <RichTextEditor
                    initialHTMLValue={modalType ? getProp(initiative, 'description', '') : ''}
                    onChangeHTML={setDescription}
                  />
                </Col>
              </Row>
              <Row className="mb-15">
                <label>Status:</label>
                <Select
                  defaultValue={status}
                  onChange={setStatus}
                >
                  {INITIATIVE_TYPES.map((option: any, idx: number) => (
                    <Option key={`cap${idx}`} value={idx + 1}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Row>
            </>
          ) : (
            <>
              <Row className="mb-15">
                <label>Name:</label>
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Row>
              <Row style={{width: '100%', marginBottom: 20}}>
                <Col span={24}>
                  <label>Description:</label>
                  <RichTextEditor
                    initialHTMLValue={modalType ? getProp(initiative, 'description', '') : ''}
                    onChangeHTML={setDescription}
                  />
                </Col>
              </Row>
              <Row className='mb-15'>
                <label>Status:</label>
                <Select
                  defaultValue={status}
                  onChange={setStatus}
                >
                  {INITIATIVE_TYPES.map((option: any, idx: number) => (
                    <Option key={`cap${idx}`} value={idx + 1}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Row>
            </>
          )
        }
      </Modal>
    </>
  );
}

export default AddInitiative;