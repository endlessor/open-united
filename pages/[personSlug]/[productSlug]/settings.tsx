import React, {useState} from "react";
import LeftPanelContainer from "../../../components/HOC/withLeftPanel";
import {Button, Col, Dropdown, Menu, Row, Space, Tabs, Typography} from "antd";
import SettingsPolicies from "../../../components/SettingsPolicies";
import {DownOutlined} from "@ant-design/icons";


const {TabPane} = Tabs;


const Settings: React.FunctionComponent = () => {
  const pages: string[] = [
    'Policies',
    'Contributions',
    'Tags'
  ]
  const [activePage, setActivePage] = useState('Policies')

  return (
    <LeftPanelContainer>
      <Row style={{marginBottom: 20}}>
        <Col span={24}>
          <Dropdown className="settings-mobile-menu" trigger={['click']} overlay={
            <Menu>
              {
                pages.map((page: string, index: number) => (
                  <Menu.Item key={index} onClick={() => setActivePage(page)}>{page}</Menu.Item>
                ))
              }
            </Menu>
          }>
            <Button style={{width: '100%'}}>
              {activePage} <DownOutlined/>
            </Button>
          </Dropdown>

          <Tabs className="settings-desktop-menu" onChange={val => setActivePage(val)} activeKey={activePage}>
            {
              pages.map((page: string) => (
                <TabPane tab={page} key={page}/>
              ))
            }
          </Tabs>
        </Col>
      </Row>


      {
        activePage === 'Policies' ?
          <SettingsPolicies/> :
          <Typography.Text>It will be implemented in the future</Typography.Text>
      }
    </LeftPanelContainer>
  )
}

export default Settings;