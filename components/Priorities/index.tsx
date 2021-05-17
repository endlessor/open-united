import {Dropdown, Menu, message} from "antd";
import React from "react";
import {getProp} from "../../utilities/filters";
import {DownOutlined} from "@ant-design/icons";
import {useMutation} from "@apollo/react-hooks";
import {CHANGE_TASK_PRIORITY} from "../../graphql/mutations";


interface IProps {
  task: any,
  submit: Function,
  canEdit: boolean,
}

const Priorities: React.FunctionComponent<IProps> = ({task, submit, canEdit = false}) => {
  const currentPriority = getProp(task, 'priority', '');
  const taskId = getProp(task, 'task.id', 0);
  const otherPriorities = ['High', 'Medium', 'Low'].filter(priority => priority != currentPriority);


  const [changeTaskPriority] = useMutation(CHANGE_TASK_PRIORITY, {
    onCompleted() {
      message.success('Priority is successfully updated!').then();
      submit();
    },
    onError(err) {
      message.error('Failed to update priority!').then();
    }
  });


  const getColor = (priorityName: string) => {
    switch (priorityName) {
      case 'High':
        return '#FF8C00';
      case 'Medium':
        return '#00D358';
      case 'Low':
        return '#00A2F7';
    }
  }

  return (
    <Dropdown overlay={
      canEdit ?
        <Menu>
          {
            otherPriorities.map((priority: any, index: number) => (
              <Menu.Item
                key={index}
                style={{
                  color: getColor(priority),
                  textAlign: 'center'
                }}
                onClick={() => changeTaskPriority({variables: {taskId, priority}})}
              >{priority}</Menu.Item>
            ))
          }
        </Menu> : <></>
    } trigger={['click']}>
      <a style={{color: getColor(currentPriority)}}>
        {currentPriority} {canEdit && <DownOutlined/>}
      </a>
    </Dropdown>

  )
}

export default Priorities;