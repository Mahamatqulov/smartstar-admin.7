"use client";

import { useState } from "react";
import { Layout, Menu, theme, Typography } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
  SettingOutlined,
  BankOutlined,
  TagOutlined,
} from "@ant-design/icons";
import AdminHeader from "./admin-header";
import DashboardContent from "./dashboard-content";
import ProjectsContent from "./projects-content";
import UsersContent from "./users-content";
import SettingsContent from "./settings-content";
import CategoriesContent from "./categories-content";
import FundingContent from "./funding-content";

const { Content, Sider } = Layout;
const { Title } = Typography;

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return <DashboardContent />;
      case "projects":
        return <ProjectsContent />;
      case "users":
        return <UsersContent />;
      case "funding":
        return <FundingContent />;
      case "categories":
        return <CategoriesContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {collapsed ? "S" : "SmartStar"}
          </Title>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["dashboard"]}
          mode="inline"
          onClick={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "projects",
              icon: <ProjectOutlined />,
              label: "Projects",
            },
            {
              key: "users",
              icon: <UserOutlined />,
              label: "Users",
            },
            {
              key: "funding",
              icon: <BankOutlined />,
              label: "Funding",
            },
            {
              key: "categories",
              icon: <TagOutlined />,
              label: "Categories",
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <AdminHeader title="Dashboard" />
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: "calc(100vh - 112px)",
            }}
          >
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
