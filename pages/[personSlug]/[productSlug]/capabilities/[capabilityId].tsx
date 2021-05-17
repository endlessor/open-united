import React, {useState, useEffect} from 'react';
import Link from "next/link";
import {useRouter} from 'next/router'
import {Row, Col, Button, message, Layout, Space, Breadcrumb, Dropdown, Menu} from 'antd';
import {useQuery, useMutation} from '@apollo/react-hooks';
import ReactPlayer from 'react-player';
import {GET_CAPABILITY_BY_ID, GET_CAPABILITY_PARENT_CRUMBS} from '../../../../graphql/queries';
import {DELETE_CAPABILITY} from '../../../../graphql/mutations';
import {TagType, TASK_TYPES} from '../../../../graphql/types';
import {getProp} from '../../../../utilities/filters';
import {TaskTable, DynamicHtml, ContainerFlex, Header} from '../../../../components';
import DeleteModal from '../../../../components/Products/DeleteModal';
import AddOrEditCapability from '../../../../components/Products/AddOrEditCapability';
import EditIcon from '../../../../components/EditIcon';
import Attachments from "../../../../components/Attachments";
import Loading from "../../../../components/Loading";
import {DownOutlined, FilterOutlined} from "@ant-design/icons";
import CheckableTag from "antd/lib/tag/CheckableTag";
import FilterModal from "../../../../components/FilterModal";
import {getUserRole, hasManagerRoots} from "../../../../utilities/utils";
import {connect} from "react-redux";
import parse from 'html-react-parser';
import Comments from "../../../../components/Comments";


const {Content} = Layout;


interface ICrumb {
  id: number
  name: string
  siblings: [{
    id: number
    name: string
  }]
}

interface IParentsCrumbsProps {
  personSlug: string
  productSlug: string
  crumbs: ICrumb[]
  capabilityName: string
}

interface ICapabilityDetailProps {
  user: any
}

const ParentsCrumbs: React.FunctionComponent<IParentsCrumbsProps> = (
  {personSlug, productSlug, crumbs, capabilityName}
) => {
  return (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link href={`/${personSlug}/${productSlug}/capabilities`}>Capabilities</Link>
      </Breadcrumb.Item>

      {
        crumbs.map(crumb => (
          <>
            <Link href={`/${personSlug}/${productSlug}/capabilities/${crumb.id}`}>{crumb.name}</Link>

            <Breadcrumb.Item key={crumb.id}>

              <Dropdown trigger={['click']} overlay={
                <Menu>
                  {
                    crumb.siblings.map(sibling => (
                      <Menu.Item key={sibling.id}>
                        <Link href={`/${personSlug}/${productSlug}/capabilities/${sibling.id}`}>
                          {sibling.name}
                        </Link>
                      </Menu.Item>
                    ))
                  }
                </Menu>
              }>
                <a href={`/${personSlug}/${productSlug}/capabilities/${crumb.id}`}>
                  <DownOutlined style={{marginLeft: 5}}/>
                </a>
              </Dropdown>
            </Breadcrumb.Item>
          </>
        ))
      }

      <Breadcrumb.Item>{capabilityName}</Breadcrumb.Item>
    </Breadcrumb>
  )
}


const CapabilityDetail: React.FunctionComponent<ICapabilityDetailProps> = ({user}) => {
  const router = useRouter();
  let {capabilityId, personSlug, productSlug} = router.query;
  productSlug = String(productSlug);

  const [capability, setCapability] = useState({});
  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [formattedCrumbs, setFormattedCrumbs] = useState<Array<ICrumb>>([]);

  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  const [inputData, setInputData] = useState({
    sortedBy: "priority",
    statuses: [],
    tags: [],
    priority: [],
    stacks: [],
    assignee: [],
    taskCreator: [],
  });

  const {data, error, loading, refetch} = useQuery(GET_CAPABILITY_BY_ID, {
    variables: {nodeId: capabilityId, slug: productSlug, input: inputData}
  });

  const {data: crumbs, error: crumbsError, loading: crumbsLoading} = useQuery(GET_CAPABILITY_PARENT_CRUMBS, {
    variables: {nodeId: capabilityId}
  });

  useEffect(() => {
    if (!crumbsError && crumbs) {
      setFormattedCrumbs(JSON.parse(crumbs.capabilityParentCrumbs));
    }
  }, [crumbs])

  const [deleteModal, showDeleteModal] = useState(false);

  const [deleteCapability] = useMutation(DELETE_CAPABILITY, {
    variables: {
      nodeId: capabilityId
    },
    onCompleted() {
      message.success("Item is successfully deleted!").then();
      refetch().then();
      router.push(`/${personSlug}/${productSlug}/capabilities`).then();
    },
    onError() {
      message.error("Failed to delete item!").then();
    }
  });

  useEffect(() => {
    if (!error) {
      setCapability(getProp(data, 'capability.capability', {}));
      setTasks(getProp(data, 'capability.tasks', []))
    }
  }, [data]);

  const applyFilter = (values: any) => {
    values = Object.assign(values, {});
    setInputData(values);
    setFilterModal(false);
  };

  if (loading || crumbsLoading) return <Loading/>;

  return (
    <ContainerFlex>
      <Layout>
        <Header/>
        <Content className="container product-page" style={{marginTop: 20, marginBottom: 80}}>
          {
            !error && !crumbsError && (
              <>
                <ParentsCrumbs
                  personSlug={personSlug}
                  productSlug={productSlug}
                  crumbs={formattedCrumbs}
                  capabilityName={getProp(capability, 'name', '')}
                />
                <Row
                  justify="space-between"
                  className="right-panel-headline mb-15"
                >
                  <Col>
                    <div
                      className="page-title"
                    >
                      {getProp(capability, 'name', '')}
                    </div>
                  </Col>
                  {
                    userHasManagerRoots &&
                    <Col>
                        <Button
                            onClick={() => showDeleteModal(true)}
                        >
                            Delete
                        </Button>
                        <EditIcon
                            className='ml-10'
                            onClick={() => setShowEditModal(true)}
                        />
                    </Col>
                  }
                </Row>
                <Space align="start" size={20} direction="vertical">
                  {getProp(capability, 'videoLink', null) && (
                    <Row>
                      <Col span={24}>
                        <ReactPlayer
                          width="100%"
                          height="170px"
                          className="mr-10"
                          url={getProp(capability, 'videoLink')}
                        />
                      </Col>
                    </Row>
                  )}
                  <Row className="html-description">
                    <Col span={24}>
                      {parse(getProp(capability, 'description', ''))}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      {
                        getProp(capability, 'stacks', []).map((tag: TagType, index: number) => (
                          <CheckableTag key={`tag-${index}`} checked={true}>{tag.name}</CheckableTag>
                        ))
                      }
                    </Col>
                  </Row>
                </Space>

                <Row>
                  <Col span={12}>
                    {
                      getProp(capability, 'attachments', []).length > 0 && (
                        <Attachments
                          style={{marginTop: 20, marginBottom: 50}}
                          data={getProp(capability, 'attachments', [])}
                        />
                      )
                    }
                  </Col>
                </Row>

                <TaskTable
                  submit={() => refetch()}
                  tasks={tasks}
                  productSlug={productSlug}
                  statusList={TASK_TYPES}
                  showInitiativeName={true}
                  content={
                    <Button
                      type="primary"
                      style={{padding: "0 10px"}}
                      onClick={() => setFilterModal(!filterModal)}
                      icon={<FilterOutlined/>}
                    >
                      Filter
                    </Button>
                  }
                />

                <div style={{marginTop: 30}} />

                <div className="mt-40 mb-10 d-flex-justify-center">Comments</div>

                <Comments objectId={capability?.id || 0} objectType="capability" />

                {
                  deleteModal &&
                  <DeleteModal
                      modal={deleteModal}
                      closeModal={() => showDeleteModal(false)}
                      submit={deleteCapability}
                      title="Delete capability"
                  />
                }
                {
                  showEditModal &&
                  <AddOrEditCapability
                      modal={showEditModal}
                      modalType={'edit'}
                      closeModal={setShowEditModal}
                      submit={() => refetch()}
                      capability={capability}
                  />
                }
              </>
            )
          }
        </Content>
      </Layout>
      <FilterModal
        modal={filterModal}
        initialForm={inputData}
        closeModal={() => setFilterModal(false)}
        productSlug={productSlug}
        submit={applyFilter}
      />
    </ContainerFlex>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user
});

const mapDispatchToProps = () => ({});

const CapabilityDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CapabilityDetail);

export default CapabilityDetailContainer;