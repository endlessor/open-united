import gql from 'graphql-tag';


export const CREATE_PERSON = gql`
  mutation CreatePerson($firstName: String!, $lastName: String!, $emailAddress: String!, $password: String!, $password2: String!) {
    createPerson(personInput: {firstName: $firstName, lastName: $lastName, emailAddress: $emailAddress, password: $password, password2: $password2}) {
      status
      message
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($productInput: ProductInput!, $file: Upload) {
    createProduct(productInput: $productInput, file: $file) {
      status
      message
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productInput: ProductInput!, $file: Upload) {
    updateProduct(productInput: $productInput, file: $file) {
      newSlug
      status
      message
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation CreateProduct($slug: String!) {
    deleteProduct(slug: $slug) {
      status
      message
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      task {
        title
      }
      status
      message
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: TaskInput!, $id: Int!) {
    updateTask(input: $input, id: $id) {
      task {
        title
      }
      status
      message
    }
  }
`;

// export const CREATE_CODE_REPOSITORY = gql`
//   mutation CreateCodeRepository($input: CodeRepositoryInput!) {
//     createCodeRepository(input: $input) {
//       repository {
//         id
//         repository
//       }
//     }
//   }
// `;

export const CREATE_CAPABILITY = gql`
  mutation CreateCapability(
    $nodeId: Int, $productSlug: String, $name: String!, $description: String!,
    $stacks: [Int], $videoLink: String, $attachments: [Int]
  ) {
    createCapability(input: {
      nodeId: $nodeId, productSlug: $productSlug, name: $name, description: $description,
      stacks: $stacks, videoLink: $videoLink attachments: $attachments
    }) {
      status
      capability {
        id
        name
      }
    }
  }
`;

export const UPDATE_CAPABILITY = gql`
  mutation UpdateCapability(
    $nodeId: Int, $productSlug: String, $name: String!, $description: String!,
    $stacks: [Int], $videoLink: String, $attachments: [Int]
  ) {
    updateCapability(input: {
      nodeId: $nodeId, productSlug: $productSlug, name: $name, description: $description,
      stacks: $stacks, videoLink: $videoLink attachments: $attachments
    }) {
      status
      capability {
        id
        name
      }
    }
  }
`;

export const DELETE_CAPABILITY = gql`
  mutation DeleteCapability($nodeId: Int!) {
    deleteCapability(nodeId: $nodeId) {
      status
      capabilityId
    }
  }
`;

export const CREATE_INITIATIVE = gql`
  mutation CreateInitiative($input: InitiativeInput!) {
    createInitiative(input: $input) {
      initiative {
        id
      }
    }
  }
`;

export const UPDATE_INITIATIVE = gql`
  mutation UpdateInitiative($input: InitiativeInput!, $id: Int!) {
    updateInitiative(input: $input, id: $id) {
      initiative {
        id
      }
    }
  }
`;

export const DELETE_INITIATIVE = gql`
  mutation DeleteInitiative($id: Int!) {
    deleteInitiative(id: $id) {
      initiativeId
      status
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id) {
      taskId
      status
    }
  }
`;

export const CREATE_ATTACHMENT = gql`
  mutation CreateAttachment($input: AttachmentInput!) {
    createAttachment(input: $input) {
      attachment {
        id
        name
        path
        fileType
      }
    }
  }
`;

export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($id: Int!, $capabilityId: Int!) {
    deleteAttachment(id: $id, capabilityId: $capabilityId) {
      attachmentId
      status
    }
  }
`;

export const CHANGE_TASK_PRIORITY = gql`
  mutation ChangeTaskPriority($taskId: Int!, $priority: String!) {
    changeTaskPriority(taskId: $taskId, priority: $priority) {
      status
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: uuid!) {
    delete_event(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const DELETE_METRICS = gql`
  mutation DeleteMetrics($id: uuid!) {
    delete_metrics(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const ACTIVE_COUNTRY = gql`
  mutation UpdateCountry($id: uuid!, $active: Boolean!) {
    update_country(where: { id: { _eq: $id } }, _set: { active: $active }) {
      affected_rows
    }
  }
`;

export const ACTIVE_MARKET = gql`
  mutation UpdateMarket($id: uuid!, $active: Boolean!) {
    update_market(where: { id: { _eq: $id } }, _set: { active: $active }) {
      affected_rows
    }
  }
`;

export const LEAVE_TASK = gql`
  mutation LeaveTask($taskId: Int!) {
    leaveTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const CLAIM_TASK = gql`
  mutation ClaimTask($taskId: Int!) {
    claimTask(taskId: $taskId) {
      success
      message
      isNeedAgreement
      claimedTaskLink
      claimedTaskName
    }
  }
`;

export const IN_REVIEW_TASK = gql`
  mutation InReviewTask($taskId: Int!) {
    inReviewTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const REJECT_TASK = gql`
  mutation rejectTask($taskId: Int!) {
    rejectTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const APPROVE_TASK = gql`
  mutation approveTask($taskId: Int!) {
    approveTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment($text: String!, $objectId: Int, $parentId: Int) {
    createTaskComment(commentInput: {text: $text, commentedObjectId: $objectId, parentId: $parentId}) {
      success
      message
    }
  }
`;

export const CREATE_BUG_COMMENT = gql`
  mutation CreateBugComment($text: String!, $objectId: Int, $parentId: Int) {
    createBugComment(commentInput: {text: $text, commentedObjectId: $objectId, parentId: $parentId}) {
      success
      message
    }
  }
`;

export const CREATE_IDEA_COMMENT = gql`
  mutation CreateIdeaComment($text: String!, $objectId: Int, $parentId: Int) {
    createIdeaComment(commentInput: {text: $text, commentedObjectId: $objectId, parentId: $parentId}) {
      success
      message
    }
  }
`;

export const CREATE_CAPABILITY_COMMENT = gql`
  mutation CreateCapabilityComment($text: String!, $objectId: Int, $parentId: Int) {
    createCapabilityComment(commentInput: {text: $text, commentedObjectId: $objectId, parentId: $parentId}) {
      success
      message
    }
  }
`;

export const UPDATE_CAPABILITY_TREE = gql`
  mutation UpdateCapabilityTree ($productSlug: String!, $tree: JSONString!) {
    updateCapabilityTree(productSlug: $productSlug, tree: $tree) {
      status
    }
  }
`;


export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
      url
    }
  }
`;

export const FAKE_LOGIN = gql`
  mutation FakeLogin ($personId: Int!) {
    fakeLogin (personId: $personId) {
      success
      message
      person {
        id
        fullName
      }
    }
  }
`;

export const UPDATE_LICENSE = gql`
  mutation UpdateLicense($productSlug: String!, $content: String!) {
    updateLicense(licenseInput: {productSlug: $productSlug, content: $content}) {
      status
      message
    }
  }
`;

export const ACCEPT_AGREEMENT = gql`
  mutation AgreeLicense($productSlug: String!) {
    agreeLicense(licenseInput: {productSlug: $productSlug}) {
      status
      message
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!, $place: String!) {
    uploadImage(file: $file, place: $place) {
      url
      status
      message
    }
  }
`;

export const DELETE_IDEA = gql`
  mutation DeleteIdea($id: ID!) {
    deleteIdea(id: $id) {
      isExists
    }
  }
`;

export const DELETE_BUG = gql`
  mutation DeleteBug($id: ID!) {
    deleteBug(id: $id) {
      isExists
    }
  }
`;

export const CREATE_BUG = gql`
  mutation CreateBug($input: BugInput!) {
    createBug(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_BUG = gql`
  mutation UpdateBug($input: BugInput!, $id: Int!) {
    updateBug(input: $input, id: $id) {
      success
      message
    }
  }
`;

export const CREATE_IDEA = gql`
  mutation CreateIdea($input: IdeaInput!) {
    createIdea(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_IDEA = gql`
  mutation UpdateIdea($input: IdeaInput!, $id: Int!) {
    updateIdea(input: $input, id: $id) {
      success
      message
    }
  }
`;

export const VOTE_BUG = gql`
  mutation VoteBug($input: VoteInput!) {
    voteBug(input: $input) {
      success
      message
    }
  }
`;

export const VOTE_IDEA = gql`
  mutation VoteIdea($input: VoteInput!) {
    voteIdea(input: $input) {
      success
      message
    }
  }
`;