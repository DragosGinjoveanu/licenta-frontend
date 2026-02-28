import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

interface SuccessResultProps {
  title: string;
  subTitle: string;
  buttonText?: string;
  onButtonClick?: () => void;
  targetRoute?: string;
}

export default function SuccessResult({
  title,
  subTitle,
  buttonText = "Go to login",
  onButtonClick,
  targetRoute = "/login",
}: SuccessResultProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(targetRoute);
    }
  };

  return (
    <Result
      status="success"
      title={title}
      subTitle={subTitle}
      extra={[
        <Button
          type="primary"
          key="action"
          size="large"
          style={{ backgroundColor: "blue", border: "none" }}
          onClick={handleAction}
        >
          {buttonText}
        </Button>,
      ]}
    />
  );
}
