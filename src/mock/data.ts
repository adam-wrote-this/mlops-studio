export type Permission = {
  id: string;
  label: string;
  key: string;
  description: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  team: string;
  roleId: string;
  lastLogin: string;
  avatar: string;
};

export type ClusterNode = {
  id: string;
  name: string;
  location: string;
  gpuType: string;
  cpu: number;
  memory: number;
  gpuUsed: number;
  gpuTotal: number;
  status: 'healthy' | 'warning' | 'busy';
  taskIds: string[];
};

export type PipelineTask = {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  nodeId: string;
  ownerId: string;
  progress: number;
  cpu: number;
  gpu: number;
  startTime: string;
  pipelineNodeId: string;
};

export type Instance = {
  id: string;
  taskId: string;
  nodeId: string;
  state: '待调度' | '启动中' | '运行中' | '暂停' | '释放中' | '已销毁';
  createdAt: string;
  expiresAt: string;
  changedBy: string;
  lastEvent: string;
};

export type LogEntry = {
  id: string;
  instanceId: string;
  nodeId: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
};

export type MetricPoint = {
  time: string;
  cpu: number;
  gpu: number;
  memory: number;
  network: number;
};

export type PipelineNodeItem = {
  id: string;
  label: string;
  type: 'input' | 'train' | 'evaluate' | 'deploy' | 'output';
  status: 'queued' | 'running' | 'success' | 'warning';
  position: { x: number; y: number };
};

export const permissions: Permission[] = [
  { id: 'security:view', label: '查看安全日志', key: 'security:view', description: '阅读企业安全与审计信息' },
  { id: 'pipeline:edit', label: '编辑流水线', key: 'pipeline:edit', description: '创建、修改和保存 DAG 流水线' },
  { id: 'resource:deploy', label: '资源分配', key: 'resource:deploy', description: '为任务申请 CPU/GPU 资源' },
  { id: 'instance:restart', label: '实例操作', key: 'instance:restart', description: '启动、停止、销毁实例' },
  { id: 'log:query', label: '日志查询', key: 'log:query', description: '查看分布式日志与告警详情' },
  { id: 'monitor:view', label: '监控查看', key: 'monitor:view', description: '查看大盘和时序监控指标' },
  { id: 'read:only', label: '只读访问', key: 'read:only', description: '仅查看主页与只读页面' },
];

export const roles: Role[] = [
  {
    id: 'admin',
    name: '平台管理员',
    description: '负责全平台安全、资源和运行状态编排',
    permissions: ['security:view', 'pipeline:edit', 'resource:deploy', 'instance:restart', 'log:query', 'monitor:view'],
  },
  {
    id: 'ops',
    name: '运维工程师',
    description: '关注实例生命周期与集群稳定性',
    permissions: ['resource:deploy', 'instance:restart', 'log:query', 'monitor:view'],
  },
  {
    id: 'guest',
    name: '只读访客',
    description: '仅查看平台总览和概览信息',
    permissions: ['read:only', 'monitor:view'],
  },
];

export const currentUser: User = {
  id: 'u-1001',
  name: '李昊',
  email: 'lihao@mlops.studio',
  team: 'AI Infra',
  roleId: 'admin',
  lastLogin: '2026-08-20 08:42:16',
  avatar: 'LH',
};

export const clusterNodes: ClusterNode[] = [
  { id: 'node-a', name: 'gpu-node-a', location: '华东-1 区', gpuType: 'NVIDIA A100 80G', cpu: 96, memory: 512, gpuUsed: 28, gpuTotal: 32, status: 'healthy', taskIds: ['task-1001', 'task-1002'], },
  { id: 'node-b', name: 'gpu-node-b', location: '华东-1 区', gpuType: 'NVIDIA H100 80G', cpu: 72, memory: 384, gpuUsed: 18, gpuTotal: 24, status: 'warning', taskIds: ['task-1003'], },
  { id: 'node-c', name: 'cpu-node-c', location: '华南-2 区', gpuType: 'CPU 预留', cpu: 128, memory: 768, gpuUsed: 52, gpuTotal: 128, status: 'busy', taskIds: ['task-1004', 'task-1005'], },
];

export const tasks: PipelineTask[] = [
  { id: 'task-1001', name: '语义分割训练', status: 'running', nodeId: 'node-a', ownerId: 'u-1001', progress: 72, cpu: 32, gpu: 8, startTime: '2026-08-20 07:42:00', pipelineNodeId: 'train-1', },
  { id: 'task-1002', name: '模型评估', status: 'success', nodeId: 'node-a', ownerId: 'u-1002', progress: 100, cpu: 16, gpu: 4, startTime: '2026-08-19 20:12:00', pipelineNodeId: 'eval-1', },
  { id: 'task-1003', name: '知识库索引', status: 'queued', nodeId: 'node-b', ownerId: 'u-1003', progress: 26, cpu: 12, gpu: 2, startTime: '2026-08-20 08:10:00', pipelineNodeId: 'deploy-1', },
  { id: 'task-1004', name: '实时日志清洗', status: 'failed', nodeId: 'node-c', ownerId: 'u-1004', progress: 58, cpu: 40, gpu: 0, startTime: '2026-08-20 06:00:00', pipelineNodeId: 'input-1', },
  { id: 'task-1005', name: '推理服务部署', status: 'running', nodeId: 'node-c', ownerId: 'u-1001', progress: 89, cpu: 18, gpu: 2, startTime: '2026-08-20 08:15:00', pipelineNodeId: 'deploy-2', },
];

export const instances: Instance[] = [
  { id: 'inst-9001', taskId: 'task-1001', nodeId: 'node-a', state: '运行中', createdAt: '2026-08-20 07:42:00', expiresAt: '2026-08-21 07:42:00', changedBy: '李昊', lastEvent: 'GPU 显存触发热备切换' },
  { id: 'inst-9002', taskId: 'task-1002', nodeId: 'node-a', state: '已销毁', createdAt: '2026-08-19 20:12:00', expiresAt: '2026-08-19 23:30:00', changedBy: '周晓', lastEvent: '评估任务完成，已回收算力' },
  { id: 'inst-9003', taskId: 'task-1003', nodeId: 'node-b', state: '待调度', createdAt: '2026-08-20 08:10:00', expiresAt: '2026-08-20 10:10:00', changedBy: '任丽', lastEvent: '等待资源分配' },
  { id: 'inst-9004', taskId: 'task-1004', nodeId: 'node-c', state: '暂停', createdAt: '2026-08-20 06:00:00', expiresAt: '2026-08-20 09:00:00', changedBy: '唐安', lastEvent: '日志源异常，已提前暂停' },
  { id: 'inst-9005', taskId: 'task-1005', nodeId: 'node-c', state: '启动中', createdAt: '2026-08-20 08:15:00', expiresAt: '2026-08-20 11:15:00', changedBy: '李昊', lastEvent: '服务容器拉起中' },
];

export const logs: LogEntry[] = [
  { id: 'log-1', instanceId: 'inst-9001', nodeId: 'node-a', timestamp: '08:41:12', level: 'INFO', message: '数据预处理完成，进入训练阶段' },
  { id: 'log-2', instanceId: 'inst-9001', nodeId: 'node-a', timestamp: '08:41:55', level: 'WARN', message: 'GPU 显存使用率达到 92%，启动热备通道' },
  { id: 'log-3', instanceId: 'inst-9004', nodeId: 'node-c', timestamp: '08:27:10', level: 'ERROR', message: '日志采集器连接超时，任务已暂停' },
  { id: 'log-4', instanceId: 'inst-9005', nodeId: 'node-c', timestamp: '08:31:20', level: 'INFO', message: '推理镜像拉取成功，开始启动服务' },
  { id: 'log-5', instanceId: 'inst-9003', nodeId: 'node-b', timestamp: '08:33:42', level: 'WARN', message: '资源分配等待中，队列前置已达 2 条' },
];

export const metrics: MetricPoint[] = [
  { time: '00:00', cpu: 42, gpu: 58, memory: 61, network: 48 },
  { time: '02:00', cpu: 46, gpu: 63, memory: 66, network: 52 },
  { time: '04:00', cpu: 51, gpu: 60, memory: 69, network: 57 },
  { time: '06:00', cpu: 58, gpu: 74, memory: 73, network: 64 },
  { time: '08:00', cpu: 64, gpu: 86, memory: 80, network: 71 },
  { time: '10:00', cpu: 60, gpu: 82, memory: 77, network: 68 },
  { time: '12:00', cpu: 55, gpu: 78, memory: 74, network: 65 },
  { time: '14:00', cpu: 50, gpu: 72, memory: 70, network: 58 },
];

export const pipelineNodes: PipelineNodeItem[] = [
  { id: 'input-1', label: '数据清洗', type: 'input', status: 'success', position: { x: 50, y: 150 } },
  { id: 'train-1', label: '训练任务', type: 'train', status: 'running', position: { x: 260, y: 150 } },
  { id: 'eval-1', label: '评估验证', type: 'evaluate', status: 'success', position: { x: 470, y: 150 } },
  { id: 'deploy-1', label: '部署推理', type: 'deploy', status: 'warning', position: { x: 680, y: 80 } },
  { id: 'deploy-2', label: '生产发布', type: 'deploy', status: 'queued', position: { x: 680, y: 220 } },
  { id: 'output-1', label: '结果导出', type: 'output', status: 'queued', position: { x: 900, y: 150 } },
];

export const pipelineEdges = [
  { id: 'e1-2', source: 'input-1', target: 'train-1' },
  { id: 'e2-3', source: 'train-1', target: 'eval-1' },
  { id: 'e3-4', source: 'eval-1', target: 'deploy-1' },
  { id: 'e3-5', source: 'eval-1', target: 'deploy-2' },
  { id: 'e4-6', source: 'deploy-1', target: 'output-1' },
  { id: 'e5-6', source: 'deploy-2', target: 'output-1' },
];

export const auditEvents = [
  { id: 'audit-1', title: '创建训练任务', actor: '李昊', time: '08:40', level: 'INFO', detail: '新增“语义分割训练”任务并绑定 GPU-A 节点' },
  { id: 'audit-2', title: '修改资源配额', actor: '周晓', time: '08:13', level: 'WARN', detail: '将训练任务 GPU 配额调整为 8 卡' },
  { id: 'audit-3', title: '销毁实例', actor: '任丽', time: '07:58', level: 'ERROR', detail: '对“评估任务”实例执行回收流程，已成功释放 4 卡 GPU' },
];

export const overviewStats = [
  { label: '运行中任务', value: 18, change: '+4.2%' },
  { label: '平均 GPU 利用率', value: '82%', change: '+6.1%' },
  { label: '告警事件', value: 3, change: '-2' },
  { label: '平均首屏耗时', value: '1.4s', change: '-0.3s' },
];
