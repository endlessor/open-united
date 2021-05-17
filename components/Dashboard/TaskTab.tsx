import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import {GET_TASKS} from '../../graphql/queries';
import TaskTable from '../TaskTable'
import Loading from "../Loading";
import {TASK_TYPES} from "../../graphql/types";
import FilterModal from "../FilterModal";
import {FilterOutlined} from "@ant-design/icons";
import {Button} from "antd";


type Props = {
  setTaskNum: (value: number) => void,
  showInitiativeName?: boolean,
  showProductName?: boolean,
};

const TaskTab: React.FunctionComponent<Props> = (
  {
    setTaskNum,
    showInitiativeName = false,
    showProductName = false,
  }
) => {
  const [filterModal, setFilterModal] = useState(false);
  const [inputData, setInputData] = useState({
    sortedBy: "priority",
    statuses: [],
    tags: [],
    priority: [],
    stacks: [],
    assignee: [],
    taskCreator: [],
  });

  const {data, error, loading, refetch} = useQuery(GET_TASKS, {
    variables: {
      input: inputData
    }
  });

  const applyFilter = (values: any) => {
    values = Object.assign(values, {});
    setInputData(values);
    setFilterModal(false);
  }

  useEffect(() => {
    if (!error && data && data.tasklisting) {
      setTaskNum(data.tasklisting.length);
    }
  });

  if (loading) return <Loading/>
  if (!data || !data.tasklisting) return <h3 className="text-center">No tasks</h3>

  return (
    <div>
      <div className="text-right tasks-main" style={{marginTop: -55}}>
        <Button
          type="primary"
          onClick={() => setFilterModal(!filterModal)}
          icon={<FilterOutlined/>}
        >Filter</Button>
      </div>
      <TaskTable
        submit={() => refetch()}
        tasks={data.tasklisting}
        statusList={TASK_TYPES}
        showInitiativeName={showInitiativeName}
        showProductName={showProductName}
        hideTitle={true}
      />
      <FilterModal
        modal={filterModal}
        initialForm={inputData}
        closeModal={() => setFilterModal(false)}
        submit={applyFilter}
      />
    </div>
  );
};

export default TaskTab;