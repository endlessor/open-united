import React, {useEffect, useState} from 'react';
import {Modal, Button, Select, FormInstance, Form} from 'antd';
import {
  TASK_LIST_TYPES,
  TASK_LIST_TYPES_FOR_CONTRIBUTOR,
  TASK_LIST_TYPES_FOR_GUEST,
  TASK_PRIORITIES
} from "../../graphql/types";
import {useQuery} from "@apollo/react-hooks";
import {GET_STACKS, GET_TAGS, GET_USERS} from "../../graphql/queries";
import {connect} from "react-redux";
import {WorkState} from "../../lib/reducers/work.reducer";
import {saveTags, saveStacks} from "../../lib/actions";

const { Option } = Select;

type Props = {
  modal?: boolean;
  closeModal: any;
  submit: Function,
  tags: any[],
  stacks: any[],
  saveTags: Function,
  saveStacks: Function,
  initialForm: any
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const InitiativeFilterModal: React.FunctionComponent<Props> = ({
  modal,
  closeModal,
  submit,
  tags,
  stacks,
  saveTags,
  saveStacks,
  initialForm
}) => {
  const [form] = Form.useForm()
  const handleCancel = () => closeModal(!modal);

  const {data: tagsData} = useQuery(GET_TAGS);
  const {data: stacksData} = useQuery(GET_STACKS);

  useEffect(() => {
    if (tagsData && tagsData.tags) saveTags({allTags: tagsData.tags})
  }, [tagsData]);

  useEffect(() => {
    if (stacksData && stacksData.stacks) saveStacks({allStacks: stacksData.stacks})
  }, [stacksData]);

  const onFinish = (values: any) => submit(values);

  const filterOption = (input: string, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const clearFilter = () => {
    form.resetFields();
    form.setFieldsValue({
      stacks: [],
      tags: [],
      statuses: [1],
    });
  }

  return (
    <>
      <Modal
        title="Filter"
        visible={modal}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={clearFilter}>
            Clear Filter
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" form="in-filter-form">
            Filter
          </Button>,
        ]}
        maskClosable={false}
      >
        <Form {...layout}
              form={form}
              initialValues={initialForm}
              name="control-ref"
              id="in-filter-form"
              onFinish={onFinish}>
          <Form.Item name="stacks" label="Tech Stack">
            <Select
              placeholder="Select a tech stack"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {stacks.map((tag: {id: string, name: string}) =>
                <Option key={tag.id} value={tag.id}>{tag.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select
              placeholder="Select a tag"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {tags.map((tag: {id: string, name: string}) =>
                <Option key={tag.id} value={tag.id}>{tag.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="statuses" label="Status">
            <Select
              placeholder="Select a status"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              <Option value={1}>Active</Option>
              <Option value={2}>Completed</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  tags: state.work.allTags,
  stacks: state.work.allStacks,
});

const mapDispatchToProps = (dispatch: any) => ({
  saveTags: (data: WorkState) => dispatch(saveTags(data)),
  saveStacks: (data: WorkState) => dispatch(saveStacks(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InitiativeFilterModal);
