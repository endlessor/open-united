import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {Modal, Row, Input, Select, message} from 'antd';
import {useMutation, useQuery} from '@apollo/react-hooks';
import {
  GET_CAPABILITIES_BY_PRODUCT_AS_LIST, GET_PRODUCTS_SHORT
} from '../../graphql/queries';
import {CREATE_IDEA, UPDATE_IDEA} from '../../graphql/mutations';
import {RICH_TEXT_EDITOR_WIDTH} from '../../utilities/constants';
import {getProp} from "../../utilities/filters";
import RichTextEditor from "../RichTextEditor";
import {IDEA_TYPES} from "../../graphql/types";

const {Option} = Select;

type Props = {
  modal?: boolean,
  productSlug?: string,
  closeModal: any,
  currentProduct?: any,
  modalType?: boolean,
  submit?: any;
  idea: {
    id: string,
    headline: string,
    description: string,
    product: {
      id: string
    },
    recentCapability: {
      id
    } | null,
    ideaType: string,
  },
};

const AddEditIdea: React.FunctionComponent<Props> = (
  {
    modal = false,
    productSlug,
    closeModal,
    editMode = false,
    idea,
    submit,
  }
) => {
  const [headline, setHeadline] = useState(editMode ? idea.headline : '');

  const [allCapabilities, setAllCapabilities] = useState([]);
  const [description, setDescription] = useState(editMode ? idea.description : '');
  const [descriptionClear, setDescriptionClear] = useState(0);
  const [ideaType, setIdeaType] = useState(editMode ? idea.ideaType : '');
  const [product, setProduct] = useState(editMode ? idea.product?.id || null : null);
  const [capability, setCapability] = useState(
    editMode && idea.relatedCapability ? idea.relatedCapability?.id || null : null
  );

  const {data: capabilitiesData, refetch: capabilitiesRefetch} = useQuery(GET_CAPABILITIES_BY_PRODUCT_AS_LIST, {
    variables: {productSlug},
    fetchPolicy: "no-cache"
  });
  const {data: productsData} = useQuery(GET_PRODUCTS_SHORT, {
    fetchPolicy: "no-cache"
  });
  const [createIdea] = useMutation(CREATE_IDEA);
  const [updateIdea] = useMutation(UPDATE_IDEA);

  const filterOption = (input: string, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  useEffect(() => {
    if (capabilitiesData && capabilitiesData.capabilitiesAsList) {
      setAllCapabilities(capabilitiesData.capabilitiesAsList);
    }
  }, [capabilitiesData]);

  useEffect(() => {
    if (product && productsData?.products) {
      const searchedProduct = productsData.products.find(p => p.id === product);
      if (searchedProduct) {
        setCapability(null);
        capabilitiesRefetch({productSlug: searchedProduct.slug})
      }
    }
  }, [product]);

  useEffect(() => {
    if (!editMode && productsData?.products) {
      const searchedProduct = productsData.products.find(p => p.slug === productSlug);
      if (searchedProduct) setProduct(searchedProduct.id);
    }
  }, [productsData, editMode, productSlug])

  // @ts-ignore
  const handleOk = async () => {
    if (!headline) {
      message.error("Headline is required. Please fill out headline");
      return;
    }
    if (!description || description === '<p></p>') {
      message.error("Long description is required. Please fill out description");
      return;
    }
    if (!product) {
      message.error("Product is required. Please select the product");
      return;
    }
    // if (ideaType === "") {
    //   message.error("Please select what best matches your idea");
    //   return;
    // }

    await addNewIdea();
  };

  const handleCancel = () => {
    closeModal(!modal);
    clearData();
  };

  const clearData = () => {
    setHeadline("");
    setCapability(null);
    setProduct(null);
    setDescription("");
    setDescriptionClear(prev => prev + 1);
    setIdeaType(null);
  }

  // @ts-ignore
  const addNewIdea = async () => {
    const input = {
      headline,
      description,
      productId: parseInt(product),
      relatedCapabilityId: capability !== null ? parseInt(capability) : null,
      // ideaType,
    };

    try {
      const res = editMode
        ? await updateIdea({
          variables: {input, id: parseInt(idea.id)}
        })
        : await createIdea({
          variables: {input}
        })

      const modalTypeText = editMode ? 'updateIdea' : 'createIdea';
      const messageText = getProp(res, `data.${modalTypeText}.message`, '');

      if (messageText && getProp(res, `data.${modalTypeText}.success`, false)) {
        if (submit) submit();
        message.success(messageText);

        if (!editMode) clearData();
      } else if (messageText) {
        message.error(messageText);
      }

      closeModal(!modal);
    } catch (e) {
      message.error(e.message);
    }
  }

  return (
    <>
      <Modal
        title={`${editMode ? "Edit" : "Add"} Idea`}
        visible={modal}
        onOk={handleOk}
        onCancel={handleCancel}
        className="add-modal add-task-modal"
        width={RICH_TEXT_EDITOR_WIDTH}
        maskClosable={false}
      >
        <Row className='mb-15'>
          <label>Please give your idea a name *:</label>
          <Input
            placeholder="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
        </Row>
        <Row className='mb-15'>
          <label>Please describe the idea *:</label>
          <RichTextEditor initialHTMLValue={description} onChangeHTML={setDescription} clear={descriptionClear}/>
        </Row>
        {/*<Row className='mb-15'>*/}
        {/*  <label>Which of the following best matches your idea? *:</label>*/}
        {/*  <Select*/}
        {/*    placeholder='Select an idea type'*/}
        {/*    onChange={setIdeaType}*/}
        {/*    value={ideaType}*/}
        {/*  >*/}
        {/*    <Option value="">-------------</Option>*/}
        {/*    {IDEA_TYPES.map((option: any, idx: number) => (*/}
        {/*      <Option key={`cap${idx}`} value={option.id}>*/}
        {/*        {option.name}*/}
        {/*      </Option>*/}
        {/*    ))}*/}
        {/*  </Select>*/}
        {/*</Row>*/}
        <Row className='mb-15'>
          <label>Product *:</label>
          <Select
            placeholder='Select a product'
            onChange={setProduct}
            filterOption={filterOption}
            showSearch
            value={product}
            disabled={!editMode}
          >
            {productsData?.products && productsData.products.map((option: { id: string, name: string }) =>
              <Option key={`product-${option.id}`} value={option.id}>{option.name}</Option>)}
          </Select>
        </Row>
        <Row className='mb-15'>
          <label>Related capability:</label>
          <Select
            placeholder='Select a capability'
            onChange={setCapability}
            filterOption={filterOption}
            showSearch
            value={capability}
          >
            <Option value={null}>-------------</Option>
            {allCapabilities.map((option: any, idx: number) => (
              <Option key={`cap${idx}`} value={option.id}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Row>
      </Modal>
    </>
  )
}

const mapStateToProps = (state: any) => ({
  user: state.user,
  currentProduct: state.work.currentProduct,
});

export default connect(
  mapStateToProps,
  null
)(AddEditIdea);