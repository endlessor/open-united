import React, {useEffect, useState} from "react";
import {Button, Comment, Form, Mentions, message, Modal} from "antd";
import {GET_BUG_COMMENTS, GET_IDEA_COMMENTS, GET_TASK_COMMENTS, GET_CAPABILITY_COMMENTS,
  GET_USERS} from "../../graphql/queries";
import {getProp} from "../../utilities/filters";
import CustomAvatar2 from "../CustomAvatar2";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {CREATE_TASK_COMMENT, CREATE_BUG_COMMENT, CREATE_IDEA_COMMENT,
  CREATE_CAPABILITY_COMMENT} from "../../graphql/mutations";
import Link from "next/link";


const {Option} = Mentions;


interface IUser {
  slug: string
}

interface ICommentContainerProps {
  comments: IComment[]
  submit: Function
  allUsers: IUser[]
}

interface ICommentsProps {
  taskId: number
}

interface IAddCommentProps {
  taskId: number
  submit: Function
  allUsers: IUser[]
}

interface IComment {
  id: number
  data: {
    person: {
      fullname: string
      slug: string
    }
    text: string
  }
  children: IComment[]
}

interface ICommentsText {
  text: string
}

const commentCreateType = {
  task: {
    mutation: CREATE_TASK_COMMENT, mutationKey: "createTaskComment"
  },
  idea: {
    mutation: CREATE_IDEA_COMMENT, mutationKey: "createIdeaComment"
  },
  bug: {
    mutation: CREATE_BUG_COMMENT, mutationKey: "createBugComment"
  },
  capability: {
    mutation: CREATE_CAPABILITY_COMMENT, mutationKey: "createCapabilityComment"
  },
};

const commentGetType = {
  task: GET_TASK_COMMENTS,
  idea: GET_IDEA_COMMENTS,
  bug: GET_BUG_COMMENTS,
  capability: GET_CAPABILITY_COMMENTS,
};



const CommentContainer: React.FunctionComponent<ICommentContainerProps> = ({comments, submit, allUsers, objectType}) => {
  const cType = commentCreateType[objectType];
  const [createComment] = cType ? useMutation(cType.mutation, {
    onCompleted(res) {
      if (getProp(res, `${cType.mutationKey}.success`, false)) {
        submit();
        setIsModalVisible(false);
        setCommentText("");
        message.success("Comment was sent").then();
      } else {
        message.error("Failed to send comment").then();
      }
    },
    onError() {
      message.error("Failed to send comment").then();
    }
  }
  ) : "";

  const addComment = () => {
    createComment({
      variables: {
        text: commentText, parentId: currentCommentId
      }
    }).then();
  }

  const closeModal = () => {
    setIsModalVisible(false);
    setCommentText("");
  }

  const [commentText, setCommentText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentCommentId, setCurrentCommentId] = useState<number>(0);

  const openSendSubCommentModal = (commentId: number) => {
    setIsModalVisible(true);
    setCurrentCommentId(commentId);
  }

  const CommentsText: React.FunctionComponent<ICommentsText> = ({text}) => {
    return (
      <>
        {
          text.split(' ').map((textItem, index) => {
            if (textItem[0] === '@') {
              return <Link key={index} href={`/${textItem.substring(1)}`}>{textItem + ' '}</Link>;
            } else {
              return <span key={index}>{textItem + ' '}</span>;
            }
          })
        }
      </>
    )
  }


  return (
    <>
      {
        comments.map((comment: IComment, index) => (
          <Comment
            key={index}
            actions={[<span key="comment-nested-reply-to"
                            onClick={() => openSendSubCommentModal(comment.id)}>Reply to</span>]}
            author={<Link href={`/${comment.data.person.slug}`}>{comment.data.person.fullname}</Link>}
            avatar={<CustomAvatar2 person={comment.data.person}/>}
            content={<CommentsText text={comment.data.text}/>}
          >
            <CommentContainer comments={getProp(comment, "children", [])}
                              objectType={objectType}
                              submit={submit}
                              allUsers={allUsers}/>
          </Comment>
        ))
      }

      <Modal
        title="Reply to comment" visible={isModalVisible} onOk={addComment} onCancel={closeModal}
        maskClosable={false}>
        <Mentions rows={2} onChange={val => setCommentText(val)} value={commentText}>
          {
            allUsers.map((user) => (
              <Option key={user.slug} value={user.slug}>{user.slug}</Option>
            ))
          }
        </Mentions>
      </Modal>
    </>
  )
};

const AddComment: React.FunctionComponent<IAddCommentProps> = ({objectId, objectType, submit, allUsers}) => {
  const {mutation, mutationKey} = commentCreateType[objectType];
  const [createComment] = useMutation(mutation, {
    onCompleted(res) {
      if (getProp(res, `${mutationKey}.success`, false)) {
        submit();
        setCommentText("");
        message.success("Comment was sent").then();
      } else {
        message.error("Failed to send comment").then();
      }
    },
    onError() {
      message.error("Failed to send comment").then();
    }
  }
  );
  const [commentText, setCommentText] = useState("");

  const addComment = () => {
    if (commentText === "") {
      return
    }
    createComment({
      variables: {
        text: commentText, objectId
      }
    }).then();
  }

  return (
    <>
      <Form.Item>
        <Mentions rows={2} onChange={val => setCommentText(val)} value={commentText}>
          {
            allUsers.map((user) => (
              <Option key={user.slug} value={user.slug}>{user.slug}</Option>
            ))
          }
        </Mentions>
      </Form.Item>
      <Form.Item>
        <Button onClick={addComment} type="primary">
          Add Comment
        </Button>
      </Form.Item>
    </>
  )
}

const Comments: React.FunctionComponent<ICommentsProps> = ({objectId, objectType}) => {
  const {data, error, loading, refetch} = useQuery(commentGetType[objectType], {
    variables: {objectId}
  });
  const {data: users} = useQuery(GET_USERS);

  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!error && !loading) {
      let fetchComments = getProp(data, `${objectType}Comments`, "[]");
      fetchComments = JSON.parse(fetchComments);
      setComments(fetchComments)
    }

  }, [data]);

  const allUsers = getProp(users, "people", []);

  return (
    <>
      <CommentContainer comments={comments}
                        submit={refetch}
                        objectType={objectType}
                        allUsers={allUsers}/>
      <AddComment objectId={objectId}
                  submit={refetch}
                  objectType={objectType}
                  allUsers={allUsers} />
    </>
  )
};

export default Comments;