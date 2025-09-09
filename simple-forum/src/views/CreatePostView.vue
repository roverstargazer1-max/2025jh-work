<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';

const router = useRouter(); // 获取路由实例，用于页面跳转

// 为表单输入创建响应式变量
const title = ref('');
const content = ref('');

// 用于向用户提供反馈
const errorMessage = ref('');
const isSubmitting = ref(false);

// CreatePostView.vue

const submitPost = async () => {
  // 简单的前端校验 (这部分是正确的，无需改动)
  if (!content.value.trim()) { 
    errorMessage.value = '内容不能为空！';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  // --- 从 localStorage 中获取 user_id ---
  const userId = localStorage.getItem('user_id');

  // 增加一个保护，如果拿不到ID就不发请求
  if (!userId) {
    errorMessage.value = '无法获取用户信息，请重新登录。';
    isSubmitting.value = false;
    return;
  }

  try {
    // --- 修正后的 POST 请求 ---
    await axios.post('/api/student/post', { // <-- 修正了 URL
      // 错误二：修正了请求体参数
      content: content.value,
      user_id: parseInt(userId) // <-- 用 parseInt 确保是数字类型
    });
    
    // 发布成功后，跳转回学生主页
    router.push('/student');

  } catch (err) {
    console.error('发布帖子失败:', err);
    errorMessage.value = '发布失败，请稍后再试。';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="create-post-container">
    <div class="form-wrapper">
      <header class="form-header">
        <h1>发布新帖子</h1>
        <RouterLink to="/student" class="back-link" >返回主页 </RouterLink>
      </header>
      
      <!-- @submit.prevent 会阻止表单的默认提交行为，转而调用我们的 submitPost 方法 -->
      <form @submit.prevent="submitPost">
        <div class="form-group">
          <label for="title">标题</label>
          <input 
            id="title" 
            type="text" 
            v-model="title" 
            placeholder="拜托让我过吧🥺🥺🥺🥺🥺🥺(请输入帖子标题)"
            required
          />
        </div>

        <div class="form-group">
          <label for="content">内容</label>
          <textarea 
            id="content" 
            v-model="content" 
            rows="10"
            placeholder="拜托让我过吧🥺🥺🥺🥺🥺🥺...(请输入帖子内容)"
            required
          ></textarea>
        </div>

        <!-- 显示错误信息 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? '发布中...' : '确认发布' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-post-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  min-width: 100vh;
  box-sizing: border-box;
}

.form-wrapper {
  width: 700px;
  background-color: #fff;
  padding: 2rem;
  margin-top: 130px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-header h1 {
  font-size: 1.8rem;
  margin: 0;
}

.back-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.error-message {
  color: #d9534f;
  margin-bottom: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #a0cffc;
  cursor: not-allowed;
}
.back-link{
    color: #333;
}
</style>

