import React from 'react';
import AddOrEditProduct from "../../components/AddOrEditProduct";
import {ContainerFlex, Header} from "../../components";
import {Layout} from "antd";


const {Content} = Layout;


const AddProduct: React.FunctionComponent = () => {
  return (
    <ContainerFlex>
      <Header/>
      <Layout>
        <Content className="container product-page mt-42">
          <AddOrEditProduct isAdding={true}/>
        </Content>
      </Layout>
    </ContainerFlex>
  )
};

export default AddProduct;