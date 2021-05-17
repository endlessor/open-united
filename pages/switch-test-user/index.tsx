import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

import {useMutation, useQuery} from '@apollo/react-hooks';
import { GET_USERS } from '../../graphql/queries';
import { Row, Col, Button, Select, message, Layout, Typography, Form } from "antd";

import { Header } from '../../components';
import { getProp } from '../../utilities/filters';
import { apiDomain } from '../../utilities/constants';
import { userLogInAction } from '../../lib/actions';
import { UserState } from '../../lib/reducers/user.reducer';
import ContainerFlex from "../../components/ContainerFlex";
import LoginViaAM from "../../components/LoginViaAM";
import {FAKE_LOGIN} from "../../graphql/mutations";

const { Option } = Select;

type Props = {
  user: any;
  userLogInAction: any;
};

const TestUser: React.FunctionComponent<Props> = ({ userLogInAction, user }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data, error, loading } = useQuery(GET_USERS, {variables: {showOnlyTestUsers: true}});

  const [login] = useMutation(FAKE_LOGIN);

  const signIn = (userId: any) => {
    if (!userId || userId === 0) {
      message.warning("Please select user before clicking sign in button").then();
      return;
    }

    login({
      variables: {
        personId: userId
      }
    }).then((data: any) => {
      const {success, message: responseMessage, person} = data.data.fakeLogin;
      if (success) {
        message.success(responseMessage);
        userLogInAction({ isLoggedIn: success });
        localStorage.setItem('userId', person.id);
        localStorage.setItem('fullName', person.fullName);
        router.push("/").then();
      } else {
        message.warning(responseMessage).then();
        userLogInAction({ isLoggedIn: false });
      }
    }).catch(err => message.error("Failed to logout form the system").then());
  }

  useEffect(() => {
    if (user && user.isLoggedIn && user.fullName) {
      message.success(`${user.fullName} is logged in!`).then();
    }
  }, []);

  const onFinish = (values: {person: string}) => signIn(values.person);

  return (
    <ContainerFlex>
      <Layout>
        <Header/>
        {(!user || !user.isLoggedIn) && !error && !loading && (
          <Row justify="center" className='mt-40'>
            <Col xs={20} sm={13} md={10} lg={7} xl={6} xxl={5}>
              <Row>
                <Typography.Title level={3}>Sign In</Typography.Title>
              </Row>
              <Form
                layout="vertical"
                onFinish={onFinish}
                initialValues={{person: 0}}
                form={form}
              >
                <Form.Item
                  name="person"
                  label="Select person"
                  rules={[{required: true, message: "Please select a person"}]}
                >
                  <Select>
                    <Option value={0}>Select</Option>
                    {getProp(data, "people", []).map((person: any, idx: number) =>
                      <Option key={person.id} value={person.id}>{person.fullName}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item className="d-flex-justify">
                  <Button type="primary" htmlType="submit">Sign in</Button>
                  <LoginViaAM buttonTitle="Login with AuthMachine" />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        )}
      </Layout>
    </ContainerFlex>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch: any) => ({
  userLogInAction: (data: UserState) => dispatch(userLogInAction(data))
});

const TestUserContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestUser);

export default TestUserContainer;
