<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">{{ $route.meta.title }}</div>
        <div class="page-subtitle">该模块正在开发中，敬请期待...</div>
      </div>
    </div>
    <div class="card placeholder-card">
      <el-empty description="功能建设中" :image-size="160">
        <template #image>
          <el-icon :size="120" color="#cbd5e1"><Notebook /></el-icon>
        </template>
        <el-button type="primary" round disabled>即将上线</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.placeholder-card {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
