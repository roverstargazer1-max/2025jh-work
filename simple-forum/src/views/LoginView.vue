<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// 定义响应式数据
const username = ref('');
const password = ref('');
const error = ref(null);
// 获取 router 实例
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '账号和密码不能为空！';
    return;
  }
  error.value = null;

  try {
    const response = await axios.post('/api/user/login', {
      username: username.value,
      password: password.value,
    });

    console.log('登录成功，后端返回:', response.data);

    if (response.data && response.data.code === 200 && response.data.data) {
      const userType = response.data.data.user_type;
      const userId = response.data.data.user_id;

      // 将用户信息保存到 localStorage ---
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_type', userType);
      // - 判断 user_type 的值是 1 (学生) 还是 2 (管理员)

      if (userType === 2) { 
        router.push('/admin');
      } else if (userType === 1) { 
        router.push('/student');
      } else {
        error.value = '未知的用户类型';
      }
    } else {
      error.value = response.data.msg || '登录失败，请检查账号密码。';
    }
  } catch (err) {
    // 处理网络错误或服务器崩溃等异常情况
    console.error('登录请求失败:', err);
    if (err.response && err.response.data && err.response.data.msg) {
        // 服务器返回了非 2xx 的状态码
        error.value = err.response.data.msg;
    } else {
        error.value = '登录失败，网络或服务器错误。';
    }
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">论坛系统登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">账号 (学号)</label>
          <input type="text" id="username" v-model="username" placeholder="输入你的学号" />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" placeholder="输入你的密码" />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="login-btn">登 录</button>
      </form>
    </div>
  </div>
</template>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f0f2f5;
}

.login-box {
  width: 600px;
  padding: 2.5rem;
  background: white;  
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box; /* 确保 padding 不会影响宽度 */
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  font-weight: 600;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #0056b3;
}
</style>