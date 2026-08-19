import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ReactFlow, Background, Controls, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertOutlined,
  AreaChartOutlined,
  ClusterOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MonitorOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Descriptions,
  Layout,
  List,
  Menu,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import './App.css';
import {
  auditEvents,
  clusterNodes,
  currentUser,
  instances,
  logs,
  metrics,
  overviewStats,
  permissions,
  pipelineEdges,
  pipelineNodes,
  roles,
  tasks,
} from './mock/data';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  running: 'blue',
  success: 'green',
  failed: 'red',
  queued: 'gold',
  healthy: 'green',
  warning: 'orange',
  busy: 'purple',
};

const taskStatusMap: Record<string, string> = {
  running: '运行中',
  success: '成功',
  failed: '失败',
  queued: '排队中',
};

const currentRole = roles.find((role) => role.id === currentUser.roleId) ?? roles[0];
const availablePermissions = permissions.filter((permission) => currentRole.permissions.includes(permission.id));

type StatCardProps = {
  label: string;
  value: string | number;
  change: string;
};

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <Card className="stat-card">
      <Text type="secondary">{label}</Text>
      <Title level={3}>{value}</Title>
      <Text type="success">{change}</Text>
    </Card>
  );
}

function DashboardPage() {
  const nodeLoad = clusterNodes.map((node) => ({
    name: node.name,
    value: Math.round((node.gpuUsed / node.gpuTotal) * 100),
  }));

  const taskByNode = clusterNodes.map((node) => ({
    name: node.name,
    任务数: node.taskIds.length,
  }));

  const taskColumns = [
    { title: '任务名', dataIndex: 'name', key: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{taskStatusMap[status]}</Tag>,
    },
    { title: '节点', dataIndex: 'nodeId', key: 'nodeId', render: (nodeId: string) => nodeId.toUpperCase() },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" strokeColor="#5b7cff" />,
    },
  ];

  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Row gutter={[16, 16]}>
        {overviewStats.map((stat) => (
          <Col span={6} key={stat.label}>
            <StatCard label={stat.label} value={stat.value} change={stat.change} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="资源趋势" className="panel-card">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="gpuFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#5b7cff" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#5b7cff" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f7" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="gpu" stroke="#5b7cff" fill="url(#gpuFill)" />
                <Area type="monotone" dataKey="cpu" stroke="#52c41a" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="节点负载" className="panel-card">
            <Space orientation="vertical" style={{ width: '100%' }} size="middle">
              {nodeLoad.map((item) => (
                <div key={item.name}>
                  <div className="mini-row">
                    <Text>{item.name}</Text>
                    <Text strong>{item.value}%</Text>
                  </div>
                  <Progress percent={item.value} size="small" strokeColor={item.value > 80 ? '#ff4d4f' : '#5b7cff'} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="任务分布" className="panel-card">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={taskByNode}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f7" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="任务数" fill="#5b7cff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="任务列表" className="panel-card">
            <Table dataSource={tasks} columns={taskColumns} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function SecurityPage() {
  const permissionColumns = [
    { title: '权限项', dataIndex: 'label', key: 'label' },
    { title: '说明', dataIndex: 'description', key: 'description' },
  ];

  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Card title="用户安全信息" className="panel-card">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="账号">{currentUser.name}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
          <Descriptions.Item label="角色">{currentRole.name}</Descriptions.Item>
          <Descriptions.Item label="团队">{currentUser.team}</Descriptions.Item>
          <Descriptions.Item label="最近登录">{currentUser.lastLogin}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color="green">在线</Tag></Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="权限矩阵" className="panel-card">
            <Table dataSource={availablePermissions} columns={permissionColumns} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="审计日志" className="panel-card">
            <Timeline>
              {auditEvents.map((event) => (
                <Timeline.Item key={event.id} color={event.level === 'ERROR' ? 'red' : event.level === 'WARN' ? 'gold' : 'blue'}>
                  <Text strong>{event.title}</Text>
                  <div>{event.actor} · {event.time}</div>
                  <div>{event.detail}</div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function PipelinePage() {
  const flowNodes: FlowNode[] = pipelineNodes.map((node) => ({
    id: node.id,
    type: 'default',
    position: node.position,
    data: { label: node.label },
    style: {
      border: '1px solid #5b7cff',
      borderRadius: '12px',
      background:
        node.status === 'running'
          ? '#edf4ff'
          : node.status === 'success'
            ? '#edfdf2'
            : node.status === 'warning'
              ? '#fff7db'
              : '#f7f9fc',
      padding: '12px 16px',
      width: 120,
      color: '#1f2937',
      fontWeight: 600,
    },
  }));

  const flowEdges: FlowEdge[] = pipelineEdges.map((edge) => ({
    ...edge,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#5b7cff' },
    style: { stroke: '#5b7cff', strokeWidth: 2 },
    animated: true,
  }));

  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Card title="DAG 流水线编辑器" className="panel-card">
        <div className="dag-panel">
          <ReactFlow nodes={flowNodes} edges={flowEdges} fitView minZoom={0.5} maxZoom={1.5} className="dag-canvas">
            <Background gap={18} color="#dfe7ff" />
            <Controls />
          </ReactFlow>
        </div>
      </Card>
    </Space>
  );
}

function ResourcePage() {
  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Row gutter={[16, 16]}>
        {clusterNodes.map((node) => (
          <Col span={8} key={node.id}>
            <Card className="panel-card resource-card">
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <div className="resource-header">
                  <Title level={4} style={{ margin: 0 }}>{node.name}</Title>
                  <Tag color={statusColors[node.status]}>{node.status === 'healthy' ? '健康' : node.status === 'warning' ? '预警' : '繁忙'}</Tag>
                </div>
                <Text type="secondary">{node.location}</Text>
                <Row gutter={[8, 8]}>
                  <Col span={12}><Statistic title="CPU" value={node.cpu} suffix="核" /></Col>
                  <Col span={12}><Statistic title="内存" value={node.memory} suffix="GB" /></Col>
                </Row>
                <Text strong>{node.gpuType}</Text>
                <Progress percent={Math.round((node.gpuUsed / node.gpuTotal) * 100)} status={node.status === 'warning' ? 'active' : 'normal'} />
                <Text>GPU 使用 {node.gpuUsed}/{node.gpuTotal} 卡</Text>
                <List
                  dataSource={tasks.filter((item) => item.nodeId === node.id)}
                  renderItem={(task) => (
                    <List.Item>
                      <Space>
                        <Badge status={task.status === 'running' ? 'processing' : task.status === 'failed' ? 'error' : 'default'} />
                        <span>{task.name}</span>
                      </Space>
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

function LifecyclePage() {
  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Card title="实例生命周期" className="panel-card">
        <div className="gantt-wrap">
          {instances.map((item, index) => (
            <div className="gantt-row" key={item.id}>
              <Text className="gantt-label">{item.id}</Text>
              <div className="gantt-track">
                <div
                  className="gantt-bar"
                  style={{
                    width: `${32 + index * 12}%`,
                    background:
                      item.state === '已销毁'
                        ? '#d9d9d9'
                        : item.state === '运行中'
                          ? '#5b7cff'
                          : item.state === '启动中'
                            ? '#52c41a'
                            : '#faad14',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="实例列表" className="panel-card">
        <Table
          dataSource={instances}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '实例 ID', dataIndex: 'id', key: 'id' },
            {
              title: '状态',
              dataIndex: 'state',
              key: 'state',
              render: (state: string) => <Tag color={state === '已销毁' ? 'default' : state === '运行中' ? 'blue' : 'orange'}>{state}</Tag>,
            },
            { title: '节点', dataIndex: 'nodeId', key: 'nodeId' },
            { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
            { title: '到期释放', dataIndex: 'expiresAt', key: 'expiresAt' },
          ]}
        />
      </Card>
    </Space>
  );
}

function LogsPage() {
  const levels = ['ALL', 'INFO', 'WARN', 'ERROR'];

  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Card title="分布式日志中心" className="panel-card">
        <Space style={{ marginBottom: 16 }}>
          <Select defaultValue="ALL" options={levels.map((level) => ({ value: level, label: level }))} />
          <Select
            defaultValue="all"
            options={[{ value: 'all', label: '全部节点' }, ...clusterNodes.map((node) => ({ value: node.id, label: node.name }))]}
            style={{ width: 180 }}
          />
        </Space>

        <div className="terminal-box">
          {logs.map((log) => (
            <div key={log.id} className={`log-line log-${log.level.toLowerCase()}`}>
              <span>{log.timestamp}</span>
              <span>{log.level}</span>
              <span>{log.nodeId}</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="日志查询结果" className="panel-card">
        <Table
          dataSource={logs}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '时间', dataIndex: 'timestamp', key: 'timestamp' },
            {
              title: '级别',
              dataIndex: 'level',
              key: 'level',
              render: (level: string) => <Tag color={level === 'ERROR' ? 'red' : level === 'WARN' ? 'gold' : 'blue'}>{level}</Tag>,
            },
            { title: '实例', dataIndex: 'instanceId', key: 'instanceId' },
            { title: '日志内容', dataIndex: 'message', key: 'message' },
          ]}
        />
      </Card>
    </Space>
  );
}

function MonitorPage() {
  return (
    <Space orientation="vertical" size="large" className="page-stack">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="CPU 与 GPU 监控" className="panel-card">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f7" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#5b7cff" strokeWidth={2} />
                <Line type="monotone" dataKey="gpu" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="内存 / 网络" className="panel-card">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f7" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="memory" stroke="#fa8c16" fill="#fa8c16" fillOpacity={0.2} />
                <Area type="monotone" dataKey="network" stroke="#722ed1" fill="#722ed1" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="告警面板" className="panel-card">
        <List
          dataSource={auditEvents}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <AlertOutlined style={{ color: item.level === 'ERROR' ? '#ff4d4f' : '#faad14' }} />
                <Text strong>{item.title}</Text>
                <Text type="secondary">{item.detail}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}

function AppShell() {
  const location = useLocation();
  const selectedKey = location.pathname === '/' ? '/' : location.pathname;

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">平台首页</Link> },
    { key: '/security', icon: <SafetyOutlined />, label: <Link to="/security">安全中心</Link> },
    { key: '/pipeline/dag-editor', icon: <FileTextOutlined />, label: <Link to="/pipeline/dag-editor">DAG 流水线</Link> },
    { key: '/resource/allocation', icon: <ClusterOutlined />, label: <Link to="/resource/allocation">资源分配</Link> },
    { key: '/resource/lifecycle', icon: <SettingOutlined />, label: <Link to="/resource/lifecycle">资源生命周期</Link> },
    { key: '/log/distributed', icon: <AlertOutlined />, label: <Link to="/log/distributed">日志中心</Link> },
    { key: '/monitor/dashboard', icon: <MonitorOutlined />, label: <Link to="/monitor/dashboard">监控大盘</Link> },
  ];

  return (
    <Layout className="app-shell">
      <Sider width={220} className="sidebar">
        <div className="brand">
          <AreaChartOutlined className="brand-icon" />
          <Text strong>MLOps Studio</Text>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} className="side-menu" />
      </Sider>

      <Layout>
        <Header className="topbar">
          <div>
            <Title level={4} style={{ margin: 0 }}>AI 算力运维平台 Demo</Title>
          </div>
          <Space size="middle">
            <Badge dot color="green">
              <Text type="secondary">系统正常</Text>
            </Badge>
            <Avatar style={{ background: '#5b7cff' }}>{currentUser.avatar}</Avatar>
          </Space>
        </Header>

        <Content className="content-area">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/pipeline/dag-editor" element={<PipelinePage />} />
            <Route path="/resource/allocation" element={<ResourcePage />} />
            <Route path="/resource/lifecycle" element={<LifecyclePage />} />
            <Route path="/log/distributed" element={<LogsPage />} />
            <Route path="/monitor/dashboard" element={<MonitorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
