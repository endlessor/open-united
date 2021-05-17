import React, {useEffect, useState} from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { GET_AM_LOGIN_URL } from '../../graphql/queries';
import { Button } from "antd";
import Loading from "../Loading";

type Props = {
  buttonTitle?: string,
  fullWidth?: boolean
};

const LoginViaAM: React.FunctionComponent<Props> = ({ buttonTitle = "Sign In",
                                                      fullWidth =  false }) => {
  const [loadAMLogin, {data: authMachineData}] = useLazyQuery(GET_AM_LOGIN_URL, null, {enabled: false, manual: true});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authMachineData && authMachineData?.getAuthmachineLoginUrl) {
      window.location.replace(authMachineData.getAuthmachineLoginUrl);
    }
  }, [authMachineData])

  const loginViaAM = () => {
    loadAMLogin();
    setLoading(true);
  }

  if (loading) return <Loading />

  return (
    <Button className="ml-auto"
            style={{width: fullWidth ? "100%" : "auto"}}
            onClick={() => loginViaAM()}>{buttonTitle}</Button>
  );
};
export default LoginViaAM;
