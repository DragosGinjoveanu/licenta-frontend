import { Button, Form, Input, Card, message } from "antd";
import { useLoginMutation } from "../store/authApiSlice";
import { Link } from "react-router-dom";

export default function Login() {
  const [loginMutation, { isLoading }] = useLoginMutation();

  const onFinish = async (values: any) => {
    try {
      await loginMutation({
        email: values.email,
        password: values.password,
      }).unwrap();
      message.success("Login successful!");
    } catch (error: any) {
      message.error("Login error! Check the email and password.");
      console.error("Detailed error:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        title="Auth SaaS HoReCa"
        style={{ width: 400, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "The email needs to be valid!" },
            ]}
          >
            <Input placeholder="admin@test.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter the password!" }]}
          >
            <Input.Password placeholder="Your password" />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 20,
            }}
          >
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              Login
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span> Don't have an account? </span>
            <Link to="/register">Sign up</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
