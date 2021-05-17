import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {Row, Col, message, Button, Tag, Collapse, List, Modal, Spin, Typography, Breadcrumb} from 'antd';
import Link from "next/link";
import {useRouter} from 'next/router';
import {useQuery, useMutation, useLazyQuery} from '@apollo/react-hooks';
import ReactPlayer from 'react-player'
import {
  GET_LICENSE, GET_PERSON,
  GET_PRODUCT_INFO_BY_ID,
  GET_TASK_BY_ID,
  GET_TASKS_BY_PRODUCT_SHORT
} from '../../../../graphql/queries';
import {TASK_TYPES, USER_ROLES} from '../../../../graphql/types';
import {ACCEPT_AGREEMENT, CLAIM_TASK, DELETE_TASK, IN_REVIEW_TASK, LEAVE_TASK, REJECT_TASK,
  APPROVE_TASK} from '../../../../graphql/mutations';
import {getProp} from '../../../../utilities/filters';
import {EditIcon} from '../../../../components';
import DeleteModal from '../../../../components/Products/DeleteModal';
import LeftPanelContainer from '../../../../components/HOC/withLeftPanel';
import Attachments from "../../../../components/Attachments";
import CustomModal from "../../../../components/Products/CustomModal";
import Priorities from "../../../../components/Priorities";
import Loading from "../../../../components/Loading";
import parse from "html-react-parser";
import CheckableTag from "antd/lib/tag/CheckableTag";
import {getUserRole, hasManagerRoots} from "../../../../utilities/utils";
import AddTaskContainer from "../../../../components/Products/AddTask";
import Comments from "../../../../components/Comments";
import CustomAvatar2 from "../../../../components/CustomAvatar2";
import {UserState} from "../../../../lib/reducers/user.reducer";
import {userLogInAction} from "../../../../lib/actions";
import showUnAuthModal from "../../../../components/UnAuthModal";


const {Panel} = Collapse;

const actionName = "Claim the task";


type Params = {
  user?: any;
  currentProduct: any;
  loginUrl: string;
};

const Task: React.FunctionComponent<Params> = ({user, userLogInAction, loginUrl}) => {
  const router = useRouter();
  const {publishedId, personSlug, productSlug} = router.query;

  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [leaveTaskModal, showLeaveTaskModal] = useState(false);
  const [reviewTaskModal, showReviewTaskModal] = useState(false);
  const [rejectTaskModal, showRejectTaskModal] = useState(false);
  const [approveTaskModal, showApproveTaskModal] = useState(false);
  const [task, setTask] = useState<any>({});
  const [taskId, setTaskId] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [license, setLicense] = useState('');

  const [getPersonData, {data: personData}] = useLazyQuery(GET_PERSON, {
    fetchPolicy: "no-cache",
    enabled: false,
    manual: true
  });

  const {data: original, error, loading, refetch} = useQuery(GET_TASK_BY_ID, {
    variables: {publishedId, productSlug}
  });

  const {data: tasksData} = useQuery(GET_TASKS_BY_PRODUCT_SHORT, {
    variables: {
      productSlug, input: {}
    }
  });

  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  let {data: product} = useQuery(GET_PRODUCT_INFO_BY_ID, {variables: {slug: productSlug}});
  product = product?.product || {};

  useEffect(() => {
    if (tasksData && tasksData.tasklistingByProduct) {
      setTasks(tasksData.tasklistingByProduct)
    }
  }, [tasksData])

  useEffect(() => {
    if (!error) {
      setTaskId(getProp(original, 'task.id', 0));
    }
  }, [original]);

  const getBasePath = () => {
    return `/${personSlug}/${productSlug}`;
  }

  const [deleteTask] = useMutation(DELETE_TASK, {
    variables: {
      id: taskId
    },
    onCompleted() {
      message.success("Item is successfully deleted!").then();
      router.push(getBasePath() === "" ? "/" : `${getBasePath()}/tasks`).then();
    },
    onError() {
      message.error("Failed to delete item!").then();
    }
  });

  const handleIAgree = () => {
    acceptAgreement().then();
    setAgreementModalVisible(false);
  }

  const [leaveTask, {loading: leaveTaskLoading}] = useMutation(LEAVE_TASK, {
    variables: {taskId},
    onCompleted(data) {
      const {leaveTask} = data;
      const responseMessage = leaveTask.message;
      if (leaveTask.success) {
        message.success(responseMessage).then();
        fetchData().then();
        showLeaveTaskModal(false);
        getPersonData();
      } else {
        message.error(responseMessage).then();
      }
    },
    onError() {
      message.error("Failed to leave a task!").then();
    }
  });

  const [submitTask, {loading: submitTaskLoading}] = useMutation(IN_REVIEW_TASK, {
    variables: {taskId},
    onCompleted(data) {
      const {inReviewTask} = data;
      const responseMessage = inReviewTask.message;
      if (inReviewTask.success) {
        message.success(responseMessage).then();
        fetchData().then();
        getPersonData();
        showReviewTaskModal(false);
      } else {
        message.error(responseMessage).then();
      }
    },
    onError() {
      message.error("Failed to submit the task in review!").then();
    }
  });

  const [rejectTask, {loading: rejectTaskLoading}] = useMutation(REJECT_TASK, {
    variables: {taskId},
    onCompleted(data) {
      const {rejectTask} = data;
      const responseMessage = rejectTask.message;
      if (rejectTask.success) {
        message.success(responseMessage).then();
        fetchData().then();
        showRejectTaskModal(false);
        getPersonData();
      } else {
        message.error(responseMessage).then();
      }
    },
    onError() {
      message.error("Failed to reject a work!").then();
    }
  });

  const [approveTask, {loading: approveTaskLoading}] = useMutation(APPROVE_TASK, {
    variables: {taskId},
    onCompleted(data) {
      const {approveTask} = data;
      const responseMessage = approveTask.message;
      if (approveTask.success) {
        message.success(responseMessage).then();
        fetchData().then();
        showApproveTaskModal(false);
        getPersonData();
      } else {
        message.error(responseMessage).then();
      }
    },
    onError() {
      message.error("Failed to reject a work!").then();
    }
  });

  const [acceptAgreement] = useMutation(ACCEPT_AGREEMENT, {
    variables: {productSlug},
    onCompleted(data) {
      const messageText = getProp(data, 'agreeLicense.message', '');
      const status = getProp(data, 'agreeLicense.status', false);

      if (messageText !== '') {
        if (status) {
          message.success(messageText).then();
          claimTaskEvent();
        } else {
          message.error(messageText).then();
        }
      }
    },
    onError() {
      message.error('Failed to accept agreement').then();
    }
  })

  const {data: licenseOriginal, error: licenseError} = useQuery(GET_LICENSE, {
    variables: {productSlug}
  });

  useEffect(() => {
    if (!licenseError) {
      setLicense(getProp(licenseOriginal, 'license.agreementContent', ''));
    }
  }, [licenseOriginal]);

  const [claimTask, {loading: claimTaskLoading}] = useMutation(CLAIM_TASK, {
    variables: {taskId},
    onCompleted(data) {
      const {claimTask} = data;
      const responseMessage = claimTask.message;

      if (claimTask.isNeedAgreement) {
        setAgreementModalVisible(true);
        message.info(responseMessage).then();
      } else {
        if (claimTask.success) {
          message.success(responseMessage).then();
          fetchData().then();
          getPersonData();
        } else {
          message.error(claimTask.claimedTaskName ?
            <div>
              You cannot claim the task, you have an active task.
              <br/>
              <strong className="pointer"
                      onClick={() => {
                        router.push(claimTask.claimedTaskLink);
                        message.destroy();
                      }}>
                {claimTask.claimedTaskName}
              </strong>
              <br/>
              Please complete another task to claim a new task.
            </div>
            : responseMessage, 5).then();
        }
      }
    },
    onError({ graphQLErrors, networkError }) {
      if (graphQLErrors && graphQLErrors.length > 0) {
        let msg = graphQLErrors[0].message;
        if (msg === "The person is undefined, please login to perform this action") {
          showUnAuthModal(router, actionName, loginUrl);
        } else {
          message.error(msg).then();
        }
      }
      //@ts-ignore
      if (networkError && networkError.length > 0) {
        //@ts-ignore
        message.error(networkError[0].message).then();
      }
    }
  });

  const claimTaskEvent = () => {
    let userId = user.id;
    if (userId === undefined || userId === null) {
      showUnAuthModal(router, actionName, loginUrl);
      return
    }

    claimTask().then();
  }

  const getCausedBy = (assignedTo: any) => {
    let status = TASK_TYPES[getProp(task, 'status')];

    switch (status) {
      case "Claimed":
        return assignedTo ? status : "Proposed By";
      default:
        return status;
    }
  }

  const fetchData = async () => {
    const data: any = await refetch()

    if (data && !data.errors) {
      setTask(data.data.task);
    }
  }

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

  useEffect(() => {
    if (original) {
      setTask(getProp(original, 'task', {}));
    }
  }, [original]);

  if (loading) return <Loading/>

  const showAssignedUser = () => {
    const assignee = getProp(task, 'assignedTo', null);
    return (
      <Row className="text-sm mb-10">
        {assignee ? (
          <>
            {assignee.id === user.id
              ? (
                <div className="flex-column">
                  <strong className="my-auto">Assigned to you</strong>
                </div>
              )
              : (
                <Row style={{marginTop: 10}} className="text-sm mt-8">
                  <strong className="my-auto">Assigned to: </strong>
                  <Row align="middle" style={{marginLeft: 15}}>
                    <Col>
                      <CustomAvatar2 person={{
                        fullname: getProp(assignee, 'fullName', ''),
                        slug: getProp(assignee, 'slug', '')
                      }}/>
                    </Col>
                    <Col>
                      <Typography.Link className="text-grey-9" href={`/${getProp(assignee, 'slug', '')}`}>
                        {getProp(assignee, 'fullName', '')}
                      </Typography.Link>
                    </Col>
                  </Row>
                </Row>
              )
            }
          </>
        ) : null}
      </Row>
    )
  }

  const assignedTo = getProp(task, 'assignedTo');
  const stacks = getProp(task, 'stack', []);
  const tags = getProp(task, 'tag', []);

  const showTaskEvents = () => {
    const assignee = getProp(task, 'assignedTo', null);
    const taskStatus = TASK_TYPES[getProp(task, 'status')];
    const inReview = getProp(task, 'inReview', false);

    return (
      <Row className="text-sm">
        {assignee && taskStatus !== "Done" ? (
          <>
            {assignee.id === user.id
              ? (
                <div className="flex-column ml-auto">
                  {inReview ? <div className="mb-10">The task is submitted for review</div> : (
                    <Button type="primary"
                            className="mb-10"
                            onClick={() => showReviewTaskModal(true)}>Submit for review</Button>
                  )}
                  <Button
                    type="primary"
                    onClick={() => showLeaveTaskModal(true)}
                    style={{zIndex: 1000}}
                  >Leave the task</Button>
                </div>
              )
              : null
            }
          </>
        ) : null}
        {(taskStatus === "Available") && (
          <>
            <div className="flex-column ml-auto">
              <Button type="primary"
                      onClick={() => claimTaskEvent()}>Claim the task</Button>
            </div>
          </>
        )}
      </Row>
    )
  }

  let status = TASK_TYPES[getProp(task, 'status')];
  const initiativeName = getProp(task, 'initiative.name', undefined);
  const inReview = getProp(task, 'inReview', false);

  if (inReview && status !== "Done") status = "In Review";

  const showInReviewEvents = () => {

    return (
      <Row className="text-sm">
        <div className="flex-column ml-auto mt-10">
          <Button
            type="primary"
            className="mb-10"
            style={{zIndex: 1000}}
            onClick={() => showApproveTaskModal(true)}
          >Approve the work</Button>
          <Button
            type="primary"
            onClick={() => showRejectTaskModal(true)}
            style={{zIndex: 1000}}
          >Reject the work</Button>
        </div>
      </Row>
    )
  }

  return (
    <LeftPanelContainer>
      <Spin tip="Loading..." spinning={loading || leaveTaskLoading || claimTaskLoading || submitTaskLoading}
            delay={200}>
        {
          !error && (
            <>
              {
                getBasePath() !== "" && (
                  <Breadcrumb>
                    <Breadcrumb.Item>
                      <a href={getBasePath()}>{getProp(product, 'name', '')}</a>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <a href={`${getBasePath()}/tasks`}>Tasks</a>
                    </Breadcrumb.Item>
                    {initiativeName && (
                      <Breadcrumb.Item>
                        <a
                          href={`/${getProp(product, 'owner', '')}/${getProp(product, 'slug', '')}/initiatives/${getProp(task, 'initiative.id', '')}`}
                        >
                          {initiativeName}
                        </a>
                      </Breadcrumb.Item>
                    )}
                    <Breadcrumb.Item>{getProp(original, 'task.title', '')}</Breadcrumb.Item>
                  </Breadcrumb>
                )
              }

              <Row
                justify="space-between"
                className="right-panel-headline strong-height"
              >
                <Col md={16}>
                  <div className="section-title">
                    {getProp(task, 'title', '')}
                  </div>
                </Col>
                <Col md={8} className="text-right">
                  {userHasManagerRoots ? (
                    <>
                      <Col>
                        <Button
                          onClick={() => showDeleteModal(true)}
                        >
                          Delete
                        </Button>
                        <EditIcon
                          className="ml-10"
                          onClick={() => setShowEditModal(true)}
                        />
                      </Col>
                      {status === "In Review" && showInReviewEvents()}
                    </>
                  ) : showTaskEvents()}
                </Col>


              </Row>
              <Row>
                {getProp(task, 'videoUrl', null) && (
                  <Col>
                    <ReactPlayer
                      width="100%"
                      height="170px"
                      className="mr-10"
                      url={getProp(task, 'videoUrl')}
                    />
                  </Col>
                )}
                <Col>
                  <Row className="html-description">
                    <Col style={{overflowX: 'auto', width: 'calc(100vw - 95px)', marginTop: status === "In Review" ? 100 : 50}}>
                      {
                        parse(getProp(task, 'description', ''))
                      }
                    </Col>
                  </Row>
                  <div className="mt-22">
                    {showAssignedUser()}
                    <Row style={{marginTop: 10}} className="text-sm mt-8">
                      <strong className="my-auto">Created By: </strong>

                      <Row align="middle" style={{marginLeft: 15}}>
                        <Col>
                          <CustomAvatar2 person={{
                            fullname: getProp(task, 'createdBy.fullName', ''),
                            slug: getProp(task, 'createdBy.slug', '')
                          }}/>
                        </Col>
                        <Col>
                          <Typography.Link className="text-grey-9"
                                           href={`/${getProp(task, 'createdBy.slug', '')}`}>
                            {getProp(task, 'createdBy.fullName', '')}
                          </Typography.Link>
                        </Col>
                      </Row>
                    </Row>

                    <Row className="text-sm mt-8">
                      {
                        ["Available", "Draft", "Pending", "Blocked", "In Review"].includes(status) ? (
                          <strong className="my-auto">
                            Status: {status}
                          </strong>
                        ) : (
                          <>
                            <strong className="my-auto">
                              Status: {getCausedBy(assignedTo)}
                            </strong>
                            <div className='ml-5'>
                              {
                                getProp(task, 'createdBy', null) !== null && !assignedTo
                                  ? (
                                    <Row>
                                      <Col>
                                        <CustomAvatar2 person={{
                                          fullname: getProp(task, 'createdBy.fullName', ''),
                                          slug: getProp(task, 'createdBy.slug', '')
                                        }}/>
                                      </Col>
                                      <div className="my-auto">
                                        {
                                          getProp(
                                            getProp(task, 'createdBy'),
                                            'fullName',
                                            ''
                                          )
                                        }
                                      </div>
                                    </Row>
                                  ) : null
                              }
                            </div>
                          </>
                        )
                      }
                    </Row>
                    {
                      getProp(task, 'priority', null) &&
                      <Row style={{marginTop: 10}} className="text-sm mt-8">
                        <strong className="my-auto">Priority:&nbsp;</strong>&nbsp;
                        <Priorities task={task}
                                    submit={() => refetch()}
                                    canEdit={userHasManagerRoots} />
                      </Row>
                    }
                    {
                      getProp(task, 'reviewer.slug', null) &&
                      <Row style={{marginTop: 10}} className="text-sm mt-8">
                        <strong className="my-auto">Reviewer:</strong>

                        <Row align="middle" style={{marginLeft: 15}}>
                          <Col>
                            <CustomAvatar2 person={{
                              fullname: getProp(task, 'reviewer.fullName', ''),
                              slug: getProp(task, 'reviewer.slug', '')
                            }}/>
                          </Col>
                          <Col>
                            <Typography.Link
                              className="text-grey-9"
                              href={`/${getProp(task, 'reviewer.slug', '')}`}
                            >
                              {getProp(task, 'reviewer.fullName', '')}
                            </Typography.Link>
                          </Col>
                        </Row>
                      </Row>
                    }
                    {stacks.length > 0 && (
                      <Row style={{marginTop: 10}} className="text-sm mt-8 tag-bottom-0">
                        <strong className="my-auto">Skills required:&nbsp;</strong>
                        {stacks.map((tag: any, taskIndex: number) =>
                          <CheckableTag key={`tag-${taskIndex}`} checked={true}>{tag.name}</CheckableTag>
                        )}
                      </Row>
                    )}

                    {tags.length > 0 && (
                      <Row style={{marginTop: 10}} className="text-sm mt-8 tag-bottom-0">
                        <strong className="my-auto">Tags:&nbsp;</strong>
                        {tags.map((tag: any, taskIndex: number) =>
                          <Tag key={`stack-${taskIndex}`}>{tag.name}</Tag>
                        )}
                      </Row>
                    )}

                    {
                      getProp(task, 'capability.id', null) && (
                        <Row
                          className="text-sm mt-8"
                        >
                          <strong className="my-auto">
                            Related Capability:
                          </strong>
                          <Typography.Link className="ml-5"
                                           href={`${getBasePath()}/capabilities/${getProp(task, 'capability.id')}`}>
                            {getProp(task, 'capability.name', '')}
                          </Typography.Link>
                        </Row>
                      )
                    }
                    {
                      getProp(task, 'initiative.id', null) && (
                        <Row
                          className="text-sm mt-8"
                        >
                          <strong className="my-auto">Initiative:</strong>
                          <Typography.Link
                            className="ml-5"
                            href={`${getBasePath()}/initiatives/${getProp(task, 'initiative.id')}`}
                          >
                            {getProp(task, 'initiative.name', '')}
                          </Typography.Link>
                        </Row>
                      )
                    }
                  </div>
                </Col>
              </Row>

              {
                getProp(task, 'dependOn', []).length > 0 &&
                <Collapse style={{marginTop: 30}}>
                  <Panel header="Blocked by" key="1">
                    <List
                      bordered
                      dataSource={getProp(task, 'dependOn', [])}
                      renderItem={(item: any) => (
                        <List.Item>
                          <Link
                            href={`/${personSlug}/${item.product.slug}/tasks/${item.publishedId}`}>{item.title}</Link>
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              }
              {
                getProp(task, 'relatives', []).length > 0 &&
                <Collapse style={{marginTop: 30}}>
                  <Panel header="Dependant tasks" key="1">
                    <List
                      bordered
                      dataSource={getProp(task, 'relatives', [])}
                      renderItem={(item: any) => (
                        <List.Item>
                          <Link
                            href={`/${personSlug}/${item.product.slug}/tasks/${item.publishedId}`}>{item.title}</Link>
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              }

              <div style={{marginTop: 30}} />
              <Comments objectId={getProp(task, 'id', 0)} objectType="task" />

              <Attachments data={getProp(original, 'task.attachment', [])}/>

              {deleteModal && (
                <DeleteModal
                  modal={deleteModal}
                  closeModal={() => showDeleteModal(false)}
                  submit={deleteTask}
                  title='Delete task'
                />
              )}
              {leaveTaskModal && (
                <CustomModal
                  modal={leaveTaskModal}
                  closeModal={() => showLeaveTaskModal(false)}
                  submit={() => {
                    showLeaveTaskModal(false);
                    leaveTask().then()
                  }}
                  title="Leave the task"
                  message="Do you really want to leave the task?"
                  submitText="Yes, leave"
                />
              )}
              {
                reviewTaskModal && (
                  <CustomModal
                    modal={reviewTaskModal}
                    closeModal={() => showReviewTaskModal(false)}
                    submit={submitTask}
                    title="Submit for review"
                    message="Do you really want to submit the task for review?"
                    submitText="Yes, submit"
                  />
                )}
              {
                showEditModal &&
                <AddTaskContainer
                  modal={showEditModal}
                  productSlug={String(productSlug)}
                  modalType={true}
                  closeModal={setShowEditModal}
                  task={task}
                  submit={fetchData}
                  tasks={tasks}
                />
              }
              {
                rejectTaskModal && (
                  <CustomModal
                    modal={rejectTaskModal}
                    closeModal={() => showRejectTaskModal(false)}
                    submit={rejectTask}
                    title="Reject the work"
                    message="Do you really want to reject the work?"
                    submitText="Yes, reject"
                  />
                )
              }
              {
                approveTaskModal && (
                  <CustomModal
                    modal={approveTaskModal}
                    closeModal={() => showApproveTaskModal(false)}
                    submit={approveTask}
                    title="Approve the work"
                    message="Do you really want to approve the work?"
                    submitText="Yes, approve"
                  />
                )
              }
            </>
          )
        }

        <Modal
          title="Contribution License Agreement"
          okText="I Agree"
          visible={agreementModalVisible}
          onOk={handleIAgree}
          onCancel={() => setAgreementModalVisible(false)}
          width={1000}
          maskClosable={false}
        >
          <p className="html-description">{parse(license)}</p>
        </Modal>
      </Spin>
    </LeftPanelContainer>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user,
  currentProduct: state.work.currentProduct || {},
  loginUrl: state.work.loginUrl
});

const mapDispatchToProps = (dispatch: any) => ({
  userLogInAction: (data: UserState) => dispatch(userLogInAction(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
