import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {Row, Col, message, Button} from 'antd';
import {useQuery, useMutation} from '@apollo/react-hooks';
import {GET_INITIATIVE_BY_ID} from '../../../../graphql/queries';
import {DELETE_INITIATIVE} from '../../../../graphql/mutations';
import DeleteModal from '../../../../components/Products/DeleteModal';
import AddInitiative from '../../../../components/Products/AddInitiative';
import {TaskTable, DynamicHtml} from '../../../../components';
import {getProp} from '../../../../utilities/filters';
import {getUserRole, hasManagerRoots, randomKeys} from '../../../../utilities/utils';
import LeftPanelContainer from '../../../../components/HOC/withLeftPanel';
import Loading from "../../../../components/Loading";
import {TASK_TYPES} from "../../../../graphql/types";
import FilterModal from "../../../../components/FilterModal";
import { FilterOutlined, EditOutlined } from "@ant-design/icons";
import AvatarIcon from "../../../../components/AvatarIcon";
// @ts-ignore
import CheckCircle from "../../../../public/assets/icons/check-circle.svg";
// @ts-ignore
import FilledCircle from "../../../../public/assets/icons/filled-circle.svg";


type Params = {
  user: any;
};

const InitiativeDetail: React.FunctionComponent<Params> = ({user}) => {
  const router = useRouter();
  let {initiativeId, productSlug} = router.query;
  productSlug = String(productSlug);

  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  const [initiative, setInitiative] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [inputData, setInputData] = useState({
    sortedBy: "priority",
    statuses: [],
    tags: [],
    priority: [],
    stacks: [],
    assignee: [],
    taskCreator: [],
  });

  const [deleteInitiative] = useMutation(DELETE_INITIATIVE, {
    variables: {
      id: initiativeId
    },
    onCompleted() {
      message.success("Item is successfully deleted!").then();
      router.push(`/${getProp(initiative, 'product.owner')}/${productSlug}/initiatives`).then();
    },
    onError() {
      message.error("Failed to delete item").then();
    }
  });

  const {data: original, error, loading, refetch} = useQuery(GET_INITIATIVE_BY_ID, {
    variables: {id: initiativeId, input: inputData }
  });

  const fetchData = () => {
    refetch({
      id: initiativeId
    });
  }

  useEffect(() => {
    if (original && original.initiative) {
      setInitiative(original.initiative.initiative);
      setTasks(original.initiative.tasks);
    }
  }, [original]);

  const applyFilter = (values: any) => {
    values = Object.assign(values, {});
    setInputData(values);
    setFilterModal(false);
  };

  if (loading) return <Loading/>

  const status = (getProp(initiative, 'status', 1) == 1) ? "Active" : "Completed";

  return (
    <LeftPanelContainer>
      {
        !error && (
          <React.Fragment key={randomKeys()}>
            <div className="text-grey">
              <Link href={`/${getProp(initiative, 'product.owner')}/${productSlug}`}>
                <a className="text-grey">{getProp(initiative, 'product.name', '')}</a>
              </Link>
              <span> / </span>
              <Link href={`/${getProp(initiative, 'product.owner')}/${productSlug}/initiatives`}>
                <a className="text-grey">Initiatives</a>
              </Link>
            </div>
            <Row
              justify="space-between"
              className="right-panel-headline mb-15"
            >
              <div className="page-title page-title-flex">
                <div>
                  {getProp(initiative, 'name', '')}
                  {userHasManagerRoots && (
                    <>
                      <AvatarIcon
                        className="ml-10 small-avatar"
                        icon={<EditOutlined />}
                        onClick={() => setShowEditModal(true)}
                      />
                    </>
                  )}
                </div>
                <div className="instance-status">
                  {status}
                  <img
                    src={status === "Active" ? FilledCircle : CheckCircle}
                    className="check-circle-icon ml-5"
                    alt="status"
                  />
                </div>
              </div>
            </Row>
            <Row className="html-description">
              <Col span={10}>
                <DynamicHtml
                  className='mb-10'
                  text={getProp(initiative, 'description', '')}
                />
              </Col>
            </Row>
            <TaskTable
              tasks={tasks}
              statusList={TASK_TYPES}
              productSlug={productSlug}
              content={<Button type="primary"
                               style={{padding: "0 10px"}}
                               onClick={() => setFilterModal(!filterModal)}
                               icon={<FilterOutlined />}>Filter</Button>}
              submit={fetchData}
            />
            {deleteModal && (
              <DeleteModal
                modal={deleteModal}
                closeModal={() => showDeleteModal(false)}
                submit={() => {
                  showDeleteModal(false);
                  deleteInitiative().then()
                }}
                title="Delete this initiative"
                description="Are you sure you want to delete this initiative?"
              />
            )}
            {
              showEditModal && <AddInitiative
                modal={showEditModal}
                productSlug={productSlug}
                modalType={true}
                closeModal={setShowEditModal}
                submit={fetchData}
                handleDelete={() => {
                  setShowEditModal(false);
                  showDeleteModal(true);
                }}
                initiative={initiative}
              />
            }
            <FilterModal
              modal={filterModal}
              initialForm={inputData}
              closeModal={() => setFilterModal(false)}
              productSlug={productSlug}
              submit={applyFilter}
            />
          </React.Fragment>
        )
      }
    </LeftPanelContainer>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user,
  userRole: state.work.userRole,
});

const mapDispatchToProps = () => ({});

const InitiativeDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(InitiativeDetail);

export default InitiativeDetailContainer;