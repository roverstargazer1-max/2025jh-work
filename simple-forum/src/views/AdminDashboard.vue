<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const reports = ref([]);
const loading = ref(true);
const error = ref(null);
// --- 创建一个 ref 来存储管理员 ID，方便在多个函数中使用 ---
const adminUserId = ref(null);

// --- 封装获取列表的函数，方便重用 ---
const fetchReports = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/admin/report', {
      params: { user_id: adminUserId.value }
    });
    if (response.data && response.data.data && Array.isArray(response.data.data.report_list)) {
      reports.value = response.data.data.report_list;
    } else {
      console.error('后端返回的举报列表数据格式不正确:', response.data);
      error.value = '加载举报列表失败，数据格式错误。';
    }
  } catch (err) {
    console.error('获取举报列表失败:', err);
    error.value = '加载举报列表失败，请检查网络或稍后再试。';
  } finally {
    loading.value = false;
  }
};

// --- 创建处理审批的函数 ---
const handleApproval = async (reportId, approvalStatus) => {
  try {
    // 根据 Apifox 文档，发送 POST 请求
    await axios.post('/api/admin/report', {
      user_id: parseInt(adminUserId.value),
      report_id: reportId,
      approval: approvalStatus // 1 代表通过, 2 代表驳回
    });

    // 审批成功后，立即从前端列表中移除这张卡片，实现即时反馈
    reports.value = reports.value.filter(report => report.report_id !== reportId);

    // 给管理员一个操作成功的提示
    alert(`举报 #${reportId} 已处理完毕。`);

  } catch (err) {
    console.error('审批操作失败:', err);
    alert('操作失败，请稍后再试。');
  }
};

onMounted(() => {
  // 从 localStorage 获取管理员 ID
  adminUserId.value = localStorage.getItem('user_id');

  if (!adminUserId.value) {
    error.value = '无法获取管理员信息，请重新登录。';
    loading.value = false;
    return;
  }
  // 初次加载时获取列表
  fetchReports();
});
</script>

<template>
  <div class="admin-dashboard-container">
    <header class="dashboard-header">
      <h1>管理员后台 - 举报审批</h1>
    </header>

    <div v-if="loading" class="state-info">
      <p>正在加载待审批列表...</p>
    </div>

    <div v-else-if="error" class="state-info error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="reports.length > 0" class="reports-list">
      <div v-for="report in reports" :key="report.report_id" class="report-card">
        <div class="report-section">
          <h3 class="section-title">被举报内容 (帖子 ID: {{ report.post_id }})</h3>
          <p class="report-content">{{ report.content }}</p>
        </div>
        <div class="report-section">
          <h3 class="section-title">举报人</h3>
          <p class="reporter-info">{{ report.username }}</p>
        </div>
        <div class="report-section">
          <h3 class="section-title">举报原因</h3>
          <p class="report-reason">{{ report.reason }}</p>
        </div>
        
        <!-- --- 为按钮绑定点击事件 --- -->
        <div class="approval-actions">
          <!-- 点击“通过”按钮，调用 handleApproval 函数，并传递状态码 1 -->
          <button @click="handleApproval(report.report_id, 1)" class="action-btn approve-btn">通过 (删帖)</button>
          <!-- 点击“驳回”按钮，调用 handleApproval 函数，并传递状态码 2 -->
          <button @click="handleApproval(report.report_id, 2)" class="action-btn reject-btn">驳回</button>
        </div>
      </div>
    </div>
    
    <div v-else class="state-info">
      <p>太棒了！当前没有待审批的举报。</p>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-container {
  display: flex;
  flex-direction: column; 
  width: 960px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f6f8;
  max-height: 90vh;
}

.dashboard-header {
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto; /* 当内容超出时，显示垂直滚动条 */
  flex-grow: 1; /* 让列表区域占据所有剩余的可用空间 */
  padding-right: 1rem; /* 给滚动条留出一点空间，防止遮挡内容 */
}

.report-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.report-section {
  margin-bottom: 1.2rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.report-content, .report-reason {
  background-color: #f9f9f9;
  border-left: 3px solid #3498db;
  padding: 1rem;
  border-radius: 4px;
  color: #34495e;
  
}

.reporter-info {
  font-weight: bold;
  color: #2980b9;
}

.approval-actions {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.action-btn {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-btn {
  background-color: #2ecc71;
  color: white;
}

.approve-btn:hover {
  background-color: #27ae60;
}

.reject-btn {
  background-color: #e74c3c;
  color: white;
}

.reject-btn:hover {
  background-color: #c0392b;
}

.state-info {
  text-align: center;
  margin-top: 5rem;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #666;
}

.state-info.error {
  color: #e74c3c;
  font-weight: bold;
}
</style>