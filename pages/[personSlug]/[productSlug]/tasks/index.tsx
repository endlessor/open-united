import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {Row, Col, Button} from 'antd';
import {useQuery} from '@apollo/react-hooks';
import {GET_TASKS_BY_PRODUCT} from '../../../../graphql/queries';
import {TaskTable} from '../../../../components';
import AddTask from '../../../../components/Products/AddTask';
import LeftPanelContainer from '../../../../components/HOC/withLeftPanel';
import {useRouter} from "next/router";
import {TASK_TYPES} from "../../../../graphql/types";
import Loading from "../../../../components/Loading";
import {FilterOutlined} from "@ant-design/icons";
import FilterModal from "../../../../components/FilterModal";
import {getUserRole, hasManagerRoots} from "../../../../utilities/utils";

type Props = {
  onClick?: () => void;
  userRole: string;
  user: { roles: any[], id: string },
  productSlug: string;
};

const TasksPage: React.FunctionComponent<Props> = (props: Props) => {
  const router = useRouter()
  const {productSlug} = router.query
  const {user} = props;
  const [statuses, setStatuses] = useState<Array<number>>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [tasks, setTasks] = useState<any>([]);
  const [inputData, setInputData] = useState({
    sortedBy: "priority",
    statuses,
    tags: [],
    priority: [],
    stacks: [],
    assignee: [],
    taskCreator: [],
  });

  useEffect(() => {
    if (location.hash === '#available') {
      setStatuses([2]);
    }
  }, []);

  const productsVariable = {
    productSlug,
    input: inputData
  };

  let {data, error, loading, refetch} = useQuery(GET_TASKS_BY_PRODUCT, {
    variables: productsVariable,
    fetchPolicy: "no-cache"
  });

  const closeTaskModal = (flag: boolean) => {
    setShowAddTaskModal(flag);
    refetch(productsVariable);
  };

  const applyFilter = (values: any) => {
    values = Object.assign(values, {});
    setInputData(values);
    setFilterModal(false);
  }

  useEffect(() => {
    if (data && data.tasklistingByProduct) {
      setTasks(data.tasklistingByProduct);
    }
  }, [data]);

  const fetchTasks = async () => {
    await refetch(productsVariable);
  }

  if (loading) return <Loading/>;

  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  return (
    <LeftPanelContainer>
      <div>
        <Row>
          {userHasManagerRoots && (
            <Col>
              <Button
                className="text-right add-task-btn mb-15"
                onClick={() => setShowAddTaskModal(true)}
              >
                Add Task
              </Button>
              <AddTask
                modal={showAddTaskModal}
                closeModal={closeTaskModal}
                tasks={tasks}
                submit={fetchTasks}
                productSlug={String(productSlug)}
              />
            </Col>
          )}
          <Col className="tag-section ml-auto">
            <Button
              type="primary"
              onClick={() => setFilterModal(!filterModal)}
              icon={<FilterOutlined/>}
            >Filter</Button>
          </Col>
        </Row>
      </div>
      <div>
        {
          !error ?
            <TaskTable
              submit={() => refetch(productsVariable)}
              tasks={tasks}
              statusList={TASK_TYPES}
              showInitiativeName={true}
              hideTitle={true}
              showPendingTasks={userHasManagerRoots}
            /> : (
              <h3 className="text-center mt-30">No tasks</h3>
            )
        }
      </div>

      <FilterModal
        modal={filterModal}
        initialForm={inputData}
        closeModal={() => setFilterModal(false)}
        productSlug={productSlug}
        submit={applyFilter}
      />

    </LeftPanelContainer>
  )
};

const mapStateToProps = (state: any) => ({
  user: state.user,
});

const mapDispatchToProps = () => ({});

const TasksPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TasksPage);

export default TasksPageContainer;
