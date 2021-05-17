import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {Input, Button, message, Row, Col, Drawer, Typography, Menu, Dropdown} from 'antd';
import {setLoginURL, userLogInAction} from '../../lib/actions';
import {UserState} from '../../lib/reducers/user.reducer';
import {productionMode} from '../../utilities/constants';
// @ts-ignore
import Logo from '../../public/assets/logo.svg';
import {useRouter} from 'next/router'
import Link from 'antd/lib/typography/Link';
import {useMutation, useQuery} from "@apollo/react-hooks";
import {GET_AM_LOGIN_URL, GET_PERSON} from "../../graphql/queries";
import {USER_ROLES} from "../../graphql/types";
import LoginViaAM from "../LoginViaAM";
import {LOGOUT} from "../../graphql/mutations";
import { MenuOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';

const {Search} = Input;


type Props = {
  user?: any;
  userLogInAction?: any;
  setLoginURL: (loginUrl: string) => void
};

const HeaderMenuContainer: React.FunctionComponent<Props> = ({user, userLogInAction, setLoginURL}) => {
  const router = useRouter();
  const {data: authMachineData} = useQuery(GET_AM_LOGIN_URL);

  const onSearch = () => {
  }

  const menu = (
    <Menu style={{minWidth: 150}}>
      {user?.claimedTask ?
        <Menu.Item key="0">
          <div className="text-center">
            <Link href={user.claimedTask.link} >
              <a className="text-grey-9">
                <strong>Claimed task:</strong><br/>
                <div className="truncate" style={{width: 200}}>{user.claimedTask.title}</div>
              </a>
            </Link>
          </div>
      </Menu.Item> : null}

      <Menu.Item key="1" onClick={() => logout()} className="signIn-btn text-center">
        <LogoutOutlined /> Sign out
      </Menu.Item>
    </Menu>
  );

  const {data: personData} = useQuery(GET_PERSON, {fetchPolicy: "no-cache"});

  useEffect(() => {
    if (authMachineData && authMachineData?.getAuthmachineLoginUrl) setLoginURL(authMachineData.getAuthmachineLoginUrl);
  }, [authMachineData])


  useEffect(() => {
    if (personData && personData.person) {
      const {fullName, slug, id, username, productpersonSet, claimedTask} = personData.person;
      userLogInAction({
        isLoggedIn: true,
        fullName,
        slug,
        id,
        claimedTask,
        username: username,
        roles: productpersonSet.map((role: any) => {
          return {
            product: role.product.slug,
            role: USER_ROLES[role.right]
          }
        })
      })
    } else if (personData && personData.person === null) {
      userLogInAction({
        isLoggedIn: false,
        fullName: "",
        slug: "",
        username: "",
        id: null,
        claimedTask: null,
        roles: []
      });
    }
  }, [personData])

  const [logout] = useMutation(LOGOUT, {
    onCompleted(data) {
      const {success, message: responseMessage, url} = data.logout;
      if (success) {
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        if (url) {
          window.location.replace(url);
        } else {
          router.push("/switch-test-user").then();
        }
      } else {
        message.error(responseMessage);
      }

    },
    onError(err) {
      message.error("Failed to logout form the system").then();
    }
  });

  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Row
        className="header-mobile"
        align="middle" justify="space-between"
        style={{height: 56, padding: '0 30px', borderBottom: '1px solid #d9d9d9'}}
      >
        <Col>
          <Link href="/">
            <img src={Logo} alt="logo"/>
          </Link>
        </Col>
        <Col>
          <Button onClick={showDrawer} icon={<MenuOutlined/>} size="large"/>
        </Col>

        <Drawer
          title="Open United"
          placement="left"
          closable={false}
          onClose={onClose}
          visible={visible}
        >
          <Search
            placeholder="Search for open source product or initiative"
            onSearch={onSearch}
          />
          <Menu style={{borderRight: 0, marginTop: 10}}>
            <Menu.Item key="0">
              <Link href="/">
                <a className="text-grey-9">Work on Open Products</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="1">
              <Link href="/product/add">
                <a className="text-grey-9">Add Product</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link href="/">
                <a className="text-grey-9">Find Talent</a>
              </Link>
            </Menu.Item>
            {user?.claimedTask ?
              <Menu.Item key="3">
                <Link href={user.claimedTask.link}>
                  <a className="text-grey-9 truncate">
                    <strong>Claimed task: </strong> {user.claimedTask.title}
                  </a>
                </Link>
            </Menu.Item> : null}
            {
              user && user.isLoggedIn ? (
                <Menu.Item key="4" onClick={() => logout()} className="signIn-btn">
                  Sign out
                </Menu.Item>
              ) : (
                <>
                  {
                    productionMode
                      ? <LoginViaAM fullWidth={true} />
                      : (
                        <Menu.Item key="4">
                          <Link href="/switch-test-user">
                            <a className="text-grey-9">Sign in</a>
                          </Link>
                        </Menu.Item>
                      )
                  }
                </>
              )
            }
          </Menu>
        </Drawer>
      </Row>


      <Row align="middle" style={{height: 56, borderBottom: '1px solid #d9d9d9'}} className="header-desktop">
        <Col span={10}>
          <Row justify="center">
            <Col style={{marginRight: 20}}>
              <Typography.Link className="gray-link" href="/">Work on Open Products</Typography.Link>
            </Col>
            <Col style={{marginRight: 20}}>
              <Typography.Link className="gray-link" href="/product/add">Add Product</Typography.Link>
            </Col>
            <Col style={{marginRight: 20}}>
              <Typography.Link className="gray-link" href="">Find Talent</Typography.Link>
            </Col>
          </Row>
        </Col>

        <Col span={4}>
          <Row justify="center">
            <Link href="/">
              <img src={Logo} alt="logo"/>
            </Link>
          </Row>
        </Col>

        <Col span={10}>
          <Row align="middle" justify="center">
            <Col style={{marginRight: 10}}>
              <Search
                placeholder="Search for open source product or initiative"
                onSearch={onSearch}
              />
            </Col>
            <Col>
              {
                user && user.isLoggedIn ? (
                  <Dropdown overlay={menu} placement="bottomRight" className="ml-15">
                    <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                      <strong className="text-grey-9">{user.username}</strong>
                      <DownOutlined className="text-grey-9 ml-5" />
                    </a>
                  </Dropdown>
                ) : (
                  <>{
                    productionMode
                      ? <LoginViaAM />
                      : (
                        <Button
                          className="signIn-btn"
                          onClick={() => router.push("/switch-test-user")}
                        >
                          Sign in
                        </Button>
                      )
                  }</>
                )
              }
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch: any) => ({
  userLogInAction: (data: UserState) => dispatch(userLogInAction(data)),
  setLoginURL: (loginUrl: string) => dispatch(setLoginURL(loginUrl)),
});

const HeaderMenu = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderMenuContainer);

export default HeaderMenu;
