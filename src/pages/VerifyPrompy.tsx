import { Card, Typography, Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useResendVerificationMutation } from "../store/api/authApiSlice";

const { Title, Text } = Typography;

export default function VerifyPrompt() {
  const [resend, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    try {
      await resend().unwrap();
      message.success("A new verification link has been sent to your email!");
    } catch (error) {
      message.error("Too many tries. Please try again in a minute.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 450,
          textAlign: "center",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        <MailOutlined
          style={{ fontSize: "48px", color: "blue", marginBottom: "20px" }}
        />
        <Title level={3}>Confirm email address</Title>
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: "24px" }}
        >
          To access the application, you need to confirm your account. I have
          already sent a link to your email address.
        </Text>

        <Button
          type="primary"
          size="large"
          onClick={handleResend}
          loading={isLoading}
          style={{ width: "100%", backgroundColor: "blue" }}
        >
          Resend verification link
        </Button>
      </Card>
    </div>
  );
}
