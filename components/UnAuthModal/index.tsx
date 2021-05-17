import {Modal} from 'antd';
import {productionMode} from "../../utilities/constants";

const showUnAuthModal = (router, actionName: string, loginUrl="/") => {

  console.log("loginurl", loginUrl)

  const signInAction = () => {
    modal.destroy();
    if (productionMode) {
      window.location.replace(loginUrl);
    } else {
      router.push("/switch-test-user")
    }
  }

  const registerAction = () => {
    modal.destroy();
    window.location.replace(loginUrl);
  }

  const modal = Modal.info({
    title: "Sign In or Register",
    closable: true,
    content: (
      <div>
        <p>In order to {actionName} you need to be signed in.</p>

        <p>Existing Users: <a href={null} onClick={() => signInAction()}>Sign in here</a></p>

        <p>New to OpenUnited? <a href={null} onClick={() => registerAction()}>Register here</a></p>
      </div>
    ),
    okButtonProps: { disabled: true, style: {display: "none"} },
  })
};

export default showUnAuthModal;