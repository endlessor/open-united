import React, {useEffect, useState} from 'react';
import {Modal, Button, Select, Form} from 'antd';
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
import {saveTags, saveStacks, saveUsers} from "../../lib/actions";
import {getUserRole, hasManagerRoots} from "../../utilities/utils";

const { Option } = Select;

type Props = {
  user: any,
  modal?: boolean;
  closeModal: any;
  submit: Function,
  tags: any[],
  users: any[],
  stacks: any[],
  saveTags: Function,
  saveStacks: Function,
  saveUsers: Function,
  productSlug?: string,
  initialForm: any
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const FilterModal: React.FunctionComponent<Props> = ({
  user,
  modal,
  closeModal,
  submit,
  tags,
  users,
  stacks,
  saveTags,
  productSlug,
  saveStacks,
  saveUsers,
  initialForm
}) => {
  const [form] = Form.useForm()
  const handleCancel = () => closeModal(!modal);
  const [userHasManagerRoots, setUserRoot] = useState(false);
  const [userRoles, setUserRoles] = useState([])

  const {data: tagsData} = useQuery(GET_TAGS);
  const {data: stacksData} = useQuery(GET_STACKS);
  const {data: usersData} = useQuery(GET_USERS);

  useEffect(() => {
    if (tagsData && tagsData.tags) saveTags({allTags: tagsData.tags})
  }, [tagsData]);

  useEffect(() => {
    if (stacksData && stacksData.stacks) saveStacks({allStacks: stacksData.stacks})
  }, [stacksData]);

  useEffect(() => {
    if (usersData && usersData.people) saveUsers({allUsers: usersData.people})
  }, [usersData]);

  useEffect(() => {
    if (user.isLoggedIn) {
      let userRoles = getUserRole(user.roles, productSlug ? productSlug : "");

      setUserRoles(userRoles);
      setUserRoot(productSlug ? hasManagerRoots(userRoles) : true);
    } else {
      setUserRoot(false)
    }
  }, [user])

  const onFinish = (values: any) => submit(values);

  const filterOption = (input: string, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const clearFilter = () => {
    form.resetFields();
    form.setFieldsValue({
      sortedBy: "priority",
      stacks: [],
      tags: [],
      priority: [],
      assignee: [],
      taskCreator: [],
      statuses: [],
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
          <Button key="submit" type="primary" htmlType="submit" form="filter-form">
            Filter
          </Button>,
        ]}
        maskClosable={false}
      >
        <Form {...layout}
              form={form}
              initialValues={initialForm}
              name="control-ref"
              id="filter-form"
              onFinish={onFinish}>
          <Form.Item name="sortedBy" label="Sorted By">
            <Select placeholder="Select a priority">
              <Option value="title">Name</Option>
              <Option value="priority">Priority</Option>
              <Option value="status">Status</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select
              placeholder="Select a priority"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {TASK_PRIORITIES.map((p: string, index: number) => <Option key={p} value={index}>{p}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="stacks" label="Skills Required">
            <Select
              placeholder="Specify skills required"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {stacks.map((tag: {id: string, name: string}) =>
                <Option key={tag.id} value={tag.name}>{tag.name}</Option>)}
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
                <Option key={tag.id} value={tag.name}>{tag.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="assignee" label="Assignee">
            <Select
              placeholder="Select a assigned user"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {users.map((user: {id: string, fullName: string}) =>
                <Option key={user.id} value={user.id}>{user.fullName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="taskCreator" label="Task creator">
            <Select
              placeholder="Select a task creator"
              mode="multiple"
              showSearch={true}
              filterOption={filterOption}
              allowClear
            >
              {users.map((user: {id: string, fullName: string}) =>
                <Option key={user.id} value={user.id}>{user.fullName}</Option>)}
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
              {(userHasManagerRoots ? TASK_LIST_TYPES :
                (userRoles.includes("Contributor") ? TASK_LIST_TYPES_FOR_CONTRIBUTOR : TASK_LIST_TYPES_FOR_GUEST))
                .map((option: { id: number, name: string }) => (
                <Option key={`status-${option.id}`} value={option.id}>{option.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const mapStateToProps = (state: any) => ({
  tags: state.work.allTags,
  user: state.user,
  users: state.work.allUsers,
  stacks: state.work.allStacks,
});

const mapDispatchToProps = (dispatch: any) => ({
  saveTags: (data: WorkState) => dispatch(saveTags(data)),
  saveUsers: (data: WorkState) => dispatch(saveUsers(data)),
  saveStacks: (data: WorkState) => dispatch(saveStacks(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterModal);
