import React, {useState} from 'react';
import {Row, Col, Radio, Select, Layout, Space} from 'antd';
import {RadioChangeEvent} from 'antd/lib/radio';
import ProductTab from './ProductTab';
import TaskTab from './TaskTab';
import {useQuery} from "@apollo/react-hooks";
import {GET_STACKS} from "../../graphql/queries";
import {getProp} from "../../utilities/filters";

const {Option} = Select;
const {Content} = Layout;


interface IStack {
  id: number
  name: string
}

const Dashboard: React.FunctionComponent = () => {
  const [mode, setMode] = useState('products');
  const [productNum, setProductNum] = useState(0);
  const [stacksFilter, setStacksFilter] = useState<any>([]);
  const [taskNum, setTaskNum] = useState(0);

  const {data: stacksData} = useQuery(GET_STACKS);

  const handleModeChange = (e: RadioChangeEvent): void => {
    setMode(e.target.value);
  };

  return (
    <Content className="container main-page">
      <div
        className="page-title text-center mb-40"
      >
        {
          mode === "products"
            ? `Explore ${productNum} Open Products`
            : `Explore ${taskNum} tasks across ${productNum} Open Products`
        }
      </div>

      <Row align="middle" justify="space-between" className="mb-15" style={{padding: 8}}>
        <Col xs={24} sm={12} md={8} style={{marginTop: 42}}>
          <Radio.Group onChange={handleModeChange} value={mode} className="mb-8">
            <Radio.Button value="products">Products</Radio.Button>
            <Radio.Button value="tasks">Tasks</Radio.Button>
          </Radio.Group>
        </Col>

        <Col xs={24} sm={12} md={12} lg={8} style={{marginTop: 20, width: '100%'}}>
          {
            mode === "products" &&
            <Row justify="end">
                <Col>
                    <Space style={{width: '100%'}}>
                        <label>Skills Required: </label>
                        <Select
                            mode="multiple"
                            placeholder="Specify skills required"
                            style={{minWidth: '200px'}}
                            onChange={(val) => {setStacksFilter(val)}}
                        >
                          {
                            getProp(stacksData, 'stacks', []).map((stack: IStack) => (
                              <Option key={`stack-${stack.id}`} value={stack.name}>{stack.name}</Option>
                            ))
                          }
                        </Select>
                    </Space>
                </Col>
            </Row>
          }
        </Col>
      </Row>
      {
        mode === "products" ? (
          <ProductTab stacksFilter={stacksFilter} setProductNum={setProductNum}/>
        ) : (
          <TaskTab
            setTaskNum={setTaskNum}
            showInitiativeName={true}
            showProductName={true}
          />
        )
      }
      <div style={{marginBottom: 50}}/>
    </Content>
  )
};


export default Dashboard;