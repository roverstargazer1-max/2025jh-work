<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, onBeforeRouteUpdate } from 'vue-router';
import axios from 'axios';
// 引入 splitpanes 的组件和它的 CSS 样式文件
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const posts = ref([]);
// --- 新增一个 ref 来存储举报记录 ---
const reports = ref([]);

const loading = ref(true);
const error = ref(null);
// ---获取并存储当前登录的 user_id ---
const currentUserId = ref(null);      
//  将数据获取逻辑封装成一个独立的函数
const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/student/post');
    if (response.data && response.data.data && Array.isArray(response.data.data.post_list)) {
      const fetchedPosts = response.data.data.post_list;
      fetchedPosts.sort((a, b) => new Date(b.time) - new Date(a.time));
      posts.value = fetchedPosts;
    } else {
      console.error('后端返回的数据格式不正确:', response.data);
      error.value = '无法加载帖子列表，数据格式错误。';
    }
  } catch (err) {
    console.error('获取帖子失败:', err);
    error.value = '无法加载帖子列表，请检查网络或稍后再试。';
  } finally {
    loading.value = false;
  }
};
// ---  新增一个函数来获取举报审批结果 ---
const fetchReportStatus = async () => {
  try {
    // ，发送 GET 请求并携带 user_id
    const response = await axios.get('/api/student/report-post', {
      params: {
        user_id: currentUserId.value
      }
    });
    // 检查返回的数据结构是否正确
    if (response.data && response.data.data && Array.isArray(response.data.data.report_list)) {
      reports.value = response.data.data.report_list; // 将获取到的列表赋值给 reports
    }
  } catch (err) {
    console.error('获取举报状态失败:', err);
    // 这里可以单独处理错误，或者合并到主错误状态中
  }
};

// ---创建删除帖子的函数 ---
const deletePost = async (postId) => {
  // 弹出确认框，防止误删
  if (!window.confirm('你确定要删除这篇帖子吗？')) {
    return;
  }
  try {
    // 发送 DELETE 请求
    // 请求地址是 /api/student/post
    // 参数是 user_id 和 post_id，通过 params 发送
    await axios.delete('/api/student/post', {
      params: {
        user_id: currentUserId.value,
        post_id: postId
      }
    });
    // 删除成功后，直接从前端的 posts 数组中移除该帖子
    // 这样可以避免重新请求整个列表，体验更好
    posts.value = posts.value.filter(post => post.id !== postId);
  } catch (err) {
    console.error('删除帖子失败:', err);
    // 给用户一个友好的错误提示
    alert('删除失败，你可能没有权限或网络出错了。');
  }
};



// --- 创建举报帖子的函数 ---
const reportPost = async (postId) => {
  // 使用 prompt 弹窗让用户输入举报原因
  const reason = window.prompt('请输入你的举报原因：');
  // 如果用户取消或者没有输入任何内容，则中止操作
  if (!reason) {
    return;
  }
  try {
    // 根据 Apifox 文档，发送 POST 请求
    await axios.post('/api/student/report-post', {
      user_id: parseInt(currentUserId.value),// 确保 user_id 是数字类型
      post_id: postId,
      reason: reason
    });
    // 举报成功后给用户一个友好的提示
    alert('举报成功，我们将会尽快处理！');
  } catch (err) {
    console.error('举报帖子失败:', err);
    alert('举报失败，请稍后再试。');
  }
};
// 修改帖子
const editPost = async (post) => {
  const newContent = window.prompt('请修改你的帖子内容：', post.content);
  if (newContent === null || newContent === post.content) {
    return;
  }
  try {
    await axios.put('/api/student/post', {
      user_id: parseInt(currentUserId.value),
      post_id: post.id,
      content: newContent
    });
    const postIndex = posts.value.findIndex(p => p.id === post.id);
    if (postIndex !== -1) {
      posts.value[postIndex].content = newContent;
    }
  } catch (err) {
    console.error('修改帖子失败:', err);
    alert('修改失败，请稍后再试。');
  }
};

onMounted(() => {
  // 组件加载时，从 localStorage 读取 user_id
  currentUserId.value = localStorage.getItem('user_id');
  fetchPosts();
  fetchReportStatus();
  // 组件加载时，也调用获取举报状态的函数
});

onBeforeRouteUpdate((to, from) => {
  // 确保我们是从别的页面回到了学生主页
  if (to.path === '/student') {
    fetchPosts();
    fetchReportStatus();
  }
});

const formatTime = (timeString) => {
  if (!timeString) return '未知时间';
  return new Date(timeString).toLocaleString('zh-CN', { hour12: false });
};
// --- 新增一个函数，用于格式化举报状态码 ---
const formatStatus = (status) => {
  // 0代表未审批，1代表通过，2代表不通过
  switch (status) {
    case 0: return { text: '待审批', class: 'status-pending' };
    case 1: return { text: '已通过 (内容违规)', class: 'status-approved' };
    case 2: return { text: '已驳回 (内容合规)', class: 'status-rejected' };
    default: return { text: '未知状态', class: '' };
  }
};
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>学生主页</h1>
      <RouterLink to="/student/create-post" class="create-post-btn">
        发布新帖子
      </RouterLink>
    </header>

    <splitpanes horizontal class="default-theme" style="flex-grow: 1; height: auto;">

      <pane min-size="20">
        <div class="pane-content">
          <!-- 学生主页 -->
          <div v-if="loading" class="state-info">正在加载帖子...</div>
          <div v-else-if="error" class="state-info error">{{ error }}</div>
          <div v-else-if="posts.length > 0" class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="card-actions">
                <button v-if="post.user_id == currentUserId" @click="editPost(post)" class="edit-btn">
                  编辑
                </button>
                <button v-if="post.user_id == currentUserId" @click="deletePost(post.id)" class="delete-btn">
                  &times;
                </button>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-footer">
                <span class="post-time">发布于: {{ formatTime(post.time) }}</span>
                <div class="post-actions">
                  <span class="post-likes">❤️ {{ post.likes }} 赞</span>
                  <button @click="reportPost(post.id)" class="report-btn">举报</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="state-info">还没有任何帖子，快去发布第一篇吧！</div>
        </div>
      </pane>

      <pane min-size="15" size="35">
        <div class="pane-content">
          <!-- 举报记录 -->
          <div class="section-divider">
            <h2>我的举报记录</h2>
          </div>
          <div v-if="reports.length > 0" class="reports-history-list">
            <div v-for="report in reports" :key="report.post_id" class="report-status-card">
              <div class="report-info">
                <p><strong>被举报内容：</strong>"{{ report.content }}"</p>
                <p><strong>我的举报原因：</strong>"{{ report.reason }}"</p>
              </div>
              <div class="report-status" :class="formatStatus(report.status).class">
                {{ formatStatus(report.status).text }}
              </div>
            </div>
          </div>
          <div v-else class="state-info secondary">
            <p>您还没有提交过举报。</p>
          </div>
        </div>
      </pane>

    </splitpanes>
  </div>
</template>



<style scoped>
.dashboard-container {
  width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f9f9f9;
  /* 增加一个最大高度，防止页面在小屏幕上被撑开 */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
  /* 防止 header 在 flex 布局中被压缩 */
  flex-shrink: 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  overflow-y: auto; /* 当内容超出时，显示垂直滚动条 */
  flex-grow: 1; /* 让列表区域占据所有剩余的可用空间 */
  padding-right: 1rem; /* 给滚动条留出一点空间，防止遮挡内容 */
}

.post-card {
  position: relative;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  /* 防止卡片在 flex 布局中被压缩 */
  flex-shrink: 0;
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 0.5rem;
}

.delete-btn, .edit-btn {
  background: #f1f1f1;
  border: none;
  border-radius: 5px;
  height: 28px;
  font-size: 14px;
  font-weight: bold;
  color: #888;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  transition: all 0.2s ease;
}

.delete-btn {
  width: 28px;
  font-size: 20px;
  border-radius: 50%;
}

.edit-btn {
  padding: 0 10px;
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
  transform: scale(1.1);
}

.edit-btn:hover {
  background: #007bff;
  color: white;
  transform: scale(1.1);
}

.post-content {
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  padding-top: 1.5rem; 
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.1rem * 1.6 * 3);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #888;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.report-btn {
  background: none;
  border: 1px solid #ddd;
  color: #888;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-btn:hover {
  background-color: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

.state-info {
  text-align: center;
  margin: auto; 
  font-size: 1.2rem;
  color: #666;
}

.state-info.secondary {
    margin: 2rem 0;
    font-size: 1rem;
}

.state-info.error {
  color: #e74c3c;
  font-weight: bold;
}

.create-post-btn{
    color:#333;
    font-weight: bold;
}

.section-divider {
  margin-top: 1.5rem;
  /* padding-top: 1.5rem; */
  border-top: 1px solid #e0e0e0;
}

.section-divider h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.reports-history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 300px; /* 给一个最大高度，防止列表过长 */
  padding-right: 1rem;
}

.report-status-card {
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-info p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.9rem;
}

.report-info p strong {
  color: #333;
}

.report-status {
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-approved {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-rejected {
  background-color: #fff1f0;
  color: #f5222d;
  }
/* 覆盖 splitpanes 的默认 flex-grow，让我们的主容器来控制 */
.dashboard-container {
  /* ... 您已有的样式 ... */
  height: 90vh; /* 确保容器有一个明确的高度 */
}

/* 让 splitpanes 填满剩余空间 */
.splitpanes {
  flex-grow: 1;
  max-height: 600px;
  /* 移除 dashboard-container 的 overflow-y，让内部面板自己滚动 */
}

/* 定义面板内部的布局和滚动行为 */
.pane-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出面板 */
}

/* 让帖子列表和举报记录列表在各自的面板内滚动 */
.posts-list, .reports-history-list {
  flex-grow: 1; /* 占据所有可用空间 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}

/* 为 splitpanes 的分割条增加一个更明显的样式 */
.splitpanes__splitter {
  background-color: #e0e0e0;
  position: relative;
}

.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.2);
}

/* 移除原先在全局列表上的 flex-grow，因为它现在由 pane-content 控制 */
/* .posts-list {
  flex-grow: 1;  <-- 如果您之前有这行，现在它应该在 .pane-content 的子元素上
} */
</style>